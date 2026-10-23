// El enlace que se comparte de una publicación (DET-01 y GES-01, la misma
// regla): la página más la ruta, sin la query de la demo (`?demo=…`), la hoja
// abierta ni nada de la sesión. Así quien lo abre ve la publicación como
// quien busca, no entra como la organización dueña.

/** `href` es el de useHref(paths.publicacion(id)): «#/p/…» con HashRouter, «/p/…» con BrowserRouter. */
export function shareUrl(location: { origin: string; pathname: string }, href: string): string {
    return href.startsWith('#') ? `${location.origin}${location.pathname}${href}` : `${location.origin}${href}`;
}
