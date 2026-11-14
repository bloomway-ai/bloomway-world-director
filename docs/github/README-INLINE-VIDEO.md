# README inline video (GitHub limitation)

GitHub **strips `<video>` tags** from repository READMEs (including `src` pointing at Release assets). A `<sub>` caption may remain with **no player and no poster**.

## What works on the repo homepage

1. **Inline player (live):**  
   `https://github.com/user-attachments/assets/c9382f04-355c-4c05-ac11-c86aab355fa0`  
   (standalone line in `README.md` — 63s, ~8MB encode uploaded via web editor)
2. **Play page (backup):** [watch-full-demo.html](https://bloomway-ai.github.io/bloomway-world-director/watch-full-demo.html)
3. **Re-upload / replace:** drag `media/promo-full-demo-readme.mp4` in the **GitHub web editor**. GitHub inserts a line like:

   ```text
   https://github.com/user-attachments/assets/<uuid>
   ```

   Keep that URL **alone on its own line** (blank lines above/below). GitHub renders a native player. File must stay **≤ 10MB** on free org plans.

   Do **not** save a dummy release when testing in the release notes editor — only copy the URL into README.

## Source encode

```bash
./scripts/compress-promo-readme.sh
```

1080p master remains Release `final_v2_cold_open.mp4` only.

---

## 中文：在 README 首页内嵌播放（拖入 MP4）

### 0. 准备文件（二选一）

- **本机已有仓库：**  
  `bloomway-world-director/media/promo-full-demo-readme.mp4`（约 8MB）
- **没有本地仓库：** 浏览器下载  
  [Release promo-full-demo-readme.mp4](https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/promo-full-demo-readme.mp4)  
  或 [main 分支 raw](https://github.com/bloomway-ai/bloomway-world-director/raw/main/media/promo-full-demo-readme.mp4)

需要 **GitHub 写权限**（组织成员 / 维护者）。

### 1. 打开网页编辑器

1. 登录 https://github.com  
2. 打开仓库 `bloomway-ai/bloomway-world-director`  
3. 点开 **`README.md`**  
4. 右上角铅笔 **Edit this file**  
   （直达：[编辑 main 上的 README.md](https://github.com/bloomway-ai/bloomway-world-director/edit/main/README.md)）

### 2. 把光标放在海报下面

在编辑器里找到海报图那段（`promo-hero-direct-rainy-streets.jpg`），在 **`</p>` 之后、下一段文字之前** 点一下，空一行。

### 3. 拖入 MP4

1. 从访达（Finder）把 **`promo-full-demo-readme.mp4`** 拖进 **编辑区**（不要拖到侧栏）。  
2. 等上传条走完（约 8MB，几秒到一两分钟）。  
3. 编辑区会出现 **单独一行** 链接，形如：  
   `https://github.com/user-attachments/assets/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**不要**改成 `[文字](url)`，**不要**包在 `<video>` 里；就保留这一整行 URL。

上下各留一个空行，例如：

```markdown
</p>

https://github.com/user-attachments/assets/<你的 uuid>

*63s vision film...
```

### 4. 预览并提交

1. 切到 **Preview**，应看到带播放控件的方块（不自动播放）。  
2. **Commit changes** → 写说明如 `docs: inline README demo via user-attachments` → **Commit to main**。

### 5. 常见问题

| 现象 | 处理 |
|------|------|
| 拖进去没反应 | 换 Chrome；确认文件 ≤10MB；确认在 **README 编辑框** 内松开 |
| 只有下载链接、没有播放器 | URL 必须 **单独一行**，且为 `user-attachments/assets/...` |
| 上传失败 | 检查组织配额；或先用 Release 文件确认能下载 |

上传完成后，把生成的 `user-attachments` URL 发给协作者，可同步写入各语言 README。