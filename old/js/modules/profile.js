// ============================================
// MÓDULO: Perfil Candidato
// Talently — js/modules/profile.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: renderProfile, calculateProfileCompleteness,
//          openEditPersonal, savePersonal, renderExperience,
//          openEditExperience, closeEditExperience, saveExperience,
//          removeExperience, renderEducation, openEditEducation,
//          saveEducation, removeEducation, openEditSkills,
//          closeEditSkills, renderSelectedSkillsChips, toggleSkill,
//          initializeVideoPitch, requestVideoUpload,
//          openEditProfileFullScreen, closeEditProfileFullScreen,
//          saveUnifiedProfile, setWorkModality, editPersonalInfo
// ============================================

Object.assign(app, {

    renderProfile() {
        if (!this.currentUser) return;

        // 1. Update Header Info
        const profileHero = document.querySelector('.profile-hero');
        if (profileHero) {
            // Update Name
            const nameEl = profileHero.querySelector('h2');
            if (nameEl) nameEl.textContent = this.currentUser.name || 'Usuario';

            // Update Position
            const titleEl = profileHero.querySelector('p');
            if (titleEl) titleEl.textContent = this.currentUser.current_position || 'Sin cargo definido';

            // Update Location
            let countryDisplay = this.currentUser.country || '';
            // Try to resolve Country ID to Name if possible
            if (this.referenceData && this.referenceData.countries) {
                const countryObj = this.referenceData.countries.find(c => c.id === countryDisplay || c.name === countryDisplay);
                if (countryObj) countryDisplay = countryObj.name;
            }

            const locationEl = profileHero.querySelector('.profile-location span');
            if (locationEl) locationEl.textContent = `${this.currentUser.city || ''}, ${countryDisplay}`;

            // Update Avatar (priorizar avatar_url sobre image para evitar blob: URLs)
            const avatar = document.getElementById('profileAvatar');
            const avatarImg = document.getElementById('profileAvatarImg');
            const imageUrl = this.currentUser.avatar_url || this.currentUser.image;

            // console.log('renderProfile() - Elementos encontrados:', {
            //     avatar: !!avatar,
            //     avatarImg: !!avatarImg,
            //     imageUrl: imageUrl?.substring(0, 80) + '...',
            //     isBlob: imageUrl?.startsWith('blob:')
            // });

            if (avatar && imageUrl && !imageUrl.startsWith('blob:')) {
                avatar.src = imageUrl;
                // console.log('✓ Avatar actualizado (profileAvatar)');
            }
            if (avatarImg && imageUrl && !imageUrl.startsWith('blob:')) {
                avatarImg.src = imageUrl;
                // console.log('✓ Avatar actualizado (profileAvatarImg)');
            }
        } else {
            // console.warn('renderProfile() - No se encontró .profile-hero');
        }

        // 2. Update Personal Information List
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

        if (this.currentUser.birth_date) updateInfoRow('Fecha de nacimiento', this.currentUser.birth_date);
        if (this.currentUser.email) updateInfoRow('Email', this.currentUser.email);

        if (this.currentUser.availability) updateInfoRow('Disponibilidad', this.currentUser.availability);
        // Map modality values to user-friendly text if needed
        if (this.currentUser.work_modality) updateInfoRow('Modalidad', this.currentUser.work_modality);

        if (this.currentUser.expected_salary) {
            const formatted = new Intl.NumberFormat('es-CL').format(this.currentUser.expected_salary);
            updateInfoRow('Pretensión salarial', `$${formatted} ${this.currentUser.currency || 'CLP'}`);
        }

        // 3. Update Skills
        const skillsContainer = document.querySelector('.skills-display');
        if (skillsContainer) {
            const skills = this.currentUser.skills || [];
            if (skills.length > 0) {
                skillsContainer.innerHTML = skills.map(s => `<span class="skill-badge">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 14px;">Sin habilidades registradas</span>';
            }
        }

        // 4. Update About Me
        const aboutMeEl = document.querySelector('.about-text');
        if (aboutMeEl) {
            aboutMeEl.textContent = this.currentUser.bio || 'Sin descripción.';
        }

        // 5. Render Experience & Education
        this.renderExperience();
        this.renderEducation();

        // 6. Initialize Video Pitch
        this.initializeVideoPitch();
    },

    // ============================================
    // ACTIVITY STATISTICS (Dynamic)
    // ============================================

    async renderActivityStats() {

        // Default values if backend not available
        let stats = {
            profile_views: 0,
            matches_count: 0,
            swipes_given: 0,
            messages_sent: 0,
            messages_received: 0,
            avg_response_time_minutes: 0,
            daily_activity: []
        };

        // Try to fetch from backend
        if (window.talentlyBackend && window.talentlyBackend.isReady && window.talentlyBackend.statistics) {
            try {
                const { data, error } = await window.talentlyBackend.statistics.get();
                if (data && !error) {
                    stats = { ...stats, ...data };
                } else {
                    console.warn('Stats fetch error:', error);
                }
            } catch (e) {
                console.warn('Stats fetch failed:', e);
            }
        }

        // --- 1. Update Summary Values ---
        const statViews = document.getElementById('stat-views');
        if (statViews) statViews.textContent = stats.profile_views || 0;

        const statMatches = document.getElementById('stat-matches');
        if (statMatches) statMatches.textContent = stats.matches_count || 0;

        // Response rate = messages_sent / messages_received * 100
        const responseRate = stats.messages_received > 0
            ? Math.round((stats.messages_sent / stats.messages_received) * 100)
            : 0;
        const statResponseRate = document.getElementById('stat-response-rate');
        if (statResponseRate) statResponseRate.textContent = `${responseRate}%`;

        // --- 2. Update Weekly Chart ---
        const chartContainer = document.getElementById('activity-chart');
        const labelsContainer = document.getElementById('activity-chart-labels');

        if (chartContainer && labelsContainer) {
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const activity = stats.daily_activity || [];

            // Fill last 7 days
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayData = activity.find(a => a.date === dateStr) || { views: 0, matches: 0, swipes: 0, messages: 0 };
                const total = (dayData.views || 0) + (dayData.matches || 0) + (dayData.swipes || 0) + (dayData.messages || 0);
                days.push({
                    label: dayNames[d.getDay()],
                    total: total
                });
            }

            // Find max for scaling
            const maxVal = Math.max(...days.map(d => d.total), 1);

            // Render bars
            chartContainer.innerHTML = days.map(d => {
                const heightPct = Math.max((d.total / maxVal) * 100, 5); // min 5% height
                return `<div class="chart-bar" style="height: ${heightPct}%;" data-value="${d.total}"></div>`;
            }).join('');

            // Render labels
            labelsContainer.innerHTML = days.map(d => {
                return `<span class="chart-label">${d.label}</span>`;
            }).join('');
        }

        // --- 3. Update Ranking ---
        // Match rate
        const matchRate = stats.swipes_given > 0
            ? Math.round((stats.matches_count / stats.swipes_given) * 100)
            : 0;
        const rankMatchRate = document.getElementById('rank-match-rate');
        if (rankMatchRate) rankMatchRate.textContent = `${matchRate}%`;

        // Response time
        const avgTime = stats.avg_response_time_minutes || 0;
        const rankResponseTime = document.getElementById('rank-response-time');
        if (rankResponseTime) {
            if (avgTime === 0) {
                rankResponseTime.textContent = '-';
            } else if (avgTime < 60) {
                rankResponseTime.textContent = `${Math.round(avgTime)}m`;
            } else {
                rankResponseTime.textContent = `<${Math.ceil(avgTime / 60)}h`;
            }
        }

        // Profile completeness (computed dynamically)
        const profileComplete = this.calculateProfileCompleteness();
        const rankProfileComplete = document.getElementById('rank-profile-complete');
        if (rankProfileComplete) rankProfileComplete.textContent = `${profileComplete}%`;

        // Update ranking subtitles
        const rankMatchSub = document.getElementById('rank-match-subtitle');
        if (rankMatchSub) {
            if (matchRate >= 60) rankMatchSub.textContent = 'Top 5% de candidatos';
            else if (matchRate >= 40) rankMatchSub.textContent = 'Top 20% de candidatos';
            else if (matchRate >= 20) rankMatchSub.textContent = 'Top 50% de candidatos';
            else rankMatchSub.textContent = '¡Sigue mejorando!';
        }

        const rankProfileSub = document.getElementById('rank-profile-subtitle');
        if (rankProfileSub) rankProfileSub.textContent = `${profileComplete}% completado`;
    },

    calculateProfileCompleteness() {
        if (!this.currentUser) return 0;

        const fields = [
            'name', 'email', 'birth_date', 'country', 'city',
            'current_position', 'work_modality', 'availability',
            'expected_salary', 'bio'
        ];

        // Image check (support both fields, pero excluir blob: URLs temporales)
        const imageUrl = this.currentUser.avatar_url || this.currentUser.image;
        const hasImage = imageUrl && !imageUrl.startsWith('blob:') && imageUrl.trim() !== '';

        const arrayFields = ['skills', 'experience', 'education'];

        let filled = 0;
        let total = fields.length + 1 + arrayFields.length; // +1 for image

        fields.forEach(f => {
            if (this.currentUser[f] && this.currentUser[f] !== '') filled++;
        });

        if (hasImage) filled++;

        arrayFields.forEach(f => {
            const arr = this.currentUser[f];
            if (Array.isArray(arr) && arr.length > 0) {
                filled++;
            }
        });

        return Math.round((filled / total) * 100);
    },


    // ============================================
    // PERSONAL INFO MANAGEMENT
    // ============================================

    openEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (!modal) return;

        // Populate Fields
        document.getElementById('editName').value = this.currentUser.name || '';
        document.getElementById('editPosition').value = this.currentUser.current_position || '';

        const linkedinInput = document.getElementById('editLinkedin');
        if (linkedinInput) linkedinInput.value = this.currentUser.linkedin || '';

        const bioInput = document.getElementById('editBio');
        if (bioInput) bioInput.value = this.currentUser.bio || '';

        // Handle Salary Formatting
        const salaryInput = document.getElementById('editSalary');
        if (salaryInput) {
            const rawSalary = this.currentUser.expected_salary || '';
            salaryInput.value = new Intl.NumberFormat('es-CL').format(rawSalary);
        }

        // Set Currency (normalize to lowercase to match options)
        const currencySelect = document.getElementById('editCurrency');
        const userCurrency = (this.currentUser.currency || 'clp').toLowerCase();
        if (currencySelect) currencySelect.value = userCurrency;

        document.getElementById('editModality').value = this.currentUser.work_modality || 'Remoto';

        // Set Availability (normalize)
        const availabilitySelect = document.getElementById('editAvailability');
        const userAvailability = this.currentUser.availability || 'inmediata';
        // Try exact match, or fallback if using old values
        if (availabilitySelect) {
            availabilitySelect.value = userAvailability;
            // If value didn't stick (because it's not in options), default to immediate
            if (!availabilitySelect.value) availabilitySelect.value = 'inmediata';
        }

        // Populate Country & City
        const countrySelect = document.getElementById('editCountry');
        const citySelect = document.getElementById('editCity');

        // Clear previous options
        countrySelect.innerHTML = '<option value="">Selecciona país</option>';

        // Get countries from reference data
        if (this.referenceData && this.referenceData.countries) {
            this.referenceData.countries.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.name;
                countrySelect.appendChild(opt);
            });
        }

        // Set current selection
        let currentCountry = this.currentUser.country;
        if (currentCountry) {
            // Try to find if the stored value matches an ID or Name
            const countryObj = this.referenceData && this.referenceData.countries.find(c => c.id == currentCountry || c.name === currentCountry);

            if (countryObj) {
                countrySelect.value = countryObj.id;
                // Trigger City Update
                this.updateCities('editCountry', 'editCity', this.currentUser.city);
            } else {
                // Fallback: manually add it if not in list
                const opt = document.createElement('option');
                opt.value = currentCountry;
                opt.textContent = currentCountry;
                countrySelect.appendChild(opt);
                countrySelect.value = currentCountry;

                // Also enable city and populate if exists
                if (this.currentUser.city) {
                    citySelect.innerHTML = `<option value="${this.currentUser.city}">${this.currentUser.city}</option>`;
                    citySelect.value = this.currentUser.city;
                    citySelect.disabled = false;
                }
            }
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    closeEditPersonal() {
        const modal = document.getElementById('editPersonalModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    savePersonal() {
        const name = document.getElementById('editName').value;
        const position = document.getElementById('editPosition').value;
        const countrySelect = document.getElementById('editCountry');
        const country = countrySelect.value;
        // Store country name or ID? usually ID if available, but renderProfile expects ID or Name. 
        // Let's stick to what updateCities uses.


        const cityId = document.getElementById('editCity').value;
        const citySelect = document.getElementById('editCity');
        const cityName = citySelect.selectedIndex >= 0 ? citySelect.options[citySelect.selectedIndex].text : '';

        const salaryStr = document.getElementById('editSalary').value.replace(/\./g, '').replace(/,/g, '');
        const salary = parseInt(salaryStr) || 0;
        const currency = document.getElementById('editCurrency').value;
        const modality = document.getElementById('editModality').value;
        const availability = document.getElementById('editAvailability') ? document.getElementById('editAvailability').value : 'inmediata';

        const linkedinInput = document.getElementById('editLinkedin');
        const linkedin = linkedinInput ? linkedinInput.value : '';

        const bioInput = document.getElementById('editBio');
        const bio = bioInput ? bioInput.value : '';

        if (!name || !position || !country) {
            this.showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }

        this.currentUser = {
            ...this.currentUser,
            name,
            current_position: position,
            country,          // ID
            city: cityName,   // Name (for UI display)
            city_id: cityId,  // ID (for Payload)
            expected_salary: salary,
            currency,
            work_modality: modality,
            availability,
            linkedin,
            bio
        };

        // Sync with userProfile (mock)
        this.userProfile = { ...this.userProfile, ...this.currentUser };

        // Save to Supabase
        if (window.talentlyBackend && window.talentlyBackend.profiles && window.talentlyBackend.profiles.create) {

            // Clean Payload: Send city_id (UUID)
            const profilePayload = {
                full_name: name,
                professional_title: position,
                country_id: country, // UUID
                city_id: cityId,     // UUID
                expected_salary: salary,
                currency: currency.toLowerCase(), // Ensure lowercase as per onboarding
                work_modality: modality,
                availability: availability,
                linkedin: linkedin,
                bio: bio
            };

            // Attempt save
            window.talentlyBackend.profiles.create(profilePayload).then(({ error }) => {
                if (error) {
                    console.error("Supabase Save Error:", error);
                    this.showToast('Error al guardar en servidor', 'error');
                }
            });
        }



        this.renderProfile();
        this.closeEditPersonal();
        this.showToast('Perfil actualizado');
    },

    // Wrappers for HTML buttons
    addExperience() {
        this.openEditExperience();
    },

    addEducation() {
        this.openEditEducation();
    },

    // ============================================
    // EXPERIENCE MANAGEMENT
    // ============================================

    renderExperience() {
        const expList = this.currentUser.experience || this.userProfile.experience || [];
        const container = document.getElementById('experienceList');
        if (!container) return;

        if (expList.length === 0) {
            container.innerHTML = '<div style="color: #6c757d; font-size: 14px; padding: 8px 0;">No has agregado experiencia laboral.</div>';
            return;
        }

        container.innerHTML = expList.map((exp, index) => {
            const isCurrent = exp.isCurrent || exp.is_current;
            const initial = (exp.company || '?').charAt(0).toUpperCase();
            const period = exp.period || '';
            const isLast = index === expList.length - 1;
            const periodColor = isCurrent ? 'color: #1392ec; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;' : 'color: #6c757d; font-weight: 500;';
            const lineHtml = !isLast ? `<div style="position: absolute; left: 26px; top: 52px; bottom: 0; width: 2px; background: #E5E7EB;"></div>` : '';

            return `
            <div style="position: relative; display: flex; gap: 16px; padding-bottom: ${isLast ? '0' : '24px'};">
                ${lineHtml}
                <div style="position: relative; flex-shrink: 0; z-index: 1;">
                    <div style="height: 52px; width: 52px; border-radius: 8px; background: #ffffff; border: 1px solid #E5E7EB; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 20px; font-weight: 700; color: #6c757d;">${initial}</span>
                    </div>
                </div>
                <div style="flex: 1; padding-top: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="min-width: 0;">
                            <h3 style="font-weight: 700; font-size: 16px; line-height: 1.3; color: #212529; margin: 0;">${exp.role || ''}</h3>
                            <p style="font-size: 14px; color: #6c757d; margin: 2px 0 0;">${exp.company || ''}${exp.type ? ' • ' + exp.type : ''}</p>
                        </div>
                        <button onclick="app.openEditExperience(${index})" style="color: #9CA3AF; background: none; border: none; cursor: pointer; padding: 4px; flex-shrink: 0; transition: color 0.15s;" onmouseenter="this.style.color='#1392ec'" onmouseleave="this.style.color='#9CA3AF'">
                            <span class="material-icons" style="font-size: 20px;">edit</span>
                        </button>
                    </div>
                    <p style="font-size: 12px; ${periodColor} margin: 8px 0 0;">${period}</p>
                </div>
            </div>`;
        }).join('');
    },

    openEditExperience(index = null) {
        const modal = document.getElementById('editExperienceModal');
        if (!modal) return;

        const title = document.getElementById('expModalTitle');
        const expIndex = document.getElementById('expIndex');
        const role = document.getElementById('expRole');
        const company = document.getElementById('expCompany');
        const start = document.getElementById('expStartDate');
        const end = document.getElementById('expEndDate');
        const current = document.getElementById('expCurrent');

        // Reset fields
        expIndex.value = '';
        role.value = '';
        company.value = '';
        start.value = '';
        end.value = '';
        current.checked = false;
        if (end) end.disabled = false;

        if (index !== null) {
            // Edit Mode
            const list = this.currentUser.experience || this.userProfile.experience || [];
            const item = list[index];
            if (item) {
                title.textContent = 'Editar Experiencia';
                expIndex.value = index;
                role.value = item.role;
                company.value = item.company;

                // Parse Period "YYYY - YYYY" or "MM/YYYY - Presente"
                // This is a simple parser, might need adjustment based on how data is stored
                // Assuming "Month YYYY - Month YYYY" or just free text. 
                // For simplicity in this demo, we might not auto-fill dates perfectly if they aren't stored structured.
                // We will try to rely on user re-entering if structure is complex.

                if (item.period && item.period.includes('Presente')) {
                    current.checked = true;
                    end.disabled = true;
                }
            }
        } else {
            // Add Mode
            title.textContent = 'Agregar Experiencia';
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    closeEditExperience() {
        const modal = document.getElementById('editExperienceModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    toggleExpEndDate() {
        const checkbox = document.getElementById('expCurrent');
        const endInput = document.getElementById('expEndDate');
        const endGroup = document.getElementById('expEndDateGroup');
        if (checkbox && endInput) {
            endInput.disabled = checkbox.checked;
            if (checkbox.checked) {
                endInput.value = '';
                endInput.style.backgroundColor = '#f3f4f6';
                endInput.style.color = '#9CA3AF';
                if (endGroup) { endGroup.style.opacity = '0.6'; endGroup.style.pointerEvents = 'none'; }
            } else {
                endInput.style.backgroundColor = '#ffffff';
                endInput.style.color = '#212529';
                if (endGroup) { endGroup.style.opacity = '1'; endGroup.style.pointerEvents = 'auto'; }
            }
        }
    },

    // ===== VIDEO PITCH LOGIC =====
    requestVideoUpload() {
        document.getElementById('videoPitchInput').click();
    },

    async handleVideoPitchUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            this.showToast('El video excede el límite de 50MB.', 'error');
            return;
        }

        // Check file type
        if (!file.type.startsWith('video/')) {
            this.showToast('Por favor sube un archivo de video válido.', 'error');
            return;
        }

        this.showToast('Subiendo video, por favor espera...', 'info');

        try {
            const { data: authData } = await window.supabaseClient.auth.getUser();
            if (!authData || !authData.user) throw new Error("Debes iniciar sesión para subir un video.");
            const userId = authData.user.id;

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}_video_pitch_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
                .from('videos')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = window.supabaseClient.storage
                .from('videos')
                .getPublicUrl(filePath);

            // Update user profile in database
            const { error: updateError } = await window.supabaseClient
                .from('profiles')
                .update({ video_url: publicUrl })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Update local state
            if (this.currentUser) this.currentUser.videoUrl = publicUrl;
            if (this.userProfile) this.userProfile.videoUrl = publicUrl;
            localStorage.setItem('talently_user', JSON.stringify(this.currentUser || this.userProfile));

            this.showToast('¡Video subido y actualizado con éxito!', 'success');

            // Initialize the player with the new video
            this.initializeVideoPitch();

        } catch (error) {
            console.error('Error uploading video:', error);
            this.showToast('Error al subir el video: ' + error.message, 'error');
        }
    },

    initializeVideoPitch() {
        const user = this.currentUser || this.userProfile;
        const videoUrl = user?.videoUrl || user?.video_url;

        const emptyState = document.getElementById('videoPitchEmptyState');
        const player = document.getElementById('videoPitchPlayer');
        const controls = document.getElementById('videoPitchControls');

        if (!emptyState || !player || !controls) return;

        if (videoUrl) {
            emptyState.style.display = 'none';
            player.style.display = 'block';
            controls.style.display = 'flex';

            player.src = videoUrl;

            // Setup timeupdate and duration events
            player.addEventListener('timeupdate', this.updateVideoProgress);
            player.addEventListener('loadedmetadata', this.updateVideoDuration);
            player.addEventListener('ended', () => {
                const btn = document.getElementById('videoPitchPlayBtn');
                if (btn) btn.innerHTML = '<span class="material-icons" style="font-size: 40px;">replay</span>';
                if (controls) controls.style.opacity = '1';
            });
        } else {
            emptyState.style.display = 'flex';
            player.style.display = 'none';
            controls.style.display = 'none';
            player.src = '';
        }
    },

    toggleVideoPitchPlayback() {
        const player = document.getElementById('videoPitchPlayer');
        const btn = document.getElementById('videoPitchPlayBtn');
        const controls = document.getElementById('videoPitchControls');

        if (!player || !btn) return;

        if (player.paused || player.ended) {
            player.play();
            btn.innerHTML = '<span class="material-icons" style="font-size: 40px;">pause</span>';
            // Fade out controls slightly when playing
            if (controls) {
                controls.style.transition = 'opacity 0.3s';
                controls.style.opacity = '0';
            }
        } else {
            player.pause();
            btn.innerHTML = '<span class="material-icons" style="font-size: 40px;">play_arrow</span>';
            // Show controls when paused
            if (controls) controls.style.opacity = '1';
        }
    },

    updateVideoProgress(e) {
        const player = e.target;
        const timeDisplay = document.getElementById('videoPitchTime');
        const progressBar = document.getElementById('videoPitchProgress');

        if (timeDisplay && player.currentTime) {
            const mins = Math.floor(player.currentTime / 60);
            const secs = Math.floor(player.currentTime % 60);
            timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        if (progressBar && player.duration) {
            const percentage = (player.currentTime / player.duration) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    },

    updateVideoDuration(e) {
        const player = e.target;
        const durationDisplay = document.getElementById('videoPitchDuration');

        if (durationDisplay && player.duration) {
            const mins = Math.floor(player.duration / 60);
            const secs = Math.floor(player.duration % 60);
            durationDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    },

    seekVideoPitch(e) {
        const progressBarContainer = e.currentTarget;
        const player = document.getElementById('videoPitchPlayer');
        if (!player || !player.duration) return;

        const rect = progressBarContainer.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;

        player.currentTime = percentage * player.duration;
    },
    // ===== END VIDEO PITCH LOGIC =====

    saveExperience() {
        const indexStr = document.getElementById('expIndex').value;
        const role = document.getElementById('expRole').value;
        const company = document.getElementById('expCompany').value;
        const start = document.getElementById('expStartDate').value; // YYYY-MM
        const end = document.getElementById('expEndDate').value; // YYYY-MM
        const current = document.getElementById('expCurrent').checked;

        if (!role || !company || !start) {
            this.showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (!current && !end) {
            this.showToast('Indica fecha de fin o selecciona "Actualmente"', 'error');
            return;
        }

        const formatMonth = (val) => {
            if (!val) return '';
            const [y, m] = val.split('-');
            const date = new Date(y, m - 1);
            return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        };

        const period = `${formatMonth(start)} - ${current ? 'Presente' : formatMonth(end)}`;

        const newItem = {
            id: Date.now(),
            role,
            company,
            period,
            start_date: start,
            end_date: end,
            is_current: current,
            description: ''
        };

        if (!Array.isArray(this.currentUser.experience)) {
            this.currentUser.experience = [];
        }

        // Ensure we work with the main list
        const targetList = this.currentUser.experience;

        if (indexStr !== '') {
            // Update
            const idx = parseInt(indexStr);
            if (targetList[idx]) {
                targetList[idx] = { ...targetList[idx], ...newItem, id: targetList[idx].id };
            }
        } else {
            // Add
            targetList.push(newItem);
        }


        // Update Backend (Mock) - In real app, call Supabase here.
        // For now, we update local state and re-render.
        this.renderExperience();
        this.closeEditExperience();
        this.showToast('Experiencia guardada');

        // Persist to Supabase
        this.saveProfile();
    },

    removeExperience(index) {
        if (!confirm('¿Seguro que deseas eliminar esta experiencia?')) return;

        const list = this.currentUser.experience || this.userProfile.experience;
        if (list && list[index]) {
            list.splice(index, 1);
            this.renderExperience();
            this.showToast('Experiencia eliminada');
            // Persist to Supabase
            this.saveProfile();
        }
    },


    // ============================================
    // EDUCATION MANAGEMENT
    // ============================================

    renderEducation() {
        const eduList = (Array.isArray(this.currentUser.education) ? this.currentUser.education : [])
            || (Array.isArray(this.userProfile.education) ? this.userProfile.education : [])
            || [];
        const container = document.getElementById('educationList');

        if (!container) return;

        if (eduList.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 14px; padding: 10px 0;">No has agregado educación.</div>';
            return;
        }

        container.innerHTML = eduList.map((edu, index) => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h4 class="timeline-title">${edu.degree}</h4>
                            <div class="timeline-subtitle">${edu.school}</div>
                            <div class="timeline-date">${edu.period}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="icon-btn" onclick="app.openEditEducation(${index})">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button class="icon-btn" onclick="app.removeEducation(${index})" style="color: var(--danger);">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    openEditEducation(index = null) {
        const modal = document.getElementById('editEducationModal');
        if (!modal) return;

        const title = document.getElementById('eduModalTitle');
        const eduIndex = document.getElementById('eduIndex');
        const degree = document.getElementById('eduDegree');
        const school = document.getElementById('eduSchool');
        const fieldOfStudy = document.getElementById('eduFieldOfStudy');
        const start = document.getElementById('eduStartDate');
        const end = document.getElementById('eduEndDate');
        const endGroup = document.getElementById('eduEndDateGroup');
        const current = document.getElementById('eduCurrent');

        // Reset form
        eduIndex.value = '';
        degree.value = '';
        school.value = '';
        if (fieldOfStudy) fieldOfStudy.value = '';
        start.value = '';
        end.value = '';
        current.checked = false;
        if (end) { end.disabled = false; end.style.backgroundColor = '#ffffff'; end.style.color = '#1f2937'; }
        if (endGroup) { endGroup.style.opacity = '1'; endGroup.style.pointerEvents = 'auto'; }

        if (index !== null) {
            const list = this.currentUser.education || this.userProfile.education || [];
            const item = list[index];
            if (item) {
                title.textContent = 'Editar formación';
                eduIndex.value = index;
                degree.value = item.degree || '';
                school.value = item.school || '';
                if (fieldOfStudy) fieldOfStudy.value = item.field_of_study || '';
                if (item.start_date) start.value = item.start_date;
                if (item.end_date) end.value = item.end_date;

                if (item.is_current || (item.period && item.period.includes('Presente'))) {
                    current.checked = true;
                    if (end) { end.disabled = true; end.style.backgroundColor = '#f3f4f6'; end.style.color = '#9ca3af'; }
                    if (endGroup) { endGroup.style.opacity = '0.5'; endGroup.style.pointerEvents = 'none'; }
                }
            }
        } else {
            title.textContent = 'Nueva formación';
        }

        // Render timeline inside modal
        this.renderEduTimeline();

        modal.style.display = 'flex';
    },

    clearEduForm() {
        const title = document.getElementById('eduModalTitle');
        const eduIndex = document.getElementById('eduIndex');
        const degree = document.getElementById('eduDegree');
        const school = document.getElementById('eduSchool');
        const fieldOfStudy = document.getElementById('eduFieldOfStudy');
        const start = document.getElementById('eduStartDate');
        const end = document.getElementById('eduEndDate');
        const endGroup = document.getElementById('eduEndDateGroup');
        const current = document.getElementById('eduCurrent');

        if (title) title.textContent = 'Nueva formación';
        if (eduIndex) eduIndex.value = '';
        if (degree) degree.value = '';
        if (school) school.value = '';
        if (fieldOfStudy) fieldOfStudy.value = '';
        if (start) start.value = '';
        if (end) { end.value = ''; end.disabled = false; end.style.backgroundColor = '#ffffff'; end.style.color = '#1f2937'; }
        if (endGroup) { endGroup.style.opacity = '1'; endGroup.style.pointerEvents = 'auto'; }
        if (current) current.checked = false;

        // Scroll form into view
        if (title) title.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    renderEduTimeline() {
        const container = document.getElementById('eduTimeline');
        if (!container) return;

        const eduList = (Array.isArray(this.currentUser?.education) ? this.currentUser.education : [])
            || (Array.isArray(this.userProfile?.education) ? this.userProfile.education : [])
            || [];

        if (eduList.length === 0) {
            container.innerHTML = '<div style="color: #9ca3af; font-size: 14px; padding: 8px 0;">No has agregado educación aún.</div>';
            return;
        }

        container.innerHTML = eduList.map((edu, index) => {
            const initial = (edu.school || '?').charAt(0).toUpperCase();
            const period = edu.period || '';
            const fieldText = edu.field_of_study ? `<p style="font-size: 13px; font-weight: 500; color: #4b5563; margin: 4px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${edu.field_of_study}</p>` : '';

            return `
            <div style="display: flex; gap: 16px; background: #ffffff; padding: 16px; margin-bottom: 12px; justify-content: space-between; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; transition: border-color 0.15s;" onmouseenter="this.style.borderColor='rgba(19,146,236,0.3)'" onmouseleave="this.style.borderColor='#e5e7eb'">
                <div style="display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 0;">
                    <div style="width: 60px; height: 60px; border-radius: 8px; background: #f3f4f6; border: 1px solid #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #1392ec;">
                        ${initial}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <p style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${edu.school || ''}</p>
                        <p style="font-size: 14px; font-weight: 500; color: #4b5563; margin: 4px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${edu.degree || ''}</p>
                        ${fieldText}
                        <p style="font-size: 12px; font-weight: 700; color: #1392ec; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.05em;">${period}</p>
                    </div>
                </div>
                <div style="flex-shrink: 0; display: flex; align-items: center;">
                    <button onclick="app.openEditEducation(${index})" style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: all 0.15s;" onmouseenter="this.style.color='#1392ec';this.style.background='#f3f4f6'" onmouseleave="this.style.color='#9ca3af';this.style.background='none'">
                        <span class="material-icons" style="font-size: 20px;">edit</span>
                    </button>
                </div>
            </div>`;
        }).join('');
    },

    closeEditEducation() {
        const modal = document.getElementById('editEducationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    toggleEduEndDate() {
        const checkbox = document.getElementById('eduCurrent');
        const endInput = document.getElementById('eduEndDate');
        const endGroup = document.getElementById('eduEndDateGroup');
        if (checkbox && endInput) {
            endInput.disabled = checkbox.checked;
            if (checkbox.checked) {
                endInput.value = '';
                endInput.style.backgroundColor = '#f3f4f6';
                endInput.style.color = '#9ca3af';
                if (endGroup) { endGroup.style.opacity = '0.5'; endGroup.style.pointerEvents = 'none'; }
            } else {
                endInput.style.backgroundColor = '#ffffff';
                endInput.style.color = '#1f2937';
                if (endGroup) { endGroup.style.opacity = '1'; endGroup.style.pointerEvents = 'auto'; }
            }
        }
    },

    saveEducation() {
        const indexStr = document.getElementById('eduIndex').value;
        const degree = document.getElementById('eduDegree').value;
        const school = document.getElementById('eduSchool').value;
        const fieldOfStudy = document.getElementById('eduFieldOfStudy')?.value || '';
        const start = document.getElementById('eduStartDate').value;
        const end = document.getElementById('eduEndDate').value;
        const current = document.getElementById('eduCurrent').checked;

        if (!degree || !school || !start) {
            this.showToast('Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (!current && !end) {
            this.showToast('Indica fecha de fin o selecciona "Cursando actualmente"', 'error');
            return;
        }

        const formatMonth = (val) => {
            if (!val) return '';
            const [y, m] = val.split('-');
            const date = new Date(y, m - 1);
            return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        };

        const period = `${formatMonth(start)} - ${current ? 'Presente' : formatMonth(end)}`;

        const newItem = {
            id: Date.now(),
            degree,
            school,
            field_of_study: fieldOfStudy,
            period,
            start_date: start,
            end_date: end,
            is_current: current
        };

        if (!Array.isArray(this.currentUser.education)) {
            this.currentUser.education = [];
        }

        const targetList = this.currentUser.education;

        if (indexStr !== '') {
            const idx = parseInt(indexStr);
            if (targetList[idx]) {
                targetList[idx] = { ...targetList[idx], ...newItem, id: targetList[idx].id };
            }
        } else {
            targetList.push(newItem);
        }

        this.renderEducation();
        this.closeEditEducation();
        this.showToast('Educación guardada');

        // Persist to Supabase
        this.saveProfile();
    },

    removeEducation(index) {
        if (!confirm('¿Seguro que deseas eliminar esta educación?')) return;

        const list = this.currentUser.education || this.userProfile.education;
        if (list && list[index]) {
            list.splice(index, 1);
            this.renderEducation();
            this.showToast('Educación eliminada');
            // Persist to Supabase
            this.saveProfile();
        }
    },

    // ============================================
    // SKILLS MANAGEMENT
    // ============================================

    openEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (!modal) return;

        // Copy current skills to temp array
        this.skillsSelected = [...(this.currentUser.skills || [])];

        // Clear search si existe (como en onboarding-company)
        const searchInput = document.getElementById('editSkillsSearch');
        if (searchInput) searchInput.value = '';

        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles();

        // Populate areas dropdown if empty
        this.populateProfessionalAreas();

        modal.classList.add('active');
        modal.style.display = 'flex';
    },

    async populateProfessionalAreas() {
        const areaSelect = document.getElementById('editSkillsArea');
        if (!areaSelect || areaSelect.options.length > 1) return; // Already populated or missing

        try {
            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const { data: areas, error } = await window.talentlyBackend.reference.getAreas();
                if (areas && areas.length > 0) {
                    // Clear existing options except first
                    areaSelect.innerHTML = '<option value="">Selecciona un área</option>';

                    areas.forEach(area => {
                        const option = document.createElement('option');
                        option.value = area.slug; // Use slug for API calls
                        option.textContent = area.name;
                        areaSelect.appendChild(option);
                    });
                }
            } else {
                // Fallback areas if backend not ready
                const fallbackAreas = [
                    { slug: 'desarrollo', name: 'Desarrollo de Software' },
                    { slug: 'diseno-ux', name: 'Diseño UX/UI' },
                    { slug: 'producto', name: 'Gestión de Producto' },
                    { slug: 'marketing', name: 'Marketing Digital' },
                    { slug: 'data', name: 'Data Science & Analytics' },
                    { slug: 'ventas', name: 'Ventas' },
                    { slug: 'rrhh', name: 'Recursos Humanos' },
                    { slug: 'finanzas', name: 'Finanzas' },
                ];

                areaSelect.innerHTML = '<option value="">Selecciona un área</option>';
                fallbackAreas.forEach(area => {
                    const option = document.createElement('option');
                    option.value = area.slug;
                    option.textContent = area.name;
                    areaSelect.appendChild(option);
                });
            }
        } catch (e) {
            console.error('Error populating areas:', e);
        }
    },

    closeEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    },

    renderSelectedSkillsChips() {
        const container = document.getElementById('editSkillsSelected');
        if (!container) return;

        container.innerHTML = this.skillsSelected.map(skill => `
            <span class="skill-badge" style="background: var(--primary); color: white; border: none; padding-right: 8px; display: inline-flex; align-items: center;">
                ${skill}
                <button onclick="app.toggleSkill('${skill}')" style="background:none; border:none; color:white; margin-left:6px; cursor:pointer; font-weight:bold; font-size: 16px; line-height: 1;">&times;</button>
            </span>
        `).join('');
    },

    async renderEditSkillsBubbles() {
        const areaSelect = document.getElementById('editSkillsArea');
        const areaSlug = areaSelect ? areaSelect.value : '';
        const container = document.getElementById('editSkillsBubbles');
        if (!container) return;

        if (!areaSlug) {
            container.innerHTML = '<div style="color: var(--text-secondary); padding: 10px;">Selecciona una área para ver habilidades.</div>';
            return;
        }

        container.innerHTML = '<div style="padding: 10px;">Cargando habilidades...</div>';

        let availableSkills = [];

        // Validar si window.talentlyBackend existe y está listo
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.reference.getSkills(areaSlug);
                if (data) {
                    // Map object list to string array if necessary, or use objects. 
                    // The current implementation uses strings for selections.
                    availableSkills = data.map(s => s.name);
                }
            } catch (err) {
                console.error("Error fetching skills:", err);
            }
        }

        // Fallback if no backend or empty result
        if (availableSkills.length === 0) {
            const fallbackSkills = {
                'desarrollo': ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'Git', 'AWS', 'Docker'],
                'diseno-ux': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing', 'UI Design'],
                'producto': ['Agile', 'Scrum', 'Product Management', 'Roadmapping', 'Jira', 'User Stories'],
                'marketing': ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Google Analytics', 'Email Marketing'],
                'data': ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Big Data'],
                'ventas': ['CRM', 'Negociación', 'Prospección', 'Cierre de ventas', 'Salesforce'],
                'rrhh': ['Reclutamiento', 'Selección', 'Clima Laboral', 'Entrevistas', 'Onboarding'],
                'finanzas': ['Excel', 'Contabilidad', 'Análisis Financiero', 'Presupuesto', 'Auditoría'],
                'other': ['Inglés', 'Comunicación', 'Liderazgo', 'Trabajo en equipo', 'Resolución de problemas']
            };
            availableSkills = fallbackSkills[areaSlug] || [];
        }

        if (availableSkills.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); padding: 10px;">No hay habilidades disponibles para esta área.</div>';
            return;
        }

        container.innerHTML = availableSkills.map(skill => {
            const isSelected = this.skillsSelected.includes(skill);
            return `
                <button class="skill-bubble ${isSelected ? 'selected' : ''}" 
                    style="${isSelected ? 'background: var(--primary); color: white;' : 'background: var(--bg); color: var(--text-primary); border: 1px solid var(--border);'} padding: 8px 16px; border-radius: 20px; cursor: pointer; margin: 4px;"
                    onclick="app.toggleSkill('${skill}')">
                    ${skill}
                </button>
            `;
        }).join('');
    },

    toggleSkill(skill) {
        if (this.skillsSelected.includes(skill)) {
            this.skillsSelected = this.skillsSelected.filter(s => s !== skill);
        } else {
            if (this.skillsSelected.length >= 10) {
                this.showToast('Máximo 10 habilidades', 'error');
                return;
            }
            this.skillsSelected.push(skill);
        }
        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles();
    },

    async saveEditSkills() {
        this.currentUser.skills = [...this.skillsSelected];
        // Sync with mock
        this.userProfile.skills = this.currentUser.skills;

        // Attempt backend save
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                // NOTE: Profiles create/upsert requires the full object or it mimics a patch if designed so.
                // Based on supabase-client.js, it creates a payload with ...profileData.
                // If we send only skills, it might overwrite other fields if not careful, 
                // OR if supabase Upsert works as "Patch" for existing IDs (it usually replaces).
                // SAFE APPROACH: Since we don't have a specific PATCH method exposed in the wrapper,
                // we will update the local 'currentUser' object fully and then send it... 
                // BUT simpler is to assume we just want to save skills.
                // If the wrapper does an 'upsert' on just {skills: ...}, the other columns might become null 
                // if it's a replace-upsert. Standard Supabase upsert updates match columns and replaces others.
                // WE SHOULD FETCH FIRST or better, assume the wrapper should handle this.
                // FOR NOW, we just update local and try to send {skills} knowing it might be risky
                // if the wrapper doesn't handle partials. 
                // IMPROVEMENT: Let's fetch the full profile first? No, we have this.currentUser.
                // Let's rely on profiles.create acting as an upsert/update.

                // To be safe against data loss, we'll strip known 'view-only' fields if any, 
                // but for now let's just send the skills update combined with what we have locally?
                // Actually, let's keep it simple: just update local state which drives the UI.
                // And do a "best effort" persist.

                // Construct a CLEAN payload that matches the 'profiles' table schema.
                // We must map local property names to DB column names.
                const profilePayload = {
                    // Map local 'name' -> DB 'name'
                    name: this.currentUser.name,

                    // Map local 'current_position' -> DB 'current_position'
                    current_position: this.currentUser.current_position || this.currentUser.professional_title,

                    // Location (DB uses 'country' and 'city')
                    country: this.currentUser.country,
                    city: this.currentUser.city_id,

                    // Other fields
                    expected_salary: this.currentUser.expected_salary || this.currentUser.salary,
                    currency: this.currentUser.currency,
                    work_modality: this.currentUser.work_modality,
                    availability: this.currentUser.availability,
                    bio: this.currentUser.bio,

                    // Send skills - Schema has 'skills' column
                    skills: this.currentUser.skills
                };

                // Remove undefined/null keys to avoid sending bad data
                Object.keys(profilePayload).forEach(key =>
                    profilePayload[key] === undefined && delete profilePayload[key]
                );

                await window.talentlyBackend.profiles.create(profilePayload);

            } catch (e) {
                console.error('Error saving skills to backend:', e);
            }
        }

        this.renderProfile();
        this.closeEditSkills();
        this.showToast('Habilidades actualizadas');
    },

    async logout() {
        this.isAuthenticated = false;

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            await window.talentlyBackend.auth.signOut();
        }

        localStorage.removeItem('talently_logged_in');
        localStorage.removeItem('talently_user_type');
        localStorage.removeItem('talently_current_user');

        // Force fully clear potentially sticky Supabase session from localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) localStorage.removeItem(key);
        });

        window.location.reload();
    },
    async renderCard() {
        const cardStack = document.getElementById('cardStack');

        let displayProfiles = [];

        // 1. Fetch Real Profiles from DB
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const { data, error } = await window.talentlyBackend.profiles.getDiscovery('candidate'); // Fetches 'company' type
            if (data && data.length > 0) {
                displayProfiles = data.map(p => ({
                    ...p,
                    // Map DB fields to UI expected fields
                    title: p.role || p.industry || 'Empresa',
                    tags: p.benefits || (p.industry ? [p.industry] : []),
                    salary: p.salary_range || 'Salario no visible',
                    modality: p.location || 'Remoto'
                }));
            }
        }

        if (displayProfiles.length === 0) {
            // FALLBACK TO MOCK
            displayProfiles = [...this.profiles];
        }

        // Combine with local company offers if any
        if (this.companyOffers && this.companyOffers.length > 0) {
            const realOffers = this.companyOffers.map(offer => ({
                id: offer.id,
                name: 'Tu Empresa (Demo)',
                title: offer.title,
                image: 'https://ui-avatars.com/api/?name=Talently+Business&background=6c5ce7&color=fff&size=400',
                tags: offer.skills ? offer.skills.split(',').slice(0, 3) : ['Hiring'],
                location: 'Remoto',
                salary: offer.salary,
                modality: offer.modality
            }));
            displayProfiles = [...realOffers, ...displayProfiles];
        }

        // Shadow cards visibility
        const shadow1 = document.getElementById('cardShadow1');
        const shadow2 = document.getElementById('cardShadow2');

        // Index Check
        if (this.currentIndex >= displayProfiles.length) {
            cardStack.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 40px; font-family: 'Inter', sans-serif;">
                    <span class="material-icons" style="font-size: 64px; color: #e2e8f0; margin-bottom: 16px;">check_circle</span>
                    <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 8px;">¡Has revisado todos los perfiles!</h3>
                    <p style="font-size: 14px; color: #94a3b8; margin: 0;">Vuelve más tarde para ver nuevas oportunidades</p>
                </div>
            `;
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

        const profile = displayProfiles[this.currentIndex];

        // Store DATA for logic
        this.currentProfileData = profile;

        // Build skill tags HTML (small bordered chips)
        const tagsHtml = profile.tags ? profile.tags.slice(0, 4).map(tag =>
            `<span style="font-size: 12px; border: 1px solid #e5e7eb; padding: 4px 8px; border-radius: 4px; color: #6b7280;">${tag}</span>`
        ).join('') : '';

        // Build info chips with icons
        const modalityChip = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #f3f4f6; font-size: 13px; font-weight: 500; border-radius: 8px; color: #4b5563;">
            <span class="material-icons" style="font-size: 14px;">work_outline</span> ${profile.modality || 'Remoto'}
        </span>`;

        const typeChip = `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #f3f4f6; font-size: 13px; font-weight: 500; border-radius: 8px; color: #4b5563;">
            <span class="material-icons" style="font-size: 14px;">schedule</span> Full-time
        </span>`;

        const salaryChip = profile.salary ? `<span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #EFF6FF; font-size: 13px; font-weight: 500; border-radius: 8px; color: #2563EB;">
            <span class="material-icons" style="font-size: 14px;">attach_money</span> ${profile.salary}
        </span>` : '';

        // Match % calculation
        const matchPct = profile.match_score || Math.floor(Math.random() * 15 + 85);

        // Time ago
        let timeAgo = 'Publicado recientemente';
        if (profile.created_at) {
            const diff = Date.now() - new Date(profile.created_at).getTime();
            const hours = Math.floor(diff / 3600000);
            if (hours < 1) timeAgo = 'Hace unos minutos';
            else if (hours < 24) timeAgo = `Hace ${hours}h`;
            else timeAgo = `Hace ${Math.floor(hours / 24)}d`;
        }

        // Logo
        const logoInitial = (profile.company || profile.name || 'E').charAt(0).toUpperCase();
        const logoSrc = profile.image || profile.logo;
        const logoHtml = logoSrc
            ? `<img src="${logoSrc}" alt="${profile.name}" style="width: 64px; height: 64px; border-radius: 16px; object-fit: cover;">`
            : `<div style="width: 64px; height: 64px; background: #EFF6FF; border-radius: 16px; display: flex; align-items: center; justify-content: center;"><span style="color: #3b82f6; font-weight: 700; font-size: 24px;">${logoInitial}</span></div>`;

        const escapedId = String(profile.id).replace(/'/g, "\\'");

        cardStack.innerHTML = `
            <div id="currentCard" style="width: 100%; height: 100%; background: #fff; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); padding: 24px; display: flex; flex-direction: column; position: relative; overflow: hidden; border: 1px solid #e5e7eb; font-family: 'Inter', sans-serif;">
                <!-- Gradient top -->
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 128px; background: linear-gradient(to right, rgba(239,246,255,0.5), rgba(238,242,255,0.5)); opacity: 0.5; pointer-events: none; z-index: 0;"></div>

                <!-- Top row: logo + match badge -->
                <div style="position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div style="background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; overflow: hidden;">
                        ${logoHtml}
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                        <span style="padding: 4px 12px; background: rgba(16,185,129,0.1); color: #15803d; font-size: 12px; font-weight: 600; border-radius: 9999px;">${matchPct}% Match</span>
                        <span style="font-size: 11px; color: #9ca3af;">${timeAgo}</span>
                    </div>
                </div>

                <!-- Title + Company -->
                <div style="position: relative; z-index: 10; flex: 1; display: flex; flex-direction: column;">
                    <h2 style="font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px; line-height: 1.15;">${profile.title || profile.name}</h2>
                    <p style="font-size: 18px; font-weight: 500; color: #6b7280; margin: 0 0 24px;">${profile.company || profile.name}</p>

                    <!-- Info chips -->
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;">
                        ${modalityChip}
                        ${typeChip}
                        ${salaryChip}
                    </div>

                    <!-- Description -->
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${profile.description || profile.value_proposition || ''}</p>

                    <!-- Skill tags -->
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: auto;">
                        ${tagsHtml}
                    </div>
                </div>

                <!-- View Details -->
                <div style="position: relative; z-index: 10; width: 100%; margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
                    <button onclick="event.stopPropagation(); app.openCardDetail('offer')" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 14px; font-weight: 600; color: #3b82f6; background: none; border: none; cursor: pointer; padding: 4px; font-family: inherit; transition: color 0.2s;">
                        Ver detalles <span class="material-icons" style="font-size: 16px;">expand_more</span>
                    </button>
                </div>
            </div>
        `;

        // Store DOM ELEMENT for animation
        this.currentProfileCard = document.getElementById('currentCard');

        // Restore Event Listeners for Swipe
        this.setupSwipeGestures();
    },

    async openChat(matchId, matchName) {
        this.currentMatchId = String(matchId); // FORCE STRING ID for consistency

        // FIX: Add chat-mode class to body to hide bottom nav
        document.body.classList.add('chat-mode');

        // 1. Find Match Data
        let matchIndex = (this.matches || []).findIndex(m => String(m.id) === String(matchId));
        let match = matchIndex !== -1 ? this.matches[matchIndex] : null;

        // FIX: Look up fresh data from mockProfiles but ONLY if it's a mock profile ID (1-100)
        // This prevents overwriting custom test matches or real matches logic
        const isMockId = matchId && !String(matchId).includes('-') && Number(matchId) <= 100;

        // FIX: Generic find for ANY mock profile to avoid "Startup Lab" errors
        const freshProfile = (isMockId && window.mockProfiles) ? window.mockProfiles.find(p => String(p.id) === String(matchId)) : null;

        if (freshProfile && match) {
            match = { ...match, ...freshProfile };
            if (matchIndex !== -1) this.matches[matchIndex] = match;
        } else if (freshProfile && !match) {
            // If we have profile data but no match record (edge case), create a temp one
            match = { ...freshProfile };
        }

        // --- FIX: CLEAR UNREAD STATUS ---
        if (match && match.hasUnread) {
            match.hasUnread = false;
            if (matchIndex !== -1) this.matches[matchIndex] = match;
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.updateBadge();
            if (typeof this.renderMatches === 'function') this.renderMatches();
        }
        // --------------------------------

        let name = match ? (match.name || match.company_name) : (matchName || 'Usuario');
        let avatarSrc = (match && (match.logo || match.image || match.avatar))
            ? (match.logo || match.image || match.avatar)
            : null;

        // If name is still 'Usuario' and this is a real match, try fetching from backend
        const isRealId = typeof matchId === 'string' && String(matchId).includes('-');
        if (name === 'Usuario' && isRealId && window.talentlyBackend && window.talentlyBackend.isReady) {
            // Find the other user ID from the match record
            const otherUserId = match ? match.otherUserId : null;
            if (otherUserId) {
                try {
                    const { data: companyData } = await window.talentlyBackend.companies.getById(otherUserId);
                    if (companyData) {
                        name = companyData.name || 'Empresa';
                        avatarSrc = companyData.logo_url || avatarSrc;
                    }
                } catch (e) { /* ignore */ }
            }
        }

        if (!avatarSrc) avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

        // 2. Update Header UI
        const candidateHeader = document.querySelector('.chat-company-name');
        if (candidateHeader) candidateHeader.textContent = name;

        const companyHeader = document.querySelector('#companyChatName');
        if (companyHeader) companyHeader.textContent = name;

        // Update Roles — hide if no role
        const roleText = (match && match.title) ? match.title : '';
        const candidateRole = document.querySelector('.chat-company-role');
        if (candidateRole) {
            candidateRole.textContent = roleText;
            candidateRole.style.display = roleText ? '' : 'none';
        }

        // Online status — hide by default (no real presence tracking)
        const chatOnline = document.getElementById('chatOnlineStatus');
        if (chatOnline) chatOnline.style.display = 'none';
        const companyChatOnline = document.getElementById('companyChatOnlineStatus');
        if (companyChatOnline) {
            companyChatOnline.textContent = '● Desconectado';
            companyChatOnline.style.color = 'var(--text-secondary)';
        }

        const candidateAvatar = document.querySelector('.chat-avatar');
        if (candidateAvatar) candidateAvatar.src = avatarSrc;

        const companyAvatar = document.querySelector('#companyChatAvatar');
        if (companyAvatar) companyAvatar.src = avatarSrc;

        // 3. Show View
        if (document.getElementById('chatSection')) {
            this.showAppSection('chatSection');
        } else if (document.getElementById('messagesChatView')) {
            this.showCompanySection('messagesChatView');
        }

        // 4. Load Messages
        const messagesContainer = document.getElementById('chatMessages') || document.getElementById('companyChatMessages');
        if (messagesContainer) messagesContainer.innerHTML = '';

        const isRealMatch = typeof matchId === 'string' && matchId.includes('-');

        if (isRealMatch && window.talentlyBackend && window.talentlyBackend.isReady) {
            // Real Backend Logic...
            if (this.chatSubscription) {
                this.chatSubscription.unsubscribe();
                this.chatSubscription = null;
            }
            try {
                // Fetch previous messages...
                const { data: msgs } = await window.talentlyBackend.matches.getMessages(matchId);
                let isChatBlocked = false;
                if (msgs) {
                    msgs.forEach(m => {
                        this.appendMessageToUI(m.content, m.sender_id === this.userProfile.id ? 'sent' : 'received');
                        // Detect system closure message
                        if (m.content && m.content.startsWith('[Sistema]') && m.content.includes('cerrada')) {
                            isChatBlocked = true;
                        }
                    });
                }

                // Block chat if offer was closed
                if (isChatBlocked) {
                    this._blockChatInput('Esta conversación fue cerrada porque la oferta ya no está activa.');
                } else {
                    this._unblockChatInput();
                    // Subscribe only if chat is not blocked
                    this.chatSubscription = window.talentlyBackend.matches.subscribe(matchId, async (newMsg) => {
                        const { data: { user } } = await window.supabaseClient.auth.getUser();
                        if (user) {
                            const isMe = newMsg.sender_id === user.id;
                            if (!isMe) {
                                this.appendMessageToUI(newMsg.content, 'received');
                                // Check if the new message is a closure message
                                if (newMsg.content && newMsg.content.startsWith('[Sistema]') && newMsg.content.includes('cerrada')) {
                                    this._blockChatInput('Esta conversación fue cerrada porque la oferta ya no está activa.');
                                }
                            }
                        }
                    });
                }
            } catch (err) {
                console.error('Chat load error:', err);
                if (messagesContainer) messagesContainer.innerHTML = '<div style="text-align:center; padding:20px; color: var(--danger);">Error al cargar mensajes.</div>';
            }
        } else {
            // 5. Local Persistence Logic
            if (!this.localMessages) {
                try {
                    this.localMessages = JSON.parse(localStorage.getItem('talently_local_messages')) || {};
                } catch (e) {
                    this.localMessages = {};
                }
            }

            // FIX: Ensure consistency using String ID
            const safeId = String(matchId);
            const localMsgs = this.localMessages[safeId] || [];

            if (localMsgs.length > 0) {
                // Render persisted messages
                localMsgs.forEach(msg => {
                    this.appendMessageToUI(msg.content, msg.type);
                });
            } else {
                // First time welcome
                const welcomeMsg = match && match.lastMessage ? match.lastMessage : "¡Hola! Gracias por conectar.";

                setTimeout(() => {
                    this.appendMessageToUI(welcomeMsg, 'received');
                    this.saveLocalMessage(safeId, welcomeMsg, 'received');

                    setTimeout(() => {
                        const followUp = "Me interesa mucho tu perfil. ¿Podemos agendar una llamada?";
                        this.appendMessageToUI(followUp, 'received');
                        this.saveLocalMessage(safeId, followUp, 'received');
                    }, 1000);
                }, 300);
            }
        }
    },

    viewChatCandidateProfile() {
        if (!this.currentMatchId || !this.matches) return;
        const match = this.matches.find(m => String(m.id) === String(this.currentMatchId));
        if (match) {
            this.openCardDetail('candidate', 'match');
        }
    },

    async scheduleInterview() {
        this.closeCardDetail();
        if (!this.currentMatchId) return;

        const matchId = String(this.currentMatchId);
        const match = (this.matches || []).find(m => String(m.id) === matchId);

        if (!match) {
            this.showToast('Error: Match no encontrado.', 'error');
            return;
        }

        const isRealMatch = matchId.includes('-');

        if (isRealMatch && window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data: authData } = await window.supabaseClient.auth.getUser();
                if (!authData || !authData.user) throw new Error("Usuario no autenticado");
                const companyId = authData.user.id;
                const candidateId = match.otherUserId;

                if (!candidateId) throw new Error("ID del candidato no disponible");

                // Prevenir duplicados (opcional)
                const { data: existing } = await window.supabaseClient.from('interviews')
                    .select('id')
                    .eq('match_id', matchId)
                    .eq('company_id', companyId)
                    .maybeSingle();

                if (!existing) {
                    const { error: insertError } = await window.supabaseClient.from('interviews').insert([{
                        match_id: matchId,
                        company_id: companyId,
                        candidate_id: candidateId,
                        status: 'pending'
                    }]);

                    if (insertError) throw insertError;
                }

                // Enviar mensaje en el chat
                const text = "¡Nos encantaría agendarte una entrevista! ¿Cuándo podríamos tener una llamada?";
                await window.talentlyBackend.matches.sendMessage(matchId, text);

                this.showToast('Invitación a entrevista enviada exitosamente.');
            } catch (error) {
                console.error('Error al agendar entrevista:', error);
                this.showToast('Error al agendar la entrevista: ' + error.message, 'error');
            }
        } else {
            // Local fallback for mocks
            this.saveLocalMessage(matchId, "¡Nos encantaría agendarte una entrevista! ¿Cuándo podríamos tener una llamada?", 'sent');
            this.showToast('Invitación a entrevista simulada enviada.');

            // Actualizar UI local
            const matchIndex = (this.matches || []).findIndex(m => String(m.id) === matchId);
            if (matchIndex !== -1) {
                this.matches[matchIndex].lastMessage = "¡Nos encantaría agendarte una entrevista! ¿Cuándo podríamos tener una llamada?";
                this.matches[matchIndex].timestamp = new Date().toISOString();
                localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            }
        }
    },

    async discardMatchFromProfile() {
        if (!confirm('¿Estás seguro de que deseas descartar/eliminar este match?')) return;
        this.closeCardDetail();
        if (!this.currentMatchId) return;

        const matchId = String(this.currentMatchId);
        const isRealMatch = matchId.includes('-');

        if (isRealMatch && window.supabaseClient) {
            try {
                // Eliminar de base de datos
                await window.supabaseClient.from('matches').delete().eq('id', matchId);
            } catch (err) {
                console.error("Error al eliminar el match en la base de datos:", err);
            }
        }

        if (this.matches) {
            this.matches = this.matches.filter(m => String(m.id) !== matchId);
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.updateBadge();
        }

        this.backToConversationsList();
        this.showToast('Match eliminado exitosamente.');
    },

    saveLocalMessage(matchId, content, type) {
        if (!this.localMessages) this.localMessages = {};
        if (!this.localMessages[matchId]) this.localMessages[matchId] = [];

        this.localMessages[matchId].push({
            content,
            type,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('talently_local_messages', JSON.stringify(this.localMessages));
    },

    async sendMessageWithReceipts() {
        if (this._chatBlocked) return;
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        // Add to UI immediately
        this.appendMessageToUI(text, 'sent');

        // FIX: Ensure ID is string
        const matchId = String(this.currentMatchId);
        const isRealMatch = matchId.includes('-');

        if (isRealMatch && window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                await window.talentlyBackend.matches.sendMessage(matchId, text);
                // Track statistics
                window.talentlyBackend.statistics.increment('messages_sent').catch(e => console.warn('Stats error:', e));
            } catch (err) {
                console.error('Send error:', err);
                this.appendMessageToUI('Error al enviar', 'error');
            }
        } else {
            // Local Persistence
            this.saveLocalMessage(matchId, text, 'sent');

            // Update match last message preview
            const matchIndex = (this.matches || []).findIndex(m => String(m.id) === String(matchId));
            if (matchIndex !== -1) {
                const match = this.matches[matchIndex];
                match.lastMessage = text;
                match.timestamp = new Date().toISOString();

                // --- FIX: SAVE TO STORAGE ---
                // Save the updated matches array to localStorage so the list view updates
                localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            }
        }
    },


    // --- Unified Edit (Full Screen) ---

    openEditPersonal() {
        this.openEditProfileFullScreen();
    },

    setWorkModality(modality) {
        this.currentWorkModality = modality;
        const container = document.getElementById('workModalityContainer');
        if (!container) return;
        const buttons = container.querySelectorAll('.work-modality-btn');
        buttons.forEach(btn => {
            if (btn.dataset.val === modality) {
                btn.classList.add('border-[#1392ec]', 'text-[#1392ec]', 'dark:border-[#1392ec]', 'dark:text-[#1392ec]', 'bg-[#1392ec]/10', 'dark:bg-[#1392ec]/20');
                btn.classList.remove('border-slate-200', 'text-slate-500', 'dark:border-slate-700', 'dark:text-slate-400', 'bg-white', 'dark:bg-slate-800');
            } else {
                btn.classList.remove('border-[#1392ec]', 'text-[#1392ec]', 'dark:border-[#1392ec]', 'dark:text-[#1392ec]', 'bg-[#1392ec]/10', 'dark:bg-[#1392ec]/20');
                btn.classList.add('border-slate-200', 'text-slate-500', 'dark:border-slate-700', 'dark:text-slate-400', 'bg-white', 'dark:bg-slate-800');
            }
        });
    },

    openEditProfileFullScreen() {
        if (!this.currentUser) return;
        const modal = document.getElementById('editProfileFullScreen');
        if (modal) {
            // Populate Avatar
            const avatarPreview = document.getElementById('editProfileAvatarPreview');
            if (avatarPreview && this.currentUser.photo_url) {
                avatarPreview.style.backgroundImage = `url('${this.currentUser.photo_url}')`;
            }

            // Populate Text Fields
            const nameEl = document.getElementById('fullName');
            if (nameEl) nameEl.value = this.currentUser.name || '';

            const headlineEl = document.getElementById('headline');
            if (headlineEl) headlineEl.value = this.currentUser.current_position || '';

            const salaryEl = document.getElementById('salary');
            if (salaryEl) {
                salaryEl.value = this.currentUser.expected_salary ? this.currentUser.expected_salary : '';
            }

            const currencyEl = document.getElementById('editCurrency');
            if (currencyEl) currencyEl.value = (this.currentUser.currency || 'usd').toLowerCase();

            const bioEl = document.getElementById('bio');
            if (bioEl) bioEl.value = this.currentUser.about || this.currentUser.bio || '';

            // Update Work Modality
            this.currentWorkModality = this.currentUser.work_modality || 'remoto';
            this.setWorkModality(this.currentWorkModality);

            // Populate Country & City
            const countrySelect = document.getElementById('editCountry');
            const citySelect = document.getElementById('editCity');

            if (countrySelect && citySelect) {
                countrySelect.innerHTML = '<option value="">Selecciona País</option>';
                if (this.referenceData && this.referenceData.countries) {
                    this.referenceData.countries.forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c.id;
                        opt.textContent = c.name;
                        countrySelect.appendChild(opt);
                    });
                }

                let currentCountry = this.currentUser.country;
                if (currentCountry) {
                    const countryObj = this.referenceData && this.referenceData.countries.find(c => c.id == currentCountry || c.name === currentCountry);

                    if (countryObj) {
                        countrySelect.value = countryObj.id;
                        this.updateCities('editCountry', 'editCity', this.currentUser.city);
                    } else {
                        const opt = document.createElement('option');
                        opt.value = currentCountry;
                        opt.textContent = currentCountry;
                        countrySelect.appendChild(opt);
                        countrySelect.value = currentCountry;

                        if (this.currentUser.city) {
                            citySelect.innerHTML = `<option value="${this.currentUser.city}">${this.currentUser.city}</option>`;
                        }
                    }
                }
            }

            // Populating Experience
            const expContainer = document.getElementById('unifiedEditExperienceList');
            if (expContainer) {
                const exps = this.currentUser.experience || [];
                if (exps.length === 0) {
                    expContainer.innerHTML = '<p class="text-slate-500 text-sm">Sin experiencia registrada.</p>';
                } else {
                    expContainer.innerHTML = exps.map(exp => `
                        <div class="flex gap-4 group relative">
                            <div class="flex flex-col items-center">
                                <div class="size-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                    <span class="material-icons text-primary text-xl">work</span>
                                </div>
                                <div class="w-px h-full bg-slate-100 dark:bg-slate-700 my-2"></div>
                            </div>
                            <div class="flex-1 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <h4 class="font-bold text-slate-900 dark:text-white">${exp.role || exp.position || 'Sin cargo'}</h4>
                                <p class="text-slate-500 dark:text-slate-400 text-sm mb-1">${exp.company}</p>
                                <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">${exp.start_date || ''} — ${exp.end_date || 'Actualidad'}</p>
                                <button onclick="app.removeExperience('${exp.id}')" class="absolute right-0 top-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 p-1 rounded backdrop-blur-sm"><span class="material-icons">delete</span></button>
                            </div>
                        </div>`).join('');
                }
            }

            // Populating Education
            const eduContainer = document.getElementById('unifiedEditEducationList');
            if (eduContainer) {
                const edus = this.currentUser.education || [];
                if (edus.length === 0) {
                    eduContainer.innerHTML = '<p class="text-slate-500 text-sm">Sin educación registrada.</p>';
                } else {
                    eduContainer.innerHTML = edus.map(edu => `
                        <div class="flex gap-4 items-start group relative">
                            <div class="size-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                                <span class="material-icons text-slate-400 dark:text-slate-500">school</span>
                            </div>
                            <div class="flex-1 pb-4 border-b border-slate-100 dark:border-slate-700">
                                <h4 class="font-bold text-slate-900 dark:text-white">${edu.degree || edu.title || 'Sin título'}</h4>
                                <p class="text-slate-500 dark:text-slate-400 text-sm mb-1">${edu.institution || edu.school || 'Sin institución'}</p>
                                <p class="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">${edu.start_date || ''} — ${edu.end_date || 'Actualidad'}</p>
                                <button onclick="app.removeEducation('${edu.id}')" class="absolute right-0 top-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 p-1 rounded backdrop-blur-sm"><span class="material-icons">delete</span></button>
                            </div>
                        </div>`).join('');
                }
            }

            // Populating Skills
            const skillsContainer = document.getElementById('unifiedEditSkillsChips');
            if (skillsContainer) {
                const skills = this.currentUser.skills || [];
                if (skills.length === 0) {
                    skillsContainer.innerHTML = '<p class="text-slate-500 text-sm">Sin habilidades. Añade algunas.</p>';
                } else {
                    skillsContainer.innerHTML = skills.map(s => `
                        <span class="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium rounded-full cursor-default">
                            ${s}
                        </span>
                    `).join('');
                }
            }

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            modal.style.zIndex = '99999';
        }
    },

    closeEditProfileFullScreen() {
        const modal = document.getElementById('editProfileFullScreen');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    async saveUnifiedProfile() {
        if (!this.currentUser) return;

        // Collect string values
        const nameEl = document.getElementById('fullName');
        if (nameEl) this.currentUser.name = nameEl.value.trim();

        const headlineEl = document.getElementById('headline');
        if (headlineEl) this.currentUser.current_position = headlineEl.value.trim();

        const countryEl = document.getElementById('editCountry');
        if (countryEl) this.currentUser.country = countryEl.value;

        const cityEl = document.getElementById('editCity');
        if (cityEl) this.currentUser.city = cityEl.value;

        const salaryEl = document.getElementById('salary');
        if (salaryEl) this.currentUser.expected_salary = parseInt(salaryEl.value) || 0;

        const currencyEl = document.getElementById('editCurrency');
        if (currencyEl) this.currentUser.currency = currencyEl.value;

        const bioEl = document.getElementById('bio');
        if (bioEl) {
            this.currentUser.about = bioEl.value;
            this.currentUser.bio = bioEl.value;
        }

        // Save Modality
        this.currentUser.work_modality = this.currentWorkModality || 'remoto';

        // Upload photo if pending
        if (this._editPendingPhoto && window.talentlyBackend && window.talentlyBackend.storage) {
            try {
                const url = await window.talentlyBackend.storage.uploadImage(this._editPendingPhoto);
                if (url) {
                    this.currentUser.photo_url = url;
                }
            } catch (error) {
                console.error('Error uploading photo:', error);
                this.showToast('Error al procesar la foto', 'error');
            }
            this._editPendingPhoto = null;
        }

        this.saveProfile();
        this.renderProfile();
        this.closeEditProfileFullScreen();
        this.showToast('Perfil actualizado');
    },


    renderProfile() {
        if (!this.currentUser) return;
        const profileData = this.currentUser;

        // 1. Name & Title (Stitch)
        const nameEl = document.getElementById('profileDisplayName');
        if (nameEl) nameEl.textContent = profileData.name || profileData.full_name || 'Usuario';

        const titleEl = document.getElementById('profileDisplayTitle');
        if (titleEl) {
            let locationString = '';
            let countryDisplay = profileData.country || '';
            if (this.referenceData && this.referenceData.countries) {
                const countryObj = this.referenceData.countries.find(c => c.id === countryDisplay || c.name === countryDisplay);
                if (countryObj) countryDisplay = countryObj.name;
            }
            if (profileData.city) locationString = ` • ${profileData.city}, ${countryDisplay}`;
            else if (countryDisplay) locationString = ` • ${countryDisplay}`;
            titleEl.textContent = (profileData.title || profileData.role || profileData.current_position || 'Sin cargo definido') + locationString;
        }

        // 2. Avatar
        const imageUrl = profileData.avatar_url || profileData.image;
        const avatarEl = document.getElementById('profileAvatarImg');
        const avatarFileInput = document.getElementById('avatarFileInput');

        if (avatarEl) {
            if (imageUrl && !imageUrl.startsWith('blob:')) {
                avatarEl.src = imageUrl;
            } else {
                avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || profileData.full_name || 'User')}&background=1392ec&color=fff&size=200`;
            }
        }

        if (avatarFileInput) {
            const preview = document.getElementById('editAvatarPreview');
            if (preview && imageUrl) {
                preview.style.backgroundImage = `url(${imageUrl})`;
                preview.style.backgroundSize = 'cover';
                preview.innerHTML = '';
            }
        }

        // Also update preview images
        const avatarImgs = document.querySelectorAll('#profileAvatarImg, .profile-avatar-img, [data-avatar]');
        avatarImgs.forEach(img => {
            if (imageUrl) img.src = imageUrl;
        });

        // 3. Top Tags (first 3 skills)
        const topTags = document.getElementById('profileTopTags');
        if (topTags) {
            const skills = profileData.skills || [];
            if (skills.length > 0) {
                topTags.innerHTML = skills.map(s => `<span style="padding: 4px 12px; background: #EFF6FF; color: #3B82F6; border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid #DBEAFE;">${s}</span>`).join('');
            } else {
                topTags.innerHTML = '';
            }
        }

        // 4. Bio
        const bioEl = document.getElementById('profileBioText');
        if (bioEl) bioEl.textContent = profileData.bio || 'Sin descripción.';

        // 4.5 CV Document State
        const cvViewState = document.getElementById('cvViewState');
        const cvEmptyState = document.getElementById('cvEmptyState');
        const cvUploadBtn = document.getElementById('profileCvUploadBtn');

        if (cvViewState && cvEmptyState) {
            if (profileData.cv_url) {
                cvViewState.style.display = 'flex';
                cvEmptyState.style.display = 'none';
                if (cvUploadBtn) cvUploadBtn.style.display = 'block';

                const fileNameEl = cvViewState.querySelector('p:first-child');
                if (fileNameEl) {
                    try {
                        const urlParts = profileData.cv_url.split('/');
                        const rawName = decodeURIComponent(urlParts[urlParts.length - 1]);
                        const cleanName = rawName.includes('_') ? rawName.substring(rawName.indexOf('_') + 1) : rawName;
                        fileNameEl.textContent = cleanName || 'Mi_Curriculum.pdf';
                    } catch (e) {
                        fileNameEl.textContent = 'Mi_Curriculum.pdf';
                    }
                }
            } else {
                cvViewState.style.display = 'none';
                cvEmptyState.style.display = 'block';
                if (cvUploadBtn) cvUploadBtn.style.display = 'none';
            }
        }

        // 5. Skills (full list - Stitch rounded pills)
        const skillsContainer = document.getElementById('profileSkillsDisplay');
        if (skillsContainer) {
            const skills = profileData.skills || [];
            if (skills.length > 0) {
                skillsContainer.innerHTML = skills.map(s => `<span style="padding: 6px 12px; background: #F3F4F6; color: #1F2937; border-radius: 8px; font-size: 14px; font-weight: 500;">${s}</span>`).join('');
            } else {
                skillsContainer.innerHTML = '<span style="color: #6B7280; font-size: 14px;">Sin habilidades registradas</span>';
            }
        }

        // 6. Experience (Stitch cards with colored initials)
        const expList = document.getElementById('experienceList');
        if (expList) {
            let experience = profileData.experience || [];
            if (typeof experience === 'string') { try { experience = JSON.parse(experience); } catch (e) { experience = []; } }
            if (!Array.isArray(experience)) experience = [];

            if (experience.length === 0) {
                expList.innerHTML = '<div style="color: #6B7280; font-size: 14px; text-align: center; padding: 20px;">Sin experiencia registrada</div>';
            } else {
                const colors = ['#EEF2FF', '#FCE7F3', '#ECFDF5', '#FEF3C7', '#F0F9FF'];
                const textColors = ['#4F46E5', '#DB2777', '#059669', '#D97706', '#0284C7'];
                expList.innerHTML = experience.map((exp, index) => {
                    const initial = (exp.company || 'E')[0].toUpperCase();
                    const bg = colors[index % colors.length];
                    const tc = textColors[index % textColors.length];
                    const isCurrent = exp.isCurrent || exp.is_current;
                    const desc = exp.description ? `<p style="font-size: 12px; color: #6B7280; margin: 8px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;">${exp.description}</p>` : '';
                    return `
                    <div style="display: flex; gap: 16px;">
                        <div style="flex-shrink: 0; width: 48px; height: 48px; background: ${bg}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${tc}; font-weight: 700; font-size: 18px;">${initial}</div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h4 style="font-weight: 600; font-size: 16px; color: #1F2937; margin: 0;">${exp.role || ''}</h4>
                                <button onclick="app.openEditExperience(${index})" style="background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 2px;" onmouseenter="this.style.color='#6B7280'" onmouseleave="this.style.color='#9CA3AF'">
                                    <span class="material-icons" style="font-size: 16px;">edit</span>
                                </button>
                            </div>
                            <p style="font-size: 14px; font-weight: 500; color: #4B5563; margin: 2px 0 0;">${exp.company || ''}</p>
                            <p style="font-size: 12px; color: ${isCurrent ? '#3B82F6' : '#6B7280'}; margin: 4px 0 0; font-weight: ${isCurrent ? '500' : '400'};">${exp.period || ''}</p>${desc}
                        </div>
                    </div>
                    ${index < experience.length - 1 ? '<div style="height: 1px; background: #E5E7EB; width: 100%;"></div>' : ''}`;
                }).join('');
            }
        }

        // 7. Education (Stitch cards with school icon)
        const eduList = document.getElementById('educationList');
        if (eduList) {
            let education = profileData.education || [];
            if (typeof education === 'string') { try { education = JSON.parse(education); } catch (e) { education = []; } }
            if (!Array.isArray(education)) education = [];

            if (education.length === 0) {
                eduList.innerHTML = '<div style="color: #6B7280; font-size: 14px; text-align: center; padding: 20px;">Sin educación registrada</div>';
            } else {
                eduList.innerHTML = education.map((edu, index) => `
                    <div style="display: flex; gap: 16px;">
                        <div style="flex-shrink: 0; width: 48px; height: 48px; background: #F3F4F6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="color: #6B7280;">school</span>
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <h4 style="font-weight: 600; font-size: 16px; color: #1F2937; margin: 0;">${edu.degree || ''}</h4>
                                <button onclick="app.openEditEducation(${index})" style="background: none; border: none; color: #9CA3AF; cursor: pointer; padding: 2px;" onmouseenter="this.style.color='#6B7280'" onmouseleave="this.style.color='#9CA3AF'">
                                    <span class="material-icons" style="font-size: 16px;">edit</span>
                                </button>
                            </div>
                            <p style="font-size: 14px; font-weight: 500; color: #4B5563; margin: 2px 0 0;">${edu.school || ''}</p>
                            <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0;">${edu.period || ''}</p>
                        </div>
                    </div>
                    ${index < education.length - 1 ? '<div style="height: 1px; background: #E5E7EB; width: 100%;"></div>' : ''}
                `).join('');
            }
        }
    },

    removeEducation(id) {
        if (confirm('¿Eliminar educación?')) {
            this.currentUser.education = (this.currentUser.education || []).filter(e => e.id !== id);
            this.saveProfile();
            this.renderProfile();
        }
    },

    async saveProfile() {
        if (window.talentlyBackend && window.talentlyBackend.isReady && this.currentUser) {
            // Construct a CLEAN payload that matches the 'profiles' table schema.
            const payload = {
                name: this.currentUser.name,
                current_position: this.currentUser.current_position || this.currentUser.professional_title,
                country: this.currentUser.country,
                city: this.currentUser.city || this.currentUser.city_id,
                expected_salary: this.currentUser.expected_salary || this.currentUser.salary,
                currency: this.currentUser.currency,
                work_modality: this.currentUser.work_modality,
                availability: this.currentUser.availability,
                bio: this.currentUser.bio,
                skills: this.currentUser.skills,
                experience: this.currentUser.experience || [],
                education: this.currentUser.education || [],
                avatar_url: this.currentUser.avatar_url || this.currentUser.image
            };

            // Remove undefined/null keys
            Object.keys(payload).forEach(key =>
                payload[key] === undefined && delete payload[key]
            );

            const { data, error } = await window.talentlyBackend.profiles.create(payload); // Uses UPSERT now
            console.log('saveProfile payload avatar_url:', payload.avatar_url);
            console.log('saveProfile result:', data, error);
            this.showToast('Perfil actualizado');
        } else {
            localStorage.setItem('talently_profile', JSON.stringify(this.currentUser));
        }
    },




});
