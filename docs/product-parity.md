# 3D 导演台 · 产品功能对齐（OSS vs Bloomway）

开源仓 `apps/studio` 默认使用与产品 **V2 3D Director** 同一套核心渲染与时间线组件（自 `bloomway-launch-step1` 净室移植）。品牌 Chrome、Composer 云能力与画布集成在 OSS 中有意收窄。

## 已对齐（本地可运行）

| 能力 | 说明 |
|------|------|
| 顶栏布局 | 左：标题 + **新建世界** + **历史**；中：工具条 + 截图 + 撤销；右：重置视角 + 设置 |
| 本机历史 | `localStorage`（`bwd-studio-history-v1`），首页条 **历史** 标签与顶栏菜单互通 |
| `world3dScene` 视口 | 白模世界、计划内摄影机 shot 模式播放、自由浏览 |
| `Ds3dTimeline` | 播放/暂停、 scrub、平滑运动、关键帧增删/框选/平移 |
| `Ds3dSettingsPanel` | 移动速度、视角灵敏度、世界密度/时段/天气/水面/坡度等 |
| `ds3dPresetWorlds` + 首页条 | 无 plan 时浏览预设世界并进入 |
| `previsV2Edit` / `previsKeyTimes` | 与产品相同的手动关键帧编辑逻辑（`packages/core/src/edit`） |
| 示例 `edo-rainy-night` | 启动时自动加载 JSON plan |

旧版块面预览仍可通过 `?legacy=1` 打开（`LegacyStudioApp` + `PrevisCanvas`）。

## 计划中 / 仅产品端

| 能力 | OSS 状态 |
|------|----------|
| `Ds3dComposer`（自然语言改场景） | **OSS 底部输入框**：规则解析（天气/霓虹/删楼/JSON），非真 AI；完整对话在 Bloomway 产品 |
| 画布脚本节点、版本历史、录制导出管线 | 未接 Supabase/GCS；`world3dRecorder` 已移植未挂 UI |
| `Ds3dCameraDock` 取景器与镜头关系编辑 | 组件已拷贝，主 Shell 待接入 |
| 角色工具、点选、室内房间编辑 | 待接 pick/actor 流程 |
| 多语言完整文案 | 当前 `ds3dI18n.ts` 为精简中英 |

## 开发验证

```bash
npm install
npm run verify:example
npm run build
npm run verify:studio-e2e
```

本地：`npm run dev -w @bloomway/studio` → http://localhost:5173/（`?autoplay=1` 自动播放）。
