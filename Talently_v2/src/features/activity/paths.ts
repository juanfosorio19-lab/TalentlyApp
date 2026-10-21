// Rutas que Actividad necesita y src/app/paths.ts aún no trae (pedidas en
// requests). Cuando lleguen a paths.ts, este archivo se borra.
import { paths } from '../../app/paths';

export const activityPaths = {
    /** PRF-12 · Impulsa tu perfil (spec §5.4: /perfil/impulsar; la registra profile/routes.tsx). */
    impulsarPerfil: () => '/perfil/impulsar',
    /**
     * PUBL-01 · ¿Qué quieres publicar? (spec §5.4: `?sheet=publicar`). La hoja
     * vive en Inicio, que la abre al montarse con este parámetro, hasta que
     * PublishSheet pase a src/ui. Pedido como `paths.inicio({ sheet })`.
     */
    publicar: () => `${paths.inicio()}?sheet=publicar`,
} as const;
