// Compartir una publicación (DET-01 y GES-01, la misma regla y los mismos
// textos). El enlace es la página más la ruta, sin la query de la demo
// (`?demo=…`), la hoja abierta ni nada de la sesión: quien lo abre ve la
// publicación como quien busca, no entra como la organización dueña.

/** `href` es el de useHref(paths.publicacion(id)): «#/p/…» con HashRouter, «/p/…» con BrowserRouter. */
export function shareUrl(location: { origin: string; pathname: string }, href: string): string {
    return href.startsWith('#') ? `${location.origin}${location.pathname}${href}` : `${location.origin}${href}`;
}

/**
 * Los avisos de «Compartir», iguales en DET-01 y GES-01 (no están en el
 * prototipo). `error` vale para la hoja de compartir del sistema y para el
 * portapapeles: no promete cuál de los dos falló.
 */
export const SHARE_COPY = {
    copiado: 'Copiamos el enlace',
    error: 'No pudimos compartir el enlace. Intenta de nuevo.',
} as const;
