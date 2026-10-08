import type { DemoModule } from '../catalog/types';
import { DemoItem, DemoRow, DemoSection } from '../catalog/demo';
import { IconArrowRight, IconChat } from '../icons';
import { Button, Divider, LinkText } from './Button';

const demo: DemoModule = {
    name: 'Button',
    group: 'Acciones',
    summary: 'El único botón: 5 variantes, 3 tamaños, ícono opcional y ancho completo. Una sola acción principal por pantalla.',
    Demo: () => (
        <>
            <DemoSection title="Variantes">
                <DemoRow>
                    <Button>Tomar turno</Button>
                    <Button variant="tonal">Postular</Button>
                    <Button variant="outline">Ver detalle</Button>
                    <Button variant="ghost">Omitir</Button>
                    <Button variant="danger">Eliminar cuenta</Button>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Tamaños e íconos">
                <DemoRow>
                    <Button size="lg" iconEnd={IconArrowRight}>Continuar</Button>
                    <Button icon={IconChat} variant="tonal">Escribir</Button>
                    <Button size="sm" variant="tonal">Tomar turno</Button>
                </DemoRow>
                <Button size="lg" block>Reservar clase</Button>
            </DemoSection>
            <DemoSection title="Estados">
                <DemoRow>
                    <DemoItem label="presionado"><Button className="is-pressed">Postular</Button></DemoItem>
                    <DemoItem label="foco"><Button className="is-focus">Postular</Button></DemoItem>
                    <DemoItem label="deshabilitado"><Button disabled>Postular</Button></DemoItem>
                    <DemoItem label="cargando"><Button loading loadingLabel="Enviando postulación…">Postular</Button></DemoItem>
                    <DemoItem label="outline deshabilitado"><Button variant="outline" disabled>Ver detalle</Button></DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Ingreso con otro servicio, separador y enlace">
                <Button variant="outline" size="lg" block logo>
                    Continuar con Google
                </Button>
                <Divider />
                <p className="body">
                    Al continuar aceptas los <LinkText href="#terminos">Términos</LinkText> y la{' '}
                    <LinkText href="#privacidad">Política de privacidad</LinkText>.
                </p>
            </DemoSection>
        </>
    ),
};

export default demo;
