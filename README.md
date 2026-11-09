# 个人主页（HomePage）

React 19 + Vite 7 的个人主页，含首页、作品、技能、关于、联系与「旅行地图」（#/travel）等页面。部署在 Render，代码托管在 GitHub。

```bash
npm install     # 安装依赖
npm run dev     # 本地开发（默认 http://localhost:5173）
npm run build   # 生产构建
```

---

## 旅行照片的两种存储模式

照片（地图省份拼贴、随机相框、最近足迹）支持两种存储方式，二选一，不影响其它页面：

| 模式                 | 照片存在哪                             | 谁能看到                   | 何时使用                                                        |
| -------------------- | -------------------------------------- | -------------------------- | --------------------------------------------------------------- |
| **本机模式（默认）** | 浏览器 localStorage                    | 只有你这台设备             | 未配置 Supabase 时自动使用；私密照片请用本模式                  |
| **图床模式**         | Supabase 公开桶                        | 所有知道链接的人           | 想让自己上传的照片对访客可见时启用                              |
| **图床 + 共享清单**  | 照片在公开桶，清单在 Supabase Postgres | 全站所有设备、清缓存后仍在 | 完成第 3.5 步建表后即可：你上传一次，任何访客在任何设备都能看到 |

启用图床是**可选**的。不配置 Supabase，站点完全按本机模式运行。

> ⚠️ 隐私提示：图床是「公开桶」——只要拿到图片链接就能打开，不只是你网站的访客。
> **私密照片禁止传图床**，留在本机模式即可（照片不会进 GitHub，也不会进 Supabase）。

---

## 启用 Supabase 图床（一次性配置）

