import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Amount, PaymentBreakdown } from './Amount';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

const demo: DemoModule = {
    name: 'Amount',
    group: 'Datos y confianza',
    summary: 'El único formato de dinero: CLP con punto de miles + «líquidos» o «brutos» (sueldos y tarifas) + unidad. sm en filas, md en tarjetas, lg en el detalle.',
    Demo: () => (
        <>
            <DemoSection title="Un solo formato: monto + líquido o bruto + unidad">
                <DemoRow column>
                    <DemoItem label="Empleo"><Amount value={650000} unit="mes" net /></DemoItem>
                    <DemoItem label="Turno"><Amount value={35000} unit="turno" net /></DemoItem>
                    <DemoItem label="Por hora"><Amount value={6500} unit="hora" net /></DemoItem>
                    <DemoItem label="Clase (F2)"><Amount value={18000} unit="clase" durationMin={60} /></DemoItem>
                    <DemoItem label="Servicio (F3)"><Amount value={25000} unit="visita" from /></DemoItem>
                    <DemoItem label="A convenir"><Amount value={null} unit="a_convenir" /></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Tamaños · sm en filas · md en tarjetas · lg en el detalle">
                <DemoRow column>
                    <DemoItem label="sm"><Amount value={650000} unit="mes" net size="sm" /></DemoItem>
                    <DemoItem label="md"><Amount value={650000} unit="mes" net /></DemoItem>
                    <DemoItem label="lg"><Amount value={650000} unit="mes" net size="lg" /></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Otros usos del sistema · mismo marcado">
                <DemoRow column>
                    <DemoItem label="Cotización (SystemCard) · lg, sin unidad">
                        <Amount value={85000} size="lg" />
                    </DemoItem>
                    <DemoItem label="Pretensión (tarjeta de persona) · prefix">
                        <Amount value={650000} unit="mes" net prefix="Pretensión:" />
                    </DemoItem>
                    <DemoItem label="Plan Premium (OptionCard) · suffix">
                        <Amount value={14990} suffix="por 30 días" />
                    </DemoItem>
                    <DemoItem label="Plan Clásica (OptionCard) · valueText">
                        <Amount value={0} valueText="Gratis" />
                    </DemoItem>
                    <DemoItem label="Plan Clásica en F3 · valueText + suffix">
                        <Amount value={0} valueText="Gratis" suffix=": 1 empleo activo y 3 turnos al mes" />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Desglose de pago (M10) · RES-02, antes de «Pagar con Mercado Pago»">
                <DemoFrame width={360}>
                    <div className="tl-app-screen__content">
                        <PaymentBreakdown
                            items={[
                                { label: 'Cambio de llave de paso y flexible', amount: 85000 },
                                { label: 'Cargo de servicio de Talently', amount: 4250 },
                            ]}
                            total={89250}
                        />
                    </div>
                </DemoFrame>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow column>
                    <DemoItem label="default"><Amount value={35000} unit="turno" net /></DemoItem>
                    <StateNote state="presionado">No se toca.</StateNote>
                    <StateNote state="foco">No recibe foco.</StateNote>
                    <StateNote state="seleccionado">No se marca.</StateNote>
                    <StateNote state="deshabilitado">No aplica.</StateNote>
                    <StateNote state="error">Un monto sin unidad no se publica: MoneyField exige la unidad.</StateNote>
                    <StateNote state="cargando" na={false}>Llega con la tarjeta; mientras, Skeleton.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
