# 接口文档

## 1. 统一返回格式（推荐）

后端所有接口建议统一使用以下响应结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "traceId": "a1b2c3d4e5f6g7h8",
  "timestamp": 1713859200000
}
```

字段定义：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `code` | `number` | 是 | 业务状态码。`0` 表示成功，非 `0` 表示失败 |
| `message` | `string` | 是 | 响应描述。成功建议 `ok`，失败返回错误说明 |
| `data` | `object \| array \| null` | 是 | 业务数据。失败时建议为 `null` |
| `traceId` | `string` | 建议是 | 请求链路 ID，便于日志排查 |
| `timestamp` | `number` | 建议是 | 服务端响应时间戳（毫秒） |

统一约定：

- HTTP 状态码表达协议层结果：`200/400/401/403/404/429/500`
- `code` 表达业务结果，前端优先判断 `code === 0`
- 任何失败响应都返回同样结构，避免前端分支过多

### 1.1 成功响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "reply": "你好，我是你的站点助手，可以帮你介绍项目和功能。"
  },
  "traceId": "chat-20260423-0001",
  "timestamp": 1776902400000
}
```

### 1.2 失败响应示例

```json
{
  "code": 1001,
  "message": "invalid request: message is required",
  "data": null,
  "traceId": "chat-20260423-0002",
  "timestamp": 1776902400100
}
```

### 1.3 业务错误码建议

| code | 场景 | 建议 HTTP 状态码 |
|---|---|---|
| `0` | 成功 | `200` |
| `1001` | 参数校验失败 | `400` |
| `1002` | 未认证/Token 无效 | `401` |
| `1003` | 无权限 | `403` |
| `1004` | 资源不存在 | `404` |
| `1005` | 请求过于频繁 | `429` |
| `1500` | 服务内部异常 | `500` |

## 2. 聊天接口

- **接口名称**：AI 聊天
- **请求方式**：`POST`
- **接口路径**：`/api/chat`
- **Content-Type**：`application/json`

### 2.1 请求参数

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `message` | `string` | 是 | 当前用户输入内容 |
| `history` | `array` | 否 | 历史消息列表，用于上下文 |

`history` 数组元素结构：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `role` | `string` | 是 | 角色，取值建议：`user` / `assistant` |
| `text` | `string` | 是 | 消息内容 |

### 2.2 请求示例

```json
{
  "message": "你好，介绍一下你自己",
  "history": [
    {
      "role": "assistant",
      "text": "你好，我是站点 AI 助手。你可以先告诉我你想了解的内容。"
    },
    {
      "role": "user",
      "text": "你好，介绍一下你自己"
    }
  ]
}
```

### 2.3 响应参数

`data` 字段结构：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `reply` | `string` | 是 | AI 回复文本 |

### 2.4 成功响应示例（统一格式）

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "reply": "你好，我是你的站点助手，可以帮你介绍项目和功能。"
  },
  "traceId": "chat-20260423-0010",
  "timestamp": 1776902401000
}
```

### 2.5 失败响应示例（统一格式）

| HTTP 状态码 | 场景 | 建议返回示例 |
|---|---|---|
| `400` | 参数错误 | `{"code":1001,"message":"invalid request","data":null}` |
| `429` | 请求过于频繁 | `{"code":1005,"message":"too many requests","data":null}` |
| `500` | 服务内部异常 | `{"code":1500,"message":"internal error","data":null}` |

## 3. 前端联调说明

当前前端请求写法为：

- `CHAT_API_ENDPOINT = "/api/chat"`

开发环境请确保以下任一方式成立：

1. 前端通过 Vite 代理转发 `/api` 到后端服务地址（推荐）。
2. 前端改为后端完整地址（例如：`http://localhost:8080/api/chat`）。

## 4. 后端实现约定（建议）

- Controller 路由：`/api/chat`
- 方法：`POST`
- 返回统一 JSON 结构：`code/message/data/traceId/timestamp`
- 编码：UTF-8
- 超时建议：10~30 秒（视模型响应时间调整）
