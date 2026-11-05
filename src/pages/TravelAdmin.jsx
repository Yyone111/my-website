import { useEffect, useMemo, useRef, useState } from "react";
import UiIcon from "../components/UiIcon";
import {
  TRAVEL_ADMIN_PASSWORD,
  TRAVEL_IMAGE_LIBRARY,
  TRAVEL_LATEST,
  TRAVEL_PROVINCE_STATUS,
  TRAVEL_RECENT,
  TRAVEL_TONES,
} from "../data";
import {
  EMPTY_TRAVEL_CONFIG,
  TRAVEL_PHOTOS_EVENT,
  fileToDataUrl,
  isAdminUnlocked,
  readTravelConfig,
  resetTravelConfig,
  setAdminUnlocked,
  writeTravelConfig,
} from "../lib/travelPhotos";

/**
 * 旅行照片管理页（#/travel-admin）
 * - 进入需输入密码，解锁状态只在当前标签页的 session 里有效
 * - 可给地图省份、最新足迹大图卡、最近足迹缩略图配置照片
 * - 照片支持本地上传（压缩成 dataURL）或填写图片链接 / 项目内路径
 * - 配置存 localStorage，只在本机生效
 *
 * 注意：这是纯前端密码，只能挡住误入的访客，不能防住会看源码的人。
 * 真正敏感的数据应放在服务端校验。
 */

const TABS = [
  { key: "provinces", label: "地图省份" },
  { key: "latest", label: "最新足迹" },
  { key: "recent", label: "最近足迹" },
];

const VISITED = TRAVEL_PROVINCE_STATUS.visited;

/* ---- 小的可复用块 ---- */

function ImageChip({ src, label, onUse, active }) {
  return (
    <button
      type="button"
      className={`ta-chip ${active ? "is-active" : ""}`}
      onClick={() => onUse(src)}
      title={label || src}
    >
      <img src={src} alt={label || ""} loading="lazy" />
      <span>{label || "图片"}</span>
    </button>
  );
}

function PhotoField({ value, onChange, caption, onCaptionChange, hint }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pickFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err.message || "上传失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ta-field">
      {hint && <p className="ta-hint">{hint}</p>}

      <div className="ta-field-row">
        <div className="ta-preview">
          {value ? (
            <img src={value} alt="当前照片预览" />
          ) : (
            <span className="ta-preview-empty">
              <UiIcon name="camera" />
              未设置
            </span>
          )}
        </div>

        <div className="ta-field-body">
          <input
            type="url"
            className="ta-input"
            placeholder="粘贴图片链接，或 /static/img/travel/xxx.jpg"
            value={value?.startsWith("data:") ? "" : value || ""}
            onChange={(event) => onChange(event.target.value.trim())}
          />
          {value?.startsWith("data:") && (
            <p className="ta-tag-note">当前使用本地上传的图片</p>
          )}

          <div className="ta-field-actions">
            <button
              type="button"
              className="ta-btn"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              {busy ? "处理中…" : "上传本地图片"}
            </button>
            {value && (
              <button
                type="button"
                className="ta-btn is-ghost"
                onClick={() => onChange("")}
              >
                移除
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="ta-file"
            onChange={pickFile}
          />

          {onCaptionChange && (
            <input
              type="text"
              className="ta-input"
              placeholder="配文（可选），如 杭州 · 西湖"
              value={caption || ""}
              onChange={(event) => onCaptionChange(event.target.value)}
            />
          )}

          {error && <p className="ta-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---- 密码门 ---- */

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (input === TRAVEL_ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      onUnlock();
      return;
    }
    setError("密码不对，再试一次。");
    setInput("");
  };

  return (
    <div className="ta-gate">
      <div className="ta-gate-card">
        <span className="ta-gate-icon">
          <UiIcon name="pin" />
        </span>
        <h2>照片管理</h2>
        <p>输入密码后可以配置旅行地图上的照片。</p>

        <form onSubmit={submit}>
          <input
            type="password"
            className="ta-input ta-gate-input"
            placeholder="请输入密码"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setError("");
            }}
            autoFocus
          />
          {error && <p className="ta-error">{error}</p>}
          <button type="submit" className="ta-btn is-primary ta-gate-btn">
            进入
          </button>
        </form>

        <p className="ta-gate-foot">
          密码校验在前端完成，只用于挡住误入的访客，不能替代服务端鉴权。
        </p>
      </div>
    </div>
  );
}

