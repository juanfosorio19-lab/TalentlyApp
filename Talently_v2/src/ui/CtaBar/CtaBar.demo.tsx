import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoSection } from '../catalog/demo';
import { Button } from '../Button';
import { Snackbar } from '../Snackbar';
import { CtaBar } from './CtaBar';

/** Estado que el componente no tiene, con su motivo (como en el sistema de diseño). */
function NotApplicable({ children }: { children: string }) {
    return (
        <span className="body">
            <span className="tl-badge">No aplica</span> {children}
        </span>
    );
}

const demo: DemoModule = {
    name: 'CtaBar',
    group: 'Estructura',
    summary: 'CTA fijo inferior de StepLayout y ResultScreen: Button primary lg a lo ancho y, si hace falta, un ghost aparte. Con scroll debajo gana superficie y sombra.',
    Demo: () => (
        <>
            <DemoSection title="StepLayout · «Continuar»">
                <DemoFrame>
                    <CtaBar>
                        <Button size="lg" block>Continuar</Button>
                    </CtaBar>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Paso opcional · «Omitir» como ghost aparte">
                <DemoFrame>
                    <CtaBar>
                        <Button size="lg" block>Continuar</Button>
                        <Button variant="ghost" block>Omitir</Button>
                    </CtaBar>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="ResultScreen · primary y ghost lg">
                <DemoFrame>
                    <CtaBar>
                        <Button size="lg" block>Ver mis postulaciones</Button>
                        <Button variant="ghost" size="lg" block>Seguir explorando</Button>
                    </CtaBar>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Con contenido debajo · gana superficie y sombra">
                <DemoFrame>
                    <CtaBar scrolled>
                        <Button size="lg" block>Continuar</Button>
                    </CtaBar>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoSection title="Default"><DemoLabel>Mostrado arriba.</DemoLabel></DemoSection>
                <DemoSection title="Presionado">
                    <DemoFrame>
                        <CtaBar>
                            <Button size="lg" block className="is-pressed">Continuar</Button>
                        </CtaBar>
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Foco">
                    <DemoFrame>
                        <CtaBar>
                            <Button size="lg" block className="is-focus">Continuar</Button>
                        </CtaBar>
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Seleccionado"><NotApplicable>No se marca.</NotApplicable></DemoSection>
                <DemoSection title="Deshabilitado · mientras falte algo obligatorio; el paso dice qué falta">
                    <DemoFrame>
                        <CtaBar>
                            <Button size="lg" block disabled>Continuar</Button>
                        </CtaBar>
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Error · no se pudo guardar: Snackbar estático encima del botón">
                    <DemoFrame>
                        <CtaBar>
                            <Snackbar
                                tone="error"
                                placement="static"
                                message="No pudimos guardar este paso"
                                action={{ label: 'Reintentar', onAction: () => {} }}
                            />
                            <Button size="lg" block>Continuar</Button>
                        </CtaBar>
                    </DemoFrame>
                </DemoSection>
                <DemoSection title="Cargando · guardando el paso">
                    <DemoFrame>
                        <CtaBar>
                            {/* aria-label: el .tl-vh de loadingLabel queda oculto por bundle.css mientras carga. */}
                            <Button size="lg" block loading loadingLabel="Guardando…" aria-label="Guardando…">
                                Continuar
                            </Button>
                        </CtaBar>
                    </DemoFrame>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
