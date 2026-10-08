import { useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoLabel, DemoRow, DemoSection } from '../catalog/demo';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { PasswordField, checkPassword } from './PasswordField';

/** Estado que no aplica a este control, con su motivo (como en preview.html). */
function NoAplica({ children }: { children: ReactNode }) {
    return (
        <DemoRow>
            <Badge>No aplica</Badge>
            <DemoLabel>{children}</DemoLabel>
        </DemoRow>
    );
}

/** AUTH-02: las reglas se marcan mientras se escribe; al tocar «Crear cuenta» las que faltan pasan a danger. */
function CrearContrasena() {
    const [clave, setClave] = useState('');
    const [intento, setIntento] = useState(false);
    return (
        <>
            <PasswordField
                value={clave}
                onChange={(e) => {
                    setClave(e.target.value);
                    setIntento(false);
                }}
                showMissing={intento}
            />
            <Button block onClick={() => setIntento(!checkPassword(clave).ok)}>
                Crear cuenta
            </Button>
        </>
    );
}

const demo: DemoModule = {
    name: 'PasswordField',
    group: 'Campos',
    summary:
        'Contraseña con el ojo para mostrarla y, al crearla, las 3 reglas en vivo (8 caracteres o más · Una mayúscula · Un número o símbolo). Al ingresar, solo el ojo.',
    Demo: () => (
        <>
            <DemoSection title="Default · crear contraseña (AUTH-02, AUTH-06)">
                <PasswordField />
            </DemoSection>
            <DemoSection title="Presionado">
                <NoAplica>Lo tiene el ojo: capa de su color al 12 %.</NoAplica>
            </DemoSection>
            <DemoSection title="Foco">
                <PasswordField className="is-focus" defaultValue="Garzon" />
                <DemoLabel>Escribiendo: cada regla se marca apenas se cumple.</DemoLabel>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <PasswordField defaultValue="Garzon2026" defaultVisible />
                <DemoLabel>Ojo activo (aria-pressed): la contraseña se ve y el botón queda en tonal.</DemoLabel>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <PasswordField defaultValue="Garzon2026" disabled />
                <DemoLabel>Mientras se crea la cuenta.</DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <PasswordField defaultValue="garzon2026" showMissing />
                <DemoLabel>
                    Al tocar «Crear cuenta» con una regla sin cumplir: esa regla pasa a danger con el ícono alerta y el borde
                    del campo también.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Cargando">
                <NoAplica>Las reglas se revisan en el teléfono, sin esperar al servidor.</NoAplica>
            </DemoSection>
            <DemoSection title="Iniciar sesión (AUTH-04) · solo el ojo, sin reglas">
                <DemoRow column>
                    <PasswordField mode="current" defaultValue="Garzon2026" />
                    <PasswordField mode="current" defaultValue="Garzon2025" error="El correo o la contraseña no coinciden" />
                </DemoRow>
            </DemoSection>
            <DemoSection title="Pruébalo · crear cuenta">
                <CrearContrasena />
            </DemoSection>
        </>
    ),
};

export default demo;
