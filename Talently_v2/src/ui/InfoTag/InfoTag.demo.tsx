import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Chip } from '../Chip';
import { InfoTag, InfoTags } from './InfoTag';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

const demo: DemoModule = {
    name: 'InfoTag',
    group: 'Publicaciones',
    summary: 'Dato clave de una publicación con su ícono de 16 (jornada, contrato, fecha, modalidad). No se toca: no es Chip ni Badge. Un ícono por tipo de dato.',
    Demo: () => (
        <>
            <DemoSection title="InfoTag · alto 28 · radio sm · ícono 16 + Body 14">
                <InfoTags>
                    <InfoTag kind="jornada">Jornada completa</InfoTag>
                    <InfoTag kind="contrato">Plazo fijo</InfoTag>
                    <InfoTag kind="fecha">Turno de noche</InfoTag>
                </InfoTags>
            </DemoSection>
            <DemoSection title="Un ícono por tipo de dato, no por valor">
                <DemoRow column>
                    <DemoItem label="Jornada · IconClock">
                        <InfoTags>
                            <InfoTag kind="jornada">Jornada completa</InfoTag>
                            <InfoTag kind="jornada">Part time</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Contrato · IconDocument">
                        <InfoTags>
                            <InfoTag kind="contrato">Plazo fijo</InfoTag>
                            <InfoTag kind="contrato">Boleta de honorarios</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Fecha u horario · IconCalendar">
                        <InfoTags>
                            <InfoTag kind="fecha">sáb 12 dic · 18:00–00:00 (6 h)</InfoTag>
                            <InfoTag kind="fecha">Turno de noche</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Modalidad · IconLocation">
                        <InfoTags>
                            <InfoTag kind="modalidad">Online</InfoTag>
                            <InfoTag kind="modalidad">En la casa del alumno</InfoTag>
                            <InfoTag kind="modalidad">Presencial</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Clase de prueba · IconBook">
                        <InfoTags>
                            <InfoTag kind="prueba">Clase de prueba gratis</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Cupos · IconPeople · lugar · IconLocation · experiencia · IconOffers">
                        <InfoTags>
                            <InfoTag kind="cupos">8 cupos</InfoTag>
                            <InfoTag kind="lugar">a 3 km · Ñuñoa</InfoTag>
                            <InfoTag kind="experiencia">5 a 10 años de experiencia</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Sin tipo · bloques horarios (ACT-04)">
                        <InfoTags>
                            <InfoTag>16:00–21:00</InfoTag>
                        </InfoTags>
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="No se confunde con Chip ni con Badge">
                <DemoRow>
                    <DemoItem label="InfoTag · radio sm, sin borde · no se toca">
                        <InfoTags>
                            <InfoTag kind="jornada">Part time</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <DemoItem label="Chip · pill de 36 con borde · filtra o elige">
                        <Chip>Part time</Chip>
                    </DemoItem>
                    <DemoItem label="Badge · pill de 24, 12/600 · es un estado">
                        <Badge status="Postulado" />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow column>
                    <DemoItem label="default">
                        <InfoTags>
                            <InfoTag kind="jornada">Jornada completa</InfoTag>
                        </InfoTags>
                    </DemoItem>
                    <StateNote state="presionado">No se toca.</StateNote>
                    <StateNote state="foco">No recibe foco; se lee como parte de la lista de datos.</StateNote>
                    <StateNote state="seleccionado">Para elegir se usa Chip.</StateNote>
                    <StateNote state="deshabilitado">No aplica.</StateNote>
                    <StateNote state="error">No aplica.</StateNote>
                    <StateNote state="cargando" na={false}>Skeleton tl-skel--tag (28, radio sm) dentro del Skeleton de tarjeta.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
