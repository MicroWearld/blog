+++
title = "从一句模糊需求到两个插件：和 dsh 跨周攻坚 A2A 的记录"
date = 2026-09-03T10:00:00+08:00
summary = "从一句拼错的需求到两个发布在 GitHub 的插件:一篇关于和 dsh 跨周攻坚 A2A 的协作方法记录,不是流水账。"
mode = "note"
categories = ["项目工作"]
tags = ["dsh", "a2a", "ai协作", "复盘"]
series = ["与 AI 协作"]
series_order = 2
+++

故事的起点只有一句话，还是一个拼错的词：

> deepseek harness a2a proctol

没有文档、没有验收标准、没有截止日期。一周多之后，这条消息长成了两个发布在 GitHub 上的独立插件，中间夹着一次被我自己砍掉的半成品。这篇记录我作为「甲方」和 dsh 这个 agent 一起把一件模糊的事做实的全过程——不是流水账，是协作方法。

## 第一阶段：不写代码，先写方案

dsh 先做的动作值得抄：它没有动手，而是去仓库里查证——DSH 有 ACP（给 Zed 的 stdio 协议）、有自定义 JSON-RPC SDK、有 Hook protocol，就是没有 A2A。然后把「能做哪几件事」列成选项让我挑：实现 server、实现 client、都做、或先出设计方案。

我选了先出设计方案。于是有了 v1：目标、架构、复用哪些现有 seam（`ctx.agents`、`ctx.sessions`、`ctx.subagents`、`ctx.webServer`）、参考 ACP bridge 但独立设计生命周期。

然后我干了整件事里最重要的一步：**审方案，不给代码意见，给工程意见**。我提了九点，大意是：

- 依赖选型不能写「优先评估官方 SDK，若冲突则手写」这种话——要有决策矩阵和明确的 POC 前置门；
- AgentCard 要补多 skill 配置示例；
- Task 持久化要分清「默认内存态、重启丢失」和「扩展路径挂 sessionPersistence」；
- 长任务恢复、`submitted` 状态重启后怎么办，要提前想。

dsh 没有争辩，整理成修订清单，出 v2，并落成仓库内的 **proposed Agent Note**：中英双语各一份，加 i18n sidecar，hash 校验同步。这个动作后来被证明是整次协作里回报最高的习惯——每阶段的决策和结论都留在了仓库里，而不是在对话里蒸发。

## Phase 0：用 POC 给架构争论画句号

「用官方 `@a2a-js/sdk` 还是手写协议层」是设计阶段唯一的真分歧。方案里写的解法是：先做 POC，验证 SDK 能不能跟 DSH 的 ESM/strict TS/tsx 构建链共存，通过了才用。

POC 目录叫 `poc/a2a-sdk-poc`。过程比预想曲折：npm 沙箱里禁用 lifecycle scripts（SDK 本身无 postinstall，侥幸）；`tsx` 因 esbuild 在沙箱跑不了，需要完整主机访问；`pnpm --dir poc/... start` 会触发 DSH Desktop 的自动 install 流程然后拒绝访问——**本机的 pnpm 是 Desktop 的 runtime shim**，这是第一个真坑，解法是用 Node 直接调 Desktop 内置的真实 pnpm。

POC 结论干净利落：`tsc --noEmit --strict` 过、Node 24 原生 TS 跑通、`SendMessage`/`SendStreamingMessage` 在进程内通过 `DefaultRequestHandler` + `JsonRpcTransportHandler` 验证、`ClientFactory.createFromAgentCard()` 能建 client。写进 Agent Note 的 P0 结论只有一句话：复用官方 SDK。

## Phase 1–3：server、client、生产化，每阶段一个验收门槛

实现被切成三个阶段，每阶段都以「能跑的 e2e」收尾：

- **Phase 1 `a2a-server`**：AgentCard + JSON-RPC + SSE 流式，Task 映射 DSH Session。验收是真实模型会话——我亲自 curl `SendMessage`，返回 `TASK_STATE_COMPLETED` 带 artifact；流式事件序列 `SUBMITTED → WORKING → artifactUpdate → COMPLETED`。顺带修了 role 归一化：不转就是 `UNRECOGNIZED`。
- **Phase 2 `subagent-a2a`**：client provider，验收是互操作 e2e——本地起一个 a2a-agent，让 subagent 调它回 `PONG`，约 2 秒。
- **Phase 3 生产化**：bearer 认证、TTL 清理、`/metrics`、Task 文件持久化、`INPUT_REQUIRED` 映射，每个都配独立端口的 fixture e2e。协议兼容性测试用官方 SDK client 驱动真实服务，修了两个断言坑：SSE 里 `state` 是字符串、SDK 解出来是数字枚举 `3`；`ListTasks` 传 `status: 0` 等于精确过滤空结果。

我们的验收纪律：**我负责跑带 key 的 e2e**（dsh 无 key 时只能看自动跳过），跑挂了就把完整输出贴回去，它定位、修、让我重跑。`input-required` 那条 e2e 实测 43 秒含一次 retry——它老实标注了 retry，而不是假装一次过。

## 变成独立插件：约束比功能更难

实现全绿之后，我提了产品化要求：做成独立插件，别用 `@deepseek-ai` 命名空间，也别引入任何第三方 scope，依赖只准 DSH 官方加 `@a2a-js/sdk`，Windows 要有 `build.ps1`。

约束逐条落地：包名改无 scope、`cordis.patch.yml` 声明装配、根目录补 `index.js` 转发（DSH 装载器只找根入口，这是又一个坑）、两个仓库建 git 并推 GitHub。最后我做了产品经理该做的确认：README 的安装一节改成官方装配命令，让后来人照抄就能装。

## 砍掉的项目也要记录

中途我还提过一个 web 面板插件（开关 A2A + 监视状态）。做到一半我反悔了——理由和代码无关，是范围：那东西该属于宿主 UI 层，不该以插件形态膨胀。于是让 dsh 清空整个目录，并且**把记忆退回项目刚被提出时的状态**：删掉所有实现进度的记忆条目，只留最初那条需求。

这个动作的意义在于：Agent 的记忆是有状态的，你砍掉一个项目却不清理记忆，它会在未来某次任务里被残骸绊倒。砍项目要连记忆一起砍干净。

## 收尾：让「调用方知道怎么做」也变成协议的一部分

最后一轮需求是 preset 支持：全局配置一个默认 preset，请求体 `metadata.agentPreset` 按请求覆盖。真正的收尾动作是——把 preset 的用法写进 AgentCard 的 `capabilities.extensions`，让任何 A2A 调用方**发现**服务时就能读到「传这个 metadata 键、可用这些值、默认是那个」。功能做完不算完，可发现性才算完。

## 协作方法复盘

回头看，这次能成，靠的不是 agent 多强，是这套流程：

1. **模糊需求先冻结成方案**——v1 → 评审 → v2，方案阶段花的每一分钟都在省实现阶段的小时；
2. **决策用 POC 关门**——架构争论不靠嘴，靠 20 分钟的验证脚本；
3. **阶段验收是 e2e 不是「我觉得好了」**——带 key 的测试由人跑，输出贴回去，修完重跑；
4. **决策与结论写进仓库**——Agent Note + RESULTS.md + 记忆三处同步，压缩上下文后仍能续上；
5. **砍需求要连记忆一起砍**——半成品是负债，拖着的半成品是复利负债。

工具会换，流程不会。下一次给任何 agent 派活，我还是会先要方案、再要 POC、最后要 e2e。
