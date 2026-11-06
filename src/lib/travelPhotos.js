/**
 * 旅行照片配置（本地存储）
 * 管理页改完的配置存在浏览器 localStorage，旅行地图页读同一份并合并到 data.js 的默认值上。
 * 只在本机浏览器生效，不会影响访客看到的内容。
 *
 * 数据结构（每个影集位一条）：
 *   { photos: [src, ...], cover: 0, caption: "杭州 · 西湖" }
 * 兼容早期只存一张图的 { src } 写法，读取时统一归一化。
 */

const STORAGE_KEY = "yy:travel-photos:v1";
const UNLOCK_KEY = "yy:travel-admin-unlocked";
// 单张图片压缩后的体积上限，超了就拒绝，避免一次上传把配额吃光
const MAX_BYTES = 900 * 1024;
// 整份配置的安全水位：localStorage 一般 5MB，留出余量给站点其它数据
const MAX_STORE_BYTES = 3.6 * 1024 * 1024;

// 配置变更后通知同页/其它标签页重新读取
export const TRAVEL_PHOTOS_EVENT = "yy:travel-photos-updated";

export const EMPTY_TRAVEL_CONFIG = {
  provinces: {}, // { 浙江: { photos: [src], cover: 0, caption } }
  latest: null, // { photos: [src], cover: 0 }
  recent: {}, // { 1: { photos: [src], cover: 0 } }  键是 TRAVEL_RECENT 的 id
};

/* ---- 影集归一化 ---- */

/**
 * 把任意历史写法的照片配置收成 { photos, cover, caption }。
 * 没有任何有效图片时返回 null，调用方据此回落到默认值。
 */
export function normalizeAlbum(entry) {
  if (!entry) return null;

  const photos = Array.isArray(entry.photos)
    ? entry.photos.filter((src) => typeof src === "string" && src)
    : typeof entry.src === "string" && entry.src
      ? [entry.src]
      : [];

  if (photos.length === 0) return null;

  const rawCover = Number(entry.cover);
  const cover = Number.isFinite(rawCover)
    ? Math.min(Math.max(Math.trunc(rawCover), 0), photos.length - 1)
    : 0;

  return { photos, cover, caption: entry.caption || "" };
}

// 影集封面（地图、缩略图都只用这一张）
export function albumCover(entry) {
  const album = normalizeAlbum(entry);
  return album ? album.photos[album.cover] : "";
}

// 全部照片，用于随机相框
export function albumPhotos(entry) {
  const album = normalizeAlbum(entry);
  return album ? album.photos : [];
}

/* ---- 读写 ---- */

export function readTravelConfig() {
  if (typeof window === "undefined") return { ...EMPTY_TRAVEL_CONFIG };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_TRAVEL_CONFIG };
    const parsed = JSON.parse(raw);

    const provinces = {};
    Object.entries(parsed?.provinces || {}).forEach(([name, entry]) => {
      const album = normalizeAlbum(entry);
      if (album) provinces[name] = album;
    });

    const recent = {};
    Object.entries(parsed?.recent || {}).forEach(([id, entry]) => {
      const album = normalizeAlbum(entry);
      if (album) recent[id] = album;
    });

    return {
      provinces,
      latest: normalizeAlbum(parsed?.latest),
      recent,
    };
  } catch (error) {
    console.warn("读取旅行照片配置失败，已忽略:", error);
    return { ...EMPTY_TRAVEL_CONFIG };
  }
}

export function writeTravelConfig(config) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify(config);
  if (payload.length > MAX_STORE_BYTES) {
    throw new Error(
      "本地照片总量超限了。删几张旧照片，或改用 /static/img/ 下的图片路径。",
    );
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, payload);
    window.dispatchEvent(new CustomEvent(TRAVEL_PHOTOS_EVENT));
  } catch (error) {
    // 配额超了最可能是图片太大，交给调用方提示
    throw new Error(
      error?.name === "QuotaExceededError"
        ? "浏览器存储空间不足，请删掉几张旧照片，或先用链接形式引用。"
        : "保存失败，请稍后重试。",
      { cause: error },
    );
  }
}

export function resetTravelConfig() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(TRAVEL_PHOTOS_EVENT));
  } catch (error) {
    console.warn("清空旅行照片配置失败:", error);
  }
}

/* ---- 管理页解锁态（只在当前标签页有效，关掉就锁回去） ---- */

export function isAdminUnlocked() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(UNLOCK_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminUnlocked(unlocked) {
  if (typeof window === "undefined") return;
  try {
    if (unlocked) window.sessionStorage.setItem(UNLOCK_KEY, "true");
    else window.sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    // 隐私模式下 sessionStorage 可能不可写，忽略即可
  }
}

/* ---- 上传图片：压到可控体积再转 dataURL ---- */

const readAsDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取图片失败，请重试。"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("这张图片无法解析，换一张试试。"));
    };
    image.src = url;
  });

/**
 * 把用户选的文件压成 dataURL。
 * 按最长边等比缩放，并先铺一层白底再转 JPEG —— 否则 PNG 的透明区域会变成黑块。
 * 返回体积足够小、能塞进 localStorage 的字符串。
 */
export async function compressImageFile(file, options = {}) {
  const { maxDimension = 1000, quality = 0.68 } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件（jpg / png / webp）。");
  }

  const image = await loadImage(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight) || 1;
  const scale = Math.min(1, maxDimension / longest);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器不支持图片处理。");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  const dataUrl = blob ? await readAsDataUrl(blob) : canvas.toDataURL("image/jpeg", quality);

  if (dataUrl.length > MAX_BYTES) {
    throw new Error("图片压缩后仍然太大，请换一张更小的。");
  }

  return dataUrl;
}

/**
 * 批量压缩：逐张串行处理，任意一张失败不影响其它张。
 * 返回 { ok: string[], failed: string[] }，失败信息给管理页提示用。
 */
export async function compressImageFiles(files, options) {
  const ok = [];
  const failed = [];

  for (const file of files) {
    try {
      ok.push(await compressImageFile(file, options));
    } catch (error) {
      failed.push(`${file.name}：${error.message || "处理失败"}`);
    }
  }

  return { ok, failed };
}
