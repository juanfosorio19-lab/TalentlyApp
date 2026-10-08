import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { PromotedBadge } from '../PromotedBadge';
import {
    IconBook,
    IconClassSchool,
    IconDocument,
    IconEye,
    IconJobCleaning,
    IconJobConstruction,
    IconJobEducation,
    IconJobFoodEvents,
    IconJobHealth,
    IconJobHomeCare,
    IconJobIndustry,
    IconJobRetail,
    IconJobSecurity,
    IconJobTransport,
    IconOffers,
    IconPeople,
    IconPerson,
    IconTool,
} from '../icons';
import { OptionCard, OptionGroup, OptionLink, OptionLinkGroup, type OptionGroupOption } from './OptionCard';

const PERFILES: OptionGroupOption[] = [
    { value: 'trabajo', icon: IconOffers, title: 'Busco trabajo', example: 'Empleo estable o turnos por día' },
    {
        value: 'hogar',
        icon: IconJobHomeCare,
        title: 'Contratar para mi hogar',
        example: 'Asesor/a del hogar, cuidador/a o banquetero para un evento',
    },
    { value: 'empresa', icon: IconPeople, title: 'Contratar para mi empresa o negocio', example: 'Empresa, pyme, colegio, OTEC u ONG' },
    {
        value: 'servicios',
        icon: IconTool,
        title: 'Ofrezco mis servicios',
        example: 'Gasfíter, electricista, mecánico…',
        badge: 'Reservas desde junio',
    },
    {
        value: 'doy-clases',
        icon: IconBook,
        title: 'Doy clases particulares',
        example: 'Para escolares, PAES, idiomas…',
        badge: 'Reservas desde marzo',
    },
    {
        value: 'tomo-clases',
        icon: IconClassSchool,
        title: 'Quiero tomar clases',
        example: 'Para ti o para tus hijos',
        badge: 'Reservas desde marzo',
    },
];

const ORGANIZACIONES: OptionGroupOption[] = [
    { value: 'empresa', icon: IconJobIndustry, title: 'Empresa', example: 'Sociedad con RUT de empresa' },
    { value: 'pyme', icon: IconJobRetail, title: 'Pyme o emprendimiento', example: 'Negocio pequeño o que está partiendo' },
    { value: 'persona', icon: IconPerson, title: 'Persona con giro', example: 'Boletas o facturas a tu nombre' },
    { value: 'educacion', icon: IconJobEducation, title: 'Colegio, jardín u OTEC', example: 'Educación y capacitación' },
    { value: 'ong', icon: IconPeople, title: 'ONG o fundación', example: 'Sin fines de lucro' },
];

const RUBROS: OptionGroupOption[] = [
    { value: 'gastronomia-eventos', icon: IconJobFoodEvents, title: 'Gastronomía y eventos', example: 'Garzón, banquetero/a, bartender' },
    { value: 'comercio', icon: IconJobRetail, title: 'Comercio', example: 'Vendedor/a, reponedor/a' },
    { value: 'seguridad', icon: IconJobSecurity, title: 'Seguridad', example: 'Guardia, conserje' },
    { value: 'hogar-cuidados', icon: IconJobHomeCare, title: 'Hogar y cuidados', example: 'Asesor/a del hogar, cuidador/a' },
    { value: 'limpieza', icon: IconJobCleaning, title: 'Limpieza', example: 'Auxiliar de aseo, camarero/a de pisos' },
    { value: 'transporte-logistica', icon: IconJobTransport, title: 'Transporte', example: 'Conductor/a, repartidor/a' },
];

// Amount solo formatea montos con las unidades de `pay_unit`: no tiene «Gratis»
// ni «por 30 días» (brecha de Amount), así que el precio del plan va con su marcado.
const gratis = (
    <span className="tl-amount">
        <span className="tl-amount__value">Gratis</span>
    </span>
);
const destacado = <PromotedBadge />;
const INCLUYE_CLASICA = ['Orden normal', 'Dura 30 días'];
const INCLUYE_PREMIUM = [
    'Primera en su oficio y comuna',
    'Sale en «Para ti» de más trabajadores',
    'Avisamos a quienes calzan',
    'Renovación automática',
    'Estadísticas',
];

const PLAN_F1: OptionGroupOption[] = [
    { value: 'clasica', icon: IconDocument, title: 'Clásica', price: gratis, includes: INCLUYE_CLASICA },
    { value: 'premium', icon: IconEye, title: 'Premium', soon: true, tag: destacado, includes: INCLUYE_PREMIUM },
];

const PLAN_F3: OptionGroupOption[] = [
    {
        value: 'clasica',
        icon: IconDocument,
        title: 'Clásica',
        price: (
            <span className="tl-amount">
                <span className="tl-amount__value">Gratis</span>: 1 empleo activo y 3 turnos al mes
            </span>
        ),
        includes: INCLUYE_CLASICA,
    },
    {
        value: 'premium',
        icon: IconEye,
        title: 'Premium',
        price: (
            <span className="tl-amount">
                <span className="tl-amount__value">$14.990</span> por 30 días
            </span>
        ),
        tag: destacado,
        includes: INCLUYE_PREMIUM,
    },
];

