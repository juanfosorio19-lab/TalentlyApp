// SYS-404 · Página no encontrada (spec §5.3 regla 8): con «Ir a Inicio».
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../../ui/AppBar';
import { EmptyState } from '../../ui/EmptyState';
import { IconSearch } from '../../ui/icons';
import { useGoBack } from '../BackButtonManager';
import { paths } from '../paths';

export const screenId = 'SYS-404';

export function NotFoundScreen() {
    const navigate = useNavigate();
    const goBack = useGoBack();
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState
                    icon={IconSearch}
                    title="No encontramos esta página"
                    text="Puede que el enlace esté incompleto o que la publicación ya no exista."
                    action={{ label: 'Ir a Inicio', onClick: () => navigate(paths.inicio(), { replace: true }) }}
                />
            </main>
        </div>
    );
}
