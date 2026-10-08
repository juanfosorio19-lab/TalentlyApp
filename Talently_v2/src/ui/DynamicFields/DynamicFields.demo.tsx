import { useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { IconButton } from '../IconButton';
import {
    IconCalendar,
    IconCamera,
    IconClock,
    IconDocument,
    IconInfo,
    IconJobFoodEvents,
    IconJobSecurity,
    IconLocation,
    IconMoney,
    IconPeople,
    IconTrash,
    IconUpload,
} from '../icons';
import { COMUNAS_RM } from '../SheetPicker/demoData';
import { DynamicFields, type DynamicField, type DynamicValues } from './DynamicFields';

const noop = () => {};

// Guardia de seguridad (attribute_schemas: shift_system, credencial SPD, lugares).
const SHIFT_SYSTEMS = [
    { value: '4x4', label: '4x4' },
    { value: '5x2', label: '5x2' },
    { value: '7x7', label: '7x7' },
    { value: 'turno_12h', label: '12 h' },
    { value: 'rotativo', label: 'Rotativo' },
];
const PLACES = [
    { value: 'condominio', label: 'Condominio' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'retail', label: 'Retail' },
    { value: 'bodega', label: 'Bodega o industria' },
];

/** Una opción al postular o publicar; varias en el perfil y al filtrar. */
const guardia = (multipleShift: boolean): DynamicField[] => [
    { key: 'shift_system', kind: 'chips', label: 'Sistema de turno', icon: IconClock, options: SHIFT_SYSTEMS, multiple: multipleShift },
    { key: 'spd', kind: 'slot', label: 'Credencial SPD (ex OS-10)', icon: IconDocument },
    {
        key: 'places',
        kind: 'chips',
        label: 'Dónde has trabajado',
        shortLabel: 'Dónde',
        optional: true,
        icon: IconLocation,
        options: PLACES,
        multiple: true,
    },
];

/**
 * El documento de la credencial, como lo dibuja MediaUploader (otro grupo de
 * la librería): en pantallas va ese componente en el slot; aquí, su marcado.
 */
function SpdDocument() {
    return (
        <div className="tl-doc">
            <span className="tl-listitem__tile">
                <IconDocument />
            </span>
            <div className="tl-doc__body">
                <span className="tl-doc__name">Credencial SPD (ex OS-10)</span>
                <span className="tl-doc__meta">
                    <Badge tone="success">Verificada</Badge>
                    Vence 03/2028
                </span>
            </div>
            <IconButton icon={IconTrash} label="Quitar archivo" />
        </div>
    );
}

/** La credencial aún sin subir (MediaUploader documento vacío, también con su marcado del preview). */
function SpdEmpty() {
    return (
        <div className="tl-doc tl-doc--empty">
            <div className="tl-doc__body">
                <span className="tl-doc__name">Credencial SPD (ex OS-10)</span>
                <span className="tl-doc__meta">
                    <Badge tone="warning">Obligatoria</Badge>
                    Foto o PDF, hasta 10 MB
                </span>
            </div>
            <div className="tl-upload-actions">
                <Button variant="outline" icon={IconCamera}>
                    Tomar foto
                </Button>
                <Button variant="outline" icon={IconUpload}>
                    Elegir archivo
                </Button>
            </div>
        </div>
    );
}

/** ONB-T4 y PRF-03: Jorge Muñoz completa los datos de su oficio. */
function Onboarding() {
    const [value, setValue] = useState<DynamicValues>({ shift_system: '4x4', places: ['condominio', 'eventos'] });
    return (
        <div className="tl-card">
            <DynamicFields
                title="Para guardia de seguridad"
                icon={IconJobSecurity}
                fields={guardia(false)}
                value={value}
                onChange={setValue}
                slots={{ spd: <SpdDocument /> }}
            />
        </div>
    );
}

/** EXP-06: los mismos campos como filtros (varias opciones, etiquetas cortas, sin documento). */
function Filters() {
    const [value, setValue] = useState<DynamicValues>({ shift_system: ['4x4', '7x7'] });
    return (
        <div className="tl-card">
            <DynamicFields
                mode="filter"
                title="Para guardia de seguridad"
                icon={IconJobSecurity}
                fields={guardia(false)}
                value={value}
                onChange={setValue}
            />
        </div>
    );
}

/** DET-01 Requisitos: solo lectura; lo vacío no aparece. */
function Detail() {
    return (
        <div className="tl-card">
            <DynamicFields
                mode="read"
                title="Para guardia de seguridad"
                icon={IconJobSecurity}
                fields={guardia(false)}
                value={{ shift_system: '4x4', places: ['condominio'] }}
                slots={{ spd: <Badge tone="warning">Obligatoria</Badge> }}
            />
        </div>
    );
}

// Garzón, turno (PUBL-03): chips, chips de elección única (widget segmented), switch, número, monto, lista larga y fecha.
const garzon: DynamicField[] = [
    {
        key: 'event_types',
        kind: 'chips',
        label: 'Tipo de evento',
        icon: IconCalendar,
        multiple: true,
        options: [
            { value: 'matrimonio', label: 'Matrimonio' },
            { value: 'corporativo', label: 'Corporativo' },
            { value: 'coctel', label: 'Cóctel' },
            { value: 'cumpleanos', label: 'Cumpleaños' },
            { value: 'otro', label: 'Otro' },
        ],
    },
    {
        key: 'dress_code',
        kind: 'chips',
        label: 'Vestimenta',
        icon: IconInfo,
        options: [
            { value: 'propia', label: 'Propia' },
            { value: 'provista', label: 'La entrega el evento' },
        ],
    },
    { key: 'tray_service', kind: 'switch', label: 'Requiere experiencia en bandeja', shortLabel: 'Experiencia en bandeja', icon: IconInfo },
    { key: 'guests', kind: 'number', label: 'Invitados', optional: true, placeholder: 'Ej.: 120', suffix: 'invitados', icon: IconPeople },
    {
        key: 'pay',
        kind: 'money',
        label: 'Tarifa por turno',
        shortLabel: 'Tarifa',
        net: true,
        units: ['turno', 'hora', 'a_convenir'],
        help: 'Monto líquido por un turno completo.',
        icon: IconMoney,
    },
    {
        key: 'comuna',
        kind: 'select',
        label: 'Comuna del evento',
        shortLabel: 'Comuna',
        placeholder: 'Elige la comuna',
        searchPlaceholder: 'Buscar comuna',
        options: COMUNAS_RM,
        icon: IconLocation,
    },
    { key: 'date', kind: 'date', label: 'Fecha del evento', shortLabel: 'Fecha', icon: IconCalendar },
];

/** Publicar un turno de garzón (Banquetería Rosa SpA) y cómo se lee en el detalle. */
function Publish() {
    const [value, setValue] = useState<DynamicValues>({
        event_types: ['matrimonio'],
        dress_code: 'provista',
        tray_service: true,
        guests: 120,
        pay: { amount: 35000, unit: 'turno' },
        comuna: 'vitacura',
        date: '2026-12-12',
    });
    return (
        <>
            <DemoFrame height={760}>
                <div className="tl-app-screen__content">
                    <DynamicFields
                        title="Para garzón o garzona"
                        icon={IconJobFoodEvents}
                        fields={garzon}
                        value={value}
                        onChange={setValue}
                        portal={false}
                    />
                </div>
            </DemoFrame>
            <div className="tl-card">
                <DynamicFields mode="read" title="Para garzón o garzona" icon={IconJobFoodEvents} fields={garzon} value={value} />
            </div>
        </>
    );
}

const demo: DemoModule = {
    name: 'DynamicFields',
    group: 'Campos',
    summary:
        'Los campos propios de cada oficio o materia, dibujados desde su definición: iguales en onboarding, publicar, filtros y detalle (mismas etiquetas, mismo orden, mismos íconos).',
    Demo: () => (
        <>
            <DemoSection title="Onboarding y Perfil · Jorge Muñoz completa sus datos">
                <Onboarding />
            </DemoSection>
            <DemoSection title="Filtros de Explorar · Empleos">
                <Filters />
            </DemoSection>
            <DemoSection title="Detalle de la oferta · Seguridad Andes Ltda.">
                <Detail />
                <DemoLabel>Las tecnologías solo aparecen para oficios de tecnología; a un guardia nunca se le preguntan.</DemoLabel>
            </DemoSection>
            <DemoSection title="Publicar turno · Garzón (texto, número, lista, monto, sí o no y fecha)">
                <Publish />
                <DemoLabel>Lo que se cambia arriba se lee igual abajo, en el detalle.</DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <DemoLabel>Mostrado arriba.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <DemoNotApplicable>Lo tienen sus controles.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Foco">
                <DemoNotApplicable>Lo tienen sus controles.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoLabel>Lo muestran sus chips y documentos.</DemoLabel>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoNotApplicable>Los campos que no aplican al oficio no se dibujan.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Error · junto al control">
                <div className="tl-card">
                    <DynamicFields
                        title="Para guardia de seguridad"
                        icon={IconJobSecurity}
                        fields={guardia(false).slice(0, 2)}
                        value={{}}
                        onChange={noop}
                        errors={{ shift_system: 'Elige un sistema de turno', spd: 'Sube tu credencial SPD' }}
                        slots={{ spd: <SpdEmpty /> }}
                    />
                </div>
            </DemoSection>
            <DemoSection title="Cargando · Skeleton de chips">
                <div className="tl-card">
                    <DynamicFields loading title="Para guardia de seguridad" icon={IconJobSecurity} fields={[]} value={{}} />
                </div>
            </DemoSection>
        </>
    ),
};

export default demo;
