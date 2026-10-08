import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { IconBoost } from '../icons';
import { VerificationBadge } from '../VerificationBadge';
import { PromotedBadge } from './PromotedBadge';

// La insignia de verificación del ejemplo abre su hoja en la app.
const noop = () => {};

const NOT_APPLICABLE: Array<[string, string]> = [
    ['presionado', 'no se toca'],
    ['foco', 'no recibe foco'],
    ['seleccionado', 'no se marca'],
    ['deshabilitado', 'no aplica'],
    ['error', 'no aplica'],
    ['cargando', 'no aplica'],
];

const SOON: Array<{ title: string; sub: string }> = [
    { title: 'Impulsa tu perfil', sub: 'Aparece antes en las búsquedas de tu oficio' },
    { title: 'Publicación Premium', sub: 'Tu publicación con la etiqueta «Destacado»' },
];

const demo: DemoModule = {
    name: 'PromotedBadge',
    group: 'Datos y confianza',
    summary:
        '«Destacado» para todo lo pagado (Premium, perfil impulsado): neutro, con borde y flecha que sube, no se toca. Antes de F3, el Badge neutral «Pronto».',
    Demo: () => (
        <>
            <DemoSection title="PromotedBadge · pill de 24 · color-surface · borde 1 color-border-strong · texto 12/600 color-text-2 · ícono impulso de 14">
                <DemoRow>
                    <PromotedBadge />
                </DemoRow>
            </DemoSection>
            <DemoSection title="En la tarjeta · arriba a la derecha, lejos de la insignia">
                <div className="tl-card">
                    <div className="tl-pub__head">
                        <Avatar name="Banquetería Rosa SpA" kind="org" />
                        <span className="tl-pub__by">Banquetería Rosa SpA</span>
                        <PromotedBadge />
                        <div className="tl-pub__trust">
                            <VerificationBadge status="verified" onClick={noop}>Organización verificada</VerificationBadge>
                        </div>
                    </div>
                </div>
            </DemoSection>
            <DemoSection title="Antes de que se pueda comprar (F1 y F2) · Badge neutral «Pronto»">
                <ul className="tl-list">
                    {SOON.map(({ title, sub }) => (
                        <li key={title}>
                            <div className="tl-listitem">
                                <span className="tl-listitem__tile"><IconBoost /></span>
                                <span className="tl-listitem__body">
                                    <span className="tl-listitem__title">{title}</span>
                                    <span className="tl-listitem__sub">{sub}</span>
                                </span>
                                <span className="tl-listitem__end"><Badge status="Pronto" /></span>
                            </div>
                        </li>
                    ))}
                </ul>
                <DemoLabel>
                    En F1 y F2 se muestran con «Pronto» en lugar del precio y no se pueden comprar. La compra llega en F3.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoItem label="default · mostrado arriba">
                    <PromotedBadge />
                </DemoItem>
                {NOT_APPLICABLE.map(([state, why]) => (
                    <DemoItem key={state} label={`${state}: ${why}.`}>
                        <Badge>No aplica</Badge>
                    </DemoItem>
                ))}
            </DemoSection>
        </>
    ),
};

export default demo;
