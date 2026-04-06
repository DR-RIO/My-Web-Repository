---
title: Markdown 扩展功能
published: 2024-05-01
updated: 2024-11-29
description: '了解 Mizuki 中的 Markdown 扩展功能'
image: ''
tags: [演示, 示例, Markdown, Mizuki]
category: '示例'
draft: false  
---

## GitHub 仓库卡片

你可以添加链接到 GitHub 仓库的动态卡片，页面加载时会从 GitHub API 自动拉取仓库信息。

::github{repo="matsuzaka-yuki/Mizuki"}

使用代码 `::github{repo="matsuzaka-yuki/Mizuki"}` 创建 GitHub 仓库卡片。

```markdown
::github{repo="matsuzaka-yuki/Mizuki"}
```

## 提示框 (Admonitions)

支持以下类型的提示框：`note（笔记）` `tip` `important` `warning` `caution`

:::note
需要用户注意的信息，即使在浏览时也应该考虑。
:::

:::tip
帮助用户更成功的可选信息。
:::

:::important
用户成功所必需的关键信息。
:::

:::warning
由于潜在风险，需要用户立即注意的关键内容。
:::

:::caution
操作的负面潜在后果。
:::

### 基本语法

```markdown
:::note
需要用户注意的信息，即使在浏览时也应该考虑。
:::

:::tip
帮助用户更成功的可选信息。
:::
```

### 自定义标题

提示框的标题可以自定义。

:::note[我的自定义标题]
这是一个带有自定义标题的笔记。
:::

```markdown
:::note[我的自定义标题]
这是一个带有自定义标题的笔记。
:::
```

### GitHub 语法

> [!TIP]
> 也支持 `https://github.com/orgs/community/discussions/16925`。

```
> [!NOTE]
> 也支持 GitHub 语法。

> [!TIP]
> 也支持 GitHub 语法。
```

### 剧透

你可以在文本中添加剧透。文本也支持 **Markdown** 语法。

内容 :spoiler[被隐藏了 **啊**]！

```markdown
内容 :spoiler[被隐藏了 **啊**]！
```