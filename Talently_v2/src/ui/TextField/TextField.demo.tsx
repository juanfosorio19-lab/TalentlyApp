import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { LinkText } from '../Button';
import { TextField } from './TextField';

/** Estado que no aplica a este control, con su motivo (como en preview.html). */
function NoAplica({ children }: { children: ReactNode }) {
    return (
        <DemoRow>
            <Badge>No aplica</Badge>
            <DemoLabel>{children}</DemoLabel>
        </DemoRow>
    );
}

/** Dígito verificador del RUT (módulo 11). `null` mientras el RUT está incompleto. Solo para la demo. */
function rutValido(texto: string): boolean | null {
    const limpio = texto.replace(/[.\s-]/g, '').toUpperCase();
    if (!/^\d{7,8}[\dK]$/.test(limpio)) return null;
    const cuerpo = limpio.slice(0, -1);
    let suma = 0;
    let factor = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }
    const resto = 11 - (suma % 11);
    const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return limpio.endsWith(esperado);
}

/** RUT de ONB-O1: se valida mientras se escribe. */
function RutEnVivo() {
    const [rut, setRut] = useState('');
    const ok = rutValido(rut);
    return (
        <TextField
            label="RUT de la organización"
            placeholder="Ej.: 76.123.456-0"
            inputMode="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            valid={ok === true}
            help={ok ? 'RUT válido' : 'Con puntos y guion'}
            error={ok === false ? 'Ingresa un RUT válido' : undefined}
        />
    );
}

const demo: DemoModule = {
    name: 'TextField',
    group: 'Campos',
    summary:
        'Campo de una línea (alto 48): etiqueta arriba, ayuda o error abajo, «(opcional)» solo en lo opcional. Válido con check solo donde el dato se valida en vivo.',
    Demo: () => (
        <>
            <DemoSection title="Default">
                <DemoRow column>
                    <TextField label="RUT" placeholder="Ej.: 76.123.456-0" inputMode="text" help="Con puntos y guion" />
                    <TextField label="RUT" defaultValue="76.123.456-0" inputMode="text" help="Con puntos y guion" />
                    <TextField label="Teléfono de contacto" optional placeholder="+56 9 1234 5678" inputMode="tel" type="tel" />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Presionado">
                <NoAplica>Tocar el campo lo enfoca y abre el teclado: no hay un estado presionado aparte.</NoAplica>
            </DemoSection>
            <DemoSection title="Foco">
                <TextField
                    className="is-focus"
                    label="Correo"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    defaultValue="matias.rojas@correo.cl"
                    help="Te enviaremos un código para confirmarlo"
                />
            </DemoSection>
            <DemoSection title="Seleccionado">
                <NoAplica>Un campo de texto no se marca: se llena.</NoAplica>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <TextField
                    label="Región"
                    defaultValue="Región Metropolitana"
                    disabled
                    help="Por ahora, Talently funciona solo en la Región Metropolitana."
                />
            </DemoSection>
            <DemoSection title="Error">
                <DemoRow column>
                    <TextField
                        label="RUT"
                        defaultValue="76.123.456-7"
                        inputMode="text"
                        help="Con puntos y guion"
                        error="Ingresa un RUT válido"
                    />
                    <TextField
                        label="Correo"
                        type="email"
                        inputMode="email"
                        defaultValue="matias.rojas@correo.cl"
                        error={
                            <>
                                Ya existe una cuenta con este correo. <LinkText href="#iniciar-sesion">Iniciar sesión</LinkText>
                            </>
                        }
                    />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Cargando">
                <TextField label="RUT de la empresa" defaultValue="76.123.456-0" loading help="Validando RUT…" />
            </DemoSection>
            <DemoSection title="Validación en vivo · RUT de la organización (ONB-O1)">
                <DemoRow column>
                    <TextField label="RUT" defaultValue="76.123.456-0" valid help="RUT válido" />
                    <TextField label="RUT" defaultValue="76.123.456-7" help="Con puntos y guion" error="Ingresa un RUT válido" />
                    <RutEnVivo />
                </DemoRow>
                <DemoLabel>
                    Válido: check en success al final y la ayuda en success. Se usa solo donde el dato se valida mientras se escribe.
                </DemoLabel>
            </DemoSection>
        </>
    ),
};

export default demo;
