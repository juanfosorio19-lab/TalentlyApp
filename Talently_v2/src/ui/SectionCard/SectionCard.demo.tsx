import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { IconDocument } from '../icons';
import { Stack } from '../Layout';
import { SectionCard, SectionRow } from './SectionCard';

const noop = () => {};

const OFICIOS = ['Garzón', 'Bartender', 'Banquetero/a'] as const;

const demo: DemoModule = {
    name: 'SectionCard',
    group: 'Estructura',
    summary:
        'Sección del Perfil y de los detalles: Card con título H3 y, en la cabecera, el lápiz «Editar» o un Button sm «Agregar». Vacía: ayuda y un Button tonal con la acción real.',
    Demo: () => (
        <>
            <DemoSection title="SectionCard con datos · lápiz «Editar» en la cabecera">
                <SectionCard title="Oficios" onEdit={noop}>
                    <Stack gap={3}>
                        {/* Chips de solo lectura: el preview usa tl-chip--input sin la X (con padding en línea). */}
                        <div className="tl-chipgroup__chips">
                            {OFICIOS.map((oficio) => (
                                <span key={oficio} className="tl-chip tl-chip--input">
                                    {oficio}
                                </span>
                            ))}
                        </div>
                        <span className="caption">1 a 3 años de experiencia · Disponible: fines de semana, tarde y noche</span>
                    </Stack>
                </SectionCard>
                <SectionCard title="Credenciales" onAdd={noop}>
                    {/* Título y línea separados por 4, como el .kv del preview. */}
                    <SectionRow icon={IconDocument}>
                        <Stack gap={1}>
                            <span className="button-lg">Certificado de manipulación de alimentos</span>
                            <span className="tl-listitem__sub">Subido el 2 dic</span>
                        </Stack>
                    </SectionRow>
                    <SectionRow icon={IconDocument}>
                        <Stack gap={1}>
                            <span className="button-lg">Certificado de antecedentes</span>
                            <div>
                                <Badge status="Recomendado" />
                            </div>
                        </Stack>
                    </SectionRow>
                </SectionCard>
            </DemoSection>

            <DemoSection title="SectionCard vacía · ayuda + Button tonal">
                <SectionCard
                    title="Experiencia"
                    empty={{
                        text: 'Agrega dónde has trabajado. Las organizaciones lo miran antes de confirmar un turno.',
                        actionLabel: 'Agregar experiencia',
                        onAction: noop,
                    }}
                />
            </DemoSection>

            <DemoSection title="Estados">
                <DemoSection title="Default">
                    <DemoLabel>Mostrado arriba, con datos y vacía.</DemoLabel>
                </DemoSection>
                <DemoSection title="Presionado">
                    <DemoNotApplicable>La sección no se toca; lo hacen su lápiz o su botón.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Foco">
                    <DemoNotApplicable>Lo tienen el lápiz y el botón.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Seleccionado">
                    <DemoNotApplicable>Una sección no se marca.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Deshabilitado">
                    <DemoNotApplicable>Si no se puede editar, la cabecera no lleva lápiz.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Error">
                    <DemoNotApplicable>Un dato con problema se marca con su Badge («Vencida») y un Banner warning.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Cargando">
                    <DemoNotApplicable>Mientras carga, Skeleton de perfil (Lote 5).</DemoNotApplicable>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
