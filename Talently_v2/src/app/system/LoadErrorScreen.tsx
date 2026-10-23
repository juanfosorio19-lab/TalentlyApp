// La pantalla no se pudo abrir: su código no llegó (sin conexión, o una versión
// nueva de la app reemplazó los archivos) o falló al dibujarse. Es el
// `errorElement` de cada ruta de feature (src/app/routeManifest.tsx): queda
// dentro de RootLayout, así la TabBar, el atrás y los avisos siguen andando.
// «Reintentar» vuelve a cargar la página en la misma ruta.
import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import { ErrorState } from '../../ui/ErrorState';

export const screenId = 'SYS-ERROR';

export function LoadErrorScreen() {
    const error = useRouteError();
    useEffect(() => {
        // Sin esto el error no queda en la consola: el router ya lo atrapó.
        console.error(error);
    }, [error]);
    return (
        <div className="tl-app-screen">
            <main className="tl-app-screen__body">
                <ErrorState title="No pudimos abrir esta pantalla" onRetry={() => window.location.reload()} />
            </main>
        </div>
    );
}
