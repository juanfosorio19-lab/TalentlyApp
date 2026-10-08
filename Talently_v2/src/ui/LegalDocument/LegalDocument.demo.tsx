import { useId } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoSection } from '../catalog/demo';
import { LegalDocument } from './LegalDocument';

/** Estado que el componente no tiene, con su motivo (como en el sistema de diseño). */
function NotApplicable({ children }: { children: string }) {
    return (
        <span className="body">
            <span className="tl-badge">No aplica</span> {children}
        </span>
    );
}

function LegalDocumentDemo() {
    // El catálogo muestra la demo dos veces (claro y oscuro): anclas distintas en cada una.
    const p = useId();
    return (
        <>
            <DemoSection title="LEG-01 · Términos y condiciones (extracto)">
                <LegalDocument
                    title="Términos y condiciones"
                    updated={<>Actualizados el <time dateTime="2026-12-01">1 dic 2026</time></>}
                    sections={[
                        {
                            id: `${p}-talently`,
                            title: 'Qué es Talently',
                            body: (
                                <>
                                    <p>
                                        Talently conecta a personas que buscan trabajo, turnos, servicios o clases con
                                        organizaciones, hogares y personas que contratan.
                                    </p>
                                    <p>
                                        Talently solo intermedia: no es tu empleador, no paga sueldos y no guarda dinero de
                                        otras personas.
                                    </p>
                                </>
                            ),
                        },
                        {
                            id: `${p}-cuenta`,
                            title: 'Tu cuenta',
                            body: <p>Necesitas tener 18 años o más. Tus datos deben ser verdaderos y la cuenta es solo tuya.</p>,
                        },
                        {
                            id: `${p}-postular`,
                            title: 'Postular, tomar turnos y publicar',
                            body: (
                                <ul>
                                    <li>Postular, tomar turnos, verificarte y chatear siempre es gratis.</li>
                                    <li>Quien publica te contrata o te paga directamente.</li>
                                </ul>
                            ),
                        },
                    ]}
                />
                <DemoLabel>
                    Una sola fecha de actualización arriba. El índice son ListItems que bajan a cada sección; el texto va en
                    Body-L (16/24) en color-text, con H2 por sección y listas con viñeta.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoSection title="Default"><DemoLabel>Mostrado arriba.</DemoLabel></DemoSection>
                <DemoSection title="Presionado"><NotApplicable>Lo tienen las filas del índice (ListItem).</NotApplicable></DemoSection>
                <DemoSection title="Foco">
                    <NotApplicable>Lo tienen las filas del índice; al bajar, el foco pasa al H2 de la sección.</NotApplicable>
                </DemoSection>
                <DemoSection title="Seleccionado"><NotApplicable>No se marca: el índice navega.</NotApplicable></DemoSection>
                <DemoSection title="Deshabilitado"><NotApplicable>No aplica.</NotApplicable></DemoSection>
                <DemoSection title="Error">
                    <NotApplicable>
                        Si no carga, ErrorState con «Reintentar»; sin conexión se muestra la última versión guardada con su fecha.
                    </NotApplicable>
                </DemoSection>
                <DemoSection title="Cargando"><NotApplicable>Skeleton con líneas de texto.</NotApplicable></DemoSection>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'LegalDocument',
    group: 'Estructura',
    summary: 'Plantilla de Términos y Privacidad: H1, una sola fecha, índice «En esta página» que baja a cada sección y secciones con H2 numerado en Body-L.',
    Demo: LegalDocumentDemo,
};

export default demo;
