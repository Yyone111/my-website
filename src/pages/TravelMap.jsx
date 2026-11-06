import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import UiIcon from "../components/UiIcon";
import {
  TRAVEL_LATEST,
  TRAVEL_PHOTOS,
  TRAVEL_PROVINCE_STATUS,
  TRAVEL_RECENT,
  TRAVEL_TONES,
} from "../data";
import {
  TRAVEL_PHOTOS_EVENT,
  albumCover,
  albumPhotos,
  normalizeAlbum,
  readTravelConfig,
} from "../lib/travelPhotos";
import { readSharedConfig } from "../lib/supabaseClient";

/**
 * 旅行地图
 * - 左侧：按省份状态上色的中国地图，可缩放 / 拖拽 / 一键复位，悬停给出省份提示
 * - 点击省份：右栏切成该省的影集卡，可翻看省内的多张照片
 * - 右栏默认是随机相框：在全部已配置照片里随机换一张
 * - 照片优先取本机浏览器里配置好的（照片管理页写入），没有就用 data.js 的默认值
 * - 地图数据是离线投影抽稀好的静态 JSON（public/static/geo/china-provinces.json），
 *   页面加载后再取，不进主包
 */

const GEO_URL = "/static/geo/china-provinces.json";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.2;
const ZOOM_STEP = 0.18;

// 每个省自己的渐变方向，避免整张地图一个走向、看起来像色块
const GRADIENT_DIRS = [
  { x1: "0", y1: "0", x2: "1", y2: "1" },
  { x1: "1", y1: "0", x2: "0", y2: "1" },
  { x1: "0", y1: "1", x2: "1", y2: "0" },
  { x1: "0", y1: "0", x2: "0", y2: "1" },
  { x1: "0", y1: "0", x2: "1", y2: "0" },
];

const STATUS_TEXT = {
  visited: "已打卡",
  wish: "想去",
  todo: "还没去过",
};

/* ---- 右栏：随机相框 ---- */

function RandomFrame({ pool, onOpenAdmin }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [pool.length]);

  const current = pool[index] || null;

  const shuffle = () => {
    if (pool.length < 2) return;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * pool.length);
    setIndex(next);
  };

  return (
    <article className="tm-latest is-frame reveal" style={{ "--i": 2 }}>
      <div className="tm-latest-head">
        <span className="tm-latest-label">
          <UiIcon name="camera" className="tm-latest-cam" />
          <span className="tm-latest-titles">
            随机相框
            <em className="tm-latest-sub">旅途中随手按下的一张</em>
          </span>
        </span>
        <button
          type="button"
          className="tm-shuffle"
          onClick={shuffle}
          disabled={pool.length < 2}
          aria-label="换一张照片"
          title="换一张"
        >
          <UiIcon name="refresh" />
        </button>
      </div>

      <div
        className="tm-latest-shot"
        style={{
          "--tone-a": current?.tone?.[0] || TRAVEL_LATEST.tone[0],
          "--tone-b": current?.tone?.[1] || TRAVEL_LATEST.tone[1],
        }}
      >
        {current ? (
          <>
            <img src={current.src} alt={current.city} />
            <span className="tm-shot-shade" aria-hidden="true" />
          </>
        ) : (
          <span className="tm-shot-hold">
            <UiIcon name="camera" className="tm-shot-icon" />
          </span>
        )}
      </div>

      <div className="tm-latest-body">
        <div className="tm-frame-meta">
          <span className="tm-frame-chip">
            <UiIcon name="pin" />
          </span>
          <div className="tm-frame-cityline">
            <h3>{current?.city || TRAVEL_LATEST.city}</h3>
            {(current?.date || TRAVEL_LATEST.date) && (
              <span className="tm-frame-date">
                {current?.date || TRAVEL_LATEST.date}
              </span>
            )}
          </div>
        </div>
        {(current?.note || TRAVEL_LATEST.note) && (
          <p className="tm-frame-note">{current?.note || TRAVEL_LATEST.note}</p>
        )}
        {pool.length === 0 && (
          <button
            type="button"
            className="tm-latest-link"
            onClick={onOpenAdmin}
          >
            去照片管理添加第一张
          </button>
        )}
      </div>
    </article>
  );
}

/* ---- 右栏：省份影集 ---- */

