import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { IconClassLanguages, IconClassMusic, IconClassPaes, IconClassSchool, type IconComponent } from '../icons';
import { Chip } from './Chip';

/** Una fila con los tres tipos base en el mismo estado. */
function TresTipos({ className, disabled }: { className?: string; disabled?: boolean }) {
    return (
        <DemoRow>
            <DemoItem label="filter">
                <Chip className={className} disabled={disabled}>Garzón</Chip>
            </DemoItem>
            <DemoItem label="input">
                <Chip variant="input" className={className} disabled={disabled} onRemove={() => {}}>Garzón</Chip>
            </DemoItem>
            <DemoItem label="suggestion">
                <Chip variant="suggestion" className={className} disabled={disabled}>Bartender</Chip>
            </DemoItem>
        </DemoRow>
    );
}

const CUANDO = ['Hoy', 'Mañana', 'Este fin de semana', 'Más adelante'];

const OFICIOS = ['Garzón', 'Bartender', 'Banquetero/a'];

/**
 * Chips input y suggestion sueltos. Al tocar la X o el +, el chip cambia de
 * elemento (span + X ↔ button): el foco vuelve al chip en su nueva forma, como
 * hace ChipGroup `mode="input"`, para no caer a <body>.
 */
function InputYSugerencia() {
    const [elegidos, setElegidos] = useState(['Garzón', 'Bartender']);
    const base = useId();
    const tocado = useRef<string | null>(null);
    const idDe = (v: string) => `${base}-${OFICIOS.indexOf(v)}`;
    const cambiar = (v: string, elegir: boolean) => {
        tocado.current = v;
        setElegidos((xs) => (elegir ? OFICIOS.filter((x) => x === v || xs.includes(x)) : xs.filter((x) => x !== v)));
    };
    useLayoutEffect(() => {
        if (tocado.current === null) return;
        document.getElementById(`${base}-${OFICIOS.indexOf(tocado.current)}`)?.focus();
        tocado.current = null;
    }, [elegidos, base]);
    return (
        <DemoRow>
            {elegidos.map((v) => (
                <Chip key={v} id={idDe(v)} variant="input" onRemove={() => cambiar(v, false)}>
                    {v}
                </Chip>
            ))}
            {OFICIOS.filter((v) => !elegidos.includes(v)).map((v) => (
                <Chip key={v} id={idDe(v)} variant="suggestion" onClick={() => cambiar(v, true)}>
                    {v}
                </Chip>
            ))}
        </DemoRow>
    );
}

const CATEGORIAS: { name: string; icon: IconComponent }[] = [
    { name: 'Escolar', icon: IconClassSchool },
    { name: 'PAES', icon: IconClassPaes },
    { name: 'Idiomas', icon: IconClassLanguages },
    { name: 'Música', icon: IconClassMusic },
];

function ChipDemo() {
    const [cuando, setCuando] = useState<string[]>([]);
    const [categoria, setCategoria] = useState('Escolar');
    const toggle = (v: string) => setCuando((xs) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]));
    return (
        <>
            <DemoSection title="Default">
                <TresTipos />
            </DemoSection>
            <DemoSection title="Presionado">
                <TresTipos className="is-pressed" />
            </DemoSection>
            <DemoSection title="Foco">
                <TresTipos className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoRow>
                    <DemoItem label="filter">
                        <Chip selected>Garzón</Chip>
                    </DemoItem>
                    <DemoItem label="input">
                        <DemoLabel>Ya es un valor elegido</DemoLabel>
                    </DemoItem>
                    <DemoItem label="suggestion">
                        <DemoLabel>Al tocarla pasa a ser un chip input</DemoLabel>
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <TresTipos disabled />
            </DemoSection>
            <DemoSection title="Error">
                <span className="body">
                    <Badge>No aplica</Badge> El error se muestra en el ChipGroup («Elige al menos 1 oficio»), no en cada chip.
                </span>
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> Un chip cambia al instante.
                </span>
            </DemoSection>
            <DemoSection title="Prueba: toca los chips filter">
                <DemoRow>
                    {CUANDO.map((c) => (
                        <Chip key={c} selected={cuando.includes(c)} onClick={() => toggle(c)}>
                            {c}
                        </Chip>
                    ))}
                </DemoRow>
            </DemoSection>
            <DemoSection title="Input y suggestion · toca la X o el +">
                <InputYSugerencia />
            </DemoSection>
            <DemoSection title="Con menú (M6) · comuna en Explorar · Turnos">
                <DemoRow>
                    <DemoItem label="default">
                        <Chip variant="menu" field="Comuna">Maipú</Chip>
                    </DemoItem>
                    <DemoItem label="presionado">
                        <Chip variant="menu" field="Comuna" className="is-pressed">Maipú</Chip>
                    </DemoItem>
                    <DemoItem label="foco">
                        <Chip variant="menu" field="Comuna" className="is-focus">Maipú</Chip>
                    </DemoItem>
                </DemoRow>
                <DemoLabel>Muestra un valor y lo cambia en una hoja (SHT-COMUNA). No se marca como seleccionado: siempre tiene un valor.</DemoLabel>
            </DemoSection>
            <DemoSection title="Con ícono de categoría (M9) · Explorar · Clases">
                <DemoRow>
                    {CATEGORIAS.map((c) => (
                        <Chip
                            key={c.name}
                            variant="lead"
                            icon={c.icon}
                            selected={categoria === c.name}
                            onClick={() => setCategoria(c.name)}
                        >
                            {c.name}
                        </Chip>
                    ))}
                </DemoRow>
                <DemoLabel>Al elegir el chip, el check reemplaza al ícono de la categoría: un solo indicador.</DemoLabel>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'Chip',
    group: 'Selección',
    summary: 'Chip de 36 px: filter (con ícono de categoría o sin él), input con X, suggestion con + y con menú. Un solo estilo de seleccionado.',
    Demo: ChipDemo,
};

export default demo;
