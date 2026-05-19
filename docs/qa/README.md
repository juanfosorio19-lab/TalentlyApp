# QA — Talently

Documentación y reportes del proceso de QA.

## Estructura

```
docs/qa/
├── README.md                          ← este archivo
├── 2026-05-18-checklist.md            ← checklist manual (clickeable)
├── YYYY-MM-DD-report.md               ← output del agente qa-auditor (estático + DB)
└── YYYY-MM-DD-e2e-report.md           ← output del agente qa-e2e (browser smoke tests)
```

## Cobertura

| Capa | Agente | % checklist | Setup |
|---|---|---|---|
| Estática + DB + Routing guards + Business rules | `qa-auditor` | ~50% | Solo necesita Supabase MCP conectado |
| Browser E2E (Fresh Journey + Business Rules + Path Coverage Matrix) | `qa-e2e` | +35% | Requiere Claude Preview MCP + `npm run dev` |
| Visual/UX manual | tú | ~15% | `2026-05-18-checklist.md` |

**Total**: ~85% automatizado, ~15% manual.

## Lección aprendida (2026-05-18)

En las primeras corridas el agente no detectó el bug del onboarding redirect (user nuevo quedaba en /app sin profile). Causa: el protocolo testeaba estados conocidos (con seed) pero **nunca el journey desde cero**. Refactor aplicado:

1. **Suite 0 Fresh User Journey** en qa-e2e: crear user nuevo con email único, recorrer signup → onboarding → app verificando cada redirect. Cleanup automático con `delete_account()`.
2. **Section 12 Routing Guards + 13 Business Rules** en qa-auditor: detección estática de patrones rotos (rutas sin gate, redirects sin chequeo de onboarding, hooks sin setLoading(false)).
3. **Path Coverage Matrix** en qa-e2e: cada URL × cada estado auth (anon / sin profile / incompleto / completo) verifica el redirect esperado.

Estos cambios se diseñaron para PILLAR este tipo específico de bug en próximas corridas.

## Cuándo invocar cada agente

| Situación | Agente |
|---|---|
| Después de aplicar una migración SQL | `qa-auditor` |
| Después de tocar `supabase.js` o cualquier query | `qa-auditor` |
| Antes de un release | `qa-auditor` + `qa-e2e` + checklist manual |
| Después de cambios visuales en componentes shared | `qa-e2e` + revisión manual sección 1 del checklist |
| Bug específico de runtime | `bug-hunter` (no `qa-*`) |

## Cómo invocar

Desde Claude Code local en el proyecto:

```
/agents qa-auditor
```

O en lenguaje natural: "corre el qa-auditor". Claude lo despachará vía la tool `Task`.

### Setup para qa-e2e

1. **Conectar el MCP de Claude Preview** desde el menú de Claude Code (Settings → MCP servers).

2. **Crear `.claude/launch.json`** (local, está en `.gitignore`). El preview lo busca relativo al cwd actual de Claude Code, así que ponlo donde corras la sesión. Template para Windows:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "talently-dev",
      "runtimeExecutable": "npm.cmd",
      "runtimeArgs": ["--prefix", "Talently_v2", "run", "dev"],
      "port": 5173
    }
  ]
}
```

En Mac/Linux usar `"npm"` en lugar de `"npm.cmd"`. Si corres desde un worktree, ajustar `--prefix` con la ruta absoluta al `Talently_v2/` del proyecto principal (los worktrees no tienen `node_modules`).

3. **Invocar el agente**: "corre qa-e2e"

Si Claude Preview no está disponible localmente, alternativa: usar el MCP de Claude in Chrome o Playwright manualmente. Ambos requieren ajustes al agente.

## Score histórico

| Fecha | qa-auditor | qa-e2e | Notas |
|---|---|---|---|
| 2026-05-18 | — | 4/4 suites ejecutadas (4 skip por seed) | 1 bug real: `material-symbols-outlined` en 9 archivos |
| 2026-05-18 (v2 con seed) | — | 8/10 suites ejecutables, 5/10 verde | 4 bugs críticos: #3 WelcomeView dark, #4 mensajes duplicados, #6 NotifsView infinite loading, #7 AuthContext lock |
| 2026-05-18 (v3 post-fixes) | — | 10/10 ✅ | 5 fixes verificados en runtime: noopLock + onAuthStateChange + useAuth + reconciliación realtime + error UI + --text-on-dark |
| 2026-05-19 (v2 con 13 secciones) | 11/13 + 2 ⚠️ | — | Inaugurar Sections 12 (Routing Guards) y 13 (Business Rules estáticas). Sin críticos. 2 warns menores: drift de migración 012b + hooks con early return sin setLoading(false). |

## Tips para interpretar los reportes

- **🔴 Crítico**: bloquea release. Arreglar antes de mergear.
- **🟠 Alto**: bug visible al usuario, pero no bloquea. Próximo sprint.
- **🟡 Medio**: cosmético o deuda técnica menor. Backlog.
- **⚪ Trivia**: opinión de estilo. Opcional.

## Combinando con el checklist manual

Para una corrida completa antes de release:

1. **Sprint 1** (~5 min): correr `qa-auditor`. Si hay 🔴, arreglar primero.
2. **Sprint 2** (~15 min): correr `qa-e2e`. Si hay 🔴, arreglar.
3. **Sprint 3** (~2 h): tú, con el `2026-05-18-checklist.md`, marcando solo lo que los agentes no cubrieron (visuales, UX feel, gestos táctiles, screen reader).

## Pendientes / Mejoras al sistema

- [ ] Crear un agente `master-qa` que orqueste ambos en paralelo y consolide (similar a `master-auditor`)
- [ ] Sumar lighthouse o webhint via MCP
- [ ] Sumar screen reader testing (axe-core via Playwright)
- [ ] Histórico de scores en una tabla CSV/JSON para tracking de tendencias
