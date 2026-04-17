---
title: Frontmatter                                       # 文章的标题，将显示在页面顶部和列表中
published: 2026-04-17                                    # 文章的发布日期，格式为 YYYY-MM-DD
updated: 2026-04-17                                      # 文章的最后更新日期，格式为 YYYY-MM-DD
tags: [Markdown, Frontmatter完整示例]                    # 文章的标签，用于分类和搜索
category: 示例                                           # 文章的分类，用于组织内容
draft: false                                             # 是否为草稿，true 表示草稿（不显示），false 表示已发布
description: "Frontmatter 完整字段的详细示例和说明"       # 文章的简短描述，显示在列表页和搜索结果中
image: ""   # 文章的封面图片路径
                        # - 以 http/https 开头：使用网络图片
                        # - 以 / 开头：使用 public 目录中的图片
                        # - 无前缀：使用相对路径
pinned: true                                             # 是否将文章固定在列表顶部，true 表示置顶
encrypted: false                                         # 是否加密文章，true 表示需要密码访问
password: ""                                             # 加密文章的访问密码（仅在 encrypted: true 时有效）
alias: ""                                                # 文章的自定义 URL 路径，访问地址为 /posts/文章别名/
licenseName: ""                                          # 文章内容的许可证名称
author: "人IO"                                           # 文章的作者
sourceLink: ""                                           # 文章内容的来源或参考链接
---

# Frontmatter 完整字段示例

反正就是这些，还有的都不适用，比如说 `readingtime:` 这种字段就不适用，因为已经有自动计算阅读时间的功能了~

```yaml
        ---
        # 基本字段 - 这些是最常用的必填字段
        title: 文章标题        # 文章的标题，将显示在页面顶部和列表中
        published: 2026-04-17  # 文章的发布日期，格式为 YYYY-MM-DD
        tags: [标签1, 标签2]    # 文章的标签，用于分类和搜索
        category: 分类         # 文章的分类，用于组织内容
        draft: false           # 是否为草稿，true 表示草稿（不显示），false 表示已发布

        # 高级字段 - 这些是可选字段，根据需要使用
        updated: 2026-04-17    # 文章的最后更新日期，格式为 YYYY-MM-DD
        description: 文章描述   # 文章的简短描述，显示在列表页和搜索结果中
        image: "./cover.webp"   # 文章的封面图片路径
                                # - 以 http/https 开头：使用网络图片
                                # - 以 / 开头：使用 public 目录中的图片
                                # - 无前缀：使用相对路径
        pinned: false           # 是否将文章固定在列表顶部，true 表示置顶
        encrypted: false        # 是否加密文章，true 表示需要密码访问
        password: "密码"        # 加密文章的访问密码（仅在 encrypted: true 时有效）
        alias: "文章别名"       # 文章的自定义 URL 路径，访问地址为 /posts/文章别名/
        licenseName: "许可证"    # 文章内容的许可证名称
        author: "作者"          # 文章的作者
        sourceLink: "来源链接"   # 文章内容的来源或参考链接
        ---
```

一般带有图片的 `.md` 文档基本上要添加个目录来放图片和放文档。多数时候我会选择使用 图床 或者 数据桶


