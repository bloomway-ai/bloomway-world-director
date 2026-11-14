# Bloomway World Director

[English](README.en.md) · [中文](README.zh-CN.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [**모든 언어**](README.md)

**Your words. Your world. Your camera.**

3D 세계를 만들고 카메라를 연출하는 영화 **프리비즈**(저폴리 블록아웃)—범용 AI 영상 생성 모델이 아닙니다. 완성 영상화는 [Bloomway](https://bloomway.ai)의 선택적 워크플로입니다.

> **Bloomway 오픈 실험:** 한 문장으로 세계를 짓고, 3D 프리비즈에서 인물과 카메라를 배치한 뒤 샷으로 이어갑니다. 크리에이터와 연구자를 위한 오픈 툴킷.  
> **지속 업데이트:** 이 저장소는 활발히 유지보수되며 앞으로도 계속 개선됩니다.

**MIT 상업 이용**에 등록·신고·수익 분배가 필요 없습니다. **info@bloomway.ai**는 자발적 협업용이며 **라이선스 조건이 아닙니다**. [docs/commercial-use.md](docs/commercial-use.md)

---

## 세 가지 경로

| 경로 | 설명 |
| ---- | ---- |
| **경로 1 — 오픈소스(로컬)** | 예제를 로컬에서 실행하며 텍스트 → 3D 프리비즈를 이해합니다. 학습·교육·연구용. |
| **경로 2 — Bloomway MCP(선택)** | 같은 설명을 호스팅 프리비즈·생성에 연결—**필수 아님**. |
| **경로 3 — 팀 & 제작** | 협업·템플릿·지원은 [Bloomway 플랫폼](https://bloomway.ai). |

---

## 빠른 시작

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example
npm run dev
```

기본 예: [`examples/edo-rainy-night`](examples/edo-rainy-night/). [docs/implementation-audit.md](docs/implementation-audit.md)

---

## 데모

| 데모 | 한 줄 프롬프트 | 파일 |
| ---- | -------------- | ---- |
| 도시 투어 | `Snowy daytime Tokyo urban city` | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| 거리 드라마 | `Rainy night — two rivals meet in the street` | [demo-drama.mp4](media/demo-drama.mp4) |

Studio UI는 v0.1 **영어만**. 완전한 자연어 플랜은 Bloomway 호스팅.

MIT · 미디어 [CC BY 4.0](media/README.md)

*샷을 탐색하는 데 도움이 되었다면 ⭐ 부탁드립니다.*