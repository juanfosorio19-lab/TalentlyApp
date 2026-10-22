// INI-02 · Inicio de una organización (spec §5.2): KPIs reales, «Publicar»
// (abre PUBL-01: Empleo o Turno) y «Requiere tu atención» (turnos sin
// cubrir, postulantes sin revisar y evaluaciones pendientes), cada fila con
// su destino (GES-04, GES-02) de demo/targets, abierto con useOpenPath.
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { IconAdd, IconDocument, IconPeople, IconStar, type IconComponent } from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import type { DemoAttentionItem, DemoHomeFeed } from '../../demo/types';
import { copy } from '../copy';
import { useHomeNavigation } from '../navigation';
import '../home.css';

export const screenId = 'INI-02';

const ATTENTION_ICON: Record<DemoAttentionItem['icono'], IconComponent> = {
    cupos: IconPeople,
    postulantes: IconDocument,
    evaluar: IconStar,
};

export interface OrgHomeScreenProps {
    feed: DemoHomeFeed;
    onPublish: () => void;
}

export function OrgHomeScreen({ feed, onPublish }: OrgHomeScreenProps) {
    const { targetLink } = useHomeNavigation();
    const panelBlock = feed.bloques.find((b) => b.tipo === 'panel');
    const panel = panelBlock?.tipo === 'panel' ? panelBlock.panel : undefined;

    return (
        <main className="tl-app-screen__body">
            <div className="tl-app-screen__content home-content">
                <Stack gap={4}>
                    {panel && (
                        <div className="home-kpis">
                            {panel.kpis.map((kpi) => (
                                <Card key={kpi.id}>
                                    <Stack gap={1}>
                                        <span className="body home-muted">{kpi.label}</span>
                                        <span className="h2">{kpi.valor}</span>
                                    </Stack>
                                </Card>
                            ))}
                        </div>
                    )}
                    <Button block icon={IconAdd} aria-haspopup="dialog" onClick={onPublish}>
                        {copy.home.publicar}
                    </Button>
                </Stack>
                {panel && panel.atencion.length > 0 && (
                    <ScreenSection title={copy.org.atencion}>
                        <List>
                            {panel.atencion.map((item) => (
                                <ListItem
                                    key={item.id}
                                    icon={ATTENTION_ICON[item.icono]}
                                    title={item.texto}
                                    sub={item.detalle}
                                    // El chevron, como en el prototipo (también si la pantalla aún dice «Disponible pronto»).
                                    chevron
                                    {...targetLink(item.destino)}
                                />
                            ))}
                        </List>
                    </ScreenSection>
                )}
            </div>
        </main>
    );
}
