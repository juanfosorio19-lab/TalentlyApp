import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { SlotPeek, SlotPicker, type SlotDay, type SlotValue } from './SlotPicker';

/** Contenido de una pantalla de 390 (margen lateral space-4), como RES-01. */
function Phone({ children }: { children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-app-screen__content">{children}</div>
        </DemoFrame>
    );
}

// Camila Fuentes · Matemática y PAES M1 (F2). Hoy es mié 10 mar 2027: hoy queda
// sin horas (pide 24 h de anticipación) y el jue 11 no aparece 19:30, porque a
// esa hora ya tiene una clase con Diego y deja 30 min de descanso entre clases.
const HOY = '2027-03-10';
const JUE_11 = '2027-03-11';
const CAMILA: SlotDay[] = [
    { date: '2027-03-10', times: [] },
    { date: JUE_11, times: ['16:00', '17:00', '18:00'] },
    { date: '2027-03-12', times: [] },
    { date: '2027-03-13', times: ['10:00', '11:00', '12:00'] },
    { date: '2027-03-14', times: [] },
    { date: '2027-03-15', times: ['16:00', '17:00', '18:00', '19:00'] },
    { date: '2027-03-16', times: ['17:00', '18:00'] },
    { date: '2027-03-17', times: ['16:00', '19:30'] },
    { date: '2027-03-18', times: ['16:00', '17:00', '18:00'] },
    { date: '2027-03-19', times: [] },
    { date: '2027-03-20', times: ['10:00', '11:00'] },
    { date: '2027-03-21', times: [] },
    { date: '2027-03-22', times: ['16:00', '17:00', '18:00', '19:00'] },
    { date: '2027-03-23', times: ['17:00', '18:00'] },
];
const SIN_HORAS: SlotDay[] = CAMILA.map((d) => ({ date: d.date, times: [] }));
// Error: las 17:00 se ocuparon mientras reservabas.
const SIN_LAS_17: SlotDay[] = CAMILA.map((d) => (d.date === JUE_11 ? { date: d.date, times: ['16:00', '18:00'] } : d));
const JUEVES: SlotValue = { date: JUE_11, time: null };
const nada = () => {};

function SlotPickerDemo() {
    const [value, setValue] = useState<SlotValue | null>({ date: JUE_11, time: '17:00' });
    const [notified, setNotified] = useState(false);
    return (
        <>
            <DemoLabel>
                <Badge>F2</Badge> Clases con reservas · hoy es mié 10 mar 2027
            </DemoLabel>
            <DemoSection title="SlotPicker · Camila Fuentes · Matemática y PAES M1">
                <Phone>
                    <SlotPicker days={CAMILA} today={HOY} value={value} onChange={setValue} />
                </Phone>
                <DemoLabel>
                    Hoy queda en gris: Camila pide 24 h de anticipación. El jue 11 no aparece 19:30 porque a esa hora ya
                    tiene una clase (y 30 min de descanso entre clases). Debajo va el resumen de lo elegido con Amount y el
                    CTA fijo de RES-01.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Adelanto (M9) · en DET-01 Clase, bajo el detalle">
                <Phone>
                    <SlotPeek date={JUE_11} times={['16:00', '17:00', '18:00']} onPickTime={nada} onSeeAll={nada} />
                </Phone>
                <DemoLabel>
                    Los próximos 3 horarios libres, con su día. Cada hora abre RES-01 con esa hora elegida; «Ver 14 días»
                    abre RES-01 sin hora.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Sin horas libres en 14 días (M9) · toca «Avisarme»">
                <Phone>
                    <SlotPicker
                        days={SIN_HORAS}
                        today={HOY}
                        value={null}
                        onChange={nada}
                        empty={{
                            title: 'Camila no tiene horarios libres en los próximos 14 días',
                            onNotify: () => setNotified(true),
                            notified,
                        }}
                    />
                </Phone>
                <DemoLabel>
                    Al tocar «Avisarme», Snackbar «Te avisaremos cuando Camila abra horarios» y el botón pasa a «Te
                    avisaremos» (deshabilitado, con check).
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <Phone>
                    <SlotPicker days={CAMILA} today={HOY} value={null} onChange={nada} />
                </Phone>
            </DemoSection>
            <DemoSection title="Presionado">
                <Phone>
                    <SlotPicker
                        days={CAMILA}
                        today={HOY}
                        value={JUEVES}
                        onChange={nada}
                        dayClassName={{ '2027-03-13': 'is-pressed' }}
                    />
                </Phone>
            </DemoSection>
            <DemoSection title="Foco">
                <Phone>
                    {/* El preview lo pone en lun 15, que a 390 cae en el borde de la tira y el contorno se corta: aquí, sáb 13. */}
                    <SlotPicker
                        days={CAMILA}
                        today={HOY}
                        value={JUEVES}
                        onChange={nada}
                        dayClassName={{ '2027-03-13': 'is-focus' }}
                    />
                </Phone>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <Phone>
                    <SlotPicker days={CAMILA} today={HOY} value={{ date: JUE_11, time: '17:00' }} onChange={nada} />
                </Phone>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoLabel>
                    Días sin horas libres (vie y dom) y hoy, por la anticipación mínima: gris, sin hora que elegir; se
                    pueden pasar de largo.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <Phone>
                    <SlotPicker days={SIN_LAS_17} today={HOY} value={JUEVES} onChange={nada} />
                </Phone>
                <DemoLabel>
                    Si la hora se ocupó mientras reservabas, vuelves aquí con el Snackbar «Este horario se acaba de ocupar.
                    Elige otro» y la hora ya no está.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Cargando">
                <Phone>
                    <SlotPicker days={CAMILA} today={HOY} value={JUEVES} onChange={nada} loadingTimes />
                </Phone>
                <DemoLabel>Las horas del día elegido cargan con Skeleton de chips.</DemoLabel>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'SlotPicker',
    group: 'Agenda y archivos',
    summary: 'Día y hora de una reserva: tira de 14 días (los sin horas, en gris) y las horas libres del día en chips. Con adelanto en DET-01 y aviso «Avisarme» sin horarios.',
    Demo: SlotPickerDemo,
};

export default demo;
