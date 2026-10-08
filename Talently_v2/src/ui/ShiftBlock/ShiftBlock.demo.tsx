import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoNotApplicable, DemoSection } from '../catalog/demo';
import { Stack } from '../Layout';
import { CuposBar, ShiftBlock, ShiftBlocks } from './ShiftBlock';

const demo: DemoModule = {
    name: 'ShiftBlock',
    group: 'Publicaciones',
    summary:
        'El bloque de un turno con la fecha y el horario grandes (un bloque por día en una serie) y la barra de cupos «Confirmados 5/8». Informa: no se toca.',
    Demo: () => (
        <>
            <DemoSection title="Un bloque · Garzones para matrimonio · Banquetería Rosa SpA (DET-01)">
                <ShiftBlocks>
                    <ShiftBlock weekday="sáb" day={12} month="dic" time="18:00–00:00" duration="6 h" cupos={{ left: 3, total: 8 }} />
                </ShiftBlocks>
            </DemoSection>

            <DemoSection title="Serie · un bloque por día · Operarios/as de bodega para inventario">
                <ShiftBlocks>
                    <ShiftBlock weekday="sáb" day={12} month="dic" time="08:00–16:00" duration="8 h" cupos={{ left: 6, total: 10 }} />
                    <ShiftBlock weekday="dom" day={13} month="dic" time="08:00–16:00" duration="8 h" cupos={{ left: 2, total: 10 }} />
                </ShiftBlocks>
                <DemoLabel>
                    En una serie se postula a todos los bloques. Cada bloque dice sus cupos; con 2 o menos, Badge warning.
                </DemoLabel>
            </DemoSection>

            <DemoSection title="Hoy · en Mi turno (TUR-01)">
                <ShiftBlocks>
                    <ShiftBlock weekday="jue" day={10} month="dic" time="19:00–00:00" duration="Hoy · 5 h" />
                </ShiftBlocks>
            </DemoSection>

            <DemoSection title="Cupos del turno (GES-04) · barra de confirmados">
                <Stack gap={4}>
                    <CuposBar confirmed={5} total={8} />
                    <CuposBar confirmed={8} total={8} />
                </Stack>
                <DemoLabel>Barra de 8 en color-primary-text; completa, en color-success-text. Siempre con el número al lado.</DemoLabel>
            </DemoSection>

            <DemoSection title="Estados">
                <DemoLabel>Default: mostrado arriba. El bloque informa: no se toca.</DemoLabel>
                <DemoNotApplicable state="Presionado">No se toca.</DemoNotApplicable>
                <DemoNotApplicable state="Foco">
                    Se lee como texto: «sáb 12 dic, 18:00–00:00, 6 h, quedan 3 de 8 cupos».
                </DemoNotApplicable>
                <DemoNotApplicable state="Seleccionado">No se marca: en una serie se postula a todos los bloques.</DemoNotApplicable>
                <DemoNotApplicable state="Deshabilitado">Un bloque sin cupos dice «Cupos completos» con Badge neutral.</DemoNotApplicable>
                <ShiftBlocks>
                    <ShiftBlock weekday="sáb" day={12} month="dic" time="18:00–00:00" duration="6 h" cupos={{ left: 0, total: 8 }} />
                </ShiftBlocks>
                <DemoNotApplicable state="Error">No aplica.</DemoNotApplicable>
                <DemoNotApplicable state="Cargando">Llega con el detalle; mientras, Skeleton.</DemoNotApplicable>
            </DemoSection>
        </>
    ),
};

export default demo;
