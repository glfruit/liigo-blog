---
title: "<% tp.file.cursor(1) %>"
date: <% tp.date.now("YYYY-MM-DD") %>
category: ai-tools
tags: []
description: "<% tp.file.cursor(2) %>"
draft: true
---

<% tp.file.cursor(3) %>
<%*
// ─────────────────────────────────────────────
// liigo.dev 新文模板（Templater）
//
// 用法：
// 1. 把本文件放到 Vault 的模板目录（如 templates/）
// 2. Templater 设置 → Template folder location 指向该目录
// 3. 在 content/posts/ 下新建笔记，文件名用英文短横线（即 slug），
//    如 cursor-cli-tips.mdx（Templater 触发时插入本模板）
// 4. 写完把 draft 改为 false，push 即发布
//
// 规则提醒：
// - category 三选一：ai-tools / ai-tutorials / building
//   （思考、知识管理类先打 tag，攒够数量再升级分类）
// - description 必填，120 字以内，是 SEO 的命脉
// - 附件统一存 Vault 的 attachments/
// ─────────────────────────────────────────────
_%>
