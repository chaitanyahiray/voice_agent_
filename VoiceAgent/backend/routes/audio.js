const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");
const ffmpeg = require("fluent-ffmpeg");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp3";
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

const useMock = process.env.USE_MOCK === "true";
let openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Split audio into chunks
function splitAudio(inputPath, outputDir, chunkLengthSec = 60) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(path.join(outputDir, "chunk_%03d.mp3"))
      .audioCodec("copy")
      .format("segment")
      .addOption("-f", "segment")
      .addOption("-segment_time", chunkLengthSec)
      .on("end", () => resolve(true))
      .on("error", (err) => reject(err))
      .run();
  });
}

// Transcribe one chunk
async function transcribeChunk(filePath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    response_format: "verbose_json",
  });
  return transcription;
}

// Handle large files with chunking
async function transcribeLargeFile(filePath) {
  const outputDir = path.join(__dirname, "../uploads/chunks_" + Date.now());
  fs.mkdirSync(outputDir, { recursive: true });

  await splitAudio(filePath, outputDir);
  const files = fs.readdirSync(outputDir).sort();

  let allSegments = [];
  let transcriptText = "";

  for (const file of files) {
    const chunkPath = path.join(outputDir, file);
    const transcription = await transcribeChunk(chunkPath);
    transcriptText += transcription.text + " ";
    allSegments = allSegments.concat(transcription.segments || []);
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  return { transcriptText: transcriptText.trim(), segments: allSegments };
}

// Routes
router.get("/", (req, res) => res.json({ message: "Audio route works!" }));

router.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({
    message: "Audio uploaded successfully",
    fileName: req.file.originalname,
    savedAs: req.file.path,
  });
});

router.post("/process", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    if (useMock || !openai) {
      return res.json({
        transcript: "Hi team, this is our weekly standup meeting...",
        segments: [
          { id: 0, start: 0.0, end: 1.5, text: "Hi team," },
          { id: 1, start: 1.5, end: 3.0, text: "this is our weekly standup meeting" },
        ],
        speaker_segments: [
          { speaker: "Speaker 1", start: 0.0, end: 1.5, text: "Hi team," },
          { speaker: "Speaker 2", start: 1.5, end: 3.0, text: "this is our weekly standup meeting" },
        ],
        summary: ["Weekly standup meeting held with team updates"],
        action_items: [{ task: "Finish integration", owner: "John", due_date: "Friday" }],
        entities: {
          names: ["Sarah", "John"],
          dates: ["Friday"],
          phone_numbers: ["+1-202-555-0183"],
        },
        intent: "Task Management",
      });
    }

    // Transcription
    let transcriptText, segments = [];
    const stats = fs.statSync(req.file.path);

    if (stats.size > 20 * 1024 * 1024) {
      const result = await transcribeLargeFile(req.file.path);
      transcriptText = result.transcriptText;
      segments = result.segments;
    } else {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1",
        response_format: "verbose_json",
      });
      transcriptText = transcription.text;
      segments = transcription.segments || [];
    }

    // Speaker separation
    let speaker_segments = [];
    try {
      const diarizationResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a diarization helper. Given transcript segments with timestamps, assign each to Speaker 1 or Speaker 2. Return JSON array only.",
          },
          { role: "user", content: JSON.stringify(segments) },
        ],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(diarizationResponse.choices[0].message.content);
      speaker_segments = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      speaker_segments = segments.map((s, i) => ({
        ...s,
        speaker: i % 2 === 0 ? "Speaker 1" : "Speaker 2",
      }));
    }

    // Insights
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an assistant that extracts structured insights from transcripts." },
        { role: "user", content: `Transcript: ${transcriptText}. Return JSON with summary, action_items, and intent.` },
      ],
      response_format: { type: "json_object" },
    });

    let insights = {};
    try {
      insights = JSON.parse(gptResponse.choices[0].message.content);
    } catch (e) {
      insights = {};
    }

    const summary = Array.isArray(insights.summary) ? insights.summary : insights.summary ? [insights.summary] : [];
    const action_items = Array.isArray(insights.action_items) ? insights.action_items : [];

    // Entities
    let entities = { names: [], dates: [], phone_numbers: [] };
    try {
      const entityResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Extract entities. Return only JSON in this format:
            {"names": [], "dates": [], "phone_numbers": []}`,
          },
          { role: "user", content: `Transcript: ${transcriptText}` },
        ],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(entityResponse.choices[0].message.content);
      entities.names = Array.isArray(parsed.names) ? parsed.names : [];
      entities.dates = Array.isArray(parsed.dates) ? parsed.dates : [];
      entities.phone_numbers = Array.isArray(parsed.phone_numbers) ? parsed.phone_numbers : [];
    } catch (e) {
      entities = {
        names: ["No names found"],
        dates: ["No dates found"],
        phone_numbers: ["No phone numbers found"],
      };
    }

    // Response
    res.json({
      transcript: transcriptText,
      segments,
      speaker_segments,
      summary,
      action_items,
      entities,
      intent: insights.intent || "Unknown",
    });

    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });
  } catch (err) {
    res.status(500).json({ error: "Processing failed" });
  }
});

module.exports = router;
