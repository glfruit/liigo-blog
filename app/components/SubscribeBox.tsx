"use client";

import { useState } from "react";

const EMBED_ACTION = "https://buttondown.com/api/emails/embed-subscribe/liigo";
const ARCHIVE_URL = "https://buttondown.com/liigo";

/**
 * Newsletter 订阅框（Buttondown）。
 * 墨纸风格：发丝线 + 无彩色。提交走 embed-subscribe（no-cors），
 * 成功后提示查收确认邮件；失败时降级为跳转 Buttondown 归档页。
 */
export default function SubscribeBox() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state !== "idle") return;
    setState("sending");
    try {
      const body = new FormData();
      body.append("email", email);
      // no-cors：拿不到响应体，但只要请求发出即视为已提交
      await fetch(EMBED_ACTION, { method: "POST", mode: "no-cors", body });
      setState("done");
    } catch {
      // 网络异常时降级：跳转到 Buttondown 订阅页
      window.open(ARCHIVE_URL, "_blank", "noopener");
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div className="hairline-t mt-14 pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
          ( 订阅 / Newsletter )
        </p>
        <p className="font-display mt-4 text-xl font-semibold">
          已收到，请查收确认邮件 ✉
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-3">
          点邮件里的确认链接后即订阅成功。没收到的话检查垃圾箱，或到{" "}
          <a href={ARCHIVE_URL} target="_blank" rel="noopener" className="underline underline-offset-4">
            归档页
          </a>{" "}
          重试。
        </p>
      </div>
    );
  }

  return (
    <div className="hairline-t mt-14 pt-8">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
        ( 订阅 / Newsletter )
      </p>
      <p className="font-display mt-4 text-xl font-semibold tracking-tight">
        新文章直接送到你的邮箱
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-3">
        每周二、周四更新。没有热点搬运，没有 AI 速食内容，退订随时一键。
      </p>
      <form onSubmit={onSubmit} className="mt-5 flex gap-0">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="hairline min-w-0 flex-1 bg-paper px-4 py-2.5 font-mono text-sm outline-none placeholder:text-ink-3 focus:border-ink"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {state === "sending" ? "提交中…" : "订阅"}
        </button>
      </form>
    </div>
  );
}
