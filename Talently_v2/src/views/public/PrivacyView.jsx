// src/views/public/PrivacyView.jsx
// Política de privacidad de Talently — vista pública, no requiere auth
import { useNavigate } from 'react-router-dom';
import './PrivacyView.css';

const LAST_UPDATED = '24 de mayo de 2024';

const SECTIONS = [
    {
        num: '1',
        title: 'Información que recopilamos',
        body: 'Recopilamos la información personal que nos proporcionas directamente al crear tu cuenta: nombre completo, correo electrónico, número de teléfono y ubicación geográfica. Adicionalmente, almacenamos tu perfil profesional, incluyendo historial laboral, educación, habilidades, preferencias de empleo y CV adjunto. De forma automática, podemos recopilar datos técnicos de tu dispositivo, como dirección IP, sistema operativo y comportamiento de navegación dentro de la plataforma.',
    },
    {
        num: '2',
        title: 'Cómo usamos tu información',
        body: 'Usamos tus datos principalmente para conectarte con empresas relevantes a través de nuestro algoritmo de emparejamiento. También utilizamos esta información para mejorar nuestros servicios, personalizar tu experiencia, enviarte notificaciones sobre vacantes compatibles con tu perfil y responder a tus consultas de soporte técnico. Nunca usamos tus datos con fines distintos a los descritos en esta política.',
    },
    {
        num: '3',
        title: 'Compartir información con terceros',
        body: 'Tus datos profesionales se comparten con empresas registradas en Talently únicamente cuando tú realizas un swipe positivo o cuando tu perfil genera un match activo. No vendemos ni alquilamos tus datos personales a terceros. Podemos divulgar información si la ley lo requiere, en respuesta a procesos judiciales o para proteger los derechos legítimos de Talently y sus usuarios.',
    },
    {
        num: '4',
        title: 'Almacenamiento y seguridad de los datos',
        body: 'Talently almacena todos los datos de usuario en Supabase, infraestructura alojada en servidores de AWS en la región us-east-1 (Norte de Virginia, EE.UU.). Supabase implementa cifrado en tránsito (TLS/SSL) y en reposo para toda la información almacenada. Realizamos auditorías de seguridad periódicas y aplicamos principios de mínimo privilegio en el acceso a la base de datos.',
    },
    {
        num: '5',
        title: 'Tus derechos',
        body: 'Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Puedes gestionar la mayoría de estas acciones directamente desde los ajustes de tu perfil en la aplicación. Para solicitudes de eliminación completa o portabilidad de datos, contáctanos en privacidad@talently.app. Atendemos todas las solicitudes en un plazo máximo de 30 días hábiles.',
    },
    {
        num: '6',
        title: 'Cookies y tecnologías similares',
        body: 'Talently utiliza cookies y almacenamiento local del navegador para recordar tus preferencias de sesión (como el modo oscuro y el tipo de usuario) y analizar el tráfico de la plataforma de forma agregada y anónima. Puedes configurar tu navegador para rechazar cookies, aunque esto podría limitar algunas funcionalidades de la aplicación.',
    },
    {
        num: '7',
        title: 'Retención de datos',
        body: 'Conservamos tu información personal mientras tu cuenta esté activa o sea necesaria para prestarte el servicio. Si eliminas tu cuenta, suprimiremos o anonimizaremos tus datos personales en un plazo de 30 días, salvo obligación legal de conservación por un período mayor.',
    },
    {
        num: '8',
        title: 'Cambios en esta política',
        body: 'Nos reservamos el derecho de actualizar esta política periódicamente para reflejar cambios en nuestras prácticas o en la legislación aplicable. Notificaremos cualquier cambio sustancial a través de una notificación en la aplicación o por correo electrónico al menos 15 días antes de que entre en vigor.',
    },
    {
        num: '9',
        title: 'Contacto',
        body: 'Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos, contacta a nuestro equipo de protección de datos:',
        contact: {
            email: 'privacidad@talently.app',
            address: 'Av. Tecnológica 123, Madrid, España',
        },
    },
];

export default function PrivacyView() {
    const navigate = useNavigate();

    return (
        <div className="prv-wrapper">
            {/* ── Header ── */}
            <header className="prv-header">
                <button
                    className="prv-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="prv-header-title">Política de privacidad</h1>
            </header>

            {/* ── Contenido ── */}
            <main className="prv-main">
                <div className="prv-intro">
                    <p className="prv-date">Última actualización: {LAST_UPDATED}</p>
                    <p className="prv-intro-text">
                        En Talently, nos tomamos muy en serio la privacidad de nuestros usuarios.
                        Esta política describe cómo recopilamos, usamos y protegemos tu información
                        personal al utilizar nuestra plataforma de emparejamiento laboral.
                    </p>
                </div>

                <div className="prv-sections">
                    {SECTIONS.map((s) => (
                        <section key={s.num} className="prv-section">
                            <h2 className="prv-section-title">
                                <span className="prv-section-num">{s.num}.</span>
                                {' '}{s.title}
                            </h2>
                            <p className="prv-section-body">{s.body}</p>
                            {s.contact && (
                                <div className="prv-contact-card">
                                    <p className="prv-contact-line">Email: {s.contact.email}</p>
                                    <p className="prv-contact-line">Dirección: {s.contact.address}</p>
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}
