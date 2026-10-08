import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { BrandLogo, type BrandLogoVariant } from './BrandLogo';

/** Los tres tamaños de una variante, con su medida debajo. */
function Sizes({ variant }: { variant: BrandLogoVariant }) {
    return (
        <DemoRow>
            <DemoItem label="sm 32"><BrandLogo size="sm" variant={variant} /></DemoItem>
            <DemoItem label="md 56"><BrandLogo size="md" variant={variant} /></DemoItem>
            <DemoItem label="lg 72"><BrandLogo size="lg" variant={variant} /></DemoItem>
        </DemoRow>
    );
}

const demo: DemoModule = {
    name: 'BrandLogo',
    group: 'Marca',
    summary:
        'El logo oficial, la «T» de Talently: con tile o sin tile, en sm 32, md 56 y lg 72. Decorativo; «Talently» se escribe aparte. Sobre un gradiente, solo con tile.',
    Demo: () => (
        <>
            <DemoSection title="Sobre el fondo · color-bg">
                <DemoLabel>Con tile · sección 10.1 · usar</DemoLabel>
                <Sizes variant="tile" />
                <DemoLabel>Sin tile · sección 10.2 · usar</DemoLabel>
                <Sizes variant="plain" />
            </DemoSection>
            <DemoSection title="Sobre una tarjeta · color-surface">
                <div className="tl-card">
                    <DemoRow column>
                        <DemoLabel>Con tile · usar</DemoLabel>
                        <Sizes variant="tile" />
                        <DemoLabel>Sin tile · usar</DemoLabel>
                        <Sizes variant="plain" />
                    </DemoRow>
                </div>
            </DemoSection>
            <DemoSection title="Sobre el hero de Bienvenida (gradient-brand en claro, gradient-hero-dark en oscuro)">
                <DemoLabel>Con tile · usar</DemoLabel>
                <div className="tl-hero dev-hero">
                    <DemoRow>
                        <BrandLogo size="sm" />
                        <BrandLogo size="md" />
                        <BrandLogo size="lg" />
                    </DemoRow>
                </div>
                <DemoLabel>Sin tile · no usar: desaparece sobre gradient-brand; 2,47:1 sobre gradient-hero-dark</DemoLabel>
                <div className="tl-hero dev-hero">
                    <DemoRow>
                        <BrandLogo size="sm" variant="plain" />
                        <BrandLogo size="md" variant="plain" />
                        <BrandLogo size="lg" variant="plain" />
                    </DemoRow>
                </div>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoItem label="default · mostrado arriba">
                    <BrandLogo size="sm" />
                </DemoItem>
                <DemoItem label="presionado · foco · seleccionado · deshabilitado · error · cargando: el logo no se toca ni cambia; es solo marca.">
                    <Badge>No aplica</Badge>
                </DemoItem>
            </DemoSection>
        </>
    ),
};

export default demo;
