export function Progress({ value = 0, className = "" }) {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
        style={{ width: `${value}%`, height: "100%" }}
      />
    </div>
  );
}