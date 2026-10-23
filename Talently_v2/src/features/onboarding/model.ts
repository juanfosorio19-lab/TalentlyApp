// Lógica pura del registro y el onboarding: el borrador, los pasos que
// aplican según lo elegido, las validaciones y el resumen honesto de ONB-99.
// Sin React: lo prueban model.test.ts.
import type { PayUnit } from '../../ui/Amount';
import type { AvailabilityCell } from '../../ui/AvailabilityGrid';
import type { DemoOnboardingResult } from '../demo/types';
import {
    DIA_NOCHE,
    EXPERIENCIAS,
    OFICIOS,
    comunaName,
    SISTEMAS_TURNO,
    getOficio,
    type DisponibleDesde,
    type Experiencia,
    type Jornada,
    type Oficio,
    type Radio,
    type Vestimenta,
} from './catalog';

// ─── Intenciones y bloques (ONB-01, ONB-02) ─────────────────────────────────

export type Intencion = 'empleo' | 'turnos' | 'servicios' | 'clases' | 'empresa' | 'hogar';
export type Bloque = 'trabajo' | 'servicios' | 'clases' | 'organizacion' | 'hogar';

export const INTENCIONES_TRABAJAR: readonly Intencion[] = ['empleo', 'turnos', 'servicios', 'clases'];
export const INTENCIONES_CONTRATAR: readonly Intencion[] = ['empresa', 'hogar'];

/** «Buscar empleo» y «Tomar turnos» activan la misma capacidad `trabajo` y un único bloque (spec §6.3). */
const BLOQUE_DE: Record<Intencion, Bloque> = {
    empleo: 'trabajo',
    turnos: 'trabajo',
    servicios: 'servicios',
    clases: 'clases',
    empresa: 'organizacion',
    hogar: 'hogar',
};

/** Preselección de ONB-02: organización > trabajo > hogar > clases > servicios (04 §4.2). */
const ORDEN_BLOQUES: readonly Bloque[] = ['organizacion', 'trabajo', 'hogar', 'clases', 'servicios'];

/** Los bloques que corresponden a lo elegido, en el orden de preselección. */
export function bloquesDe(intenciones: readonly Intencion[]): Bloque[] {
    const elegidos = new Set(intenciones.map((i) => BLOQUE_DE[i]));
    return ORDEN_BLOQUES.filter((b) => elegidos.has(b));
}

/** Pasos de «Tus datos» + el bloque, por bloque (prototipo ONB-03: Jorge 6, Rosa 5, Carolina 2, Camila y Luis 6). */
export function totalPasos(bloque: Bloque, busca: Busca): number {
    switch (bloque) {
        case 'trabajo':
            return busca.empleo ? 6 : 5;
        case 'organizacion':
            return 5;
        case 'hogar':
            return 2;
        case 'clases':
        case 'servicios':
            return 6;
    }
}

/** La fecha de nacimiento solo se pide si eligió algo de «Quiero trabajar» (prototipo ONB-03). */
export function pideNacimiento(intenciones: readonly Intencion[]): boolean {
    return intenciones.length === 0 || intenciones.some((i) => INTENCIONES_TRABAJAR.includes(i));
}

export interface Busca {
    empleo: boolean;
    turnos: boolean;
}

/**
 * Qué busca en el bloque Trabajo (`seeks_jobs`, `seeks_shifts`), según ONB-01.
 * Sin ninguna de las dos (se abrió un paso directo, sin pasar por ONB-01), el
 * bloque se muestra completo.
 */
export function buscaDe(intenciones: readonly Intencion[]): Busca {
    const empleo = intenciones.includes('empleo');
    const turnos = intenciones.includes('turnos');
    return empleo || turnos ? { empleo, turnos } : { empleo: true, turnos: true };
}

// ─── Pasos del bloque Trabajo (ONB-T1 a ONB-T5) ─────────────────────────────

export type PasoTrabajo = 1 | 2 | 3 | 4 | 5;

