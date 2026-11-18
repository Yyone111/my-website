import { useEffect, useRef, useState } from "react";
import {
  CONTACT_ITEMS,
  NOW_STATUS,
  PROFILE_HIGHLIGHTS,
  PROJECTS,
  STACK_FOCUS,
} from "../data";

// 启动时自动回放的命令序列
const BOOT = [
  { type: "cmd", text: "whoami" },
  { type: "out", text: "Yy · 全栈开发者 · 个人主页维护中" },
  { type: "cmd", text: "cat about.txt" },
  ...PROFILE_HIGHLIGHTS.map((text) => ({ type: "out", text })),
  { type: "cmd", text: "skills --list" },
  { type: "out", text: STACK_FOCUS.join("  ·  ") },
  { type: "cmd", text: "echo $TIP" },
  { type: "out", text: "输入 help 查看可用命令，敲一个试试 ↓" },
];

const COMMANDS = {
  help: [
    "可用命令：",
    "  whoami      介绍一下自己",
    "  skills      技术栈",
    "  projects    在做的项目",
    "  now         此刻状态",
    "  contact     联系方式",
    "  clear       清屏",
  ],
  whoami: ["Yy · 全栈开发者", ...PROFILE_HIGHLIGHTS],
  skills: [`技术栈：${STACK_FOCUS.join(" / ")}`],
  projects: PROJECTS.map((item) => `· ${item.title} — ${item.meta}`),
  now: NOW_STATUS.map((item) => `${item.label}：${item.value}`),
  contact: CONTACT_ITEMS.map((item) => `${item.label}：${item.value}`),
};

/**
 * 首页互动终端
 * - 进入页面自动回放一段命令（逐字输出）
 * - 支持输入 help / whoami / skills / projects / now / contact / clear
 * - 尊重 prefers-reduced-motion（跳过逐字动画）
 */
export default function Terminal() {
  const reducedRef = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [lines, setLines] = useState(() =>
    reducedRef.current ? BOOT.map((item) => ({ ...item })) : [],
  );
  const [bootIdx, setBootIdx] = useState(() =>
    reducedRef.current ? BOOT.length : 0,
  );
  const [bootChars, setBootChars] = useState(0);
  const [value, setValue] = useState("");
  const bodyRef = useRef(null);

  const booting = bootIdx < BOOT.length;

  // 启动序列逐字打字
  useEffect(() => {
    if (bootIdx >= BOOT.length) return undefined;
    const item = BOOT[bootIdx];

    if (reducedRef.current || bootChars >= item.text.length) {
      const timer = setTimeout(
        () => {
          setLines((prev) => [...prev, item]);
          setBootIdx((i) => i + 1);
          setBootChars(0);
        },
        reducedRef.current ? 0 : 160,
      );
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(
      () => setBootChars((c) => c + 1),
      item.type === "cmd" ? 36 : 9,
    );
    return () => clearTimeout(timer);
  }, [bootIdx, bootChars]);

  // 自动滚动到底部
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, bootChars]);

  const runCommand = (event) => {
    event.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    setValue("");

    const key = raw.toLowerCase();
    if (key === "clear") {
      setLines([]);
      setBootIdx(BOOT.length);
      setBootChars(0);
      return;
    }

    const output = COMMANDS[key];
    setLines((prev) => [
      ...prev,
      { type: "cmd", text: raw },
      ...(output
        ? output.map((text) => ({ type: "out", text }))
        : [{ type: "out", text: `command not found: ${key} —— 试试 help` }]),
    ]);
  };

  const reset = () => {
    setLines([]);
    setBootIdx(0);
    setBootChars(0);
    setValue("");
  };

  const pending = booting ? BOOT[bootIdx] : null;

  return (
    <section className="terminal reveal" style={{ "--i": 3 }}>
      <div className="terminal-window">
        <div className="terminal-bar">
          <span className="terminal-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="terminal-path">yy@homepage: ~</span>
          <button type="button" className="terminal-reset" onClick={reset}>
            重置
          </button>
        </div>

        <div className="terminal-body" ref={bodyRef}>
          {lines.map((line, index) => (
            <p
              key={`${index}-${line.text}`}
              className={`terminal-line ${
                line.type === "cmd" ? "is-cmd" : "is-out"
              }`}
            >
              {line.type === "cmd" && <span className="terminal-ps1">$ </span>}
              {line.text}
            </p>
          ))}

          {pending && (
            <p
              className={`terminal-line ${
                pending.type === "cmd" ? "is-cmd" : "is-out"
              }`}
            >
              {pending.type === "cmd" && (
                <span className="terminal-ps1">$ </span>
              )}
              {pending.text.slice(0, bootChars)}
              <span className="terminal-caret" aria-hidden="true" />
            </p>
          )}

          <form className="terminal-input-row" onSubmit={runCommand}>
            <span className="terminal-ps1" aria-hidden="true">
              $
            </span>
            <input
              className="terminal-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={booting ? "正在载入…" : "输入命令，回车执行（help）"}
              disabled={booting}
              autoComplete="off"
              spellCheck="false"
              aria-label="终端命令输入"
            />
          </form>
        </div>
      </div>
    </section>
  );
}
