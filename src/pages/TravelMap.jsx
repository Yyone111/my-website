import { useEffect, useMemo, useState } from "react";
import UiIcon from "../components/UiIcon";
import {
  TRAVEL_LATEST,
  TRAVEL_PHOTOS,
  TRAVEL_PROVINCE_STATUS,
  TRAVEL_RECENT,
  TRAVEL_TONES,
} from "../data";
import { TRAVEL_PHOTOS_EVENT, readTravelConfig } from "../lib/travelPhotos";

/**
 * 旅行地图
 * - 左侧：按省份状态上色的中国地图（去过=渐变/照片拼贴，想去=描边，没去=留白）+ 足迹统计
 * - 右侧：最新足迹大图卡 + 最近足迹列表
 * - 照片优先取本机浏览器里配置好的（照片管理页写入），没有就用 data.js 的默认值
 * - 地图数据是离线投影抽稀好的静态 JSON（public/static/geo/china-provinces.json），
 *   页面加载后再取，不进主包
 */

const GEO_URL = "/static/geo/china-provinces.json";

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
  wish: "想带你去",
  todo: "还没去",
};

export default function TravelMap({ onNavigate }) {
  const [geo, setGeo] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [hovered, setHovered] = useState(null);
  // 本机浏览器里保存的照片配置（照片管理页写入），默认空对象
  const [localConfig, setLocalConfig] = useState(() => readTravelConfig());

  useEffect(() => {
    const refresh = () => setLocalConfig(readTravelConfig());
    window.addEventListener(TRAVEL_PHOTOS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(TRAVEL_PHOTOS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // 本地配置优先，没配置的省份仍用 data.js 里的默认照片表
  const provincePhotos = useMemo(
    () => ({ ...TRAVEL_PHOTOS, ...(localConfig.provinces || {}) }),
    [localConfig],
  );

  const latest = useMemo(
    () => ({ ...TRAVEL_LATEST, ...(localConfig.latest || {}) }),
    [localConfig],
  );

  const recent = useMemo(
    () =>
      TRAVEL_RECENT.map((item) => {
        const local = localConfig.recent?.[item.id];
        return local?.src ? { ...item, src: local.src } : item;
      }),
    [localConfig],
  );

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
    return geo.provinces.map((province) => ({
      ...province,
      status: "todo",
      ...(statusMap.get(province.name) || {}),
    }));
  }, [geo, statusMap]);

  // 统计数字直接从地图数据里数，永远和地图对得上
  const stats = useMemo(() => {
    const acc = { visited: 0, wish: 0, todo: 0 };
    provinces.forEach((province) => {
      acc[province.status] += 1;
    });
    return acc;
  }, [provinces]);

  const photoProvinces = useMemo(
    () => provinces.filter((province) => provincePhotos[province.name]?.src),
    [provinces, provincePhotos],
  );

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
                  href={provincePhotos[province.name].src}
                  preserveAspectRatio="xMidYMid slice"
                  width="1"
                  height="1"
                />
              </pattern>
            ))}
          </defs>

          <g className="tm-lands">
            {provinces.map((province) => {
              const isPhoto = Boolean(provincePhotos[province.name]?.src);
              const fill =
                province.status === "visited"
                  ? isPhoto
                    ? `url(#tmPhoto${province.name})`
                    : `url(#tmTone${province.toneIndex})`
                  : undefined;

              return (
                <path
                  key={province.name}
                  className={`tm-prov is-${province.status} ${
                    hovered?.name === province.name ? "is-hover" : ""
                  }`}
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
                />
              );
            })}
          </g>
        </svg>

        {geo.nanhai && (
          <figure className="tm-nanhai">
            <svg
              viewBox={geo.nanhai.viewBox}
              aria-hidden="true"
              focusable="false"
            >
              <path d={geo.nanhai.d} />
            </svg>
            <figcaption>南海诸岛</figcaption>
          </figure>
        )}

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
          <div className="tm-map-wrap">{renderMap()}</div>

          <ul className="tm-stats">
            <li className="tm-stat is-visited">
              <span className="tm-dot" aria-hidden="true" />
              <span className="tm-stat-label">我们去过的地方</span>
              <strong>{stats.visited}</strong>
            </li>
            <li className="tm-stat is-wish">
              <span className="tm-dot" aria-hidden="true" />
              <span className="tm-stat-label">想带你去的地方</span>
              <strong>{stats.wish}</strong>
            </li>
            <li className="tm-stat is-todo">
              <span className="tm-dot" aria-hidden="true" />
              <span className="tm-stat-label">还没去的地方</span>
              <strong>{stats.todo}</strong>
            </li>
          </ul>
        </section>

        <aside className="tm-side">
          <article className="tm-latest reveal" style={{ "--i": 2 }}>
            <div
              className="tm-latest-shot"
              style={{
                "--tone-a": latest.tone[0],
                "--tone-b": latest.tone[1],
              }}
            >
              {latest.src ? (
                <img src={latest.src} alt={latest.city} />
              ) : (
                <span className="tm-shot-hold">
                  <UiIcon name="camera" className="tm-shot-icon" />
                </span>
              )}
            </div>
            <div className="tm-latest-body">
              <h3>
                <UiIcon name="pin" className="tm-latest-pin" />
                {latest.city}
              </h3>
              <p className="tm-date">{latest.date}</p>
              <p className="tm-note">{latest.note}</p>
            </div>
          </article>

          <section className="tm-recent reveal" style={{ "--i": 3 }}>
            <header className="tm-recent-head">
              <h4>最近足迹</h4>
              <span className="tm-recent-more">查看全部</span>
            </header>
            <ul className="tm-recent-list">
              {recent.map((item) => (
                <li key={item.id} className="tm-recent-item">
                  <span
                    className="tm-thumb"
                    style={{
                      "--tone-a": item.tone[0],
                      "--tone-b": item.tone[1],
                    }}
                  >
                    {item.src ? (
                      <img src={item.src} alt={item.city} loading="lazy" />
                    ) : null}
                  </span>
                  <div className="tm-recent-text">
                    <strong>{item.city}</strong>
                    <em>{item.date}</em>
                  </div>
                </li>
              ))}
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
