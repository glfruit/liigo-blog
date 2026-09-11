import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 liigo 和这个博客。",
};

export default function AboutPage() {
  return (
    <div className="py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
        ( 关于 / About )
      </p>

      <div className="mt-16">
        <p className="font-display text-center text-xl font-semibold tracking-tight whitespace-nowrap sm:text-2xl">
          充满好奇心，却越来越困惑，心里住着的还是那个年轻人。
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/about-tianwen.webp"
          alt="天问：一个人站在山崖上，仰望银河与满天星斗，向苍穹发问"
          className="hairline mt-10 w-full"
        />
      </div>
    </div>
  );
}
