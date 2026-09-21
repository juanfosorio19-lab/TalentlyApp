// src/components/ui/icons.jsx
// Set de iconos de marca Talently (diseño del dueño, 2026-09-21).
// Duotono: forma principal a opacidad plena + detalle secundario translúcido.
// Usan currentColor para heredar el color del tab activo/inactivo y del tema.
// El logo (tile morado + T) es la única pieza con color propio de marca.

const base = (size, props) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': 'true',
    ...props,
});

/* ── Logo Talently: tile morado con la marca T ── */
export function TalentlyLogo({ size = 32, radius = 7, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" {...props}>
            <defs>
                <linearGradient id="tlg-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#A78BFA" />
                    <stop offset="0.55" stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#6D28D9" />
                </linearGradient>
            </defs>
            <rect width="32" height="32" rx={radius} fill="url(#tlg-bg)" />
            <TalentlyMarkPaths />
        </svg>
    );
}

/* ── Solo la marca T (para ponerla sobre un fondo propio, ej. login) ── */
export function TalentlyMark({ size = 32, ...props }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" {...props}>
            <TalentlyMarkPaths />
        </svg>
    );
}

function TalentlyMarkPaths() {
    return (
        <g fill="none" strokeLinecap="round" strokeWidth="5.1">
            <path d="M16.9 13.1 16.3 19.8 Q15.9 23.7 11.8 24.1" stroke="#D9CBFC" opacity="0.92" />
            <path d="M9.3 11.6 22.4 10" stroke="#FFFFFF" opacity="0.97" />
        </g>
    );
}

/* ── Inicio: casa con puerta translúcida ── */
export function IconHome({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path
                fillRule="evenodd"
                d="M11.1 2.9a1.5 1.5 0 0 1 1.8 0l8 6.1c.38.28.6.73.6 1.2V19.5A2.5 2.5 0 0 1 19 22H5a2.5 2.5 0 0 1-2.5-2.5v-9.3c0-.47.22-.92.6-1.2l8-6.1ZM10 22v-5.4c0-.9.72-1.6 1.6-1.6h.8c.88 0 1.6.7 1.6 1.6V22h-4Z"
            />
            <path d="M11.6 15h.8c.88 0 1.6.7 1.6 1.6V22h-4v-5.4c0-.9.72-1.6 1.6-1.6Z" opacity="0.4" />
        </svg>
    );
}

/* ── Ofertas: maletín con tapa translúcida ── */
export function IconOffers({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path d="M9 6V5.2A2.2 2.2 0 0 1 11.2 3h1.6A2.2 2.2 0 0 1 15 5.2V6h-1.8v-.8a.4.4 0 0 0-.4-.4h-1.6a.4.4 0 0 0-.4.4V6H9Z" />
            <path d="M4.5 6h15A2.5 2.5 0 0 1 22 8.5v3.2c0 .62-.38 1.18-.97 1.4A25.3 25.3 0 0 1 12 14.7a25.3 25.3 0 0 1-9.03-1.6A1.51 1.51 0 0 1 2 11.7V8.5A2.5 2.5 0 0 1 4.5 6Z" opacity="0.5" />
            <path d="M2 14.9c3.13 1.14 6.5 1.75 10 1.75s6.87-.6 10-1.75v3.6A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-3.6ZM10.9 13h2.2v2.6h-2.2V13Z" />
        </svg>
    );
}

/* ── Buscar/Explorar: lupa con persona ── */
export function IconExplore({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path
                fillRule="evenodd"
                d="M10.5 2a8.5 8.5 0 1 0 5.26 15.18l3.53 3.53a1.5 1.5 0 0 0 2.12-2.12l-3.53-3.53A8.5 8.5 0 0 0 10.5 2Zm0 2.6a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8Z"
            />
            <path d="M10.5 6.4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 4.9c2 0 3.6 1 3.9 2.5a5.88 5.88 0 0 1-7.8 0c.3-1.5 1.9-2.5 3.9-2.5Z" opacity="0.45" />
        </svg>
    );
}

