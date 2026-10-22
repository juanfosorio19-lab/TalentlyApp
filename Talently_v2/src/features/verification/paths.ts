// Rutas que Verificación necesita y src/app/paths.ts aún no trae (pedidas en
// «requests»). Cuando lleguen a paths.ts, este archivo se borra.
import { paths } from '../../app/paths';

export const verificationPaths = {
    /**
     * VER-02 con `?volver=<ruta>`: el asistente que la pidió (PUBL-04, flujo 5).
     * Pedido como `paths.verificarIdentidad(volver)`.
     */
    verificarIdentidad: (volver?: string) =>
        `${paths.verificarIdentidad()}${volver ? `?${new URLSearchParams({ volver })}` : ''}`,
    /** VER-03 · Subir credencial (spec §5.4: `/verificacion/credencial/:tipo`). Pedido como `paths.subirCredencial(tipo)`. */
    subirCredencial: (tipo: string) => `${paths.verificacion()}/credencial/${tipo}`,
} as const;
