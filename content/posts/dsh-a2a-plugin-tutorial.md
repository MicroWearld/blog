+++
title = "给 DeepSeek Harness 装上 A2A 协议：两个插件的设计与实现"
date = 2026-09-03T09:00:00+08:00
summary = "给 DeepSeek Harness 装上 A2A 协议:两个独立插件(dsh-a2a-server / dsh-subagent-a2a)的设计与实现,全程复用官方 SDK、不动 agent-loop 一行核心代码。"
mode = "tutorial"
categories = ["学习记录"]
tags = ["dsh", "a2a", "插件", "deepseek-harness"]
series = ["与 AI 协作"]
series_order = 1
+++

DeepSeek Harness（DSH）支持把 agent 暴露成 ACP JSON-RPC stdio 服务，给 Zed 这类编辑器用；但它不支持 A2A（Agent2Agent），也就是没法作为一个**远程 agent 端点**被别的宿主调用。Hermes 的 A2A 平台想接 dsh 时，对面没有服务可连。结论先行：我们为它写了两个独立插件，`dsh-a2a-server`（把 DSH agent 暴露成标准 A2A 服务）和 `dsh-subagent-a2a`（让 DSH 能作为 A2A 客户端调用远程 agent），全程复用官方 `@a2a-js/sdk`，不动 agent-loop 一行核心代码。

本文讲这两件事：A2A 协议要接哪些面，DSH 的插件机制怎么接；以及过程中真正卡住人的那些坑——坑比功能更有信息量。

## A2A 协议要接哪些面

A2A v1.0 的模型是「AgentCard 发现 + Task 生命周期」。具体到代码：

- `GET /.well-known/agent.json` 返回 AgentCard：名字、能力、`supportedInterfaces`（端点 URL + JSONRPC 绑定 + 协议版本），调用方靠它发现你、读你的能力扩展。
- `POST /a2a` 走 JSON-RPC 2.0，方法名是 `SendMessage`、`SendStreamingMessage`、`GetTask`、`ListTasks`、`CancelTask`（v0.3 的旧方法名在 SDK 的可选 `compat/v0_3` 层，别混）。
- Task 状态机：`SUBMITTED → WORKING → COMPLETED / FAILED / CANCELED`，中间还能插入 `INPUT_REQUIRED`（agent 需要人拍板）。流式走 SSE，事件序列形如 `SUBMITTED → WORKING → artifactUpdate → COMPLETED`。

协议本身不复杂。复杂的是把 Task 映射到 DSH 自己的 Session/Agent 生命周期上——这层映射是 `a2a-server` 的全部价值。

## 两个插件的分工

### dsh-a2a-server：出向，DSH 变成 A2A 服务

一个 A2A Task 对应一次 DSH Session/Agent 运行：Task 创建时把配置的 `agentPreset` 写进 session 的 `meta.agentPreset`，agent setup 阶段 `ctx.agentPresets.mount(agentCtx, preset)`，于是远程来的请求就用你指定的工具集和 system prompt 干活。生产化补了四样：

- **Bearer token 认证**：`Authorization: Bearer`，AgentCard 保持公开便于发现；
- **Task TTL 清理**：终态 Task 超时自动 dispose，不长期占 agent/session；
- **Prometheus `/metrics`**：`dsh_a2a_requests_total`、`dsh_a2a_active_tasks` 这类计数；
- **Task 文件持久化**：`persistTasks: true` 时挂 `FileTaskStore` 落盘 JSON，重启可恢复（要求组合里挂 `sessionPersistence`，否则启动直接报错）。

还有一个必须处理的面：**approval**。bridge 持有的 agent 触发 `approval/request` 时不能自动批准，而是发布 `TASK_STATE_INPUT_REQUIRED` 挂起 Task；客户端在同一 Task 上发 follow-up 消息，按文本解析决策——`allow/approve/yes` → `allowed-once`，其余一律 `rejected`（安全默认）。`CancelTask` 会把 pending approval 解析成 `cancelled`，避免悬挂。

preset 的选择做成三层优先级：请求 `params.metadata.agentPreset`（兼容别名 `preset`）＞ 全局 `config.agentPreset` ＞ DSH 默认。为了让调用方**知道**有这个能力，AgentCard 的 `capabilities.extensions` 里声明 preset 扩展，写明 metadata 键、别名、可用列表和默认值。

### dsh-subagent-a2a：入向，DSH 去调远程 agent

