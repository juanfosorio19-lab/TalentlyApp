// src/components/ui/icons.jsx
// Set de iconos OFICIAL de Talently — SVGs entregados por el dueño
// (talently-icons-svg.zip, 2026-09-22). Geometría verbatim; el color
// principal (#6D4AFF) se mapea a currentColor para que los iconos hereden
// el color del tab activo/inactivo y del tema; los acentos (#A78BFA) se
// expresan como currentColor translúcido. El logo conserva sus gradientes.
//
// Paleta de marca: purple #6D4AFF · light #A78BFA · dark #35256F

const base = (size, props) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': 'true',
    ...props,
});

const strokeProps = {
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

/* ── Logo Talently: tile con gradiente de marca + T blanca (launcher/login) ── */
export function TalentlyLogo({ size = 32, radius = 7, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
            <defs>
                <linearGradient id="tlg-tile" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6D4AFF" />
                    <stop offset="1" stopColor="#B48CFF" />
                </linearGradient>
                <linearGradient id="tlg-t" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#E6DBFF" />
                </linearGradient>
            </defs>
            <rect width="24" height="24" rx={radius * (24 / 32)} fill="url(#tlg-tile)" />
            {/* Marca T oficial (talently-t-mark.svg) recoloreada a blanco,
                centrada al 72% dentro del tile */}
            <g transform="translate(3.36 3.36) scale(0.72)">
                <path
                    d="M4.5 5.25A1.25 1.25 0 0 1 5.75 4h12.5a1.25 1.25 0 0 1 .99 2.01l-2.05 2.6a1.25 1.25 0 0 1-.98.49H13.75v8.52c0 .39-.18.76-.49 1L11 20.22a1.25 1.25 0 0 1-2.03-.98V9.1H6.15A1.65 1.65 0 0 1 4.5 7.45V5.25Z"
                    fill="url(#tlg-t)"
                />
            </g>
        </svg>
    );
}

/* ── Logo principal: T con gradiente morado, fondo transparente
      (talently-logo.svg oficial, verbatim) ── */
export function TalentlyMark({ size = 32, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
            <defs>
                <linearGradient id="talentlyGradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6D4AFF" />
                    <stop offset="1" stopColor="#B48CFF" />
                </linearGradient>
            </defs>
            <path
                d="M4.2 5.2C4.2 4.54 4.74 4 5.4 4h13.2c.77 0 1.2.88.73 1.49l-2.14 2.77a1.5 1.5 0 0 1-1.18.58H13.8v8.86c0 .45-.2.87-.55 1.14l-2.16 1.68c-.79.61-1.93.05-1.93-.95V8.84H6.1c-1.05 0-1.9-.85-1.9-1.9V5.2Z"
                fill="url(#talentlyGradient)"
            />
        </svg>
    );
}

/* ── Inicio (inicio.svg) ── */
export function IconHome({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path {...strokeProps} d="M3.5 10.5 12 3.8l8.5 6.7v8.2a1.3 1.3 0 0 1-1.3 1.3H4.8a1.3 1.3 0 0 1-1.3-1.3v-8.2Z" />
            <path {...strokeProps} d="M9 20v-5.5h6V20" />
        </svg>
    );
}

/* ── Ofertas (ofertas.svg) ── */
export function IconOffers({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <rect {...strokeProps} x="3.2" y="6.8" width="17.6" height="13" rx="2" />
            <path {...strokeProps} d="M8 6.8V5.4A2.4 2.4 0 0 1 10.4 3h3.2A2.4 2.4 0 0 1 16 5.4v1.4M3.2 11.4h17.6M10 11.4v2h4v-2" />
            <path {...strokeProps} d="M6.2 15.6h5.2" />
        </svg>
    );
}

/* ── Buscar / Explorar (buscar.svg) ── */
export function IconExplore({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <circle {...strokeProps} cx="10.7" cy="10.7" r="6.3" />
            <path {...strokeProps} d="m15.5 15.5 5 5" />
            <circle cx="10.7" cy="10.7" r="2.4" fill="currentColor" fillOpacity=".35" />
        </svg>
    );
}

/* ── Mensajes (mensajes.svg) ── */
export function IconChat({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path {...strokeProps} d="M4.1 5.2h11.8a2.1 2.1 0 0 1 2.1 2.1v6.1a2.1 2.1 0 0 1-2.1 2.1H9.4l-3.9 3v-3H4.1A2.1 2.1 0 0 1 2 13.4V7.3a2.1 2.1 0 0 1 2.1-2.1Z" />
            <path {...strokeProps} strokeWidth="2.6" d="M8.1 9.9h.01M11.9 9.9h.01M15.7 9.9h.01" />
            <path {...strokeProps} d="M13.5 17.1h5.1a2.1 2.1 0 0 1 2.1 2.1v2.1l-2.4-1.7h-4.8" />
        </svg>
    );
}

/* ── Perfil (perfil.svg) ── */
export function IconPerson({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <circle {...strokeProps} cx="12" cy="7.4" r="3.4" />
            <path {...strokeProps} d="M5 20c.75-4 3.1-6 7-6s6.25 2 7 6" />
            <circle cx="12" cy="7.4" r="1.15" fill="currentColor" fillOpacity=".5" />
        </svg>
    );
}

/* ── Matches (matches.svg): dos tarjetas de perfil + estrella ── */
export function IconMatches({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <rect {...strokeProps} x="3.4" y="4.2" width="8.6" height="11.8" rx="1.8" />
            <rect {...strokeProps} x="12" y="7.2" width="8.6" height="11.8" rx="1.8" />
            <circle cx="7.7" cy="8.1" r="1.45" fill="currentColor" />
            <path {...strokeProps} d="M5.5 12.4c.65-1.15 3.7-1.15 4.35 0" />
            <circle cx="16.3" cy="11.1" r="1.45" fill="currentColor" fillOpacity=".55" />
            <path {...strokeProps} d="M14.1 15.4c.65-1.15 3.7-1.15 4.35 0" />
            <path d="m15.9 5.8.45.9.99.14-.72.7.17.99-.89-.47-.89.47.17-.99-.72-.7.99-.14.45-.9Z" fill="currentColor" fillOpacity=".55" />
        </svg>
    );
}

/* ── Favoritos / corazón (favoritos.svg) ── */
export function IconHeart({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path
                {...strokeProps}
                d="M12 20.2s-7.5-4.5-7.5-10A4.1 4.1 0 0 1 8.6 6a4.4 4.4 0 0 1 3.4 1.7A4.4 4.4 0 0 1 15.4 6a4.1 4.1 0 0 1 4.1 4.2c0 5.5-7.5 10-7.5 10Z"
                fill="currentColor"
                fillOpacity=".22"
            />
        </svg>
    );
}

/* ── Match confirmado (match-heart.svg): corazón con check ── */
export function IconMatchHeart({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path
                {...strokeProps}
                d="M12 20.2s-7.1-4.2-7.1-9.2A3.9 3.9 0 0 1 8.8 7a4.1 4.1 0 0 1 3.2 1.6A4.1 4.1 0 0 1 15.2 7a3.9 3.9 0 0 1 3.9 4c0 5-7.1 9.2-7.1 9.2Z"
                fill="currentColor"
                fillOpacity=".18"
            />
            <path {...strokeProps} d="m9.3 12.1 1.7 1.7 3.7-3.8" />
        </svg>
    );
}

/* ── Notificaciones (notificaciones.svg): campana con badge + ── */
export function IconBell({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path {...strokeProps} d="M6.1 16.8h11.8l-1.5-2.2V10a4.4 4.4 0 0 0-8.8 0v4.6l-1.5 2.2Z" />
            <path {...strokeProps} d="M9.8 19.2a2.4 2.4 0 0 0 4.4 0" />
            <circle cx="18.7" cy="5.3" r="2.3" fill="currentColor" fillOpacity=".45" />
            <path {...strokeProps} strokeWidth="1.2" d="M18.7 4v1.6M17.9 4.8h1.6" />
        </svg>
    );
}

/* ── Ajustes (ajustes.svg): sliders ── */
export function IconGear({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path {...strokeProps} d="M4 7h7M15 7h5M4 12h3M11 12h9M4 17h7M15 17h5" />
            <circle {...strokeProps} cx="13" cy="7" r="2" fill="var(--surface, #fff)" />
            <circle {...strokeProps} cx="9" cy="12" r="2" fill="var(--surface, #fff)" />
            <circle {...strokeProps} cx="13" cy="17" r="2" fill="var(--surface, #fff)" />
        </svg>
    );
}

/* ── Cerrar / nope (cerrar.svg, sin el círculo: los botones del deck ya son
      circulares) ── */
export function IconClose({ size = 24, circle = false, ...props }) {
    return (
        <svg {...base(size, props)}>
            {circle && <circle {...strokeProps} cx="12" cy="12" r="8.5" />}
            <path {...strokeProps} d="m9 9 6 6M15 9l-6 6" />
        </svg>
    );
}

/* ── Like / pulgar (like.svg) ── */
export function IconLike({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path
                {...strokeProps}
                d="M7.4 10.2v9.1h9.1c1.1 0 1.9-.6 2.2-1.6l1.2-4.6a2 2 0 0 0-1.9-2.5h-3.1l.7-3.1c.3-1.4-.8-2.7-2.2-2.7L9.1 10.2H7.4Z"
                fill="currentColor"
                fillOpacity=".2"
            />
            <path {...strokeProps} d="M4 10.2h3.4v9.1H4z" />
        </svg>
    );
}

/* ── Más (mas.svg) ── */
export function IconMore({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <circle cx="6" cy="12" r="1.7" fill="currentColor" />
            <circle cx="12" cy="12" r="1.7" fill="currentColor" />
            <circle cx="18" cy="12" r="1.7" fill="currentColor" />
        </svg>
    );
}
