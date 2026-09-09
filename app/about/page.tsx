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

      <div className="mt-16 flex flex-col items-center text-center">
        <p className="font-display max-w-md text-xl leading-loose font-semibold tracking-tight sm:text-2xl">
          充满好奇心，却越来越困惑，
          <br />
          心里住着的还是那个年轻人。
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/about-curiosity.png"
          alt="一个孩子仰望头顶漂浮的问号、星星、纸飞机、小鸟、书本和灯泡"
          className="mt-12 w-full max-w-sm"
        />
      </div>
    </div>
  );
}
