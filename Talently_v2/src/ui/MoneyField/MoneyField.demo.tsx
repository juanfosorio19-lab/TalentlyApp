import { useState } from 'react';
import { Amount, type PayUnit } from '../Amount';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { MoneyField, type MoneyFieldProps } from './MoneyField';

const noop = () => {};
const HELP = 'Lo que se recibe en mano, después de descuentos.';

/** Muestra quieta: el monto y la unidad no cambian (el catálogo fuerza el estado). */
function Still({ value, unit = 'mes', ...props }: Partial<MoneyFieldProps> & { value: number | null }) {
    return <MoneyField label="Sueldo líquido" help={HELP} value={value} onChange={noop} unit={unit} onUnitChange={noop} {...props} />;
}

/** Probar: escribe con separador de miles y cambia la unidad en la hoja (dentro del marco). */
function LiveMoney() {
    const [amount, setAmount] = useState<number | null>(650000);
    const [unit, setUnit] = useState<PayUnit>('mes');
    const [tried, setTried] = useState(false);
    return (
        <DemoFrame height={640}>
            <div className="tl-app-screen__content">
                <MoneyField
                    label="Sueldo líquido"
                    help={HELP}
                    value={amount}
                    onChange={setAmount}
                    unit={unit}
                    onUnitChange={setUnit}
                    onBlur={() => setTried(true)}
                    error={tried && amount === null && unit !== 'a_convenir' ? 'Ingresa el sueldo líquido' : undefined}
                    portal={false}
                />
                <DemoLabel>Así se verá en la publicación:</DemoLabel>
                <Amount value={unit === 'a_convenir' ? null : (amount ?? 0)} unit={unit} net size="lg" />
            </div>
        </DemoFrame>
    );
}

const demo: DemoModule = {
    name: 'MoneyField',
    group: 'Campos',
    summary:
        'Monto en CLP: prefijo «$», separador de miles mientras se escribe (650.000) y la unidad como botón que abre un SheetPicker con el diccionario.',
    Demo: () => (
        <>
            <DemoSection title="Default">
                <DemoRow column>
                    <Still value={null} />
                    <Still value={650000} />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Presionado">
                <Still
                    value={650000}
                    unitClassName="is-pressed"
                    help="Tocar la unidad abre la lista: al mes, por día, por hora, por turno…"
                />
            </DemoSection>
            <DemoSection title="Foco">
                <Still value={650000} className="is-focus" />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoNotApplicable>El monto no se marca; la unidad elegida se ve escrita en el campo.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <Still value={650000} disabled help="Para cambiar el sueldo, pausa la publicación." />
            </DemoSection>
            <DemoSection title="Error">
                <Still value={null} error="Ingresa el sueldo líquido" />
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoNotApplicable>El monto no se calcula en línea.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Otras unidades del diccionario">
                <DemoRow column>
                    <Still label="Tarifa por turno" value={35000} unit="turno" help="Monto líquido por un turno completo." />
                    <Still label="Valor de la clase" value={18000} unit="clase" help="Por una clase de 60 min." />
                    <Still label="Valor por hora" value={6500} unit="hora" help="Monto líquido por hora trabajada." />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Probar: escribir y cambiar la unidad">
                <LiveMoney />
            </DemoSection>
        </>
    ),
};

export default demo;
