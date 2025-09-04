export function Alert({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800 border border-red-200",
  };
  return (
    <div className={`rounded p-3 flex items-center gap-2 ${variants[variant] || variants.default} ${className}`}>
      {children}
    </div>
  );
}
export function AlertDescription({ children }) {
  return <span>{children}</span>;
}