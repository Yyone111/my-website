import { useEffect, useMemo, useRef, useState } from "react";
import UiIcon from "../components/UiIcon";
import {
  TRAVEL_ADMIN_PASSWORD,
  TRAVEL_IMAGE_LIBRARY,
  TRAVEL_LATEST,
  TRAVEL_PROVINCES,
  TRAVEL_PROVINCE_STATUS,
  TRAVEL_RECENT,
} from "../data";
import {
  EMPTY_TRAVEL_CONFIG,
  TRAVEL_PHOTOS_EVENT,
  compressImageFiles,
  isAdminUnlocked,
  normalizeAlbum,
  readTravelConfig,
  resetTravelConfig,
  setAdminUnlocked,
  writeTravelConfig,
} from "../lib/travelPhotos";

/**
 * 旅行照片管理页（#/travel-admin）
 * - 进入需输入密码，解锁状态只在当前标签页的 session 里有效
 * - 每个位置都是一个「影集」：可以放多张照片，并指定其中一张作为封面
 * - 封面决定地图省份的拼贴、最近足迹的缩略图
 * - 照片支持本地上传（多选，压缩成 dataURL）或填写图片链接 / 项目内路径
 * - 配置存 localStorage，只本机生效
 *
 * 注意：这是纯前端密码，只能挡住误入的访客，不能防住会看源码的人。
 * 真正敏感的数据应放在服务端校验。
 */

const TABS = [
  { key: "provinces", label: "地图省份" },
  { key: "latest", label: "随机相框" },
  { key: "recent", label: "最近足迹" },
];

// 已去过的省份排在前面，其余按行政区顺序跟在后面
const VISITED = TRAVEL_PROVINCE_STATUS.visited;
const PROVINCE_OPTIONS = [
  ...VISITED,
  ...TRAVEL_PROVINCES.filter((name) => !VISITED.includes(name)),
];

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

/**
 * 一个影集位置的照片编辑器。
 * album 为 { photos, cover, caption }，没配过时传 null。
 */
