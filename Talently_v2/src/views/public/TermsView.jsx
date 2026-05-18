// src/views/public/TermsView.jsx
// Términos y condiciones de Talently — vista pública, no requiere auth
import { useNavigate } from 'react-router-dom';
import './TermsView.css';

const LAST_UPDATED = '14 de marzo de 2024';

const SECTIONS = [
    {
        title: '1. Aceptación de los términos',
        paragraphs: [
            'Al acceder y utilizar la aplicación Talently, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.',
            'El uso continuado de la plataforma tras la publicación de cambios implica la aceptación de los mismos, por lo que te recomendamos revisar esta sección periódicamente.',
        ],
    },
    {
        title: '2. Descripción del servicio',
        paragraphs: [
            'Talently es una plataforma de emparejamiento laboral que conecta a profesionales del sector tecnológico con empresas que buscan talento. Ofrecemos perfiles interactivos, sistema de swipe bidireccional, mensajería y herramientas de recomendación basadas en compatibilidad real.',
            'Nos reservamos el derecho de modificar, suspender o interrumpir cualquier aspecto del servicio en cualquier momento sin previo aviso.',
        ],
    },
    {
        title: '3. Registro y seguridad de la cuenta',
        paragraphs: [
            'Para utilizar las funciones principales de Talently deberás crear una cuenta proporcionando información veraz, completa y actualizada. Eres el único responsable de mantener la confidencialidad de tus credenciales de acceso.',
            'Cualquier actividad realizada bajo tu cuenta será tu responsabilidad. Notifícanos de inmediato si sospechas de un uso no autorizado de tu perfil a través de soporte@talently.app.',
        ],
    },
    {
        title: '4. Uso aceptable de la plataforma',
        paragraphs: [
            'Los usuarios se comprometen a utilizar Talently de manera ética y legal. Queda estrictamente prohibido el envío de spam, la suplantación de identidad, el contacto no solicitado fuera de la plataforma o el uso de scripts automatizados para extraer datos.',
            'No se permite publicar contenido ofensivo, discriminatorio o que infrinja los derechos de terceros dentro de perfiles, descripciones de empleo o mensajes.',
        ],
    },
    {
        title: '5. Propiedad intelectual',
        paragraphs: [
            'Todo el contenido original, logotipos, diseños, algoritmos y software de Talently son propiedad exclusiva de la empresa y están protegidos por leyes de derechos de autor y propiedad intelectual.',
            'Conservas los derechos sobre la información personal y profesional que cargas en la plataforma, pero nos otorgas una licencia limitada, no exclusiva y revocable para mostrarla y procesarla con el único fin de prestar el servicio.',
        ],
    },
    {
        title: '6. Privacidad y protección de datos',
        paragraphs: [
            'Tu privacidad es fundamental para nosotros. El tratamiento de tus datos personales se rige por nuestra Política de Privacidad, la cual cumple con las normativas de protección de datos aplicables en cada región.',
            'Procesamos tus datos exclusivamente para facilitar el emparejamiento laboral, mejorar la experiencia de usuario y enviarte notificaciones relevantes, garantizando medidas de seguridad técnicas y organizativas adecuadas.',
        ],
    },
    {
        title: '7. Limitación de responsabilidad',
        paragraphs: [
            'Talently no garantiza la veracidad de las ofertas publicadas por terceros ni el éxito en la obtención de empleo. No somos responsables por daños indirectos, pérdida de datos o perjuicios derivados del uso de la aplicación.',
            'La plataforma se proporciona "tal cual" y "según disponibilidad", sin garantías expresas o implícitas de ningún tipo respecto a su funcionamiento ininterrumpido.',
        ],
    },
    {
        title: '8. Terminación de la cuenta',
        paragraphs: [
            'Puedes eliminar tu cuenta en cualquier momento desde la sección de ajustes. Tras la eliminación, tus datos personales serán suprimidos o anonimizados conforme a nuestra Política de Privacidad, salvo obligación legal de conservación.',
            'Nos reservamos el derecho de suspender o cancelar cuentas que infrinjan estos términos, sin previo aviso y sin derecho a reembolso en caso de planes de pago.',
        ],
    },
    {
        title: '9. Modificaciones de los términos',
        paragraphs: [
            'Podemos actualizar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en la aplicación o en el sitio web oficial de Talently.',
            'Es tu responsabilidad revisar estos términos con regularidad. El uso continuado del servicio tras la publicación de cambios constituye tu consentimiento a dichas modificaciones.',
        ],
    },
    {
        title: '10. Contacto y soporte',
        paragraphs: [
            'Si tienes alguna duda o reclamación respecto a estos términos, puedes ponerte en contacto con nuestro equipo a través de legal@talently.app. Respondemos en un plazo máximo de 5 días hábiles.',
            'Nuestro equipo de soporte técnico también está disponible a través del centro de ayuda integrado en la aplicación para cualquier consulta operativa.',
        ],
    },
];

export default function TermsView() {
    const navigate = useNavigate();

    return (
        <div className="terms-wrapper">
            {/* ── Header ── */}
            <header className="terms-header">
                <button
                    className="terms-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <h1 className="terms-header-title">Términos y condiciones</h1>
            </header>

            {/* ── Contenido ── */}
            <main className="terms-main">
                <p className="terms-date">Última actualización: {LAST_UPDATED}</p>

                {SECTIONS.map((section, i) => (
                    <section key={i} className="terms-section">
                        <h2 className="terms-section-title">{section.title}</h2>
                        <div className="terms-section-body">
                            {section.paragraphs.map((p, j) => (
                                <p key={j} className="terms-paragraph">{p}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            <footer className="terms-footer" />
        </div>
    );
}
