// «Mis perfiles» (PRF-01): un chip por perfil (Trabajo · Hogar…) y, en la
// misma línea, «Ver cómo me ven» (Button ghost sm pegado al borde, como en el
// prototipo).
import { Button } from '../../../ui/Button';
import { IconEye } from '../../../ui/icons';
import type { DemoProfileTab } from '../../demo/types';
import { COPY } from '../copy';
import { ChipChoice } from './ChipChoice';

export interface ProfileTabsProps {
    tabs: readonly DemoProfileTab[];
    value: DemoProfileTab['id'];
    onChange: (id: DemoProfileTab['id']) => void;
    onPreview: () => void;
}

export function ProfileTabs({ tabs, value, onChange, onPreview }: ProfileTabsProps) {
    return (
        <ChipChoice
            className="prf-tabs"
            label={COPY.perfil.misPerfiles}
            options={tabs.map((t) => ({ value: t.id, label: t.nombre }))}
            value={value}
            onChange={onChange}
            action={
                <Button variant="ghost" size="sm" icon={IconEye} className="prf-tabs__preview" onClick={onPreview}>
                    {COPY.perfil.verComoMeVen}
                </Button>
            }
        />
    );
}
