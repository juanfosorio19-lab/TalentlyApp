import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { BottomSheet } from '../BottomSheet';
import { ChipGroup } from '../ChipGroup';
import {
    IconBook,
    IconClock,
    IconHelp,
    IconJobHomeCare,
    IconLogout,
    IconOffers,
    IconPeople,
    IconTool,
    IconUpload,
} from '../icons';
import { Stack } from '../Layout';
import { List, ListItem } from '../ListItem';
import { MediaUploader, UploadActions } from '../MediaUploader';
import { OptionGroup, type OptionGroupOption } from '../OptionCard';
import { PasswordField } from '../PasswordField';
import { SearchField } from '../SearchField';
import { Snackbar } from '../Snackbar';
import { TextField } from '../TextField';
import { StepLayout } from './StepLayout';

// En el catálogo nada navega ni guarda: en la app, onBack es el paso anterior y onContinue guarda el paso.
const noop = () => {};

const OFICIOS = [
    { value: 'garzon', label: 'Garzón' },
    { value: 'banquetero', label: 'Banquetero/a' },
    { value: 'bartender', label: 'Bartender' },
    { value: 'anfitrion', label: 'Anfitrión o anfitriona' },
    { value: 'cocinero', label: 'Cocinero/a' },
] as const;
type Oficio = (typeof OFICIOS)[number]['value'];

/** Paso 2 de 5 del onboarding (bloque Trabajo, F1): oficios con ChipGroup y buscador. */
function OficiosStep({
    initial = ['garzon', 'banquetero'],
    error,
    hint,
    notice,
    continueDisabled,
    continueLoading,
}: {
    initial?: Oficio[];
    error?: string;
    /** Lo que falta para continuar, bajo el grupo («Elige al menos 1 oficio para continuar.»). */
    hint?: string;
    notice?: ReactNode;
    continueDisabled?: boolean;
    continueLoading?: boolean;
}) {
    const [oficios, setOficios] = useState<Oficio[]>(initial);
    return (
        <StepLayout
            progress={{ step: 2, total: 5 }}
            title="¿En qué quieres trabajar?"
            subtitle="Elige hasta 3 oficios. Puedes cambiarlos después."
            onBack={noop}
            onMenu={noop}
            onContinue={noop}
            continueDisabled={continueDisabled}
            continueLoading={continueLoading}
            notice={notice}
            focusTitle={false}
        >
            <Stack gap={6}>
                <Stack gap={3}>
                    <ChipGroup
                        label="Gastronomía y eventos"
                        options={OFICIOS}
                        value={oficios}
                        onChange={setOficios}
                        max={3}
                        maxNote="Máximo 3 oficios. Quita uno para elegir otro."
                        error={error}
                    />
                    {hint && <span className="tl-field__help">{hint}</span>}
                </Stack>
                <SearchField placeholder="Buscar otro oficio" />
            </Stack>
        </StepLayout>
    );
}

type Intencion = 'buscar_empleo' | 'tomar_turnos' | 'ofrecer_servicios' | 'dar_clases' | 'contratar_organizacion' | 'contratar_hogar';

const QUIERO_TRABAJAR: OptionGroupOption<Intencion>[] = [
    { value: 'buscar_empleo', icon: IconOffers, title: 'Buscar empleo', example: 'Estable o part time: profesor, operario, técnico, administrativo…' },
    { value: 'tomar_turnos', icon: IconClock, title: 'Tomar turnos o trabajos por día', example: 'Garzón, banquetero, guardia de eventos, bodega…' },
    {
        value: 'ofrecer_servicios',
        icon: IconTool,
        title: 'Ofrecer mis servicios',
        example: 'Gasfíter, electricista, mecánico, fotógrafo…',
        badge: 'Reservas desde junio',
    },
    {
        value: 'dar_clases',
        icon: IconBook,
        title: 'Dar clases particulares',
        example: 'Matemática, inglés, PAES, música…',
        badge: 'Reservas desde marzo',
    },
];

const QUIERO_CONTRATAR: OptionGroupOption<Intencion>[] = [
    { value: 'contratar_organizacion', icon: IconPeople, title: 'Contratar para mi empresa o negocio', example: 'Publica empleos y turnos' },
    {
        value: 'contratar_hogar',
        icon: IconJobHomeCare,
        title: 'Contratar para mi hogar',
        example: 'Asesor/a del hogar, cuidador/a infantil, cuidado de adulto mayor, banquetero/a para un evento',
    },
];

/** ONB-01 del primer onboarding: sin BackButton (no hay pantalla anterior), sin barra (N todavía no existe) y con ⋯. */
function IntencionStep() {
    const [intenciones, setIntenciones] = useState<Intencion[]>(['tomar_turnos']);
    const elegidas = (grupo: readonly OptionGroupOption<Intencion>[]) => intenciones.filter((v) => grupo.some((o) => o.value === v));
    const cambiar = (grupo: readonly OptionGroupOption<Intencion>[]) => (next: Intencion[]) =>
        setIntenciones([...intenciones.filter((v) => !grupo.some((o) => o.value === v)), ...next]);
    return (
        <StepLayout
            title="¿Qué quieres hacer en Talently?"
            subtitle="Elige todo lo que te sirva."
            onMenu={noop}
            onContinue={noop}
            continueDisabled={intenciones.length === 0}
            focusTitle={false}
        >
            <Stack gap={6}>
                <OptionGroup<Intencion>
                    mode="multi"
                    legend="Quiero trabajar"
                    options={QUIERO_TRABAJAR}
                    value={elegidas(QUIERO_TRABAJAR)}
                    onChange={cambiar(QUIERO_TRABAJAR)}
                />
                <OptionGroup<Intencion>
                    mode="multi"
                    legend="Quiero contratar o aprender"
                    options={QUIERO_CONTRATAR}
                    value={elegidas(QUIERO_CONTRATAR)}
                    onChange={cambiar(QUIERO_CONTRATAR)}
                />
            </Stack>
        </StepLayout>
    );
}

