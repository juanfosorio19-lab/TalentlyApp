// «Mis perfiles» (PRF-01): un chip por perfil (Trabajo · Hogar…) y, en la
// misma línea, «Ver cómo me ven». Marcado tl-chipgroup del prototipo con Chip
// de src/ui: ChipGroup no admite una acción en su cabecera (pedido en requests).
import { useId } from 'react';
import { Button } from '../../../ui/Button';
import { Chip } from '../../../ui/Chip';
import { IconEye } from '../../../ui/icons';
import type { DemoProfileTab } from '../../demo/types';
import { COPY } from '../copy';

export interface ProfileTabsProps {
    tabs: readonly DemoProfileTab[];
    value: DemoProfileTab['id'];
    onChange: (id: DemoProfileTab['id']) => void;
    onPreview: () => void;
}

export function ProfileTabs({ tabs, value, onChange, onPreview }: ProfileTabsProps) {
    const labelId = useId();
    return (
        <div className="tl-chipgroup prf-tabs" role="group" aria-labelledby={labelId}>
            <div className="tl-chipgroup__head">
                <span className="tl-chipgroup__label" id={labelId}>
                    {COPY.perfil.misPerfiles}
                </span>
                <Button variant="ghost" size="sm" icon={IconEye} onClick={onPreview}>
                    {COPY.perfil.verComoMeVen}
                </Button>
            </div>
            <div className="tl-chipgroup__chips">
                {tabs.map((t) => (
                    <Chip key={t.id} selected={t.id === value} onClick={() => onChange(t.id)}>
                        {t.nombre}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
