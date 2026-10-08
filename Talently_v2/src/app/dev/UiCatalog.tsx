// Catálogo vivo de src/ui (/dev/ui): cada componente con sus variantes y
// estados, en claro y oscuro. Se arma solo con los *.demo.tsx.
// `?only=Button,Chip` muestra solo esos (lo usan las capturas de revisión).
import { useEffect, useMemo, useState } from 'react';
import { CATALOG_GROUPS, type DemoModule } from '../../ui/catalog/types';
import '../../ui/catalog/catalog.css';
import './UiCatalog.css';

// Carga diferida: un demo roto no tumba el catálogo entero.
const loaders = import.meta.glob<{ default: DemoModule }>('../../ui/**/*.demo.tsx');
const nameOf = (path: string) => path.split('/').pop()!.replace('.demo.tsx', '');

type Loaded = { name: string; demo?: DemoModule; error?: string };

function onlyParam(): string[] | null {
    const v = new URLSearchParams(window.location.search).get('only');
    return v ? v.split(',').map((x) => x.trim()).filter(Boolean) : null;
}

export function UiCatalog() {
    const [loaded, setLoaded] = useState<Loaded[] | null>(null);
    const [query, setQuery] = useState('');
    const [sideBySide, setSideBySide] = useState(true);

    useEffect(() => {
        const only = onlyParam();
        const entries = Object.entries(loaders).filter(([p]) => !only || only.includes(nameOf(p)));
        Promise.all(
            entries.map(([p, load]) =>
                load().then(
                    (m): Loaded => ({ name: nameOf(p), demo: m.default }),
                    (e: unknown): Loaded => ({ name: nameOf(p), error: String(e) }),
                ),
            ),
        ).then(setLoaded);
    }, []);

    const sorted = useMemo(() => {
        const rank = (l: Loaded) => (l.demo ? CATALOG_GROUPS.indexOf(l.demo.group) : -1);
        return (loaded ?? []).slice().sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    }, [loaded]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q
            ? sorted.filter((l) => l.name.toLowerCase().includes(q) || l.demo?.group.toLowerCase().includes(q))
            : sorted;
    }, [sorted, query]);

    if (!loaded) return <p className="body dev-cat">Cargando…</p>;

    return (
        <div className="dev-cat">
            <header className="dev-cat__head">
                <h1 className="h1">Componentes de Talently</h1>
                <p className="body dev-cat__lead">
                    {loaded.length} componentes del sistema de diseño, en claro y oscuro. Solo desarrollo.
                </p>
                <div className="dev-cat__tools">
                    <input
                        className="dev-cat__filter body"
                        type="search"
                        placeholder="Filtrar por nombre o grupo"
                        aria-label="Filtrar componentes"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <label className="body dev-cat__toggle">
                        <input type="checkbox" checked={sideBySide} onChange={(e) => setSideBySide(e.target.checked)} />
                        Claro y oscuro lado a lado
                    </label>
                </div>
                <nav className="dev-cat__toc" aria-label="Índice">
                    {visible.map((l) => (
                        <a key={l.name} className="tl-link caption" href={`#${l.name}`}>{l.name}</a>
                    ))}
                </nav>
            </header>
            {visible.map(({ name, demo, error }) => (
                <article key={name} id={name} className="dev-cat__card">
                    <header className="dev-cat__card-head">
                        <span className="overline dev-cat__group">{demo?.group ?? 'Error'}</span>
                        <h2 className="h2">{name}</h2>
                        <p className="body dev-cat__summary">{demo?.summary ?? error}</p>
                    </header>
                    {demo && (
                        <div className={sideBySide ? 'dev-cat__panes' : 'dev-cat__panes dev-cat__panes--single'}>
                            <div className="dev-cat__pane" data-theme="light"><demo.Demo /></div>
                            {sideBySide && <div className="dev-cat__pane" data-theme="dark"><demo.Demo /></div>}
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}
