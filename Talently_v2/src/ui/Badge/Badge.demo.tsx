import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from './Badge';
import { BADGE_TONE_BY_STATUS, type BadgeStatus, type BadgeTone } from './badgeTones';

const TONES: Array<{ tone: BadgeTone; sample: BadgeStatus; tokens: string }> = [
    { tone: 'neutral', sample: 'Visto', tokens: 'surface-2 · text-2' },
    { tone: 'primary', sample: 'Nuevo', tokens: 'primary-subtle · on-primary-subtle' },
    { tone: 'info', sample: 'Postulado', tokens: 'info-subtle · info-text' },
    { tone: 'success', sample: 'Confirmado', tokens: 'success-subtle · success-text' },
    { tone: 'warning', sample: 'Vence en 30 días', tokens: 'warning-subtle · warning-text' },
    { tone: 'danger', sample: 'Rechazada', tokens: 'danger-subtle · danger-text' },
];

/** Etiquetas del diccionario agrupadas por tono, en el orden del diccionario. */
const BY_TONE = (Object.keys(BADGE_TONE_BY_STATUS) as BadgeStatus[]).reduce<Record<BadgeTone, BadgeStatus[]>>(
    (acc, status) => {
        acc[BADGE_TONE_BY_STATUS[status]].push(status);
        return acc;
    },
    { neutral: [], primary: [], info: [], success: [], warning: [], danger: [] },
);

const demo: DemoModule = {
    name: 'Badge',
    group: 'Datos y confianza',
    summary:
        'Etiqueta de estado (alto 24, 12/600, pill) en 6 tonos. Cada etiqueta del diccionario lleva siempre el mismo tono: se usa con status, nunca eligiendo el color.',
    Demo: () => (
        <>
            <DemoSection title="Seis tonos · alto 24 · 12/600 · pill">
                <DemoRow>
                    {TONES.map(({ tone, sample, tokens }) => (
                        <DemoItem key={tone} label={`${tone} · ${tokens}`}>
                            <Badge status={sample} />
                        </DemoItem>
                    ))}
                    <DemoItem label="info · credencial o publicación en revisión">
                        <Badge status="En revisión" />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Diccionario · cada etiqueta siempre con el mismo tono">
                {TONES.map(({ tone }) => (
                    <DemoRow key={tone} column>
                        <DemoLabel>{tone}</DemoLabel>
                        <DemoRow>
                            {BY_TONE[tone].map((status) => (
                                <Badge key={status} status={status} />
                            ))}
                        </DemoRow>
                    </DemoRow>
                ))}
            </DemoSection>
            <DemoSection title="Con un dato variable · tono explícito">
                <DemoRow>
                    <DemoItem label="warning · 2 cupos o menos">
                        <Badge tone="warning">Quedan 2 de 8 cupos</Badge>
                    </DemoItem>
                    <DemoItem label="info · clases que abren más adelante">
                        <Badge tone="info">Reservas desde marzo</Badge>
                    </DemoItem>
                    <DemoItem label="warning · plazo de 1 h o menos">
                        <Badge tone="warning">Vence en 45 min</Badge>
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoLabel>default</DemoLabel>
                <DemoRow>
                    <Badge status="Visto" />
                    <Badge status="Nuevo" />
                    <Badge status="Postulado" />
                    <Badge status="Confirmado" />
                    <Badge status="Vence en 30 días" />
                    <Badge status="Rechazada" />
                    <Badge status="En revisión" />
                </DemoRow>
                <DemoItem label="presionado · foco · seleccionado · deshabilitado · error · cargando: Badge no es interactivo, solo informa. Si algo se toca, es un Chip o un VerificationBadge.">
                    <Badge>No aplica</Badge>
                </DemoItem>
            </DemoSection>
        </>
    ),
};

export default demo;
