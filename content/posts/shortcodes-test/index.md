---
title: "简码总测试"
draft: true
date: 2026-09-03T23:00:00+08:00
mode: note
categories: ["学习记录"]
tags: ["测试", "主题"]
summary: "Blowfish 全部 56 个简码的现场测试页——排版组件、媒体嵌入、图表数学、代码导入全覆盖。"
---

这篇是 Blowfish 简码的总测试台,用于验证本站所有短代码是否正常渲染。

<!--more-->

## 一、文本与排版

{{< lead >}}这是 lead 简码:大号引导文字,用于文章开头的引言段落,与正文字号拉开层级。{{< /lead >}}

普通段落与 `行内代码`,然后是 keyword:

{{< keyword >}}A2A{{< /keyword >}} 与 {{< keyword icon="star" >}}dsh{{< /keyword >}} 是关键词胶囊。

{{< keywordList >}}
{{< keyword >}}DeepSeek{{< /keyword >}}
{{< keyword icon="star" >}}Harness{{< /keyword >}}
{{< keyword >}}plugin{{< /keyword >}}
{{< /keywordList >}}

## 二、提示与按钮

{{< alert >}}默认 alert:重要提示信息。{{< /alert >}}

{{< alert icon="triangle-exclamation" cardColor="#3b2f3d" iconColor="#e63946" textColor="#f1faee" >}}自定义配色的 alert:危险警示。{{< /alert >}}

{{< alert icon="x-mark" >}}错误型提示。{{< /alert >}}

{{< badge >}}新{{< /badge >}} 行内徽章。按钮:

{{< button href="https://github.com/MicroWearld" target="_blank" >}}GitHub{{< /button >}}

{{< cta url="/posts/dsh-a2a-plugin-tutorial/" label="阅读教程" >}}

{{< cta url="/about/" label="关于我" style="outline" >}}

## 三、折叠与标签页

{{< accordion >}}
{{< accordionItem header="展开看实现细节" >}}
A2A 的两个插件:出向服务 dsh-a2a-server 与入向客户端 dsh-subagent-a2a。
{{< /accordionItem >}}
{{< accordionItem header="第二项" >}}
基于 @a2a-js/sdk,未触碰 agent 循环核心。
{{< /accordionItem >}}
{{< /accordion >}}

{{< tabs group="code" >}}
{{< tab label="YAML" icon="code" >}}
```yaml
port: 4123
transport: sse
```
{{< /tab >}}
{{< tab label="JSON" icon="code" >}}
```json
{ "transport": "sse", "port": 4123 }
```
{{< /tab >}}
{{< /tabs >}}

## 四、步骤与时间线

{{< steps >}}
{{< step title="写 Server" number="1" >}}把 DSH 暴露为标准 A2A 服务(AgentCard + Task 生命周期)。
{{< /step >}}
{{< step title="写 Client" number="2" >}}让 DSH 能以 A2A 客户端去调远程 agent。
{{< /step >}}
{{< step title="独立插件装配" number="3" >}}不改 agent 循环,按 preset 装配。
{{< /step >}}
{{< /steps >}}

{{< timeline >}}
{{< timelineItem icon="code" header="P0 POC" badge="v0.1" subheader="验证通路" >}}端口 4123,PONG e2e 2 秒。
{{< /timelineItem >}}
{{< timelineItem icon="check" header="Phase 1 Server" badge="v0.2" >}}A2A 服务成型,AgentCard 动态读取 preset。
{{< /timelineItem >}}
{{< timelineItem header="Phase 2 Client" >}}入向调用打通,input-required 43 秒含 retry。
{{< /timelineItem >}}
{{< /timeline >}}

## 五、特性网格与数字

