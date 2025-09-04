export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl shadow-lg bg-white dark:bg-gray-800 border p-0 ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = "" }) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = "" }) {
  return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>;
}
export function CardDescription({ children, className = "" }) {
  return <p className={`text-gray-500 dark:text-gray-300 text-sm ${className}`}>{children}</p>;
}
export function CardContent({ children, className = "" }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}