const demo: DemoModule = {
    name: 'StepLayout',
    group: 'Estructura',
    summary:
        'La plantilla de todo asistente: AppBar standard «Paso X de N» con ⋯, barra de progreso de 4 px, H1 + subtítulo, contenido y CTA fijo «Continuar» («Omitir» como ghost aparte). Acceso: sin barra ni menú. ONB-01: sin BackButton ni barra, con ⋯.',
    Demo: () => (
        <>
            <DemoSection title="M3 · onboarding, bloque Trabajo (F1)">
                <DemoFrame height={640}>
                    <OficiosStep />
                </DemoFrame>
            </DemoSection>

            <DemoSection title="Paso opcional · «Omitir» como ghost aparte">
                <DemoFrame height={680}>
                    <StepLayout
                        progress={{ step: 4, total: 5 }}
                        title="Agrega una foto de perfil"
                        subtitle="Una foto donde se vea tu cara ayuda a que te elijan."
                        onBack={noop}
                        onMenu={noop}
                        onContinue={noop}
                        onSkip={noop}
                        focusTitle={false}
                    >
                        {/* Centrado como en el preview: el avatar y sus botones, cada uno en la pila centrada. */}
                        <Stack gap={4} align="center">
                            <MediaUploader variant="avatar" name="Matías Rojas" actions={false} onSelect={noop} />
                            <UploadActions capture="user" onSelect={noop} />
                        </Stack>
                    </StepLayout>
                </DemoFrame>
            </DemoSection>

            <DemoSection title="Menú ⋯ · hoja con las opciones del asistente">
                <DemoFrame height={440}>
                    <OficiosStep />
                    <BottomSheet open onClose={noop} title="Opciones" portal={false} modal={false}>
                        <List flat>
                            <ListItem icon={IconUpload} title="Guardar y salir" sub="Sigues después desde este paso" onClick={noop} />
                            <ListItem icon={IconHelp} title="Ayuda" onClick={noop} />
                            <ListItem icon={IconLogout} title="Cerrar sesión" onClick={noop} />
                        </List>
                    </BottomSheet>
                </DemoFrame>
                <DemoLabel>
                    Abre «Guardar y salir» y «Ayuda»; solo en el onboarding suma «Cerrar sesión» y «Eliminar cuenta» (en
                    danger, con su confirmación).
                </DemoLabel>
            </DemoSection>

            <DemoSection title="ONB-01 · primer onboarding: sin BackButton ni barra (N todavía no existe), con ⋯">
                <DemoFrame height={640}>
                    <IntencionStep />
                </DemoFrame>
                <DemoLabel>
                    No hay pantalla anterior: el atrás de Android avisa «Presiona atrás otra vez para salir». El ⋯ abre
                    las opciones del onboarding, con «Cerrar sesión» y «Eliminar cuenta».
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Acceso (AUTH-02 a AUTH-06) · sin barra ni menú; el título va en el H1">
                <DemoFrame height={640}>
                    <StepLayout
                        title="Crea tu cuenta"
                        subtitle="Para trabajar, contratar o aprender."
                        onBack={noop}
                        onContinue={noop}
                        continueLabel="Crear cuenta"
                        focusTitle={false}
                    >
                        <Stack gap={4}>
                            <TextField label="Nombre y apellido" autoComplete="name" />
                            <TextField label="Correo" type="email" autoComplete="email" />
                            <PasswordField mode="new" />
                        </Stack>
                    </StepLayout>
                </DemoFrame>
            </DemoSection>

            <DemoSection title="Estados">
                <DemoSection title="Default">
                    <DemoLabel>Mostrado arriba.</DemoLabel>
                </DemoSection>
                <DemoSection title="Presionado">
                    <DemoNotApplicable>Lo tienen el BackButton, el menú y los botones.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Foco">
                    <DemoNotApplicable>Al entrar a un paso, el foco va al título H1.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Seleccionado">
                    <DemoLabel>El paso actual: «Paso 2 de 5» y la barra al 40 %.</DemoLabel>
                </DemoSection>
                <DemoSection title="Deshabilitado · «Continuar» mientras falte algo obligatorio; el paso dice qué falta">
                    <DemoFrame height={560}>
                        <OficiosStep initial={[]} hint="Elige al menos 1 oficio para continuar." continueDisabled />
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Error · junto al control que falló; si guardar falla, Snackbar sobre el CTA">
                    <DemoFrame height={560}>
                        <OficiosStep initial={[]} error="Elige al menos 1 oficio" />
                    </DemoFrame>
                    <DemoFrame height={560}>
                        <OficiosStep
                            notice={
                                <Snackbar
                                    tone="error"
                                    placement="static"
                                    message="No pudimos guardar este paso"
                                    action={{ label: 'Reintentar', onAction: noop }}
                                />
                            }
                        />
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Cargando · «Continuar» mientras se guarda el paso">
                    <DemoFrame height={560}>
                        <OficiosStep continueLoading />
                    </DemoFrame>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
