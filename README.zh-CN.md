# Bloomway World Director

**Your words. Your world. Your camera.**

用一句话搭建三维世界、描述动作、调度摄影机——本仓库聚焦**电影预演**（低模白盒），不是通用 AI 视频生成模型。成片生成属于 [Bloomway](https://bloomway.ai) 上的可选工作流。

[English README](README.md)

---

## 快速开始

**环境：** Node.js ≥ 20，npm ≥ 10。捆绑示例**无需** Bloomway 账号或 API Key。

```bash
git clone <repository-url>   # 公开后填写
cd bloomway-world-director
npm install
npm run verify:example       # 校验 plan/世界/摄影机采样
npm run dev                  # http://localhost:5173/
```

默认 Studio 加载 [`examples/edo-rainy-night`](examples/edo-rainy-night/)（仓库内 JSON，非在线自然语言推理）。

**实现边界：** [docs/implementation-audit.md](docs/implementation-audit.md)  
**验证记录：** [docs/verification-log.md](docs/verification-log.md)

可选：`npm run verify:studio-e2e`、`npm run record:demo`。

---

## 观看演示

演示视频来自 **本仓库** 轻量 Studio 录屏（非完整 Bloomway 客户端）。

[演示视频](media/demo.mp4) · [封面](media/poster.png) · [说明](media/README.md)

完整产品能力见 [bloomway.ai](https://bloomway.ai)。

---

## 本地能力（摘要）

| 状态 | 能力 |
| ---- | ---- |
| **已验证** | plan/world JSON、`validatePrevisPlan`、`generatePrevisWorld`、`samplePrevisCamera` |
| **已验证** | 精简 WebGL Studio 可构建并加载示例 |
| **实验性** | 无 LLM 的关键词/规则世界提示 |
| **计划中** | 更多示例、MCP、完整产品导演台 UI 移植 |

任意自然语言「一句话生成 Plan」助手仅在 **Bloomway 托管侧**，不在本仓库。

---

## 限制

见 [docs/implementation-audit.md](docs/implementation-audit.md) 第 6 节（示例为 JSON、白盒画质、Studio 为英文子集等）。

---

## 商业使用

可按 **MIT** 商业使用，**无需**注册、报备或单独许可。联系 **info@bloomway.ai** 为自愿合作渠道，非使用条件。详见 [docs/commercial-use.md](docs/commercial-use.md)。

### 来源说明

保留 MIT 要求的版权与许可声明；链接仓库或注明 Bloomway AI 为**自愿**。

### 品牌

见 [TRADEMARKS.md](TRADEMARKS.md)。

---

## 许可

MIT，见 [LICENSE](LICENSE)。公开发布前请确认版权主体名称。

---

验收清单：[docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)
