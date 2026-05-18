// ============================================
// MÓDULO: Ofertas de Trabajo
// Talently — js/modules/offers.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: createOffer, _renderOfferStep, selectOfferModality,
//          toggleSoftSkillCard, adjustOfferExp, selectOfferSeniority,
//          _validateOfferStep, nextOfferStep, prevOfferStep, goToOfferStep,
//          _populateOfferReview, setupCurrencyInput, clearFormErrors,
//          cancelCreateOffer, openSkillsModal, renderSkillsGrid,
//          filterSkills, confirmSkills, _renderOfferSkillChips,
//          removeOfferSkill, filterSoftSkillSuggestions, addSoftSkill,
//          removeSoftSkill, _renderSoftSkillChips, updateDescriptionCount,
//          appendToDescription, _showOfferSuccess, editLastPublishedOffer,
//          viewPublishedOffer, closeOfferSuccess, _renderOffersList,
//          _offerTimeAgo, showOfferActions, deleteOffer, editOffer
// ============================================

Object.assign(app, {

    // Multi-step offer state
    _offerStep: 1,
    _offerStepNames: ['Datos Básicos', 'Compensación', 'Habilidades', 'Revisión'],

    createOffer() {
        this.editingOfferId = null;
        this._offerStep = 1;
        const view = document.getElementById('createOfferView');
        if (view) {
            view.style.display = 'flex';
            this.clearFormErrors();
            // Reset all fields
            document.getElementById('offerTitle').value = '';
            document.getElementById('offerDescription').value = '';
            document.getElementById('offerProfessionalTitle').value = '';
            document.getElementById('offerSalaryMin').value = '';
            document.getElementById('offerSalaryMax').value = '';
            document.getElementById('offerSkills').value = '';
            this.selectedSkills = new Set();
            document.getElementById('offerExperience').value = '0';
            const expDisplay = document.getElementById('offerExpDisplay');
            if (expDisplay) expDisplay.textContent = '0';
            document.getElementById('offerModality').value = '';
            document.getElementById('offerCurrency').value = '$';
            // Reset seniority
            document.getElementById('offerSeniority').value = '';
            const senContainer = document.getElementById('offerSeniorityContainer');
            if (senContainer) {
                senContainer.querySelectorAll('label').forEach(lbl => {
                    const radio = lbl.querySelector('input[type="radio"]');
                    if (radio) radio.checked = false;
                    lbl.style.borderColor = '#e5e7eb';
                    lbl.style.background = '#f9fafb';
                    lbl.style.color = '#6b7280';
                });
            }
            // Reset soft skills tag input
            this._offerSoftSkills = [];
            const softDisplay = document.getElementById('offerSoftSkillsDisplay');
            if (softDisplay) softDisplay.innerHTML = '';
            const softInput = document.getElementById('offerSoftSkillsSearch');
            if (softInput) softInput.value = '';
            const softHidden = document.getElementById('offerSoftSkillsValue');
            if (softHidden) softHidden.value = '';
            // Reset skills display
            const skillsDisplay = document.getElementById('offerSkillsDisplay');
            if (skillsDisplay) skillsDisplay.innerHTML = '';
            // Reset description counter
            const descCount = document.getElementById('offerDescCount');
            if (descCount) descCount.textContent = '0/2500';
            // Reset modality cards
            ['Remoto', 'Híbrido', 'Presencial'].forEach(m => {
                const card = document.getElementById('offerModality' + m);
                if (card) { card.style.borderColor = '#e2e8f0'; card.style.background = '#ffffff'; }
            });
            this._renderOfferStep();
        }
    },

    _renderOfferStep() {
        const step = this._offerStep;
        // Show/hide steps
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById('offerStep' + i);
            if (el) el.style.display = i === step ? 'block' : 'none';
        }
        // Segmented progress bars
        for (let i = 1; i <= 4; i++) {
            const bar = document.getElementById('offerBar' + i);
            if (bar) bar.style.background = i <= step ? '#1392ec' : '#e2e8f0';
        }
        // Title
        const title = document.getElementById('offerStepTitle');
        if (title) title.textContent = this.editingOfferId ? 'Editar Oferta' : 'Nueva Oferta';
        // Button text
        const btnText = document.getElementById('offerBtnText');
        const btnIcon = document.getElementById('offerBtnIcon');
        if (step === 4) {
            if (btnText) btnText.textContent = this.editingOfferId ? 'Guardar Cambios' : 'Publicar Oferta';
            if (btnIcon) btnIcon.textContent = 'check';
        } else {
            if (btnText) btnText.textContent = 'Continuar';
            if (btnIcon) btnIcon.textContent = 'arrow_forward';
        }
        // Populate review on step 4
        if (step === 4) this._populateOfferReview();
    },

    selectOfferModality(value) {
        document.getElementById('offerModality').value = value;
        ['Remoto', 'Híbrido', 'Presencial'].forEach(m => {
            const card = document.getElementById('offerModality' + m);
            if (card) {
                if (m === value) {
                    card.style.borderColor = '#1392ec';
                    card.style.background = '#eff9ff';
                    card.querySelector('.material-icons').style.color = '#1392ec';
                } else {
                    card.style.borderColor = '#e2e8f0';
                    card.style.background = '#ffffff';
                    card.querySelector('.material-icons').style.color = '#64748b';
                }
            }
        });
    },

    toggleSoftSkillCard(label) {
        const cb = label.querySelector('input[type="checkbox"]');
        if (!cb) return;
        cb.checked = !cb.checked;
        if (cb.checked) {
            label.style.borderColor = '#1392ec';
            label.style.background = '#eff9ff';
            label.querySelector('.material-icons').style.color = '#1392ec';
        } else {
            label.style.borderColor = '#e2e8f0';
            label.style.background = '#ffffff';
            label.querySelector('.material-icons').style.color = '#94a3b8';
        }
    },

    adjustOfferExp(delta) {
        const input = document.getElementById('offerExperience');
        const display = document.getElementById('offerExpDisplay');
        let val = parseInt(input.value) || 0;
        val = Math.max(0, Math.min(30, val + delta));
        input.value = val;
        if (display) display.textContent = val;
    },

    selectOfferSeniority(value, clickedLabel) {
        document.getElementById('offerSeniority').value = value;
        const container = document.getElementById('offerSeniorityContainer');
        if (!container) return;
        container.querySelectorAll('label').forEach(lbl => {
            const radio = lbl.querySelector('input[type="radio"]');
            if (radio && radio.value === value) {
                radio.checked = true;
                lbl.style.borderColor = '#1392ec';
                lbl.style.background = '#1392ec';
                lbl.style.color = '#ffffff';
            } else {
                if (radio) radio.checked = false;
                lbl.style.borderColor = '#e5e7eb';
                lbl.style.background = '#f9fafb';
                lbl.style.color = '#6b7280';
            }
        });
    },

    _validateOfferStep(step) {
        this.clearFormErrors();
        if (step === 1) {
            let ok = true;
            const title = document.getElementById('offerTitle');
            if (!title.value.trim()) {
                title.style.borderColor = '#ef4444';
                document.getElementById('offerTitleError').style.display = 'block';
                ok = false;
            }
            const modality = document.getElementById('offerModality');
            if (!modality.value) {
                this.showToast('Selecciona una modalidad de trabajo');
                ok = false;
            }
            return ok;
        }
        if (step === 2) {
            let ok = true;
            const min = document.getElementById('offerSalaryMin');
            const max = document.getElementById('offerSalaryMax');
            if (!min.value.trim()) {
                min.style.borderColor = '#ef4444';
                document.getElementById('offerSalaryMinError').style.display = 'block';
                ok = false;
            }
            if (!max.value.trim()) {
                max.style.borderColor = '#ef4444';
                document.getElementById('offerSalaryMaxError').style.display = 'block';
                ok = false;
            }
            if (ok) {
                const minVal = parseInt(min.value.replace(/\./g, ''), 10);
                const maxVal = parseInt(max.value.replace(/\./g, ''), 10);
                if (isNaN(minVal) || isNaN(maxVal)) {
                    this.showToast('El salario debe ser un número válido');
                    ok = false;
                } else if (minVal > maxVal) {
                    min.style.borderColor = '#ef4444';
                    max.style.borderColor = '#ef4444';
                    this.showToast('El salario mínimo no puede ser mayor al máximo');
                    ok = false;
                }
            }
            return ok;
        }
        if (step === 3) {
            let ok = true;
            const skills = document.getElementById('offerSkills').value;
            if (!skills) {
                document.getElementById('offerSkillsDisplay').style.borderColor = '#ef4444';
                document.getElementById('offerSkillsError').style.display = 'block';
                ok = false;
            }
            const desc = document.getElementById('offerDescription');
            if (!desc.value.trim()) {
                desc.style.borderColor = '#ef4444';
                this.showToast('La descripción es obligatoria');
                ok = false;
            }
            return ok;
        }
        return true;
    },

    nextOfferStep() {
        if (this._offerStep < 4) {
            if (!this._validateOfferStep(this._offerStep)) return;
            this._offerStep++;
            this._renderOfferStep();
        } else {
            // Step 4: Publish
            this.saveOffer();
        }
    },

    prevOfferStep() {
        if (this._offerStep > 1) {
            this._offerStep--;
            this._renderOfferStep();
        } else {
            this.cancelCreateOffer();
        }
    },

    goToOfferStep(step) {
        this._offerStep = step;
        this._renderOfferStep();
    },

    _populateOfferReview() {
        const title = document.getElementById('offerTitle').value || '-';
        const profTitle = document.getElementById('offerProfessionalTitle').value || '-';
        const modality = document.getElementById('offerModality').value || '-';
        const exp = document.getElementById('offerExperience').value;
        const seniority = document.getElementById('offerSeniority').value;
        const currency = document.getElementById('offerCurrency').value;
        const minStr = document.getElementById('offerSalaryMin').value;
        const maxStr = document.getElementById('offerSalaryMax').value;
        const skills = document.getElementById('offerSkills').value;
        const desc = document.getElementById('offerDescription').value || '-';

        document.getElementById('reviewTitle').textContent = title;
        document.getElementById('reviewProfTitle').textContent = profTitle;
        document.getElementById('reviewModality').textContent = modality;
        document.getElementById('reviewExperience').textContent = exp && exp !== '0' ? exp + ' años' : 'Sin especificar';
        document.getElementById('reviewSeniority').textContent = seniority || 'Sin especificar';
        document.getElementById('reviewSalary').textContent = minStr && maxStr ? currency + minStr + ' - ' + currency + maxStr : 'Sin especificar';
        document.getElementById('reviewDescription').textContent = desc;

        const skillsContainer = document.getElementById('reviewSkills');
        if (skills) {
            skillsContainer.innerHTML = skills.split(',').map(s =>
                '<span style="background: #eff6ff; color: #334155; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; border: 1px solid #dbeafe;">' + s + '</span>'
            ).join('');
        } else {
            skillsContainer.innerHTML = '<span style="color: #94a3b8; font-size: 13px;">Ninguna seleccionada</span>';
        }

        // Soft skills in review
        const softSection = document.getElementById('reviewSoftSkillsSection');
        const softContainer = document.getElementById('reviewSoftSkills');
        if (this._offerSoftSkills.length > 0) {
            softSection.style.display = 'block';
            softContainer.innerHTML = this._offerSoftSkills.map(s =>
                '<span style="background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; border: 1px solid #e2e8f0;">' + s + '</span>'
            ).join('');
        } else {
            softSection.style.display = 'none';
        }
    },

    setupCurrencyInput(input) {
        input.oninput = (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value) {
                value = parseInt(value, 10).toLocaleString('es-CL');
                e.target.value = value;
            }
        };
    },

    clearFormErrors() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.error-text').forEach(el => el.style.display = 'none');
        // Reset Stitch border colors on offer form inputs
        const offerView = document.getElementById('createOfferView');
        if (offerView) {
            offerView.querySelectorAll('input[type="text"], input[type="number"], textarea, select').forEach(el => {
                if (el.style.borderColor === 'rgb(239, 68, 68)' || el.style.borderColor === '#ef4444') {
                    el.style.borderColor = '#e2e8f0';
                }
            });
        }
    },

    cancelCreateOffer() {
        try {
            const view = document.getElementById('createOfferView');
            if (view) {
                view.style.setProperty('display', 'none', 'important');
            }
            const skillsModal = document.getElementById('skillsModal');
            if (skillsModal) skillsModal.style.display = 'none';
            const successScreen = document.getElementById('offerSuccessScreen');
            if (successScreen) successScreen.style.display = 'none';
            this._offerStep = 1;
        } catch (e) {
            console.error('Error closing modal:', e);
        }
    },

    // Skills Modal Logic
    availableSkills: ['React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'TypeScript', 'C#', '.NET', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter', 'Figma', 'UX/UI'],
    selectedSkills: new Set(),

    openSkillsModal() {
        const modal = document.getElementById('skillsModal');

        // Load current skills from hidden input
        const current = document.getElementById('offerSkills').value;
        this.selectedSkills = new Set(current ? current.split(',') : []);

        this.renderSkillsGrid(this.availableSkills);
        modal.style.display = 'flex';
    },

    renderSkillsGrid(skills) {
        const grid = document.getElementById('skillsGrid');
        grid.innerHTML = skills.map(skill => {
            const selected = this.selectedSkills.has(skill);
            return `<div onclick="app.toggleSkill('${skill}')" style="padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: 1.5px solid ${selected ? '#1392ec' : '#e2e8f0'}; background: ${selected ? '#eff9ff' : '#ffffff'}; color: ${selected ? '#1392ec' : '#1e293b'};">${skill}</div>`;
        }).join('');
    },

    filterSkills(query) {
        const filtered = this.availableSkills.filter(s => s.toLowerCase().includes(query.toLowerCase()));
        this.renderSkillsGrid(filtered);
    },

    toggleSkill(skill) {
        if (this.selectedSkills.has(skill)) {
            this.selectedSkills.delete(skill);
        } else {
            this.selectedSkills.add(skill);
        }
        this.filterSkills(document.querySelector('#skillsModal input').value); // Re-render preserving filter
    },

    confirmSkills() {
        const skillsArr = Array.from(this.selectedSkills);
        document.getElementById('offerSkills').value = skillsArr.join(',');
        this._renderOfferSkillChips();


        document.getElementById('skillsModal').style.display = 'none';
    },

    _renderOfferSkillChips() {
        const display = document.getElementById('offerSkillsDisplay');
        const skillsArr = Array.from(this.selectedSkills);
        if (skillsArr.length > 0) {
            display.innerHTML = skillsArr.map(s =>
                '<div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: #eff6ff; border: 1px solid #dbeafe; color: #334155; font-size: 13px; font-weight: 500;">' +
                '<span>' + s + '</span>' +
                '<button onclick="event.stopPropagation(); app.removeOfferSkill(\'' + s + '\')" style="background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #94a3b8; transition: color 0.2s;" onmouseenter="this.style.color=\'#ef4444\'" onmouseleave="this.style.color=\'#94a3b8\'">' +
                '<span class="material-icons" style="font-size: 16px;">close</span>' +
                '</button>' +
                '</div>'
            ).join('');
        } else {
            display.innerHTML = '';
        }
    },

    removeOfferSkill(skill) {
        this.selectedSkills.delete(skill);
        document.getElementById('offerSkills').value = Array.from(this.selectedSkills).join(',');
        this._renderOfferSkillChips();
    },

    // Soft Skills Tag Input
    _offerSoftSkills: [],
    _softSkillOptions: ['Liderazgo', 'Trabajo en equipo', 'Comunicación', 'Resolución de problemas', 'Pensamiento crítico', 'Adaptabilidad', 'Creatividad', 'Empatía', 'Gestión del tiempo', 'Negociación', 'Inglés B2', 'Inglés C1', 'Proactividad', 'Mentoría'],

    filterSoftSkillSuggestions(query) {
        const container = document.getElementById('offerSoftSkillSuggestions');
        if (!query.trim()) {
            container.style.display = 'none';
            return;
        }
        const q = query.toLowerCase();
        const filtered = this._softSkillOptions.filter(s =>
            s.toLowerCase().includes(q) && !this._offerSoftSkills.includes(s)
        );
        if (filtered.length === 0) {
            // Show option to add custom
            container.innerHTML = '<div onclick="app.addSoftSkillFromInput()" style="padding: 10px 14px; cursor: pointer; font-size: 13px; color: #1392ec; font-weight: 500; display: flex; align-items: center; gap: 6px;"><span class="material-icons" style="font-size: 18px;">add</span>Agregar "' + query.trim() + '"</div>';
            container.style.display = 'block';
        } else {
            container.innerHTML = filtered.map(s =>
                '<div onclick="app.addSoftSkill(\'' + s + '\')" style="padding: 10px 14px; cursor: pointer; font-size: 13px; color: #1e293b; transition: background 0.15s;" onmouseenter="this.style.background=\'#f8fafc\'" onmouseleave="this.style.background=\'#ffffff\'">' + s + '</div>'
            ).join('');
            container.style.display = 'block';
        }
    },

    hideSoftSkillSuggestions() {
        const container = document.getElementById('offerSoftSkillSuggestions');
        if (container) container.style.display = 'none';
    },

    addSoftSkill(value) {
        if (value && !this._offerSoftSkills.includes(value)) {
            this._offerSoftSkills.push(value);
            this._renderSoftSkillChips();
        }
        const input = document.getElementById('offerSoftSkillsSearch');
        if (input) input.value = '';
        this.hideSoftSkillSuggestions();
    },

    addSoftSkillFromInput() {
        const input = document.getElementById('offerSoftSkillsSearch');
        const value = input.value.trim();
        if (value) this.addSoftSkill(value);
    },

    removeSoftSkill(value) {
        this._offerSoftSkills = this._offerSoftSkills.filter(s => s !== value);
        this._renderSoftSkillChips();
    },

    _renderSoftSkillChips() {
        const display = document.getElementById('offerSoftSkillsDisplay');
        const hidden = document.getElementById('offerSoftSkillsValue');
        if (hidden) hidden.value = this._offerSoftSkills.join(',');
        if (this._offerSoftSkills.length > 0) {
            display.innerHTML = this._offerSoftSkills.map(s =>
                '<div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; font-size: 13px; font-weight: 500;">' +
                '<span>' + s + '</span>' +
                '<button onclick="app.removeSoftSkill(\'' + s + '\')" style="background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #94a3b8; transition: color 0.2s;" onmouseenter="this.style.color=\'#475569\'" onmouseleave="this.style.color=\'#94a3b8\'">' +
                '<span class="material-icons" style="font-size: 16px;">close</span>' +
                '</button>' +
                '</div>'
            ).join('');
        } else {
            display.innerHTML = '';
        }
    },

    // Description helpers
    updateDescriptionCount() {
        const textarea = document.getElementById('offerDescription');
        const counter = document.getElementById('offerDescCount');
        if (textarea && counter) {
            counter.textContent = textarea.value.length + '/2500';
        }
    },

    appendToDescription(text) {
        const textarea = document.getElementById('offerDescription');
        if (textarea) {
            if (textarea.value && !textarea.value.endsWith(' ') && !textarea.value.endsWith('\n')) {
                textarea.value += ' ';
            }
            textarea.value += text;
            this.updateDescriptionCount();
            textarea.focus();
        }
    },

    async saveOffer() {
        this.clearFormErrors();
        let hasError = false;

        // Fields to validate (core required fields only)
        const fields = [
            { id: 'offerTitle', name: 'Título del Cargo' },
            { id: 'offerSalaryMin', name: 'Salario Mínimo' },
            { id: 'offerSalaryMax', name: 'Salario Máximo' },
            { id: 'offerModality', name: 'Modalidad' },
            { id: 'offerDescription', name: 'Descripción' }
        ];

        // 1. Validate Empty Fields
        fields.forEach(field => {
            const el = document.getElementById(field.id);
            if (!el || !el.value.trim()) {
                if (el) el.classList.add('input-error');
                // Target error text by ID
                const errorText = document.getElementById(field.id + 'Error');
                if (errorText) errorText.style.display = 'block';
                hasError = true;
            }
        });

        // Validate Skills
        const skillsVal = document.getElementById('offerSkills').value;
        if (!skillsVal) {
            const display = document.getElementById('offerSkillsDisplay');
            if (display) display.style.border = '1px solid var(--danger)';

            const errorText = document.getElementById('offerSkillsError');
            if (errorText) errorText.style.display = 'block';
            hasError = true;
        } else {
            const display = document.getElementById('offerSkillsDisplay');
            if (display) display.style.border = '';
        }

        if (hasError) {
            this.showToast('Por favor completa todos los campos obligatorios');
            return;
        }

        // 2. Validate Salary Logic
        let minStr = document.getElementById('offerSalaryMin').value.replace(/\./g, '');
        let maxStr = document.getElementById('offerSalaryMax').value.replace(/\./g, '');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);

        if (isNaN(min) || isNaN(max)) {
            document.getElementById('offerSalaryMin').classList.add('input-error');
            document.getElementById('offerSalaryMax').classList.add('input-error');
            this.showToast('El salario debe ser un número válido');
            return;
        }

        if (min > max) {
            document.getElementById('offerSalaryMin').classList.add('input-error');
            document.getElementById('offerSalaryMax').classList.add('input-error');
            document.getElementById('offerSalaryMinError').style.display = 'block';
            document.getElementById('offerSalaryMaxError').style.display = 'block';
            this.showToast('El salario mínimo no puede ser mayor al máximo');
            return;
        }

        // Gather Data
        const title = document.getElementById('offerTitle').value;
        const professionalTitle = document.getElementById('offerProfessionalTitle').value;
        const currency = document.getElementById('offerCurrency').value;
        const description = document.getElementById('offerDescription').value;
        const modality = document.getElementById('offerModality').value;
        const experience = document.getElementById('offerExperience').value;
        const seniority = document.getElementById('offerSeniority').value;

        const softSkills = [...this._offerSoftSkills];

        const newOffer = {
            id: this.editingOfferId || Date.now(),
            title: title || 'Sin título',
            professionalTitle: professionalTitle || '',
            salary: `${currency}${min.toLocaleString('es-CL')} - ${max.toLocaleString('es-CL')}`,
            // Store raw values for editing later if needed, but for now we focus on display
            salary_min: min,
            salary_max: max,
            currency: currency,
            description: description || '',
            modality: modality || 'Remoto',
            experience: experience ? `${experience} años` : 'Sin experiencia',
            experience_years: parseInt(experience) || 0,
            skills: skillsVal.split(','),
            softSkills,
            seniority: seniority || '',
            status: 'active',
            candidates_count: this.editingOfferId ? (this.companyOffers.find(o => o.id === this.editingOfferId)?.candidates_count || 0) : 0,
            date: new Date().toLocaleDateString()
        };

        // DB Payload (Snake Case)
        const dbPayload = {
            user_id: this.currentUser.id, // Ensure ownership
            title: newOffer.title,
            professional_title: newOffer.professionalTitle,
            salary_min: min,
            salary_max: max,
            currency: currency,
            modality: newOffer.modality,
            experience_years: newOffer.experience_years,
            description: newOffer.description,
            skills: newOffer.skills,
            soft_skills: newOffer.softSkills,
            seniority: newOffer.seniority,
            status: 'active'
        };

        if (this.editingOfferId) {
            // Update existing offer
            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const { error } = await window.talentlyBackend.offers.update(this.editingOfferId, dbPayload);
                if (error) {
                    console.error('Error updating offer:', error);
                    this.showToast('Error al actualizar oferta');
                    return;
                }
                this.showToast('Oferta actualizada exitosamente');
                // Update local state with newOffer (UI format)
                const index = this.companyOffers.findIndex(o => o.id === this.editingOfferId);
                if (index !== -1) this.companyOffers[index] = { ...this.companyOffers[index], ...newOffer };
            } else {
                // Fallback
                const index = this.companyOffers.findIndex(o => o.id === this.editingOfferId);
                if (index !== -1) this.companyOffers[index] = newOffer;
            }
        } else {
            // Create new offer
            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const { data, error } = await window.talentlyBackend.offers.create(dbPayload);
                if (error) {
                    console.error('Error creating offer:', error);
                    this.showToast('Error al crear oferta: ' + error.message);
                    return;
                }
                // Update ID with real DB ID
                newOffer.id = data.id;
                this.showToast('Oferta publicada exitosamente');
                this.companyOffers.unshift(newOffer);
            } else {
                // Fallback
                this.companyOffers.unshift(newOffer);
            }
        }

        this.renderCompanyOffers();
        this._loadCompanyStats(this.companyProfile || this.currentUser);

        if (this.editingOfferId) {
            // For edits, just close and show toast
            this.cancelCreateOffer();
        } else {
            // For new offers, show success screen
            this._lastPublishedOffer = newOffer;
            this._showOfferSuccess(newOffer);
        }
    },

    _showOfferSuccess(offer) {
        const screen = document.getElementById('offerSuccessScreen');
        if (!screen) return;

        // Populate card
        const titleEl = document.getElementById('successOfferTitle');
        if (titleEl) titleEl.textContent = offer.title || '-';
        const modalityEl = document.getElementById('successOfferModality');
        if (modalityEl) {
            const mod = offer.modality || 'Remoto';
            const icon = mod === 'Remoto' ? 'public' : mod === 'Híbrido' ? 'sync_alt' : 'business';
            modalityEl.innerHTML = '<span class="material-icons" style="font-size: 15px;">' + icon + '</span><span>' + mod + '</span>';
        }

        // Hide wizard elements, show success
        screen.style.display = 'flex';
    },

    editLastPublishedOffer() {
        const screen = document.getElementById('offerSuccessScreen');
        if (screen) screen.style.display = 'none';
        if (this._lastPublishedOffer) {
            this.editOffer(this._lastPublishedOffer.id);
        }
    },

    viewPublishedOffer() {
        // Close success screen and show offers list
        this.closeOfferSuccess();
        this.showCompanySection('companyOffersSection');
    },

    closeOfferSuccess() {
        const screen = document.getElementById('offerSuccessScreen');
        if (screen) screen.style.display = 'none';
        this.cancelCreateOffer();
    },

    // Offers tab state
    _offersTab: 'active',

    switchOffersTab(tab) {
        this._offersTab = tab;
        const activeBtn = document.getElementById('offersTabActive');
        const historyBtn = document.getElementById('offersTabHistory');
        if (tab === 'active') {
            activeBtn.style.background = '#1392ec';
            activeBtn.style.color = '#ffffff';
            activeBtn.style.fontWeight = '700';
            activeBtn.style.boxShadow = '0 2px 8px rgba(19,146,236,0.25)';
            historyBtn.style.background = 'transparent';
            historyBtn.style.color = '#6b7280';
            historyBtn.style.fontWeight = '500';
            historyBtn.style.boxShadow = 'none';
        } else {
            historyBtn.style.background = '#1392ec';
            historyBtn.style.color = '#ffffff';
            historyBtn.style.fontWeight = '700';
            historyBtn.style.boxShadow = '0 2px 8px rgba(19,146,236,0.25)';
            activeBtn.style.background = 'transparent';
            activeBtn.style.color = '#6b7280';
            activeBtn.style.fontWeight = '500';
            activeBtn.style.boxShadow = 'none';
        }
        this._renderOffersList();
    },

    async renderCompanyOffers() {
        const list = document.getElementById('companyOffersList');
        if (!list) return;

        // Fetch from backend
        if (window.talentlyBackend && window.talentlyBackend.isReady && this.currentUser) {
            const companyUserId = this.currentUser.user_id || this.currentUser.id;
            const { data, error } = await window.talentlyBackend.offers.getByCompany(companyUserId);
            if (data) {
                this.companyOffers = data.map(o => ({
                    ...o,
                    title: o.title,
                    professionalTitle: o.professional_title,
                    candidates_count: o.candidates_count,
                    salary: (o.salary_min && o.salary_max) ? `${o.currency || '$'}${o.salary_min.toLocaleString('es-CL')} - ${o.salary_max.toLocaleString('es-CL')}` : o.salary,
                    modality: o.modality,
                    description: o.description,
                    skills: typeof o.skills === 'string' ? o.skills : (o.skills || []).join(','),
                    softSkills: o.soft_skills || [],
                    seniority: o.seniority || '',
                    created_at: o.created_at
                }));
            }
            if (error) console.error('Error fetching company offers:', error);
        }

        this._renderOffersList();
    },

    _renderOffersList() {
        const list = document.getElementById('companyOffersList');
        if (!list) return;

        const isHistory = this._offersTab === 'history';
        const offers = isHistory
            ? this.companyOffers.filter(o => o.status === 'closed')
            : this.companyOffers.filter(o => o.status !== 'closed');

        if (offers.length === 0) {
            const msg = isHistory ? 'No hay ofertas en el historial.' : 'No tienes ofertas activas.';
            const icon = isHistory ? 'history' : 'work_outline';
            list.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <span class="material-icons" style="font-size: 48px; color: #d1d5db; margin-bottom: 12px;">${icon}</span>
                    <p style="font-size: 15px; color: #9ca3af; font-weight: 500; margin: 0;">${msg}</p>
                    ${!isHistory ? '<p style="font-size: 13px; color: #d1d5db; margin: 8px 0 0;">Toca "Crear Nueva" para publicar tu primera oferta.</p>' : ''}
                </div>`;
            return;
        }

        list.innerHTML = offers.map(offer => {
            const isClosed = offer.status === 'closed';
            const matchCount = offer.candidates_count || 0;
            const timeAgo = this._offerTimeAgo(offer.created_at || offer.date);
            const modalityIcon = offer.modality === 'Remoto' ? 'public' : offer.modality === 'Híbrido' ? 'sync_alt' : 'business';

            // Status badge
            let badgeHtml;
            if (isClosed) {
                badgeHtml = '<span style="display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #d97706; border: 1px solid rgba(217,119,6,0.1);">Cerrada</span>';
            } else {
                badgeHtml = '<span style="display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid rgba(5,150,105,0.1);">Visible</span>';
            }

            return `
            <article style="position: relative; overflow: hidden; border-radius: 16px; background: #ffffff; padding: 20px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05); border: 1px solid transparent; transition: all 0.2s;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            ${badgeHtml}
                            <span style="font-size: 11px; color: #9ca3af;">${timeAgo}</span>
                        </div>
                        <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #111827; line-height: 1.3;">${offer.title}</h3>
                        <p style="margin: 3px 0 0; font-size: 13px; color: #6b7280;">${offer.modality || 'Remoto'} • ${offer.salary || 'A convenir'}</p>
                    </div>
                    <button onclick="app.showOfferActions('${offer.id}')" style="background: none; border: none; cursor: pointer; padding: 4px; margin: -4px -8px 0 0; color: #d1d5db; border-radius: 50%; transition: all 0.2s;"
                        onmouseenter="this.style.color='#6b7280'; this.style.background='#f9fafb'"
                        onmouseleave="this.style.color='#d1d5db'; this.style.background='none'">
                        <span class="material-icons" style="font-size: 22px;">more_horiz</span>
                    </button>
                </div>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;${isClosed ? ' opacity: 0.6;' : ''}">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; background: #fdf2f8; padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 5px; color: #db2777; margin-bottom: 4px;">
                            <span class="material-icons" style="font-size: 18px;">favorite</span>
                            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Matches</span>
                        </div>
                        <span style="font-size: 22px; font-weight: 800; color: #1f2937;">${matchCount}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; background: #eff6ff; padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 5px; color: #1392ec; margin-bottom: 4px;">
                            <span class="material-icons" style="font-size: 18px;">style</span>
                            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Pendientes</span>
                        </div>
                        <span style="font-size: 22px; font-weight: 800; color: #1f2937;">0</span>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: ${isClosed ? 'center' : 'space-between'};">
                    ${isClosed ? `
                        <button onclick="app.deleteOffer('${offer.id}')" style="font-size: 13px; font-weight: 600; color: #9ca3af; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <span class="material-icons" style="font-size: 16px;">delete_outline</span> Eliminar
                        </button>
                    ` : `
                        <div style="display: flex;">
                            ${matchCount > 0 ? `<div style="display: flex; margin-left: -4px;"><div style="width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;"><span class="material-icons" style="font-size: 14px; color: #6b7280;">person</span></div></div>` : ''}
                        </div>
                        <button onclick="app.editOffer('${offer.id}')" style="font-size: 13px; font-weight: 600; color: #1392ec; background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color 0.2s;"
                            onmouseenter="this.style.color='#0b6cb3'"
                            onmouseleave="this.style.color='#1392ec'">
                            Ver candidatos <span class="material-icons" style="font-size: 16px;">arrow_forward</span>
                        </button>
                    `}
                </div>
            </article>`;
        }).join('');
    },

    _offerTimeAgo(dateStr) {
        if (!dateStr) return '';
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Ahora';
        if (diff < 3600) return 'Hace ' + Math.floor(diff / 60) + ' min';
        if (diff < 86400) return 'Hace ' + Math.floor(diff / 3600) + ' h';
        const days = Math.floor(diff / 86400);
        if (days === 1) return 'Hace 1 día';
        if (days < 30) return 'Hace ' + days + ' días';
        return 'Hace ' + Math.floor(days / 30) + ' mes' + (Math.floor(days / 30) > 1 ? 'es' : '');
    },

    showOfferActions(offerId) {
        const offer = this.companyOffers.find(o => o.id === offerId);
        if (!offer) return;
        const isClosed = offer.status === 'closed';
        // Simple action menu via confirm dialogs
        const action = isClosed
            ? confirm('¿Eliminar esta oferta del historial?') ? 'delete' : null
            : prompt('Acción:\n1 = Editar\n2 = Cerrar oferta\n3 = Eliminar', '1');
        if (action === '1' || action === 1) this.editOffer(offerId);
        else if (action === '2' || action === 2) this.closeOffer(offerId);
        else if (action === '3' || action === 3 || action === 'delete') this.deleteOffer(offerId);
    },

    // Delete Confirmation Logic
    offerToDeleteId: null,

    async loadOffers() {
        if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
            console.warn('Backend not ready, using empty profiles');
            this.profiles = [];
            return;
        }

        try {
            const { data, error } = await window.talentlyBackend.offers.getAllActive();
            if (error) throw error;

            // Filter out already-swiped offers
            const swipedIds = JSON.parse(localStorage.getItem('talently_swiped_offers') || '[]');

            this.profiles = data
                .filter(offer => !swipedIds.includes(offer.id))
                .map(offer => ({
                    id: offer.id,
                    userId: offer.user_id, // Company owner's auth user ID (for match creation)
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

    testConnection: async function () {
        this.showToast('Verificando conexión...');

        // 1. Check Protocol (Common issue with Supabase Auth)
        if (window.location.protocol === 'file:') {
            alert('⚠️ ADVERTENCIA: Estás ejecutando el archivo localmente (file://). Supabase Auth NO funciona en este modo. Debes usar un servidor local (localhost) o subirlo a GitHub Pages para que el Login y guardado de datos funcionen.');
        }

        // 2. Try to get or init client
        let client = window.supabaseClient;
        if (!client && window.talentlyBackend && window.talentlyBackend.isReady) {
            client = window.supabaseClient;
        }

        if (!client) {
            if (window.supabase && window.supabase.createClient && window.talentlyBackend) {
                const ready = window.talentlyBackend.isReady; // Trigger getter
                client = window.supabaseClient;
            }
        }

        if (!client) {
            this.showToast('❌ Error Crítico: Librería Supabase no cargada.');
            return;
        }

        try {
            // Check Auth Service
            // Use the exposed client instance directly
            const client = window.supabaseClient;
            if (!client) throw new Error('Cliente Supabase no inicializado en window.supabaseClient');

            const { data: { session }, error: authError } = await client.auth.getSession();

            // On file:// session is usually null, but no error. 
            if (!session && window.location.protocol === 'file:') {
                this.showToast('⚠️ Conexión OK, pero Auth fallará por protocolo file://');
            } else if (authError) {
                throw new Error('Auth Error: ' + authError.message);
            }

            // Check Database (Profiles)
            const { count, error: dbError } = await client
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (dbError) throw new Error('DB Error: ' + dbError.message);

            this.showToast(`✅ Conexión Exitosa. Registros: ${count || 0}`);

        } catch (e) {
            console.error('Connection Test Failed:', e);
            this.showToast(`❌ Error: ${e.message}`);
        }
    },

    deleteOffer(id) {
        this.offerToDeleteId = id;
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) {
            modal.style.display = 'flex';
            // Force reflow
            modal.offsetHeight;
            modal.style.opacity = '1';
        }
    },

    closeDeleteModal() {
        this.offerToDeleteId = null;
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) modal.style.display = 'none';
    },

    async confirmDeleteOffer() {
        if (!this.offerToDeleteId) return;

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const { error } = await window.talentlyBackend.offers.delete(this.offerToDeleteId);
            if (error) {
                console.error('Error deleting offer:', error);
                this.showToast('Error al eliminar oferta');
                this.closeDeleteModal();
                return;
            }
            this.showToast('Oferta eliminada');
            this.renderCompanyOffers();
            this._loadCompanyStats(this.companyProfile || this.currentUser);
        } else {
            this.companyOffers = this.companyOffers.filter(o => o.id !== this.offerToDeleteId);
            this.renderCompanyOffers();
            this.showToast('Oferta eliminada');
        }

        this.closeDeleteModal();
    },

    async closeOffer(id) {
        if (!window.talentlyBackend || !window.talentlyBackend.isReady) return;

        const { error } = await window.talentlyBackend.offers.update(id, { status: 'closed' });
        if (error) {
            console.error('Error closing offer:', error);
            this.showToast('Error al cerrar oferta');
            return;
        }

        // Send system message to matched candidates for this offer
        try {
            const userId = (await window.supabaseClient.auth.getUser()).data.user?.id;
            if (userId) {
                // Find swipes where candidates swiped right on this offer
                const { data: swipes } = await window.supabaseClient
                    .from('swipes')
                    .select('swiper_id')
                    .eq('offer_id', id)
                    .eq('direction', 'right');

                if (swipes && swipes.length > 0) {
                    // Find matches with these candidates
                    const { data: matches } = await window.talentlyBackend.matches.get();
                    if (matches) {
                        const offer = this.companyOffers.find(o => o.id === id);
                        const offerTitle = offer ? offer.title : 'La oferta';
                        const candidateIds = swipes.map(s => s.swiper_id);

                        for (const match of matches) {
                            const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
                            if (candidateIds.includes(otherUserId)) {
                                await window.talentlyBackend.matches.sendMessage(match.id, `[Sistema] La oferta "${offerTitle}" ha sido cerrada por la empresa.`);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Could not notify candidates:', e);
        }

        this.showToast('Oferta cerrada');
        this.renderCompanyOffers();
        this._loadCompanyStats(this.companyProfile || this.currentUser);
    },

    editOffer(id) {
        const offer = this.companyOffers.find(o => o.id === id);
        if (!offer) return;

        this.createOffer(); // Open the modal (resets state first)
        this.editingOfferId = id; // Set ID AFTER opening

        // Populate Step 1 fields
        document.getElementById('offerTitle').value = offer.title || '';
        document.getElementById('offerProfessionalTitle').value = offer.professionalTitle || offer.professional_title || '';
        if (offer.modality) {
            this.selectOfferModality(offer.modality);
        }

        // Populate Step 2 fields
        if (offer.experience_years || offer.experience) {
            const years = offer.experience_years || (offer.experience ? parseInt(offer.experience) : 0);
            document.getElementById('offerExperience').value = years || 0;
            const expDisplay = document.getElementById('offerExpDisplay');
            if (expDisplay) expDisplay.textContent = years || 0;
        }
        if (offer.seniority) {
            this.selectOfferSeniority(offer.seniority);
        }
        if (offer.currency) {
            document.getElementById('offerCurrency').value = offer.currency;
        }
        if (offer.salary_min && offer.salary_max) {
            document.getElementById('offerSalaryMin').value = parseInt(offer.salary_min).toLocaleString('es-CL');
            document.getElementById('offerSalaryMax').value = parseInt(offer.salary_max).toLocaleString('es-CL');
        } else if (offer.salary) {
            const parts = offer.salary.split('-');
            if (parts.length === 2) {
                const min = parts[0].replace(/[^0-9]/g, '');
                const max = parts[1].replace(/[^0-9]/g, '');
                if (min) document.getElementById('offerSalaryMin').value = parseInt(min).toLocaleString('es-CL');
                if (max) document.getElementById('offerSalaryMax').value = parseInt(max).toLocaleString('es-CL');
            }
        }

        // Populate Step 3 fields
        document.getElementById('offerDescription').value = offer.description || '';
        this.updateDescriptionCount();
        const skillsArr = Array.isArray(offer.skills) ? offer.skills : (typeof offer.skills === 'string' && offer.skills ? offer.skills.split(',') : []);
        if (skillsArr.length > 0) {
            document.getElementById('offerSkills').value = skillsArr.join(',');
            this.selectedSkills = new Set(skillsArr);
            this._renderOfferSkillChips();
        }
        // Populate soft skills as tags
        const softSkills = offer.softSkills || offer.soft_skills || [];
        this._offerSoftSkills = Array.isArray(softSkills) ? [...softSkills] : [];
        this._renderSoftSkillChips();

        // Update title and button
        this._renderOfferStep();
    },


});
