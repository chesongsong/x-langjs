import React from "react";

interface ButtonViewProps {
  text: string;
  type?: string;
  size?: string;
  onClick?: string;
}

export function ButtonView({ text, type = "primary", onClick }: ButtonViewProps) {
  const styleMap: Record<string, React.CSSProperties> = {
    primary: { background: "#1677ff", color: "#fff", border: "none" },
    default: { background: "#fff", color: "#000", border: "1px solid #d9d9d9" },
    danger:  { background: "#ff4d4f", color: "#fff", border: "none" },
  };

  const style: React.CSSProperties = {
    padding: "4px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    ...(styleMap[type] ?? styleMap.primary),
  };

  function handleClick() {
    if (onClick) alert(onClick);
  }

  return (
    <div style={{ padding: "4px 0" }}>
      <button style={style} onClick={handleClick}>{text}</button>
    </div>
  );
}
