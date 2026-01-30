// ===== CANDIDATE SEARCH LOGIC APPENDED =====
Object.assign(app, {
    searchCandidates() {
        const input = document.getElementById('candidateSearchInput');

        // Debug Logger
        const log = (msg) => {
            console.log(msg);
            let debugBox = document.getElementById('searchDebugBox');
            if (!debugBox) {
                debugBox = document.createElement('div');
                debugBox.id = 'searchDebugBox';
                debugBox.style.cssText = 'position: fixed; top: 100px; right: 10px; width: 300px; padding: 10px; background: rgba(0,0,0,0.8); color: #0f0; z-index: 10000; font-size: 11px; font-family: monospace; border-radius: 8px; max-height: 400px; overflow-y: auto;';
                document.body.appendChild(debugBox);

                // Add close button
                const close = document.createElement('button');
                close.innerText = '×';
                close.style.cssText = 'position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer; font-size: 16px;';
                close.onclick = () => debugBox.style.display = 'none';
                debugBox.appendChild(close);
            }
            const line = document.createElement('div');
            line.innerText = `> ${msg}`;
            debugBox.appendChild(line);
            debugBox.style.display = 'block'; // Ensure visible on log
        };

        if (!input) {
            log('ERROR: Input #candidateSearchInput not found!');
            return;
        }

        const query = input.value.trim().toLowerCase();
        log(`Searching for: "${query}"`);

        // FALLBACK DATA (HARDCODED)
        const localData = [
            { id: 1, name: 'Ana García', role: 'Senior React Developer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', skills: ['React', 'TypeScript', 'Redux', 'Node.js'], experience: '5 años', location: 'Santiago', match: 95 },
            { id: 2, name: 'Carlos Rodríguez', role: 'Full Stack Python Developer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', skills: ['Python', 'Django', 'React', 'AWS', 'Docker'], experience: '4 años', location: 'Remoto', match: 88 },
            { id: 3, name: 'Valentina Martínez', role: 'UX/UI Designer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', skills: ['Figma', 'Prototyping', 'User Research', 'HTML/CSS'], experience: '3 años', location: 'Buenos Aires', match: 92 },
            { id: 4, name: 'Felipe Soto', role: 'Backend Dev (Go)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', skills: ['Go', 'Microservices', 'Kubernetes'], experience: '6 años', location: 'Lima', match: 85 }
        ];

        let candidates = window.mockCandidates || [];
        if (candidates.length === 0) {
            log('WARNING: window.mockCandidates empty. Using fallback data.');
            candidates = localData;
        } else {
            log(`Loaded ${candidates.length} from window data.`);
        }

        // Filter
        let filtered = candidates;
        if (query) {
            filtered = candidates.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.role.toLowerCase().includes(query) ||
                c.skills.some(skill => skill.toLowerCase().includes(query))
            );
        }

        log(`Found ${filtered.length} matches.`);
        this.renderCandidates(filtered);
    },

    renderCandidates(candidates) {
        const container = document.getElementById('candidateResults');
        if (!container) return;

        container.innerHTML = '';

        if (candidates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                    <p>No se encontraron talentos con esos criterios.</p>
                </div>
            `;
            return;
        }

        candidates.forEach(candidate => {
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.style.cssText = 'background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: flex-start; gap: 16px; transition: transform 0.2s; cursor: pointer;';
            card.onmouseover = () => card.style.transform = 'translateY(-2px)';
            card.onmouseout = () => card.style.transform = 'translateY(0)';

            // Skills tags HTML
            const skillsHtml = candidate.skills.slice(0, 3).map(skill =>
                `<span style="font-size: 11px; padding: 4px 8px; background: rgba(108,92,231,0.1); color: var(--primary); border-radius: 12px; font-weight: 500;">${skill}</span>`
            ).join('');

            card.innerHTML = `
                <img src="${candidate.image}" alt="${candidate.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${candidate.name}</h3>
                            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">${candidate.role}</p>
                        </div>
                        <span style="font-size: 12px; font-weight: 700; color: var(--success); background: rgba(0,184,148,0.1); padding: 4px 8px; border-radius: 6px;">${candidate.match}% Match</span>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                        ${skillsHtml}
                        ${candidate.skills.length > 3 ? `<span style="font-size: 11px; color: var(--text-secondary);">+${candidate.skills.length - 3}</span>` : ''}
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-secondary);">
                        <span>📍 ${candidate.location}</span>
                        <span>💼 ${candidate.experience}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    renderConversationsList() {
        const container = document.getElementById('companyConversationList');
        if (!container) return;

        // Mock Data
        const conversations = [
            { id: 1, name: 'Ana García', role: 'Senior React Dev', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', lastMessage: '¡Hola! Me interesa la oferta.', time: '10:30 AM', unread: 2 },
            { id: 2, name: 'Carlos Rodríguez', role: 'Python Dev', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', lastMessage: '¿Podría enviarme más detalles?', time: 'Ayer', unread: 0 },
            { id: 3, name: 'Valentina Martínez', role: 'UX Designer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', lastMessage: 'Gracias por la entrevista.', time: 'Lun', unread: 0 }
        ];

        container.innerHTML = '';
        conversations.forEach(c => {
            const item = document.createElement('div');
            item.style.cssText = 'display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;';
            item.onmouseover = () => item.style.background = 'var(--surface)';
            item.onmouseout = () => item.style.background = 'transparent';
            item.onclick = () => this.openChat(c);

            item.innerHTML = `
                <div style="position: relative;">
                    <img src="${c.image}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                    ${c.unread ? `<div style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; background: var(--danger); border-radius: 50%; border: 2px solid white;"></div>` : ''}
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <h4 style="font-weight: 600; font-size: 14px; margin: 0; color: var(--text-primary);">${c.name}</h4>
                        <span style="font-size: 11px; color: var(--text-secondary);">${c.time}</span>
                    </div>
                    <p style="font-size: 13px; color: var(--text-secondary); margin: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; font-weight: ${c.unread ? '600' : '400'}; color: ${c.unread ? 'var(--text-primary)' : 'var(--text-secondary)'};">${c.lastMessage}</p>
                    <span style="font-size: 11px; color: var(--primary); display: block; margin-top: 4px;">${c.role}</span>
                </div>
            `;
            container.appendChild(item);
        });
    },

    openChat(contact) {
        document.getElementById('messagesListView').style.display = 'none';
        const chatView = document.getElementById('messagesChatView');
        chatView.style.display = 'flex';

        // Set Header
        document.getElementById('chatAvatar').src = contact.image;
        document.getElementById('chatName').textContent = contact.name;
        document.getElementById('chatRole').textContent = contact.role;

        // Mock Messages
        const messages = document.getElementById('chatMessages');
        messages.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); font-size: 12px; margin: 16px 0;">Hoy</div>
            <!-- Received -->
            <div style="display: flex; gap: 12px; align-items: flex-end;">
                <img src="${contact.image}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                <div style="background: white; padding: 12px; border-radius: 12px 12px 12px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); max-width: 70%;">
                    <p style="font-size: 14px; margin: 0; color: var(--text-primary);">${contact.lastMessage}</p>
                    <span style="font-size: 10px; color: var(--text-secondary); display: block; margin-top: 4px; text-align: right;">${contact.time}</span>
                </div>
            </div>
            <!-- Sent -->
            <div style="display: flex; gap: 12px; align-items: flex-end; justify-content: flex-end;">
                <div style="background: var(--primary); padding: 12px; border-radius: 12px 12px 0 12px; max-width: 70%;">
                    <p style="font-size: 14px; margin: 0; color: white;">¡Hola! Claro, revisemos los detalles.</p>
                    <span style="font-size: 10px; color: rgba(255,255,255,0.7); display: block; margin-top: 4px; text-align: right;">Now</span>
                </div>
            </div>
        `;
    },

    backToConversationsList() {
        document.getElementById('messagesChatView').style.display = 'none';
        document.getElementById('messagesListView').style.display = 'flex';
    }
});

// Init search events
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('candidateSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') app.searchCandidates();
        });
    }
});
