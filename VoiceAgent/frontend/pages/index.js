import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Upload, FileAudio, AlertTriangle, Sun, Moon } from "lucide-react";
import axios from "axios";

// Theme toggle
function ThemeToggle({ theme, setTheme }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-6 right-6"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAudioURL("");
    setResults(null);
    setError("");
  };

  // Audio recording
  const startRecording = async () => {
    setError("");
    setResults(null);
    setAudioURL("");
    setFile(null);
    setRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setFile(new File([blob], "recording.wav", { type: "audio/wav" }));
        setAudioURL(URL.createObjectURL(blob));
        setRecording(false);
      };
      mediaRecorderRef.current.start();
    } catch {
      setError("Microphone access denied.");
      setRecording(false);
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  // Upload & process audio
  const handleProcess = async () => {
    if (!file) return setError("⚠️ Please record or select an audio file first!");

    setProgress("Uploading & transcribing...");
    setResults(null);
    setError("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await axios.post("http://localhost:5000/api/audio/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(`Uploading: ${Math.round((evt.loaded / evt.total) * 100)}%`);
        },
      });
      setProgress("Processing...");
      setTimeout(() => {
        setProgress("");
        setResults(res.data);
      }, 1000);
    } catch (err) {
      setProgress("");
      setError("❌ Upload failed: " + err.message);
    }
  };

  const getIntentVariant = (intent) => {
    switch (intent?.toLowerCase()) {
      case "support":
        return "default";
      case "sales":
        return "secondary";
      case "task management":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative font-sans ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900"
      }`}
      style={{ fontFamily: "'Inter', 'Roboto', 'Open Sans', Arial, sans-serif" }}
    >
      <ThemeToggle theme={theme} setTheme={setTheme} />

      <div className="container mx-auto max-w-6xl py-12">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-8 py-4 mb-5 shadow-lg ${
              theme === "dark" ? "bg-blue-700 text-white" : "bg-blue-600 text-white"
            }`}
          >
            <Mic className="h-7 w-7" />
            <span className="text-2xl font-black tracking-wider"> Voice Agent</span>
          </div>
          <h1 className="mb-3 text-5xl font-extrabold tracking-wider leading-tight">
            Transform Audio into Actionable Insights
          </h1>
          <p className="text-xl text-muted-foreground font-medium tracking-wide">
            Record or upload audio to get transcriptions, summaries, and action items powered by AI
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Audio Input */}
          <Card className={`shadow-2xl rounded-3xl ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl font-bold tracking-wide">
                <FileAudio className="h-7 w-7" /> Audio Input
              </CardTitle>
              <CardDescription className="text-lg font-medium tracking-wide">Record live audio or upload an existing file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Record Audio */}
              <div className="space-y-5">
                <div className="flex flex-col items-center justify-center gap-5">
                  <Button
                    onClick={recording ? stopRecording : startRecording}
                    variant={recording ? "destructive" : "default"}
                    size="lg"
                    className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center text-4xl ${
                      recording ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={progress}
                  >
                    {recording ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
                  </Button>
                  <p className="text-lg text-muted-foreground text-center font-medium">
                    {recording ? "Click to stop recording" : "Click to start recording"}
                  </p>
                </div>
                {audioURL && (
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Preview Recording</Label>
                    <audio controls src={audioURL} className="w-full" />
                  </div>
                )}
              </div>

              <Separator />

              {/* Upload Audio */}
              <div className="space-y-5">
                <Label className="text-xl font-bold tracking-wide">Upload Audio File</Label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center shadow ${
                    theme === "dark" ? "border-blue-700 bg-gray-800" : "border-blue-300 bg-blue-50"
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-5 text-blue-500" />
                  <Label
                    htmlFor="file-upload"
                    className="block font-bold z-20 cursor-pointer text-xl hover:underline"
                  >
                    Choose audio file
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a,audio/ogg"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={progress}
                  />
                  <p className="text-lg text-muted-foreground font-medium">Supports MP3, WAV, M4A, OGG files</p>
                  {file && !audioURL && (
                    <div
                      className={`flex items-center gap-2 p-4 rounded-lg mt-5 ${
                        theme === "dark" ? "bg-gray-800" : "bg-blue-100"
                      }`}
                    >
                      <FileAudio className="h-6 w-6" />
                      <span className="text-lg font-medium">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Process Button */}
              <Button
                onClick={handleProcess}
                className={`w-full text-xl font-extrabold py-5 rounded-2xl shadow ${
                  theme === "dark" ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
                }`}
                size="lg"
                disabled={!file || progress || recording}
              >
                {progress ? "Processing..." : "Transcribe & Analyze"}
              </Button>

              {progress && (
                <div
                  className={`p-5 rounded-2xl mt-2 shadow ${
                    theme === "dark" ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <p className="text-lg font-medium">{progress}</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="rounded-2xl mt-2">
                  <AlertTriangle className="h-6 w-6" />
                  <AlertDescription className="text-lg font-medium">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className={`shadow-2xl rounded-3xl ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white"}`}>
            <CardHeader>
              <CardTitle className="text-3xl font-extrabold tracking-wide">Results</CardTitle>
              <CardDescription className="text-lg font-medium tracking-wide">AI-powered transcription and insights from your audio</CardDescription>
            </CardHeader>
            <CardContent>
              {!results ? (
                <div className="text-center py-20 text-muted-foreground">
                  <FileAudio className="h-16 w-16 mx-auto mb-5 opacity-50" />
                  <p className="text-xl font-medium">Process an audio file to see results here</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Speaker-separated transcript */}
                  {results.speaker_segments && results.speaker_segments.length > 0 ? (
                    <div>
                      <h3 className="font-bold mt-4 mb-2 text-xl">Speakers</h3>
                      {audioURL && (
                        <audio ref={audioRef} controls src={audioURL} className="mb-4 w-full" />
                      )}
                      <div>
                        {results.speaker_segments.map((seg, i) => {
                          const prevSpeaker = i > 0 ? results.speaker_segments[i - 1].speaker : null;
                          const isNewSpeaker = seg.speaker !== prevSpeaker;
                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-3 py-2 rounded-lg transition ${
                                isNewSpeaker ? "mt-6" : ""
                              }`}
                            >
                              <span className={`font-semibold min-w-[110px] ${
                                seg.speaker === "Speaker 1" ? "text-blue-400" : "text-green-400"
                              }`}>
                                {seg.speaker}:
                              </span>
                              <span
                                className="cursor-pointer text-blue-100 hover:text-yellow-300"
                                onClick={() => {
                                  if (audioRef.current) {
                                    audioRef.current.currentTime = seg.start;
                                    audioRef.current.play();
                                  }
                                }}
                                title={`Jump to ${seg.start}s`}
                              >
                                {seg.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    results.transcript && (
                      <div>
                        <h3 className="font-bold mb-2 text-xl">Transcript</h3>
                        <p className="whitespace-pre-wrap text-lg">{results.transcript}</p>
                      </div>
                    )
                  )}

                  <Separator />

                  {/* Summary */}
                  {results.summary && (
                    <div className="space-y-3 my-6">
                      <h3 className="font-bold text-xl mb-2">Summary</h3>
                      {results.summary.meeting_date && (
                        <p className="mb-2">
                          <strong>Meeting Date:</strong> {results.summary.meeting_date}
                        </p>
                      )}
                      {/* If updates are array of strings */}
                      {Array.isArray(results.summary.updates) && typeof results.summary.updates[0] === "string" && (
                        <ul className="list-disc list-inside space-y-1">
                          {results.summary.updates.map((update, i) => (
                            <li key={i} className="text-lg">{update}</li>
                          ))}
                        </ul>
                      )}
                      {/* If updates are array of objects with speaker/update */}
                      {Array.isArray(results.summary.updates) && typeof results.summary.updates[0] === "object" && (
                        <ul className="list-disc list-inside space-y-1">
                          {results.summary.updates.map((update, i) => (
                            <li key={i} className="text-lg">
                              <strong>{update.speaker}:</strong> {update.update}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Action items */}
                  {results.action_items && results.action_items.length > 0 && (
                    <div>
                      <h3 className="font-bold mt-4 mb-2 text-xl">Action Items</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {results.action_items.map((item, i) => (
                          <li key={i} className="text-lg">
                            {item.task} — <em className="text-blue-500">{item.owner}</em>{" "}
                            {item.due_date && <span className="text-gray-400">(Due: {item.due_date})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  {/* Intent */}
                  <div className="space-y-3">
                    <Label className="text-xl font-bold tracking-wide">Intent Classification</Label>
                    <Badge variant={getIntentVariant(results.intent)} className="text-lg px-4 py-3 rounded-2xl font-bold">
                      {results.intent || "Unknown"}
                    </Badge>
                  </div>

                  {/* Entities */}
                  {results?.entities && (
                    <div
                      className={`my-8 p-7 border rounded-3xl shadow ${
                        theme === "dark" ? "bg-gray-800 border-blue-700" : "bg-gray-50 border-blue-200"
                      }`}
                    >
                      <h2 className="text-2xl font-extrabold mb-4 tracking-wide"></h2>

                      <div className="mb-4">
                        <h3 className="font-bold text-lg tracking-wide">Names:</h3>
                        <div className="flex flex-wrap gap-4">
                          {results.entities.names?.length > 0 ? (
                            results.entities.names.map((name, idx) => (
                              <span key={idx} className="px-4 py-2 bg-blue-500 text-white rounded-full font-semibold shadow">{name}</span>
                            ))
                          ) : (
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold shadow">No names found</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-lg tracking-wide">Dates:</h3>
                        <div className="flex flex-wrap gap-4">
                          {results.entities.dates?.length > 0 ? (
                            results.entities.dates.map((date, idx) => (
                              <span key={idx} className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold shadow">{date}</span>
                            ))
                          ) : (
                            <span className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold shadow">No dates found</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-bold text-lg tracking-wide">Phone Numbers:</h3>
                        <div className="flex flex-wrap gap-4">
                          {results.entities.phone_numbers?.length > 0 ? (
                            results.entities.phone_numbers.map((phone, idx) => (
                              <span key={idx} className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-full font-semibold shadow">{phone}</span>
                            ))
                          ) : (
                            <span className="px-4 py-2 bg-yellow-600 text-white rounded-full font-semibold shadow">No phone numbers found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
