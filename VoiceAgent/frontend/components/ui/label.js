export function Label({ children, htmlFor, className = "" }) {
  return (
    <label htmlFor={htmlFor} className={`block font-medium text-gray-700 dark:text-gray-200 mb-1 ${className}`}>
      {children}
    </label>
  );
}