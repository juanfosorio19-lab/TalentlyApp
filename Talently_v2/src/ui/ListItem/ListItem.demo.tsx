import type { MouseEvent } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { Amount } from '../Amount';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { ContextChipInRow } from '../ContextChip';
import {
    IconBell,
    IconCalendar,
    IconClock,
    IconDocument,
    IconEye,
    IconLogout,
    IconPeople,
    IconShield,
    IconTrash,
} from '../icons';
import { RatingStars } from '../RatingStars';
import { VerificationBadge } from '../VerificationBadge';
import { List, ListColumns, ListItem } from './ListItem';

// En el catálogo nada navega: en la app, onClick hace preventDefault() + navigate(href).
const stay = (event: MouseEvent<HTMLElement>) => event.preventDefault();
const noop = () => {};

const demo: DemoModule = {
    name: 'ListItem',
    group: 'Estructura',
    summary:
        'Fila de lista (alto mínimo 56) en ul.tl-list: tile o avatar, título y línea secundaria, y al final valor, chevron, Switch, Badge, no leído o quitar. Variantes conversación, persona, desplegable, dos canales y danger.',
    Demo: () => (
        <>
            <DemoSection title="Variantes · alto mínimo 56">
                <List>
                    <ListItem icon={IconBell} title="Notificaciones" href="#notificaciones" onClick={stay} />
                    <ListItem icon={IconEye} title="Apariencia" value="Según el sistema" href="#apariencia" onClick={stay} />
                    <ListItem
                        avatar={<Avatar name="Seguridad Andes Ltda." kind="org" verified />}
                        title="Seguridad Andes Ltda."
                        sub="Organización verificada · Puente Alto"
                        href="#seguridad-andes"
                        onClick={stay}
                    />
                    <ListItem
                        avatar={<Avatar name="Camila Fuentes" verified />}
                        title="Camila Fuentes"
                        sub="Profesora de Matemática · Ñuñoa"
                        href="#camila-fuentes"
                        onClick={stay}
                    />
                    <ListItem
                        icon={IconBell}
                        title="Avisarme de turnos nuevos"
                        sub="De tus oficios, a menos de 10 km"
                        toggle={{ defaultChecked: true }}
                    />
                    <ListItem
                        icon={IconShield}
                        title="Identidad"
                        sub="Cédula y selfie"
                        end={<Badge status="En revisión" />}
                        href="#identidad"
                        onClick={stay}
                    />
                    <ListItem
                        icon={IconPeople}
                        title="Faltan 2 garzones para el turno del vie 11 dic · 12:00"
                        sub="Banquetería Rosa SpA · hace 20 min"
                        unread
                        onClick={noop}
                    />
                    <ListItem
                        icon={IconDocument}
                        title="Certificado de manipulación de alimentos.pdf"
                        sub="240 KB"
                        onRemove={noop}
                        removeLabel="Quitar certificado"
                    />
                    <ListItem icon={IconLogout} title="Cerrar sesión" onClick={noop} />
                    <ListItem icon={IconTrash} title="Eliminar cuenta" sub="Abre una confirmación" danger onClick={noop} />
                </List>
            </DemoSection>

            <DemoSection title="Estado bajo el texto · Postulaciones y Publicaciones (M4)">
                <List>
                    <ListItem
                        avatar={<Avatar name="Seguridad Andes Ltda." kind="org" />}
                        title="Guardia de seguridad 4x4"
                        sub="Seguridad Andes Ltda. · entrevista mar 15 dic · 10:00"
                        status={<Badge status="Entrevista" />}
                        href="#postulacion-guardia"
                        onClick={stay}
                    />
                    <ListItem
                        avatar={<Avatar name="Banquetería Rosa SpA" kind="org" />}
                        title="Guardia de eventos"
                        sub="Banquetería Rosa SpA · sáb 19 dic · 19:00–03:00"
                        status={<Badge status="En lista de espera" />}
                        href="#postulacion-eventos"
                        onClick={stay}
                    />
                    <ListItem
                        icon={IconClock}
                        title="Garzones para matrimonio"
                        sub="Turno · sáb 12 dic · 5 de 8 cupos confirmados"
                        status={<Badge status="Activa" />}
                        href="#publicacion-matrimonio"
                        onClick={stay}
                    />
                </List>
            </DemoSection>

            <DemoSection title="Persona · cupos y favoritos (M6, GES-04 y GES-05)">
                <List>
                    <ListItem
                        variant="person"
                        avatar={<Avatar name="Martín Silva" />}
                        title="Martín Silva"
                        favorite
                        sub={<><RatingStars value={4.9} count={22} /> · Confiabilidad 96 %</>}
                        end={<Button variant="tonal" size="sm" onClick={noop}>Confirmar</Button>}
                    />
                    <ListItem
                        variant="person"
                        avatar={<Avatar name="Nicolás Vargas" />}
                        title="Nicolás Vargas"
                        sub={<><RatingStars value={4.5} count={6} /> · Confiabilidad 86 %</>}
                        end={<Button variant="tonal" size="sm" onClick={noop}>Confirmar</Button>}
                    />
                    <ListItem
                        variant="person"
                        avatar={<Avatar name="Javiera Contreras" />}
                        title="Javiera Contreras"
                        sub={<><RatingStars value={4.9} count={31} /> · Confiabilidad 97 %</>}
                        actions={
                            <>
                                <Chip selected onClick={noop}>Asistió</Chip>
                                <Chip onClick={noop}>No asistió</Chip>
                                <Button variant="ghost" size="sm" onClick={noop}>Evaluar</Button>
                            </>
                        }
                    />
                    <ListItem
                        variant="person"
                        avatar={<Avatar name="Matías Rojas" />}
                        title="Matías Rojas"
                        favorite
                        sub={<>Garzón · Maipú · <RatingStars value={4.8} count={17} /></>}
                        actions={<Button variant="tonal" size="sm" onClick={noop}>Invitar a un turno</Button>}
                    />
                </List>
                <DemoLabel>
                    Fila informativa (div) con los botones adentro: nunca un botón dentro de otro. El corazón marca a un
                    favorito, con su texto para el lector de pantalla.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Postulante · GES-02 Postulantes (M7)">
                <List>
                    <ListItem
                        variant="person"
                        avatar={<Avatar name="Jorge Muñoz" />}
                        title="Jorge Muñoz"
                        sub={[
                            'Guardia de seguridad · 5 a 10 años · Puente Alto',
                            <>Pretensión: <Amount value={650000} unit="mes" net /></>,
                        ]}
                        status={<Badge status="Entrevista" />}
                        badges={
                            <>
                                <VerificationBadge status="verified" onClick={noop}>Credencial SPD verificada</VerificationBadge>
                                <RatingStars value={4.9} count={25} />
                            </>
                        }
                        actions={<Button variant="ghost" size="sm" onClick={noop}>Ver proceso</Button>}
                    />
                    <ListItem
                        variant="person"
                        avatar={<Avatar name="Héctor Valenzuela" />}
                        title="Héctor Valenzuela"
                        sub={['Guardia de seguridad · 3 a 5 años · La Florida', 'Pretensión: A convenir']}
                        status={<Badge status="Postulado" />}
                        badges={
                            <>
                                <VerificationBadge status="verified" onClick={noop}>Credencial SPD verificada</VerificationBadge>
                                <RatingStars value={4.7} count={8} />
                            </>
                        }
                        actions={
                            <>
                                <Button variant="tonal" size="sm" onClick={noop}>Avanzar</Button>
                                <Button variant="ghost" size="sm" onClick={noop}>No seleccionar</Button>
                            </>
                        }
                    />
                </List>
                <DemoLabel>
                    Orden por afinidad con la oferta: oficio principal · años de experiencia · comuna, pretensión («A
                    convenir» si eligió «Prefiero no decir»), el estado bajo esas líneas, insignias y nota, y abajo las
                    acciones rápidas. Nunca la edad.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Conversación · Mensajes (M5)">
                <List>
                    <ListItem
                        variant="chat"
                        avatar={<Avatar name="Seguridad Andes Ltda." kind="org" />}
                        title="Seguridad Andes Ltda."
                        context={<ContextChipInRow kind="empleo" title="Guardia 4x4" />}
                        sub="Cualquier duda, me escribes por aquí."
                        time="hace 10 min"
                        unreadCount={2}
                        aria-label="Seguridad Andes Ltda., Empleo · Guardia 4x4, hace 10 min, 2 mensajes sin leer"
                        href="#chat-seguridad-andes"
                        onClick={stay}
                    />
                    <ListItem
                        variant="chat"
                        avatar={<Avatar name="Punto Activo Eventos Ltda." kind="org" />}
                        title="Punto Activo Eventos Ltda."
                        context={<ContextChipInRow kind="turno" title="Guardia de eventos" detail="28 nov" />}
                        sub="Tú: Gracias a ustedes. Quedo atento a otros turnos."
                        time="28 nov"
                        aria-label="Punto Activo Eventos Ltda., Turno · Guardia de eventos · 28 nov, 28 nov"
                        href="#chat-punto-activo"
                        onClick={stay}
                    />
                </List>
                <DemoLabel>
                    Avatar arriba, nombre, ContextChip de la publicación, último mensaje en una línea («Tú:» si es
                    propio), hora relativa y el número real de no leídos. Con no leídos, nombre en 600 y mensaje en
                    color-text.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Configuración y Ayuda (M8)">
                <DemoLabel>Desplegable · AYU-01 (la pregunta se abre en el lugar)</DemoLabel>
                <List>
                    <ListItem
                        title="¿Tengo que pagar para postular?"
                        defaultExpanded
                        panel="No. Postular, tomar turnos, verificarte y chatear siempre es gratis."
                    />
                    <ListItem
                        title="¿Cuánto tarda la revisión?"
                        panel="Te avisamos en menos de 24 h. Mientras tanto puedes seguir usando Talently."
                    />
                </List>
                <DemoLabel>Button al final · CFG-04 (consentimiento con fecha)</DemoLabel>
                <List>
                    <ListItem
                        multiline
                        title="Recibir novedades de Talently por correo"
                        sub="Aceptaste el 3 dic 2026"
                        end={<Button variant="ghost" size="sm" onClick={noop}>Revocar</Button>}
                    />
                </List>
                <DemoLabel>Dos canales · CFG-03 (un Switch por canal, en columnas)</DemoLabel>
                <List>
                    <ListColumns columns={['Teléfono', 'Correo']} />
                    <ListItem
                        title="Mensajes"
                        sub="Cuando te escriben"
                        channels={[
                            { label: 'Mensajes en el teléfono', defaultChecked: true },
                            { label: 'Mensajes por correo' },
                        ]}
                    />
                    <ListItem
                        title="Turnos"
                        sub="Confirmaciones, cupos y cambios de horario"
                        channels={[
                            { label: 'Turnos en el teléfono', defaultChecked: true },
                            { label: 'Turnos por correo', defaultChecked: true },
                        ]}
                    />
                </List>
                <DemoLabel>
                    La fila con Button o con dos Switch es un div: nunca un control dentro de otro. Cada Switch lleva su
                    nombre completo para el lector de pantalla («Mensajes por correo»).
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Disponibilidad por bloques (M9) · ACT-04">
                <List>
                    <ListItem title="Lunes" tags={['16:00–21:00']} chevron aria-label="Lunes: de 16:00 a 21:00. Editar" onClick={noop} />
                    <ListItem title="Sábado" tags={['10:00–14:00']} chevron aria-label="Sábado: de 10:00 a 14:00. Editar" onClick={noop} />
                    <ListItem title="Domingo" sub="Sin horario" chevron onClick={noop} />
                </List>
                <List>
                    <ListItem
                        icon={IconCalendar}
                        title="No disponible"
                        sub="Del lun 12 al mié 14 abr"
                        onRemove={noop}
                        removeLabel="Quitar excepción del lun 12 al mié 14 abr"
                    />
                </List>
                <DemoLabel>
                    Un día por fila y sus bloques en InfoTag bajo el nombre (cifras tabulares). Toda la fila abre la hoja
                    del día; un día sin bloques dice «Sin horario». Las excepciones son filas div con el basurero al final.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Estados">
                <DemoSection title="Default">
                    <List>
                        <ListItem icon={IconBell} title="Notificaciones" sub="Turnos, mensajes y recordatorios" href="#notificaciones" onClick={stay} />
                    </List>
                </DemoSection>
                <DemoSection title="Presionado">
                    <List>
                        <ListItem
                            icon={IconBell}
                            title="Notificaciones"
                            sub="Turnos, mensajes y recordatorios"
                            href="#notificaciones"
                            onClick={stay}
                            className="is-pressed"
                        />
                    </List>
                </DemoSection>
                <DemoSection title="Foco">
                    <List>
                        <ListItem
                            icon={IconBell}
                            title="Notificaciones"
                            sub="Turnos, mensajes y recordatorios"
                            href="#notificaciones"
                            onClick={stay}
                            className="is-focus"
                        />
                    </List>
                    <DemoLabel>Dentro de una lista el foco es un borde interior de 2 px color-primary-text.</DemoLabel>
                </DemoSection>
                <DemoSection title="Seleccionado">
                    <DemoNotApplicable>
                        Las filas navegan o encienden algo (switch). Para elegir de una lista se usa una fila de
                        SheetPicker con Radio.
                    </DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Deshabilitado">
                    <List>
                        <ListItem
                            icon={IconDocument}
                            title="Descargar mis datos"
                            sub="Disponible cuando verifiques tu correo"
                            href="#descargar-datos"
                            disabled
                        />
                    </List>
                </DemoSection>
                <DemoSection title="Error">
                    <DemoNotApplicable>Si una acción de la fila falla, aparece un Snackbar de error con «Reintentar».</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Cargando">
                    <List>
                        <ListItem
                            icon={IconDocument}
                            title="Descargar mis datos"
                            sub="Disponible cuando verifiques tu correo"
                            loading
                            loadingLabel="Preparando el archivo…"
                            onClick={noop}
                        />
                    </List>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
