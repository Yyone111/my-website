import { useCallback, useEffect, useRef, useState } from "react";
import UiIcon from "./components/UiIcon";
import ParticleField from "./components/ParticleField";
import {
  BRAND_TEXT,
  CONTACT_ITEMS,
  NAV_ITEMS,
  PROFILE_HIGHLIGHTS,
  STACK_FOCUS,
  TAGS,
} from "./data";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import About from "./pages/About";
import Contact from "./pages/Contact";

const DEFAULT_ROUTE = "home";

const routeFromHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const key = raw.split("?")[0];
  return NAV_ITEMS.some((item) => item.key === key) ? key : DEFAULT_ROUTE;
};

const hashForRoute = (key) => {
  const item = NAV_ITEMS.find((entry) => entry.key === key);
  return item ? item.hash : "#/";
};

const labelForRoute = (key) => {
  const item = NAV_ITEMS.find((entry) => entry.key === key);
  return item ? item.label : "";
};

function App() {
  const FLOAT_BTN_SIZE = 56;
  const FLOAT_EDGE_GAP = 12;
  const CHAT_PANEL_GAP = 12;
  const rootRef = useRef(null);
  const chatBodyRef = useRef(null);
  const pendingRouteRef = useRef(null);
  const dragStateRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });
  const [route, setRoute] = useState(() =>
    typeof window === "undefined" ? DEFAULT_ROUTE : routeFromHash(),
  );
  const [veilPhase, setVeilPhase] = useState("idle");
  const [pendingLabel, setPendingLabel] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDraggingFloatBtn, setIsDraggingFloatBtn] = useState(false);
  const [chatWidgetPos, setChatWidgetPos] = useState(() => {
    const margin = 24;
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return {
      x: window.innerWidth - FLOAT_BTN_SIZE - margin,
      y: window.innerHeight - FLOAT_BTN_SIZE - margin,
    };
  });
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "你好，我是站点 AI 助手。你可以先告诉我你想了解的内容。",
    },
  ]);

  const CHAT_API_ENDPOINT =
    window.location.hostname === "localhost"
      ? "http://localhost:10000/ai/chat"
      : "https://ownwebbackend.onrender.com/ai/chat";

  /* ===== 路由与整屏转场 ===== */
  const navigate = useCallback(
    (next) => {
      if (veilPhase !== "idle") return;
      if (next === route) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      pendingRouteRef.current = next;
      setPendingLabel(labelForRoute(next));
      setIsNavOpen(false);
      setVeilPhase("in");
    },
    [route, veilPhase],
  );

  // 遮罩铺满后切换内容，再让遮罩退场
  useEffect(() => {
    if (veilPhase !== "in") return;
    const timer = setTimeout(() => {
      const next = pendingRouteRef.current;
      if (next && next !== route) {
        window.history.pushState(null, "", hashForRoute(next));
        setRoute(next);
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      pendingRouteRef.current = null;
      setVeilPhase("out");
    }, 420);
    return () => clearTimeout(timer);
  }, [veilPhase, route]);

  useEffect(() => {
    if (veilPhase !== "out") return;
    const timer = setTimeout(() => setVeilPhase("idle"), 620);
    return () => clearTimeout(timer);
  }, [veilPhase]);

  // 浏览器前进 / 后退、站内 hash 跳转同样走转场
  useEffect(() => {
    const handleRouteChange = () => {
      const next = routeFromHash();
      if (next === route) return;
      pendingRouteRef.current = next;
      setPendingLabel(labelForRoute(next));
      setVeilPhase((phase) => (phase === "idle" ? "in" : phase));
    };
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, [route]);

  const clampWidgetPosition = (x, y) => {
    const maxX = Math.max(
      FLOAT_EDGE_GAP,
      window.innerWidth - FLOAT_BTN_SIZE - FLOAT_EDGE_GAP,
    );
    const maxY = Math.max(
      FLOAT_EDGE_GAP,
      window.innerHeight - FLOAT_BTN_SIZE - FLOAT_EDGE_GAP,
    );

    return {
      x: Math.min(Math.max(x, FLOAT_EDGE_GAP), maxX),
      y: Math.min(Math.max(y, FLOAT_EDGE_GAP), maxY),
    };
  };

  const getChatPanelMetrics = () => {
    const width = Math.min(380, window.innerWidth - 24);
    const height = Math.min(560, window.innerHeight - 110);
    return { width, height };
  };

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setIsChatOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatMessages, isSending, isChatOpen]);

  useEffect(() => {
    const handleResize = () => {
      setChatWidgetPos((prev) => clampWidgetPosition(prev.x, prev.y));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFloatButtonPointerDown = (event) => {
    const startPos = { x: event.clientX, y: event.clientY };
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: startPos.x,
      startY: startPos.y,
      originX: chatWidgetPos.x,
      originY: chatWidgetPos.y,
      moved: false,
    };
    setIsDraggingFloatBtn(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleFloatButtonPointerMove = (event) => {
    const drag = dragStateRef.current;
    if (!isDraggingFloatBtn || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      drag.moved = true;
    }

    setChatWidgetPos(clampWidgetPosition(drag.originX + dx, drag.originY + dy));
  };

  const handleFloatButtonPointerEnd = (event) => {
    const drag = dragStateRef.current;
    if (drag.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const shouldToggleChat = !drag.moved;
    dragStateRef.current.pointerId = null;
    setIsDraggingFloatBtn(false);

    if (shouldToggleChat) {
      setIsChatOpen((prev) => !prev);
    }
  };

  const chatWidgetStyle = {
    left: `${chatWidgetPos.x}px`,
    top: `${chatWidgetPos.y}px`,
    right: "auto",
    bottom: "auto",
  };

  const chatPanelStyle = (() => {
    if (typeof window === "undefined") return {};
    const { width, height } = getChatPanelMetrics();
    const maxLeft = Math.max(
      FLOAT_EDGE_GAP,
      window.innerWidth - width - FLOAT_EDGE_GAP,
    );
    const left = Math.min(
      Math.max(chatWidgetPos.x + FLOAT_BTN_SIZE - width, FLOAT_EDGE_GAP),
      maxLeft,
    );

    const preferTop = chatWidgetPos.y - height - CHAT_PANEL_GAP;
    const canPlaceAbove = preferTop >= FLOAT_EDGE_GAP;
    const fallbackTop = chatWidgetPos.y + FLOAT_BTN_SIZE + CHAT_PANEL_GAP;
    const maxTop = Math.max(
      FLOAT_EDGE_GAP,
      window.innerHeight - height - FLOAT_EDGE_GAP,
    );
    const top = canPlaceAbove
      ? preferTop
      : Math.min(Math.max(fallbackTop, FLOAT_EDGE_GAP), maxTop);

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  })();

  const handleSendMessage = async () => {
    const content = chatInput.trim();
    if (!content || isSending) return;

    const historyForRequest = [
      ...chatMessages,
      { role: "user", text: content },
    ];
    setChatMessages(historyForRequest);
    setChatInput("");
    setIsSending(true);

    try {
      const url = `${CHAT_API_ENDPOINT}?prompt=${encodeURIComponent(content)}`;
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`request failed: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        const reply =
          data?.data?.reply ||
          data?.reply ||
          data?.message ||
          "收到消息了，但后端暂未返回有效回复。";
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: reply },
        ]);
      } else if (response.body) {
        // For Flux text streams, read and render chunks progressively.
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let reply = "";

        setChatMessages((prev) => [...prev, { role: "assistant", text: "" }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          reply += decoder.decode(value, { stream: true });

          setChatMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
              next[lastIndex] = { ...next[lastIndex], text: reply };
            }
            return next;
          });
        }

        reply += decoder.decode();
        reply = reply.trim();
        if (!reply) {
          setChatMessages((prev) => {
            const next = [...prev];
            const lastIndex = next.length - 1;
            if (lastIndex >= 0 && next[lastIndex].role === "assistant") {
              next[lastIndex] = {
                ...next[lastIndex],
                text: "收到消息了，但后端暂未返回有效回复。",
              };
            }
            return next;
          });
        }
      } else {
        const reply =
          (await response.text()).trim() ||
          "收到消息了，但后端暂未返回有效回复。";
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: reply },
        ]);
      }
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "聊天服务暂时不可用，请稍后再试。",
        },
      ]);
      console.error("chat request error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const renderPage = () => {
    switch (route) {
      case "projects":
        return <Projects />;
      case "skills":
        return <Skills />;
      case "about":
        return <About onNavigate={navigate} />;
      case "contact":
        return <Contact onOpenQQ={() => setIsModalOpen(true)} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <>
      <div className="site-top-line">
        <div className="site-top-left">
          <span className="site-top-name" aria-label={BRAND_TEXT}>
            {BRAND_TEXT.split("").map((char, index) => (
              <span
                key={`${char}-${index}`}
                className="site-top-name-char"
                style={{ "--char-delay": `${index * 0.08}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </div>
        <nav
          className={`icomat-nav icomat-nav-inline ${isNavOpen ? "is-open" : ""}`}
          aria-label="主导航"
        >
          <button
            type="button"
            className={`icomat-nav-toggle ${isNavOpen ? "is-open" : ""}`}
            aria-label={isNavOpen ? "收起导航" : "展开导航"}
            onClick={() => setIsNavOpen((prev) => !prev)}
          >
            <span className="icomat-nav-toggle-bar" />
            <span className="icomat-nav-toggle-bar" />
            <span className="icomat-nav-toggle-bar" />
          </button>

          <div className="icomat-nav-links">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`icomat-nav-item ${
                  item.key === "contact" ? "icomat-nav-item-cta" : ""
                } ${route === item.key ? "is-active" : ""}`}
                aria-current={route === item.key ? "page" : undefined}
                onClick={() => navigate(item.key)}
              >
                <span className="icomat-nav-text" aria-hidden="true">
                  <span>{item.label}</span>
                  <span>{item.label}</span>
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div
        className={`page-veil ${
          veilPhase === "in" ? "is-in" : veilPhase === "out" ? "is-out" : ""
        }`}
        aria-hidden="true"
      >
        <span className="veil-panel" />
        <span className="veil-panel" />
        <span className="veil-panel" />
        <span className="veil-label">
          {pendingLabel || labelForRoute(route)}
        </span>
      </div>

      <div
        id="qqModal"
        className="modal"
        style={{ display: isModalOpen ? "block" : "none" }}
        onClick={(event) =>
          event.target.id === "qqModal" && setIsModalOpen(false)
        }
      >
        <span className="close" onClick={() => setIsModalOpen(false)}>
          &times;
        </span>
        <img
          className="modal-content"
          id="qqImage"
          src="/static/img/qqnumber.jpg"
          alt="QQ二维码"
        />
      </div>

      <ParticleField />

      <div className="yy-main" ref={rootRef}>
        <aside className="yy-left">
          <div className="profile-card">
            <div className="avatar-container">
              <img src="/static/img/head.jpg" alt="Yy" className="avatar" />
              <div className="emoji-badge emoji-1">
                <UiIcon name="spark" className="badge-icon" />
              </div>
              <div className="emoji-badge emoji-2">
                <UiIcon name="code" className="badge-icon" />
              </div>
            </div>

            <div className="info-item">
              <a
                href="https://cn.gullmap.com/is"
                target="_blank"
                rel="noreferrer"
              >
                <span className="info-icon">
                  <UiIcon name="pin" />
                </span>
                <span>ALLWORLD • Iceland</span>
              </a>
            </div>

            <div>
              <a
                href="https://space.bilibili.com/456713538"
                className="domain"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://www.bilibili.com/favicon.ico"
                  alt="Bilibili"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "middle",
                  }}
                />
              </a>
              <button
                type="button"
                className="domain"
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "5px",
                }}
                aria-label="打开QQ二维码"
              >
                <img
                  src="/static/img/qq.ico"
                  alt="QQ"
                  style={{
                    width: "30px",
                    height: "30px",
                    verticalAlign: "middle",
                    cursor: "pointer",
                  }}
                />
              </button>
            </div>

            <h3 className="title">快速联系</h3>
            <div className="left-contact-list">
              {CONTACT_ITEMS.map((item) => {
                const content = (
                  <>
                    <span className="left-contact-icon">
                      <UiIcon name={item.type} />
                    </span>
                    <span className="left-contact-label">{item.label}</span>
                    <span className="left-contact-value">{item.value}</span>
                  </>
                );

                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      className="left-contact-item"
                      href={item.href}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={item.label} className="left-contact-item">
                    {content}
                  </div>
                );
              })}
            </div>

            <h3 className="title">个人标签</h3>
            <div className="tags">
              {TAGS.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="title">个人简介</h3>
            <div className="left-highlight-list">
              {PROFILE_HIGHLIGHTS.map((item) => (
                <p key={item} className="left-highlight-item">
                  <span className="left-highlight-icon">
                    <UiIcon name="check" />
                  </span>
                  {item}
                </p>
              ))}
            </div>

            <h3 className="title">技术栈方向</h3>
            <div className="stack-focus-list">
              {STACK_FOCUS.map((item) => (
                <span key={item} className="stack-focus-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <section className="yy-right">
          <div className="yy-content page-stage" key={route}>
            {renderPage()}
          </div>
        </section>
      </div>

      <div
        className={`chat-widget ${isDraggingFloatBtn ? "is-dragging" : ""}`}
        style={chatWidgetStyle}
      >
        {isChatOpen && (
          <section
            className="chat-panel"
            style={chatPanelStyle}
            aria-label="AI 聊天窗口"
          >
            <header className="chat-panel-header">
              <div>
                <strong>小Yang助手</strong>
                <p>在线</p>
              </div>
              <button
                type="button"
                className="chat-panel-close"
                onClick={() => setIsChatOpen(false)}
                aria-label="关闭聊天窗口"
              >
                ×
              </button>
            </header>

            <div className="chat-panel-body" ref={chatBodyRef}>
              {chatMessages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`chat-message ${item.role === "user" ? "is-user" : "is-assistant"}`}
                >
                  {item.text}
                </div>
              ))}
              {isSending && (
                <div className="chat-message is-assistant">AI 正在输入...</div>
              )}
            </div>

            <footer className="chat-panel-footer">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && handleSendMessage()
                }
                placeholder="输入消息..."
                aria-label="输入消息"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isSending}
              >
                发送
              </button>
            </footer>
          </section>
        )}

        <button
          type="button"
          className={`chat-float-btn ${isDraggingFloatBtn ? "is-dragging" : ""}`}
          onPointerDown={handleFloatButtonPointerDown}
          onPointerMove={handleFloatButtonPointerMove}
          onPointerUp={handleFloatButtonPointerEnd}
          onPointerCancel={handleFloatButtonPointerEnd}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsChatOpen((prev) => !prev);
            }
          }}
          aria-label={isChatOpen ? "关闭 AI 聊天" : "打开 AI 聊天"}
        >
          小Y
        </button>
      </div>
    </>
  );
}

export default App;
