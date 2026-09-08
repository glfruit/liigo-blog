import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://liigo.dev"),
  title: {
    default: "liigo — AI 工具、教程与建站笔记",
    template: "%s — liigo",
  },
  description:
    "liigo 的个人博客：AI 工具评测、深度教程，以及这个博客本身的技术实现记录。",
  openGraph: {
    siteName: "liigo",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/icons/logo.svg",
    apple: "/icons/icon-180.png",
  },
  verification: {
    google: "j84h8reQybXDH2OW8PCChx6NvFpIwc8wugnBz-EyFaw",
  },
};

function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="translate-y-[1px]"
    >
      <rect width="64" height="64" rx="14" fill="#0a0a0a" />
      <g fill="#fafafa">
        <rect x="16" y="30" width="8" height="18" rx="2.5" />
        <circle cx="20" cy="21" r="5" />
        <rect x="40" y="34" width="8" height="18" rx="2.5" />
        <circle cx="44" cy="29" r="5" />
      </g>
    </svg>
  );
}

function SiteHeader() {
  return (
    <header className="hairline-b">
      <div className="mx-auto flex max-w-3xl items-baseline justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight"
        >
          <LogoMark />
          liigo<span className="text-ink-3">.dev</span>
        </Link>
        <nav className="flex items-baseline gap-6 font-mono text-xs uppercase tracking-widest text-ink-3">
          <Link href="/" className="transition-colors hover:text-ink">
            ( 文章 )
          </Link>
          <Link href="/about" className="transition-colors hover:text-ink">
            ( 关于 )
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="hairline-b border-b-0">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="hairline-b pb-6" />
        <div className="flex items-baseline justify-between pt-6 font-mono text-xs uppercase tracking-widest text-ink-3">
          <span>( liigo — 写作即构建 )</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="page-enter flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
