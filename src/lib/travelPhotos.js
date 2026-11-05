/**
 * 旅行照片配置（本地存储）
 * 管理页改完的配置存在浏览器 localStorage，旅行地图页读同一份并合并到 data.js 的默认值上。
 * 只在本机浏览器生效，不会影响访客看到的内容。
 */

const STORAGE_KEY = "yy:travel-photos:v1";
const UNLOCK_KEY = "yy:travel-admin-unlocked";
// 本地上传的图片转成 dataURL 后体积会膨胀，超过这个长度就不落盘了
const MAX_BYTES = 4.5 * 1024 * 1024;

// 配置变更后通知同页/其它标签页重新读取
export const TRAVEL_PHOTOS_EVENT = "yy:travel-photos-updated";

export const EMPTY_TRAVEL_CONFIG = {
  provinces: {}, // { 浙江: { src, caption } }
  latest: null, // { src, city?, date?, note? }
  recent: {}, // { 1: { src } }  键是 TRAVEL_RECENT 的 id
};

/* ---- 读写 ---- */

export function readTravelConfig() {
  if (typeof window === "undefined") return { ...EMPTY_TRAVEL_CONFIG };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_TRAVEL_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      provinces: parsed?.provinces || {},
      latest: parsed?.latest || null,
      recent: parsed?.recent || {},
    };
  } catch (error) {
    console.warn("读取旅行照片配置失败，已忽略:", error);
    return { ...EMPTY_TRAVEL_CONFIG };
  }
}

export function writeTravelConfig(config) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(TRAVEL_PHOTOS_EVENT));
  } catch (error) {
    // 配额超了最可能是图片太大，交给调用方提示
    throw new Error(
      error?.name === "QuotaExceededError"
        ? "浏览器存储空间不足，请换小一点的图片，或先用链接形式引用。"
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

/* ---- 上传图片：压缩到可控体积再转 dataURL ---- */

/**
 * 把用户选的文件压成 dataURL。
 * 地图上每个省份是一小块拼贴，宽度 900 已经够清晰，体积能压到几十 KB，
 * 避免几张原图就把 localStorage 撑爆。
 */
export function fileToDataUrl(file, maxWidth = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件（jpg / png / webp）。"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取图片失败，请重试。"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("这张图片无法解析，换一张试试。"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("当前浏览器不支持图片处理。"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl.length > MAX_BYTES) {
            reject(new Error("图片压缩后仍然太大，请换一张更小的。"));
            return;
          }
          resolve(dataUrl);
        } catch (error) {
          reject(new Error("图片转换失败，请换一张试试。", { cause: error }));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
