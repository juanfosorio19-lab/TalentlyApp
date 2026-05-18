// ============================================
// MÓDULO: Swipe Candidato
// Talently — js/modules/swipe.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: setupSwipeGestures, undoSwipe, swipeLeft, swipeRight,
//          animateSwipe, _recordSwipe, addMatch, renderMatches,
//          viewOfferFromChat, openOfferDetails, closeOfferDetails,
//          swipeRightFromOffer, filterMatchConversations, loadOffers,
//          renderCard, renderProfile (swipe context), addExperience,
//          openEditSkills, closeEditSkills, renderEditSkillsSelected,
//          renderEditSkillsBubbles, addEditSkill, removeEditSkill,
//          openEditExperience, renderExpTimeline, saveExperience,
//          addEducation, openEditPersonal, closeEditPersonal,
//          handleEditPhotoUpload, saveEditPersonal, editPersonalInfo
// ============================================

Object.assign(app, {

    setupSwipeGestures() {
        const card = document.getElementById('currentCard');
        if (!card) return;

        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const threshold = 100;

        const updateStamps = (diff) => {
            const likeStamp = card.querySelector('.stamp-like');
            const nopeStamp = card.querySelector('.stamp-nope');
            const opacity = Math.min(Math.abs(diff) / threshold, 1);
            const scale = Math.min(Math.abs(diff) / threshold, 1);
            if (likeStamp) {
                likeStamp.style.opacity = diff > 20 ? opacity : '0';
                likeStamp.style.transform = `translateY(-50%) rotate(-20deg) scale(${diff > 20 ? scale : 0})`;
            }
            if (nopeStamp) {
                nopeStamp.style.opacity = diff < -20 ? opacity : '0';
                nopeStamp.style.transform = `translateY(-50%) rotate(20deg) scale(${diff < -20 ? scale : 0})`;
            }
        };

        const resetStamps = () => {
            const likeStamp = card.querySelector('.stamp-like');
            const nopeStamp = card.querySelector('.stamp-nope');
            if (likeStamp) { likeStamp.style.opacity = '0'; likeStamp.style.transform = 'translateY(-50%) rotate(-20deg) scale(0)'; }
            if (nopeStamp) { nopeStamp.style.opacity = '0'; nopeStamp.style.transform = 'translateY(-50%) rotate(20deg) scale(0)'; }
        };

        // Touch Events
        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            card.style.transition = 'none';
        });

        card.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            card.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
            updateStamps(diff);
        });

        card.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            card.style.transition = 'transform 0.3s ease';

            const diff = currentX - startX;
            if (diff > threshold) {
                this.swipeRight();
            } else if (diff < -threshold) {
                this.swipeLeft();
            } else {
                card.style.transform = 'translateX(0) rotate(0)';
                resetStamps();
            }
        });

        // Mouse Events (for desktop testing)
        card.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            card.style.transition = 'none';
            card.style.cursor = 'grabbing';
        });

        // Remove previous document listeners to avoid duplicates
        if (this._onMouseMove) document.removeEventListener('mousemove', this._onMouseMove);
        if (this._onMouseUp) document.removeEventListener('mouseup', this._onMouseUp);

        this._onMouseMove = (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
            const diff = currentX - startX;
            const cardEl = document.getElementById('currentCard');
            if (cardEl) {
                cardEl.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
                updateStamps(diff);
            }
        };

        this._onMouseUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            const cardEl = document.getElementById('currentCard');
            if (cardEl) {
                cardEl.style.transition = 'transform 0.3s ease';
                cardEl.style.cursor = 'grab';

                const diff = e.clientX - startX;
                if (diff > threshold) {
                    this.swipeRight();
                } else if (diff < -threshold) {
                    this.swipeLeft();
                } else {
                    cardEl.style.transform = 'translateX(0) rotate(0)';
                    resetStamps();
                }
            }
        };

        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    },

    // ... setupSwipeGestures (unchanged) ...

    undoSwipe() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderCard();
            this.showToast('Perfil anterior recuperado', 'info');
        } else {
            this.showToast('No hay perfiles anteriores');
        }
    },

    swipeLeft() {
        const profile = this.currentProfileData || this.profiles[this.currentIndex];
        if (profile && profile.id) {
            this._recordSwipe(profile.id);
            // Also record left swipe in DB (for analytics, won't trigger match)
            const targetId = profile.userId || profile.id;
            if (typeof targetId === 'string' && targetId.includes('-') && window.talentlyBackend && window.talentlyBackend.isReady) {
                window.talentlyBackend.swipes.create(targetId, 'left', profile.id).catch(e => console.warn('Swipe record error:', e));
            }
        }
        this.animateSwipe('left');
    },

    async swipeRight() {
        const profile = this.currentProfileData || this.profiles[this.currentIndex];

        if (profile) {
            // Record swipe locally so this offer never reappears in this session
            if (profile.id) {
                this._recordSwipe(profile.id);
            }

            // Use userId (Company's auth user ID) for swipe target
            const targetId = profile.userId || profile.id;
            const isReal = typeof targetId === 'string' && targetId.includes('-');

            if (isReal && window.talentlyBackend && window.talentlyBackend.isReady) {
                try {
                    // Create SWIPE (not match) - mutual matching system
                    const result = await window.talentlyBackend.swipes.create(targetId, 'right', profile.id);

                    if (result.error) {
                        console.error('Swipe Error:', result.error);
                        this.showToast('¡Te interesa esta oferta!');
                    } else if (result.isMutualMatch) {
                        // Both sides swiped right! Create the real match
                        const matchResult = await window.talentlyBackend.matches.create(targetId);
                        if (matchResult.error && !matchResult.alreadyExists) {
                            console.error('Match creation error:', matchResult.error);
                        }

                        this.showToast('¡Es un Match! Ambos tienen interés mutuo.');

                        // Add to local matches for notification + chat
                        const matchId = matchResult.data ? matchResult.data.id : `temp-${Date.now()}`;
                        const matchEntry = {
                            id: matchId,
                            name: profile.company || profile.name || 'Empresa',
                            image: profile.logo || profile.image || null,
                            company_name: profile.company || '',
                            otherUserId: targetId,
                            matchDate: new Date().toISOString(),
                            hasUnread: true,
                            lastMessage: '¡Nuevo Match! Saluda ahora.',
                            isReal: true
                        };
                        if (!this.matches) this.matches = [];
                        this.matches.unshift(matchEntry);
                        localStorage.setItem('talently_matches', JSON.stringify(this.matches));
                        this.updateBadge();

                        window.talentlyBackend.statistics.increment('matches_count').catch(e => console.warn('Stats error:', e));
                    } else {
                        // Only one-sided interest registered
                        this.showToast('¡Interés registrado! Si la empresa también te elige, harán Match.');
                    }

                    window.talentlyBackend.statistics.increment('swipes_given').catch(e => console.warn('Stats error:', e));
                } catch (e) {
                    console.error('Swipe Error', e);
                    this.showToast('¡Te interesa esta oferta!');
                }
            } else {
                this.addMatch(profile);
            }
        }
        this.animateSwipe('right');
    },

    _recordSwipe(offerId) {
        const swipedIds = JSON.parse(localStorage.getItem('talently_swiped_offers') || '[]');
        if (!swipedIds.includes(offerId)) {
            swipedIds.push(offerId);
            localStorage.setItem('talently_swiped_offers', JSON.stringify(swipedIds));
        }
    },

    addMatch(profile) {
        // Prevent duplicates
        if (!this.matches.find(m => m.id === profile.id)) {
            const match = {
                ...profile,
                matchDate: new Date().toISOString(),
                hasUnread: true,
                lastMessage: "¡Nuevo Match! Saluda ahora."
            };
            this.matches.unshift(match);
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.showToast('¡Es un Match!');
            this.updateBadge();
        }
    },

    async renderMatches() {

        // PREPARATION: Get current user ID to know who the "other" person is
        let myId = null;
        if (window.supabaseClient) {
            const { data } = await window.supabaseClient.auth.getUser();
            if (data && data.user) myId = data.user.id;
        }

        // 1. Local Matches (Mocks or temporary)
        // Ensure we preserve the structure of local matches
        let finalMatches = (this.matches || []).map(m => ({
            ...m,
            // Ensure local matches have these fields for consistency
            otherUserId: m.otherUserId || null,
            isReal: !!m.isReal,
            lastMessage: m.lastMessage || ''
        }));

        // 2. Fetch Real Matches from Backend
        if (window.talentlyBackend && window.talentlyBackend.isReady && myId) {
            const { data, error } = await window.talentlyBackend.matches.get();
            if (data && data.length > 0) {
                // Enrich matches with Profile Data
                const realMatches = await Promise.all(data.map(async (m) => {
                    const otherUserId = m.user_id_1 === myId ? m.user_id_2 : m.user_id_1;

                    // Fetch Profile of the other user (try profiles table first, then companies)
                    let otherProfile = null;
                    let name = 'Usuario';
                    let image = null;
                    try {
                        const { data: profileData } = await window.talentlyBackend.profiles.getById(otherUserId);
                        if (profileData) {
                            otherProfile = profileData;
                            name = profileData.name || profileData.company_name || 'Usuario';
                            image = profileData.image || profileData.avatar || null;
                        }
                    } catch (e) { /* ignore */ }

                    // If not found in profiles, check companies table
                    if (!otherProfile) {
                        try {
                            const { data: companyData } = await window.talentlyBackend.companies.getById(otherUserId);
                            if (companyData) {
                                name = companyData.name || 'Empresa';
                                image = companyData.logo_url || null;
                            }
                        } catch (e) { /* ignore */ }
                    }

                    // Fetch Last Message
                    let lastMsg = '';
                    try {
                        // FIX: Only fetch messages if ID is valid UUID
                        if (typeof m.id === 'string' && m.id.includes('-')) {
                            const { data: msgs } = await window.talentlyBackend.matches.getMessages(m.id);
                            if (msgs && msgs.length > 0) {
                                const last = msgs[msgs.length - 1];
                                lastMsg = last.content;
                            }
                        }
                    } catch (e) { }

                    return {
                        id: m.id,
                        name: name || 'Usuario',
                        image: image,
                        lastMessage: lastMsg,
                        otherUserId: otherUserId,
                        isReal: true
                    };
                }));

                // Merge: Add real matches to final list
                // To avoid duplicates, we can check if a match with same 'otherUserId' or 'id' exists.
                realMatches.forEach(rm => {
                    const exists = finalMatches.find(fm => fm.id === rm.id); // Check by ID
                    if (!exists) {
                        finalMatches.push(rm);
                    }
                });
            }
        }

        // Remove duplicates by ID just in case
        const seen = new Set();
        finalMatches = finalMatches.filter(m => {
            if (!m.id) return false; // Skip invalid matches without ID
            const duplicate = seen.has(m.id);
            seen.add(m.id);
            return !duplicate;
        });

        // Sync back to this.matches so subscriptions can find matches by ID
        this.matches = finalMatches;

        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        // Render Horizontal Matches Row (Stitch)
        const matchesRow = document.getElementById('matchesRow');
        const matchesBadge = document.getElementById('newMatchesBadge');
        if (matchesRow) {
            if (finalMatches.length === 0) {
                matchesRow.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; color: #94a3b8; font-size: 14px; padding: 20px 0; width: 100%;"><span class="material-icons" style="font-size: 36px; color: #cbd5e1;">people_outline</span>No tienes matches aún</div>';
                if (matchesBadge) matchesBadge.style.display = 'none';
            } else {
                if (matchesBadge) {
                    const newMatchesCount = finalMatches.filter(m => !m.lastMessage || m.lastMessage.includes('Match!')).length;
                    if (newMatchesCount > 0) {
                        matchesBadge.textContent = newMatchesCount + (newMatchesCount === 1 ? ' Nuevo' : ' Nuevos');
                        matchesBadge.style.display = 'inline-block';
                    } else {
                        matchesBadge.style.display = 'none';
                    }
                }
                matchesRow.innerHTML = finalMatches.map((match, idx) => {
                    const safeName = escapeHtml(match.name || 'Usuario');
                    const safeId = escapeHtml(String(match.id));
                    const imgUrl = match.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=1392ec&color=fff`;
                    const isNew = !match.lastMessage || match.lastMessage.includes('Match!') || !!match.hasUnread;
                    const borderStyle = isNew
                        ? 'border: 2px solid #1392ec; padding: 2px; border-radius: 50%; box-shadow: 0 2px 8px rgba(19,146,236,0.15);'
                        : 'border: 2px solid transparent; padding: 2px; border-radius: 50%;';
                    const nameWeight = isNew ? 'font-weight: 600; color: #0f172a;' : 'font-weight: 500; color: #64748b;';

                    return `
                    <div onclick="app.openChat('${safeId}', '${safeName}')" style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 72px; cursor: pointer;">
                        <div style="position: relative; ${borderStyle}">
                            <div style="width: 68px; height: 68px; background: #f8fafc; border-radius: 50%; border: 2px solid white; overflow: hidden;">
                                <img src="${imgUrl}" alt="${safeName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                            </div>
                        </div>
                        <p style="font-size: 12px; ${nameWeight} text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; margin: 0;">${safeName}</p>
                    </div>`;
                }).join('');
            }
        }

        // Render Conversation List (Stitch)
        const conversationList = document.getElementById('conversationsList');
        if (conversationList) {
            if (finalMatches.length === 0) {
                conversationList.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px 24px; font-size: 14px;"><span class="material-icons" style="font-size: 48px; color: #cbd5e1; display: block; margin-bottom: 12px;">forum</span>No tienes mensajes aún</div>';
            } else {
                conversationList.innerHTML = finalMatches.map((match, idx) => {
                    const safeName = escapeHtml(match.name || 'Usuario');
                    const safeId = escapeHtml(String(match.id));
                    const imgUrl = match.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=1392ec&color=fff`;
                    const isUnread = !!match.hasUnread;
                    const bgStyle = isUnread ? 'background: rgba(19,146,236,0.04); border-left: 4px solid #1392ec;' : 'border-left: 4px solid transparent;';
                    const titleWeight = isUnread ? 'font-weight: 700;' : 'font-weight: 600;';
                    const timeColor = isUnread ? 'color: #1392ec; font-weight: 500;' : 'color: #94a3b8;';
                    const msgColor = isUnread ? 'color: #475569; font-weight: 500;' : 'color: #94a3b8;';
                    const dotHtml = isUnread ? '<div style="width: 10px; height: 10px; background: #1392ec; border-radius: 50%; flex-shrink: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1); animation: pulse 2s infinite;"></div>' : '';
                    const matchBadgeBg = isUnread ? 'background: #1392ec;' : 'background: #f1f5f9; border: 1px solid #e2e8f0;';
                    const matchBadgeIconColor = isUnread ? 'color: white;' : 'color: #94a3b8;';

                    return `
                    <div class="match-conversation-item" data-match-name="${safeName.toLowerCase()}" onclick="app.openChat('${safeId}', '${safeName}')" style="display: flex; align-items: center; gap: 16px; padding: 16px 24px; ${bgStyle} cursor: pointer; transition: background 0.2s;">
                        <div style="position: relative; width: 56px; height: 56px; flex-shrink: 0;">
                            <img src="${imgUrl}" alt="${safeName}" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                            <div style="position: absolute; bottom: -4px; right: -4px; background: white; border-radius: 50%; padding: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                                <div style="${matchBadgeBg} border-radius: 50%; padding: 2px; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
                                    <span class="material-icons" style="font-size: 12px; font-weight: 700; ${matchBadgeIconColor}">handshake</span>
                                </div>
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                                <h4 style="margin: 0; ${titleWeight} color: #0f172a; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px;">${safeName}</h4>
                                <span style="font-size: 12px; ${timeColor} white-space: nowrap;">Ahora</span>
                            </div>
                            <p style="margin: 0; font-size: 14px; ${msgColor} overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(match.lastMessage) || '¡Es un Match! Saluda ahora.'}</p>
                        </div>
                        ${dotHtml}
                    </div>
                    ${idx < finalMatches.length - 1 ? '<div style="border-bottom: 1px solid #e2e8f0; margin: 0 24px;"></div>' : ''}`;
                }).join('');
            }
        }
    },

    async viewOfferFromChat() {
        if (!this.currentMatchId) {
            this.showToast('No hay chat activo.', 'error');
            return;
        }

        // Find the match object
        const matchObj = (this.matches || []).find(m => String(m.id) === String(this.currentMatchId));
        if (!matchObj || !matchObj.otherUserId) {
            this.showToast('Información de la empresa no encontrada.', 'error');
            return;
        }

        try {
            // Check if backend ready
            if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
                this.showToast('Backend no disponible para buscar la oferta.', 'error');
                return;
            }

            // Let's assume the other user is a company, and we fetch their active offers
            const { data, error } = await window.supabaseClient
                .from('offers')
                .select('*, company:companies(*)')
                .eq('user_id', matchObj.otherUserId)
                .limit(1);

            if (error || !data || data.length === 0) {
                this.showToast('La empresa no tiene ofertas activas en este momento.');
                return;
            }

            this.openOfferDetails(data[0]);

        } catch (e) {
            console.error('Error fetching offer:', e);
            this.showToast('Ocurrió un error al buscar la oferta.', 'error');
        }
    },

    openOfferDetails(offer) {
        document.getElementById('offerDetailsTitle').textContent = offer.title || offer.professional_title || 'Oferta';
        const companyName = offer.company?.name || offer.company?.company_name || 'Empresa';
        document.getElementById('offerDetailsCompanyLocation').textContent = companyName + ' • ' + (offer.modality || 'Remoto');

        const salaryText = typeof offer.salary_min === 'number'
            ? `$${new Intl.NumberFormat('es-CL').format(offer.salary_min)} - $${new Intl.NumberFormat('es-CL').format(offer.salary_max)}`
            : (offer.salary || 'A convenir');
        document.getElementById('offerDetailsSalary').textContent = salaryText;

        document.getElementById('offerDetailsType').textContent = offer.job_type || 'Full-time';
        document.getElementById('offerDetailsModality').textContent = offer.modality || 'Remoto';

        let desc = offer.description || 'Sin descripción detallada.';
        if (offer.skills && Array.isArray(offer.skills) && offer.skills.length > 0) {
            desc += '\n\nRequisitos:\n' + offer.skills.map(s => '• ' + s).join('\n');
        }
        document.getElementById('offerDetailsDescription').textContent = desc;

        const logoImg = document.getElementById('offerDetailsLogo');
        const logoUrl = offer.company?.logo_url || offer.company?.logo;
        if (logoUrl) {
            logoImg.src = logoUrl;
            logoImg.style.display = 'block';
        } else {
            logoImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=1392ec&color=fff`;
            logoImg.style.display = 'block';
        }

        const modal = document.getElementById('offerDetailsFullScreen');
        if (modal) {
            modal.style.display = 'flex';
            // Slight delay for transition to take effect
            setTimeout(() => { modal.classList.remove('translate-y-full'); }, 10);
            document.body.style.overflow = 'hidden';
            modal.style.zIndex = '99999';
        }
    },

    closeOfferDetails() {
        const modal = document.getElementById('offerDetailsFullScreen');
        if (modal) {
            modal.classList.add('translate-y-full');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    },

    swipeRightFromOffer() {
        this.closeOfferDetails();
        this.showToast('Tu interés se ha notificado.');
    },

    filterMatchConversations(query) {
        const items = document.querySelectorAll('.match-conversation-item');
        const q = (query || '').toLowerCase().trim();
        items.forEach(item => {
            const name = item.getAttribute('data-match-name') || '';
            const divider = item.nextElementSibling;
            if (!q || name.includes(q)) {
                item.style.display = 'flex';
                if (divider && divider.tagName === 'DIV' && !divider.classList.contains('match-conversation-item')) divider.style.display = 'block';
            } else {
                item.style.display = 'none';
                if (divider && divider.tagName === 'DIV' && !divider.classList.contains('match-conversation-item')) divider.style.display = 'none';
            }
        });
    },

    async loadOffers() {
        if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
            console.warn('Backend not ready, using empty profiles');
            this.profiles = [];
            return;
        }

        try {
            const { data, error } = await window.talentlyBackend.offers.getAllActive();
            if (error) throw error;

            // Filter out already-swiped offers (localStorage for instant filtering)
            const swipedIds = JSON.parse(localStorage.getItem('talently_swiped_offers') || '[]');

            this.profiles = data
                .filter(offer => !swipedIds.includes(offer.id))
                .map(offer => ({
                    id: offer.id,
                    userId: offer.user_id, // Company owner's auth user ID (for swipe/match)
                    name: offer.title,
                    company: offer.company?.name || 'Empresa',
                    logo: offer.company?.logo_url,
                    role: offer.professional_title || offer.title,
                    salary: (typeof offer.salary_min === 'number') ?
                        `$${new Intl.NumberFormat('es-CL').format(offer.salary_min)} - $${new Intl.NumberFormat('es-CL').format(offer.salary_max)}` :
                        offer.salary,
                    modality: offer.modality,
                    description: offer.description,
                    skills: offer.skills || [],
                    match: Math.floor(Math.random() * 20) + 80,
                    location: offer.modality || 'Remoto'
                }));

            this.currentIndex = 0;
            console.log('✅ Loaded offers:', this.profiles.length, `(${swipedIds.length} already swiped)`);
        } catch (e) {
            console.error('Error loading offers:', e);
            this.showToast('Error cargando ofertas');
            this.profiles = [];
        }
    },

    renderCard() {
        const cardStack = document.querySelector('.card-stack');
        if (!cardStack) return;

        cardStack.innerHTML = '';

        // Shadow cards visibility
        const shadow1 = document.getElementById('cardShadow1');
        const shadow2 = document.getElementById('cardShadow2');

        if (!this.profiles || this.profiles.length === 0 || this.currentIndex >= this.profiles.length) {
            cardStack.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px; font-family: 'Inter', sans-serif;">
                    <span class="material-icons" style="font-size: 64px; color: #e2e8f0; margin-bottom: 16px;">check_circle</span>
                    <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 8px;">¡Estás al día!</h3>
                    <p style="font-size: 14px; color: #94a3b8; margin: 0;">Vuelve más tarde para nuevas oportunidades</p>
                </div>`;
            const bu = document.querySelector('.action-buttons');
            if (bu) bu.style.display = 'none';
            if (shadow1) shadow1.style.display = 'none';
            if (shadow2) shadow2.style.display = 'none';
            return;
        }

        const bu = document.querySelector('.action-buttons');
        if (bu) bu.style.display = 'flex';
        if (shadow1) shadow1.style.display = 'block';
        if (shadow2) shadow2.style.display = 'block';

        const profile = this.profiles[this.currentIndex];
        this.currentProfileData = profile;

        const isJobOffer = !!profile.company;

        let cardContent = '';
        if (isJobOffer) {
            // STITCH-STYLE JOB OFFER CARD
            const logoInitial = (profile.company || 'E').charAt(0).toUpperCase();
            const logoImg = profile.logo
                ? `<img src="${profile.logo}" alt="${profile.company}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">`
                : `<span style="color: #3b82f6; font-weight: 700; font-size: 24px;">${logoInitial}</span>`;

            const skillTags = (profile.skills || []).slice(0, 4).map(skill =>
                `<span style="font-size: 12px; border: 1px solid #e5e7eb; background: #f9fafb; padding: 4px 8px; border-radius: 4px; color: #6b7280;">${skill}</span>`
            ).join('');

            const salaryChip = profile.salary ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #eff6ff; border: 1px solid #dbeafe; font-size: 13px; font-weight: 500; border-radius: 8px; color: #1d4ed8;">
                <span class="material-icons" style="font-size: 14px;">attach_money</span> ${profile.salary}
            </span>` : '';

            cardContent = `
                <div id="currentCard" style="width: 100%; height: 100%; background: #fff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); padding: 24px; display: flex; flex-direction: column; position: relative; overflow: hidden; border: 1px solid #f3f4f6; font-family: 'Inter', sans-serif;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 160px; background: linear-gradient(to bottom, rgba(249,250,251,0.5), transparent); pointer-events: none;"></div>
                    <div style="position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; padding: 4px;">
                            ${logoImg}
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                            <span style="padding: 4px 12px; background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; font-size: 12px; font-weight: 600; border-radius: 99px;">${profile.match}% Match</span>
                            <span style="font-size: 11px; color: #9ca3af;">Publicado recientemente</span>
                        </div>
                    </div>
                    <div style="position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column;">
                        <h2 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 4px; line-height: 1.2;">${profile.name}</h2>
                        <p style="font-size: 17px; font-weight: 500; color: #6b7280; margin: 0 0 20px;">${profile.company}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 13px; font-weight: 500; border-radius: 8px; color: #4b5563;">
                                <span class="material-icons" style="font-size: 14px; color: #9ca3af;">work_outline</span> ${profile.modality || 'Remoto'}
                            </span>
                            ${salaryChip}
                        </div>
                        <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${profile.description ? profile.description.substring(0, 150) + '...' : ''}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: auto;">
                            ${skillTags}
                        </div>
                    </div>
                    <div style="position: relative; z-index: 10; width: 100%; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                        <button onclick="event.stopPropagation(); app.openCardDetail('offer')" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 14px; font-weight: 600; color: #3b82f6; background: none; border: none; cursor: pointer; padding: 4px; font-family: inherit;">
                            Ver detalles <span class="material-icons" style="font-size: 16px;">expand_more</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            // CANDIDATE CARD (Company View) — keep existing style with minor Stitch updates
            const imageUrl = profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=600`;
            cardContent = `
                <div class="profile-card" id="currentCard">
                    <img src="${imageUrl}" class="card-image" alt="${profile.name}">
                    <div class="swipe-stamp stamp-like">LIKE</div>
                    <div class="swipe-stamp stamp-nope">NOPE</div>
                    <div class="card-content">
                        <div class="card-header">
                            <div>
                                <h2>${profile.name}</h2>
                                <p>${profile.role || profile.position || 'Sin cargo'}</p>
                            </div>
                            <span class="match-badge">${profile.match}% Match</span>
                        </div>
                        <div class="card-details">
                            <div class="detail-item">
                                <span class="material-icons" style="font-size: 16px; color: #9ca3af;">work_outline</span>
                                <span>${profile.experience || '3 años'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="material-icons" style="font-size: 16px; color: #9ca3af;">location_on</span>
                                <span>${profile.location || 'Santiago'}</span>
                            </div>
                        </div>
                        <div class="skills-container">
                            ${(profile.skills || []).slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        cardStack.innerHTML = cardContent;
        this.currentProfileCard = document.getElementById('currentCard');
        this.setupSwipeGestures();
    },
    renderProfile() {
        // Use Real User Data if available, otherwise fallback to mock
        const profileData = this.currentUser || {};

        // 1. Update Header Info
        const profileHero = document.querySelector('.profile-hero');
        if (profileHero) {
            // Update Name
            const nameEl = profileHero.querySelector('h2');
            if (nameEl) nameEl.textContent = profileData.name || 'Usuario';

            // Update Position
            const titleEl = profileHero.querySelector('p');
            if (titleEl) titleEl.textContent = profileData.current_position || 'Sin cargo definido';
        }

        // Update Avatar (Target correct classes in HTML)
        // HTML uses .profile-avatar-large in Settings, .preview-image in Preview Modal
        // Also support .profile-image-large just in case
        if (profileData.image || profileData.avatar_url) {
            const imgSrc = profileData.image || profileData.avatar_url;
            document.querySelectorAll('.profile-avatar-large, .profile-image-large, .preview-image').forEach(el => el.src = imgSrc);
        } else {
            document.querySelectorAll('.profile-avatar-large, .profile-image-large, .preview-image').forEach(el => el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=random`);
        }

        // 2. Update Personal Information List
        // Helper to find row by label text
        const updateInfoRow = (label, value) => {
            const rows = document.querySelectorAll('.profile-info-row');
            for (const row of rows) {
                const labelEl = row.querySelector('.profile-info-label');
                if (labelEl && labelEl.textContent.includes(label)) {
                    const valueEl = row.querySelector('.profile-info-value');
                    if (valueEl) valueEl.textContent = value;
                    break;
                }
            }
        };

        // Prepare Location
        let locationString = '';
        let countryDisplay = profileData.country || '';
        // Try to resolve Country ID to Name
        if (this.referenceData && this.referenceData.countries) {
            const countryObj = this.referenceData.countries.find(c => c.id === countryDisplay || c.name === countryDisplay);
            if (countryObj) countryDisplay = countryObj.name;
        }
        if (profileData.city) {
            locationString = `${profileData.city}, ${countryDisplay}`;
        } else {
            locationString = countryDisplay || 'No especificada';
        }

        updateInfoRow('Ubicación', locationString);
        if (profileData.birth_date) updateInfoRow('Fecha de nacimiento', profileData.birth_date);
        if (profileData.email) updateInfoRow('Email', profileData.email);
        updateInfoRow('Disponibilidad', profileData.availability || 'No especificada');
        updateInfoRow('Modalidad', profileData.work_modality || 'No especificada');

        if (profileData.expected_salary) {
            const formatted = new Intl.NumberFormat('es-CL').format(profileData.expected_salary);
            updateInfoRow('Pretensión salarial', `$${formatted} ${profileData.currency || 'CLP'}`);
        } else {
            updateInfoRow('Pretensión salarial', 'No especificada');
        }

        // 3. Update Skills
        const skillsContainer = document.querySelector('.skills-display');
        if (skillsContainer) {
            const skills = profileData.skills || [];
            if (skills.length > 0) {
                skillsContainer.innerHTML = skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 14px;">Sin habilidades registradas</span>';
            }
        }

        // 4. Update About Me / Bio
        // Check for .about-text or similar. If not in HTML, this might need an HTML update later.
        const aboutMeEl = document.querySelector('.about-text');
        if (aboutMeEl) {
            aboutMeEl.textContent = profileData.bio || 'Sin descripción.';
        }

        // Render Experience
        const expList = document.getElementById('experienceList');
        if (expList) {
            let experience = profileData.experience || [];
            if (typeof experience === 'string') {
                try { experience = JSON.parse(experience); } catch (e) { experience = []; }
            }
            if (!Array.isArray(experience)) experience = [];

            if (experience.length === 0) {
                expList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">Sin experiencia registrada</div>';
            } else {
                expList.innerHTML = experience.map(exp => `
                    <div class="profile-info-row">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${exp.role || exp.position || 'Sin cargo'}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${exp.company || 'Sin empresa'} • ${exp.period || 'Sin periodo'}</div>
                        </div>
                        <button onclick="app.removeExperience(${exp.id})" style="color: var(--danger); background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                `).join('');
            }
        }

        // Render Education
        const eduList = document.getElementById('educationList');
        if (eduList) {
            let education = profileData.education || [];
            if (typeof education === 'string') {
                try { education = JSON.parse(education); } catch (e) { education = []; }
            }
            if (!Array.isArray(education)) education = [];

            if (education.length === 0) {
                eduList.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px;">Sin educación registrada</div>';
            } else {
                eduList.innerHTML = education.map(edu => `
                    <div class="profile-info-row">
                        <div>
                            <div style="font-weight: 600; color: var(--text-primary);">${edu.degree}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${edu.school} • ${edu.period}</div>
                        </div>
                        <button onclick="app.removeEducation(${edu.id})" style="color: var(--danger); background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                `).join('');
            }
        }
    },

    addExperience() {
        const role = prompt('Cargo:');
        if (!role) return;
        const company = prompt('Empresa:');
        if (!company) return;
        const period = prompt('Periodo (ej. 2021 - 2023):');

        if (!this.currentUser.experience) this.currentUser.experience = [];
        this.currentUser.experience.push({
            id: Date.now(),
            role,
            company,
            period: period || 'Actualidad'
        });
        this.saveProfile();
        this.renderProfile();
    },

    animateSwipe(direction) {
        const card = this.currentProfileCard || document.getElementById('currentCard');
        if (!card) {
            this.currentIndex++;
            this.renderCard();
            return;
        }

        // Show LIKE/NOPE stamp
        const stamp = card.querySelector(direction === 'right' ? '.stamp-like' : '.stamp-nope');
        if (stamp) {
            stamp.style.opacity = '1';
            stamp.style.transform = direction === 'right'
                ? 'translateY(-50%) rotate(-20deg) scale(1)'
                : 'translateY(-50%) rotate(20deg) scale(1)';
        }

        // Fly card away with Tinder-like spring animation
        card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease';
        if (direction === 'left') {
            card.style.transform = 'translateX(-150%) rotate(-30deg)';
        } else {
            card.style.transform = 'translateX(150%) rotate(30deg)';
        }
        card.style.opacity = '0';

        setTimeout(() => {
            if (card.parentNode) card.parentNode.removeChild(card);
            this.currentProfileCard = null;
            this.currentIndex++;
            this.renderCard();
        }, 400);
    },

    // Skills Edit State
    activeEditSkills: [],



    closeEditSkills() {
        document.getElementById('editSkillsModal').classList.remove('active');
    },

    renderEditSkillsSelected() {
        const container = document.getElementById('editSkillsSelected');
        if (!container) return;

        container.innerHTML = '';
        this.activeEditSkills.forEach((skill, index) => {
            const chip = document.createElement('div');
            chip.style.cssText = 'padding: 6px 12px; background: var(--primary); color: white; border-radius: 16px; font-size: 13px; display: flex; align-items: center; gap: 6px;';
            chip.innerHTML = `
                ${skill}
                <span onclick="app.removeEditSkill(${index})" style="cursor: pointer; font-weight: bold;">×</span>
            `;
            container.appendChild(chip);
        });
    },

    async renderEditSkillsBubbles() {
        const areaSelect = document.getElementById('editSkillsArea');
        const areaSlug = areaSelect ? areaSelect.value : 'desarrollo';
        const container = document.getElementById('editSkillsBubbles');

        if (!container) return;

        container.innerHTML = '<div class="loader-spinner"></div>';

        try {
            const result = await window.talentlyBackend.reference.getSkills(areaSlug);
            const skills = result.data || [];

            container.innerHTML = '';

            if (skills.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary);">No se encontraron habilidades.</p>';
                return;
            }

            // Filter out already selected
            const available = skills.filter(s => !this.activeEditSkills.includes(s.name));

            if (available.length === 0) {
                container.innerHTML = '<p style="font-size: 13px; color: var(--text-secondary);">Ya has seleccionado todas las habilidades de esta área.</p>';
                return;
            }

            available.forEach(skill => {
                const btn = document.createElement('button');
                btn.textContent = skill.name;
                btn.type = 'button';
                btn.className = 'btn-chip'; // Reuse class if exists, or style inline
                btn.style.cssText = 'margin: 4px; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: 13px; transition: all 0.2s;';

                btn.onmouseover = () => { btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; };
                btn.onmouseout = () => { btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--text-primary)'; };

                btn.onclick = () => this.addEditSkill(skill.name);
                container.appendChild(btn);
            });

        } catch (e) {
            console.error('Error loading skills for edit:', e);
            container.innerHTML = '<p style="color: var(--danger);">Error al cargar.</p>';
        }
    },

    addEditSkill(skill) {
        if (this.activeEditSkills.length >= 10) {
            this.showToast('Máximo 10 habilidades');
            return;
        }
        if (!this.activeEditSkills.includes(skill)) {
            this.activeEditSkills.push(skill);
            this.renderEditSkillsSelected();
            this.renderEditSkillsBubbles();
        }
    },

    removeEditSkill(index) {
        this.activeEditSkills.splice(index, 1);
        this.renderEditSkillsSelected();
        this.renderEditSkillsBubbles();
    },

    // Legacy function support
    editSkills() {
        this.openEditSkills();
    },

    // ================= EXPERIENCE MODAL (Stitch) =================
    openEditExperience(index = null) {
        const modal = document.getElementById('editExperienceModal');
        if (!modal) return;

        // Render the timeline
        this.renderExpTimeline();

        if (index !== null && this.currentUser.experience && this.currentUser.experience[index]) {
            // Edit Mode - show form with data
            this._showExpForm(index);
        } else if (index === null && arguments.length > 0) {
            // Called from "Agregar" button - show blank form
            this._showExpForm(null);
        } else {
            // Just opening the modal - hide form, only show timeline
            const form = document.getElementById('expEditForm');
            if (form) form.style.display = 'none';
        }

        modal.style.display = 'flex';
    },

    _showExpForm(index) {
        const form = document.getElementById('expEditForm');
        const roleInput = document.getElementById('expRole');
        const companyInput = document.getElementById('expCompany');
        const startInput = document.getElementById('expStartDate');
        const endInput = document.getElementById('expEndDate');
        const currentInput = document.getElementById('expCurrent');
        const indexInput = document.getElementById('expIndex');
        const descInput = document.getElementById('expDescription');
        const descCount = document.getElementById('expDescCount');
        const deleteBtn = document.getElementById('expDeleteBtn');
        const formTitle = document.getElementById('expFormTitle');

        if (!form) return;

        // Reset
        roleInput.value = '';
        companyInput.value = '';
        startInput.value = '';
        endInput.value = '';
        currentInput.checked = false;
        endInput.disabled = false;
        indexInput.value = '';
        if (descInput) descInput.value = '';
        if (descCount) descCount.textContent = '0/2000';

        // Reset end date visual
        const endGroup = document.getElementById('expEndDateGroup');
        if (endGroup) { endGroup.style.opacity = '1'; endGroup.style.pointerEvents = 'auto'; }

        if (index !== null && this.currentUser.experience && this.currentUser.experience[index]) {
            // Edit existing
            const item = this.currentUser.experience[index];
            roleInput.value = item.role || '';
            companyInput.value = item.company || '';
            indexInput.value = index;
            formTitle.textContent = 'Editar Experiencia';

            if (item.startDate || item.start_date) startInput.value = item.startDate || item.start_date || '';
            if (item.endDate || item.end_date) endInput.value = item.endDate || item.end_date || '';
            if (item.isCurrent || item.is_current) {
                currentInput.checked = true;
                endInput.value = '';
                endInput.disabled = true;
                if (endGroup) { endGroup.style.opacity = '0.5'; endGroup.style.pointerEvents = 'none'; }
            }
            if (item.description && descInput) {
                descInput.value = item.description;
                if (descCount) descCount.textContent = item.description.length + '/2000';
            }

            // Show delete button
            if (deleteBtn) deleteBtn.style.display = 'inline-flex';
        } else {
            // Add new
            formTitle.textContent = 'Nueva Experiencia';
            if (deleteBtn) deleteBtn.style.display = 'none';
        }

        form.style.display = 'block';
        // Scroll to form
        setTimeout(() => form.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },

    renderExpTimeline() {
        const container = document.getElementById('expTimeline');
        if (!container) return;

        const expList = this.currentUser.experience || [];

        if (expList.length === 0) {
            container.innerHTML = '<div style="color: #6c757d; font-size: 14px; padding: 8px 0;">No has agregado experiencia laboral aún.</div>';
            return;
        }

        const formatPeriodLabel = (item) => {
            if (item.period) return item.period;
            const formatM = (iso) => {
                if (!iso) return '';
                const [y, m] = iso.split('-');
                const d = new Date(parseInt(y), parseInt(m) - 1);
                const s = d.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
                return s.charAt(0).toUpperCase() + s.slice(1);
            };
            const start = item.startDate || item.start_date || '';
            const end = item.endDate || item.end_date || '';
            const isCurr = item.isCurrent || item.is_current;
            return `${formatM(start)} - ${isCurr ? 'Presente' : formatM(end)}`;
        };

        container.innerHTML = expList.map((exp, index) => {
            const isCurrent = exp.isCurrent || exp.is_current;
            const isLast = index === expList.length - 1;
            const periodText = formatPeriodLabel(exp);
            const initial = (exp.company || '?').charAt(0).toUpperCase();
            const periodStyle = isCurrent
                ? 'color: #1392ec; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;'
                : 'color: #6c757d; font-weight: 500;';

            return `
            <div style="position: relative; display: flex; gap: 16px; margin-bottom: 0; padding-bottom: ${isLast ? '0' : '24px'};">
                ${!isLast ? `<div style="position: absolute; left: 26px; top: 52px; bottom: 0; width: 2px; background: #E5E7EB;"></div>` : ''}
                <div style="position: relative; flex-shrink: 0;">
                    <div style="height: 52px; width: 52px; border-radius: 8px; background: #ffffff; border: 1px solid #E5E7EB; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <span style="font-size: 20px; font-weight: 700; color: #6c757d;">${initial}</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; flex: 1; padding-top: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="font-weight: 700; font-size: 16px; line-height: 1.3; color: #212529; margin: 0;">${exp.role || exp.position || 'Sin cargo'}</h3>
                            <p style="color: #6c757d; font-size: 14px; margin: 2px 0 0;">${exp.company || 'Sin empresa'}${exp.type ? ' \u2022 ' + exp.type : ''}</p>
                        </div>
                        <button onclick="app.editExpEntry(${index})" style="color: #9CA3AF; background: none; border: none; cursor: pointer; padding: 4px; border-radius: 50%; transition: color 0.15s;" onmouseenter="this.style.color='#1392ec'" onmouseleave="this.style.color='#9CA3AF'">
                            <span class="material-icons" style="font-size: 20px;">edit</span>
                        </button>
                    </div>
                    <p style="font-size: 12px; ${periodStyle} margin: 8px 0 0;">${periodText}</p>
                </div>
            </div>`;
        }).join('');
    },

    editExpEntry(index) {
        this._showExpForm(index);
    },

    closeEditExperience() {
        const modal = document.getElementById('editExperienceModal');
        if (modal) modal.style.display = 'none';
    },

    toggleExpEndDate() {
        const isCurrent = document.getElementById('expCurrent').checked;
        const endInput = document.getElementById('expEndDate');
        const endGroup = document.getElementById('expEndDateGroup');
        if (endInput) {
            endInput.disabled = isCurrent;
            if (isCurrent) endInput.value = '';
        }
        if (endGroup) {
            endGroup.style.opacity = isCurrent ? '0.5' : '1';
            endGroup.style.pointerEvents = isCurrent ? 'none' : 'auto';
        }
    },

    saveExperience() {
        const form = document.getElementById('expEditForm');
        // If form is hidden, nothing to save - just close
        if (!form || form.style.display === 'none') {
            this.closeEditExperience();
            return;
        }

        const role = document.getElementById('expRole').value.trim();
        const company = document.getElementById('expCompany').value.trim();
        const start = document.getElementById('expStartDate').value;
        const end = document.getElementById('expEndDate').value;
        const isCurrent = document.getElementById('expCurrent').checked;
        const indexStr = document.getElementById('expIndex').value;
        const description = (document.getElementById('expDescription') || {}).value || '';

        if (!role || !company) {
            this.showToast('Cargo y Empresa son obligatorios', 'error');
            return;
        }
        if (!start) {
            this.showToast('Fecha de inicio requerida', 'error');
            return;
        }
        if (!isCurrent && !end) {
            this.showToast('Fecha fin requerida', 'error');
            return;
        }

        // Format period string
        const formatMonth = (iso) => {
            if (!iso) return '';
            const [y, m] = iso.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1);
            const s = date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
            return s.charAt(0).toUpperCase() + s.slice(1);
        };

        const periodStr = `${formatMonth(start)} - ${isCurrent ? 'Presente' : formatMonth(end)}`;

        const newItem = {
            role,
            company,
            period: periodStr,
            startDate: start,
            endDate: isCurrent ? null : end,
            isCurrent,
            description
        };

        if (!Array.isArray(this.currentUser.experience)) {
            this.currentUser.experience = [];
        }

        if (indexStr !== '') {
            const index = parseInt(indexStr);
            this.currentUser.experience[index] = { ...this.currentUser.experience[index], ...newItem };
        } else {
            this.currentUser.experience.push({ ...newItem, id: Date.now() });
        }

        this.saveProfile();
        this.renderProfile();
        // Re-render timeline in modal
        this.renderExpTimeline();
        // Hide form, keep modal open to see updated timeline
        const formEl = document.getElementById('expEditForm');
        if (formEl) formEl.style.display = 'none';
        this.showToast('Experiencia guardada');
    },

    // Legacy Support
    addExperience() {
        this.openEditExperience();
    },

    removeExperience() {
        const indexStr = document.getElementById('expIndex').value;
        if (indexStr === '') return;
        if (!confirm('¿Eliminar esta experiencia?')) return;

        const index = parseInt(indexStr);
        if (this.currentUser.experience && this.currentUser.experience[index]) {
            this.currentUser.experience.splice(index, 1);
            this.saveProfile();
            this.renderProfile();
            this.renderExpTimeline();
            const form = document.getElementById('expEditForm');
            if (form) form.style.display = 'none';
            this.showToast('Experiencia eliminada');
        }
    },

    // ================= EDUCATION MODAL (delegates to primary block) =================
    // Primary education functions defined earlier (~line 1775). These are kept as pass-through for safety.

    // Legacy Support
    addEducation() {
        this.openEditEducation();
    },

    async openEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (!modal) return;

        // Safety: Ensure Reference Data is Loaded
        if (!this.referenceData || !this.referenceData.countries || this.referenceData.countries.length === 0) {
            await this.loadReferenceData();
        }

        // Pre-fill data
        document.getElementById('editName').value = this.currentUser.name || '';
        document.getElementById('editPosition').value = this.currentUser.current_position || this.currentUser.professional_title || '';
        document.getElementById('editSalary').value = this.currentUser.expected_salary || '';
        document.getElementById('editCurrency').value = this.currentUser.currency || 'usd';

        // Show current profile photo
        const photoPreview = document.getElementById('editPhotoPreview');
        if (photoPreview) {
            const photoUrl = this.currentUser.photo_url || this.currentUser.avatar_url || '';
            if (photoUrl) {
                photoPreview.style.backgroundImage = `url('${photoUrl}')`;
            } else {
                photoPreview.style.backgroundImage = 'none';
                photoPreview.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f1f5f9;"><span class="material-icons" style="font-size: 48px; color: #94a3b8;">person</span></div>`;
            }
        }

        // Reset pending photo
        this._editPendingPhoto = null;

        // Load Countries (Reuse Onboarding Logic)
        this.renderCountries('editCountry');

        // Function to set City after countries load/change
        const setCityAfterLoad = () => {
            const countrySelect = document.getElementById('editCountry');
            if (this.currentUser.country) {
                for (let i = 0; i < countrySelect.options.length; i++) {
                    const opt = countrySelect.options[i];
                    if (opt.value === this.currentUser.country || opt.text === this.currentUser.country) {
                        countrySelect.selectedIndex = i;
                        break;
                    }
                }
            }
            // Trigger City Load
            this.updateCities('editCountry', 'editCity').then(() => {
                const citySelect = document.getElementById('editCity');
                if (this.currentUser.city) {
                    citySelect.value = this.currentUser.city;
                }
            });
        };

        setTimeout(setCityAfterLoad, 100);
        modal.style.display = 'flex';
    },

    closeEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (modal) modal.style.display = 'none';
    },

    handleEditPhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('La imagen no puede superar 5MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('editProfileAvatarPreview');
            if (preview) {
                preview.style.backgroundImage = `url('${e.target.result}')`;
            }
        };
        reader.readAsDataURL(file);
        this._editPendingPhoto = file;
    },

    async saveEditPersonal() {
        const name = document.getElementById('editName').value.trim();
        if (!name) {
            this.showToast('El nombre es obligatorio', 'error');
            return;
        }

        const salaryVal = document.getElementById('editSalary').value.replace(/[^\d]/g, '');

        // Upload photo if pending
        if (this._editPendingPhoto && window.talentlyBackend && window.talentlyBackend.storage) {
            const url = await window.talentlyBackend.storage.uploadImage(this._editPendingPhoto);
            if (url) {
                this.currentUser.photo_url = url;
            }
            this._editPendingPhoto = null;
        }

        this.currentUser = {
            ...this.currentUser,
            name: name,
            current_position: document.getElementById('editPosition').value.trim(),
            country: document.getElementById('editCountry').value,
            city: document.getElementById('editCity').value,
            expected_salary: salaryVal ? parseInt(salaryVal) : 0,
            currency: document.getElementById('editCurrency').value
        };

        this.saveProfile();
        this.renderProfile();
        this.closeEditPersonal();
        this.showToast('Perfil actualizado');
    },

    // Legacy function support (redirect to new)
    editPersonalInfo() {
        this.openEditProfileFullScreen();
    },

});