export function esPasoTrabajo(n: number): n is PasoTrabajo {
    return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

/**
 * Los pasos que aplican: T4 solo si algún oficio pide requisitos y T5 solo si
 * busca empleo (spec §6.3).
 */
export function pasosTrabajo(busca: Busca, conRequisitos: boolean): PasoTrabajo[] {
    const pasos: PasoTrabajo[] = [1, 2, 3];
    if (conRequisitos) pasos.push(4);
    if (busca.empleo) pasos.push(5);
    return pasos;
}

/** «Paso X de N»: «Tus datos» es el 1 y N no cambia aunque T4 se salte (spec §6.1). */
export function numeroDePaso(paso: PasoTrabajo): number {
    return paso + 1;
}

export function pasoSiguiente(paso: PasoTrabajo, busca: Busca, conRequisitos: boolean): PasoTrabajo | 'listo' {
    return pasosTrabajo(busca, conRequisitos).find((p) => p > paso) ?? 'listo';
}

export function pasoAnterior(paso: PasoTrabajo, busca: Busca, conRequisitos: boolean): PasoTrabajo | 'datos' {
    const antes = pasosTrabajo(busca, conRequisitos).filter((p) => p < paso);
    return antes[antes.length - 1] ?? 'datos';
}

// ─── El borrador ────────────────────────────────────────────────────────────

export interface CuentaDraft {
    /** «Nombre y apellido» de AUTH-02. La contraseña nunca se guarda aquí. */
    nombre: string;
    correo: string;
    acepta: boolean;
}

export interface DatosDraft {
    nombre: string;
    apellido: string;
    /** Clave de la comuna (catalog.ts). */
    comuna: string | null;
    /** URL de la foto elegida (object URL), o null. */
    foto: string | null;
    /** La foto elegida se está subiendo (sigue aunque se cambie de paso). */
    fotoSubiendo: boolean;
    /** «DD/MM/AAAA» tal como se escribe. */
    nacimiento: string;
    /** Solo los 8 dígitos, sin el «+56 9». */
    telefono: string;
}

export interface OficioElegido {
    id: string;
    experiencia: Experiencia | null;
}

export type EstadoCredencial = 'pendiente' | 'despues' | 'subiendo' | 'revision';

export interface CredencialDraft {
    estado: EstadoCredencial;
    /** Subiendo: 0 a 100. */
    progreso: number;
    archivo: { nombre: string; peso: string } | null;
}

export interface ExperienciaDraft {
    empleador: string;
    cargo: string;
    /** «MM/AAAA». */
    desde: string;
    hasta: string;
    actual: boolean;
}

export interface TrabajoDraft {
    oficios: OficioElegido[];
    principal: string | null;
    jornadas: Jornada[];
    desde: DisponibleDesde | null;
    radio: Radio | null;
    movilizacion: boolean;
    franjas: AvailabilityCell[];
    sueldo: number | null;
    sueldoUnidad: PayUnit;
    tarifa: number | null;
    tarifaUnidad: PayUnit;
    noDecir: boolean;
    vestimenta: Vestimenta[];
    /** Tocó «Omitir» en ONB-T3. */
    pagoOmitido: boolean;
    sistema: string | null;
    diaNoche: string[];
    credencial: CredencialDraft;
    experiencia: ExperienciaDraft;
    /** Tocó «Omitir» en ONB-T5. */
    experienciaOmitida: boolean;
}

export interface OnboardingDraft {
    cuenta: CuentaDraft;
    intenciones: Intencion[];
    /** El bloque con el que empieza (ONB-02, o el único). */
    bloque: Bloque | null;
    datos: DatosDraft;
    trabajo: TrabajoDraft;
    /** Dónde quedó al tocar «Guardar y salir» (se retoma desde «Ya tengo cuenta»). */
    retomar: string | null;
}

/**
 * El borrador al empezar. Lo que se escribe en AUTH-02 parte vacío (como el
 * prototipo); «Tus datos» y el bloque Trabajo traen las respuestas de Jorge en
 * el flujo 1 del prototipo, para recorrerlo tocando «Continuar» como allá.
 * Todo se puede cambiar, y la persona de la demostración al terminar es Jorge.
 */
export function borradorInicial(): OnboardingDraft {
    return {
        cuenta: { nombre: '', correo: '', acepta: false },
        intenciones: [],
        bloque: null,
        datos: { nombre: 'Jorge', apellido: 'Muñoz', comuna: 'puente-alto', foto: null, fotoSubiendo: false, nacimiento: '14/05/1985', telefono: '' },
        trabajo: {
            oficios: [
                { id: 'guardia-seguridad', experiencia: '5_10' },
                { id: 'guardia-eventos', experiencia: '3_5' },
            ],
            principal: 'guardia-seguridad',
            jornadas: ['completa', 'parcial'],
            desde: 'inmediata',
            radio: '20',
            movilizacion: false,
            franjas: [
                { weekday: 5, band: 'noche' },
                { weekday: 6, band: 'tarde' },
                { weekday: 6, band: 'noche' },
                { weekday: 7, band: 'tarde' },
            ],
            sueldo: 650000,
            sueldoUnidad: 'mes',
            tarifa: 40000,
            tarifaUnidad: 'turno',
            noDecir: false,
            vestimenta: ['pantalon_negro', 'zapatos_negros'],
            pagoOmitido: false,
            sistema: '4x4',
            diaNoche: ['dia', 'noche'],
            credencial: { estado: 'pendiente', progreso: 0, archivo: null },
            experiencia: { empleador: 'Condominio Los Peumos', cargo: 'Guardia de seguridad', desde: '03/2021', hasta: '10/2026', actual: false },
            experienciaOmitida: false,
        },
        retomar: null,
    };
}

// ─── Oficios ────────────────────────────────────────────────────────────────

export const MAX_OFICIOS = 3;

export function oficiosElegidos(trabajo: TrabajoDraft): Oficio[] {
    return trabajo.oficios.flatMap((o) => {
        const oficio = getOficio(o.id);
        return oficio ? [oficio] : [];
    });
}

/** El oficio que define los requisitos de ONB-T4: el principal si pide credencial; si no, el primero que la pide. */
export function oficioConRequisitos(trabajo: TrabajoDraft): Oficio | null {
    const conCredencial = oficiosElegidos(trabajo).filter((o) => o.credential);
    return conCredencial.find((o) => o.id === trabajo.principal) ?? conCredencial[0] ?? null;
}

/** Oficios que se pueden agregar: los que aún no eligió. */
export function oficiosDisponibles(trabajo: TrabajoDraft): Oficio[] {
    const ya = new Set(trabajo.oficios.map((o) => o.id));
    return OFICIOS.filter((o) => !ya.has(o.id));
}

export function agregarOficio(trabajo: TrabajoDraft, id: string): TrabajoDraft {
    if (trabajo.oficios.length >= MAX_OFICIOS || trabajo.oficios.some((o) => o.id === id)) return trabajo;
    return {
        ...trabajo,
        oficios: [...trabajo.oficios, { id, experiencia: null }],
        principal: trabajo.principal ?? id,
    };
}

/** Quitar un oficio: si era el principal, pasa a serlo el primero que queda. */
export function quitarOficio(trabajo: TrabajoDraft, id: string): TrabajoDraft {
    const oficios = trabajo.oficios.filter((o) => o.id !== id);
    const principal = trabajo.principal === id ? (oficios[0]?.id ?? null) : trabajo.principal;
    return { ...trabajo, oficios, principal };
}

// ─── Formatos y validaciones ────────────────────────────────────────────────

const soloDigitos = (s: string) => s.replace(/\D/g, '');

export function correoValido(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

/** «Nombre y apellido» de AUTH-02 → nombre y apellido de ONB-03 («Jorge Muñoz Soto» → Jorge · Muñoz Soto). */
export function separarNombre(completo: string): { nombre: string; apellido: string } {
    const [nombre = '', ...resto] = completo.trim().split(/\s+/).filter(Boolean);
    return { nombre, apellido: resto.join(' ') };
}

/** Máscara DD/MM/AAAA mientras se escribe: «14051985» → «14/05/1985». */
export function mascaraFecha(texto: string): string {
    const d = soloDigitos(texto).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Máscara MM/AAAA: «032021» → «03/2021». */
export function mascaraMes(texto: string): string {
    const d = soloDigitos(texto).slice(0, 6);
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** «1234 5678» a partir de lo escrito (solo los 8 dígitos del celular). */
export function digitosTelefono(texto: string): string {
    return soloDigitos(texto).slice(0, 8);
}

export function agruparTelefono(digitos: string): string {
    return digitos.length > 4 ? `${digitos.slice(0, 4)} ${digitos.slice(4)}` : digitos;
}

interface Fecha {
    dia: number;
    mes: number;
    anio: number;
}

/** «14/05/1985» → la fecha, o null si no es una fecha real. */
export function leerFecha(texto: string): Fecha | null {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
    if (!m) return null;
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    const anio = Number(m[3]);
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return null;
    return { dia, mes, anio };
}

/** Años cumplidos a la fecha `hoy`. Solo para validar: la edad nunca se muestra. */
export function aniosCumplidos(nacimiento: Fecha, hoy: Date): number {
    let anios = hoy.getFullYear() - nacimiento.anio;
    const mes = hoy.getMonth() + 1;
    if (mes < nacimiento.mes || (mes === nacimiento.mes && hoy.getDate() < nacimiento.dia)) anios--;
    return anios;
}

export type ErrorNacimiento = 'invalida' | 'menor';

/** Obligatoria, real, no futura y de 18 a 100 años (04 §4.2, ONB-03). */
export function validarNacimiento(texto: string, hoy: Date): ErrorNacimiento | null {
    const fecha = leerFecha(texto);
    if (!fecha) return 'invalida';
    const anios = aniosCumplidos(fecha, hoy);
    if (anios < 0 || anios > 100) return 'invalida';
    if (anios < 18) return 'menor';
    return null;
}

export function mesValido(texto: string): boolean {
    const m = /^(\d{2})\/(\d{4})$/.exec(texto.trim());
    if (!m) return false;
    const mes = Number(m[1]);
    const anio = Number(m[2]);
    return mes >= 1 && mes <= 12 && anio >= 1950 && anio <= 2100;
}

/** «Pesa 14 MB»: megas redondeados hacia arriba. */
export function megas(bytes: number): number {
    return Math.ceil(bytes / (1024 * 1024));
}

export const MAX_ARCHIVO_BYTES = 10 * 1024 * 1024;

/** Peso legible de un archivo subido: «320 KB», «2,4 MB». */
export function pesoLegible(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

// ─── Resumen de ONB-99 ──────────────────────────────────────────────────────

/** «a», «a y b», «a, b y c». */
export function unirConY(partes: readonly string[]): string {
    if (partes.length <= 1) return partes[0] ?? '';
    return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

const conMayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** «Guardia de seguridad (principal) y Guardia de eventos». */
export function textoOficios(trabajo: TrabajoDraft): string {
    const oficios = oficiosElegidos(trabajo);
    const principal = oficios.find((o) => o.id === trabajo.principal);
    const orden = principal ? [principal, ...oficios.filter((o) => o !== principal)] : oficios;
    return unirConY(orden.map((o) => (o === principal && oficios.length > 1 ? `${o.name} (principal)` : o.name)));
}

/** «Empleo y turnos: 4 franjas, hasta 20 km». */
export function textoBusqueda(trabajo: TrabajoDraft, busca: Busca): string {
    const que = busca.empleo && busca.turnos ? 'Empleo y turnos' : busca.empleo ? 'Empleo' : 'Turnos';
    const detalle: string[] = [];
    if (busca.turnos) detalle.push(`${trabajo.franjas.length} ${trabajo.franjas.length === 1 ? 'franja' : 'franjas'}`);
    if (trabajo.radio === 'region') detalle.push('en toda la región');
    else if (trabajo.radio) detalle.push(`hasta ${trabajo.radio} km`);
    return detalle.length ? `${que}: ${detalle.join(', ')}` : que;
}

/** «Sueldo, tarifa y vestimenta» (solo lo que dejó en ONB-T3). Vacío si omitió el paso. */
export function textoPago(trabajo: TrabajoDraft, busca: Busca): string {
    if (trabajo.pagoOmitido) return '';
    const partes: string[] = [];
    if (trabajo.noDecir) partes.push('pago «A convenir»');
    else {
        if (busca.empleo && trabajo.sueldo !== null) partes.push('sueldo');
        if (busca.turnos && trabajo.tarifa !== null) partes.push('tarifa');
    }
    if (busca.turnos && trabajo.vestimenta.length > 0) partes.push('vestimenta');
    return conMayuscula(unirConY(partes));
}

/** «Sistema 4x4, de día y de noche». */
export function textoRequisitos(trabajo: TrabajoDraft): string {
    const sistema = SISTEMAS_TURNO.find((s) => s.value === trabajo.sistema)?.label;
    const turnos = DIA_NOCHE.filter((t) => trabajo.diaNoche.includes(t.value)).map((t) => t.label.toLowerCase());
    const partes = [sistema ? `Sistema ${sistema}` : '', unirConY(turnos)].filter(Boolean);
    return conMayuscula(partes.join(', '));
}

export type Faltante = 'credencial' | 'foto';

/** Lo que de verdad le falta al perfil de trabajo (nada de «Perfil al 100 %»). */
export function faltantes(draft: OnboardingDraft): Faltante[] {
    const lista: Faltante[] = [];
    const credencial = draft.trabajo.credencial.estado;
    if (oficioConRequisitos(draft.trabajo) && credencial !== 'revision' && credencial !== 'subiendo') lista.push('credencial');
    if (!draft.datos.foto) lista.push('foto');
    return lista;
}

/** «Ya está en tu perfil»: una línea por cosa que dejó lista, en el orden de los pasos. */
export function resumen(draft: OnboardingDraft): string[] {
    const { trabajo } = draft;
    const busca = buscaDe(draft.intenciones);
    const conRequisitos = oficioConRequisitos(trabajo) !== null;
    const lineas = [textoOficios(trabajo), textoBusqueda(trabajo, busca), textoPago(trabajo, busca)];
    if (conRequisitos) lineas.push(textoRequisitos(trabajo));
    if (conRequisitos && trabajo.credencial.estado === 'revision') lineas.push('Credencial SPD en revisión');
    if (busca.empleo && !trabajo.experienciaOmitida && trabajo.experiencia.empleador.trim()) lineas.push('Tu último trabajo');
    return lineas.filter(Boolean);
}

// ─── Lo que queda al terminar (ONB-99 → INI-01-jorge-nuevo) ─────────────────

/** «03/2021» → «2021». */
const anioDe = (mes: string) => /\d{4}$/.exec(mes.trim())?.[0] ?? '';

/** ONB-T5: «Guardia de seguridad en Condominio Los Peumos · 2021 a 2026» (vacío si lo omitió). */
export function textoUltimoTrabajo(trabajo: TrabajoDraft): string | undefined {
    const e = trabajo.experiencia;
    if (trabajo.experienciaOmitida || !e.empleador.trim()) return undefined;
    const quien = [e.cargo.trim(), e.empleador.trim()].filter(Boolean).join(' en ');
    const desde = anioDe(e.desde);
    const hasta = e.actual ? 'hoy' : anioDe(e.hasta);
    const cuando = desde && hasta ? `${desde} a ${hasta}` : desde || hasta;
    return [quien, cuando].filter(Boolean).join(' · ');
}

/**
 * Lo que deja el registro: DemoOnboardingResult y el correo de AUTH-02, el
 * mismo que AUTH-03 mostró («Te enviamos un código… a <correo>») y que CFG-01
 * muestra en «Cuenta». El correo va aparte mientras DemoOnboardingResult no
 * lo tenga (pedido a demo/types.ts).
 */
export type ResultadoOnboarding = DemoOnboardingResult & { correo: string };

/**
 * Lo que el onboarding deja en la sesión (demo/session `startAsNewUser`):
 * Inicio («Hola, <nombre>»), Perfil, VER-01 y CFG-01 muestran solo esto.
 */
export function resultadoOnboarding(draft: OnboardingDraft): ResultadoOnboarding {
    const { cuenta, datos, trabajo } = draft;
    const oficios = oficiosElegidos(trabajo);
    const principal = oficios.find((o) => o.id === trabajo.principal) ?? oficios[0];
    const orden = principal ? [principal, ...oficios.filter((o) => o !== principal)] : oficios;
    const experienciaDe = (id: string) => {
        const valor = trabajo.oficios.find((o) => o.id === id)?.experiencia;
        return EXPERIENCIAS.find((x) => x.value === valor)?.label ?? null;
    };
    const estado = trabajo.credencial.estado;
    return {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        comuna: comunaName(datos.comuna),
        foto: datos.foto,
        oficios: orden.map((o) => ({ nombre: o.name, experiencia: experienciaDe(o.id), principal: o === principal })),
        credencial: oficioConRequisitos(trabajo) ? (estado === 'subiendo' ? 'revision' : estado) : null,
        ultimoTrabajo: textoUltimoTrabajo(trabajo),
        correo: cuenta.correo.trim(),
    };
}
