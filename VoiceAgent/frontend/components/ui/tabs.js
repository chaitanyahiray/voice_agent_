import { useState } from "react";

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);

  const tabsList = [];
  const tabsContent = [];
  children.forEach(child => {
    if (child.type.displayName === "TabsList") tabsList.push(child);
    if (child.type.displayName === "TabsContent") tabsContent.push(child);
  });
  return (
    <div className={className}>
      {tabsList.map(list =>
        React.cloneElement(list, { value, setValue })
      )}
      {tabsContent.map(content =>
        value === content.props.value ? content : null
      )}
    </div>
  );
}

export function TabsList({ children, value, setValue, className = "" }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {children.map(child =>
        React.cloneElement(child, { active: value === child.props.value, setValue })
      )}
    </div>
  );
}
TabsList.displayName = "TabsList";

export function TabsTrigger({ children, value, active, setValue, className = "" }) {
  return (
    <button
      className={`px-3 py-2 rounded font-medium transition-colors ${
        active
          ? "bg-purple-600 text-white"
          : "bg-transparent text-purple-600 hover:bg-purple-100"
      } ${className}`}
      onClick={() => setValue(value)}
      type="button"
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({ children, value, className = "" }) {
  return <div className={className}>{children}</div>;
}
TabsContent.displayName = "TabsContent";