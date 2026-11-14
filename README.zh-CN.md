# Bloomway World Director

**搭建世界 · 调度场景 · 排练镜头**

开源三维预演 Studio：探索场景、人物站位与摄影机运动。

免费使用 · MIT 许可 · 无需注册

[English（主站）](README.md) · [English 详情](README.en.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md)

**[浏览器试玩](https://bloomway-ai.github.io/bloomway-world-director/)** · [本地运行](#本地运行) · [观看演示](#观看演示)

无需注册或 API Key。建议使用桌面浏览器。

<p align="center">
  <a href="https://bloomway-ai.github.io/bloomway-world-director/">
    <img src="media/try-in-browser-cover.png" alt="点击进入浏览器 Studio — 预设、三维白盒、时间轴" width="100%">
  </a>
  <br><sub><strong>在线 Studio</strong> — 点击打开 · <a href="https://bloomway-ai.github.io/bloomway-world-director/?example=1&autoplay=1">从 Edo 示例开始</a></sub>
</p>

---

## 体验一下

### 浏览器试玩

**已上线 —** [打开浏览器 Studio](https://bloomway-ai.github.io/bloomway-world-director/)

- 直达示例：[`?example=1&autoplay=1`](https://bloomway-ai.github.io/bloomway-world-director/?example=1&autoplay=1)
- 首页选 **预设**，或在 **指令输入框** 输入短句（如 `Snowy daytime Tokyo urban city`、`two rivals meet in the street`）
- 在时间轴点 **播放**，预览摄影机与站位

与本仓库 OSS 应用相同；完整 [Bloomway](https://bloomway.ai) 产品为可选托管服务。

### 本地运行

| 项目 | 要求 |
| ---- | ---- |
| Node.js | **≥ 20** |
| npm | **≥ 10** |
| Bloomway 账号 / API | **不需要** |

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run dev
```

浏览器打开 **http://localhost:5173/**。默认场景：[`examples/edo-rainy-night`](examples/edo-rainy-night/)。

---

## 观看演示

OSS Studio 实机录屏（静音循环，各约 12 秒），未加速。

<p align="center"><strong>城市巡游</strong> · <strong>街头剧情</strong></p>

<table>
  <tr>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">
        <img src="media/demo-city-tour.gif" alt="城市巡游" width="100%">
      </a>
      <br><sub><code>Snowy daytime Tokyo urban city</code> · <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4">▶ 完整 MP4</a></sub>
    </td>
    <td width="50%">
      <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">
        <img src="media/demo-drama.gif" alt="街头剧情" width="100%">
      </a>
      <br><sub>对峙 + 时间轴 · <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4">▶ 完整 MP4</a></sub>
    </td>
  </tr>
</table>

欢迎点 ⭐ 关注更新。

---

## 你能做什么

- 用预设搭建街景 / 城市 / 主题场景
- 胶囊体人物站位与时间轴摄影机
- 指令输入框为 **本地关键词规则**（非云端大模型）
- 不包含：成片、通用 AI 视频模型、免费云端算力

边界说明：[docs/implementation-audit.md](docs/implementation-audit.md) · 商用 [docs/commercial-use.md](docs/commercial-use.md)。

---

## 示例与限制

新手友好：**Edo 雨夜**、**街头剧情**。其余见 [docs/examples/STATUS.md](docs/examples/STATUS.md)。  
低模白盒、Studio 界面英文 v0.1、桌面 WebGL 为佳。

---

## 从预演到成片

<p align="center">
  <a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4">
    <img src="media/promo-cold-open.gif" alt="品牌片预览" width="100%">
  </a>
  <br><sub><a href="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/final_v2_cold_open.mp4">▶ 观看完整品牌片（约 63 秒）</a></sub>
</p>

成片工作流见 [Bloomway](https://bloomway.ai)（可选，可能需账号）。

---

## 社区

**在 [Discussions](https://github.com/bloomway-ai/bloomway-world-director/discussions) 分享你的第一个镜头。**

[CONTRIBUTING.md](CONTRIBUTING.md) · 自愿合作 **info@bloomway.ai**（非许可条件）

---

## 许可

[MIT](LICENSE) · 演示媒体 [CC BY 4.0](media/LICENSE)