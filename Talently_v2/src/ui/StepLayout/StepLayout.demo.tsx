import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { BottomSheet } from '../BottomSheet';
import { Button } from '../Button';
import { ChipGroup } from '../ChipGroup';
import { IconButton } from '../IconButton';
import { IconCamera, IconHelp, IconLogout, IconPerson, IconUpload } from '../icons';
import { Stack } from '../Layout';
import { List, ListItem } from '../ListItem';
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
    notice,
    continueDisabled,
    continueLoading,
}: {
    initial?: Oficio[];
    error?: string;
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
                <ChipGroup
                    label="Gastronomía y eventos"
                    options={OFICIOS}
                    value={oficios}
                    onChange={setOficios}
                    max={3}
                    maxNote="Máximo 3 oficios. Quita uno para elegir otro."
                    error={error}
                />
                <SearchField placeholder="Buscar otro oficio" />
            </Stack>
        </StepLayout>
    );
}

const demo: DemoModule = {
    name: 'StepLayout',
    group: 'Estructura',
    summary:
        'La plantilla de todo asistente: AppBar standard «Paso X de N» con ⋯, barra de progreso de 4 px, H1 + subtítulo, contenido y CTA fijo «Continuar» («Omitir» como ghost aparte). Acceso: sin barra ni menú.',
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
                        {/* El contenido es MediaUploader (avatar), de otro grupo: aquí, su marcado tl-upload-avatar. */}
                        <Stack gap={4} className="tl-stack--center">
                            <span className="tl-upload-avatar">
                                <span className="tl-upload-avatar__ph">
                                    <IconPerson />
                                </span>
                                <IconButton icon={IconCamera} label="Agregar foto" variant="tonal" onClick={noop} />
                            </span>
                            <div className="tl-upload-actions">
                                <Button variant="outline" onClick={noop}>Tomar foto</Button>
                                <Button variant="outline" onClick={noop}>Elegir de la galería</Button>
                            </div>
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
                        <OficiosStep initial={[]} continueDisabled />
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
