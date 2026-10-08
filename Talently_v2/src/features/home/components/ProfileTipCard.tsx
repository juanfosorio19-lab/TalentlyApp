// Tarjeta de completitud honesta de Inicio («Te falta la credencial SPD»,
// «Agrega tu curso de manipulación de alimentos para destacar»): Card con
// tile, título, su Badge, por qué importa y la acción real.
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { IconDocument } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import type { DemoProfileTip } from '../../demo/types';

export interface ProfileTipCardProps {
    tip: DemoProfileTip;
    onAction: () => void;
}

export function ProfileTipCard({ tip, onAction }: ProfileTipCardProps) {
    return (
        <Card>
            <Stack row gap={3} align="start">
                <span className="tl-listitem__tile">
                    <IconDocument />
                </span>
                <Stack gap={3} align="start">
                    <Stack gap={1} align="start">
                        <span className="button-lg">{tip.titulo}</span>
                        {tip.badge && <Badge status={tip.badge} />}
                        <span className="tl-listitem__sub">{tip.texto}</span>
                    </Stack>
                    <Button variant="tonal" size="sm" onClick={onAction}>
                        {tip.accion}
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
}
