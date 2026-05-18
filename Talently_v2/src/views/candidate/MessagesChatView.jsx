// src/views/candidate/MessagesChatView.jsx
// Wrapper para Chat — mantiene compatibilidad con el barrel export
import Chat from './Chat';

export default function MessagesChatView() {
    return <Chat backPath="/app" />;
}
