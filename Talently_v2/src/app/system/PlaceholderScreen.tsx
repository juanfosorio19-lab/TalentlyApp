// Pantalla provisoria mientras se construye la real (solo durante el armado del rediseño).
import { AppBar } from '../../ui/AppBar';
import { EmptyState } from '../../ui/EmptyState';
import { IconTool } from '../../ui/icons';
import { useGoBack } from '../BackButtonManager';

export function PlaceholderScreen({ title, screenId, tab }: { title: string; screenId: string; tab?: boolean }) {
    const goBack = useGoBack();
    const body = (
        <main className="tl-app-screen__body">
            <EmptyState icon={IconTool} title="En construcción" text={`${screenId} · ${title}`} />
        </main>
    );
    return tab ? (
        <>
            <AppBar title={title} />
            {body}
        </>
    ) : (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={title} onBack={goBack} />
            {body}
        </div>
    );
}
