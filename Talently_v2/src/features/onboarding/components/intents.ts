// Las tarjetas de ONB-01 (ícono, título, ejemplo y la etiqueta de lo que aún
// no abre) y su versión por bloque para ONB-02.
import { IconBook, IconClock, IconJobHomeCare, IconOffers, IconPeople, IconTool, type IconComponent } from '../../../ui/icons';
import type { OptionGroupOption } from '../../../ui/OptionCard';
import { COPY } from '../copy';
import type { Bloque, Intencion } from '../model';

const O = COPY.intencion.opciones;

const ICONO: Record<Intencion, IconComponent> = {
    empleo: IconOffers,
    turnos: IconClock,
    servicios: IconTool,
    clases: IconBook,
    empresa: IconPeople,
    hogar: IconJobHomeCare,
};

export function intentOption(i: Intencion): OptionGroupOption<Intencion> {
    const o = O[i];
    return { value: i, icon: ICONO[i], title: o.titulo, example: o.ejemplo, badge: 'badge' in o ? o.badge : undefined };
}

/** ONB-02: una tarjeta por bloque, con lo que eligió en ONB-01. */
export function blockOption(bloque: Bloque, intenciones: readonly Intencion[]): OptionGroupOption<Bloque> {
    switch (bloque) {
        case 'trabajo': {
            const empleo = intenciones.includes('empleo');
            const turnos = intenciones.includes('turnos');
            const solo: Intencion = empleo ? 'empleo' : 'turnos';
            return {
                value: 'trabajo',
                icon: ICONO[solo],
                title: empleo && turnos ? COPY.empezar.trabajoAmbos : O[solo].titulo,
            };
        }
        case 'servicios':
            return { value: 'servicios', icon: ICONO.servicios, title: O.servicios.titulo, badge: O.servicios.badge };
        case 'clases':
            return { value: 'clases', icon: ICONO.clases, title: O.clases.titulo, badge: O.clases.badge };
        case 'organizacion':
            return { value: 'organizacion', icon: ICONO.empresa, title: O.empresa.titulo };
        case 'hogar':
            return { value: 'hogar', icon: ICONO.hogar, title: O.hogar.titulo };
    }
}
