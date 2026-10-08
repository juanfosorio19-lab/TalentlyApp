import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { BottomSheet } from '../BottomSheet';
import { IconPhone, IconShield } from '../icons';
import { PromotedBadge } from '../PromotedBadge';
import { VerificationBadge } from './VerificationBadge';

// En la app abre la hoja «Verificación de …» (abajo, abierta en su marco).
const noop = () => {};

// Perfil de Jorge bajo el velo, como en la referencia.
const PROFILE_BEHIND = [
    ['Guardia de seguridad', 'Puente Alto · 5 a 10 años de experiencia'],
    ['Confiabilidad 96 %', '25 turnos cumplidos'],
    ['Credencial SPD', 'Vence 03/2028'],
    ['Disponibilidad', 'Turnos de noche y fines de semana'],
] as const;

const demo: DemoModule = {
    name: 'VerificationBadge',
    group: 'Datos y confianza',
    summary:
        'Insignia de confianza: sin verificar, en revisión, verificado (el único con escudo) y vencido. Se toca y abre qué se verificó y cuándo. Nunca se parece ni va pegada a «Destacado».',
    Demo: () => (
        <>
            <DemoSection title="4 estados · se toca para ver qué se verificó y cuándo">
                <DemoRow>
                    <VerificationBadge status="unverified" onClick={noop}>Identidad sin verificar</VerificationBadge>
                    <VerificationBadge status="review" onClick={noop}>Identidad en revisión</VerificationBadge>
                    <VerificationBadge status="verified" onClick={noop}>Identidad verificada</VerificationBadge>
                    <VerificationBadge status="expired" onClick={noop}>Verificación vencida</VerificationBadge>
                </DemoRow>
                <DemoLabel>
                    Niveles con el mismo componente: «Teléfono verificado», «Identidad verificada», «Organización
                    verificada».
                </DemoLabel>
                <DemoRow>
                    <VerificationBadge status="verified" onClick={noop}>Teléfono verificado</VerificationBadge>
                    <VerificationBadge status="verified" onClick={noop}>Organización verificada</VerificationBadge>
                    <VerificationBadge status="verified" onClick={noop}>SEC gas clase 3</VerificationBadge>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Al lado, PromotedBadge «Destacado»: no se parecen">
                <DemoRow>
                    <DemoItem label="Verificación · de color, con escudo, se toca">
                        <VerificationBadge status="verified" onClick={noop}>Organización verificada</VerificationBadge>
                    </DemoItem>
                    <DemoItem label="Pagado · neutro, con borde y flecha que sube, no se toca">
                        <PromotedBadge />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="En una tarjeta · nunca pegados">
                <div className="tl-card">
                    <div className="tl-pub__head">
                        <Avatar name="Seguridad Andes Ltda." kind="org" />
                        <span className="tl-pub__by">Seguridad Andes Ltda.</span>
                        <PromotedBadge />
                        <div className="tl-pub__trust">
                            <VerificationBadge status="verified" onClick={noop}>Organización verificada</VerificationBadge>
                        </div>
                    </div>
                </div>
            </DemoSection>
            <DemoSection title="Al tocar · qué se verificó y cuándo">
                <DemoFrame height={430}>
                    <div className="tl-app-screen__content">
                        {PROFILE_BEHIND.map(([title, meta]) => (
                            <div key={title} className="tl-card">
                                <div className="body-l">{title}</div>
                                <div className="body">{meta}</div>
                            </div>
                        ))}
                    </div>
                    <BottomSheet open onClose={noop} title="Verificación de Jorge Muñoz" portal={false} modal={false}>
                        <ul className="tl-list tl-list--flat">
                            <li>
                                <div className="tl-listitem">
                                    <span className="tl-listitem__tile"><IconPhone /></span>
                                    <span className="tl-listitem__body">
                                        <span className="tl-listitem__title">Teléfono verificado</span>
                                        <span className="tl-listitem__sub">Código SMS · 2 dic 2026</span>
                                    </span>
                                </div>
                            </li>
                            <li>
                                <div className="tl-listitem">
                                    <span className="tl-listitem__tile"><IconShield /></span>
                                    <span className="tl-listitem__body">
                                        <span className="tl-listitem__title">Identidad verificada</span>
                                        <span className="tl-listitem__sub">Cédula y selfie revisadas · 3 dic 2026</span>
                                    </span>
                                </div>
                            </li>
                        </ul>
                        <p className="caption dev-label">
                            Nunca mostramos tu RUT, tu fecha de nacimiento ni las fotos de tu cédula.
                        </p>
                    </BottomSheet>
                </DemoFrame>
                <DemoLabel>Es la hoja real (BottomSheet) abierta en su marco, con la lista plana (tl-list--flat).</DemoLabel>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoItem label="default · los 4 estados, arriba">
                    <VerificationBadge status="verified" onClick={noop}>Identidad verificada</VerificationBadge>
                </DemoItem>
                <DemoItem label="presionado">
                    <VerificationBadge status="verified" onClick={noop} className="is-pressed">Identidad verificada</VerificationBadge>
                </DemoItem>
                <DemoItem label="foco">
                    <VerificationBadge status="verified" onClick={noop} className="is-focus">Identidad verificada</VerificationBadge>
                </DemoItem>
                <DemoItem label="seleccionado: no se marca; abre la hoja.">
                    <Badge>No aplica</Badge>
                </DemoItem>
                <DemoItem label="deshabilitado: siempre se puede tocar para ver el detalle.">
                    <Badge>No aplica</Badge>
                </DemoItem>
                <DemoItem label="error · «Verificación vencida» (danger) o el estado «Rechazada» de una credencial">
                    <VerificationBadge status="expired" onClick={noop}>Verificación vencida</VerificationBadge>
                </DemoItem>
                <DemoItem label="cargando · «Identidad en revisión» mientras Talently revisa">
                    <VerificationBadge status="review" onClick={noop}>Identidad en revisión</VerificationBadge>
                </DemoItem>
            </DemoSection>
        </>
    ),
};

export default demo;
