// src/views/candidate/MessagesListView.jsx
// Wrapper para MessagesList — mantiene compatibilidad con el barrel export
import MessagesList from './MessagesList';

export default function MessagesListView() {
    return <MessagesList basePath="/app/messages" />;
}