/* ── Mensajes: burbuja con puntos + burbuja secundaria ── */
export function IconChat({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path d="M15.5 8.5c3.6 0 6.5 2.35 6.5 5.25 0 1.3-.58 2.48-1.54 3.4l.5 2.62a.5.5 0 0 1-.7.55l-2.87-1.3c-.6.15-1.24.23-1.89.23-3.6 0-6.5-2.35-6.5-5.25S11.9 8.5 15.5 8.5Z" opacity="0.45" />
            <path
                fillRule="evenodd"
                d="M9.5 2C5.36 2 2 4.8 2 8.25c0 1.55.68 2.96 1.8 4.05l-.6 3.05a.55.55 0 0 0 .78.6l3.3-1.53c.7.18 1.44.28 2.22.28 4.14 0 7.5-2.8 7.5-6.2C17 4.8 13.64 2 9.5 2ZM6.2 9.35a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm3.3 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm3.3 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"
            />
        </svg>
    );
}

/* ── Perfil: persona ── */
export function IconPerson({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <circle cx="12" cy="7.2" r="4.2" />
            <path d="M12 13.4c4.42 0 8 2.24 8 5.3 0 1.8-1.4 3.3-3.2 3.3H7.2C5.4 22 4 20.5 4 18.7c0-3.06 3.58-5.3 8-5.3Z" opacity="0.5" />
        </svg>
    );
}

/* ── Perfil empresa: edificio con ventanas ── */
export function IconBuilding({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path
                fillRule="evenodd"
                d="M5.5 2h9A2.5 2.5 0 0 1 17 4.5V22H3V4.5A2.5 2.5 0 0 1 5.5 2Zm1.3 4.2h2.4v2.4H6.8V6.2Zm4.9 0h2.4v2.4h-2.4V6.2Zm-4.9 4.6h2.4v2.4H6.8v-2.4Zm4.9 0h2.4v2.4h-2.4v-2.4ZM8.6 22v-4.1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V22H8.6Z"
            />
            <path d="M17 9.4h2A2 2 0 0 1 21 11.4V22h-4V9.4Z" opacity="0.45" />
        </svg>
    );
}

/* ── Matches: tarjetas apiladas con corazón ── */
export function IconMatches({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <rect x="3" y="4.4" width="11" height="15" rx="2.2" transform="rotate(-8 8.5 12)" opacity="0.45" />
            <path
                fillRule="evenodd"
                d="M12.6 4.9 20 6.2a2.2 2.2 0 0 1 1.78 2.55L19.9 19.4a2.2 2.2 0 0 1-2.55 1.78l-7.4-1.3a2.2 2.2 0 0 1-1.78-2.55L10 6.68A2.2 2.2 0 0 1 12.6 4.9Zm2.15 5.1c-.75-.4-1.66-.2-2.1.5-.5.82-.2 1.86.64 2.66.6.57 2 1.44 2.6 1.8.16.1.36.06.48-.08.45-.55 1.45-1.85 1.77-2.6.44-1.05.05-2.06-.83-2.42-.77-.32-1.6-.02-2.02.62-.14-.2-.32-.37-.54-.48Z"
            />
        </svg>
    );
}

/* ── Corazón (favoritos / matches simples) ── */
export function IconHeart({ size = 24, ...props }) {
    return (
        <svg {...base(size, props)}>
            <path d="M12 21s-7.1-4.35-9.33-8.73C1.06 9.1 2.53 5.6 5.64 5.07 7.6 4.74 9.5 5.6 10.6 7.1c.56.76 2.24.76 2.8 0 1.1-1.5 3-2.36 4.96-2.03 3.1.53 4.58 4.03 2.97 7.2C19.1 16.65 12 21 12 21Z" />
        </svg>
    );
}
