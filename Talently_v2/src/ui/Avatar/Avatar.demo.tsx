import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Avatar, type AvatarProps, type AvatarSize } from './Avatar';

const SIZES: AvatarSize[] = [32, 40, 56, 96];

/** Los 4 tamaños con la medida debajo. */
function Sizes(props: Omit<AvatarProps, 'size'>) {
    return (
        <DemoRow>
            {SIZES.map((size) => (
                <DemoItem key={size} label={String(size)}>
                    <Avatar size={size} {...props} />
                </DemoItem>
            ))}
        </DemoRow>
    );
}

const EXAMPLES: Array<{ name: string; kind: AvatarProps['kind']; verified?: boolean; who: string }> = [
    { name: 'Matías Rojas', kind: 'person', verified: true, who: 'Persona · verificado' },
    { name: 'Marta Huanca', kind: 'person', who: 'Persona' },
    { name: 'Camila Fuentes', kind: 'person', verified: true, who: 'Persona · verificado' },
    { name: 'Luis Contreras', kind: 'person', verified: true, who: 'Persona · verificado' },
    { name: 'Seguridad Andes Ltda.', kind: 'org', verified: true, who: 'Organización · verificado' },
    { name: 'Banquetería Rosa SpA', kind: 'org', verified: true, who: 'Organización · verificado' },
    { name: 'Familia en Ñuñoa', kind: 'org', who: 'Hogar' },
    { name: 'Hotel Andino', kind: 'org', verified: true, who: 'Organización · verificado' },
];

const NOT_APPLICABLE: Array<[string, string]> = [
    ['presionado', 'el avatar no se toca solo: lo hace la fila, la tarjeta o el selector de actor que lo contiene'],
    ['foco', 'lo tiene el elemento que lo contiene'],
    ['seleccionado', 'la selección la muestra el control que lo contiene'],
    ['deshabilitado', 'un avatar no se deshabilita'],
    ['error', 'si la foto no carga, se muestran las iniciales'],
    ['cargando', 'mientras carga, Skeleton circular o cuadrado del mismo tamaño'],
];

const demo: DemoModule = {
    name: 'Avatar',
    group: 'Datos y confianza',
    summary:
        'Persona redonda, organización cuadrada (también «Familia en …»), en 32, 40, 56 y 96. Iniciales sobre primary-subtle, foto en prestadores y escudo solo con verificación real.',
    Demo: () => (
        <>
            <DemoSection title="Persona · redondo · iniciales sobre primary-subtle">
                <Sizes name="Matías Rojas" />
            </DemoSection>
            <DemoSection title="Persona · con punto de verificación">
                <Sizes name="Matías Rojas" verified />
            </DemoSection>
            <DemoSection title="Organización · cuadrado radius-md (radius-sm en 32)">
                <Sizes name="Seguridad Andes Ltda." kind="org" />
            </DemoSection>
            <DemoSection title="Organización · con punto de verificación">
                <Sizes name="Seguridad Andes Ltda." kind="org" verified />
            </DemoSection>
            <DemoSection title="Con foto (M10) · prestadores de servicios: la foto es obligatoria">
                <DemoRow>
                    {SIZES.map((size) => (
                        <DemoItem key={size} label={String(size)}>
                            <Avatar
                                size={size}
                                name="Luis Contreras"
                                photo
                                verified={size >= 56}
                                label="Foto de Luis Contreras"
                            />
                        </DemoItem>
                    ))}
                </DemoRow>
                <DemoLabel>
                    En la app va la foto real (img). En los mockups se marca con el mismo rayado de las fotos de la
                    galería, para no confundirla con el avatar sin foto (iniciales) ni con «Agregar foto» del
                    MediaUploader.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Personas y organizaciones de ejemplo">
                <ul className="tl-list">
                    {EXAMPLES.map(({ name, kind, verified, who }) => (
                        <li key={name}>
                            <div className="tl-listitem">
                                <Avatar name={name} kind={kind} verified={verified} />
                                <span className="tl-listitem__body">
                                    <span className="tl-listitem__title">{name}</span>
                                    <span className="tl-listitem__sub">{who}</span>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoItem label="default · mostrado arriba">
                    <Avatar name="Matías Rojas" verified />
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
