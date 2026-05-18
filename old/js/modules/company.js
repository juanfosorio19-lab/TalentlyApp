// ============================================
// MÓDULO: App Empresa
// Talently — js/modules/company.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: openCompanyModal, showCompanySection,
//          closeCompanyProfile, saveCompanyProfile, handleLogoUpload,
//          _renderProfileSection, _renderProfileTags, _renderProfileSelection,
//          openCompanyProfile, searchCandidates, renderCandidateCard,
//          handleSuperSwipe, showMatchSuccessOverlay, closeMatchModal,
//          startChatFromMatch, createConversationStart,
//          filterCompanyConversations, _renderNewMatches,
//          _subscribeToAllCompanyMatches, _subscribeToCandidateMessages,
//          viewChatCandidateProfile, _chatDateLabel, _chatMsgBubble,
//          _subscribeToCompanyChat, updateCompanyMessagesBadge,
//          backToConversationsList, renderCandidates
// ============================================

Object.assign(app, {

    openCompanyModal(profileId) {
        const profile = this.profiles.find(p => p.id === profileId) || this.profiles[this.currentIndex];
        if (!profile) return;

        const modalBody = document.getElementById('companyModalBody');
        modalBody.innerHTML = `
            <div class="company-hero">
                <img src="${profile.logo || profile.image}" alt="${profile.name}" class="company-logo-large">
                <h2 class="company-name-large">${profile.name}</h2>
                <p class="company-tagline">${profile.title}</p>
                <div class="company-badges">
                    <span class="company-badge">${profile.sector || 'Tech'}</span>
                    <span class="company-badge">${profile.size || '50-200'}</span>
                    <span class="company-badge">${profile.stage || 'Growth'}</span>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Información General
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Ubicación</div>
                        <div class="detail-value">${profile.location}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Modalidad</div>
                        <div class="detail-value">${profile.workModel || profile.modality}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Salario</div>
                        <div class="detail-value">${profile.salary}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Proceso</div>
                        <div class="detail-value">${profile.hiringProcess || '3-4 semanas'}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Beneficios
                </div>
                <div class="benefits-grid">
                    ${(profile.benefits || ['Seguro médico', 'Home office', 'Capacitación']).map(b => `
                        <span class="benefit-tag">? ${b}</span>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    Tech Stack
                </div>
                <div class="tech-stack-grid">
                    ${(profile.techStack || ['React', 'Node.js', 'AWS']).map(t => `
                        <span class="tech-tag">${t}</span>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Cultura
                </div>
                <div class="culture-tags">
                    ${(profile.culture || ['Innovación', 'Colaboración', 'Autonomía']).map(c => `
                        <span class="culture-tag">${c}</span>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-section-title">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                    </svg>
                    Descripción
                </div>
                <p class="company-description">${profile.description || 'Empresa líder en su sector, comprometida con el crecimiento profesional de sus colaboradores.'}</p>
            </div>
        `;

        document.getElementById('companyModalOverlay').classList.add('active');
    },

    closeCompanyModal(event) {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('companyModalOverlay').classList.remove('active');
    },

    // ============================================
    // PREVIEW MODAL (HOW COMPANIES SEE YOU)
    // ============================================

    shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: 'Mi perfil en Talently',
                text: 'Echa un vistazo a mi perfil profesional',
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href)
                .then(() => this.showToast('Enlace copiado al portapapeles', 'success'))
                .catch(err => console.error('Error copying link:', err));
        }
    },

    openPreviewModal() {
        const overlay = document.getElementById('previewModalOverlay');
        if (!overlay) return;

        const user = this.currentUser || {};
        const name = user.name || 'Tu Nombre';
        const role = user.current_position || user.title || 'Tu cargo';
        const imageUrl = user.avatar_url || user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1392ec&color=fff&size=600`;
        const videoUrl = user.video_url || user.videoUrl;
        const skills = user.skills || [];

        // Populate card
        const cardImg = document.getElementById('pvCardImage');
        const cardVideo = document.getElementById('pvCardVideo');

        if (cardVideo && videoUrl) {
            // Display Video if available
            if (cardImg) cardImg.style.display = 'none';
            cardVideo.style.display = 'block';
            cardVideo.src = videoUrl;
            cardVideo.play().catch(e => console.warn("Autoplay prevented:", e));
        } else if (cardImg) {
            // Fallback to Image
            if (cardVideo) cardVideo.style.display = 'none';
            cardImg.style.display = 'block';
            cardImg.src = imageUrl;
        }

        const cardName = document.getElementById('pvCardName');
        if (cardName) {
            const age = user.birth_date ? Math.floor((Date.now() - new Date(user.birth_date).getTime()) / 31557600000) : null;
            cardName.textContent = age ? `${name.split(' ')[0]}, ${age}` : name.split(' ')[0];
        }

        const roleText = document.getElementById('pvCardRoleText');
        if (roleText) roleText.textContent = role;

        // Skills (max 3 + overflow count)
        const skillsEl = document.getElementById('pvCardSkills');
        if (skillsEl) {
            const shown = skills.slice(0, 3);
            const extra = skills.length - 3;
            skillsEl.innerHTML = shown.map(s =>
                `<span style="padding: 5px 12px; border-radius: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 700; color: #374151; letter-spacing: 0.02em;">${s}</span>`
            ).join('') + (extra > 0 ? `<span style="padding: 5px 10px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 700; color: #9ca3af;">+${extra}</span>` : '');
        }

        // Completeness
        const completenessEl = document.getElementById('pvCompletenessPercent');
        if (completenessEl) {
            const fields = ['name', 'email', 'birth_date', 'country', 'city', 'current_position', 'work_modality', 'availability', 'expected_salary', 'bio', 'image'];
            const arrayFields = ['skills', 'experience'];
            let filled = 0;
            const total = fields.length + arrayFields.length;
            fields.forEach(f => { if (user[f]) filled++; });
            arrayFields.forEach(f => { if (user[f] && Array.isArray(user[f]) && user[f].length > 0) filled++; });
            const pct = Math.round((filled / total) * 100);
            completenessEl.textContent = pct + '%';
        }

        overlay.style.display = 'flex';
    },

    closePreviewModal() {
        const overlay = document.getElementById('previewModalOverlay');
        const cardVideo = document.getElementById('pvCardVideo');

        if (cardVideo && !cardVideo.paused) {
            cardVideo.pause();
            // Reset to beginning on close
            cardVideo.currentTime = 0;
        }

        if (overlay) overlay.style.display = 'none';
    },

    // ============================================
    // IMPROVED CHAT WITH READ RECEIPTS
    // ============================================

    handleAttachment() {
        this.showToast('Funcionalidad de adjuntar archivos próximamente');
    },

    // Duplicate sendMessageWithReceipts removed to fix persistence bug.
    // The correct version is defined earlier (line ~950).

    updateReceipt(messageId, status) {
        const receipt = document.getElementById(`receipt-${messageId}`);
        if (!receipt) return;

        receipt.className = `read-receipt ${status}`;

        if (status === 'delivered' || status === 'read') {
            receipt.innerHTML = `
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
        }
    },

    // ============================================
    // PROFILE EDITING
    // ============================================

    editingField: null,

    startEditing(fieldId, currentValue) {
        this.editingField = fieldId;
        const container = document.getElementById(`field-${fieldId}`);
        if (!container) return;

        container.innerHTML = `
            <div class="editable-field">
                <input type="text" class="editable-input" id="input-${fieldId}" value="${currentValue}">
                <div class="edit-actions">
                    <button class="save-btn" onclick="app.saveField('${fieldId}')">Guardar</button>
                    <button class="cancel-btn" onclick="app.cancelEdit('${fieldId}', '${currentValue}')">Cancelar</button>
                </div>
            </div>
        `;

        document.getElementById(`input-${fieldId}`).focus();
    },

    saveField(fieldId) {
        const input = document.getElementById(`input-${fieldId}`);
        const newValue = input.value.trim();

        if (newValue) {
            const container = document.getElementById(`field-${fieldId}`);
            container.innerHTML = `
                <span class="profile-info-value">${newValue}</span>
            `;

            // Show success feedback
            container.style.background = 'rgba(0, 208, 132, 0.1)';
            setTimeout(() => {
                container.style.background = '';
            }, 1000);
        } else {
            this.showToast('El campo no puede estar vacío');
            // Keep editing capability
        }

        this.editingField = null;
    },

    cancelEdit(fieldId, originalValue) {
        const container = document.getElementById(`field-${fieldId}`);
        container.innerHTML = `
            <span class="profile-info-value">${originalValue}</span>
        `;
        this.editingField = null;
    },

    // ============================================
    // STATISTICS
    // ============================================

    userStats: {
        views: [12, 18, 25, 15, 30, 28, 35],
        matches: 24,
        conversations: 18,
        responseRate: 92
    },

    chatTemplates: [
        "Hola, nos interesa tu perfil.",
        "¿Cuándo tienes disponibilidad para una llamada?",
        "Te envío los detalles de la oferta."
    ],

    renderChatSuggestions() {
        const container = document.getElementById('chatSuggestions');
        if (!container) return;

        // Check user type properly
        const type = localStorage.getItem('talently_user_type');
        if (type === 'company' || this.userType === 'company') {
            container.style.display = 'flex';
            container.innerHTML = this.chatTemplates.map(t => `
                <button onclick="app.sendTemplate('${t}')" style="white-space: nowrap; padding: 6px 12px; border: 1px solid var(--primary); color: var(--primary); background: var(--surface); border-radius: 16px; font-size: 13px; cursor: pointer;">
                    ${t}
                </button>
            `).join('');
        } else {
            container.style.display = 'none';
        }
    },

    sendTemplate(text) {
        const input = document.getElementById('chatInput');
        input.value = text;
        this.sendMessageWithReceipts();
    },

    renderStats() {
        // This would be called when entering stats view
    },

    // ============================================
    // COMPANY DASHBOARD LOGIC
    // ============================================

    companyOffers: [],
    editingOfferId: null,

    // completeCompanyOnboarding is defined earlier (around line 5791) with full validation + Supabase upload

    showCompanySection(sectionId) {
        // Handle shorthand aliases
        if (sectionId === 'offers') sectionId = 'companyOffersSection';
        if (sectionId === 'search') sectionId = 'companySearchSection';
        if (sectionId === 'messages') sectionId = 'companyMessagesSection';
        if (sectionId === 'profile') sectionId = 'companyProfileSection';

        // Force Close Modals/Overlays
        const offerForm = document.getElementById('companyOfferForm');
        if (offerForm) offerForm.style.display = 'none';

        const matchModal = document.getElementById('matchModal');
        if (matchModal) matchModal.style.display = 'none';

        document.querySelectorAll('.company-section').forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
                if (sectionId === 'companySearchSection' || sectionId === 'companyMessagesSection' || sectionId === 'companyProfileSection') {
                    section.style.display = 'flex';
                } else {
                    section.style.display = 'block';
                }
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });

        // Update Stitch bottom nav active state
        const sectionToNav = {
            'companyOffersSection': 'companyNavOfertas',
            'companySearchSection': 'companyNavExplorar',
            'companyMessagesSection': 'companyNavMensajes',
            'companyProfileSection': 'companyNavPerfil',
            'companySettingsSection': 'companyNavPerfil',
        };
        const activeNavId = sectionToNav[sectionId] || 'companyNavPerfil';
        const activeColor = '#1392ec';
        const inactiveColor = '#9ca3af';
        ['companyNavOfertas', 'companyNavExplorar', 'companyNavMensajes', 'companyNavPerfil'].forEach(navId => {
            const el = document.getElementById(navId);
            if (!el) return;
            const isActive = navId === activeNavId;
            el.style.color = isActive ? activeColor : inactiveColor;
            el.style.filter = isActive ? `drop-shadow(0 0 8px rgba(19,146,236,0.2))` : 'none';
            const icon = el.querySelector('.material-icons');
            if (icon) icon.style.transform = isActive ? 'scale(1.1)' : 'scale(1)';
            const label = el.querySelector('span:last-child');
            if (label) label.style.fontWeight = isActive ? '700' : '500';
        });

        if (sectionId === 'companyOffersSection') this.renderCompanyOffers();
        if (sectionId === 'companySearchSection') this.initCandidateSwipe();
        if (sectionId === 'companyMessagesSection') this.renderConversationsList();
        if (sectionId === 'companyProfileSection') this.renderCompanyProfile();
    },

    renderCompanyProfile() {
        // Smart merge: start with currentUser (onboarding data), overlay companyProfile
        const data = { ...this.currentUser };
        if (this.companyProfile) {
            Object.keys(this.companyProfile).forEach(key => {
                const val = this.companyProfile[key];
                if (val !== null && val !== undefined && val !== '') data[key] = val;
            });
        }

        const getLabel = (cat, id) => this.getRefLabel ? this.getRefLabel(cat, id) : id;

        // Set logo
        const logoEl = document.getElementById('companyProfileLogo');
        if (logoEl) {
            let logoSrc = data.logo_url || data.image || data.logo || data.avatar_url;
            if (logoSrc) {
                logoEl.src = logoSrc;
                logoEl.onerror = () => {
                    logoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'C')}&background=1392ec&color=fff&size=200`;
                };
            } else {
                logoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Company')}&background=1392ec&color=fff&size=200`;
            }
        }

        // Set company name
        const nameEl = document.getElementById('companyProfileName');
        if (nameEl) nameEl.textContent = data.name || this.currentUser?.user_metadata?.name || 'Nombre de la Empresa';

        // Set sector subtitle (Sector • City, Country)
        const sectorEl = document.getElementById('companyProfileSector');
        if (sectorEl) {
            const parts = [];
            const sectorName = getLabel('sectors', data.sector);
            if (sectorName && sectorName !== data.sector) parts.push(sectorName);
            else if (data.sector) parts.push(data.sector);

            if (data.city_name) {
                const countryName = getLabel('countries', data.country);
                parts.push(`${data.city_name}, ${countryName && countryName !== data.country ? countryName : (data.country || '')}`);
            } else if (data.city) {
                parts.push(data.city);
            } else if (data.country && data.country.length < 10) {
                parts.push(data.country);
            }
            sectorEl.textContent = parts.join(' • ') || 'Sector no definido';
        }

        // Set size
        const sizeEl = document.getElementById('companyProfileSize');
        if (sizeEl) {
            let sizeText = getLabel('sizes', data.company_size || data.size);
            if (!sizeText || sizeText === data.company_size) {
                const sizeMap = { 'pequena': 'Pequeña (1-50)', 'mediana': 'Mediana (51-200)', 'grande': 'Grande (201-1000)', 'corporativa': '+1000' };
                sizeText = sizeMap[data.company_size] || data.company_size;
            }
            sizeEl.textContent = sizeText || '-';
        }

        // Set location
        const locationEl = document.getElementById('companyProfileLocation');
        if (locationEl) {
            const parts = [];
            if (data.city_name) parts.push(data.city_name);
            else if (data.city) parts.push(data.city);
            const countryName = getLabel('countries', data.country);
            if (countryName && countryName !== data.country) parts.push(countryName);
            else if (data.country && data.country.length < 20) parts.push(data.country);
            locationEl.textContent = parts.join(', ') || '-';
        }

        // Set value proposition
        const valuePropEl = document.getElementById('companyProfileValueProp');
        if (valuePropEl) valuePropEl.textContent = data.value_proposition || data.description || '-';

        // Set website
        const websiteEl = document.getElementById('companyProfileWebsite');
        if (websiteEl) {
            if (data.website) {
                websiteEl.href = data.website.startsWith('http') ? data.website : `https://${data.website}`;
                websiteEl.textContent = data.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
            } else {
                websiteEl.textContent = '-';
                websiteEl.removeAttribute('href');
            }
        }

        // Set linkedin
        const linkedinEl = document.getElementById('companyProfileLinkedin');
        if (linkedinEl) {
            if (data.linkedin_url || data.linkedin) {
                const url = data.linkedin_url || data.linkedin;
                linkedinEl.href = url.startsWith('http') ? url : `https://${url}`;
                linkedinEl.textContent = 'Ver Perfil';
            } else {
                linkedinEl.textContent = '-';
                linkedinEl.removeAttribute('href');
            }
        }

        // Set work model & stage details
        const workModelEl = document.getElementById('companyProfileWorkModel');
        if (workModelEl) workModelEl.textContent = getLabel('work_modalities', data.work_model) || '-';

        const stageEl = document.getElementById('companyProfileStage');
        if (stageEl) stageEl.textContent = getLabel('stages', data.company_stage) || data.stage || '-';

        // Render array sections (hide parent card if empty)
        this._renderProfileSection('companyProfileCulture', data.culture_values, 'culture_values', 'rgba(79,70,229,0.08)', '#4F46E5');
        this._renderProfileSection('companyProfileTech', data.tech_stack || this.companyTechStack, null, '#F3F4F6', '#111827', true);
        this._renderProfileSection('companyProfilePositions', data.positions_looking, 'positions', 'rgba(16,185,129,0.08)', '#10B981');
        this._renderProfileSection('companyProfileSeniority', data.seniority_levels, 'seniority_levels', 'rgba(245,158,11,0.08)', '#F59E0B');
        this._renderProfileSection('companyProfileBenefits', data.benefits, 'benefits', 'rgba(59,130,246,0.08)', '#3B82F6');
        this._renderProfileTags('companyProfileTags', data.tags || this.companyTags);
        this._renderProfileSelection('companyProfileSelection', data);

        // Load stats from backend
        this._loadCompanyStats(data);
    },

    async _loadCompanyStats(companyData) {
        if (!companyData || !window.talentlyBackend || !window.talentlyBackend.isReady) return;
        const companyUserId = companyData.user_id || this.currentUser?.user_id || this.currentUser?.id;
        console.log('[DEBUG] _loadCompanyStats: companyUserId =', companyUserId);
        try {
            // Count active offers (exclude closed)
            const { data: offers } = await window.talentlyBackend.offers.getByCompany(companyUserId);
            const offersCount = offers ? offers.filter(o => o.status !== 'closed').length : 0;

            // Count matches
            const { data: matches } = await window.talentlyBackend.matches.get();
            const matchesCount = matches ? matches.length : 0;

            // Profile views - use statistics table if available
            let viewsCount = 0;
            try {
                const { data: stats } = await window.talentlyBackend.statistics.get();
                console.log('[DEBUG] _loadCompanyStats: stats =', stats);
                viewsCount = stats?.profile_views || 0;
            } catch (e) { console.warn('[DEBUG] Stats error:', e); }

            const statsOffers = document.getElementById('companyStatsOffers');
            if (statsOffers) statsOffers.textContent = offersCount;

            const statsMatches = document.getElementById('companyStatsMatches');
            if (statsMatches) statsMatches.textContent = matchesCount;

            const statsViews = document.getElementById('companyStatsViews');
            if (statsViews) statsViews.textContent = viewsCount;
        } catch (e) {
            console.warn('Error loading company stats:', e);
        }
    },

    openCompanyEditModal() {
        // Open the company edit modal with current data
        this.openCompanyProfile();
    },

    previewCompanyProfile() {
        // Show how the company profile looks to candidates
        this.showToast('Vista previa próximamente', 'info');
    },

    openCompanySettings() {
        this.showCompanySection('companySettingsSection');
    },

    async uploadCompanyLogo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('La imagen no debe superar 5MB', 'error');
                return;
            }
            this.showToast('Subiendo logo...', 'info');
            try {
                const url = await window.talentlyBackend.storage.uploadImage(file, 'company-logos');
                if (url) {
                    const userId = this.currentUser?.user_id || this.currentUser?.id;
                    await window.talentlyBackend.companies.update(userId, { logo_url: url });
                    if (this.companyProfile) this.companyProfile.logo_url = url;
                    const logoEl = document.getElementById('companyProfileLogo');
                    if (logoEl) logoEl.src = url;
                    this.showToast('Logo actualizado');
                }
            } catch (err) {
                console.error('Error uploading logo:', err);
                this.showToast('Error al subir el logo', 'error');
            }
        };
        input.click();
    },

    getRefLabel(category, id) {
        if (!id) return '';
        if (!this.referenceData || !this.referenceData[category]) return id;
        const item = this.referenceData[category].find(i => i.slug === id || i.id === id);
        return item ? item.name : id;
    },

    resolveRefNames(category, slugArray) {
        if (!Array.isArray(slugArray) || slugArray.length === 0) return [];
        return slugArray.map(slug => this.getRefLabel(category, slug));
    },

    async loadCitiesForEdit(countryId, selectedCityId = null) {
        const citySelect = document.getElementById('cpCity');
        if (!citySelect) return;

        citySelect.innerHTML = '<option value="">Cargando...</option>';

        if (!countryId) {
            citySelect.innerHTML = '<option value="">Selecciona un país primero</option>';
            return;
        }

        try {
            const { data: cities } = await window.talentlyBackend.reference.getCities(countryId);
            citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';

            if (cities && cities.length > 0) {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    if (city.id === selectedCityId) option.selected = true;
                    citySelect.appendChild(option);
                });
            }
        } catch (e) {
            console.error('Error loading cities:', e);
            citySelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    },

    populateCompanyFormOptions() {
        // Helper to populate select options from referenceData
        const populate = (elementId, category, placeholder) => {
            const el = document.getElementById(elementId);
            if (!el) return;
            el.innerHTML = `<option value="">${placeholder}</option>`;
            if (this.referenceData && this.referenceData[category]) {
                this.referenceData[category].forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.slug || item.id;
                    option.textContent = item.name;
                    el.appendChild(option);
                });
            }
        };

        populate('cpIndustry', 'sectors', 'Selecciona Industria');
        populate('cpSize', 'sizes', 'Selecciona Tamaño');
        populate('cpStage', 'stages', 'Selecciona Etapa');
        populate('cpWorkModel', 'work_modalities', 'Selecciona Modalidad');
        populate('cpCountry', 'countries', 'Selecciona País');
        populate('cpSelectionDuration', 'selection_durations', 'Seleccionar');

        // Populate multi-checkbox containers
        this.populateMultiCheckbox('cpCultureContainer', 'culture_values');
        this.populateMultiCheckbox('cpPositionsContainer', 'positions');
        this.populateMultiCheckbox('cpSeniorityContainer', 'seniority_levels');
        this.populateMultiCheckbox('cpBenefitsContainer', 'benefits');
    },

    populateMultiCheckbox(containerId, refCategory) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const items = this.referenceData[refCategory] || [];
        container.innerHTML = '';
        items.forEach(item => {
            const label = document.createElement('label');
            label.className = 'cp-multi-option';
            label.style.cssText = 'padding: 10px 12px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s;';
            label.onclick = (e) => {
                e.preventDefault();
                const cb = label.querySelector('input');
                cb.checked = !cb.checked;
                label.style.borderColor = cb.checked ? 'var(--primary)' : 'var(--border)';
                label.style.background = cb.checked ? 'rgba(108,92,231,0.1)' : 'var(--surface)';
            };
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = item.slug || item.id;
            cb.style.cssText = 'width: 16px; height: 16px; accent-color: var(--primary); pointer-events: none;';
            const span = document.createElement('span');
            span.textContent = item.name;
            label.appendChild(cb);
            label.appendChild(span);
            container.appendChild(label);
        });
    },

    setMultiCheckboxValues(containerId, values) {
        const container = document.getElementById(containerId);
        if (!container || !Array.isArray(values)) return;
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            const isSelected = values.includes(cb.value);
            cb.checked = isSelected;
            const label = cb.closest('.cp-multi-option') || cb.parentElement;
            if (label) {
                label.style.borderColor = isSelected ? 'var(--primary)' : 'var(--border)';
                label.style.background = isSelected ? 'rgba(108,92,231,0.1)' : 'var(--surface)';
            }
        });
    },

    getMultiCheckboxValues(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    },

    // --- Edit modal tag helpers ---
    cpEditTechStack: [],
    cpEditTags: [],

    addEditTech(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const tech = input.value.trim();
            if (!tech) return;
            if (this.cpEditTechStack.length >= 20) { this.showToast('Máximo 20 tecnologías'); return; }
            if (!this.cpEditTechStack.includes(tech)) {
                this.cpEditTechStack.push(tech);
                this.renderEditTechStack();
            }
            input.value = '';
        }
    },

    removeEditTech(index) {
        this.cpEditTechStack.splice(index, 1);
        this.renderEditTechStack();
    },

    renderEditTechStack() {
        const container = document.getElementById('cpTechStackTags');
        if (!container) return;
        container.innerHTML = this.cpEditTechStack.map((tech, i) =>
            `<span style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:rgba(108,92,231,0.1);color:var(--primary);border-radius:20px;font-size:13px;font-weight:500;">${tech}<span onclick="app.removeEditTech(${i})" style="cursor:pointer;font-size:16px;line-height:1;">&times;</span></span>`
        ).join('');
    },

    addEditTag(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const tag = input.value.trim();
            if (!tag) return;
            if (this.cpEditTags.length >= 20) { this.showToast('Máximo 20 tags'); return; }
            if (!this.cpEditTags.includes(tag)) {
                this.cpEditTags.push(tag);
                this.renderEditTags();
            }
            input.value = '';
        }
    },

    removeEditTag(index) {
        this.cpEditTags.splice(index, 1);
        this.renderEditTags();
    },

    renderEditTags() {
        const container = document.getElementById('cpTagsTags');
        if (!container) return;
        container.innerHTML = this.cpEditTags.map((tag, i) =>
            `<span style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:var(--bg);border:1px solid var(--border);color:var(--text-primary);border-radius:20px;font-size:13px;font-weight:500;">${tag}<span onclick="app.removeEditTag(${i})" style="cursor:pointer;font-size:16px;line-height:1;">&times;</span></span>`
        ).join('');
    },

    formatCurrency(input) {
        // Strictly remove non-digit characters
        let value = input.value.replace(/\D/g, '');
        if (value) {
            // Check for realistic integer length to avoid overflow or weird formatting
            value = value.substring(0, 15);
            input.value = parseInt(value, 10).toLocaleString('es-CL');
        } else {
            input.value = '';
        }
    },

    toggleNotifications() {
        const type = localStorage.getItem('talently_user_type');
        const isCompany = (type === 'company' || this.profileType === 'company');
        const viewId = isCompany ? 'companyNotificationsView' : 'notificationsView';
        const view = document.getElementById(viewId);
        if (!view) {
            console.error(viewId + ' not found');
            return;
        }

        // Toggle usando style.transform
        if (view.style.transform.includes('translateY(0)')) {
            view.style.transform = 'translateX(-50%) translateY(100%)';
        } else {
            // Cerrar otros toggles
            this.closeFilters();
            this.closeSettingsModal();

            view.style.transform = 'translateX(-50%) translateY(0)';
        }
    },

    markNotificationsAsRead() {
        // Mark all candidate notifications as read
        (this.matches || []).forEach(m => { m.hasUnread = false; });
        localStorage.setItem('talently_matches', JSON.stringify(this.matches));
        this.updateBadge();
        this.renderNotifications();

        // Mark all company notifications as read
        (this.companyNotifications || []).forEach(n => { n.hasUnread = false; });
        this.updateCompanyNotifBadge();
        this.renderCompanyNotifications();

        this.showToast('Notificaciones marcadas como leídas');
    },

    closeNotifications() {
        const view = document.getElementById('notificationsView');
        if (view) {
            view.style.transform = 'translateX(-50%) translateY(100%)';
        }
        const companyView = document.getElementById('companyNotificationsView');
        if (companyView) {
            companyView.style.transform = 'translateX(-50%) translateY(100%)';
        }
    },






    // Company Profile Logic
    companyProfile: {
        name: 'Talently Business',
        industry: 'Tecnología',
        logo: '',
        location: 'Santiago, Chile',
        description: 'Empresa líder en tecnología e innovación.'
    },

    handleLogoUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('cpLogoPreview');
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.style.display = 'block';
                document.getElementById('cpLogo').value = e.target.result; // Save DataURL
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    // Stitch helper: render tag array into container, hide parent card if empty
    _renderProfileSection(containerId, values, refCategory, bgColor, textColor, isRaw) {
        const container = document.getElementById(containerId);
        const card = document.getElementById(containerId + 'Card');
        if (!container) return;
        if (!Array.isArray(values) || values.length === 0) {
            if (card) card.style.display = 'none';
            return;
        }
        if (card) card.style.display = '';
        const names = isRaw ? values : this.resolveRefNames(refCategory, values);
        container.innerHTML = names.map(name =>
            `<span style="padding: 6px 14px; background: ${bgColor}; color: ${textColor}; border-radius: 20px; font-size: 13px; font-weight: 600;">${name}</span>`
        ).join('');
    },

    _renderProfileTags(containerId, tags) {
        const container = document.getElementById(containerId);
        const card = document.getElementById(containerId + 'Card');
        if (!container) return;
        if (!Array.isArray(tags) || tags.length === 0) {
            if (card) card.style.display = 'none';
            return;
        }
        if (card) card.style.display = '';
        container.innerHTML = tags.map(tag =>
            `<span style="padding: 6px 14px; background: #F3F4F6; border: 1px solid #E5E7EB; color: #374151; border-radius: 20px; font-size: 13px; font-weight: 500;">${tag}</span>`
        ).join('');
    },

    _renderProfileSelection(containerId, data) {
        const container = document.getElementById(containerId);
        const card = document.getElementById(containerId + 'Card');
        if (!container) return;
        const hasData = data.technical_test || data.paid_test || data.selection_stages || data.selection_duration;
        if (!hasData) {
            if (card) card.style.display = 'none';
            return;
        }
        if (card) card.style.display = '';
        const testMap = { 'si': 'Sí', 'no': 'No', 'depende': 'Depende', 'a-veces': 'A veces' };
        const badges = [];
        if (data.technical_test) badges.push(`Prueba Técnica: ${testMap[data.technical_test] || data.technical_test}`);
        if (data.paid_test) badges.push(`Prueba Pagada: ${testMap[data.paid_test] || data.paid_test}`);
        if (data.selection_stages) badges.push(`${data.selection_stages} Etapas`);
        if (data.selection_duration) badges.push(`Duración: ${this.getRefLabel('selection_durations', data.selection_duration)}`);
        container.innerHTML = badges.map(b =>
            `<span style="padding: 6px 14px; background: #F3F4F6; border: 1px solid #E5E7EB; color: #6B7280; border-radius: 20px; font-size: 13px; font-weight: 500;">${b}</span>`
        ).join('');
    },

    openCompanyProfile() {
        const modal = document.getElementById('companyProfileModal');
        const data = this.companyProfile || this.currentUser || {};

        // Populate dropdowns first
        this.populateCompanyFormOptions();

        // Map DB fields to Inputs
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('cpName', data.name);
        setVal('cpWebsite', data.website);
        setVal('cpIndustry', data.sector); // sector ID
        setVal('cpSize', data.company_size);
        setVal('cpStage', data.company_stage);
        setVal('cpWorkModel', data.work_model);
        setVal('cpCountry', data.country);
        setVal('cpDescription', data.value_proposition || data.description);

        // Populate New Fields
        setVal('cpLinkedin', data.linkedin_url);
        setVal('cpTechTest', data.technical_test);
        setVal('cpPaidTest', data.paid_test);
        setVal('cpStages', data.selection_stages);
        setVal('cpSelectionDuration', data.selection_duration);

        // Populate multi-checkbox values
        this.setMultiCheckboxValues('cpCultureContainer', data.culture_values || []);
        this.setMultiCheckboxValues('cpPositionsContainer', data.positions_looking || []);
        this.setMultiCheckboxValues('cpSeniorityContainer', data.seniority_levels || []);
        this.setMultiCheckboxValues('cpBenefitsContainer', data.benefits || []);

        // Initialize edit tag arrays and render
        this.cpEditTechStack = [...(data.tech_stack || this.companyTechStack || [])];
        this.cpEditTags = [...(data.tags || this.companyTags || [])];
        this.renderEditTechStack();
        this.renderEditTags();

        // Handle City: dependent load
        if (data.country) {
            this.loadCitiesForEdit(data.country, data.city);
        } else {
            const citySelect = document.getElementById('cpCity');
            if (citySelect) citySelect.innerHTML = '<option value="">Selecciona un país primero</option>';
        }

        // Handle logo preview
        const logoVal = data.logo_url || data.logo || '';
        const logoHidden = document.getElementById('cpLogo');
        if (logoHidden) logoHidden.value = logoVal;
        const preview = document.getElementById('cpLogoPreview');
        if (preview) {
            if (logoVal) {
                preview.style.backgroundImage = `url(${logoVal})`;
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        }

        if (modal) {
            modal.style.removeProperty('display');
            modal.classList.add('active');
        }
    },

    closeCompanyProfile() {
        const modal = document.getElementById('companyProfileModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    },

    async saveCompanyProfile() {
        const name = document.getElementById('cpName')?.value;
        if (!name) {
            this.showToast('El nombre es obligatorio');
            return;
        }

        this.showToast('Guardando perfil...', 'info');

        // Merge new values into existing companyProfile
        const prevData = this.companyProfile || {};
        let logoUrl = document.getElementById('cpLogo')?.value || prevData.logo_url;

        // --- HANDLE LOGO UPLOAD IF CHANGED ---
        // If logoUrl is a DataURL (starts with "data:"), we must upload it first
        if (logoUrl && logoUrl.startsWith('data:')) {
            try {
                // Convert DataURL to File object
                const res = await fetch(logoUrl);
                const blob = await res.blob();
                const file = new File([blob], "company_logo.png", { type: "image/png" });

                if (window.talentlyBackend && window.talentlyBackend.storage) {
                    const uploadedUrl = await window.talentlyBackend.storage.uploadImage(file, 'images');
                    if (uploadedUrl) {
                        logoUrl = uploadedUrl;
                        console.log('✅ Logo uploaded:', logoUrl);
                    } else {
                        console.warn('⚠️ Upload failed, keeping previous logo URL');
                        // Don't save DataURL to DB - it's too large and will fail
                        // Fall back to the previous logo URL instead
                        logoUrl = prevData.logo_url || null;
                        this.showToast('Error al subir imagen. Verifica los permisos de Storage en Supabase.', 'error');
                    }
                }
            } catch (e) {
                console.error('Error uploading logo:', e);
                logoUrl = prevData.logo_url || null;
                this.showToast('Error al subir imagen', 'error');
            }
        }

        this.companyProfile = {
            ...prevData,
            name: name,
            website: document.getElementById('cpWebsite')?.value,
            sector: document.getElementById('cpIndustry')?.value,
            company_size: document.getElementById('cpSize')?.value,
            company_stage: document.getElementById('cpStage')?.value,
            work_model: document.getElementById('cpWorkModel')?.value,
            country: document.getElementById('cpCountry')?.value,
            city: document.getElementById('cpCity')?.value,
            value_proposition: document.getElementById('cpDescription')?.value,
            linkedin_url: document.getElementById('cpLinkedin')?.value,
            technical_test: document.getElementById('cpTechTest')?.value,
            paid_test: document.getElementById('cpPaidTest')?.value,
            selection_stages: document.getElementById('cpStages')?.value,
            selection_duration: document.getElementById('cpSelectionDuration')?.value,
            culture_values: this.getMultiCheckboxValues('cpCultureContainer'),
            positions_looking: this.getMultiCheckboxValues('cpPositionsContainer'),
            seniority_levels: this.getMultiCheckboxValues('cpSeniorityContainer'),
            benefits: this.getMultiCheckboxValues('cpBenefitsContainer'),
            tech_stack: [...this.cpEditTechStack],
            tags: [...this.cpEditTags],
            logo_url: logoUrl
        };

        // Sync app state arrays
        this.companyTechStack = this.companyProfile.tech_stack;
        this.companyTags = this.companyProfile.tags;

        // Save to Supabase
        if (window.talentlyBackend && window.talentlyBackend.isReady && this.currentUser) {
            const updateData = {
                name: this.companyProfile.name,
                website: this.companyProfile.website,
                sector: this.companyProfile.sector,
                company_size: this.companyProfile.company_size,
                company_stage: this.companyProfile.company_stage,
                work_model: this.companyProfile.work_model,
                country: this.companyProfile.country,
                city: this.companyProfile.city,
                value_proposition: this.companyProfile.value_proposition,
                linkedin_url: this.companyProfile.linkedin_url,
                technical_test: this.companyProfile.technical_test,
                paid_test: this.companyProfile.paid_test,
                selection_stages: this.companyProfile.selection_stages,
                selection_duration: this.companyProfile.selection_duration,
                culture_values: this.companyProfile.culture_values,
                positions_looking: this.companyProfile.positions_looking,
                seniority_levels: this.companyProfile.seniority_levels,
                benefits: this.companyProfile.benefits,
                tech_stack: this.companyProfile.tech_stack,
                tags: this.companyProfile.tags,
                logo_url: this.companyProfile.logo_url
            };

            // FIX: Use the Company ID (PK) for direct update
            const recordId = this.companyProfile.id;
            // CRITICAL FIX: Bypass wrapper which forces user_id check. 
            // We must use the Company ID directly.
            let updatePromise;

            if (recordId && window.supabaseClient) {
                // DIRECT SUPABASE CALL
                updatePromise = window.supabaseClient
                    .from('companies')
                    .update(updateData)
                    .eq('id', recordId)
                    .select()
                    .single();
            } else {
                // Fallback (only if no recordId, which shouldn't happen for edit)
                console.warn('⚠️ No Company ID found for direct update, falling back to wrapper (might fail)');
                updatePromise = window.talentlyBackend.companies.update(this.currentUser.id, updateData);
            }

            updatePromise
                .then(result => {
                    if (result.error) {
                        console.error('Error saving company profile:', result.error);
                        this.showToast('Error al guardar: ' + result.error.message, 'error');
                    } else {
                        console.log('✅ Company profile saved to DB', result.data);
                        // Update local state with returned data
                        if (result.data) {
                            this.companyProfile = { ...this.companyProfile, ...result.data };
                            // Also update currentUser if it's acting as profile holder
                            this.currentUser = { ...this.currentUser, ...result.data };
                            // SYNC STATE:
                            this.companyTechStack = result.data.tech_stack || [];
                            this.companyTags = result.data.tags || [];
                        }
                        this.showToast('Perfil actualizado correctamente', 'success');

                        // Re-render and close
                        this.updateCompanyHeader();
                        this.renderCompanyProfile();
                        this.closeCompanyProfile();
                    }
                })
                .catch(err => {
                    console.error('Unexpected error saving company profile:', err);
                    this.showToast('Error inesperado al guardar', 'error');
                });
        } else {
            // Local save only (offline or no backend)
            this.updateCompanyHeader();
            this.renderCompanyProfile();
            this.closeCompanyProfile();
            this.showToast('Perfil actualizado (Local)');
        }
    },

    updateCompanyHeader() {
        const nameEl = document.getElementById('headerCompanyName');
        const logoEl = document.getElementById('headerCompanyLogo');

        // REVERTED to generic branding for header as requested by USER
        if (nameEl) nameEl.textContent = 'Talently Business';

        // Use generic logo for header (or specific if desired, user said "should show Talently Business logo")
        // We'll use the default avatar with "Talently Business"
        if (logoEl) {
            logoEl.src = 'https://ui-avatars.com/api/?name=Talently+Business&background=6c5ce7&color=fff';
        }
    },

    renderCompanyTechStack() {
        const container = document.getElementById('companyTechStackBubbleContainer');
        if (!container) return;

        container.innerHTML = '';
        this.companyTechStack.forEach((tech, index) => {
            const bubble = document.createElement('div');
            bubble.style.cssText = 'padding: 6px 12px; background: var(--primary); color: white; border-radius: 16px; font-size: 13px; display: flex; align-items: center; gap: 6px;';
            bubble.innerHTML = `
                ${tech}
                <span onclick="app.removeCompanyTechStack(${index})" style="cursor: pointer; font-weight: bold;">×</span>
            `;
            container.appendChild(bubble);
        });

        // Update Suggestions
        this.renderCompanyTechStackSuggestions();
    },

    renderCompanyTechStackSuggestions() {
        const container = document.getElementById('companyTechStackSuggestionsContainer');
        if (!container) return;

        container.innerHTML = '';
        const suggestions = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'AWS', 'Docker', 'SQL', 'TypeScript', 'Go', 'Figma', 'Vue.js', 'Angular', 'Kubernetes', 'C#', 'Flutter'];

        suggestions.filter(tech => !this.companyTechStack.includes(tech)).forEach(tech => {
            const btn = document.createElement('button');
            btn.textContent = tech;
            btn.className = 'btn-chip'; // Reuse existing class if available or style directly
            btn.style.cssText = 'padding: 8px 16px; background: var(--surface); color: var(--text-secondary); border: 1px solid var(--border); border-radius: 24px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.03); display: inline-flex; align-items: center; justify-content: center;';

            btn.onmouseover = () => { btn.style.background = 'var(--primary)'; btn.style.color = 'white'; };
            btn.onmouseout = () => { btn.style.background = 'var(--surface)'; btn.style.color = 'var(--text-secondary)'; };

            btn.onclick = () => this.addCompanyTechStackFromSuggestion(tech);
            container.appendChild(btn);
        });
    },

    addCompanyTechStackFromSuggestion(tech) {
        if (this.companyTechStack.length >= 20) {
            this.showToast('Máximo 20 tecnologías');
            return;
        }
        if (!this.companyTechStack.includes(tech)) {
            this.companyTechStack.push(tech);
            this.renderCompanyTechStack();
        }
    },

    removeCompanyTechStack(index) {
        this.companyTechStack.splice(index, 1);
        this.renderCompanyTechStack();
    },

    searchCandidates() {
        const input = document.getElementById('candidateSearchInput');
        const query = input ? input.value.toLowerCase() : '';

        const mockCandidates = [
            { name: 'Ana Silva', role: 'Senior UX Designer', skills: ['Figma', 'UX Research'] },
            { name: 'Carlos Ruiz', role: 'Full Stack Dev', skills: ['React', 'Node.js'] },
            { name: 'Laura M.', role: 'Frontend Developer', skills: ['Vue.js', 'CSS'] },
            { name: 'Pedro J.', role: 'Product Manager', skills: ['Agile', 'Scrum'] }
        ];

        const results = mockCandidates.filter(c =>
            c.role.toLowerCase().includes(query) ||
            c.skills.some(s => s.toLowerCase().includes(query))
        );

        const container = document.getElementById('candidateResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.6;">No se encontraron candidatos.</div>';
            return;
        }

        container.innerHTML = results.map(c => `
             <div class="candidate-card" style="padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; gap: 12px;">
                 <div style="width: 40px; height: 40px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                    ${c.name.charAt(0)}
                 </div>
                 <div style="flex: 1;">
                     <div style="font-weight: 700; color: var(--text-primary);">${c.name}</div>
                     <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">${c.role}</div>
                     <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${c.skills.map(s => `<span style="font-size: 10px; padding: 2px 6px; background: var(--bg); border-radius: 4px; border: 1px solid var(--border);">${s}</span>`).join('')}
                     </div>
                 </div>
                 <button style="padding: 6px 12px; background: var(--primary); color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">Chat</button>
             </div>
        `).join('');
    },

    candidatesDeck: [],
    currentCandidateIndex: 0,

    async initCandidateSwipe() {
        this.currentCandidateIndex = 0;

        // Load candidates from backend if deck is empty
        if (this.candidatesDeck.length === 0) {
            await this.loadCandidatesFromBackend();
        }
        this.renderCandidateCard();
    },

    async loadCandidatesFromBackend() {
        if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
            console.warn('Backend not ready for candidate loading');
            return;
        }

        try {
            // Load candidates and already-swiped IDs in parallel
            const [candidatesResult, swipedResult] = await Promise.all([
                window.talentlyBackend.profiles.getCandidatesForExplore(),
                window.talentlyBackend.swipes.getSwipedUserIds()
            ]);

            if (candidatesResult.error) {
                console.error('Error loading candidates:', candidatesResult.error);
                return;
            }

            const swipedUserIds = swipedResult.data || [];

            // Filter out already-swiped candidates and map to card format
            this.candidatesDeck = (candidatesResult.data || [])
                .filter(profile => !swipedUserIds.includes(profile.id))
                .map(profile => ({
                    id: profile.id, // auth user ID
                    name: profile.name || 'Candidato',
                    role: profile.current_position || profile.title || profile.role || 'Profesional',
                    image: profile.avatar_url || profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'C')}&background=6c5ce7&color=fff`,
                    seniority: profile.experience_level || 'N/A',
                    exp: profile.experience_years || 'N/A',
                    salary: profile.expected_salary ? `${profile.currency || '$'} ${profile.expected_salary}` : 'A convenir',
                    modality: profile.work_modality || profile.modality || 'Flexible',
                    languages: profile.languages || ['Español'],
                    skills: profile.skills || [],
                    softSkills: profile.soft_skills || [],
                    benefits: profile.interests || [],
                    bio: profile.bio || profile.description || 'Sin descripción disponible.',
                    fit: Math.floor(Math.random() * 20) + 80,
                    location: profile.city || profile.country || 'Sin ubicación',
                    education: profile.education_level || 'N/A',
                    area: profile.professional_area || 'N/A'
                }));

            this.currentCandidateIndex = 0;
            console.log('✅ Loaded candidates:', this.candidatesDeck.length, `(${swipedUserIds.length} already swiped)`);
        } catch (e) {
            console.error('Error loading candidates:', e);
        }
    },

    async resetCandidateSwipe() {
        this.currentCandidateIndex = 0;
        this.candidatesDeck = [];
        document.getElementById('noMoreCandidates').style.display = 'none';
        document.getElementById('candidateSwipeDeck').style.justifyContent = 'center';
        await this.loadCandidatesFromBackend();
        this.renderCandidateCard();
    },

    renderCandidateCard() {
        const deck = document.getElementById('candidateSwipeDeck');
        const candidate = this.candidatesDeck[this.currentCandidateIndex];

        // Clear previous card
        const existingCard = document.getElementById('activeCandidateCard');
        if (existingCard) existingCard.remove();

        // Shadow cards
        const s1 = document.getElementById('companyCardShadow1');
        const s2 = document.getElementById('companyCardShadow2');

        if (!candidate) {
            document.getElementById('noMoreCandidates').style.display = 'flex';
            const controls = document.getElementById('swipeControls');
            if (controls) controls.style.display = 'none';
            if (s1) s1.style.display = 'none';
            if (s2) s2.style.display = 'none';
            return;
        }

        const controls = document.getElementById('swipeControls');
        if (controls) controls.style.display = 'flex';
        if (s1) s1.style.display = 'block';
        if (s2) s2.style.display = 'block';

        const imageUrl = candidate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=1392ec&color=fff&size=600`;
        const skillsHtml = (candidate.skills || []).slice(0, 3).map(s =>
            `<span style="padding: 6px 12px; background: #f9fafb; border: 1px solid #f3f4f6; color: #4b5563; border-radius: 8px; font-size: 12px; font-weight: 500;">${s}</span>`
        ).join('');

        const card = document.createElement('div');
        card.id = 'activeCandidateCard';
        card.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3; background: white; border-radius: 24px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #e5e7eb; box-shadow: 0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04); transition: transform 0.3s ease, opacity 0.3s ease; transform-origin: bottom center; ring: 1px solid #f3f4f6;';

        const salaryText = candidate.salary ? `<span style="color: #18181b; font-weight: 700; font-size: 18px; letter-spacing: -0.025em;">${candidate.salary}</span><span style="color: #9ca3af; font-size: 12px; font-weight: 500;">/año</span>` : '';

        card.innerHTML = `
            <div style="position: relative; height: 60%; width: 100%; background: #f3f4f6;">
                <img src="${imageUrl}" alt="${candidate.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease;">
                <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, transparent 60%, rgba(255,255,255,0.2));"></div>
                <!-- Location badge -->
                <div style="position: absolute; top: 16px; left: 16px; background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.4); color: #18181b; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <span class="material-icons" style="font-size: 16px;">location_on</span>
                    ${candidate.location || 'Remoto'}
                </div>
                <!-- Match badge -->
                <div style="position: absolute; top: 16px; right: 16px; background: linear-gradient(135deg, #1392ec, #0b6cb3); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; box-shadow: 0 4px 8px rgba(19,146,236,0.3); display: flex; align-items: center; gap: 4px;">
                    <span class="material-icons" style="font-size: 16px;">auto_awesome</span>
                    ${candidate.fit}% Match
                </div>
            </div>
            <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; position: relative; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <h2 style="font-size: 22px; font-weight: 700; color: #18181b; display: flex; align-items: center; gap: 8px; margin: 0;">
                            ${candidate.name} <span style="font-size: 16px; font-weight: 400; color: #9ca3af;">${candidate.exp ? candidate.exp.replace(' años', 'a') : ''}</span>
                        </h2>
                        <p style="color: #1392ec; font-weight: 500; margin-top: 2px; font-size: 14px;">${candidate.role || 'Profesional'}</p>
                    </div>
                    ${salaryText ? `<div style="display: flex; flex-direction: column; align-items: flex-end;">${salaryText}</div>` : ''}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; margin-bottom: 16px;">
                    ${skillsHtml}
                </div>
                <p style="color: #71717a; font-size: 14px; line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.6; padding-right: 32px;">
                    ${candidate.bio || ''}
                </p>
                <button onclick="event.stopPropagation(); app.openCardDetail('candidate')" style="position: absolute; bottom: 16px; right: 16px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #9ca3af; background: none; border: 1px solid transparent; border-radius: 50%; cursor: pointer; transition: all 0.2s;">
                    <span class="material-icons">info</span>
                </button>
            </div>
        `;

        deck.appendChild(card);
    },

    async handleSwipe(direction) {
        const card = document.getElementById('activeCandidateCard');
        if (!card) return;

        const candidate = this.candidatesDeck[this.currentCandidateIndex];

        // Animate Swipe
        if (direction === 'left') {
            card.style.transform = 'translateX(-120%) rotate(-20deg)';
            // Record left swipe in DB
            if (candidate && candidate.id && window.talentlyBackend && window.talentlyBackend.isReady) {
                window.talentlyBackend.swipes.create(candidate.id, 'left').catch(e => console.warn('Swipe record error:', e));
            }
        } else {
            card.style.transform = 'translateX(120%) rotate(20deg)';
            await this.handleMatch(candidate);
        }
        card.style.opacity = '0';

        setTimeout(() => {
            this.currentCandidateIndex++;
            this.renderCandidateCard();
        }, 300);
    },

    handleSuperSwipe() {
        // Super like = regular right swipe with visual feedback
        this.showToast('Super Like enviado!', 'success');
        this.handleSwipe('right');
    },

    // ===== CHAT & MATCH LOGIC =====
    companyConversations: [], // Loaded from DB matches
    companyNotifications: [], // Match notifications for company
    activeConversationId: null,
    currentMatchCandidate: null, // For modal

    async handleMatch(candidate) {
        if (!candidate || !candidate.id) return;

        this.currentMatchCandidate = candidate;

        if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
            this.showToast('Backend no disponible');
            return;
        }

        try {
            // Create RIGHT swipe in DB and check for mutual match
            const result = await window.talentlyBackend.swipes.create(candidate.id, 'right');

            if (result.error) {
                console.error('Company swipe error:', result.error);
                this.showToast('Error al registrar interés');
                return;
            }

            window.talentlyBackend.statistics.increment('swipes_given').catch(e => console.warn('Stats error:', e));

            if (result.isMutualMatch) {
                // MUTUAL MATCH! Create real match in DB
                const matchResult = await window.talentlyBackend.matches.create(candidate.id);

                if (matchResult.error && !matchResult.alreadyExists) {
                    console.error('Match creation error:', matchResult.error);
                    this.showToast('Error al crear match');
                    return;
                }

                const matchId = matchResult.data ? matchResult.data.id : null;

                // Show Match Modal
                document.getElementById('matchCandidateName').textContent = candidate.name;
                const candidateImg = candidate.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(candidate.name);
                document.getElementById('matchCandidateImage').src = candidateImg;
                document.getElementById('matchCompanyLogo').src = this.companyProfile?.logo_url || this.companyProfile?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.companyProfile?.name || 'E')}&background=1392ec&color=fff`;
                document.getElementById('matchModal').style.display = 'flex';

                // Add to local company conversations (backed by real match)
                if (matchId && !this.companyConversations.find(c => c.matchId === matchId)) {
                    this.companyConversations.unshift({
                        id: matchId, // Use real match ID
                        matchId: matchId,
                        candidateId: candidate.id,
                        candidateName: candidate.name,
                        candidateImage: candidateImg,
                        role: candidate.role,
                        lastMessage: '¡Nuevo Match!',
                        timestamp: 'Ahora',
                        unread: 0,
                        messages: []
                    });
                    this.renderConversationsList();
                }

                window.talentlyBackend.statistics.increment('matches_count').catch(e => console.warn('Stats error:', e));
                this.showToast('¡Es un Match! Ambos tienen interés mutuo.');

                // Add company notification
                this.companyNotifications.unshift({
                    id: matchId,
                    name: candidate.name,
                    image: candidateImg,
                    matchDate: new Date().toISOString(),
                    hasUnread: true
                });
                this.renderCompanyNotifications();
                this.updateCompanyNotifBadge();
            } else {
                // One-sided interest only
                this.showToast('Interés registrado. Si el candidato también te elige, harán Match.');
            }
        } catch (e) {
            console.error('HandleMatch error:', e);
            this.showToast('Error al procesar');
        }
    },

    renderCompanyNotifications() {
        const list = document.getElementById('companyNotificationList');
        if (!list) return;

        const allNotifs = this.companyNotifications || [];
        if (allNotifs.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 60px 24px; color: #9ca3af;">
                    <span class="material-icons" style="font-size: 48px; color: #d1d5db; margin-bottom: 12px; display: block;">notifications_none</span>
                    <p style="font-size: 14px; font-weight: 500;">No tienes notificaciones</p>
                </div>`;
            return;
        }

        // Group notifications by date
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

        const groups = { today: [], yesterday: [], week: [], older: [] };
        allNotifs.forEach(n => {
            const d = n.matchDate ? new Date(n.matchDate) : now;
            if (d >= today) groups.today.push(n);
            else if (d >= yesterday) groups.yesterday.push(n);
            else if (d >= weekAgo) groups.week.push(n);
            else groups.older.push(n);
        });

        const sectionHeader = (label) => `
            <div style="position: sticky; top: 0; z-index: 10; background: rgba(248,249,250,0.95); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 10px 16px; border-bottom: 1px solid #f3f4f6;">
                <h3 style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af;">${label}</h3>
            </div>`;

        const renderRow = (notif) => {
            const safeName = (notif.name || 'Candidato').replace(/'/g, "\\'");
            const safeId = (notif.id || '').toString().replace(/'/g, "\\'");
            const isUnread = notif.hasUnread;
            const bgColor = isUnread ? '#f0f9ff' : '#ffffff';
            const d = notif.matchDate ? new Date(notif.matchDate) : now;

            // Time label
            let timeLabel;
            const diffMs = now - d;
            const diffMin = Math.floor(diffMs / 60000);
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMin < 1) timeLabel = 'Ahora';
            else if (diffMin < 60) timeLabel = `${diffMin}m`;
            else if (diffHrs < 24) timeLabel = `${diffHrs}h`;
            else timeLabel = `${diffDays}d`;

            // Notification type: match (green heart badge), message (blue chat badge), offer update (indigo work badge)
            const type = notif.type || 'match';
            let avatarHtml, badgeHtml, titleText, bodyText;

            if (type === 'message') {
                avatarHtml = notif.image
                    ? `<img src="${notif.image}" alt="${safeName}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb;">`
                    : `<div style="width: 48px; height: 48px; border-radius: 50%; background: #1392ec; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700;">${(notif.name || 'C')[0]}</div>`;
                badgeHtml = `<div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 10px; color: #ffffff;">chat_bubble</span></div>`;
                titleText = 'Nuevo Mensaje';
                bodyText = notif.preview || `Mensaje de <span style="font-weight: 600; color: #111827;">${safeName}</span>`;
            } else if (type === 'offer_update') {
                avatarHtml = `<div style="width: 48px; height: 48px; border-radius: 50%; background: #eef2ff; border: 1px solid #e0e7ff; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 24px; color: #4f46e5;">work</span></div>`;
                badgeHtml = `<div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #6366f1; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 10px; color: #ffffff;">auto_graph</span></div>`;
                titleText = 'Actualización de Oferta';
                bodyText = notif.preview || 'Tu oferta ha recibido nuevos interesados.';
            } else if (type === 'offer_expiring') {
                avatarHtml = `<div style="width: 48px; height: 48px; border-radius: 50%; background: #fff7ed; border: 1px solid #ffedd5; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 24px; color: #ea580c;">warning</span></div>`;
                badgeHtml = `<div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #f97316; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 10px; color: #ffffff;">priority_high</span></div>`;
                titleText = 'Oferta por expirar';
                bodyText = notif.preview || 'Una de tus ofertas expirará pronto.';
            } else {
                // Default: match
                avatarHtml = notif.image
                    ? `<img src="${notif.image}" alt="${safeName}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #e5e7eb;">`
                    : `<div style="width: 48px; height: 48px; border-radius: 50%; background: #1392ec; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: 700;">${(notif.name || 'C')[0]}</div>`;
                badgeHtml = `<div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; border-radius: 50%; background: #22c55e; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 10px; color: #ffffff;">favorite</span></div>`;
                titleText = 'Nuevo Match';
                bodyText = `Has hecho match con <span style="font-weight: 600; color: #111827;">${safeName}</span>.`;
            }

            return `
            <div style="position: relative; display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; background: ${bgColor}; cursor: pointer; transition: background 0.15s;"
                 onclick="app.markCompanyNotifRead('${safeId}'); app.closeNotifications(); app.showCompanySection('companyMessagesSection');"
                 onmouseover="this.style.background='${isUnread ? '#e0f2fe' : '#f9fafb'}'"
                 onmouseout="this.style.background='${bgColor}'">
                ${isUnread ? `<div style="position: absolute; right: 16px; top: 16px; width: 9px; height: 9px; border-radius: 50%; background: #1392ec; box-shadow: 0 0 0 2px rgba(19,146,236,0.2);"></div>` : ''}
                <div style="position: relative; flex-shrink: 0;">
                    ${avatarHtml}
                    ${badgeHtml}
                </div>
                <div style="flex: 1; padding-right: 20px; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #111827;">${titleText}</p>
                        <span style="font-size: 12px; color: #9ca3af; font-weight: 500; flex-shrink: 0;">${timeLabel}</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${bodyText}</p>
                </div>
            </div>`;
        };

        let html = '';
        if (groups.today.length > 0) {
            html += sectionHeader('Hoy');
            html += groups.today.map(renderRow).join('');
        }
        if (groups.yesterday.length > 0) {
            html += sectionHeader('Ayer');
            html += groups.yesterday.map(renderRow).join('');
        }
        if (groups.week.length > 0) {
            html += sectionHeader('Esta semana');
            html += groups.week.map(renderRow).join('');
        }
        if (groups.older.length > 0) {
            html += sectionHeader('Anteriores');
            html += groups.older.map(renderRow).join('');
        }

        html += `<div style="height: 40px; display: flex; align-items: center; justify-content: center; margin-top: 16px;"><span style="font-size: 12px; color: #9ca3af; font-weight: 500;">No hay más notificaciones anteriores</span></div>`;

        list.innerHTML = html;
    },

    updateCompanyNotifBadge() {
        // Combine: unread match notifications + unread messages from conversations
        const notifCount = (this.companyNotifications || []).filter(n => n.hasUnread).length;
        const msgCount = (this.companyConversations || []).reduce((sum, c) => sum + (c.unread || 0), 0);
        const count = notifCount + msgCount;
        console.log('[DEBUG] updateCompanyNotifBadge: notifCount =', notifCount, 'msgCount =', msgCount, 'total =', count);
        // Update the bell badge in company header
        const badges = document.querySelectorAll('#companyApp .icon-btn .badge');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    },

    markCompanyNotifRead(notifId) {
        const notif = (this.companyNotifications || []).find(n => n.id === notifId);
        if (notif) notif.hasUnread = false;
        this.renderCompanyNotifications();
        this.updateCompanyNotifBadge();
    },

    closeMatchModal() {
        document.getElementById('matchModal').style.display = 'none';
        this.currentMatchCandidate = null;
    },

    startChatFromMatch() {
        if (!this.currentMatchCandidate) return;
        const candidate = this.currentMatchCandidate;
        this.closeMatchModal();

        // Find conversation by candidateId
        const conv = this.companyConversations.find(c => c.candidateId === candidate.id);
        if (conv) {
            this.showCompanySection('companyMessagesSection');
            this.openCompanyChat(conv.id);
        }
    },

    createConversationStart(candidate) {
        this.handleMatch(candidate);
    },

    async renderConversationsList() {
        const list = document.getElementById('companyConversationList');
        if (!list) return;

        // Load matches from DB if conversations are empty
        if (this.companyConversations.length === 0 && window.talentlyBackend && window.talentlyBackend.isReady) {
            await this._loadCompanyMatches();
        }

        // Render new matches horizontal row
        this._renderNewMatches();

        if (this.companyConversations.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 48px 20px;">
                    <span class="material-icons" style="font-size: 48px; color: #d1d5db; margin-bottom: 12px;">chat_bubble_outline</span>
                    <p style="font-size: 15px; color: #6b7280; font-weight: 600; margin: 0;">No tienes mensajes aún.</p>
                    <p style="font-size: 13px; color: #9ca3af; margin: 8px 0 20px;">Explora candidatos y cuando ambos muestren interés, se creará un Match.</p>
                    <button onclick="app.showCompanySection('companySearchSection')"
                        style="padding: 10px 24px; background: #1392ec; color: #ffffff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; box-shadow: 0 2px 8px rgba(19,146,236,0.25); transition: all 0.2s;"
                        onmouseenter="this.style.background='#0b6cb3'"
                        onmouseleave="this.style.background='#1392ec'">
                        Ir a Explorar
                    </button>
                </div>
            `;
            return;
        }

        // Apply search filter
        const query = (document.getElementById('msgSearchInput')?.value || '').trim().toLowerCase();
        let convs = this.companyConversations;
        if (query) {
            convs = convs.filter(c =>
                (c.candidateName || '').toLowerCase().includes(query) ||
                (c.role || '').toLowerCase().includes(query) ||
                (c.offerTitle || '').toLowerCase().includes(query)
            );
        }

        if (convs.length === 0 && query) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <span class="material-icons" style="font-size: 40px; color: #d1d5db; margin-bottom: 8px;">search_off</span>
                    <p style="font-size: 14px; color: #9ca3af; margin: 0;">No se encontraron resultados para "${query}"</p>
                </div>`;
            return;
        }

        // Tag color palette for offer badges
        const tagColors = [
            { bg: '#eff6ff', color: '#1d4ed8', border: 'rgba(29,78,216,0.1)' },
            { bg: '#faf5ff', color: '#7c3aed', border: 'rgba(124,58,237,0.1)' },
            { bg: '#ecfdf5', color: '#059669', border: 'rgba(5,150,105,0.1)' },
            { bg: '#fff7ed', color: '#c2410c', border: 'rgba(194,65,12,0.1)' },
            { bg: '#fdf2f8', color: '#db2777', border: 'rgba(219,39,119,0.1)' }
        ];

        list.innerHTML = convs.map((conv, idx) => {
            const img = conv.candidateImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.candidateName)}&background=e2e8f0&color=64748b`;
            const isUnread = conv.unread > 0;
            const hasOnline = conv.isOnline;
            const tagColor = tagColors[idx % tagColors.length];
            const offerLabel = conv.offerTitle || conv.role || '';
            const timeColor = isUnread ? '#1392ec' : '#94a3b8';
            const timeWeight = isUnread ? '500' : '400';

            return `
            <div onclick="app.openCompanyChat('${conv.id}')"
                style="display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; margin: 0 -4px; padding-left: 4px; padding-right: 4px; border-radius: 8px;"
                onmouseenter="this.style.background='#f8fafc'"
                onmouseleave="this.style.background='transparent'">
                <!-- Avatar -->
                <div style="position: relative; flex-shrink: 0; padding-top: 2px;">
                    <img src="${img}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; background: #e2e8f0; ${isUnread ? 'border: 2px solid #1392ec; padding: 2px;' : ''}">
                </div>
                <!-- Content -->
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
                        <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${conv.candidateName}</h3>
                        <span style="font-size: 11px; font-weight: ${timeWeight}; color: ${timeColor}; flex-shrink: 0; margin-left: 8px;">${conv.timestamp || ''}</span>
                    </div>
                    ${conv.role ? `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 5px;">
                        <span style="font-size: 11px; font-weight: 500; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 100px;">${conv.role}</span>
                    </div>` : ''}
                    <p style="margin: 0; font-size: 13px; color: ${isUnread ? '#0f172a' : '#64748b'}; font-weight: ${isUnread ? '600' : '400'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${conv.lastMessage || '¡Nuevo Match! Saluda ahora.'}
                    </p>
                </div>
                <!-- Offer Tag -->
                ${offerLabel ? `
                <div style="flex-shrink: 0; align-self: flex-start; margin-left: 8px; margin-top: 2px;">
                    <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: ${tagColor.bg}; color: ${tagColor.color}; border: 1px solid ${tagColor.border};">
                        ${offerLabel}
                    </span>
                </div>` : ''}
            </div>`;
        }).join('');
    },

    filterCompanyConversations() {
        this.renderConversationsList();
    },

    _renderNewMatches() {
        const section = document.getElementById('msgNewMatchesSection');
        const container = document.getElementById('msgNewMatchesList');
        if (!section || !container) return;

        // Show recent matches (conversations with no messages or very recent)
        const recentMatches = this.companyConversations.filter(c =>
            !c.lastMessage || c.lastMessage === '¡Nuevo Match! Saluda ahora.' ||
            (c.timestamp && (c.timestamp === 'Ahora' || c.timestamp.includes('min')))
        ).slice(0, 8);

        // Also show all matches if we have any conversations
        const allForAvatars = this.companyConversations.slice(0, 8);
        const matchesToShow = recentMatches.length > 0 ? recentMatches : allForAvatars;

        if (matchesToShow.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        container.innerHTML = matchesToShow.map(conv => {
            const img = conv.candidateImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.candidateName)}&background=e2e8f0&color=64748b`;
            const firstName = (conv.candidateName || 'User').split(' ')[0];
            const isNew = !conv.lastMessage || conv.lastMessage === '¡Nuevo Match! Saluda ahora.';
            const ringStyle = isNew
                ? 'border: 2px solid #1392ec; padding: 2px;'
                : 'border: 2px solid transparent; padding: 2px;';

            return `
            <div onclick="app.openCompanyChat('${conv.id}')"
                style="display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 72px; cursor: pointer;">
                <div style="position: relative;">
                    <div style="width: 68px; height: 68px; border-radius: 50%; ${ringStyle} box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                        <img src="${img}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff;">
                    </div>
                </div>
                <span style="font-size: 11px; font-weight: ${isNew ? '600' : '500'}; color: ${isNew ? '#334155' : '#94a3b8'}; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${firstName}</span>
            </div>`;
        }).join('');
    },

    // Load matches from DB for company conversations
    async _loadCompanyMatches() {
        try {
            const { data: matches, error } = await window.talentlyBackend.matches.get();
            if (error || !matches || matches.length === 0) return;

            const userId = (await window.supabaseClient.auth.getUser()).data.user?.id;
            if (!userId) return;

            for (const match of matches) {
                const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;

                // Try to get candidate profile
                let name = 'Candidato';
                let image = null;
                let role = '';

                try {
                    const { data: profile } = await window.talentlyBackend.profiles.getById(otherUserId);
                    if (profile) {
                        name = profile.name || 'Candidato';
                        image = profile.avatar_url || profile.image || null;
                        role = profile.current_position || profile.title || '';
                    }
                } catch (e) { /* ignore */ }

                // Get last message
                let lastMessage = '¡Nuevo Match! Saluda ahora.';
                let timestamp = new Date(match.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
                try {
                    const { data: msgs } = await window.talentlyBackend.matches.getMessages(match.id);
                    if (msgs && msgs.length > 0) {
                        const last = msgs[msgs.length - 1];
                        lastMessage = last.sender_id === userId ? `Tú: ${last.content}` : last.content;
                        timestamp = new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                } catch (e) { /* ignore */ }

                if (!this.companyConversations.find(c => c.matchId === match.id)) {
                    this.companyConversations.push({
                        id: match.id,
                        matchId: match.id,
                        candidateId: otherUserId,
                        candidateName: name,
                        candidateImage: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
                        role: role,
                        lastMessage: lastMessage,
                        timestamp: timestamp,
                        unread: 0,
                        messages: [] // Loaded on demand when chat is opened
                    });
                }
            }
            // Note: real-time subscription is set up once in enterMainApp(), not here
        } catch (e) {
            console.error('Error loading company matches:', e);
        }
    },

    _subscribeToAllCompanyMatches() {
        // Unsubscribe previous global subscription
        if (this._companyGlobalMsgSub) {
            this._companyGlobalMsgSub.unsubscribe();
            this._companyGlobalMsgSub = null;
        }

        if (!window.supabaseClient) {
            console.log('[DEBUG] _subscribeToAllCompanyMatches: no supabaseClient');
            return;
        }

        console.log('[DEBUG] _subscribeToAllCompanyMatches: subscribing to all messages for company');

        // Single global subscription to ALL new messages
        this._companyGlobalMsgSub = window.supabaseClient
            .channel('company-all-messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const newMsg = payload.new;
                const userId = (await window.supabaseClient.auth.getUser()).data.user?.id;
                console.log('[DEBUG] Company received message event:', newMsg.match_id, 'sender:', newMsg.sender_id, 'myId:', userId);
                if (!userId || newMsg.sender_id === userId) return; // Skip own messages

                const matchId = newMsg.match_id;

                // Find existing conversation
                let conv = this.companyConversations.find(c => c.matchId === matchId);
                console.log('[DEBUG] Found conversation for matchId?', matchId, !!conv);

                if (!conv) {
                    // New match we don't know about yet — reload matches
                    console.log('[DEBUG] Reloading company matches...');
                    await this._loadCompanyMatches();
                    conv = this.companyConversations.find(c => c.matchId === matchId);
                    console.log('[DEBUG] After reload, found conv?', !!conv);
                }

                if (conv) {
                    if (this.activeConversationId !== matchId) {
                        conv.unread = (conv.unread || 0) + 1;
                        console.log('[DEBUG] Incremented unread to:', conv.unread);
                    }
                    conv.lastMessage = newMsg.content;
                    conv.timestamp = 'Ahora';
                    this.renderConversationsList();
                    this.updateCompanyMessagesBadge();
                    this.updateCompanyNotifBadge();
                }
            })
            .subscribe((status) => {
                console.log('[DEBUG] Company messages subscription status:', status);
            });
    },

    _subscribeToCandidateMessages() {
        // Unsubscribe previous subscription
        if (this._candidateGlobalMsgSub) {
            this._candidateGlobalMsgSub.unsubscribe();
            this._candidateGlobalMsgSub = null;
        }

        if (!window.supabaseClient) {
            console.log('[DEBUG] _subscribeToCandidateMessages: no supabaseClient');
            return;
        }

        console.log('[DEBUG] _subscribeToCandidateMessages: subscribing to all messages for candidate');

        this._candidateGlobalMsgSub = window.supabaseClient
            .channel('candidate-all-messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const newMsg = payload.new;
                const userId = (await window.supabaseClient.auth.getUser()).data.user?.id;
                if (!userId || newMsg.sender_id === userId) return; // Skip own messages

                console.log('[DEBUG] Candidate received new message:', newMsg.match_id, 'from:', newMsg.sender_id);

                const matchId = newMsg.match_id;

                // Find existing match in candidate's matches list
                let matchEntry = (this.matches || []).find(m => String(m.id) === String(matchId));

                if (!matchEntry) {
                    // New match we don't know about yet — try to load it
                    console.log('[DEBUG] Match not found locally, reloading matches...');
                    await this.renderMatches(); // This loads from DB and re-renders
                    matchEntry = (this.matches || []).find(m => String(m.id) === String(matchId));
                }

                if (matchEntry) {
                    // Mark as unread if we're not currently in that chat
                    if (String(this.currentMatchId) !== String(matchId)) {
                        matchEntry.hasUnread = true;
                        console.log('[DEBUG] Marked match as unread:', matchId);
                    }
                    matchEntry.lastMessage = newMsg.content;
                    localStorage.setItem('talently_matches', JSON.stringify(this.matches));
                    this.updateBadge();
                    this.renderNotifications();
                } else {
                    console.log('[DEBUG] Could not find match entry for:', matchId);
                }
            })
            .subscribe((status) => {
                console.log('[DEBUG] Candidate messages subscription status:', status);
            });
    },

    async openCompanyChat(convId) {
        const conv = this.companyConversations.find(c => c.id === convId);
        if (!conv) {
            console.error('Conversation not found for id:', convId);
            return;
        }

        this.activeConversationId = convId;
        this._activeChatConv = conv;
        conv.unread = 0;
        this.renderConversationsList();
        this.updateCompanyMessagesBadge();

        // Setup Chat View header
        const nameEl = document.getElementById('companyChatName');
        const avatarEl = document.getElementById('companyChatAvatar');
        const statusEl = document.getElementById('companyChatOnlineStatus');
        const dotEl = document.getElementById('companyChatOnlineDot');

        if (nameEl) nameEl.textContent = conv.candidateName;
        if (avatarEl) avatarEl.src = conv.candidateImage;

        // Online status
        const isOnline = conv.isOnline;
        if (statusEl) {
            statusEl.textContent = isOnline ? 'Online' : 'Desconectado';
            statusEl.style.color = isOnline ? '#16a34a' : '#94a3b8';
        }
        if (dotEl) {
            dotEl.style.display = isOnline ? 'block' : 'none';
        }

        // Cambiar a vista de chat usando classList (no style.display)
        const listView = document.getElementById('messagesListView');
        const chatView = document.getElementById('messagesChatView');
        if (listView) { listView.classList.remove('active'); listView.style.display = ''; }
        if (chatView) { chatView.classList.add('active'); chatView.style.display = ''; }

        // Load messages from DB
        await this._loadCompanyChatMessages(conv);

        // Subscribe to new messages in real-time
        this._subscribeToCompanyChat(conv.matchId);
    },

    viewChatCandidateProfile() {
        const conv = this._activeChatConv;
        if (!conv || !conv.candidateId) return;
        // Show candidate profile if available
        if (typeof this.openCandidatePreview === 'function') {
            this.openCandidatePreview(conv.candidateId);
        }
    },

    _chatDateLabel(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer ' + time;
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) + ' ' + time;
    },

    _chatMsgBubble(msg, isMe, avatarUrl) {
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isMe) {
            return `
            <div style="display: flex; flex-direction: row-reverse; align-items: flex-end; gap: 10px; max-width: 85%; margin-left: auto;">
                <div style="display: flex; flex-direction: column; gap: 3px; align-items: flex-end;">
                    <div style="background: #1392ec; padding: 12px 16px; border-radius: 18px; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(19,146,236,0.1);">
                        <p style="margin: 0; font-size: 14px; font-weight: 400; line-height: 1.6; color: #ffffff; font-family: 'Inter', sans-serif;">${msg.content}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; margin-right: 4px;">
                        <span style="font-size: 11px; color: #94a3b8;">${time}</span>
                        <span class="material-icons" style="font-size: 14px; color: #1392ec;">done_all</span>
                    </div>
                </div>
            </div>`;
        } else {
            return `
            <div style="display: flex; align-items: flex-end; gap: 10px; max-width: 85%;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: #e2e8f0; background-image: url('${avatarUrl}'); background-size: cover; background-position: center; flex-shrink: 0;"></div>
                <div style="display: flex; flex-direction: column; gap: 3px;">
                    <div style="background: #f1f3f5; padding: 12px 16px; border-radius: 18px; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); border: 1px solid transparent;">
                        <p style="margin: 0; font-size: 14px; font-weight: 400; line-height: 1.6; color: #1e293b; font-family: 'Inter', sans-serif;">${msg.content}</p>
                    </div>
                    <span style="font-size: 11px; color: #94a3b8; margin-left: 4px;">${time}</span>
                </div>
            </div>`;
        }
    },

    async _loadCompanyChatMessages(conv) {
        const container = document.getElementById('companyChatMessages');
        if (!container) return;

        try {
            const { data: msgs } = await window.talentlyBackend.matches.getMessages(conv.matchId);
            const userId = (await window.supabaseClient.auth.getUser()).data.user?.id;
            const avatarUrl = conv.candidateImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.candidateName)}&background=e2e8f0&color=64748b`;

            let isChatBlocked = false;
            if (msgs && msgs.length > 0) {
                let html = '';
                let lastDateKey = '';

                msgs.forEach(msg => {
                    const isMe = msg.sender_id === userId;

                    // Detect system closure message
                    if (msg.content && msg.content.startsWith('[Sistema]') && msg.content.includes('cerrada')) {
                        isChatBlocked = true;
                    }

                    // Date separator
                    const msgDate = new Date(msg.created_at);
                    const dateKey = msgDate.toDateString();
                    if (dateKey !== lastDateKey) {
                        lastDateKey = dateKey;
                        const label = this._chatDateLabel(msg.created_at);
                        html += `
                        <div style="display: flex; justify-content: center; padding: 8px 0;">
                            <span style="font-size: 11px; font-weight: 500; color: #64748b; background: rgba(226,232,240,0.6); padding: 4px 12px; border-radius: 100px;">${label}</span>
                        </div>`;
                    }

                    html += this._chatMsgBubble(msg, isMe, avatarUrl);
                });

                container.innerHTML = html;
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px 24px; margin: 20px 0;">
                        <span class="material-icons" style="font-size: 40px; color: #d1d5db; margin-bottom: 10px;">waving_hand</span>
                        <p style="font-size: 15px; font-weight: 600; color: #64748b; margin: 0 0 4px; font-family: 'Inter', sans-serif;">¡Match creado!</p>
                        <p style="font-size: 13px; color: #94a3b8; margin: 0; font-family: 'Inter', sans-serif;">Envía el primer mensaje para iniciar la conversación.</p>
                    </div>
                `;
            }
            container.scrollTop = container.scrollHeight;

            // Block chat if offer was closed
            if (isChatBlocked) {
                this._blockChatInput('Esta conversación fue cerrada porque la oferta ya no está activa.');
            } else {
                this._unblockChatInput();
            }
        } catch (e) {
            console.error('Error loading messages:', e);
            container.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 14px; padding: 40px;">Error cargando mensajes</div>';
        }
    },

    _companyMessageSubscription: null,

    _subscribeToCompanyChat(matchId) {
        // Unsubscribe from previous
        if (this._companyMessageSubscription) {
            this._companyMessageSubscription.unsubscribe();
            this._companyMessageSubscription = null;
        }

        if (!window.talentlyBackend || !window.talentlyBackend.isReady) return;

        this._companyMessageSubscription = window.talentlyBackend.matches.subscribe(matchId, async (newMsg) => {
            const userId = (await window.supabaseClient.auth.getUser()).data.user?.id;
            if (newMsg.sender_id === userId) return; // Skip own messages

            // Add to UI if this chat is open
            if (this.activeConversationId === matchId) {
                const container = document.getElementById('companyChatMessages');
                if (container) {
                    const conv = this.companyConversations.find(c => c.matchId === matchId);
                    const avatarUrl = conv ? (conv.candidateImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.candidateName)}&background=e2e8f0&color=64748b`) : '';
                    const msgHtml = this._chatMsgBubble(newMsg, false, avatarUrl);
                    container.insertAdjacentHTML('beforeend', msgHtml);
                    container.scrollTop = container.scrollHeight;
                }
            }

            // Update conversation preview
            const conv = this.companyConversations.find(c => c.matchId === matchId);
            if (conv) {
                conv.lastMessage = newMsg.content;
                conv.timestamp = 'Ahora';
                if (this.activeConversationId !== matchId) {
                    conv.unread = (conv.unread || 0) + 1;
                }
                this.renderConversationsList();
                this.updateCompanyMessagesBadge();
            }
        });
    },

    updateCompanyMessagesBadge() {
        const badge = document.getElementById('companyMessagesBadge');
        if (!badge) {
            console.log('[DEBUG] updateCompanyMessagesBadge: badge element not found');
            return;
        }
        const totalUnread = (this.companyConversations || []).reduce((sum, c) => sum + (c.unread || 0), 0);
        console.log('[DEBUG] updateCompanyMessagesBadge: totalUnread =', totalUnread);
        if (totalUnread > 0) {
            badge.textContent = totalUnread > 9 ? '9+' : totalUnread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    },

    backToConversationsList() {
        // Unsubscribe from chat
        if (this._companyMessageSubscription) {
            this._companyMessageSubscription.unsubscribe();
            this._companyMessageSubscription = null;
        }
        this.activeConversationId = null;
        // Volver a lista de conversaciones usando classList (no style.display)
        const chatV = document.getElementById('messagesChatView');
        const listV = document.getElementById('messagesListView');
        if (chatV) { chatV.classList.remove('active'); chatV.style.display = ''; }
        if (listV) { listV.classList.add('active'); listV.style.display = ''; }
        this.renderConversationsList();
    },

    async sendCompanyMessage() {
        if (this._chatBlocked) return;
        const input = document.getElementById('companyChatInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text || !this.activeConversationId) return;

        const conv = this.companyConversations.find(c => c.id === this.activeConversationId);
        if (!conv || !conv.matchId) return;

        // Add to UI optimistically
        const container = document.getElementById('companyChatMessages');
        if (container) {
            const fakeMsg = { content: text, created_at: new Date().toISOString(), sender_id: 'me' };
            const msgHtml = this._chatMsgBubble(fakeMsg, true, '');
            container.insertAdjacentHTML('beforeend', msgHtml);
            container.scrollTop = container.scrollHeight;
        }

        // Update conversation preview
        conv.lastMessage = 'Tú: ' + text;
        conv.timestamp = 'Ahora';
        input.value = '';
        this.renderConversationsList();

        // Save to DB
        try {
            await window.talentlyBackend.matches.sendMessage(conv.matchId, text);
            window.talentlyBackend.statistics.increment('messages_sent').catch(e => console.warn('Stats error:', e));
        } catch (e) {
            console.error('Error sending message:', e);
            this.showToast('Error al enviar mensaje');
        }
    },

    searchCandidates() {
        const input = document.getElementById('candidateSearchInput');

        if (!input) {
            return;
        }

        const query = input.value.trim().toLowerCase();

        // FALLBACK DATA (HARDCODED)
        const localData = [
            { id: 1, name: 'Ana García', role: 'Senior React Developer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', skills: ['React', 'TypeScript', 'Redux', 'Node.js'], experience: '5 años', location: 'Santiago', match: 95 },
            { id: 2, name: 'Carlos Rodríguez', role: 'Full Stack Python Developer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', skills: ['Python', 'Django', 'React', 'AWS', 'Docker'], experience: '4 años', location: 'Remoto', match: 88 },
            { id: 3, name: 'Valentina Martínez', role: 'UX/UI Designer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', skills: ['Figma', 'Prototyping', 'User Research', 'HTML/CSS'], experience: '3 años', location: 'Buenos Aires', match: 92 },
            { id: 4, name: 'Felipe Soto', role: 'Backend Dev (Go)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', skills: ['Go', 'Microservices', 'Kubernetes'], experience: '6 años', location: 'Lima', match: 85 }
        ];

        let candidates = window.mockCandidates || [];
        if (candidates.length === 0) {
            candidates = localData;
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

                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

});
