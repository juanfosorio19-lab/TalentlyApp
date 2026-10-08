import type { MouseEvent, ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { SkeletonCard } from '../Skeleton';
import { Snackbar } from '../Snackbar';
import { PublicationCard, type PublicationCardData } from './PublicationCard';

// En el catálogo nada navega: en la app, el enlace abre DET-01 y el CTA hace su acción.
const noop = () => {};
const open = (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault();

/** La tarjeta dentro de una pantalla de 360, 390 o 412 con su margen de 16. */
function Pantalla({ width = 390, children }: { width?: 360 | 390 | 412; children: ReactNode }) {
    return (
        <DemoFrame width={width}>
            <div className="tl-app-screen__content">{children}</div>
        </DemoFrame>
    );
}

/** Un estado: su nombre arriba y la explicación abajo, como en el preview del sistema. */
function Estado({ name, note, children }: { name: string; note?: string; children?: ReactNode }) {
    return (
        <DemoRow column>
            <DemoLabel>{name}</DemoLabel>
            {children}
            {note && <DemoLabel>{note}</DemoLabel>}
        </DemoRow>
    );
}

const ORG_VERIFICADA = [{ status: 'verified', label: 'Organización verificada', onClick: noop }] as const;

/** Turno (F1): Matías busca turnos · hoy jue 10 dic 2026. */
const TURNO: PublicationCardData = {
    author: { name: 'Banquetería Rosa SpA', kind: 'org' },
    verifications: ORG_VERIFICADA,
    title: 'Garzones para matrimonio',
    href: '#det-01',
    onOpen: open,
    tags: [{ kind: 'fecha', label: 'sáb 12 dic · 18:00–00:00 (6 h)' }],
    amount: { value: 35000, unit: 'turno', net: true },
    cupos: { left: 3, total: 8 },
    place: 'a 21 km · Las Condes',
    cta: { label: 'Tomar turno', end: true, onClick: noop },
};

/** Empleo (F1): Jorge ve ofertas de guardia. */
const EMPLEO: PublicationCardData = {
    author: { name: 'Seguridad Andes Ltda.', kind: 'org' },
    verifications: ORG_VERIFICADA,
    title: 'Guardia de seguridad 4x4',
    href: '#det-01',
    onOpen: open,
    tags: [
        { kind: 'jornada', label: 'Jornada completa' },
        { kind: 'contrato', label: 'Plazo fijo' },
        { kind: 'fecha', label: 'Turno de noche' },
    ],
    amount: { value: 650000, unit: 'mes', net: true },
    place: 'a 4 km · Puente Alto',
    why: 'calza con tu oficio y está a 4 km',
};

/** Servicio (F3): un cliente busca gasfíter · hoy mar 15 jun 2027. */
const SERVICIO: PublicationCardData = {
    author: { name: 'Luis Contreras', kind: 'person', photo: true },
    verifications: [
        { status: 'verified', label: 'Identidad verificada', onClick: noop },
        { status: 'verified', label: 'SEC gas clase 3', onClick: noop },
    ],
    title: 'Gasfitería e instalación de gas',
    href: '#det-01',
    onOpen: open,
    amount: { value: 25000, unit: 'visita', from: true },
    rating: { value: 4.9, count: 41 },
    place: 'Atiende La Cisterna y 6 comunas más',
    cta: { label: 'Solicitar cotización', onClick: noop },
};

/** Clase (F2): Carolina busca clases para Tomás · hoy mié 10 mar 2027. */
const CLASE: PublicationCardData = {
    author: { name: 'Camila Fuentes', kind: 'person' },
    verifications: [
        { status: 'verified', label: 'Titulada', onClick: noop },
        { status: 'verified', label: 'Apta para trabajar con menores', onClick: noop },
    ],
    title: 'Matemática y PAES M1',
    href: '#det-01',
    onOpen: open,
    tags: [
        { kind: 'modalidad', label: 'Online' },
        { kind: 'modalidad', label: 'En la casa del alumno' },
        { kind: 'prueba', label: 'Clase de prueba gratis' },
    ],
    amount: { value: 18000, unit: 'clase', durationMin: 60 },
    rating: { value: 4.8, count: 23 },
    cta: { label: 'Ver horarios', onClick: noop },
};

/** Persona (M7, GES-03 y EXP-05): Seguridad Andes Ltda. busca guardia y le sugerimos a Jorge. */
const PERSONA: PublicationCardData = {
    author: { name: 'Jorge Muñoz', kind: 'person' },
    verifications: [{ status: 'verified', label: 'Teléfono verificado', onClick: noop }],
    title: 'Guardia de seguridad',
    href: '#prf-10',
    onOpen: open,
    tags: [
        { kind: 'experiencia', label: '5 a 10 años de experiencia' },
        { kind: 'jornada', label: 'Sistema 4x4' },
        { kind: 'fecha', label: 'Disponible: Inmediata' },
    ],
    amount: { value: 650000, unit: 'mes', net: true, prefix: 'Pretensión:' },
    rating: { value: 4.9, count: 25 },
    reliability: 'Confiabilidad 96 %',
    place: 'a 3 km · Puente Alto',
    requirements: [{ label: 'Credencial SPD (ex OS-10) verificada · vence 03/2028', met: true }],
    why: 'calza con el oficio y el sistema 4x4 de tu oferta, y está a 3 km',
};

const TURNO_LLENO: PublicationCardData = {
    ...TURNO,
    cupos: { left: 0, total: 8 },
    cta: { label: 'Unirme a la lista de espera', end: true, onClick: noop },
};

const demo: DemoModule = {
    name: 'PublicationCard',
    group: 'Publicaciones',
    summary:
        'La tarjeta de toda publicación (Empleo, Turno, Servicio y Clase): una estructura con orden fijo, completa o compacta, Premium con «Destacado» y la tarjeta de persona. Toda la tarjeta abre el detalle; las insignias y el CTA se tocan aparte.',
    Demo: () => (
        <>
            <DemoSection title="Anatomía · completa · Turno (F1)">
                <Pantalla>
                    <PublicationCard {...TURNO} />
                </Pantalla>
                <DemoLabel>
                    Orden fijo para los 4 tipos: cabecera (avatar + nombre + VerificationBadge) · título H3 · InfoTag ·
                    Amount · dato del tipo (cupos o nota) · lugar · «Por qué ves esto» · CTA. Si un tipo no tiene un
                    dato, esa parte no aparece; nunca cambia de lugar. Turno lleva «Tomar turno» sm a la derecha (M6).
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Compacta · el mismo turno">
                <Pantalla>
                    <PublicationCard {...TURNO} variant="compact" />
                </Pantalla>
                <DemoLabel>Título 16, hasta 2 InfoTag, sin «Por qué ves esto» ni CTA.</DemoLabel>
            </DemoSection>

            <DemoSection title="Empleo (F1) · completa (PUBL-02) y compacta (EXP-01 lista, EXP-07, INI-01)">
                <Pantalla>
                    <PublicationCard {...EMPLEO} />
                    <PublicationCard {...EMPLEO} variant="compact" />
                </Pantalla>
                <DemoLabel>
                    Sin CTA: se postula desde el detalle (DET-01) con el mismo ActionPair del deck. «Por qué ves esto»
                    solo aparece donde Talently recomienda.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Turno (F1) · cupos, el dato del tipo">
                <Pantalla>
                    <PublicationCard {...TURNO} variant="compact" />
                    <PublicationCard {...TURNO} variant="compact" cupos={{ left: 2, total: 8 }} />
                    <PublicationCard {...TURNO_LLENO} variant="compact" />
                </Pantalla>
                <DemoLabel>
                    3 o más: texto · 2 o menos: Badge warning · sin cupos: Badge neutral y CTA «Unirme a la lista de
                    espera». «Tomar turno» pide el teléfono verificado (AUTH-08) y las credenciales obligatorias del
                    oficio antes de postular.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Servicio (F3) · completa (EXP-04) y compacta (EXP-07)">
                <Pantalla>
                    <PublicationCard {...SERVICIO} />
                    <PublicationCard {...SERVICIO} variant="compact" />
                </Pantalla>
                <DemoLabel>
                    Foto del prestador obligatoria. «SEC gas clase 3» es una VerificationBadge: Talently revisó la
                    licencia.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Clase (F2) · completa (EXP-03) y compacta (EXP-07, INI-01)">
                <Pantalla>
                    <PublicationCard {...CLASE} />
                    <PublicationCard {...CLASE} variant="compact" />
                </Pantalla>
                <DemoLabel>Sin línea de lugar: la modalidad ya dice dónde. Las insignias bajan de línea si no caben.</DemoLabel>
            </DemoSection>

            <DemoSection title="Premium (F3) · Clásica y Premium, solo cambia la etiqueta">
                <Pantalla>
                    <PublicationCard {...EMPLEO} />
                    <PublicationCard {...EMPLEO} promoted />
                </Pantalla>
                <DemoLabel>A 360, el caso más angosto: si el nombre no cabe junto a «Destacado», se corta con «…».</DemoLabel>
                <Pantalla width={360}>
                    <PublicationCard {...EMPLEO} />
                    <PublicationCard {...EMPLEO} promoted />
                </Pantalla>
                <DemoLabel>
                    No cambian colores, borde, sombra, tamaño ni orden. En F1 y F2 ninguna tarjeta lleva «Destacado».
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Tarjeta de persona · Personas sugeridas (GES-03, EXP-05)">
                <Pantalla>
                    <PublicationCard {...PERSONA} variant="deck" />
                </Pantalla>
                <DemoLabel>
                    La tarjeta del deck con contenido de persona: avatar redondo, oficio como título, pretensión,
                    nota y Confiabilidad, requisitos de la oferta con su estado. Nunca la edad. El arrastre y el
                    ActionPair, en PublicationCardDeck.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Estados · completa">
                <Estado name="Default" note="Mostrado arriba." />
                <Estado name="Presionado" note="Toda la tarjeta: capa color-text al 8 %. Abre DET-01.">
                    <Pantalla>
                        <PublicationCard {...TURNO} className="is-pressed" />
                    </Pantalla>
                </Estado>
                <Estado name="Foco" note="La insignia y el CTA reciben foco aparte, en este orden: insignia, título, CTA.">
                    <Pantalla>
                        <PublicationCard {...TURNO} className="is-focus" />
                    </Pantalla>
                </Estado>
                <DemoNotApplicable state="Seleccionado">No se marca: para elegir se usa OptionCard.</DemoNotApplicable>
                <Estado
                    name="Deshabilitado"
                    note="No se deshabilita. Una publicación cerrada o vencida sale de las listas; un turno lleno muestra «Cupos completos» y cambia su CTA."
                >
                    <Pantalla>
                        <PublicationCard {...TURNO_LLENO} />
                    </Pantalla>
                </Estado>
                <Estado name="Error" note="Si falla la acción del CTA, la tarjeta no cambia y aparece el Snackbar de error.">
                    <Pantalla>
                        <PublicationCard {...TURNO} />
                        <Snackbar
                            tone="error"
                            placement="static"
                            message="No pudimos tomar el turno. Revisa tu conexión e intenta de nuevo."
                            action={{ label: 'Reintentar', onAction: noop }}
                        />
                    </Pantalla>
                </Estado>
                <Estado name="Cargando" note="La lista carga con Skeleton de la misma forma. Al tocar el CTA, el botón muestra su spinner.">
                    <Pantalla>
                        <SkeletonCard label="Cargando turnos…" />
                        <PublicationCard
                            {...TURNO}
                            cta={{ label: 'Tomar turno', end: true, onClick: noop, loading: true, loadingLabel: 'Tomando el turno…' }}
                        />
                    </Pantalla>
                </Estado>
            </DemoSection>

            <DemoSection title="Ancho de pantalla 360 y 412 · sin scroll horizontal">
                <DemoLabel>360 · tarjeta de 328</DemoLabel>
                <Pantalla width={360}>
                    <PublicationCard {...TURNO} />
                </Pantalla>
                <DemoLabel>412 · tarjeta de 380</DemoLabel>
                <Pantalla width={412}>
                    <PublicationCard {...TURNO} />
                </Pantalla>
            </DemoSection>
        </>
    ),
};

export default demo;
