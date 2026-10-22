// Textos de LEG-01 Términos y LEG-02 Privacidad (spec §5.4). No están en el
// prototipo F1: «Qué es Talently», «Tu cuenta» y «Postular, tomar turnos y
// publicar» son el extracto del sistema de diseño (LegalDocument/preview.html);
// lo demás resume reglas del spec (05-spec-maestro.md §3 y §5, 04 §4 y A5:
// Ley 21.719), en frases cortas y simples. El texto legal definitivo lo
// entrega el dueño antes de publicar la app.
import type { ReactNode } from 'react';
import type { LegalSection } from '../../ui/LegalDocument';

export type LegalDoc = 'terminos' | 'privacidad';

export interface LegalContent {
    /** H1 del documento y título del AppBar al bajar. */
    title: string;
    /** La única fecha del documento. */
    updated: ReactNode;
    sections: LegalSection[];
}

const FECHA = <time dateTime="2026-12-01">1 dic 2026</time>;

export const LEGAL: Record<LegalDoc, LegalContent> = {
    terminos: {
        title: 'Términos y condiciones',
        updated: <>Actualizados el {FECHA}</>,
        sections: [
            {
                id: 'talently',
                title: 'Qué es Talently',
                body: (
                    <>
                        <p>
                            Talently conecta a personas que buscan trabajo, turnos, servicios o clases con organizaciones,
                            hogares y personas que contratan.
                        </p>
                        <p>
                            Talently solo intermedia: no es tu empleador, no paga sueldos y no guarda dinero de otras personas.
                        </p>
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
                            En una misma cuenta puedes tener varios perfiles: trabajo, servicios, clases, tu hogar o tu
                            organización.
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
                            Una publicación no puede pedir edad, sexo, nacionalidad ni «buena presencia», ni cobrar por
                            postular.
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
                id: 'cerrar',
                title: 'Cerrar tu cuenta',
                body: <p>Puedes eliminar tu cuenta cuando quieras desde Configuración, también durante el registro.</p>,
            },
        ],
    },
    privacidad: {
        title: 'Política de privacidad',
        updated: <>Actualizada el {FECHA}</>,
        sections: [
            {
                id: 'datos',
                title: 'Qué datos te pedimos',
                body: (
                    <ul>
                        <li>Tu nombre, tu correo y tu comuna.</li>
                        <li>Tu foto, si quieres agregarla.</li>
                        <li>Tu fecha de nacimiento, si quieres trabajar: así confirmamos que tienes 18 años o más.</li>
                        <li>Tu teléfono, verificado cuando tomes tu primer turno o publiques.</li>
                        <li>Las credenciales y documentos que pide tu oficio.</li>
                    </ul>
                ),
            },
            {
                id: 'publico',
                title: 'Qué ven los demás',
                body: (
                    <>
                        <p>Tu perfil muestra tu nombre, tu foto, tu comuna y tu nivel de verificación.</p>
                        <p>Tu fecha de nacimiento, tu RUT y tu dirección nunca se muestran en tu perfil.</p>
                        <p>
                            Lo que esperas ganar lo ven solo las organizaciones y hogares con una publicación activa, nunca el
                            público.
                        </p>
                    </>
                ),
            },
            {
                id: 'uso',
                title: 'Para qué los usamos',
                body: (
                    <p>
                        Para mostrarte empleos, turnos, servicios y clases cerca de ti, y para que quien publica pueda
                        conocerte y elegirte.
                    </p>
                ),
            },
            {
                id: 'sensibles',
                title: 'Datos sensibles',
                body: (
                    <p>
                        Tu identidad, tus antecedentes y tus credenciales son datos sensibles. Te pedimos permiso antes de
                        recibirlos y los guardamos con protección extra.
                    </p>
                ),
            },
            {
                id: 'derechos',
                title: 'Tus derechos',
                body: (
                    <>
                        <p>
                            Según la Ley 21.719, puedes pedir ver, corregir, borrar o llevarte tus datos, y oponerte a que los
                            usemos.
                        </p>
                        <p>
                            Puedes descargar tus datos desde Configuración, en Privacidad y mis datos, y eliminar tu cuenta
                            cuando quieras.
                        </p>
                    </>
                ),
            },
        ],
    },
};
