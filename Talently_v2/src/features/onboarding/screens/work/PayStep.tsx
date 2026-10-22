// ONB-T3 · ¿Cuánto esperas ganar? (/onboarding/trabajo/3). Paso opcional:
// sueldo líquido (si busca empleo), tarifa mínima (si toma turnos), «Prefiero
// no decir» y la vestimenta propia (si toma turnos). «Omitir» sigue sin
// guardar nada de este paso.
import type { PayUnit } from '../../../../ui/Amount';
import { Checkbox } from '../../../../ui/Checkbox';
import { ChipGroup } from '../../../../ui/ChipGroup';
import { Stack } from '../../../../ui/Layout';
import { MoneyField } from '../../../../ui/MoneyField';
import { StepLayout } from '../../../../ui/StepLayout';
import { UNIDADES_PAGO, VESTIMENTA, type Vestimenta } from '../../catalog';
import { COPY } from '../../copy';
import { OnboardingMenu } from '../../components/OnboardingMenu';
import { setTrabajo } from '../../store';
import { useWorkStep } from './useWorkStep';
import '../../onboarding.css';

export const screenId = 'ONB-T3';

const C = COPY.trabajo.pago;

export function PayStep() {
    const { draft, busca, layout, next } = useWorkStep(3);
    const { trabajo } = draft;
    const noDecir = trabajo.noDecir;

    return (
        <>
            <StepLayout
                title={C.titulo}
                subtitle={C.sub}
                {...layout}
                onContinue={() => {
                    setTrabajo({ pagoOmitido: false });
                    next();
                }}
                onSkip={() => {
                    setTrabajo({ pagoOmitido: true });
                    next();
                }}
            >
                <Stack gap={6}>
                    <Stack gap={4}>
                        {busca.empleo && (
                            <MoneyField
                                label={C.sueldo}
                                value={noDecir ? null : trabajo.sueldo}
                                onChange={(sueldo) => setTrabajo({ sueldo })}
                                unit={trabajo.sueldoUnidad}
                                onUnitChange={(sueldoUnidad: PayUnit) => setTrabajo({ sueldoUnidad })}
                                units={UNIDADES_PAGO}
                                unitSheetTitle={C.unidad}
                                disabled={noDecir}
                                help={busca.turnos ? undefined : C.ayuda}
                            />
                        )}
                        {busca.turnos && (
                            <MoneyField
                                label={C.tarifa}
                                value={noDecir ? null : trabajo.tarifa}
                                onChange={(tarifa) => setTrabajo({ tarifa })}
                                unit={trabajo.tarifaUnidad}
                                onUnitChange={(tarifaUnidad: PayUnit) => setTrabajo({ tarifaUnidad })}
                                units={UNIDADES_PAGO}
                                unitSheetTitle={C.unidad}
                                disabled={noDecir}
                                help={C.ayuda}
                            />
                        )}
                        <Checkbox
                            label={C.noDecir}
                            checked={noDecir}
                            onChange={(e) => setTrabajo({ noDecir: e.target.checked })}
                        />
                    </Stack>
                    {busca.turnos && (
                        <ChipGroup<Vestimenta>
                            label={C.vestimenta}
                            options={VESTIMENTA}
                            value={trabajo.vestimenta}
                            onChange={(vestimenta) => setTrabajo({ vestimenta })}
                        />
                    )}
                </Stack>
            </StepLayout>
            <OnboardingMenu />
        </>
    );
}