function ProvinceAlbum({ province, album, onClose, onOpenAdmin }) {
  const [preview, setPreview] = useState(album?.cover ?? 0);

  if (!album) {
    return (
      <article className="tm-latest reveal" style={{ "--i": 2 }}>
        <div className="tm-latest-head">
          <span className="tm-latest-label">
            <UiIcon name="pin" className="tm-latest-cam" />
            {province.name}
            <em className="tm-status-pill is-todo">还没有照片</em>
          </span>
          <button
            type="button"
            className="tm-shuffle"
            onClick={onClose}
            aria-label="关闭省份影集"
          >
            ×
          </button>
        </div>
        <div className="tm-album-empty">
          <UiIcon name="camera" />
          <p>这个省份还没有照片。</p>
          <button
            type="button"
            className="tm-latest-link"
            onClick={onOpenAdmin}
          >
            去添加照片
          </button>
        </div>
      </article>
    );
  }

  const src = album.photos[preview] || album.photos[0];

  return (
    <article className="tm-latest reveal" style={{ "--i": 2 }}>
      <div className="tm-latest-head">
        <span className="tm-latest-label">
          <UiIcon name="pin" className="tm-latest-cam" />
          {province.name}
          <em className={`tm-status-pill is-${province.status}`}>
            {STATUS_TEXT[province.status]}
          </em>
        </span>
        <button
          type="button"
          className="tm-shuffle"
          onClick={onClose}
          aria-label="关闭省份影集"
        >
          ×
        </button>
      </div>

      <div className="tm-latest-shot tm-album-shot">
        <img src={src} alt={`${province.name} 的照片`} />
        {album.photos.length > 1 && (
          <span className="tm-album-count">
            {preview + 1} / {album.photos.length}
          </span>
        )}
      </div>

      {album.photos.length > 1 && (
        <div className="tm-album-thumbs">
          {album.photos.map((photo, i) => (
            <button
              key={`${photo.slice(-24)}-${i}`}
              type="button"
              className={`tm-album-thumb ${i === preview ? "is-active" : ""}`}
              onClick={() => setPreview(i)}
              aria-label={`查看第 ${i + 1} 张照片`}
            >
              <img src={photo} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="tm-latest-body">
        <p className="tm-note">
          {album.caption || "给这个省份写一句配文，会更好看。"}
        </p>
      </div>
    </article>
  );
}

/* ---- 主页面 ---- */

export default function TravelMap({ onNavigate }) {
  const wrapRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const [geo, setGeo] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  // 本机浏览器里保存的照片配置（照片管理页写入），默认空对象
  const [localConfig, setLocalConfig] = useState(() => readTravelConfig());
  // 全站共享的照片清单（Supabase DB）：优先于本机；未配置图床或读取失败时为 null
  const [sharedConfig, setSharedConfig] = useState(null);

  const loadShared = useCallback(() => {
    readSharedConfig().then(setSharedConfig);
  }, []);

  useEffect(() => {
    loadShared();
  }, [loadShared]);

  useEffect(() => {
    const refresh = () => {
      setLocalConfig(readTravelConfig());
      // 管理页保存会本地 + DB 双写，这里跟着拉一次共享清单
      loadShared();
    };
    window.addEventListener(TRAVEL_PHOTOS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TRAVEL_PHOTOS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [loadShared]);

  // 共享清单优先；没拉到共享期间先用本机，两者都没有则用 data.js 默认
  const resolvedConfig = sharedConfig ?? localConfig;

  // 共享/本地配置优先，没配置的省份仍用 data.js 里的默认照片表
  const provincePhotos = useMemo(() => {
    const merged = { ...TRAVEL_PHOTOS };
    Object.entries(resolvedConfig.provinces || {}).forEach(([name, entry]) => {
      merged[name] = entry;
    });
    return merged;
  }, [resolvedConfig]);

  const latestAlbum = useMemo(
    () =>
      normalizeAlbum(resolvedConfig.latest) || normalizeAlbum(TRAVEL_LATEST),
    [resolvedConfig],
  );

  const recentAlbums = useMemo(() => {
    const merged = {};
    TRAVEL_RECENT.forEach((item) => {
      const album = normalizeAlbum(resolvedConfig.recent?.[item.id]);
      if (album) merged[item.id] = album;
    });
    return merged;
  }, [resolvedConfig]);

  useEffect(() => {
    let alive = true;
    fetch(GEO_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (alive) setGeo(data);
      })
      .catch((error) => {
        console.error("旅行地图数据加载失败:", error);
        if (alive) setLoadFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // 省名 → 状态（两个名单之外的都算「还没去」）
  const statusMap = useMemo(() => {
    const map = new Map();
    TRAVEL_PROVINCE_STATUS.visited.forEach((name, index) => {
      map.set(name, {
        status: "visited",
        toneIndex: index % TRAVEL_TONES.length,
      });
    });
    TRAVEL_PROVINCE_STATUS.wish.forEach((name) => {
      map.set(name, { status: "wish" });
    });
    return map;
  }, []);

  const provinces = useMemo(() => {
    if (!geo) return [];
    return geo.provinces.map((province) => {
      const base = { status: "todo", ...(statusMap.get(province.name) || {}) };
      // 配了照片就算去过：管理页加了照片就点亮，不用再改 data.js 的名单
      const lit = Boolean(albumCover(provincePhotos[province.name]));
      return {
        ...province,
        ...base,
        status: lit ? "visited" : base.status,
        toneIndex: base.toneIndex ?? 0,
      };
    });
  }, [geo, statusMap, provincePhotos]);

  // 统计数字直接从地图数据里数，永远和地图对得上
  const stats = useMemo(() => {
    const acc = { visited: 0, wish: 0, todo: 0 };
    provinces.forEach((province) => {
      acc[province.status] += 1;
    });
    return { ...acc, total: provinces.length };
  }, [provinces]);

  const selected = useMemo(
    () => provinces.find((province) => province.name === selectedName) || null,
    [provinces, selectedName],
  );

  const photoProvinces = useMemo(
    () =>
      provinces.filter((province) => albumCover(provincePhotos[province.name])),
    [provinces, provincePhotos],
  );

  // 随机相框的照片池：大图卡 + 各省级影集 + 最近足迹，按图片去重
  const photoPool = useMemo(() => {
    const pool = [];
    const seen = new Set();
    const push = (entry, meta) => {
      albumPhotos(entry).forEach((src) => {
        if (seen.has(src)) return;
        seen.add(src);
        pool.push({ src, ...meta });
      });
    };

    push(latestAlbum, {
      city: TRAVEL_LATEST.city,
      date: TRAVEL_LATEST.date,
      note: TRAVEL_LATEST.note,
      tone: TRAVEL_LATEST.tone,
    });

    Object.entries(provincePhotos).forEach(([name, entry]) => {
      const album = normalizeAlbum(entry);
      push(album, {
        city: name,
        date: "",
        note: album?.caption || `${name} · 旅途片段`,
      });
    });

    TRAVEL_RECENT.forEach((item) => {
      if (!recentAlbums[item.id]) return;
      push(recentAlbums[item.id], {
        city: item.city,
        date: item.date,
        note: "",
        tone: item.tone,
      });
    });

    return pool;
  }, [latestAlbum, provincePhotos, recentAlbums]);

  /* ---- 缩放 / 拖拽 ---- */

  const limitPan = useCallback((nextPan, nextZoom) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return nextPan;
    const maxX = (rect.width * (nextZoom - 1)) / 2;
    const maxY = (rect.height * (nextZoom - 1)) / 2;
    return {
      x: Math.min(Math.max(nextPan.x, -maxX), maxX),
      y: Math.min(Math.max(nextPan.y, -maxY), maxY),
    };
  }, []);

  const applyZoom = (next) => {
    const value = Math.min(Math.max(next, MIN_ZOOM), MAX_ZOOM);
    setZoom(value);
    setPan((current) =>
      value === MIN_ZOOM ? { x: 0, y: 0 } : limitPan(current, value),
    );
  };

  const resetView = () => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    if (event.target.closest("button, input, .tm-nanhai")) return;
    movedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPan: pan,
    };
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || zoom <= MIN_ZOOM) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) movedRef.current = true;

    setPan(
      limitPan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy }, zoom),
    );
  };

  const handlePointerEnd = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
    setDragging(false);
  };

  const pickProvince = (province) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    setSelectedName((current) =>
      current === province.name ? null : province.name,
    );
  };

  const renderMap = () => {
    if (loadFailed) {
      return (
        <p className="tm-map-fallback">
          地图数据没能加载出来，刷新页面再试试。
        </p>
      );
    }
    if (!geo) {
      return <div className="tm-map-skeleton" aria-hidden="true" />;
    }

    return (
      <>
        <svg
          className="tm-map"
          viewBox={geo.viewBox}
          role="img"
          aria-label="旅行足迹地图"
        >
          <defs>
            {TRAVEL_TONES.map((tone, index) => {
              const dir = GRADIENT_DIRS[index % GRADIENT_DIRS.length];
              return (
                <linearGradient
                  key={index}
                  id={`tmTone${index}`}
                  x1={dir.x1}
                  y1={dir.y1}
                  x2={dir.x2}
                  y2={dir.y2}
                >
                  <stop offset="0" stopColor={tone[0]} />
                  <stop offset="0.46" stopColor={tone[2]} />
                  <stop offset="0.64" stopColor={tone[1]} />
                  <stop offset="1" stopColor={tone[2]} />
                </linearGradient>
              );
            })}

            {/* 已打卡省份的底色梯度 */}
            {photoProvinces.map((province) => (
              <pattern
                key={province.name}
                id={`tmPhoto${province.name}`}
                patternUnits="objectBoundingBox"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
              >
                <image
                  href={albumCover(provincePhotos[province.name])}
                  preserveAspectRatio="xMidYMid slice"
                  width="1"
                  height="1"
                />
              </pattern>
            ))}

            {/* 柔和粉色辉光（对齐 map-of-us-template 的 visitedGlow） */}
            <filter
              id="tmVisitedGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="4" result="tmBlur" />
              <feFlood floodColor="#e8b8c2" floodOpacity="0.36" />
              <feComposite in2="tmBlur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 奶油纸纹：叠在没有照片的已打卡省份上，避免色块发闷 */}
            <pattern
              id="tmSoftTexture"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path d="M0 0h2v2H0z" fill="#fafbf7" opacity="0.26" />
              <path d="M5 5h1.5v1.5H5z" fill="#a8c8dc" opacity="0.08" />
            </pattern>
          </defs>

          <g className="tm-lands">
            {provinces.map((province) => {
              const cover = albumCover(provincePhotos[province.name]);
              const fill =
                province.status === "visited"
                  ? cover
                    ? `url(#tmPhoto${province.name})`
                    : `url(#tmTone${province.toneIndex ?? 0})`
                  : undefined;

              return (
                <path
                  key={province.name}
                  className={`tm-prov is-${province.status} ${
                    hovered?.name === province.name ? "is-hover" : ""
                  } ${selectedName === province.name ? "is-selected" : ""}`}
                  d={province.d}
                  style={fill ? { fill } : undefined}
                  onMouseEnter={() =>
                    setHovered({
                      name: province.name,
                      center: province.center,
                      status: province.status,
                    })
                  }
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => pickProvince(province)}
                />
              );
            })}
          </g>

          {/* 奶油纸纹：叠在没有照片的已打卡省份上，避免大色块发闷（对齐参考项目 softPixelTexture） */}
          <g aria-hidden="true" pointerEvents="none">
            {provinces
              .filter(
                (province) =>
                  province.status === "visited" &&
                  !albumCover(provincePhotos[province.name]),
              )
              .map((province) => (
                <path
                  key={`texture-${province.name}`}
                  d={province.d}
                  fill="url(#tmSoftTexture)"
                  stroke="#fafbf7"
                  strokeOpacity="0.9"
                  strokeWidth="1"
                />
              ))}
          </g>
        </svg>

        {hovered?.center && (
          <span
            className="tm-tip"
            style={{
              left: `${(hovered.center[0] / geo.width) * 100}%`,
              top: `${(hovered.center[1] / geo.height) * 100}%`,
            }}
          >
            <strong>{hovered.name}</strong>
            <em>{STATUS_TEXT[hovered.status]}</em>
          </span>
        )}
      </>
    );
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="page-shell tm-page">
      <header className="tm-head reveal" style={{ "--i": 0 }}>
        <p className="tm-kicker">04 — TRAVEL MAP</p>
        <h2 className="tm-title">我们去过的地方</h2>
        <p className="tm-sub">
          把一起走过的城市钉在地图上，绿起来的地方是回忆，空着的地方留给下一次出发。
        </p>
      </header>

      <div className="tm-grid">
        <section className="tm-map-col reveal" style={{ "--i": 1 }}>
          <div
            className={`tm-map-wrap ${dragging ? "is-dragging" : ""} ${
              zoom > MIN_ZOOM ? "is-zoomed" : ""
            }`}
            ref={wrapRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div
              className="tm-map-canvas"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              }}
            >
              {renderMap()}
            </div>

            {geo?.nanhai && (
              <figure className="tm-nanhai">
                <svg
                  viewBox={geo.nanhai.viewBox}
                  role="img"
                  aria-label="南海诸岛"
                >
                  <path d={geo.nanhai.d} />
                </svg>
                <figcaption>南海诸岛</figcaption>
              </figure>
            )}

            <div className="tm-tools" role="group" aria-label="地图缩放">
              <button
                type="button"
                className="tm-tool-btn"
                onClick={() => applyZoom(zoom + ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                aria-label="放大地图"
              >
                <UiIcon name="plus" className="tm-tool-ico" />
              </button>
              <span className="tm-tool-pct">{zoomPercent}%</span>
              <button
                type="button"
                className="tm-tool-btn"
                onClick={() => applyZoom(zoom - ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                aria-label="缩小地图"
              >
                <UiIcon name="minus" className="tm-tool-ico" />
              </button>
              <button
                type="button"
                className="tm-tool-btn is-reset"
                onClick={resetView}
                disabled={zoom === MIN_ZOOM && pan.x === 0 && pan.y === 0}
                aria-label="复位地图"
              >
                <UiIcon name="reset" className="tm-tool-ico" />
              </button>
            </div>

            <ul className="tm-legend">
              <li className="tm-stat is-visited">
                <span className="tm-dot" aria-hidden="true" />
                <span className="tm-stat-label">我们去过</span>
                <strong>{stats.visited}</strong>
              </li>
              <li className="tm-stat is-wish">
                <span className="tm-dot" aria-hidden="true" />
                <span className="tm-stat-label">想去</span>
                <strong>{stats.wish}</strong>
              </li>
              <li className="tm-stat is-todo">
                <span className="tm-dot" aria-hidden="true" />
                <span className="tm-stat-label">还没去</span>
                <strong>{stats.todo}</strong>
              </li>
              <li className="tm-progress" aria-hidden="true">
                <span
                  className="tm-progress-fill"
                  style={{
                    width: `${
                      stats.total
                        ? Math.round((stats.visited / stats.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </li>
            </ul>
          </div>
        </section>

        <aside className="tm-side">
          {selected ? (
            <ProvinceAlbum
              key={selected.name}
              province={selected}
              album={normalizeAlbum(provincePhotos[selected.name])}
              onClose={() => setSelectedName(null)}
              onOpenAdmin={() => onNavigate?.("travel-admin")}
            />
          ) : (
            <RandomFrame
              pool={photoPool}
              onOpenAdmin={() => onNavigate?.("travel-admin")}
            />
          )}

          <section className="tm-recent reveal" style={{ "--i": 3 }}>
            <header className="tm-recent-head">
              <h4>最近足迹</h4>
              <span className="tm-recent-more">看看有没有落下的地方</span>
            </header>
            <ul className="tm-recent-list">
              {TRAVEL_RECENT.map((item) => {
                const cover = albumCover(recentAlbums[item.id]);
                return (
                  <li key={item.id} className="tm-recent-item">
                    <span
                      className="tm-thumb"
                      style={{
                        "--tone-a": item.tone[0],
                        "--tone-b": item.tone[1],
                      }}
                    >
                      {cover ? (
                        <img src={cover} alt={item.city} loading="lazy" />
                      ) : null}
                    </span>
                    <div className="tm-recent-text">
                      <strong>{item.city}</strong>
                      <em>{item.date}</em>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>

      {/* 照片管理入口：只在路由表里注册、不进导航，避免访客点进来 */}
      <footer className="tm-foot reveal" style={{ "--i": 4 }}>
        <span>照片只存在本机浏览器，访客看到的是默认内容。</span>
        <button
          type="button"
          className="tm-admin-entry"
          onClick={() => onNavigate?.("travel-admin")}
        >
          换照片
        </button>
      </footer>
    </div>
  );
}
