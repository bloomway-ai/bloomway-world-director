# Bloomway World Director

**搭建世界 · 调度场景 · 排练镜头**

MIT 授权的 **三维预演工具包**：程序化世界、人物站位、摄影机时间轴——**低模白盒**，不是成片，也不是通用 AI 视频模型。

[English（主站）](README.md) · [English 详情](README.en.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

*Your words. Your world. Your camera.* — 品牌口号；**本仓库**文字入口为 **离线规则 + 预设**（见下文）。

**MIT 商用：** 见 [LICENSE](LICENSE) 与 [docs/commercial-use.md](docs/commercial-use.md)，无需注册或分成。

---

## 介绍与演示

本仓库 **OSS Studio v0.1** 实机录屏（静音循环，各约 12 秒）。无需云端登录，未加速。

<p align="center"><strong>城市巡游</strong> · <strong>街头剧情</strong></p>

<table>
  <tr>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">
        <img src="media/demo-city-tour.gif" alt="城市巡游演示" width="100%">
      </a>
      <br><sub>输入 <code>Snowy daytime Tokyo urban city</code> · WASD 巡游 · <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">▶ 完整 MP4</a></sub>
    </td>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">
        <img src="media/demo-drama.gif" alt="街头剧情演示" width="100%">
      </a>
      <br><sub>对峙剧情 + 时间轴播放 · <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">▶ 完整 MP4</a></sub>
    </td>
  </tr>
</table>

默认 Edo 示例：[`media/demo.mp4`](media/demo.mp4) · `?example=1`。

若本项目能帮你搭镜头构想，欢迎点 ⭐ 关注后续更新。

---

## 体验一下

**本地（推荐）**

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run dev
```

浏览器打开 **http://localhost:5173/**，或 **http://localhost:5173/?example=1&autoplay=1** 直达 Edo 示例。

**浏览器试玩（GitHub Pages）**

配置见 [docs/deploy/studio-hosting.md](docs/deploy/studio-hosting.md)。目标地址：`https://bloomway-ai.github.io/bloomway-world-director/`  
**已上线：** [打开 OSS Studio](https://bloomway-ai.github.io/bloomway-world-director/)（桌面 WebGL 为佳）。  
[bloomway.ai](https://bloomway.ai) 为 **可选托管产品**，不是本仓库 OSS Studio。

---

## 快速开始

| 项目 | 要求 |
| ---- | ---- |
| Node.js | **≥ 20** |
| npm | **≥ 10** |
| Bloomway 账号 / API | **不需要**（默认示例） |

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run dev
```

**第一次使用：** 首页选预设 → 或 `?example=1&autoplay=1` → 时间轴 **播放** → 作曲器可试 `rainy night`、`snowy daytime Tokyo urban city`、`two rivals meet in the street`（**关键词规则**，非云端 LLM）。

默认场景：[`examples/edo-rainy-night`](examples/edo-rainy-night/)。

维护者验收：`docs/verification-log.md`（访客不必运行 `verify:*`）。

---

## 你能做什么

- 用预设与 `world-ref` **搭建街景 / 城市场景**
- **胶囊体占位** 人物与走位
- 在时间轴上 **预览摄影机路径与时长**
- **不能**：任意一句话生成完整分镜、免费云端成片、完整商用 Director UI

边界：[docs/implementation-audit.md](docs/implementation-audit.md)（**2026-11-14**）。

---

## 示例场景

| 示例 | 新手友好 |
| ---- | -------- |
| Edo 雨夜 | **首选** |
| 街头剧情 | 作曲器 + 演示视频 |
| 现代城市 / 火星基地 | JSON 与预设可用；**尚无**一键入口 |

详情：[docs/examples/STATUS.md](docs/examples/STATUS.md)。  
官方片段：[docs/gallery/README.md](docs/gallery/README.md)。

---

## 当前限制

低模白盒、Studio 界面英文 v0.1、四条示例均通过校验但仅两条最适合首次访问。桌面 WebGL 为佳。

---

## 从预演到成片

63 秒 **品牌短片** 展示 Bloomway **产品愿景**，不能代替亲自试用 OSS 白盒 Studio。

<p align="center">
  <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4">
    <img src="media/promo-cold-open.gif" alt="品牌片预览" width="100%">
  </a>
  <br><sub>产品蒙太奇（约 12 秒循环）· <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4">▶ 完整影片（约 63 秒）</a>（Release 文件名 <code>final_v2_cold_open.mp4</code>）</sub>
</p>

如需将预演接入成片流程，可了解 [Bloomway](https://bloomway.ai) **可选**工作流（可能需账号与计费）。

---

## 社区与贡献

- [Discussions](https://github.com/bloomway-ai/bloomway-world-director/discussions)
- 挑战草稿：[一场戏 · 三次运镜](docs/community/challenge-one-scene-three-moves.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

自愿合作联系 **info@bloomway.ai**（非许可条件）。

---

## 路线图

| 项目 | 状态 |
| ---- | ---- |
| Director MCP | **计划中** — [docs/mcp/README.md](docs/mcp/README.md) |
| Pages 在线 Studio | 工作流就绪，待启用 Pages |
| 四示例一键入口 / UI 多语言 | **计划中** |

---

## 许可

源码 [MIT](LICENSE)；演示媒体 [CC BY 4.0](media/LICENSE)。[TRADEMARKS.md](TRADEMARKS.md)。