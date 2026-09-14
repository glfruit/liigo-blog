import type { ReactNode } from "react";

/**
 * Obsidian callout 组件（墨纸风格）
 * type 决定左侧 3px 边框灰阶；无图标（单色原则）
 */
const TYPE_BORDER: Record<string, string> = {
  note: "#525252",
  info: "#0a0a0a",
  tip: "#171717",
  warning: "#737373",
  danger: "#000000",
};

interface CalloutProps {
  type?: string;
  title?: string;
  children: ReactNode;
}

export default function Callout({ type = "note", title, children }: CalloutProps) {
  const borderColor = TYPE_BORDER[type] ?? TYPE_BORDER.note;
  return (
    <div
      style={{ borderLeftColor: borderColor }}
      className="my-6 border-y border-r border-line border-l-[3px] bg-[#f5f5f5] px-5 py-4"
    >
      {title && (
        <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
          ( {title} )
        </p>
      )}
      <div className="text-[0.95rem] leading-relaxed [&_p]:my-1.5">{children}</div>
    </div>
  );
}