/* ---- 主页面 ---- */

export default function TravelAdmin() {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked());
  const [tab, setTab] = useState("provinces");
  const [config, setConfig] = useState(() => readTravelConfig());
  const [activeProvince, setActiveProvince] = useState(VISITED[0]);
  const [activeRecentId, setActiveRecentId] = useState(TRAVEL_RECENT[0].id);
  const [toast, setToast] = useState("");
  const [saveError, setSaveError] = useState("");

  // 别处（另一个标签页）改了配置就同步过来
  useEffect(() => {
    const refresh = () => setConfig(readTravelConfig());
    window.addEventListener(TRAVEL_PHOTOS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TRAVEL_PHOTOS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const save = (next) => {
    setConfig(next);
    setSaveError("");
    try {
      writeTravelConfig(next);
    } catch (error) {
      setSaveError(error.message || "保存失败");
    }
  };

  const configuredProvinceCount = useMemo(
    () =>
      Object.values(config.provinces || {}).filter((entry) => entry?.src)
        .length,
    [config],
  );

  if (!unlocked) {
    return (
      <div className="page-shell ta-page">
        <PasswordGate onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  const currentProvince = config.provinces?.[activeProvince] || {};
  const currentRecent =
    TRAVEL_RECENT.find((item) => item.id === activeRecentId) ||
    TRAVEL_RECENT[0];

  /* ---- 省份 ---- */
  const setProvince = (name, patch) => {
    const provinces = { ...(config.provinces || {}) };
    const next = { ...(provinces[name] || {}), ...patch };
    if (!next.src) delete provinces[name];
    else provinces[name] = next;
    save({ ...config, provinces });
  };

  /* ---- 最新足迹 ---- */
  const setLatest = (patch) => {
    const next = { ...(config.latest || {}), ...patch };
    if (!next.src) save({ ...config, latest: null });
    else save({ ...config, latest: next });
  };

  /* ---- 最近足迹缩略图 ---- */
  const setRecent = (id, src) => {
    const recent = { ...(config.recent || {}) };
    if (!src) delete recent[id];
    else recent[id] = { src };
    save({ ...config, recent });
  };

  return (
    <div className="page-shell ta-page">
      <header className="ta-head reveal" style={{ "--i": 0 }}>
        <div>
          <p className="ta-kicker">TRAVEL PHOTO ADMIN</p>
          <h2 className="ta-title">旅行照片管理</h2>
          <p className="ta-sub">
            配置会保存在这台设备的浏览器里，你自己看到效果，访客仍看到代码里的默认值。
          </p>
        </div>
        <button
          type="button"
          className="ta-btn is-ghost"
          onClick={() => {
            setAdminUnlocked(false);
            setUnlocked(false);
          }}
        >
          锁定退出
        </button>
      </header>

      <div className="ta-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`ta-tab ${tab === item.key ? "is-active" : ""}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            {item.key === "provinces" && (
              <span className="ta-tab-count">{configuredProvinceCount}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "provinces" && (
        <section className="ta-panel">
          <p className="ta-hint">
            选择省份，再给它配一张照片。配了照片的省份会用照片铺满省界；没配的仍用绿色渐变。
          </p>

          <div className="ta-prov-list">
            {VISITED.map((name) => {
              const entry = config.provinces?.[name];
              return (
                <button
                  key={name}
                  type="button"
                  className={`ta-prov ${activeProvince === name ? "is-active" : ""} ${
                    entry?.src ? "has-photo" : ""
                  }`}
                  onClick={() => setActiveProvince(name)}
                >
                  {entry?.src && <img src={entry.src} alt="" loading="lazy" />}
                  <span>{name}</span>
                </button>
              );
            })}
          </div>

          <PhotoField
            value={currentProvince.src || ""}
            caption={currentProvince.caption || ""}
            onChange={(src) => setProvince(activeProvince, { src })}
            onCaptionChange={(caption) =>
              setProvince(activeProvince, { caption })
            }
            hint={`正在配置：${activeProvince}`}
          />

          <div className="ta-library">
            <p className="ta-library-title">项目里已有的图片</p>
            <div className="ta-chip-row">
              {TRAVEL_IMAGE_LIBRARY.map((item) => (
                <ImageChip
                  key={item.src}
                  src={item.src}
                  label={item.label}
                  active={currentProvince.src === item.src}
                  onUse={(src) =>
                    setProvince(activeProvince, {
                      src,
                      caption: currentProvince.caption || item.label,
                    })
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "latest" && (
        <section className="ta-panel">
          <p className="ta-hint">
            右侧「最新足迹」大图卡的照片。文字信息仍由 data.js 里的
            TRAVEL_LATEST 决定。
          </p>

          <PhotoField
            value={config.latest?.src || ""}
            onChange={(src) => setLatest({ src })}
            hint={`当前：${TRAVEL_LATEST.city} · ${TRAVEL_LATEST.date}`}
          />

          <div className="ta-library">
            <p className="ta-library-title">项目里已有的图片</p>
            <div className="ta-chip-row">
              {TRAVEL_IMAGE_LIBRARY.map((item) => (
                <ImageChip
                  key={item.src}
                  src={item.src}
                  label={item.label}
                  active={config.latest?.src === item.src}
                  onUse={(src) => setLatest({ src })}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "recent" && (
        <section className="ta-panel">
          <p className="ta-hint">
            右侧「最近足迹」列表的缩略图。点一条开始配置，没配的显示渐变底色。
          </p>

          <div className="ta-recent-list">
            {TRAVEL_RECENT.map((item) => {
              const entry = config.recent?.[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`ta-recent-row ${
                    activeRecentId === item.id ? "is-active" : ""
                  }`}
                  onClick={() => setActiveRecentId(item.id)}
                >
                  <span
                    className="ta-recent-thumb"
                    style={{
                      "--tone-a": item.tone[0],
                      "--tone-b": item.tone[1],
                    }}
                  >
                    {entry?.src && (
                      <img src={entry.src} alt="" loading="lazy" />
                    )}
                  </span>
                  <span className="ta-recent-info">
                    <strong>{item.city}</strong>
                    <em>{item.date}</em>
                  </span>
                  <span className="ta-recent-state">
                    {entry?.src ? "已配照片" : "渐变占位"}
                  </span>
                </button>
              );
            })}
          </div>

          <PhotoField
            value={config.recent?.[activeRecentId]?.src || ""}
            onChange={(src) => setRecent(activeRecentId, src)}
            hint={`正在配置：${currentRecent.city} · ${currentRecent.date}`}
          />

          <div className="ta-library">
            <p className="ta-library-title">项目里已有的图片</p>
            <div className="ta-chip-row">
              {TRAVEL_IMAGE_LIBRARY.map((item) => (
                <ImageChip
                  key={item.src}
                  src={item.src}
                  label={item.label}
                  active={config.recent?.[activeRecentId]?.src === item.src}
                  onUse={(src) => setRecent(activeRecentId, src)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {saveError && <p className="ta-error ta-save-error">{saveError}</p>}

      <footer className="ta-foot">
        <span>
          已配置 {configuredProvinceCount} 个省份照片 · 配置仅本机可见
        </span>
        <button
          type="button"
          className="ta-btn is-danger"
          onClick={() => {
            resetTravelConfig();
            setConfig({ ...EMPTY_TRAVEL_CONFIG });
            setToast("已恢复默认，刷新后可见");
          }}
        >
          清空全部配置
        </button>
      </footer>

      {toast && <div className="ta-toast">{toast}</div>}
    </div>
  );
}
