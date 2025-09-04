export function Button({ children, variant = "default", size = "md", className = "", ...props }) {
  const base =
    "rounded font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500";
  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-purple-100 text-purple-700",
    secondary: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    outline: "border border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50",
  };
  const sizes = {
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };
  return (
    <button
      {...props}
      className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </button>
  );
}