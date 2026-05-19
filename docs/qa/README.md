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
| Estática + DB | `qa-auditor` | ~35% | Solo necesita Supabase MCP conectado |
| Browser E2E | `qa-e2e` | +30% | Requiere Claude Preview MCP conectado + `npm run dev` corriendo |
| Visual/UX manual | tú | ~35% | `2026-05-18-checklist.md` |

**Total**: ~65% automatizado, ~35% manual.

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
