import { useId, useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoRow, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { Button } from '../Button/Button';
import { Chip } from '../Chip';
import { Dialog } from '../Dialog';
import { IconBlock, IconChevronRight, IconOffers, IconReport } from '../icons';
import { RadioGroup } from '../Radio';
import { BottomSheet, SheetSection } from './BottomSheet';

const noop = () => {};

// Pantalla de fondo bajo el velo (turnos de Explorar).
const SHIFTS = [
    ['Garzón para matrimonio', 'sáb 12 dic · 19:00 · Vitacura'],
    ['Bartender para evento de empresa', 'vie 11 dic · 20:00 · Providencia'],
    ['Anfitrión o anfitriona', 'dom 13 dic · 12:00 · Las Condes'],
    ['Banquetero/a', 'sáb 19 dic · 18:00 · Ñuñoa'],
] as const;

function ScreenBehind({ children }: { children?: ReactNode }) {
    return (
        <div className="tl-app-screen__content">
            {children}
            {SHIFTS.map(([title, meta]) => (
                <div key={title} className="tl-card">
                    <div className="body-l">{title}</div>
                    <div className="body">{meta}</div>
                </div>
            ))}
        </div>
    );
}

const FILTERS = {
    Fecha: ['Hoy', 'Mañana', 'Este fin de semana', 'Más adelante'],
    Oficio: ['Garzón', 'Bartender', 'Banquetero/a', 'Anfitrión o anfitriona'],
    Distancia: ['Hasta 5 km', 'Hasta 10 km', 'Hasta 20 km'],
} as const;
type FilterKey = keyof typeof FILTERS;
const DEFAULT_FILTERS: Record<FilterKey, string[]> = {
    Fecha: ['Este fin de semana'],
    Oficio: ['Garzón'],
    Distancia: ['Hasta 10 km'],
};

function FilterSections({ value, onToggle }: { value: Record<FilterKey, string[]>; onToggle?: (key: FilterKey, option: string) => void }) {
    return (
        <>
            {(Object.keys(FILTERS) as FilterKey[]).map((key) => (
                <SheetSection key={key} label={key}>
                    <div className="tl-chipgroup__chips">
                        {FILTERS[key].map((option) => (
                            <Chip key={option} selected={value[key].includes(option)} onClick={onToggle && (() => onToggle(key, option))}>
                                {option}
                            </Chip>
                        ))}
                    </div>
                </SheetSection>
            ))}
        </>
    );
}

function FiltersSheet() {
    return (
        <DemoFrame height={640}>
            <ScreenBehind />
            <BottomSheet
                open
                onClose={noop}
                title="Filtros"
                portal={false}
                modal={false}
                footer={
                    <>
                        <Button variant="ghost">Limpiar</Button>
                        <Button>Ver 12 turnos</Button>
                    </>
                }
            >
                <FilterSections value={DEFAULT_FILTERS} />
            </BottomSheet>
        </DemoFrame>
    );
}

const ACTORS = [
    { value: 'persona', name: 'Jorge Muñoz', kind: 'person', desc: 'Tú, con todos tus perfiles' },
    { value: 'org', name: 'Seguridad Andes Ltda.', kind: 'org', desc: 'Organización · Puente Alto' },
] as const;

function ActorSheet() {
    const name = useId();
    const [actor, setActor] = useState<string>('persona');
    return (
        <DemoFrame height={420}>
            <ScreenBehind />
            <BottomSheet open onClose={noop} title="Usar Talently como" portal={false} modal={false}>
                {/* Radio aún no tiene lugar para el Avatar antes del texto: la fila se arma con sus piezas. */}
                {ACTORS.map((a) => (
                    <label key={a.value} className="tl-choice tl-choice--row">
                        <Avatar name={a.name} kind={a.kind} verified />
                        <span className="tl-choice__text">
                            {a.name}
                            <span className="tl-choice__desc">{a.desc}</span>
                        </span>
                        <span className="tl-radio">
                            <input type="radio" name={name} checked={actor === a.value} onChange={() => setActor(a.value)} />
                            <span className="tl-radio__box" />
                        </span>
                    </label>
                ))}
                <p className="caption dev-label">Tu hogar no aparece aquí: su actividad se ve dentro de tu perfil.</p>
            </BottomSheet>
        </DemoFrame>
    );
}

const MENU = [
    { icon: IconOffers, title: 'Ver publicación', sub: 'Guardia de seguridad 4x4' },
    { icon: IconReport, title: 'Reportar', sub: 'Cuéntanos qué pasó' },
] as const;

function MenuList({ onBlock }: { onBlock?: () => void }) {
    return (
        <ul className="tl-list">
            {MENU.map(({ icon: Icon, title, sub }) => (
                <li key={title}>
                    <button className="tl-listitem" type="button">
                        <span className="tl-listitem__tile">
                            <Icon />
                        </span>
                        <span className="tl-listitem__body">
                            <span className="tl-listitem__title">{title}</span>
                            <span className="tl-listitem__sub">{sub}</span>
                        </span>
                        <span className="tl-listitem__end">
                            <IconChevronRight />
                        </span>
                    </button>
                </li>
            ))}
            <li>
                <button className="tl-listitem tl-listitem--danger" type="button" onClick={onBlock}>
                    <span className="tl-listitem__tile">
                        <IconBlock />
                    </span>
                    <span className="tl-listitem__body">
                        <span className="tl-listitem__title">Bloquear</span>
                        <span className="tl-listitem__sub">Te pediremos confirmarlo</span>
                    </span>
                    <span className="tl-listitem__end" />
                </button>
            </li>
        </ul>
    );
}

function MenuSheet() {
    return (
        <DemoFrame height={420}>
            <ScreenBehind />
            <BottomSheet open onClose={noop} title="Seguridad Andes Ltda." portal={false} modal={false}>
                <MenuList />
            </BottomSheet>
        </DemoFrame>
    );
}

/** Menú ⋯ de verdad: «Bloquear» abre un Dialog encima; mientras está abierto, la hoja de abajo no se toca (inert). */
function LiveMenuSheet() {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [result, setResult] = useState('Sin bloquear');
    return (
        <DemoFrame height={420}>
            <ScreenBehind>
                <DemoRow>
                    <Button variant="tonal" onClick={() => setOpen(true)}>
                        Menú ⋯
                    </Button>
                </DemoRow>
                <span className="caption dev-label">{result}</span>
            </ScreenBehind>
            <BottomSheet open={open} onClose={() => setOpen(false)} title="Seguridad Andes Ltda." portal={false}>
                <MenuList onBlock={() => setConfirming(true)} />
            </BottomSheet>
            <Dialog
                open={confirming}
                onClose={() => setConfirming(false)}
                title="¿Bloquear a Seguridad Andes Ltda.?"
                confirmLabel="Bloquear"
                destructive
                onConfirm={() => {
                    setConfirming(false);
                    setOpen(false);
                    setResult('Bloqueaste a Seguridad Andes Ltda.');
                }}
                portal={false}
            >
                No podrá escribirte más.
            </Dialog>
        </DemoFrame>
    );
}

const REASONS = ['Acoso', 'Estafa o cobro', 'Discriminación', 'Suplantación', 'Menor en riesgo', 'Agresión', 'Otro'].map((r) => ({
    value: r,
    label: r,
}));

function ReportSheet() {
    const [reason, setReason] = useState<string | null>(null);
    return (
        <DemoFrame height={640}>
            <ScreenBehind />
            <BottomSheet
                open
                onClose={noop}
                title="Reportar"
                portal={false}
                modal={false}
                footer={
                    <Button size="lg" block disabled={!reason}>
                        Enviar reporte
                    </Button>
                }
            >
                <RadioGroup legend="¿Qué pasó?" options={REASONS} value={reason} onChange={setReason} />
            </BottomSheet>
        </DemoFrame>
    );
}

/** Hoja de verdad: abre con el botón; cierra con Cerrar, velo, asa (arrastrando), Escape o «Ver N turnos». */
function LiveSheet() {
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [applied, setApplied] = useState(DEFAULT_FILTERS);
    const count = 4 + filters.Fecha.length * 3 + filters.Oficio.length * 2 + filters.Distancia.length;
    const toggle = (key: FilterKey, option: string) =>
        setFilters((f) => ({ ...f, [key]: f[key].includes(option) ? f[key].filter((o) => o !== option) : [...f[key], option] }));
    const summary = Object.values(applied).flat().join(' · ') || 'Sin filtros';
    return (
        <DemoFrame height={640}>
            <ScreenBehind>
                <DemoRow>
                    <Button variant="tonal" onClick={() => setOpen(true)}>
                        Filtros
                    </Button>
                </DemoRow>
                <span className="caption dev-label">Aplicados: {summary}</span>
            </ScreenBehind>
            <BottomSheet
                open={open}
                onClose={() => setOpen(false)}
                title="Filtros"
                portal={false}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setFilters({ Fecha: [], Oficio: [], Distancia: [] })}>
                            Limpiar
                        </Button>
                        <Button
                            onClick={() => {
                                setApplied(filters);
                                setOpen(false);
                            }}
                        >
                            {`Ver ${count} turnos`}
                        </Button>
                    </>
                }
            >
                <FilterSections value={filters} onToggle={toggle} />
            </BottomSheet>
        </DemoFrame>
    );
}

