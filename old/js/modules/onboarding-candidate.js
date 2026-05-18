// ============================================
// MÓDULO: Onboarding Candidato
// Talently — js/modules/onboarding-candidate.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: selectProfileType, continueFromStep1, nextOnboardingStep,
//          saveExperienceEntry, cancelExperienceForm, selectWorkModality,
//          selectOption, toggleSoftSkill, addInterest, renderInterests,
//          removeInterest, renderSuggestedTags, addLanguage,
//          handlePhotoUpload, handleCVUpload, removeCVUpload,
//          handleProfileCVUpload, viewProfileCV, deleteProfileCV
// ============================================

Object.assign(app, {

    selectProfileType(type, element) {
        this.profileType = type;
        localStorage.setItem('talently_user_type', type);

        // Reset all cards
        document.querySelectorAll('.profile-type-option').forEach(opt => {
            opt.style.borderColor = 'transparent';
            opt.style.background = 'white';
            opt.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
            opt.classList.remove('selected');
            const icon = opt.querySelector('.role-radio-icon');
            if (icon) { icon.textContent = 'radio_button_unchecked'; icon.style.color = '#CBD5E1'; }
        });

        // Highlight selected card
        element.style.borderColor = '#6366F1';
        element.style.boxShadow = '0 0 15px rgba(99,102,241,0.3)';
        element.classList.add('selected');
        const selectedIcon = element.querySelector('.role-radio-icon');
        if (selectedIcon) { selectedIcon.textContent = 'radio_button_checked'; selectedIcon.style.color = '#6366F1'; }

        // Enable continue button
        const btn = document.getElementById('continueStep1');
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    },

    continueFromStep1() {

        // Route to appropriate onboarding based on profile type
        if (this.profileType === 'company') {
            this.showView('companyStep2');
            // Setup RUT formatting after the view is shown
            setTimeout(() => this.setupRUTFormatting(), 100);
        } else {

            this.showView('onboardingStep2');
            // Pre-populate full name from registration data
            const fullNameInput = document.getElementById('onboardFullName');
            if (fullNameInput && !fullNameInput.value) {
                const name = this.currentUser?.name || this.currentUser?.user_metadata?.full_name || '';
                fullNameInput.value = name;
            }
        }
    },

    nextOnboardingStep(step) {
        // Inline validation helper
        const validateInput = (id, message) => {
            const el = document.getElementById(id);
            if (!el) return true;

            // Clear previous error
            el.style.borderColor = 'var(--border)';
            const prevError = el.parentNode.querySelector('.field-error-msg');
            if (prevError) prevError.remove();

            if (!el.value || el.value === '') {
                el.style.borderColor = 'var(--danger)';
                const errorMsg = document.createElement('div');
                errorMsg.className = 'field-error-msg';
                errorMsg.style.cssText = 'color: var(--danger); font-size: 12px; margin-top: 4px; font-weight: 500;';
                errorMsg.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ${message}
                    </div>`;
                el.parentNode.appendChild(errorMsg);

                // Add input listener to clear error on type
                el.addEventListener('input', function () {
                    this.style.borderColor = 'var(--border)';
                    const err = this.parentNode.querySelector('.field-error-msg');
                    if (err) err.remove();
                }, { once: true });

                return false;
            }
            return true;
        };

        const currentStep = step - 1;
        let isValid = true;

        // Step 2: Personal Info (Stitch design - name, position, country, city, salary)
        if (currentStep === 2) {
            const nameValid = validateInput('onboardFullName', 'El nombre es obligatorio');
            if (!nameValid) return;
            // Country, city, position, salary are optional - user can skip
        }

        // Step 3: Location (fields moved to step 2, auto-skip)
        if (currentStep === 3) {
            // Country and city are now in step 2, no validation needed here
        }

        // Step 4: Find your field (interests/areas - optional multi-select)
        if (currentStep === 4) {
            // Multi-select is optional, no validation needed
        }

        // Step 7: Salary (fields moved to step 2, auto-skip)
        if (currentStep === 7) {
            // Salary and currency are now in step 2, no validation needed here
        }

        // Step 10: Professional Area (moved to step 4, auto-skip)
        if (currentStep === 10) {
            // Professional area is now in step 4, no validation needed here
        }

        this.renderedSteps = this.renderedSteps || {};

        // Render dynamic content only if not already rendered or if needed
        if (step === 2 && !this.renderedSteps['country']) {
            this.renderCountries('country');
            this.renderedSteps['country'] = true;
        }
        if (step === 4) {
            this.renderFieldTags();
        }
        if (step === 11) {
            this.renderSkillsStep();
        }
        if (step === 15) {
            this.renderInterestsBubbles();
            this.renderSuggestedTags();
        }

        this.updateProgress(step);
        this.showView(`onboardingStep${step}`);
    },

    updateProgress(step) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill && progressText) {
            // Total steps is approximately 15
            const totalSteps = 15;
            const percentage = Math.min(100, Math.round((step / totalSteps) * 100));

            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% completado`;
        }
    },

    renderCountries(selectId = 'country') {
        const countrySelect = document.getElementById(selectId);
        if (!countrySelect) return;

        // Save current selection if re-rendering
        const currentVal = countrySelect.value;

        countrySelect.innerHTML = '<option value="">Selecciona tu país</option>';

        // Remove existing listener to prevent duplicates (though onchange overwrite handles it)
        // Determine correct city select ID
        let targetCityId = 'city';
        if (selectId === 'companyCountry') targetCityId = 'companyCity';
        else if (selectId === 'editCountry') targetCityId = 'editCity';

        countrySelect.onchange = () => this.updateCities(selectId, targetCityId);

        // Use DB data
        if (this.referenceData.countries.length > 0) {
            this.referenceData.countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.id; // Use ID for DB relationship
                option.textContent = country.name;
                option.setAttribute('data-code', country.code);
                countrySelect.appendChild(option);
            });
        }

        if (currentVal) {
            countrySelect.value = currentVal;
            // Trigger updateCities to load cities if a country was already selected
            // Trigger updateCities to load cities if a country was already selected
            this.updateCities(selectId, targetCityId);
        }
    },

    async updateCities(countrySelectId = 'country', citySelectId = 'city', preselectedCity = null) {
        const countrySelect = document.getElementById(countrySelectId);
        const citySelect = document.getElementById(citySelectId);

        if (!countrySelect || !citySelect) return;

        const countryId = countrySelect.value;

        // Immediate Visual Feedback: Clear and Disable
        citySelect.innerHTML = '<option value="">Cargando...</option>';
        citySelect.disabled = true;

        if (!countryId) {
            citySelect.innerHTML = '<option value="">Selecciona un país</option>';
            return;
        }

        try {
            // Fetch cities
            const { data: cities, error } = await window.talentlyBackend.reference.getCities(countryId);

            if (error) throw error;

            citySelect.innerHTML = '<option value="">Selecciona tu ciudad</option>';

            if (cities && cities.length > 0) {
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.name;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });

                // Re-enable
                citySelect.disabled = false;

                if (preselectedCity) {
                    citySelect.value = preselectedCity;
                }
            } else {
                citySelect.innerHTML = '<option value="">No hay ciudades disponibles</option>';
            }
        } catch (e) {
            console.error('Error fetching cities:', e);
            citySelect.innerHTML = '<option value="">Error al cargar ciudades (Intenta de nuevo)</option>';
        }
    },

    updateExperienceSlider(input) {
        const val = input.value;
        document.getElementById('yearsValue').textContent = val + (val >= 20 ? '+' : '');
        const percent = (val / 20) * 100;
        input.style.background = `linear-gradient(to right, var(--primary) ${percent}%, var(--border) ${percent}%)`;
    },

    formatCurrency(input) {
        let value = input.value.replace(/\D/g, ''); // Remove non-digits
        if (value === '') {
            input.value = '';
            return;
        }
        // Format with thousands separator
        input.value = new Intl.NumberFormat('es-CL').format(value);
    },

    async renderSkillsBubbles() {
        const areaSlug = document.getElementById('professionalArea').value || 'desarrollo'; // Default fallback
        const bubbleContainer = document.getElementById('skillsBubbleContainer');

        if (!bubbleContainer) return;

        bubbleContainer.innerHTML = '<div class="loader-spinner"></div>'; // Simple loading state

        try {
            // Check cache first if implemented, or just fetch
            let skills = [];

            // Map the select values (desarrollo, diseno-ux) to what DB expects if needed, 
            // but my DB generation script matched the slugs.

            const result = await window.talentlyBackend.reference.getSkills(areaSlug);
            skills = result.data || [];

            bubbleContainer.innerHTML = '';

            if (skills.length === 0) {
                bubbleContainer.innerHTML = '<p class="text-sm text-gray-500">No se encontraron habilidades para esta área.</p>';
                return;
            }

            skills.filter(skill => !this.skillsSelected.includes(skill.name)).forEach(skill => {
                const btn = document.createElement('button');
                btn.textContent = skill.name;
                btn.type = 'button';
                btn.style.cssText = 'padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border); cursor: pointer; font-size: 14px; transition: all 0.2s; background: var(--surface); color: var(--text-primary);';

                btn.onmouseover = () => { btn.style.borderColor = 'var(--primary)'; btn.style.color = 'var(--primary)'; };
                btn.onmouseout = () => { btn.style.borderColor = 'var(--border)'; btn.style.color = 'var(--text-primary)'; };

                btn.onclick = () => this.addSkill(skill.name);
                bubbleContainer.appendChild(btn);
            });

        } catch (e) {
            console.error('Error loading skills:', e);
            bubbleContainer.innerHTML = '<p class="text-error">Error cargando habilidades</p>';
        }
    },

    renderSelectedSkills() {
        // Render Selected Chips
        const chipContainer = document.getElementById('skillsSelectedContainer');
        if (chipContainer) {
            chipContainer.innerHTML = '';
            this.skillsSelected.forEach((skill, index) => {
                const chip = document.createElement('div');
                chip.style.cssText = 'padding: 6px 12px; background: var(--primary); color: white; border-radius: 16px; font-size: 14px; display: flex; align-items: center; gap: 8px;';
                chip.innerHTML = `
                        ${skill}
                        <span onclick="app.removeSkill(${index})" style="cursor: pointer; font-weight: bold;">×</span>
                    `;
                chipContainer.appendChild(chip);
            });
        }
    },

    addSkill(skill) {
        if (this.skillsSelected.length >= 10) {
            this.showToast('Máximo 10 habilidades');
            return;
        }
        if (!this.skillsSelected.includes(skill)) {
            this.skillsSelected.push(skill);
            this.renderSkillsBubbles();
        }
    },

    removeSkill(index) {
        this.skillsSelected.splice(index, 1);
        this.renderSkillsBubbles();
    },

    // ===== STITCH SKILLS STEP (unified technical + soft skills) =====

    _skillCategoryMap: {},

    _skillCatColors: {
        engineering: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        soft: { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
        design: { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
        data: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
        product: { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' },
        marketing: { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
        default: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
    },

    _softSkillsList: ['Liderazgo', 'Trabajo en equipo', 'Comunicación', 'Resolución de problemas', 'Creatividad', 'Adaptabilidad', 'Gestión del tiempo', 'Inteligencia emocional', 'Toma de decisiones', 'Proactividad', 'Mentoría', 'Oratoria'],

    _skillCategoriesData: null,

    async renderSkillsStep() {
        const container = document.getElementById('skillsCategoriesContainer');
        if (!container) return;

        container.innerHTML = '<div style="text-align: center; padding: 20px;"><span class="material-icons" style="color: #1392ec; font-size: 28px;">hourglass_empty</span></div>';

        const selectedFields = this._selectedFields || [];
        const primarySlug = selectedFields[0] || 'desarrollo';

        const slugToArea = {
            'desarrollo': { key: 'engineering', label: 'Populares en Ingeniería', icon: 'code', dbSlug: 'desarrollo' },
            'diseno-ux': { key: 'design', label: 'Populares en Diseño', icon: 'palette', dbSlug: 'diseno-ux' },
            'producto': { key: 'product', label: 'Populares en Producto', icon: 'hub', dbSlug: 'producto' },
            'marketing': { key: 'marketing', label: 'Populares en Marketing', icon: 'campaign', dbSlug: 'marketing' },
            'data': { key: 'data', label: 'Populares en Data', icon: 'storage', dbSlug: 'data' },
            'ventas': { key: 'marketing', label: 'Populares en Ventas', icon: 'trending_up', dbSlug: 'ventas' },
            'rrhh': { key: 'default', label: 'Populares en RRHH', icon: 'people', dbSlug: 'rrhh' },
            'finanzas': { key: 'data', label: 'Populares en Finanzas', icon: 'account_balance', dbSlug: 'finanzas' }
        };

        const categories = [];

        // Primary category from user's field selection
        const primaryArea = slugToArea[primarySlug] || slugToArea['desarrollo'];
        let primarySkills = [];
        try {
            const result = await window.talentlyBackend.reference.getSkills(primaryArea.dbSlug);
            if (result.data && result.data.length > 0) primarySkills = result.data.map(s => s.name);
        } catch (e) { }
        if (primarySkills.length === 0) primarySkills = skillsByArea[primaryArea.dbSlug] || skillsByArea.desarrollo || [];

        categories.push({ key: primaryArea.key, label: primaryArea.label, icon: primaryArea.icon, skills: primarySkills.slice(0, 12) });

        // Soft skills (always)
        categories.push({ key: 'soft', label: 'Habilidades Blandas', icon: 'psychology', skills: [...this._softSkillsList] });

        // Secondary category
        if (selectedFields.length > 1) {
            const secSlug = selectedFields[1];
            const secArea = slugToArea[secSlug];
            if (secArea && secArea.key !== primaryArea.key) {
                let secSkills = [];
                try {
                    const result = await window.talentlyBackend.reference.getSkills(secArea.dbSlug);
                    if (result.data && result.data.length > 0) secSkills = result.data.map(s => s.name);
                } catch (e) { }
                if (secSkills.length === 0) secSkills = skillsByArea[secArea.dbSlug] || [];
                if (secSkills.length > 0) categories.push({ key: secArea.key, label: secArea.label, icon: secArea.icon, skills: secSkills.slice(0, 10) });
            }
        } else if (primaryArea.key !== 'design') {
            let designSkills = [];
            try {
                const result = await window.talentlyBackend.reference.getSkills('diseno-ux');
                if (result.data && result.data.length > 0) designSkills = result.data.map(s => s.name);
            } catch (e) { }
            if (designSkills.length === 0) designSkills = skillsByArea['diseno-ux'] || [];
            if (designSkills.length > 0) categories.push({ key: 'design', label: 'Populares en Diseño', icon: 'palette', skills: designSkills.slice(0, 8) });
        }

        this._skillCategoriesData = categories;
        this._renderSkillCategories(categories);
        this.renderSkillsSelection();
    },

    _renderSkillCategories(categories, filter) {
        const container = document.getElementById('skillsCategoriesContainer');
        if (!container) return;

        container.innerHTML = '';
        const filterLower = (filter || '').toLowerCase();

        categories.forEach(cat => {
            const filteredSkills = filterLower ? cat.skills.filter(s => s.toLowerCase().includes(filterLower)) : cat.skills;
            if (filteredSkills.length === 0) return;

            const colors = this._skillCatColors[cat.key] || this._skillCatColors.default;

            const section = document.createElement('div');
            const header = document.createElement('h4');
            header.style.cssText = 'font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 16px 4px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px;';
            header.innerHTML = '<span class="material-icons" style="font-size: 18px;">' + cat.icon + '</span> ' + cat.label;
            section.appendChild(header);

            const wrap = document.createElement('div');
            wrap.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px;';

            filteredSkills.forEach(skill => {
                const isSelected = this.skillsSelected.includes(skill);
                const btn = document.createElement('button');
                btn.type = 'button';

                if (isSelected) {
                    btn.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: 1px solid ' + colors.border + '; background: ' + colors.bg + '; color: ' + colors.text + '; font-size: 14px; font-weight: 600; font-family: Inter, sans-serif; cursor: pointer; transition: all 0.2s;';
                    btn.innerHTML = '<span class="material-icons" style="font-size: 18px;">check_circle</span> ' + skill;
                } else {
                    btn.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff; color: #111827; font-size: 14px; font-weight: 600; font-family: Inter, sans-serif; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;';
                    btn.innerHTML = '<span class="material-icons" style="font-size: 18px; color: #9ca3af;">add</span> ' + skill;
                }

                btn.onclick = () => this.toggleSkillInStep(skill, cat.key);
                wrap.appendChild(btn);
            });

            section.appendChild(wrap);
            container.appendChild(section);
        });
    },

    toggleSkillInStep(skill, categoryKey) {
        if (this.skillsSelected.includes(skill)) {
            this.skillsSelected = this.skillsSelected.filter(s => s !== skill);
            delete this._skillCategoryMap[skill];
        } else {
            if (this.skillsSelected.length >= 10) {
                this.showToast('Máximo 10 habilidades');
                return;
            }
            this.skillsSelected.push(skill);
            this._skillCategoryMap[skill] = categoryKey;
        }

        const filter = document.getElementById('skillsSearchInput')?.value || '';
        this._renderSkillCategories(this._skillCategoriesData || [], filter);
        this.renderSkillsSelection();
    },

    removeSkillFromSelection(skill) {
        this.skillsSelected = this.skillsSelected.filter(s => s !== skill);
        delete this._skillCategoryMap[skill];

        const filter = document.getElementById('skillsSearchInput')?.value || '';
        this._renderSkillCategories(this._skillCategoriesData || [], filter);
        this.renderSkillsSelection();
    },

    renderSkillsSelection() {
        const area = document.getElementById('skillsSelectionArea');
        const divider = document.getElementById('skillsDivider');
        const tagsContainer = document.getElementById('skillsSelectedTags');
        const badge = document.getElementById('skillsSelectedBadge');

        if (!area || !tagsContainer) return;

        const count = this.skillsSelected.length;

        if (count === 0) {
            area.style.display = 'none';
            if (divider) divider.style.display = 'none';
            return;
        }

        area.style.display = 'block';
        if (divider) divider.style.display = 'block';

        badge.textContent = count + ' seleccionada' + (count !== 1 ? 's' : '');

        tagsContainer.innerHTML = '';
        this.skillsSelected.forEach(skill => {
            const catKey = this._skillCategoryMap[skill] || 'default';
            const colors = this._skillCatColors[catKey] || this._skillCatColors.default;

            const tag = document.createElement('button');
            tag.type = 'button';
            tag.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 10px 8px 10px 16px; border-radius: 12px; background: ' + colors.bg + '; color: ' + colors.text + '; border: 1px solid ' + colors.border + '; font-size: 14px; font-weight: 700; font-family: Inter, sans-serif; cursor: pointer; transition: all 0.2s;';
            tag.innerHTML = '<span>' + skill + '</span><div style="padding: 2px; border-radius: 50%;"><span class="material-icons" style="font-size: 18px;">close</span></div>';
            tag.onclick = () => this.removeSkillFromSelection(skill);
            tagsContainer.appendChild(tag);
        });
    },

    filterSkillsSearch(query) {
        if (!this._skillCategoriesData) return;
        this._renderSkillCategories(this._skillCategoriesData, query);
    },

    // ===== END STITCH SKILLS STEP =====

    renderInterestsBubbles() {
        const container = document.getElementById('interestsBubbleSection');
        container.innerHTML = '';

        // Get Area-specific interests
        const area = document.getElementById('professionalArea').value || 'other';
        const professionalInterests = this.interestsByArea[area] || [];

        // Combined Data
        const allInterestsData = {
            'Intereses Profesionales': professionalInterests,
            ...this.interestsData
        };

        Object.entries(allInterestsData).forEach(([category, interests]) => {
            const catDiv = document.createElement('div');
            catDiv.innerHTML = `<h3 style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">${category}</h3>`;

            const bubblesDiv = document.createElement('div');
            bubblesDiv.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';

            interests.forEach(interest => {
                const btn = document.createElement('button');
                btn.textContent = interest;
                btn.type = 'button';

                if (!this.interests) this.interests = [];
                const isSelected = this.interests.includes(interest);
                const baseStyle = 'padding: 6px 14px; border-radius: 16px; border: 1px solid; cursor: pointer; font-size: 13px; transition: all 0.2s;';
                const defaultStyle = 'background: var(--surface); border-color: var(--border); color: var(--text-primary);';
                const activeStyle = 'background: rgba(108, 92, 231, 0.1); border-color: var(--primary); color: var(--primary);';

                btn.style.cssText = baseStyle + (isSelected ? activeStyle : defaultStyle);
                btn.onclick = () => this.toggleInterestBubble(interest, btn);

                bubblesDiv.appendChild(btn);
            });

            catDiv.appendChild(bubblesDiv);
            container.appendChild(catDiv);
        });
    },

    toggleInterestBubble(interest, btn) {
        if (!this.interests) this.interests = [];
        const index = this.interests.indexOf(interest);
        const activeStyle = 'background: rgba(108, 92, 231, 0.1); border-color: var(--primary); color: var(--primary);';
        const defaultStyle = 'background: var(--surface); border-color: var(--border); color: var(--text-primary);';
        const baseStyle = 'padding: 6px 14px; border-radius: 16px; border: 1px solid; cursor: pointer; font-size: 13px; transition: all 0.2s;';

        if (index > -1) {
            this.interests.splice(index, 1);
            btn.style.cssText = baseStyle + defaultStyle;
        } else {
            if (this.interests.length >= 15) {
                this.showToast('Máximo 15 intereses');
                return;
            }
            this.interests.push(interest);
            btn.style.cssText = baseStyle + activeStyle;
        }

        this.renderInterests();
    },

    // ===== STEP 4: FIND YOUR FIELD (Stitch) =====
    _fieldRoles: [
        { slug: 'desarrollo', name: 'Ingeniería de Software', color: '#e0f2fe', border: '#93c5fd' },
        { slug: 'diseno-ux', name: 'Diseño UX/UI', color: '#f3e8ff', border: '#c4b5fd' },
        { slug: 'marketing', name: 'Marketing Digital', color: '#fce7f3', border: '#f9a8d4' },
        { slug: 'producto', name: 'Product Management', color: '#fef9c3', border: '#fde047' },
        { slug: 'data', name: 'Data Science', color: '#e0f2fe', border: '#93c5fd' },
        { slug: 'ventas', name: 'Ventas / Comercial', color: '#ffedd5', border: '#fdba74' },
        { slug: 'soporte', name: 'Customer Success', color: '#dcfce7', border: '#86efac' },
        { slug: 'devops', name: 'DevOps / Cloud', color: '#e0f2fe', border: '#93c5fd' },
    ],
    _fieldIndustries: [
        { slug: 'fintech', name: 'FinTech', color: '#dcfce7', border: '#86efac' },
        { slug: 'salud', name: 'Salud / Healthcare', color: '#fce7f3', border: '#f9a8d4' },
        { slug: 'ecommerce', name: 'E-Commerce', color: '#ffedd5', border: '#fdba74' },
        { slug: 'edtech', name: 'EdTech', color: '#f3e8ff', border: '#c4b5fd' },
        { slug: 'ciberseguridad', name: 'Ciberseguridad', color: '#e0f2fe', border: '#93c5fd' },
        { slug: 'rrhh', name: 'Recursos Humanos', color: '#fef9c3', border: '#fde047' },
        { slug: 'operaciones', name: 'Operaciones', color: '#dcfce7', border: '#86efac' },
        { slug: 'finanzas', name: 'Finanzas', color: '#ffedd5', border: '#fdba74' },
        { slug: 'legal', name: 'Legal', color: '#f3e8ff', border: '#c4b5fd' },
        { slug: 'administracion', name: 'Administración', color: '#fef9c3', border: '#fde047' },
    ],
    _selectedFields: [],

    renderFieldTags() {
        const renderGroup = (items, containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';
            items.forEach(item => {
                const isSelected = this._selectedFields.includes(item.slug);
                const btn = document.createElement('button');
                btn.setAttribute('data-slug', item.slug);
                btn.setAttribute('data-name', item.name.toLowerCase());
                btn.style.cssText = `display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 9999px; font-size: 14px; font-weight: ${isSelected ? '700' : '500'}; border: 1px solid ${isSelected ? item.border : '#e2e8f0'}; background: ${isSelected ? item.color : 'white'}; color: ${isSelected ? '#1e293b' : '#64748b'}; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-family: 'Inter', sans-serif;`;
                btn.innerHTML = `<span>${item.name}</span>${isSelected ? '<span class="material-icons" style="font-size: 18px; color: #1392ec;">check_circle</span>' : ''}`;
                btn.onclick = () => this.toggleFieldTag(item.slug, item);
                container.appendChild(btn);
            });
        };
        renderGroup(this._fieldRoles, 'fieldRolesContainer');
        renderGroup(this._fieldIndustries, 'fieldIndustriesContainer');
        // Update counter
        const countEl = document.getElementById('fieldSelectedCount');
        const numEl = document.getElementById('fieldCountNum');
        if (countEl && numEl) {
            numEl.textContent = this._selectedFields.length;
            countEl.style.display = this._selectedFields.length > 0 ? 'block' : 'none';
        }
    },

    toggleFieldTag(slug, item) {
        const idx = this._selectedFields.indexOf(slug);
        if (idx >= 0) {
            this._selectedFields.splice(idx, 1);
        } else {
            this._selectedFields.push(slug);
        }
        // Also sync to interests array for completeOnboarding
        this.interests = [...this._selectedFields];
        this.renderFieldTags();
    },

    filterFieldTags(query) {
        const q = query.toLowerCase().trim();
        document.querySelectorAll('#fieldRolesContainer button, #fieldIndustriesContainer button').forEach(btn => {
            const name = btn.getAttribute('data-name') || '';
            btn.style.display = !q || name.includes(q) ? 'flex' : 'none';
        });
    },

    // ===== STEP 6: EDUCATION HISTORY (Stitch) =====
    _educationEntries: [],
    _editingEduIndex: -1,

    renderEducationEntries() {
        const list = document.getElementById('educationEntriesList');
        if (!list) return;
        list.innerHTML = '';
        const colors = [
            { bg: '#eff6ff', color: '#1392ec', icon: 'school' },
            { bg: '#ecfdf5', color: '#059669', icon: 'history_edu' },
            { bg: '#fef3c7', color: '#d97706', icon: 'workspace_premium' },
            { bg: '#f3e8ff', color: '#7c3aed', icon: 'psychology' },
        ];
        this._educationEntries.forEach((entry, idx) => {
            const c = colors[idx % colors.length];
            const card = document.createElement('div');
            card.style.cssText = 'position: relative; background: white; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; display: flex; align-items: flex-start; gap: 16px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';
            card.innerHTML = `
                <div style="flex-shrink: 0; width: 48px; height: 48px; border-radius: 12px; background: ${c.bg}; color: ${c.color}; display: flex; align-items: center; justify-content: center;">
                    <span class="material-icons">${c.icon}</span>
                </div>
                <div style="flex: 1; min-width: 0; padding-top: 2px;">
                    <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.degree}</h3>
                    <p style="color: #64748b; font-size: 14px; margin: 2px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${entry.institution}</p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0; font-weight: 500;">${entry.year ? (entry.year === 'cursando' ? 'Cursando actualmente' : 'Egreso ' + entry.year) : ''}</p>
                </div>
                <div style="display: flex; gap: 4px;">
                    <button onclick="app.editEducationEntry(${idx})" style="padding: 8px; color: #94a3b8; border: none; background: transparent; border-radius: 50%; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#1392ec'; this.style.background='#eff6ff'" onmouseout="this.style.color='#94a3b8'; this.style.background='transparent'">
                        <span class="material-icons" style="font-size: 20px;">edit</span>
                    </button>
                    <button onclick="app.removeEducationEntry(${idx})" style="padding: 8px; color: #94a3b8; border: none; background: transparent; border-radius: 50%; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#ef4444'; this.style.background='#fef2f2'" onmouseout="this.style.color='#94a3b8'; this.style.background='transparent'">
                        <span class="material-icons" style="font-size: 20px;">delete</span>
                    </button>
                </div>
            `;
            list.appendChild(card);
        });
    },

    showEducationForm() {
        this._editingEduIndex = -1;
        const form = document.getElementById('educationFormSection');
        const title = document.getElementById('educationFormTitle');
        if (form) form.style.display = 'block';
        if (title) title.textContent = 'Agregar nuevo título';
        document.getElementById('eduDegree').value = '';
        document.getElementById('eduInstitution').value = '';
        // Populate year select
        const yearSel = document.getElementById('eduYear');
        if (yearSel && yearSel.options.length <= 1) {
            const currentYear = new Date().getFullYear();
            const optCursando = document.createElement('option');
            optCursando.value = 'cursando';
            optCursando.textContent = 'Cursando actualmente';
            yearSel.appendChild(optCursando);
            for (let y = currentYear; y >= 1970; y--) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                yearSel.appendChild(opt);
            }
        }
        yearSel.value = '';
        document.getElementById('addEducationBtn').style.display = 'none';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    editEducationEntry(idx) {
        const entry = this._educationEntries[idx];
        if (!entry) return;
        this._editingEduIndex = idx;
        this.showEducationForm();
        document.getElementById('eduDegree').value = entry.degree;
        document.getElementById('eduInstitution').value = entry.institution;
        document.getElementById('eduYear').value = entry.year || '';
        const title = document.getElementById('educationFormTitle');
        if (title) title.textContent = 'Editar título';
    },

    removeEducationEntry(idx) {
        this._educationEntries.splice(idx, 1);
        this.renderEducationEntries();
    },

    saveEducationEntry() {
        const degree = document.getElementById('eduDegree').value.trim();
        const institution = document.getElementById('eduInstitution').value.trim();
        const year = document.getElementById('eduYear').value;
        if (!degree) { this.showToast('Ingresa el nombre del título', 'error'); return; }
        if (!institution) { this.showToast('Ingresa la institución', 'error'); return; }
        const entry = { degree, institution, year };
        if (this._editingEduIndex >= 0) {
            this._educationEntries[this._editingEduIndex] = entry;
        } else {
            this._educationEntries.push(entry);
        }
        this._editingEduIndex = -1;
        this.cancelEducationForm();
        this.renderEducationEntries();
    },

    cancelEducationForm() {
        const form = document.getElementById('educationFormSection');
        if (form) form.style.display = 'none';
        document.getElementById('addEducationBtn').style.display = 'flex';
        this._editingEduIndex = -1;
    },

    // ===== STEP 8: WORK EXPERIENCE (Stitch) =====
    _experienceEntries: [],
    _editingExpIndex: -1,

    renderExperienceEntries() {
        const list = document.getElementById('experienceEntriesList');
        const line = document.getElementById('expTimelineLine');
        if (!list) return;
        list.innerHTML = '';
        if (line) line.style.display = this._experienceEntries.length > 0 ? 'block' : 'none';
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        this._experienceEntries.forEach((entry, idx) => {
            const isCurrent = entry.currentlyWorking;
            let dateStr = '', durationStr = '';
            if (entry.startDate) {
                const [sy, sm] = entry.startDate.split('-');
                dateStr = `${months[parseInt(sm) - 1]} ${sy}`;
                const endMs = isCurrent ? Date.now() : (entry.endDate ? new Date(entry.endDate).getTime() : null);
                if (isCurrent) dateStr += ' - Presente';
                else if (entry.endDate) { const [ey, em] = entry.endDate.split('-'); dateStr += ` - ${months[parseInt(em) - 1]} ${ey}`; }
                if (endMs) {
                    const diff = endMs - new Date(entry.startDate).getTime();
                    const yrs = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
                    const mos = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                    durationStr = (yrs > 0 ? yrs + ' año' + (yrs > 1 ? 's ' : ' ') : '') + mos + ' mes' + (mos !== 1 ? 'es' : '');
                }
            }
            const row = document.createElement('div');
            row.style.cssText = 'position: relative; display: grid; grid-template-columns: 40px 1fr; gap: 0 20px; margin-bottom: 40px; z-index: 10;';
            row.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; padding-top: 4px;">
                    <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; ${isCurrent ? 'background: #1392ec; color: white; box-shadow: 0 10px 15px -3px rgba(19,146,236,0.3);' : 'background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0;'} z-index: 10;">
                        <span class="material-icons" style="font-size: 20px;">${isCurrent ? 'work' : 'work_history'}</span>
                    </div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 16px; box-shadow: ${isCurrent ? '0 2px 15px -3px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.05)'}; border: 1px solid #f1f5f9;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <h3 style="font-size: 19px; font-weight: 700; color: #0f172a; margin: 0;">${entry.title}</h3>
                        <div style="display: flex; gap: 2px;">
                            <button onclick="app.editExperienceEntry(${idx})" style="padding: 4px; color: #cbd5e1; border: none; background: transparent; cursor: pointer;" onmouseover="this.style.color='#1392ec'" onmouseout="this.style.color='#cbd5e1'"><span class="material-icons" style="font-size: 20px;">edit</span></button>
                            <button onclick="app.removeExperienceEntry(${idx})" style="padding: 4px; color: #cbd5e1; border: none; background: transparent; cursor: pointer;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#cbd5e1'"><span class="material-icons" style="font-size: 20px;">delete</span></button>
                        </div>
                    </div>
                    <p style="color: #334155; font-weight: 600; font-size: 16px; margin: 0 0 12px;">${entry.company}</p>
                    ${dateStr ? `<div style="display: flex; align-items: center; gap: 8px; ${entry.description ? 'margin-bottom: 16px;' : ''}">
                        <div style="background: #f8fafc; padding: 4px 8px; border-radius: 4px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                            <span class="material-icons" style="font-size: 14px;">calendar_today</span>${dateStr}
                        </div>
                        ${durationStr ? `<span style="color: #cbd5e1;">&#8226;</span><span style="color: #94a3b8; font-size: 12px;">${durationStr}</span>` : ''}
                    </div>` : ''}
                    ${entry.description ? `<p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">${entry.description}</p>` : ''}
                </div>`;
            list.appendChild(row);
        });
    },

    showExperienceForm() {
        this._editingExpIndex = -1;
        const form = document.getElementById('experienceFormSection');
        if (form) form.style.display = 'block';
        document.getElementById('experienceFormTitle').textContent = 'Agregar posición';
        document.getElementById('expTitle').value = '';
        document.getElementById('expCompany').value = '';
        document.getElementById('expStartDate').value = '';
        document.getElementById('expEndDate').value = '';
        document.getElementById('expEndDate').disabled = false;
        document.getElementById('expCurrentlyWorking').checked = false;
        document.getElementById('expDescription').value = '';
        document.getElementById('addExpBtnRow').style.display = 'none';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    editExperienceEntry(idx) {
        const entry = this._experienceEntries[idx];
        if (!entry) return;
        this._editingExpIndex = idx;
        this.showExperienceForm();
        document.getElementById('expTitle').value = entry.title;
        document.getElementById('expCompany').value = entry.company;
        document.getElementById('expStartDate').value = entry.startDate || '';
        document.getElementById('expEndDate').value = entry.endDate || '';
        document.getElementById('expCurrentlyWorking').checked = entry.currentlyWorking || false;
        document.getElementById('expEndDate').disabled = entry.currentlyWorking || false;
        document.getElementById('expDescription').value = entry.description || '';
        document.getElementById('experienceFormTitle').textContent = 'Editar posición';
    },

    removeExperienceEntry(idx) {
        this._experienceEntries.splice(idx, 1);
        this.renderExperienceEntries();
    },

    saveExperienceEntry() {
        const title = document.getElementById('expTitle').value.trim();
        const company = document.getElementById('expCompany').value.trim();
        const startDate = document.getElementById('expStartDate').value;
        const endDate = document.getElementById('expEndDate').value;
        const currentlyWorking = document.getElementById('expCurrentlyWorking').checked;
        const description = document.getElementById('expDescription').value.trim();
        if (!title) { this.showToast('Ingresa el cargo', 'error'); return; }
        if (!company) { this.showToast('Ingresa la empresa', 'error'); return; }
        const entry = { title, company, startDate, endDate: currentlyWorking ? null : endDate, currentlyWorking, description };
        if (this._editingExpIndex >= 0) {
            this._experienceEntries[this._editingExpIndex] = entry;
        } else {
            this._experienceEntries.unshift(entry);
        }
        this._editingExpIndex = -1;
        this.cancelExperienceForm();
        this.renderExperienceEntries();
    },

    cancelExperienceForm() {
        const form = document.getElementById('experienceFormSection');
        if (form) form.style.display = 'none';
        document.getElementById('addExpBtnRow').style.display = 'grid';
        this._editingExpIndex = -1;
    },

    selectWorkModality(value, element) {
        // Stitch-style work modality card selection
        document.querySelectorAll('#onboardingStep3 .modality-option').forEach(opt => {
            opt.style.border = '1px solid transparent';
            const radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
            const icon = opt.querySelector('.modality-icon');
            if (icon) { icon.style.background = '#f3f4f6'; icon.style.color = '#6b7280'; }
            const check = opt.querySelector('.modality-check');
            if (check) { check.style.borderColor = '#d1d5db'; check.style.background = 'transparent'; check.style.color = 'transparent'; }
        });
        // Select clicked
        element.style.border = '2px solid #1392ec';
        element.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
        const radio = element.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        const icon = element.querySelector('.modality-icon');
        if (icon) { icon.style.background = '#1392ec'; icon.style.color = 'white'; icon.style.boxShadow = '0 4px 6px -1px rgba(19,146,236,0.3)'; }
        const check = element.querySelector('.modality-check');
        if (check) { check.style.borderColor = '#1392ec'; check.style.background = '#1392ec'; check.style.color = 'white'; }
    },

    selectOption(category, value, element) {
        // Generic function for radio button options with styling
        // Map category names to actual CSS class names used in HTML
        const classMap = {
            'companyStage': 'company-stage-option',
            'workModel': 'work-model-option'
        };
        const groupClass = classMap[category] || `${category}-option`;

        // Deselect all options (styling + radio button)
        document.querySelectorAll(`.${groupClass}`).forEach(opt => {
            opt.style.borderColor = 'var(--border)';
            opt.style.background = 'transparent';
            opt.style.removeProperty('background');
            const radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });

        // Select clicked option (styling + radio button)
        element.style.borderColor = 'var(--primary)';
        element.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(162, 155, 254, 0.1) 100%)';

        const radioInput = element.querySelector('input[type="radio"]');
        if (radioInput) radioInput.checked = true;
    },

    toggleSoftSkill(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        const isChecked = checkbox.checked;

        // Count selected
        const checkedCount = document.querySelectorAll('.soft-skill-option input:checked').length;

        // Update counter
        document.getElementById('softSkillsCount').textContent = checkedCount;

        // Limit to 6
        if (checkedCount > 6) {
            checkbox.checked = false;
            alert('Máximo 6 habilidades blandas');
            return;
        }

        // Update styling
        if (isChecked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(162, 155, 254, 0.1) 100%)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }
    },

    addInterest(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const interest = input.value.trim();

            if (!this.interests) this.interests = [];

            if (interest && this.interests.length < 15) {
                this.interests.push(interest);
                this.renderInterests();
                input.value = '';
            } else if (this.interests.length >= 15) {
                alert('Máximo 15 tags de intereses');
            }
        }
    },

    renderInterests() {
        const container = document.getElementById('interestsContainer');
        const input = document.getElementById('interestInput');

        // Clear existing tags (except input)
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());

        // Add interest tags
        this.interests.forEach((interest, index) => {
            const tag = document.createElement('div');
            tag.className = 'tag-item';
            tag.style.cssText = 'padding: 8px 14px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
            tag.innerHTML = `
                ${interest}
                <button onclick="app.removeInterest(${index})" style="width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.3); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            `;
            container.insertBefore(tag, input);
        });

        // Update counter
        document.getElementById('interestsCount').textContent = this.interests.length;

        // Populate suggested tags on first render or update them
        this.renderSuggestedTags();
    },

    removeInterest(index) {
        this.interests.splice(index, 1);
        this.renderInterests();
    },

    renderSuggestedTags() {
        const container = document.getElementById('suggestedTags');
        if (!container) return; // Guard clause
        container.innerHTML = ''; // Clear previous

        // Logic to get selected area (assuming it's saved in a variable or we get it from DOM)
        // For now, let's assume we store it in this.userProfile.area or similar. 
        // If not, we'll try to get it from the onboardingStep4 selection if possible, 
        // but given the app structure, we might need to store it when selected.

        const selectedAreaInput = document.getElementById('professionalArea'); // Step 10 Use Select
        const selectedArea = selectedAreaInput ? selectedAreaInput.value : 'default';

        const interestsByArea = {
            'operaciones': ['Logística', 'Supply Chain', 'Mejora Continua', 'Lean Six Sigma', 'Gestión de Proyectos', 'Operaciones', 'Distribución', 'Inventarios', 'KPIs', 'Calidad', 'Seguridad Industrial', 'Planificación', 'Compras'],
            'desarrollo': ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Cloud', 'Cybersecurity', 'AI/ML', 'Blockchain', 'QA', 'Arquitectura', 'Data Science', 'IoT'],
            'diseno-ux': ['UX Research', 'UI Design', 'Product Design', 'Graphic Design', 'Motion Graphics', 'Branding', 'Prototyping', 'Design Systems', 'Figma', 'Adobe Suit'],
            'marketing': ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Email Marketing', 'Growth Hacking', 'Brand Management', 'Analytics', 'Copywriting', 'Public Relations'],
            'ventas': ['B2B Sales', 'B2C Sales', 'Account Management', 'Lead Generation', 'CRM', 'Negotiation', 'Sales Strategy', 'Customer Success', 'Business Development'],
            'rrhh': ['Recruitment', 'Talent Acquisition', 'Employee Relations', 'Comp & Ben', 'L&D', 'People Analytics', 'Organizational Culture', 'HRBP'],
            'finanzas': ['Financial Analysis', 'Accounting', 'Auditing', 'Taxation', 'Corporate Finance', 'Investment Banking', 'Risk Management', 'Controlling'],
            'producto': ['Startups', 'Tech Trends', 'Innovation', 'User Psychology', 'Behavioral Economics', 'SaaS', 'Fintech', 'Growth'],
            'data': ['Data Engineering', 'Deep Learning', 'NLP', 'Computer Vision', 'Algorithmic Trading', ' Kaggle', 'Data Ethics'],
            'default': ['FinTech', 'E-commerce', 'HealthTech', 'EdTech', 'SaaS', 'Innovación', 'Startup Culture', 'Remote First', 'Agile', 'Scrum']
        };

        const suggestions = interestsByArea[selectedArea] || interestsByArea['default'];

        suggestions.filter(tag => !this.interests.includes(tag)).forEach(tag => {
            const tagEl = document.createElement('button');
            tagEl.style.cssText = 'padding: 8px 14px; background: var(--bg); color: var(--primary); border: 1px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;';
            tagEl.textContent = tag;
            tagEl.onclick = () => {
                if (!this.interests) this.interests = [];
                if (this.interests.length < 15 && !this.interests.includes(tag)) {
                    this.interests.push(tag);
                    this.renderInterests();
                }
            };
            tagEl.onmouseover = () => {
                tagEl.style.background = 'var(--primary)';
                tagEl.style.color = 'white';
            };
            tagEl.onmouseout = () => {
                tagEl.style.background = 'var(--bg)';
                tagEl.style.color = 'var(--primary)';
            };
            container.appendChild(tagEl);
        });
    },

    addLanguage() {
        const container = document.getElementById('languagesContainer');
        const newLanguage = document.createElement('div');
        newLanguage.className = 'language-item';
        newLanguage.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px;';
        newLanguage.innerHTML = `
            <select class="form-input" style="flex: 2;">
                <option value="">Selecciona idioma</option>
                <option value="espanol">Español</option>
                <option value="ingles">Inglés</option>
                <option value="portugues">Portugués</option>
                <option value="frances">Francés</option>
                <option value="aleman">Alemán</option>
                <option value="italiano">Italiano</option>
                <option value="chino">Chino</option>
            </select>
            <select class="form-input" style="flex: 1;">
                <option value="">Nivel</option>
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
                <option value="nativo">Nativo</option>
            </select>
        `;
        container.appendChild(newLanguage);
    },

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('La foto debe ser menor a 5MB');
                return;
            }

            if (!this.pendingUploads) this.pendingUploads = {};
            this.pendingUploads.photo = file;

            // Update Stitch photo circle with preview
            const circle = document.getElementById('mediaPhotoCircle');
            if (circle) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    circle.innerHTML = '';
                    circle.style.backgroundImage = 'url(' + e.target.result + ')';
                    circle.style.backgroundSize = 'cover';
                    circle.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(file);
            }

            const preview = document.getElementById('photoPreview');
            if (preview) preview.style.display = 'block';
        }
    },

    handleCVUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('El CV debe ser menor a 5MB');
                return;
            }

            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                this.showToast('El CV debe ser PDF o DOCX');
                return;
            }

            if (!this.pendingUploads) this.pendingUploads = {};
            this.pendingUploads.cv = file;

            // Show Stitch file info
            const fileInfo = document.getElementById('mediaCvFileInfo');
            const dropzone = document.getElementById('mediaCvDropzone');
            const fileName = document.getElementById('mediaCvFileName');
            const fileSize = document.getElementById('mediaCvFileSize');

            if (fileInfo && dropzone) {
                const sizeKB = (file.size / 1024).toFixed(0);
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                const sizeText = file.size > 1024 * 1024 ? sizeMB + ' MB' : sizeKB + ' KB';

                if (fileName) fileName.textContent = file.name;
                if (fileSize) fileSize.textContent = sizeText + ' \u2022 Completado';
                fileInfo.style.display = 'block';
                dropzone.style.display = 'none';
            }

            const preview = document.getElementById('cvPreview');
            if (preview) preview.style.display = 'block';
        }
    },

    removeCVUpload() {
        if (this.pendingUploads) delete this.pendingUploads.cv;

        const fileInfo = document.getElementById('mediaCvFileInfo');
        const dropzone = document.getElementById('mediaCvDropzone');
        const cvInput = document.getElementById('cvInput');
        const preview = document.getElementById('cvPreview');

        if (fileInfo) fileInfo.style.display = 'none';
        if (dropzone) dropzone.style.display = 'flex';
        if (cvInput) cvInput.value = '';
        if (preview) preview.style.display = 'none';
    },

    async handleProfileCVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('El CV debe ser menor a 5MB', 'error');
            return;
        }

        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            this.showToast('El CV debe ser PDF o DOCX', 'error');
            return;
        }

        const cvUploadingState = document.getElementById('cvUploadingState');
        const cvEmptyState = document.getElementById('cvEmptyState');
        const cvViewState = document.getElementById('cvViewState');
        const cvUploadBtn = document.getElementById('profileCvUploadBtn');

        if (cvEmptyState) cvEmptyState.style.display = 'none';
        if (cvViewState) cvViewState.style.display = 'none';
        if (cvUploadBtn) cvUploadBtn.style.display = 'none';
        if (cvUploadingState) cvUploadingState.style.display = 'flex';

        try {
            const publicUrl = await window.talentlyBackend.storage.uploadDocument(file);

            if (publicUrl) {
                // Actualizar info en base de datos de usuario
                const { error } = await window.supabaseClient.from('profiles').update({ cv_url: publicUrl }).eq('id', this.currentUser.id);
                if (error) throw error;

                this.currentUser.cv_url = publicUrl;
                this.showToast('CV subido exitosamente', 'success');
            } else {
                throw new Error("No se pudo obtener URL del documento");
            }
        } catch (error) {
            console.error('Error al subir CV:', error);
            this.showToast('Error al subir el documento. Revisa la consola y los permisos de Storage.', 'error');
        } finally {
            if (cvUploadingState) cvUploadingState.style.display = 'none';
            // Restablecer el input file para permitir seleccionar el mismo archivo de nuevo si falló
            const input = document.getElementById('profileCvInput');
            if (input) input.value = '';

            // Volver a dibujar
            this.renderProfile();
        }
    },

    viewProfileCV() {
        if (this.currentUser && this.currentUser.cv_url) {
            window.open(this.currentUser.cv_url, '_blank');
        } else {
            this.showToast('No hay CV disponible', 'warning');
        }
    },

    async deleteProfileCV() {
        if (!confirm('¿Estás seguro de que deseas eliminar tu Currículum guardado?')) return;

        try {
            const { error } = await window.supabaseClient.profiles.update({ cv_url: null });
            if (error) throw error;

            this.currentUser.cv_url = null;
            this.showToast('Currículum eliminado', 'success');
            this.renderProfile();
        } catch (error) {
            console.error('Error eliminando CV:', error);
            this.showToast('Error al eliminar el documento.', 'error');
        }
    },



});