{{< feature-grid columns="3" >}}
{{< feature icon="wand-magic-sparkles" title="AgentCard 发现" url="/posts/dsh-a2a-collab-process/" >}}A2A v1.0 模型:AgentCard 发现 + Task 生命周期。
{{< /feature >}}
{{< feature icon="check" title="官方 SDK" >}}基于 @a2a-js/sdk 而非手写协议层。
{{< /feature >}}
{{< feature icon="github" title="双仓库" >}}dsh 与 Hermes 各持一边。
{{< /feature >}}
{{< /feature-grid >}}

{{< stats >}}
{{< stat value="2" label="插件数" >}}server + client 各一。
{{< /stat >}}
{{< stat value="4123" label="端口" >}}A2A 服务监听端口。
{{< /stat >}}
{{< stat value="2s" label="PONG e2e" >}}最小通路延迟。
{{< /stat >}}
{{< /stats >}}

{{< swatches "#16202B" "#2A3B52" "#76A3D6" "#408D8C" >}} 色板 swatches:底、深、冰蓝、青玉。

## 六、文章嵌入与列表

{{< article link="/posts/dsh-a2a-plugin-tutorial/" >}}

{{< list limit="3" where="Type" value="posts" >}}

## 七、图片与画廊

{{< figure src="/apple-touch-icon.png" alt="favicon 大图" caption="站点 favicon(180px 源图)" >}}

{{< gallery >}}
{{< figure src="/apple-touch-icon.png" caption="一" figureClass="grid-w33" >}}
{{< figure src="/img/code-rain.svg" caption="二" figureClass="grid-w33" >}}
{{< figure src="/apple-touch-icon.png" caption="三" figureClass="grid-w33" >}}
{{< /gallery >}}

## 八、图表与数学

{{< chart >}}type: 'bar', data: { labels: ['调用','input-required','PONG'], datasets: [{ label: '次数', data: [14, 3, 22] }] }{{< /chart >}}

{{< mermaid >}}graph LR
    A[宿主 Hermes] -->|A2A| B[dsh-a2a-server]
    B --> C[DSH agent loop]
    C -->|client| D[远程 agent]{{< /mermaid >}}

{{< katex >}}
行内公式 \\(E = mc^2\\) 与块级:

$$ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} $$

## 九、打字机与图标

{{< typeit speed="60" lifeLike="true" >}}Agent 协作手记:一句模糊需求,两个插件,一个跨周的坑。{{< /typeit >}}

{{< icon "github" >}} 图标嵌入(内联 SVG)。

## 十、外部嵌入(需公网)

{{< youtubeLite id="SgXhGb-7QbU" label="Blowfish 演示" >}}

{{< gist "nunocoracao" "2779792841f7ffa7c7e62dc4d38626d4" >}}

{{< github repo="nunocoracao/blowfish" >}}

{{< gitlab projectID="gitlab-org/gitlab" >}}

{{< codeberg repo="forgejo/forgejo" >}}

{{< gitea server="https://git.fsfe.org" repo="FSFE/fsfe-website" >}}

{{< forgejo server="https://codeberg.org" repo="forgejo/forgejo" >}}

{{< huggingface model="openai-community/gpt2" >}}

{{< codeimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/main/config/_default/hugo.toml" type="toml" startLine="1" endLine="6">}}

{{< mdimporter url="https://raw.githubusercontent.com/nunocoracao/blowfish/main/README.md" startLine="1" endLine="8">}}

{{< video src="/apple-touch-icon.png" >}}

## 十一、排版包裹

{{< ltr >}}从左到右文本。{{< /ltr >}}

{{< rtl >}}من اليمين إلى اليسار。{{< /rtl >}}

## 十二、补测:轮播 / 截图 / Ansible

{{< carousel images="{shot.png,/img/code-rain.svg,shot.png}" aspectRatio="16-9" captions="{shot.png:轮播一,/img/code-rain.svg:轮播二}" >}}

{{< screenshot src="shot.png" caption="截图简码(页面资源)" >}}

{{< ansible role="geerlingguy.docker" >}}

{{< email email="hello@microweard.dev" text="发邮件给我" >}}