/** Un estado, como en preview.html: su nombre arriba y la muestra o el motivo de «No aplica». */
function State({ name, na, children }: { name: string; na?: boolean; children: ReactNode }) {
    return (
        <DemoSection title={name}>
            {na ? (
                <div className="body">
                    <span className="tl-badge">No aplica</span> {children}
                </div>
            ) : (
                children
            )}
        </DemoSection>
    );
}

const demo: DemoModule = {
    name: 'BottomSheet',
    group: 'Capas',
    summary:
        'Hoja inferior sobre el velo para filtros, elecciones y acciones: asa que arrastra, H2, Cerrar, cuerpo con scroll y pie con hasta 2 acciones.',
    Demo: () => (
        <>
            <DemoSection title="Filtros de Turnos (F1, desde Explorar)">
                <FiltersSheet />
            </DemoSection>
            <DemoSection title="«Usar Talently como» (selector de actor)">
                <ActorSheet />
            </DemoSection>
            <DemoSection title="Menú ⋯ de una conversación (M5, MSG-02)">
                <MenuSheet />
            </DemoSection>
            <DemoSection title="Reportar (M5, SHT-REPORTE) · motivos tipificados">
                <ReportSheet />
                <span className="caption dev-label">
                    «Enviar reporte» se habilita al elegir un motivo. Bloquear abre un Dialog con «Cancelar» y «Bloquear» (danger).
                </span>
            </DemoSection>
            <DemoSection title="Probar: abrir, arrastrar el asa, Escape">
                <LiveSheet />
            </DemoSection>
            <DemoSection title="Probar: «Bloquear» abre un Dialog sobre la hoja">
                <LiveMenuSheet />
            </DemoSection>
            <DemoSection title="Estados">
                <State name="Default">
                    <div className="body">Mostrado arriba: abierta sobre el velo, con el contenido detrás.</div>
                </State>
                <State name="Presionado" na>
                    Lo tienen sus filas, chips y botones. El asa se arrastra para cerrar o expandir.
                </State>
                <State name="Foco" na>
                    Al abrir, el foco pasa al título; no sale de la hoja hasta cerrarla.
                </State>
                <State name="Seleccionado" na>
                    Lo muestran sus controles.
                </State>
                <State name="Deshabilitado" na>
                    El botón del pie se deshabilita si falta algo obligatorio, con la razón visible en la hoja.
                </State>
                <State name="Error" na>
                    El error se muestra dentro de la hoja, junto al control que falló.
                </State>
                <State name="Cargando" na>
                    El contenido carga con Skeleton; el botón del pie usa su estado cargando.
                </State>
            </DemoSection>
        </>
    ),
};

export default demo;