在 `ctx.subagents` 上注册一个 provider：给定一个 A2A 端点 URL，发现 AgentCard，发 prompt，把返回的 artifact 映射成 DSH 的 `SubagentResult`。互操作 e2e 的断言很朴素：本地起一个 `examples/a2a-agent`，让 subagent 调它，要求「Reply with exactly the word PONG」，断言 `stopReason === 'completed'` 且输出含 `PONG`。全链路真实模型跑完约 2 秒。

## 独立插件的装配

两个插件最初在 DSH 源码仓库里以 `@deepseek-ai/dsh-*` 存在；要发布成独立插件，有几条硬约束：

- 包名不用 `@deepseek-ai`（那是官方命名空间），也不用任何第三方 scope；
- 依赖只允许 DSH 官方包（`@deepseek-ai/dsh-*`、`cordis`、`schemastery` 等运行时）加 `@a2a-js/sdk`；
- 提供 Windows 构建脚本 `build.ps1`（自动探测 `DSH_CHECKOUT`、建 node_modules junction、调 checkout 的 tsc + tsdown 打自包含 bundle）。

装配走 DSH 官方命令，一条就够：

```powershell
dsh plugin --profile desktop add .\dsh-a2a-server\
```

插件目录里 `cordis.patch.yml` 声明插入的组件。**最容易栽的坑**：DSH 的 bundle 装载器直接找包根目录的 `index.js`，而打包产物在 `lib/index.js`——不补根入口就报 `Cannot find package ...\index.js`。两个仓库都要在根放一行转发：

```js
export * from './lib/index.js'
```

## 坑单（按杀伤力排序）

**1. pnpm 被宿主劫持。** 本机的 `pnpm` 是 DSH Desktop 的 runtime shim，`pnpm install` 会触发 Desktop 并报「拒绝访问」。解法是用 Node 直接调 Desktop 内置的真实 pnpm：`node "…/resources/app.asar.unpacked/node_modules/pnpm/bin/pnpm.mjs"`。POC 阶段近半时间耗在这。

**2. schemastery 空对象坑。** config schema 里 `auth` 是 object，字段缺失时 schemastery 会实例化成 `{}`，旧代码看到 `auth !== undefined` 就要求认证，于是没配认证的 fixture 启动报错「auth is configured but no bearer token」。修法是把判定改成显式检查 token 字段：

```ts
if (auth === undefined || (auth.token === undefined && auth.tokenEnv === undefined)) {
  return undefined
}
```

**3. role 字段不归一化会变成 UNRECOGNIZED。** SDK 的枚举要求 `ROLE_USER`/`ROLE_AGENT`，直接传 `"user"` 进 Task history 会得到 `"UNRECOGNIZED"`。HTTP 入口要做递归归一化。

**4. 同一份 Task 状态，两种表示。** 原始 SSE 里 `state` 是字符串 `"TASK_STATE_COMPLETED"`；SDK client 解出来却是数字枚举 `"state": 3`。断言写错一头就挂——测试必须对齐你断言的是哪一层。

**5. `ListTasks` 的 `status: 0` 不是「不限」。** 0 是 `TASK_STATE_UNSPECIFIED`，SDK 的 InMemoryTaskStore 把它当精确过滤条件，结果一个 Task 都列不出来。要列已完成的就显式传 `TaskState.TASK_STATE_COMPLETED`。

**6. 插件代码改了要重启宿主。** 没有热重载：`lib/index.js` 重建后，运行中的 DSH Desktop 仍跑旧代码，`metadata.agentPreset` 看着没生效，其实只是没加载新 bundle。重启即好。

**7. AgentCard 的启动时序。** preset 列表若在插件启动时生成，而 `agentPresets` 服务还没就绪，读到空数组。改成**每次请求 AgentCard 时动态读取**即可。

## 权衡：官方 SDK 还是手写协议层

这是设计阶段唯一值得争论的点，最后用决策矩阵 + POC 前置门解决：评估维度是 ESM 兼容、strict TypeScript、体积、协议跟进、维护成本；P0 先在独立目录装 `@a2a-js/sdk` 验证它能否与 DSH 的 tsx/ESM 构建链共存——类型检查过了、Node 24 原生 TS 跑通了、`ClientFactory.createFromAgentCard()` 能建 client，才决定复用。结论是官方 SDK 值得用：方法名、状态机、client/server 骨架都齐，自己手写协议层只会把时间花在重造轮子上。

两个插件的完整代码在 [github.com/MicroWearld/dsh-a2a-server](https://github.com/MicroWearld/dsh-a2a-server) 和 [github.com/MicroWearld/dsh-subagent-a2a](https://github.com/MicroWearld/dsh-subagent-a2a)。装好插件、重启宿主后，`curl http://127.0.0.1:4123/.well-known/agent.json` 能拿到 AgentCard，这篇就算读完了。
