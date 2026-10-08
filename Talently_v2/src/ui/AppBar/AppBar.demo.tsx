import type { ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { IconBell, IconFilter, IconGear, IconHeart, IconMore, IconShare } from '../icons';
import { IconButton } from '../IconButton';
import { ActorSelector, AppBar } from './AppBar';

// En el catálogo los botones no navegan: en la app, onBack = useGoBack() y el resto abre su hoja o pantalla.
const noop = () => {};

/** Una muestra con su rótulo arriba, como en el sistema de diseño. */
function Example({ caption, width, height, children }: { caption?: string; width?: 360 | 390 | 412; height?: number; children: ReactNode }) {
    return (
        <DemoRow column tight>
            {caption && <DemoLabel>{caption}</DemoLabel>}
            <DemoFrame width={width} height={height}>
                {children}
            </DemoFrame>
        </DemoRow>
    );
}

const bell = <IconButton icon={IconBell} label="Notificaciones" onClick={noop} />;
const jorge = <ActorSelector name="Jorge Muñoz" shortName="Jorge" onClick={noop} />;
const share = <IconButton icon={IconShare} label="Compartir" onClick={noop} />;
const save = <IconButton icon={IconHeart} label="Guardar" onClick={noop} />;
const more = <IconButton icon={IconMore} label="Más opciones" aria-haspopup="dialog" onClick={noop} />;

const andes = {
    name: 'Seguridad Andes Ltda.',
    meta: 'Organización verificada',
    kind: 'org' as const,
    verified: true,
    href: '#perfil-seguridad-andes',
    onClick: (e: { preventDefault: () => void }) => e.preventDefault(),
};

const demo: DemoModule = {
    name: 'AppBar',
    group: 'Estructura',
    summary:
        'La barra superior, una por pantalla: large en pestañas (H1 y acciones), standard en pantallas apiladas (BackButton, H3 centrado, hasta 2 acciones), conversación y transparente. Con scroll gana superficie y sombra.',
    Demo: () => (
        <>
            <DemoSection title="Large · pestañas · título H1 a la izquierda">
                <Example caption="Inicio · Jorge Muñoz (también es miembro de Seguridad Andes Ltda.)">
                    <AppBar title="Inicio" actions={<>{jorge}{bell}</>} />
                </Example>
                <Example caption="Inicio · usando la app como la organización">
                    <AppBar
                        title="Inicio"
                        actions={
                            <>
                                <ActorSelector name="Seguridad Andes Ltda." shortName="Seguridad Andes" kind="org" onClick={noop} />
                                {bell}
                            </>
                        }
                    />
                </Example>
                <Example caption="Explorar · Filtros solo aquí">
                    <AppBar
                        title="Explorar"
                        actions={
                            <>
                                <IconButton icon={IconFilter} label="Filtros" onClick={noop} />
                                {bell}
                            </>
                        }
                    />
                </Example>
                <Example caption="Perfil · selector de actor, campana y Ajustes">
                    <AppBar
                        title="Perfil"
                        actions={
                            <>
                                {jorge}
                                {bell}
                                <IconButton icon={IconGear} label="Ajustes" onClick={noop} />
                            </>
                        }
                    />
                </Example>
                <Example
                    caption="A 360 · organización con nombre largo: el selector baja a 144 px de máximo y el saludo no se corta"
                    width={360}
                >
                    <AppBar
                        title="Hola, Rosa"
                        actions={
                            <>
                                <ActorSelector name="Banquetería Rosa SpA" kind="org" onClick={noop} />
                                {bell}
                            </>
                        }
                    />
                </Example>
                <Example caption="Actividad y Mensajes · solo la campana (persona sin organización: sin selector)">
                    <AppBar title="Mensajes" actions={bell} />
                </Example>
                <Example caption="Al hacer scroll · gana color-surface y elev-2" height={72}>
                    <AppBar
                        title="Explorar"
                        scrolled
                        actions={
                            <>
                                <IconButton icon={IconFilter} label="Filtros" onClick={noop} />
                                {bell}
                            </>
                        }
                    />
                </Example>
            </DemoSection>

            <DemoSection title="Standard · pantallas apiladas · BackButton, título H3 centrado, máximo 2 acciones">
                <Example>
                    <AppBar variant="standard" title="Detalle del turno" onBack={noop} actions={<>{share}{more}</>} />
                </Example>
                <Example caption="Título largo · se corta con «…»">
                    <AppBar variant="standard" title="Garzones para matrimonio en Las Condes" onBack={noop} actions={save} />
                </Example>
                <Example caption="Al hacer scroll" height={72}>
                    <AppBar variant="standard" title="Detalle del turno" scrolled onBack={noop} actions={<>{share}{more}</>} />
                </Example>
            </DemoSection>

            <DemoSection title="Conversación (M5) · BackButton, quién está al otro lado y ⋯">
                <Example>
                    <AppBar variant="chat" peer={andes} onBack={noop} onMore={noop} />
                </Example>
                <Example caption="Nombre largo · se corta con «…»">
                    <AppBar
                        variant="chat"
                        peer={{ ...andes, name: 'Mantención Industrial Poniente SpA', href: '#perfil-mantencion-industrial' }}
                        onBack={noop}
                        onMore={noop}
                    />
                </Example>
                <DemoLabel>
                    Avatar de 40 con el punto de verificación solo si la verificación es real. Tocar el nombre abre su
                    perfil público; ⋯ abre Ver publicación · Reportar · Bloquear.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Transparente · íconos sobre círculo color-surface al 90 %">
                <Example caption="Sobre una foto (F3 · galería de un servicio)" height={260}>
                    {/* El AppBar va antes de la foto en el DOM: la foto pasa por debajo. */}
                    <AppBar
                        variant="transparent"
                        title="Gasfitería e instalación de gas"
                        onBack={noop}
                        actions={<>{share}{save}</>}
                    />
                    {/* Una foto real nunca es de stock: en el catálogo, el recuadro rayado de la galería. */}
                    <div className="tl-capture__shot">
                        <span>Foto del trabajo, subida por el prestador</span>
                    </div>
                </Example>
                <Example caption="Transparente después del scroll · pasa a standard" height={72}>
                    <AppBar
                        variant="transparent"
                        title="Guardia de seguridad 4x4"
                        scrolled
                        onBack={noop}
                        actions={<>{share}{save}</>}
                    />
                </Example>
                <DemoLabel>Sin título hasta el scroll; el título aparece en el AppBar al hacer scroll.</DemoLabel>
            </DemoSection>

            <DemoSection title="Estados">
                <DemoSection title="Default">
                    <DemoLabel>Mostrado arriba. El AppBar no se toca: lo hacen sus botones y el selector de actor.</DemoLabel>
                </DemoSection>
                <DemoSection title="Presionado">
                    <Example>
                        <AppBar
                            title="Inicio"
                            actions={
                                <>
                                    <ActorSelector name="Jorge Muñoz" shortName="Jorge" className="is-pressed" onClick={noop} />
                                    <IconButton icon={IconBell} label="Notificaciones" className="is-pressed" onClick={noop} />
                                </>
                            }
                        />
                    </Example>
                    <Example>
                        <AppBar variant="chat" peer={{ ...andes, className: 'is-pressed' }} onBack={noop} onMore={noop} />
                    </Example>
                </DemoSection>
                <DemoSection title="Foco">
                    <Example>
                        <AppBar
                            title="Inicio"
                            actions={
                                <>
                                    <ActorSelector name="Jorge Muñoz" shortName="Jorge" className="is-focus" onClick={noop} />
                                    {bell}
                                </>
                            }
                        />
                    </Example>
                    <Example>
                        <AppBar variant="chat" peer={{ ...andes, className: 'is-focus' }} onBack={noop} onMore={noop} />
                    </Example>
                </DemoSection>
                <DemoSection title="Seleccionado">
                    <DemoNotApplicable>El AppBar no se marca; la pestaña activa la indica la BottomTabBar.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Deshabilitado">
                    <DemoNotApplicable>
                        Una acción que no se puede usar no se muestra en el AppBar (cero botones fantasma).
                    </DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Error">
                    <DemoNotApplicable>Los errores van en un Banner bajo el AppBar o en un Snackbar.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Cargando">
                    <DemoNotApplicable>El título y las acciones no esperan datos; carga el contenido, con Skeleton.</DemoNotApplicable>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
