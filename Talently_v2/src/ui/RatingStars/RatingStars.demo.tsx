import { useState } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { RatingInput, RatingStars } from './RatingStars';

/** Un estado que no aplica (con su motivo) o que se explica en texto, como en preview.html. */
function StateNote({ state, na = true, children }: { state: string; na?: boolean; children: string }) {
    return (
        <DemoItem label={state}>
            <span className="body">{na && <Badge>No aplica</Badge>} {children}</span>
        </DemoItem>
    );
}

/** Calificar con estado propio, para probar el teclado y el toque. */
function LiveRating({ initial, size }: { initial: number | null; size?: 'md' | 'lg' }) {
    const [value, setValue] = useState<number | null>(initial);
    return <RatingInput value={value} onChange={setValue} size={size} />;
}

const noop = () => {};

const demo: DemoModule = {
    name: 'RatingStars',
    group: 'Datos y confianza',
    summary: 'La nota de reseñas «4,8 (23)» con la cantidad siempre visible («Sin reseñas aún» si no hay), y las estrellas para calificar de 1 a 5 después de una transacción real.',
    Demo: () => (
        <>
            <DemoSection title="Nota con la cantidad de reseñas siempre visible">
                <DemoRow>
                    <DemoItem label="md · tarjetas y filas"><RatingStars value={4.8} count={23} /></DemoItem>
                    <DemoItem label="lg · perfil"><RatingStars value={4.8} count={23} size="lg" /></DemoItem>
                    <DemoItem label="sin reseñas"><RatingStars value={null} count={0} /></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Calificar después de un turno, clase o servicio real">
                <span className="body">¿Cómo fue tu turno en Banquetería Rosa SpA?</span>
                <div><LiveRating initial={4} /></div>
            </DemoSection>
            <DemoSection title="Grandes (M6) · en la evaluación al cerrar el turno (REV-01)">
                <div><LiveRating initial={5} size="lg" /></div>
            </DemoSection>
            <DemoSection title="Estados al calificar">
                <DemoRow column>
                    <DemoItem label="default"><div><RatingInput value={null} onChange={noop} /></div></DemoItem>
                    <DemoItem label="presionado">
                        <div><RatingInput value={null} onChange={noop} starClassName={(s) => (s === 3 ? 'is-pressed' : undefined)} /></div>
                    </DemoItem>
                    <DemoItem label="foco">
                        <div><RatingInput value={null} onChange={noop} starClassName={(s) => (s === 4 ? 'is-focus' : undefined)} /></div>
                    </DemoItem>
                    <DemoItem label="seleccionado"><div><RatingInput value={4} onChange={noop} /></div></DemoItem>
                    <DemoItem label="deshabilitado">
                        <div><RatingInput value={null} onChange={noop} disabled hint="Podrás calificar cuando termine el turno." /></div>
                    </DemoItem>
                    <DemoItem label="error">
                        <div><RatingInput value={null} onChange={noop} error="Elige de 1 a 5 estrellas" /></div>
                    </DemoItem>
                    <StateNote state="cargando">La calificación se envía con el botón de la pantalla.</StateNote>
                </DemoRow>
            </DemoSection>
        </>
    ),
};

export default demo;
