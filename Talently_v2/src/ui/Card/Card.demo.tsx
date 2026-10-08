import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { IconCalendar, IconChevronRight, IconLocation, IconShield } from '../icons';
import { Stack } from '../Layout';
import { VerificationBadge } from '../VerificationBadge';
import { Card } from './Card';

const noop = () => {};

/**
 * Contenido de ejemplo: «tu próximo turno» de Matías (Actividad). La Card es
 * solo el contenedor; bundle.css no trae clases para su interior (en el
 * preview son locales: .cardhead, .cardmeta), así que se arma con Stack y
 * las piezas del sistema con el mismo formato que PublicationCard.
 */
function NextShift({ chevron }: { chevron?: boolean }) {
    return (
        <Stack gap={3}>
            <Stack gap={2}>
                <Stack row gap={3}>
                    <Avatar name="Banquetería Rosa SpA" kind="org" verified />
                    <span className="tl-listitem__body">
                        <span className="button-lg">Garzones para cóctel corporativo</span>
                        <span className="tl-listitem__sub">Banquetería Rosa SpA</span>
                    </span>
                    {chevron && (
                        <span className="tl-listitem__end">
                            <IconChevronRight />
                        </span>
                    )}
                </Stack>
                <Stack gap={1}>
                    <span className="tl-pub__fact">
                        <IconCalendar size={16} />
                        hoy · 19:00–00:00 (5 h)
                    </span>
                    <span className="tl-pub__fact">
                        <IconLocation size={16} />a 18 km · Providencia
                    </span>
                </Stack>
            </Stack>
            <div>
                <Badge status="Confirmado" />
            </div>
        </Stack>
    );
}

const demo: DemoModule = {
    name: 'Card',
    group: 'Estructura',
    summary:
        'El contenedor base: color-surface, borde color-border, radio lg, padding 16 y sin sombra. Informativa (div) o tocable (button con tl-card--action), que abre un detalle.',
    Demo: () => (
        <>
            <DemoSection title="Card · radio lg · padding 16 · elev-0 (borde color-border)">
                <DemoRow column tight>
                    <DemoLabel>Contenedor informativo · Actividad, tu próximo turno</DemoLabel>
                    <Card>
                        <NextShift />
                    </Card>
                </DemoRow>
                <DemoRow column tight>
                    <DemoLabel>Card tocable · abre el detalle</DemoLabel>
                    <Card onClick={noop}>
                        <NextShift chevron />
                    </Card>
                </DemoRow>
                <DemoRow column tight>
                    <DemoLabel>Estado de verificación de la organización · GES-01 e INI-02 (M7)</DemoLabel>
                    <Card>
                        <Stack row gap={3}>
                            <span className="tl-listitem__tile">
                                <IconShield />
                            </span>
                            {/* Como el preview: 4 entre título e insignia, 8 hasta el texto y 12 hasta el botón. */}
                            <Stack gap={3}>
                                <Stack gap={2}>
                                    <Stack gap={1}>
                                        <span className="button-lg">Verificación de tu organización</span>
                                        <div>
                                            <VerificationBadge status="review" onClick={noop}>
                                                Verificación en revisión
                                            </VerificationBadge>
                                        </div>
                                    </Stack>
                                    <span className="tl-listitem__sub">
                                        Hasta verificar: 1 publicación activa; los turnos se publican cuando te verifiquemos.
                                    </span>
                                </Stack>
                                <div>
                                    <Button variant="tonal" size="sm" onClick={noop}>
                                        Ver mi verificación
                                    </Button>
                                </div>
                            </Stack>
                        </Stack>
                    </Card>
                    <DemoLabel>
                        Card informativa con tile, VerificationBadge del estado, lo que habilita hoy y el acceso a VER-04.
                        Desaparece cuando la organización queda verificada: desde ahí basta la insignia junto al nombre.
                    </DemoLabel>
                </DemoRow>
            </DemoSection>

            <DemoSection title="Estados · Card tocable">
                <DemoSection title="Default">
                    <Card onClick={noop}>
                        <NextShift chevron />
                    </Card>
                </DemoSection>
                <DemoSection title="Presionado">
                    <Card onClick={noop} className="is-pressed">
                        <NextShift chevron />
                    </Card>
                </DemoSection>
                <DemoSection title="Foco">
                    <Card onClick={noop} className="is-focus">
                        <NextShift chevron />
                    </Card>
                </DemoSection>
                <DemoSection title="Seleccionado">
                    <DemoNotApplicable>Una tarjeta para elegir es un OptionCard.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Deshabilitado">
                    <DemoNotApplicable>Una tarjeta no se deshabilita: si no hay acción, es una Card informativa.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Error">
                    <DemoNotApplicable>El error va en un Banner dentro o sobre la tarjeta.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Cargando">
                    <DemoNotApplicable>Mientras carga se muestra Skeleton de tarjeta (Lote 5).</DemoNotApplicable>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