const GASTRONOMIA = { icon: IconJobFoodEvents, title: 'Gastronomía y eventos', example: 'Garzón, banquetero/a, bartender' };
const nada = () => {};

function OptionCardDemo() {
    const [perfiles, setPerfiles] = useState<string[]>(['trabajo']);
    const [org, setOrg] = useState<string | null>('pyme');
    const [rubros, setRubros] = useState<string[]>(['gastronomia-eventos', 'limpieza']);
    const [plan, setPlan] = useState<string | null>('clasica');
    const [plan3, setPlan3] = useState<string | null>('premium');
    const [aviso, setAviso] = useState(false);
    return (
        <>
            <DemoSection title="Multi · lista · F1 onboarding">
                <OptionGroup mode="multi" legend="Elige una o más" options={PERFILES} value={perfiles} onChange={setPerfiles} />
            </DemoSection>
            <DemoSection title="Single · lista · «Tipo de organización»">
                <OptionGroup mode="single" legend="Tipo de organización" options={ORGANIZACIONES} value={org} onChange={setOrg} />
            </DemoSection>
            <DemoSection title="Multi · grilla de 2 · «Elige hasta 3 oficios»">
                <div>
                    <OptionGroup
                        mode="multi"
                        variant="grid"
                        legend="Oficios"
                        max={3}
                        options={RUBROS}
                        value={rubros}
                        onChange={setRubros}
                    />
                </div>
            </DemoSection>
            <DemoSection title="Atajo · grilla de 2 · INI-01 del hogar «¿Qué necesitas?» (M4)">
                <OptionLinkGroup aria-label="¿Qué necesitas?">
                    <OptionLink href="#publicar" icon={IconJobHomeCare} title="Asesor/a del hogar" />
                    <OptionLink href="#publicar" icon={IconPeople} title="Cuidador/a infantil" className="is-pressed" />
                    <OptionLink href="#publicar" icon={IconJobHealth} title="Cuidador/a de adulto mayor" className="is-focus" />
                    <OptionLink href="#publicar" icon={IconJobFoodEvents} title="Banquetero/a para un evento" />
                    <OptionLink href="#explorar" icon={IconBook} title="Clases" />
                </OptionLinkGroup>
                <DemoLabel>Navega, no elige: sin input ni círculo. La segunda está presionada y la tercera con foco.</DemoLabel>
            </DemoSection>
            <DemoSection title="Plan · PUBL-08 · F1: Premium con «Pronto»">
                <DemoFrame width={360}>
                    <OptionGroup
                        mode="single"
                        variant="plan"
                        legend="Tipo de publicación"
                        legendHidden
                        options={PLAN_F1}
                        value={plan}
                        onChange={setPlan}
                        onSoonClick={() => setAviso(true)}
                    />
                </DemoFrame>
                <DemoLabel>
                    {aviso
                        ? 'Snackbar: «Te avisaremos cuando puedas destacar tus publicaciones».'
                        : 'Toca Premium: no se elige y avisa con un Snackbar.'}
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Plan · F3: Premium elegible y marcada">
                <DemoFrame width={360}>
                    <OptionGroup
                        mode="single"
                        variant="plan"
                        legend="Tipo de publicación"
                        legendHidden
                        options={PLAN_F3}
                        value={plan3}
                        onChange={setPlan3}
                    />
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Default">
                <OptionCard mode="multi" {...GASTRONOMIA} />
            </DemoSection>
            <DemoSection title="Presionado">
                <OptionCard mode="multi" {...GASTRONOMIA} className="is-pressed" />
            </DemoSection>
            <DemoSection title="Foco">
                <OptionCard mode="multi" {...GASTRONOMIA} className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <OptionCard mode="multi" {...GASTRONOMIA} defaultChecked />
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <OptionCard mode="multi" icon={IconJobConstruction} title="Construcción" example="Maestro/a, ayudante, jornal" disabled />
                <DemoLabel>Al llegar al máximo de 3, las demás quedan deshabilitadas hasta quitar una.</DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <OptionGroup
                    mode="multi"
                    legend="¿Qué quieres hacer en Talently?"
                    legendHidden
                    options={PERFILES.slice(0, 2)}
                    value={[]}
                    onChange={nada}
                    error="Elige al menos una opción para continuar"
                />
            </DemoSection>
            <DemoSection title="Cargando">
                <span className="body">
                    <Badge>No aplica</Badge> Las opciones que cargan muestran Skeleton.
                </span>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'OptionCard',
    group: 'Selección',
    summary: 'Tarjeta de elección grande (single o multi, lista o grilla de 2, plan) con un solo indicador: círculo de 22 a la derecha. También como atajo que navega.',
    Demo: OptionCardDemo,
};

export default demo;
