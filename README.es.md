# Bloomway World Director

[English](README.en.md) · [中文](README.zh-CN.md) · [Melayu](README.ms.md) · [Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [**Todos los idiomas**](README.md)

**Your words. Your world. Your camera.**

Construye mundos 3D y dirige la cámara para **previsualización** cinematográfica (blockout de baja poli)—no es un modelo generalista de video con IA. Pasar a imagen final es un flujo opcional en [Bloomway](https://bloomway.ai).

> **Experimento abierto Bloomway:** construye un mundo con una frase, bloquea planos en previs 3D y llévalos a pantalla. Herramienta abierta para creadores e investigadores.  
> **Actualizaciones continuas:** este repositorio se mantiene activamente; habrá mejoras regulares.

**Uso comercial MIT** sin registro ni reparto de ingresos. **info@bloomway.ai** solo para colaboración voluntaria—**no** es condición de licencia. Ver [docs/commercial-use.md](docs/commercial-use.md).

---

## Tres rutas

| Ruta | Resumen |
| ---- | ------- |
| **Ruta 1 — Código abierto (local)** | Ejecuta ejemplos en tu máquina; entiende texto → previs 3D. Para aprendizaje, docencia e investigación. |
| **Ruta 2 — Bloomway MCP (opcional)** | Conecta las mismas descripciones a previs/generación alojada—**opcional**. |
| **Ruta 3 — Equipos y entrega** | Colaboración y plantillas en la [plataforma Bloomway](https://bloomway.ai). |

---

## Inicio rápido

```bash
git clone https://github.com/bloomway-ai/bloomway-world-director.git
cd bloomway-world-director
npm install
npm run verify:example
npm run dev
```

Ejemplo por defecto: [`examples/edo-rainy-night`](examples/edo-rainy-night/). [docs/implementation-audit.md](docs/implementation-audit.md)

---

## Demos

| Demo | Frase de una línea | Archivo |
| ---- | ------------------ | ------- |
| Recorrido urbano | `Snowy daytime Tokyo urban city` | [demo-city-tour.mp4](media/demo-city-tour.mp4) |
| Drama callejero | `Rainy night — two rivals meet in the street` | [demo-drama.mp4](media/demo-drama.mp4) |

La UI del Studio es **solo en inglés** en v0.1; NL completo en Bloomway alojado.

MIT · medios [CC BY 4.0](media/README.md)

*Si te ayuda a explorar un plano, deja una ⭐.*