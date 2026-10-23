// Resumen de cada sección de LEG-01 Términos y LEG-02 Privacidad, según el
// spec (05-spec-maestro §3, §5, §10.1 y §10.3; Ley 21.719 de datos
// personales, vigente desde el 1-12-2026). Frases cortas y simples, como el
// resto de la app. No es el texto legal: ese lo entrega el dueño con la razón
// social, el domicilio en Chile y el correo de contacto (docs/PENDIENTES.md
// #2). Aquí no va ningún nombre de empresa, RUT, dirección ni correo.
import type { ReactNode } from 'react';
import type { LegalSection } from '../../ui/LegalDocument';
import { COPY } from './copy';

export type LegalDoc = 'terminos' | 'privacidad';

export interface LegalContent {
    /** H1 del documento y título del AppBar al bajar. */
    title: string;
    /** La única fecha del documento. */
    updated: string;
    sections: LegalSection[];
}

/** Enlace al otro documento (lo arma la pantalla con useOpenPath). */
export type LegalLink = (doc: LegalDoc, label: string) => ReactNode;

const contacto = (
    <>
        <p>
            Aquí vas a encontrar el nombre de la empresa responsable de Talently, su domicilio en Chile y un correo para
            escribirnos.
        </p>
        <p>Los publicaremos junto con el texto final.</p>
    </>
);

function terminos(link: LegalLink): LegalSection[] {
    return [
        {
            id: 'talently',
            title: 'Qué es Talently',
            body: (
                <>
                    <p>
                        Talently conecta a personas que buscan empleo o turnos con organizaciones, hogares y personas que
                        contratan.
                    </p>
                    <p>Talently solo intermedia: no te contrata, no dirige tu trabajo y no paga sueldos.</p>
                </>
            ),
        },
        {
            id: 'cuenta',
            title: 'Tu cuenta',
            body: (
                <>
                    <p>Necesitas tener 18 años o más. Tus datos deben ser verdaderos y la cuenta es solo tuya.</p>
                    <p>
                        En una misma cuenta puedes tener varios perfiles: trabajo, tu hogar o tu organización.
                    </p>
                </>
            ),
        },
        {
            id: 'postular',
            title: 'Postular, tomar turnos y publicar',
            body: (
                <ul>
                    <li>Postular, tomar turnos, verificarte y chatear siempre es gratis.</li>
                    <li>Quien publica te contrata o te paga directamente.</li>
                    <li>
                        Una publicación no puede pedir edad, sexo, nacionalidad, estado civil ni «buena presencia», ni
                        cobrar por postular.
                    </li>
                </ul>
            ),
        },
        {
            id: 'credenciales',
            title: 'Verificación y credenciales',
            body: (
                <>
                    <p>
                        Algunos oficios piden una credencial para confirmarte, como la credencial SPD de guardia. Sin ella
                        no podrás ser confirmado en esos turnos.
                    </p>
                    <p>Revisamos cada documento antes de marcarlo como verificado.</p>
                </>
            ),
        },
        {
            id: 'conducta',
            title: 'Respeto y seguridad',
            body: (
                <p>
                    Puedes reportar o bloquear a quien no respete estas reglas. Podemos suspender la cuenta de quien las
                    rompa.
                </p>
            ),
        },
        {
            id: 'datos',
            title: 'Tus datos',
            body: <p>Qué datos pedimos y para qué los usamos está en la {link('privacidad', COPY.verPrivacidad)}.</p>,
        },
        {
            id: 'cerrar',
            title: 'Cerrar tu cuenta',
            body: <p>Puedes eliminar tu cuenta cuando quieras desde Configuración, también durante el registro.</p>,
        },
        { id: 'contacto', title: 'Contacto', body: contacto },
    ];
}

function privacidad(link: LegalLink): LegalSection[] {
    return [
        {
            id: 'datos',
            title: 'Qué datos te pedimos',
            body: (
                <ul>
                    <li>Tu nombre, tu correo y tu comuna.</li>
                    <li>Tu foto, si quieres agregarla.</li>
                    <li>Tu teléfono, que verificamos cuando tomas tu primer turno o publicas.</li>
                    <li>Las credenciales y documentos que pide tu oficio.</li>
                    <li>Tu cédula y una selfie, solo si eliges verificar tu identidad.</li>
                </ul>
            ),
        },
        {
            id: 'uso',
            title: 'Para qué los usamos',
            body: (
                <p>
                    Para mostrarte empleos y turnos cerca de ti, para que quien publica pueda conocerte y elegirte, y para
                    cuidar la seguridad de todos.
                </p>
            ),
        },
        {
            id: 'publico',
            title: 'Qué ven los demás',
            body: (
                <>
                    <p>Tu perfil muestra tu nombre, tu foto, tu comuna y lo que se verificó.</p>
                    <p>Tu RUT, tu fecha de nacimiento, tu teléfono y tu dirección nunca se muestran en tu perfil.</p>
                </>
            ),
        },
        {
            id: 'sensibles',
            title: 'Datos sensibles',
            body: (
                <>
                    <p>
                        Tu identidad, tus antecedentes y tus credenciales son datos sensibles. Te pedimos permiso antes de
                        recibirlos y puedes retirarlo.
                    </p>
                    <p>
                        De tu cédula y tu selfie guardamos el resultado de la revisión. Las fotos se borran a los 30 días.
                    </p>
                </>
            ),
        },
        {
            id: 'encargados',
            title: 'Quién más trata tus datos',
            body: (
                <p>
                    Servicios que nos ayudan a guardar tus datos, enviar avisos y códigos por SMS, y revisar documentos.
                    Publicaremos la lista con el texto final.
                </p>
            ),
        },
        {
            id: 'derechos',
            title: 'Tus derechos',
            body: (
                <>
                    <p>Según la Ley 21.719, puedes pedirnos:</p>
                    <ul>
                        <li>ver qué datos tuyos tenemos;</li>
                        <li>corregirlos si están mal;</li>
                        <li>borrarlos;</li>
                        <li>que dejemos de usarlos para algo;</li>
                        <li>llevártelos en un archivo.</li>
                    </ul>
                    <p>Puedes eliminar tu cuenta cuando quieras desde Configuración.</p>
                </>
            ),
        },
        {
            id: 'reglas',
            title: 'Las reglas de Talently',
            body: <p>Cómo usar Talently está en los {link('terminos', COPY.verTerminos)}.</p>,
        },
        { id: 'contacto', title: 'Contacto', body: contacto },
    ];
}

export function legalContent(doc: LegalDoc, link: LegalLink): LegalContent {
    return doc === 'terminos'
        ? { title: COPY.terminos.titulo, updated: COPY.terminos.fecha, sections: terminos(link) }
        : { title: COPY.privacidad.titulo, updated: COPY.privacidad.fecha, sections: privacidad(link) };
}
