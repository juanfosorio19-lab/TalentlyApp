// Textos de PRF-10 (perfil público de persona) y PRF-11 (perfil público de
// organización). No están en el prototipo F1: siguen el «Así te ven» de
// PRF-01 y PRF-02 y las reglas del spec (§5.4, §10.1 y Ley 21.719: lo que se
// ve de una persona es su nombre, foto, comuna y lo que se verificó).
import type { DemoPublicationType } from '../demo/types';

export const copy = {
    /** Overline del encabezado cuando quien mira es el dueño del perfil (como PRF-01). */
    asiTeVen: 'Así te ven',
    perfil: 'Perfil',
    organizacion: 'Organización',
    notaTrabajo: 'Trabajo',
    trabajo: 'Trabajo',
    oficioPrincipal: 'Oficio principal',
    oficio: 'Oficio',
    experiencia: (anos: string) => `${anos} de experiencia`,
    ultimoTrabajo: 'Último trabajo',
    sobre: 'Sobre la organización',
    publicaciones: 'Publicaciones activas',
    avisos: 'Avisos activos',
    sinPublicaciones: (nombre: string) => `${nombre} no tiene publicaciones activas por ahora.`,
    quedan: (left: number, total: number) => `Quedan ${left} de ${total} cupos`,
    tipo: { empleo: 'Empleo', turno: 'Turno', servicio: 'Servicio', clase: 'Clase' } satisfies Record<DemoPublicationType, string>,
    /** Nota bajo el encabezado propio: qué no ve nadie (spec §10.1, Ley 21.719). */
    privadoPersona: 'Tu RUT, tu fecha de nacimiento, tu teléfono y tu dirección no se muestran en tu perfil.',
    privadoHogar: 'Por privacidad, de un hogar solo se muestran su comuna, su verificación y sus avisos activos.',
    sinTrabajo: {
        titulo: (nombre: string) => `${nombre} no tiene perfil de trabajo`,
        tituloPropio: 'Aún no tienes perfil de trabajo',
        texto: 'Cuando lo agregue, aquí se verán sus oficios, su experiencia y su nota.',
        textoPropio: 'Cuando lo agregues desde Perfil, aquí se verán tus oficios, tu experiencia y tu nota.',
    },
    capacidadPronto: {
        servicios: { titulo: 'Los perfiles de servicios llegan pronto', texto: 'Todavía no se pueden ofrecer servicios en Talently.' },
        clases: { titulo: 'Los perfiles de clases llegan pronto', texto: 'Todavía no se pueden dar clases en Talently.' },
    },
    noEncontrado: {
        titulo: 'No encontramos este perfil',
        texto: 'Puede que el enlace esté incompleto o que la cuenta ya no exista.',
        accion: 'Ir a Inicio',
    },
    verificacion: {
        titulo: (nombre: string) => `Verificación de ${nombre}`,
        nota: 'Talently nunca muestra el RUT, la fecha de nacimiento ni las fotos de la cédula.',
        ninguna: (nombre: string) => `${nombre} todavía no tiene verificaciones.`,
    },
} as const;
