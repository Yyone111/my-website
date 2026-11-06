/**
 * Supabase Storage 客户端（可选依赖，按需加载 + 登录鉴权）
 * - 在 .env.development 或 Render 环境变量里配好 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 才会启用
 * - 照片桶 travel-photos 设为公开读；写入仅限登录用户（supabase.auth 邮箱账号）
 * - 管理页上传前先「连接图床」登录；未登录时 uploadPhoto 会直接报错
 * - 会话按 supabase-js 默认持久化在本机 localStorage，登录一次可复用
 * - @supabase/supabase-js 为动态 import：普通访客不加载这份体积
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const PHOTO_BUCKET = "travel-photos";

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
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
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
    throw new Error(`上传到图床失败：${error.message || "请稍后重试"}`);
  }

  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}
