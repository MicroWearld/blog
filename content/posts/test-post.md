+++
date = '2026-09-01T15:32:02+08:00'
draft = true
title = '测试文章：主题功能一览'
categories = ['学习记录']
series_order = 1
tags = ['测试', '主题']
+++

这是一篇测试文章,用于验证 Blowfish 主题的各类渲染能力。覆盖:标题层级、代码块、表格、数学公式、引用块、链接。

{{< katex >}}

## 标题与正文

### 三级标题

正文段落,验证中文字体与排版。**粗体**、*斜体*、`行内代码`、[外部链接](https://gohugo.io/)。

## 代码块

```python
def hello(name: str) -> str:
    """测试代码块与复制按钮。"""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(hello("MicroWearld"))
```

## 表格

| 功能 | 状态 | 说明 |
|---|---|---|
| 代码复制 | 开 | enableCodeCopy = true |
| 深色模式 | 开 | hermes-slate 配色 |
| 搜索 | 开 | 客户端 Fuse 索引 |
| emoji | 关 | 纯文字风格 |

## 数学公式

行内公式 \\(E = mc^2\\),块级公式:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 引用

> 终端风,纯文字,无 emoji。—— 本博客的排版约定

## 结语

这是测试文章,验证完毕后可以删除,或改成正式内容。
