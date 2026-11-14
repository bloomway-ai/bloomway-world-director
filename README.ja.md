# Bloomway World Director

[English](README.en.md) · [中文](README.zh-CN.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [**言語一覧**](README.md)

**Your words. Your world. Your camera.**

3D 世界の構築とカメラワークの演出による映画**プレビズ**（ローポリ・ブロックアウト）—汎用 AI 動画生成モデルではありません。完成映像化は [Bloomway](https://bloomway.ai) 上の任意ワークフローです。

> **Bloomway オープン実験：**一文で世界を組み、3D プレビズで人物とカメラを配置し、ショットへつなぐ。クリエイターと研究者向けのオープンツールキット。  
> **継続的に更新：**本リポジトリは活発にメンテナンスされ、今後も改善が続きます。

**MIT 商用利用**に登録・報告・収益分配は不要。**info@bloomway.ai** は任意の協業連絡用（ライセンス条件ではありません）。[docs/commercial-use.md](docs/commercial-use.md)

---

## 3 つのパス

| パス | 内容 |
| ---- | ---- |
| **パス 1 — オープンソース（ローカル）** | 例を手元で実行し、テキスト → 3D プレビズを理解。学習・教育・研究向け。 |
| **パス 2 — Bloomway MCP（任意）** | 同じ記述をホスト型プレビズ／生成に接続—**必須ではありません**。 |
| **パス 3 — チームと制作** | 協業・テンプレート・サポートは [Bloomway プラットフォーム](https://bloomway.ai)。 |

---

## クイックスタート

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example
npm run dev
```

既定例：[`examples/edo-rainy-night`](examples/edo-rainy-night/)。[docs/implementation-audit.md](docs/implementation-audit.md)

---

## デモ

| デモ | 一文プロンプト | ファイル |
| ---- | -------------- | -------- |
| 都市ツアー | `Snowy daytime Tokyo urban city` | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| ストリートドラマ | `Rainy night — two rivals meet in the street` | [demo-drama.mp4](media/demo-drama.mp4) |

Studio UI は v0.1 **英語のみ**。完全な自然言語プラン生成は Bloomway ホスト側。

MIT · デモ媒体 [CC BY 4.0](media/README.md) · [TRADEMARKS.md](TRADEMARKS.md)

*ショットの検討に役立ったら ⭐ をお願いします。*