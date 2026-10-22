// ONB-T3 · ¿Cuánto esperas ganar? (/onboarding/trabajo/3). Paso opcional:
// sueldo líquido (si busca empleo), tarifa mínima (si toma turnos), «Prefiero
// no decir» y la vestimenta propia (si toma turnos). «Omitir» sigue sin
// guardar nada de este paso.
//
// La hoja «Unidad» de cada monto vive en la URL (`?sheet=unidad&campo=sueldo`,
// spec §5.3 regla 3): el atrás la cierra sin salir del paso. MoneyField aún no
// deja controlar su hoja (pedido en «requests»), así que el toque en su botón
// de unidad se toma antes de que llegue a él.
import { useEffect, type MouseEvent, type ReactNode } from 'react';
import { useSheet } from '../../../../app/sheets';
import type { PayUnit } from '../../../../ui/Amount';
import { Checkbox } from '../../../../ui/Checkbox';
import { ChipGroup } from '../../../../ui/ChipGroup';
import { Stack } from '../../../../ui/Layout';
import { MoneyField, payUnitLabel } from '../../../../ui/MoneyField';
import { SheetPicker } from '../../../../ui/SheetPicker';
import { StepLayout } from '../../../../ui/StepLayout';
import { UNIDADES_PAGO, VESTIMENTA, type Vestimenta } from '../../catalog';
import { COPY } from '../../copy';
import { OnboardingMenu } from '../../components/OnboardingMenu';
import type { TrabajoDraft } from '../../model';
import { setTrabajo } from '../../store';
import { useWorkStep } from './useWorkStep';
import '../../onboarding.css';

export const screenId = 'ONB-T3';

const C = COPY.trabajo.pago;

const UNIDAD_SHEET = 'unidad';
type Campo = 'sueldo' | 'tarifa';

const UNIT_OPTIONS = UNIDADES_PAGO.map((u) => ({ value: u, label: payUnitLabel(u) }));

/** Elegir la unidad: con «A convenir» no hay monto (como MoneyField). */
function unidadElegida(campo: Campo, unidad: PayUnit): Partial<TrabajoDraft> {
    const sinMonto = unidad === 'a_convenir';
    return campo === 'sueldo'
        ? { sueldoUnidad: unidad, ...(sinMonto ? { sueldo: null } : {}) }
        : { tarifaUnidad: unidad, ...(sinMonto ? { tarifa: null } : {}) };
}

/** Toma el toque en el botón de unidad de MoneyField y abre la hoja de la URL en su lugar. */
function UnitInUrl({ onUnit, children }: { onUnit: () => void; children: ReactNode }) {
    const capture = (e: MouseEvent<HTMLDivElement>) => {
        if (!(e.target instanceof Element) || !e.target.closest('.tl-money__unit')) return;
        e.preventDefault();
        e.stopPropagation();
        onUnit();
    };
    return <div onClickCapture={capture}>{children}</div>;
}

export function PayStep() {
    const { draft, busca, layout, next } = useWorkStep(3);
    const { trabajo } = draft;
    const noDecir = trabajo.noDecir;
    const unidad = useSheet(UNIDAD_SHEET);
    const raw = unidad.param('campo');
    const campo: Campo | null = raw === 'sueldo' && busca.empleo ? 'sueldo' : raw === 'tarifa' && busca.turnos ? 'tarifa' : null;
    const unitOpen = unidad.open && campo !== null && !noDecir;

    // Un `?sheet=unidad` que no corresponde (campo que no aplica, «Prefiero no decir») se quita.
    const { open: sheetInUrl, hide: hideUnit } = unidad;
    useEffect(() => {
        if (sheetInUrl && !unitOpen) hideUnit();
    }, [sheetInUrl, unitOpen, hideUnit]);

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
                            <UnitInUrl onUnit={() => unidad.show({ campo: 'sueldo' })}>
                                <MoneyField
                                    label={C.sueldo}
                                    value={noDecir ? null : trabajo.sueldo}
                                    onChange={(sueldo) => setTrabajo({ sueldo })}
                                    unit={trabajo.sueldoUnidad}
                                    onUnitChange={(u: PayUnit) => setTrabajo(unidadElegida('sueldo', u))}
                                    units={UNIDADES_PAGO}
                                    unitSheetTitle={C.unidad}
                                    disabled={noDecir}
                                    help={busca.turnos ? undefined : C.ayuda}
                                />
                            </UnitInUrl>
                        )}
                        {busca.turnos && (
                            <UnitInUrl onUnit={() => unidad.show({ campo: 'tarifa' })}>
                                <MoneyField
                                    label={C.tarifa}
                                    value={noDecir ? null : trabajo.tarifa}
                                    onChange={(tarifa) => setTrabajo({ tarifa })}
                                    unit={trabajo.tarifaUnidad}
                                    onUnitChange={(u: PayUnit) => setTrabajo(unidadElegida('tarifa', u))}
                                    units={UNIDADES_PAGO}
                                    unitSheetTitle={C.unidad}
                                    disabled={noDecir}
                                    help={C.ayuda}
                                />
                            </UnitInUrl>
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
            <SheetPicker<PayUnit>
                open={unitOpen}
                onClose={unidad.hide}
                title={C.unidad}
                options={UNIT_OPTIONS}
                value={campo === 'tarifa' ? trabajo.tarifaUnidad : trabajo.sueldoUnidad}
                onChange={(u) => {
                    if (campo) setTrabajo(unidadElegida(campo, u));
                }}
                searchPlaceholder={C.buscarUnidad}
            />
            <OnboardingMenu />
        </>
    );
}
