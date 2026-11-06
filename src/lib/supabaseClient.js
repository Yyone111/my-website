/**
 * Supabase Storage 客户端（可选依赖，按需加载 + 登录鉴权）
 * - 在 .env.development 或 Render 环境变量里配好 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 才会启用
 * - 照片桶 travel-photos 设为公开读；写入仅限登录用户（supabase.auth 邮箱账号）
 * - 管理页上传前先「连接图床」登录；未登录时 uploadPhoto 会直接报错
 * - 会话按 supabase-js 默认持久化在本机 localStorage，登录一次可复用
 * - @supabase/supabase-js 为动态 import：普通访客不加载这份体积
 */
import { normalizeAlbum } from "./travelPhotos";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// 照片桶名可配置；默认 travel-photos，想换桶就在 .env.local / Render 里设 VITE_SUPABASE_BUCKET
const PHOTO_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "ownwebImages";
// 全站共享的照片清单表（省→照片 URL），见 README 建表 SQL
const CONFIG_TABLE = "travel_photos";

let client = null;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function getClient() {
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

/** 当前是否有有效登录会话（用于管理页初始渲染判断） */
export async function getStorageSession() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** 用邮箱密码登录图床，失败抛中文错误 */
export async function signInToStorage(email, password) {
  const supabase = await getClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) {
    throw new Error(
      error?.message?.includes("Invalid login credentials")
        ? "图床登录失败：邮箱或密码不对。"
        : `图床登录失败：${error.message || "请稍后重试"}`,
    );
  }
  return data.session?.user?.email || email.trim();
}

/** 退出图床登录 */
export async function signOutStorage() {
  if (!isSupabaseConfigured()) return;
  const supabase = await getClient();
  await supabase.auth.signOut();
}

/**
 * 上传一张图片到公开桶，返回公开 URL。
 * 需要先登录（signInToStorage）。失败会抛出带中文提示的错误。
 */
export async function uploadPhoto(blob, filename) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "尚未配置 Supabase（缺 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY）。",
    );
  }

  const supabase = await getClient();
  let session = (await supabase.auth.getSession()).data.session;

  // 会话即将过期时先刷新，避免拿旧 token 上传被 RLS 拒绝
  if (session) {
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    if (expiresAt - Date.now() < 5 * 60 * 1000) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session || session;
    }
  }
  if (!session) {
    throw new Error("尚未连接图床，请先在上方「连接图床」登录后再上传。");
  }

  const ext =
    (filename.split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const path = `photos/${month}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType: blob.type || "image/jpeg",
    });

  if (error) {
    const detail = error.message || "";
    if (/row-level security policy/.test(detail)) {
      throw new Error(
        "上传被图床权限策略拦下了：请检查 Supabase 上传策略里的桶名是否和 VITE_SUPABASE_BUCKET（或默认 travel-photos）一致，并重新「连接图床」后再试。",
      );
    }
    if (/401|403|expired|refresh token/i.test(detail)) {
      throw new Error("图床登录已失效，请重新「连接图床」后再上传。");
    }
    throw new Error(`上传到图床失败：${detail || "请稍后重试"}`);
  }

  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * 读取全站共享的照片清单（表 travel_photos）。
 * 未配置图床 / 读取失败 / DB 里没有数据时返回 null，调用方回落本地配置。
 */
export async function readSharedConfig() {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await getClient();
    const { data, error } = await supabase
      .from(CONFIG_TABLE)
      .select("slot_type, slot_key, photos, cover, caption");
    if (error) {
      console.warn("读取共享照片配置失败:", error.message);
      return null;
    }

    const config = { provinces: {}, latest: null, recent: {} };
    for (const row of data || []) {
      const photos = Array.isArray(row.photos)
        ? row.photos.filter((src) => typeof src === "string" && src)
        : [];
      if (photos.length === 0) continue;
      const album = {
        photos,
        cover: Number.isInteger(row.cover) && row.cover >= 0 ? row.cover : 0,
        caption: typeof row.caption === "string" ? row.caption : "",
      };
      if (row.slot_type === "latest") {
        config.latest = album;
      } else if (row.slot_type === "recent") {
        config.recent[row.slot_key] = album;
      } else {
        config.provinces[row.slot_key] = album;
      }
    }
    return config;
  } catch (error) {
    console.warn("读取共享照片配置异常:", error.message || error);
    return null;
  }
}

/**
 * 把当前照片清单全量同步到表 travel_photos（删旧行再插入）。
 * 需要已登录图床；未登录 / 未配置时返回原因对象，由调用方提示。
 * 返回 { ok: boolean, reason?: string }
 */
export async function pushSharedConfig(config) {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }
  const supabase = await getClient();
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    return { ok: false, reason: "not-connected" };
  }

  const rows = [];
  Object.entries(config.provinces || {}).forEach(([name, entry]) => {
    const album = normalizeAlbum(entry);
    if (album) {
      rows.push({
        slot_type: "province",
        slot_key: name,
        photos: album.photos,
        cover: album.cover,
        caption: album.caption,
      });
    }
  });
  const latest = normalizeAlbum(config.latest);
  if (latest) {
    rows.push({
      slot_type: "latest",
      slot_key: "latest",
      photos: latest.photos,
      cover: latest.cover,
      caption: latest.caption,
    });
  }
  Object.entries(config.recent || {}).forEach(([id, entry]) => {
    const album = normalizeAlbum(entry);
    if (album) {
      rows.push({
        slot_type: "recent",
        slot_key: id,
        photos: album.photos,
        cover: album.cover,
        caption: album.caption,
      });
    }
  });

  // 全量替换（单人操作，不会有并发冲突）
  const { error: delError } = await supabase
    .from(CONFIG_TABLE)
    .delete()
    .gte("id", 0);
  if (delError) return { ok: false, reason: delError.message };

  if (rows.length > 0) {
    const { error: insError } = await supabase.from(CONFIG_TABLE).insert(rows);
    if (insError) return { ok: false, reason: insError.message };
  }

  return { ok: true };
}
