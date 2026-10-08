// Tarjeta de completitud honesta («Te falta 1 cosa»): qué falta, para qué
// sirve y la acción real. Nada de «Perfil al 100 %».
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { IconDocument, IconShield, IconUpload } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import type { DemoProfileTip } from '../../demo/types';

export function ProfileTip({ tip, onAction }: { tip: DemoProfileTip; onAction: () => void }) {
    // Verificar identidad lleva el escudo; un documento por subir, el documento y «subir».
    const verify = tip.destino?.pantalla === 'verificacion';
    const Tile = verify ? IconShield : IconDocument;
    return (
        <Card>
            <Stack row gap={3} align="start">
                <span className="tl-listitem__tile">
                    <Tile />
                </span>
                <Stack gap={3} align="start" className="prf-grow">
                    <Stack gap={1} align="start">
                        <span className="button-lg">{tip.titulo}</span>
                        {tip.badge && <Badge status={tip.badge} />}
                        <span className="body prf-muted">{tip.texto}</span>
                    </Stack>
                    <Button variant="tonal" size="sm" icon={verify ? undefined : IconUpload} onClick={onAction}>
                        {tip.accion}
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
}