共 5 步，全程约 10 分钟。前 4 步在 [supabase.com](https://supabase.com) 网页端完成，第 5 步在本地和 Render。

### 第 1 步：新建 Supabase 项目并复制凭据

1. 打开 [supabase.com](https://supabase.com) → 用 GitHub 登录 → **New project**。
2. 填名称（随意，如 `homepage-photos`），记住 **Database Password**（数据库主密码，本文用不到，存好即可）；区域选就近的（国内选新加坡、东京等）。
3. 等待项目初始化（约 1 分钟）。
4. 进入项目 → 左侧 **Settings → API**，复制两个值，稍后要用：
   - **Project URL**：形如 `https://abcdefgh.supabase.co`
   - **Project API keys → anon public**：形如 `eyJhbGciOiJIUzI1NiIs...`
   - ✅ 就复制 anon public 那一个；**不要**用 `service_role`（它有完全权限，绝不能进前端/仓库）。

### 第 2 步：建公开桶 + 建登录账号

1. 左侧 **Storage → New bucket**：
   - 名称填：**`travel-photos`**（默认桶名；如果你在建桶时用了其它名字，需在环境变量 `VITE_SUPABASE_BUCKET` 里保持一致，见第 4/5 步）
   - **Public bucket ✔ 勾选**，其余保持默认 → Create。
2. 左侧 **Authentication → Users → Add new user**：
   - 填你自己的**邮箱 + 密码**（这份文件之后存到你 .env.local 的邮箱登录时用，**密码自己保管，不要提交到任何仓库**）。
3. 回到 **Storage → travel-photos → 上方 Policies**，确认能看到一条默认的公开可读策略。

### 第 3 步：SQL Editor 执行上传策略

左侧 **SQL Editor → New query**，粘贴下面整段 SQL → **Run**：

```sql
-- 进入仅登录用户：先删掉（如果建过）“任何人可传”的匿名策略
drop policy if exists "guest insert" on storage.objects;

-- 插入：仅登录用户才能上传，并限制单张 <5MB、文件名 <100 字符
create policy "owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'travel-photos'
    and octet_length(coalesce(metadata->>'size', '0'))::int < 5242880
    and length(name) < 100
  );

-- 删除：作者可删除自己桶里的文件（备用）
create policy "owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ownwebImages');
```

### 第 3.5 步：建「共享照片清单」表（可选但强烈建议）

只传图床、不建这张表，照片文件会一直在 Supabase，但"哪张照片贴到哪个省"的清单只存在你浏览器的 localStorage——**清缓存/换设备/别的访客就看不到了**。建了这张表后，管理页保存时会把清单同步到 DB，全站访客都能读到。

SQL Editor 里再执行这一段：

```sql
create table if not exists public.travel_photos (
  id bigint generated always as identity primary key,
  slot_type text not null,          -- 'province' | 'latest' | 'recent'
  slot_key text not null,           -- 省份名 / 'latest' / 最近足迹 id
  photos jsonb not null default '[]'::jsonb,
  cover int not null default 0,
  caption text not null default '',
  date text not null default '',    -- 拍摄时间（可选），最近足迹按它排序
  updated_at timestamptz not null default now(),
  unique (slot_type, slot_key)
);

-- 已经建过这张表的只跑下面这一句补列即可：
-- alter table public.travel_photos add column if not exists date text not null default '';

alter table public.travel_photos enable row level security;

-- 读取：任何访客（含匿名）都能读到照片清单
create policy "travel_photos read" on public.travel_photos
  for select using (true);

-- 写入：仅登录用户（图床管理员）
create policy "travel_photos admin insert" on public.travel_photos
  for insert to authenticated with check (true);

create policy "travel_photos admin update" on public.travel_photos
  for update to authenticated using (true);

create policy "travel_photos admin delete" on public.travel_photos
  for delete to authenticated using (true);
```

顺带说明：公开桶本身自带"匿名可读"，**无需**再建 select 策略。

### 第 4 步：本地写入 `.env.local`

1. 复制仓库里的模板为本地私有文件（此文件已被 `.gitignore` 忽略，**不会提交到 GitHub**）：

   ```bash
   # Windows PowerShell
   Copy-Item .env.local.example .env.local
   ```

2. 打开 `.env.local`，填上第 1 步的两个值（`sb_publishable_...` 这类新格式 publishable key 也可以直接填）；若桶名不是默认的 `travel-photos`，再加一行 `VITE_SUPABASE_BUCKET`：

   ```
   VITE_SUPABASE_URL=https://你的项目.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_你的publishable-key
   VITE_SUPABASE_BUCKET=ownweblmages   # 可选，默认 travel-photos
   ```

3. **重启 dev server**（`.env` 变更需要重启才生效）：停掉 `npm run dev`，再重新 `npm run dev`。
   ⚠️ 同时确认仓库里的 `.env.development` **没有**留空的 `VITE_SUPABASE_*` 占位——Vite 加载顺序
   `.env.local` → `.env.development`，后加载的会覆盖前面，空占位会把你的真实值冲成空。
   （当前仓库版本已删掉占位，只有 `/api` 那两行。）
4. 打开 `http://localhost:5173/#/travel-admin`，输入站点管理密码解锁后，页面顶部会出现「**连接图床**」面板：
   - 输入第 2 步建的邮箱 + 密码 → 连接成功变为「图床已连接」。
   - （如果没有这个面板，说明 env 没生效，见文末排错。）

### 第 5 步：本地上传一张验证 + Render 部署

1. 连接图床后，给任意省份「上传本地图片」；成功后影集里会出现一张图，其地址是
   `https://<项目>.supabase.co/storage/v1/object/public/<你的桶名>/photos/...` 即为成功。
2. 再做一次「保存」（随便改点东西，如给照片填 caption 再保存）——如果已执行第 3.5 步建表，
   清单会同步到 `travel_photos` 表：之后刷新地图、换设备、清缓存，照片都还在，访客也能看到。
3. **Render 面板**：服务 → **Environment**，新增变量（值同第 1 步；桶名与第 2 步建的一致时 `VITE_SUPABASE_BUCKET` 不用加，否则按实际桶名填）：
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_SUPABASE_BUCKET=...
   ```
   Render 构建时 Vite 会读取这类 `VITE_` 前缀变量并打进产物，不需要提交仓库。
4. 点 **Deploy / Manual Deploy → Clear build cache & deploy** 重新部署。
5. 部署完成后访问线上 `#/travel-admin`，同样流程验证一次上传即可。

> ⚠️ anon public key 与 Project URL 本来就是公开给前端的，提交进 GitHub 也不构成风险；
> 真正需要保密的只有：Supabase 登录账号密码（不提交）、service_role / JWT 密钥（本项目从未使用）。

---

## 常见问题排查

**解锁管理页后没有「连接图床」面板**
→ 1) 检查 `.env.local` 是否真的填了值并**重启 dev server**；
→ 2) 检查 `.env.development` 里有没有空的 `VITE_SUPABASE_*` 占位（空占位会覆盖本地配置，把它删掉）；
→ 3) 在浏览器 DevTools 的 Application → Local Storage 搜 `supabase`，若有旧会话可清掉再试。

**点上传提示「尚未连接图床」**
→ 先在上方面板用 Supabase 账号登录；确认第 2 步确实创建了 Authentication 用户。

**登录提示「邮箱或密码不对」**
→ 在 Supabase 控制台 Authentication → Users 里确认账号已建、状态正常；密码用 Add user 时设置的密码。

**上传报 HTTP 40x**
→ 常见原因：桶名不是 `travel-photos`（改代码或改名）；第 3 步策略未执行；上传时未登录。按顺序核对第 2、3 步。

**上传提示「上传被图床权限策略拦下了 / new row violates row-level security policy」**
→ 1) 上传前页面顶部必须是「图床已连接」（绿色小圆点），先登录再传；
→ 2) 你实际建的桶名如果不是 `travel-photos`，把第 3 步 SQL 里的 `bucket_id = 'travel-photos'` 改成你的桶名重新执行（如 `'ownweblmages'`）；
→ 3) 生产（Render）环境变量确认加了 `VITE_SUPABASE_BUCKET=<你的桶名>` 并重新部署；登录时间久了失效时，先「断开连接」再重新「连接图床」。

**图片能上传但加载慢**
→ 图床图像走 Supabase CDN；对个人站免费额度（1GB 存储 + 2GB 传出/月）通常够用。若将来被大量引用消耗流量，再考虑私有桶或 Cloudflare 套缓存。
