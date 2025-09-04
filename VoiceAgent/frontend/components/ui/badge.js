export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-purple-600 text-white",
    secondary: "bg-blue-100 text-blue-700",
    outline: "border border-purple-600 text-purple-600 bg-transparent",
  };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}