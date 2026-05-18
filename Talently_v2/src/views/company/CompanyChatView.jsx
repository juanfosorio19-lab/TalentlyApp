// src/views/company/CompanyChatView.jsx
// Reutiliza el componente Chat del candidato con backPath para empresa
import Chat from '../candidate/Chat';

export default function CompanyChatView() {
    return <Chat backPath="/company/dashboard" />;
}
