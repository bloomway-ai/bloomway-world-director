# Bloomway World Director

[English](README.en.md) · [中文](README.zh-CN.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [**言語一覧**](README.md)

**Your words. Your world. Your camera.**

3D 世界の構築とカメラワークの演出による映画**プレビジュアライゼーション**（ローポリ・ブロックアウト）—汎用 AI 動画生成モデルではありません。完成映像への変換は [Bloomway](https://bloomway.ai) 上の任意ワークフローです。

> **Bloomway オープン実験：**一文で世界を組み、3D プレビズで人物とカメラを配置し、ショットへつなげます。クリエイターと研究者向けのオープンツールキット。  
> **継続的に更新：**本リポジトリは活発にメンテナンスされ、今後も改善が続きます。

**MIT による商用利用**に登録・報告・収益分配は不要です。**info@bloomway.ai** への連絡は任意の協業用で、**ライセンス条件ではありません**。[docs/commercial-use.md](docs/commercial-use.md) を参照。

---

## 3 つのパス

| パス | 内容 |
| ---- | ---- |
| **パス 1 — オープンソース（ローカル）** | 例をローカルで実行し、テキスト → 3D プレビズを理解します。学習・教育・研究に最適。 |
| **パス 2 — Bloomway MCP（任意）** | 同じ記述をホスト型プレビズ／生成に接続—**任意**で、本リポジトリの利用に必須ではありません。 |
| **パス 3 — 上級・チーム** | 協業・商用テンプレート・納品サポートは [Bloomway プラットフォーム](https://bloomway.ai)。 |

ショット例の Discussions 共有を歓迎します。

---

## クイックスタート

**要件：** Node.js ≥ 20、npm ≥ 10。同梱例に Bloomway アカウント・API キーは不要。

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example
npm run dev                  # Studio: http://localhost:5173/
```

既定の Studio は [`examples/edo-rainy-night`](examples/edo-rainy-night/) を読み込みます（リポジトリ内 JSON、ライブクラウド推論ではありません）。

**実装の参照：** [docs/implementation-audit.md](docs/implementation-audit.md) · [docs/verification-log.md](docs/verification-log.md)

任意：`npm run verify:studio-e2e`、`npm run record:demos`、`npm run capture:screenshots`。

---

## スクリーンショット

| ホーム | 一文で世界 | カメラタイムライン |
| ------ | ---------- | ------------------ |
| ![Home](media/screenshots/home.png) | ![World](media/screenshots/world.png) | ![Timeline](media/screenshots/camera-timeline.png) |

---

## デモ

**本リポジトリ**の OSS Studio 録画（商用 Bloomway アプリ全体ではありません）。下でその場再生（初期はミュート）。

<table>
  <tr>
    <td width="50%">
      <video src="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-city-tour.mp4" controls muted playsinline></video>
    </td>
    <td width="50%">
      <video src="https://github.com/bloomway-ai/bloomway-world-director/releases/download/v0.1.0/demo-drama.mp4" controls muted playsinline></video>
    </td>
  </tr>
</table>

| デモ | 一文プロンプト | ファイル |
| ---- | -------------- | -------- |
| 都市ツアー | `Snowy daytime Tokyo urban city` → WASD で探索 | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| ストリートドラマ | `Rainy night — two rivals meet in the street` → タイムライン再生 | [demo-drama.mp4](media/demo-drama.mp4) |

再生成：`npm run record:demos`。旧版：[demo.mp4](media/demo.mp4) · [メディア説明](media/README.md)

製品版：[bloomway.ai](https://bloomway.ai)

---

## ローカルで動くもの

| 状態 | 能力 |
| ---- | ---- |
| **検証済み** | `plan.json` + `world-ref.json`、`validatePrevisPlan`、`generatePrevisWorld`、`samplePrevisCamera` |
| **検証済み** | V2 ディレクタービューポート + タイムライン（`verify:studio-e2e`）；`?legacy=1` でレガシー blockout |
| **実験的** | クラウド LLM なしのキーワード／ルール Composer |
| **計画** | フルクラウド Composer、MCP Director ツール、追加サンプル |

自然言語「任意の文 → プラン」アシスタントは **Bloomway ホスト側のみ**（本リポジトリにはなし）。

---

## 現在の制限

1. マーケ文言は製品ビジョンを示しますが、OSS 例は **チェックイン済み JSON** を使用。  
2. 画質は **blockout** のみ—Bloomway 最終レンダーではありません。  
3. Studio **UI は v0.1 で英語のみ**。[docs/product-parity.md](docs/product-parity.md) 参照。  
4. ローカル「一言 → 世界」は **ルールとプリセット** であり、フルクラウド NLU ではありません。

詳細：[docs/implementation-audit.md](docs/implementation-audit.md) §6。

---

## ロードマップ

- 追加サンプル（`modern-city-street`、`mars-base`）
- MCP 統合ドキュメント・ツール
- Studio 強化（インポート／エクスポート UI）
- Studio UI の多言語化（アプリ chrome；README はすでに 7 言語）

---

## 任意の Bloomway ワークフロー

*プレビズを完成映像に？ [Bloomway](https://bloomway.ai) で接続ワークフローを確認してください。*

---

## 商用利用とブランド

MIT — [LICENSE](LICENSE)。Copyright (c) 2026 Bloomway AI Inc. デモ媒体：[CC BY 4.0](media/README.md)。第三者告知：[docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md)。

商標：[TRADEMARKS.md](TRADEMARKS.md)。公式の後押しを示唆しないでください。

---

## コントリビューション

[CONTRIBUTING.md](CONTRIBUTING.md) · [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)

*ショット探索の助けになったら、または今後の開発を追いたければ ⭐ をお願いします。*