function AlbumField({ album, onChange, hint, withCaption }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const photos = album?.photos || [];
  const cover = album?.cover ?? 0;

  const patch = (next) => {
    const merged = {
      photos: next.photos ?? photos,
      cover: next.cover ?? cover,
      caption: next.caption ?? album?.caption ?? "",
    };
    onChange(merged.photos.length > 0 ? merged : null);
  };

  const pickFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setError("");
    try {
      const { ok, failed } = await compressImageFiles(files, {
        maxDimension: 1000,
        quality: 0.68,
      });
      if (ok.length > 0) {
        patch({ photos: [...photos, ...ok] });
      }
      if (failed.length > 0) {
        setError(`有 ${failed.length} 张没处理成功：${failed[0]}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const addUrl = () => {
    const src = urlInput.trim();
    if (!src) return;
    setUrlInput("");
    setError("");
    patch({ photos: [...photos, src] });
  };

  const removeAt = (index) => {
    const nextPhotos = photos.filter((_, i) => i !== index);
    const nextCover =
      index === cover ? 0 : index < cover ? Math.max(0, cover - 1) : cover;
    onChange(
      nextPhotos.length > 0
        ? {
            photos: nextPhotos,
            cover: nextCover,
            caption: album?.caption || "",
          }
        : null,
    );
  };

  return (
    <div className="ta-field">
      {hint && <p className="ta-hint">{hint}</p>}

      <div className="ta-album">
        {photos.length === 0 ? (
          <div className="ta-album-empty">
            <UiIcon name="camera" />
            <p>还没有照片</p>
          </div>
        ) : (
          <div className="ta-album-grid">
            {photos.map((src, index) => (
              <div
                key={`${src.slice(-24)}-${index}`}
                className={`ta-album-cell ${index === cover ? "is-cover" : ""}`}
              >
                <img src={src} alt={`第 ${index + 1} 张`} loading="lazy" />
                <span className="ta-album-badge">
                  {index === cover ? "封面" : `第 ${index + 1} 张`}
                </span>
                <div className="ta-album-actions">
                  {index !== cover && (
                    <button
                      type="button"
                      className="ta-album-btn"
                      onClick={() => patch({ cover: index })}
                    >
                      设封面
                    </button>
                  )}
                  <button
                    type="button"
                    className="ta-album-btn is-remove"
                    onClick={() => removeAt(index)}
                    aria-label={`删除第 ${index + 1} 张照片`}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ta-field-actions">
        <button
          type="button"
          className="ta-btn is-primary"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? "处理中…" : photos.length ? "继续添加照片" : "上传本地图片"}
        </button>
        {photos.length > 0 && (
          <button
            type="button"
            className="ta-btn is-ghost"
            onClick={() => onChange(null)}
          >
            清空这组
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="ta-file"
        onChange={pickFiles}
      />

      <div className="ta-url-row">
        <input
          type="url"
          className="ta-input"
          placeholder="也可以用图片链接：/static/img/travel/xxx.jpg"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addUrl();
            }
          }}
        />
        <button
          type="button"
          className="ta-btn"
          onClick={addUrl}
          disabled={!urlInput.trim()}
        >
          添加
        </button>
      </div>

      {withCaption && (
        <input
          type="text"
          className="ta-input"
          placeholder="配文（可选），如 杭州 · 西湖"
          value={album?.caption || ""}
          onChange={(event) => patch({ caption: event.target.value })}
        />
      )}

      {error && <p className="ta-error">{error}</p>}
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
    () => Object.keys(config.provinces || {}).length,
    [config],
  );

  const photoCount = useMemo(() => {
    let count = 0;
    Object.values(config.provinces || {}).forEach((entry) => {
      count += normalizeAlbum(entry)?.photos.length || 0;
    });
    count += normalizeAlbum(config.latest)?.photos.length || 0;
    Object.values(config.recent || {}).forEach((entry) => {
      count += normalizeAlbum(entry)?.photos.length || 0;
    });
    return count;
  }, [config]);

  if (!unlocked) {
    return (
      <div className="page-shell ta-page">
        <PasswordGate onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  const currentRecent =
    TRAVEL_RECENT.find((item) => item.id === activeRecentId) ||
    TRAVEL_RECENT[0];

  /* ---- 省份 ---- */
  const setProvince = (name, album) => {
    const provinces = { ...(config.provinces || {}) };
    if (!album) delete provinces[name];
    else provinces[name] = album;
    save({ ...config, provinces });
  };

  /* ---- 随机相框 ---- */
  const setLatest = (album) => {
    save({ ...config, latest: album || null });
  };

  /* ---- 最近足迹 ---- */
  const setRecent = (id, album) => {
    const recent = { ...(config.recent || {}) };
    if (!album) delete recent[id];
    else recent[id] = album;
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
            选一个省份，把照片放进去。封面那张会铺满地图上的省界，配了照片的省份会自动点亮；
            同一省份的多张照片可以在旅行地图上点开翻看。
          </p>

          <div className="ta-prov-list">
            {PROVINCE_OPTIONS.map((name) => {
              const entry = normalizeAlbum(config.provinces?.[name]);
              const count = entry?.photos.length || 0;
              return (
                <button
                  key={name}
                  type="button"
                  className={`ta-prov ${activeProvince === name ? "is-active" : ""} ${
                    count > 0 ? "has-photo" : ""
                  }`}
                  onClick={() => setActiveProvince(name)}
                >
                  {count > 0 && (
                    <img
                      src={entry.photos[entry.cover]}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <span>
                    {name}
                    {count > 1 ? ` · ${count}` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <AlbumField
            key={activeProvince}
            album={normalizeAlbum(config.provinces?.[activeProvince])}
            onChange={(album) => setProvince(activeProvince, album)}
            hint={`正在配置：${activeProvince}`}
            withCaption
          />

          <div className="ta-library">
            <p className="ta-library-title">
              项目里已有的图片（点一下直接加进这组）
            </p>
            <div className="ta-chip-row">
              {TRAVEL_IMAGE_LIBRARY.map((item) => (
                <ImageChip
                  key={item.src}
                  src={item.src}
                  label={item.label}
                  onUse={(src) => {
                    const current = normalizeAlbum(
                      config.provinces?.[activeProvince],
                    );
                    const photos = current?.photos || [];
                    if (photos.includes(src)) return;
                    setProvince(activeProvince, {
                      photos: [...photos, src],
                      cover: current?.cover ?? 0,
                      caption: current?.caption || item.label,
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "latest" && (
        <section className="ta-panel">
          <p className="ta-hint">
            旅行地图右栏「随机相框」的照片。这里放几张，页面上可以随机切换；
            文字信息仍由 data.js 里的 TRAVEL_LATEST 决定。
          </p>

          <AlbumField
            album={normalizeAlbum(config.latest)}
            onChange={setLatest}
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
                  onUse={(src) => {
                    const current = normalizeAlbum(config.latest);
                    const photos = current?.photos || [];
                    if (photos.includes(src)) return;
                    setLatest({
                      photos: [...photos, src],
                      cover: current?.cover ?? 0,
                      caption: "",
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "recent" && (
        <section className="ta-panel">
          <p className="ta-hint">
            旅行地图右栏「最近足迹」列表的缩略图。点一条开始配置，没配的显示渐变底色。
          </p>

          <div className="ta-recent-list">
            {TRAVEL_RECENT.map((item) => {
              const entry = normalizeAlbum(config.recent?.[item.id]);
              const cover = entry ? entry.photos[entry.cover] : "";
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
                    {cover && <img src={cover} alt="" loading="lazy" />}
                  </span>
                  <span className="ta-recent-info">
                    <strong>{item.city}</strong>
                    <em>{item.date}</em>
                  </span>
                  <span className="ta-recent-state">
                    {entry ? `${entry.photos.length} 张` : "渐变占位"}
                  </span>
                </button>
              );
            })}
          </div>

          <AlbumField
            key={activeRecentId}
            album={normalizeAlbum(config.recent?.[activeRecentId])}
            onChange={(album) => setRecent(activeRecentId, album)}
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
                  onUse={(src) => {
                    const current = normalizeAlbum(
                      config.recent?.[activeRecentId],
                    );
                    const photos = current?.photos || [];
                    if (photos.includes(src)) return;
                    setRecent(activeRecentId, {
                      photos: [...photos, src],
                      cover: current?.cover ?? 0,
                      caption: "",
                    });
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {saveError && <p className="ta-error ta-save-error">{saveError}</p>}

      <footer className="ta-foot">
        <span>
          已配置 {configuredProvinceCount} 个省份 · 共 {photoCount} 张照片 ·
          仅本机可见
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
