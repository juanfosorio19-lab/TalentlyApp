import type { ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { IconInfo } from '../icons';
import { Stack } from '../Layout';
import { ActionPair } from './ActionPair';

// En el catálogo los botones no hacen nada: en la app, lo mismo que el swipe.
const noop = () => {};

/** Un estado: su nombre arriba y el par centrado, como en el sistema de diseño. */
function State({ label, children }: { label: string; children: ReactNode }) {
    return (
        <DemoRow column>
            <DemoLabel>{label}</DemoLabel>
            {children}
        </DemoRow>
    );
}

const demo: DemoModule = {
    name: 'ActionPair',
    group: 'Acciones',
    summary:
        '«No me interesa» (56, outline) y «Me interesa» (64, primary) con la etiqueta debajo: el mismo par en el deck de empleos, el detalle y Personas sugeridas.',
    Demo: () => (
        <>
            <DemoSection title="El mismo par en el deck de empleos, en el detalle y en Personas sugeridas">
                <ActionPair onYes={noop} onNo={noop} />
            </DemoSection>
            <DemoSection title="Personas sugeridas · Seguridad Andes Ltda. ve a Jorge Muñoz">
                <div className="tl-card">
                    <Stack gap={4}>
                        <Stack row gap={3}>
                            <Avatar name="Jorge Muñoz" size={56} verified />
                            <span className="tl-listitem__body">
                                <span className="tl-listitem__title">Jorge Muñoz</span>
                                <span className="tl-listitem__sub">Guardia de seguridad · Puente Alto</span>
                                <span className="tl-listitem__sub">Credencial SPD verificada · vence 03/2028</span>
                            </span>
                        </Stack>
                        <span className="tl-reliab-inline">
                            Confiabilidad <b>96 %</b> · 25 turnos cumplidos
                        </span>
                        <ActionPair onYes={noop} onNo={noop} subject="Jorge Muñoz" />
                    </Stack>
                </div>
                <div className="tl-snackbar tl-snackbar--static" role="status">
                    <span className="tl-snackbar__icon">
                        <IconInfo />
                    </span>
                    <span className="tl-snackbar__text">Invitaste a Jorge a postular</span>
                    <Button variant="ghost" size="sm" onClick={noop}>
                        Deshacer
                    </Button>
                </div>
                <DemoLabel>Aquí «Me interesa» envía la invitación a postular y muestra el Snackbar con «Deshacer».</DemoLabel>
            </DemoSection>
            <DemoSection title="Estados">
                <State label="default">
                    <ActionPair onYes={noop} onNo={noop} />
                </State>
                <State label="presionado · «Me interesa» pasa a primary-pressed">
                    <ActionPair onYes={noop} onNo={noop} yesProps={{ className: 'is-pressed' }} />
                </State>
                <State label="presionado · «No me interesa» suma una capa al 12 %">
                    <ActionPair onYes={noop} onNo={noop} noProps={{ className: 'is-pressed' }} />
                </State>
                <State label="presionado por el arrastre del Deck · dragging=«yes»: la tarjeta va hacia «Me interesa»">
                    <ActionPair onYes={noop} onNo={noop} dragging="yes" />
                </State>
                <State label="foco">
                    <ActionPair onYes={noop} onNo={noop} yesProps={{ className: 'is-focus' }} />
                </State>
                <DemoItem label="seleccionado: tras tocar, la tarjeta sale del deck o el par se reemplaza por el Badge «Postulado» o «Invitado».">
                    <Badge>No aplica</Badge>
                </DemoItem>
                <State label="deshabilitado · sin conexión: se habilita al volver la señal">
                    <ActionPair onYes={noop} onNo={noop} disabled />
                </State>
                <DemoItem label="error: si falla, la tarjeta vuelve y aparece un Snackbar de error con «Reintentar».">
                    <Badge>No aplica</Badge>
                </DemoItem>
                <State label="cargando">
                    <ActionPair onYes={noop} onNo={noop} loading="yes" loadingLabel="Enviando tu postulación…" />
                </State>
            </DemoSection>
        </>
    ),
};

export default demo;
