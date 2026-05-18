// ============================================
// MÓDULO: Onboarding Empresa
// Talently — js/modules/onboarding-company.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: validateRUT, formatRUT, setupRUTFormatting,
//          loadCompanySizesAndSectors, loadCompanyCultureValues,
//          loadCompanyStages, selectCompanyStage, loadCompanySizesForSlider,
//          updateCompanySizeSlider, loadWorkModels, loadCompanyBenefitsChips,
//          loadCompanyPositions, togglePositionChip, loadSeniorityLevels,
//          toggleSeniorityCard, validateCompanyStep, nextCompanyStep,
//          completeCompanyOnboarding, goToCompanyDashboard,
//          completeOnboarding, showSuccessView
// ============================================

Object.assign(app, {

    // Función para validar RUT chileno (algoritmo módulo 11)
    validateRUT(rut) {
        // Limpiar RUT (eliminar puntos, guiones y espacios)
        const cleanRUT = rut.replace(/[^0-9kK]/g, '');

        if (cleanRUT.length < 2) return false;

        // Separar número y dígito verificador
        const rutNumber = cleanRUT.slice(0, -1);
        const verifier = cleanRUT.slice(-1).toUpperCase();

        // Calcular dígito verificador esperado
        let sum = 0;
        let multiplier = 2;

        for (let i = rutNumber.length - 1; i >= 0; i--) {
            sum += parseInt(rutNumber[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const expectedVerifier = 11 - (sum % 11);
        let calculatedVerifier;

        if (expectedVerifier === 11) calculatedVerifier = '0';
        else if (expectedVerifier === 10) calculatedVerifier = 'K';
        else calculatedVerifier = expectedVerifier.toString();

        return verifier === calculatedVerifier;
    },

    // Función para formatear RUT con puntos y guión
    formatRUT(rut) {
        // Limpiar RUT (solo números y K)
        const cleanRUT = rut.replace(/[^0-9kK]/g, '').toUpperCase();

        if (cleanRUT.length < 2) return cleanRUT;

        // Separar número y dígito verificador
        const rutNumber = cleanRUT.slice(0, -1);
        const verifier = cleanRUT.slice(-1);

        // Agregar puntos cada 3 dígitos desde la derecha
        const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${formattedNumber}-${verifier}`;
    },

    // Event listener para formateo automático de RUT
    setupRUTFormatting() {
        const taxIdInput = document.getElementById('companyTaxId');
        if (taxIdInput) {
            // Prevenir caracteres inválidos al escribir (keydown)
            taxIdInput.addEventListener('keydown', (e) => {
                const key = e.key;
                if (!key) return;

                // Permitir teclas de control (backspace, delete, arrows, tab, etc.)
                if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(key)) {
                    return;
                }

                // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                if (e.ctrlKey || e.metaKey) {
                    return;
                }

                // Solo permitir números del 0-9
                if (key >= '0' && key <= '9') {
                    return;
                }

                // Permitir la letra K (mayúscula o minúscula)
                if (key.toLowerCase() === 'k') {
                    return;
                }

                // Bloquear cualquier otro carácter
                e.preventDefault();
            });

            // Bloquear caracteres inválidos a nivel de beforeinput (más robusto, cubre mobile/IME)
            taxIdInput.addEventListener('beforeinput', (e) => {
                // Solo filtrar inserciones de texto (no borrado, selección, etc.)
                if (e.data && e.inputType && (e.inputType === 'insertText' || e.inputType === 'insertCompositionText')) {
                    // Si el carácter insertado no es número ni K, bloquear
                    if (!/^[0-9kK]$/.test(e.data)) {
                        e.preventDefault();
                    }
                }
            });

            // Formateo automático y sanitización al escribir
            taxIdInput.addEventListener('input', (e) => {
                const cursorPosition = e.target.selectionStart;
                const oldValue = e.target.value;

                // Primero sanitizar: eliminar CUALQUIER carácter que no sea número o K
                // (cubre paste, autocomplete, drag-drop, mobile keyboards, etc.)
                const sanitized = oldValue.replace(/[^0-9kK.\-]/g, '');

                // Luego formatear con puntos y guión
                const newValue = this.formatRUT(sanitized);

                // Solo actualizar si el valor cambió
                if (oldValue !== newValue) {
                    e.target.value = newValue;
                    // Ajustar posición del cursor
                    const diff = newValue.length - oldValue.length;
                    const newCursor = Math.max(0, cursorPosition + diff);
                    e.target.setSelectionRange(newCursor, newCursor);
                }
            });

            // También sanitizar al pegar (paste)
            taxIdInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                // Limpiar el texto pegado: solo números y K
                const cleanPasted = pastedText.replace(/[^0-9kK]/g, '');
                if (cleanPasted) {
                    // Insertar el texto limpio en la posición del cursor
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const currentVal = e.target.value.replace(/[^0-9kK]/g, '');
                    const newVal = currentVal.slice(0, start) + cleanPasted + currentVal.slice(end);
                    e.target.value = this.formatRUT(newVal);
                    // Set cursor after pasted content
                    const formatted = e.target.value;
                    e.target.setSelectionRange(formatted.length, formatted.length);
                }
            });
        }
    },

    // Cargar company sizes y sectors desde BD
    async loadCompanySizesAndSectors() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            // Load sizes
            const { data: sizes } = await backend.reference.getCompanySizes();
            const sizeSelect = document.getElementById('companySize');
            if (sizeSelect && sizes) {
                sizeSelect.innerHTML = '<option value="">Selecciona una opción</option>';
                sizes.forEach(size => {
                    const option = document.createElement('option');
                    option.value = size.slug;
                    option.textContent = size.description ? `${size.name} (${size.description})` : size.name;
                    sizeSelect.appendChild(option);
                });
            }

            // Load sectors
            const { data: sectors } = await backend.reference.getCompanySectors();
            const sectorSelect = document.getElementById('companySector');
            if (sectorSelect && sectors) {
                sectorSelect.innerHTML = '<option value="">Selecciona una opción</option>';
                sectors.forEach(sector => {
                    const option = document.createElement('option');
                    option.value = sector.slug;
                    option.textContent = sector.name;
                    sectorSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading company sizes/sectors:', error);
        }
    },

    // Cargar culture values desde BD
    // Pastel color palette for culture value chips (cycles through)
    _cultureChipColors: [
        { bg: '#e0f2fe', text: '#0c4a6e' },   // blue
        { bg: '#fce7f3', text: '#831843' },   // pink
        { bg: '#dcfce7', text: '#14532d' },   // green
        { bg: '#eff6ff', text: '#1e3a5f' },   // light blue
        { bg: '#f3e8ff', text: '#581c87' },   // purple
        { bg: '#ffedd5', text: '#7c2d12' },   // orange
        { bg: '#ccfbf1', text: '#134e4a' },   // teal
        { bg: '#fef9c3', text: '#713f12' },   // yellow
    ],

    // Icon map for culture values (slug → material icon)
    _cultureIconMap: {
        'innovacion': 'lightbulb', 'diversidad': 'diversity_3', 'sustentabilidad': 'eco',
        'trabajo-remoto': 'laptop_chromebook', 'mentoria': 'school', 'agilidad': 'bolt',
        'transparencia': 'handshake', 'bienestar': 'favorite', 'equipo': 'groups',
        'autonomia': 'self_improvement', 'balance': 'balance', 'crecimiento': 'trending_up',
        'resultados': 'target', 'aprendizaje': 'menu_book', 'informal': 'mood',
        'formal': 'business_center', 'agil': 'speed', 'data-driven': 'analytics',
        'impacto': 'public', 'customer': 'support_agent',
    },

    async loadCompanyCultureValues() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: values } = await backend.reference.getCompanyCultureValues();
            const container = document.getElementById('companyCultureContainer');
            if (!container || !values) return;

            container.innerHTML = '';
            const colors = this._cultureChipColors;

            values.forEach((value, i) => {
                const color = colors[i % colors.length];
                const icon = this._cultureIconMap[value.slug] || 'star';
                const btn = document.createElement('button');
                btn.className = 'company-culture-option';
                btn.dataset.value = value.slug;
                btn.dataset.selected = 'false';
                btn.dataset.defaultBg = color.bg;
                btn.dataset.defaultText = color.text;
                btn.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 99px; border: 1px solid transparent; background: ' + color.bg + '; color: ' + color.text + '; font-weight: 500; font-size: 14px; font-family: Inter, sans-serif; cursor: pointer; transition: all 0.2s; outline: none;';
                btn.onclick = () => this.toggleCompanyCulture(btn);

                const iconEl = document.createElement('span');
                iconEl.className = 'material-icons';
                iconEl.style.cssText = 'font-size: 18px; color: ' + color.text + '; transition: color 0.2s;';
                iconEl.textContent = icon;

                const label = document.createElement('span');
                label.textContent = value.name;

                btn.appendChild(iconEl);
                btn.appendChild(label);
                container.appendChild(btn);
            });
        } catch (error) {
            console.error('Error loading culture values:', error);
        }
    },

    // Icon + color map for stage cards (Stitch style)
    _stageCardStyles: {
        'pre-seed': { icon: 'lightbulb', iconBg: '#fef9c3', iconColor: '#a16207' },
        'seed': { icon: 'rocket_launch', iconBg: '#eff6ff', iconColor: '#1392ec' },
        'early': { icon: 'trending_up', iconBg: '#eff6ff', iconColor: '#1392ec' },
        'growth': { icon: 'trending_up', iconBg: '#eff6ff', iconColor: '#1392ec' },
        'scaleup': { icon: 'trending_up', iconBg: '#eff6ff', iconColor: '#1392ec' },
        'startup': { icon: 'rocket_launch', iconBg: '#eff6ff', iconColor: '#1392ec' },
        'sme': { icon: 'storefront', iconBg: '#f3e8ff', iconColor: '#7c3aed' },
        'pyme': { icon: 'storefront', iconBg: '#f3e8ff', iconColor: '#7c3aed' },
        'enterprise': { icon: 'domain', iconBg: '#dcfce7', iconColor: '#16a34a' },
        'mature': { icon: 'domain', iconBg: '#dcfce7', iconColor: '#16a34a' },
    },

    // Currently selected company stage slug
    _selectedCompanyStage: null,

    // Cargar company stages desde BD (Stitch card style)
    async loadCompanyStages() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: stages } = await backend.reference.getCompanyStages();
            const container = document.getElementById('companyStageContainer');
            if (!container || !stages) return;

            container.innerHTML = '';

            stages.forEach(stage => {
                const style = this._stageCardStyles[stage.slug] || { icon: 'business', iconBg: '#f1f5f9', iconColor: '#64748b' };
                const card = document.createElement('button');
                card.className = 'company-stage-option';
                card.dataset.value = stage.slug;
                card.style.cssText = 'position: relative; display: flex; flex-direction: column; align-items: flex-start; padding: 16px; border-radius: 16px; border: 1px solid #f1f5f9; background: #fff; cursor: pointer; transition: all 0.3s; text-align: left; box-shadow: 0 2px 10px rgba(0,0,0,0.03); outline: none; font-family: Inter, sans-serif;';
                card.onclick = () => this.selectCompanyStage(stage.slug, card);

                // Hidden radio for form compatibility
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'companyStage';
                radio.value = stage.slug;
                radio.style.display = 'none';

                // Check icon (hidden by default)
                const check = document.createElement('span');
                check.className = 'material-icons stage-check';
                check.style.cssText = 'position: absolute; top: 12px; right: 12px; font-size: 20px; color: #1392ec; display: none;';
                check.textContent = 'check_circle';

                // Icon container
                const iconWrap = document.createElement('div');
                iconWrap.style.cssText = 'margin-bottom: 12px; padding: 12px; border-radius: 12px; background: ' + style.iconBg + '; color: ' + style.iconColor + '; transition: all 0.3s;';
                const iconEl = document.createElement('span');
                iconEl.className = 'material-icons';
                iconEl.style.fontSize = '24px';
                iconEl.textContent = style.icon;
                iconWrap.appendChild(iconEl);

                // Title
                const title = document.createElement('h3');
                title.style.cssText = 'font-weight: 700; font-size: 17px; margin: 0 0 4px; color: #0f172a;';
                title.textContent = stage.name;

                // Description
                const desc = document.createElement('p');
                desc.style.cssText = 'font-size: 12px; color: #64748b; font-weight: 500; line-height: 1.5; margin: 0;';
                desc.textContent = stage.description || '';

                card.appendChild(radio);
                card.appendChild(check);
                card.appendChild(iconWrap);
                card.appendChild(title);
                card.appendChild(desc);
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading company stages:', error);
        }
    },

    // Select a company stage card (Stitch style)
    selectCompanyStage(slug, element) {
        this._selectedCompanyStage = slug;

        // Deselect all
        document.querySelectorAll('.company-stage-option').forEach(card => {
            card.style.borderColor = '#f1f5f9';
            card.style.background = '#fff';
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
            const check = card.querySelector('.stage-check');
            if (check) check.style.display = 'none';
            const title = card.querySelector('h3');
            if (title) title.style.color = '#0f172a';
        });

        // Select this one
        element.style.borderColor = '#1392ec';
        element.style.borderWidth = '2px';
        element.style.background = 'rgba(219,234,254,0.3)';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
        const radio = element.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        const check = element.querySelector('.stage-check');
        if (check) check.style.display = 'block';
        const title = element.querySelector('h3');
        if (title) title.style.color = '#1392ec';
    },

    // Size slider labels and slug mapping
    _companySizeLabels: ['1 - 10', '11 - 50', '51 - 200', '201 - 500', '500+'],
    _companySizeSlugs: null, // Populated from DB

    // Load company sizes from DB into slider mapping
    async loadCompanySizesForSlider() {
        const backend = window.talentlyBackend;
        if (!backend) return;
        try {
            const { data: sizes } = await backend.reference.getCompanySizes();
            if (sizes && sizes.length > 0) {
                this._companySizeSlugs = sizes.map(s => s.slug);
                // Update labels from DB if available
                this._companySizeLabels = sizes.map(s => s.name || s.slug);
            }
        } catch (e) {
            console.error('Error loading sizes for slider:', e);
        }
    },

    // Update the size slider visual (Stitch range slider)
    updateCompanySizeSlider(value) {
        const val = parseInt(value);
        const pct = ((val - 1) / 4) * 100;

        // Update label
        const label = document.getElementById('companySizeLabel');
        if (label) label.textContent = this._companySizeLabels[val - 1] || '';

        // Update track fill
        const fill = document.getElementById('companySizeTrackFill');
        if (fill) fill.style.width = pct + '%';

        // Update thumb position
        const thumb = document.getElementById('companySizeThumb');
        if (thumb) thumb.style.left = 'calc(' + pct + '% - 14px)';

        // Update tick styles
        for (let i = 1; i <= 5; i++) {
            const tick = document.getElementById('companySizeTick' + i);
            if (!tick) continue;
            const dot = tick.querySelector('div');
            const text = tick.querySelector('span');
            if (i === val) {
                if (dot) { dot.style.width = '6px'; dot.style.height = '6px'; dot.style.background = '#1392ec'; dot.style.boxShadow = '0 0 8px rgba(19,146,236,0.6)'; }
                if (text) { text.style.fontSize = '11px'; text.style.fontWeight = '700'; text.style.color = '#1392ec'; }
            } else {
                if (dot) { dot.style.width = '4px'; dot.style.height = '4px'; dot.style.background = '#cbd5e1'; dot.style.boxShadow = 'none'; }
                if (text) { text.style.fontSize = '10px'; text.style.fontWeight = '500'; text.style.color = '#94a3b8'; }
            }
        }

        // Store the selected slug
        if (this._companySizeSlugs && this._companySizeSlugs[val - 1]) {
            this._selectedCompanySize = this._companySizeSlugs[val - 1];
        } else {
            // Fallback: generate slug from label
            this._selectedCompanySize = this._companySizeLabels[val - 1];
        }
    },

    // Icon map for work model cards (slug → { icon, iconColor, iconBg })
    _workModelIcons: {
        '100-remoto': { icon: 'public', color: '#1392ec', bg: '#eff6ff' },
        'remote-first': { icon: 'public', color: '#1392ec', bg: '#eff6ff' },
        'hibrido-flexible': { icon: 'home_work', color: '#7c3aed', bg: '#f3e8ff' },
        'hibrido-fijo': { icon: 'home_work', color: '#7c3aed', bg: '#f3e8ff' },
        'presencial': { icon: 'apartment', color: '#16a34a', bg: '#dcfce7' },
    },

    // Cargar work models desde BD (Stitch card style)
    async loadWorkModels() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: models } = await backend.reference.getWorkModalities();
            const container = document.getElementById('workModelContainer');
            if (!container || !models) return;

            container.innerHTML = '';

            models.forEach(model => {
                const style = this._workModelIcons[model.slug] || { icon: 'work', color: '#64748b', bg: '#f1f5f9' };

                const label = document.createElement('label');
                label.className = 'work-model-option';
                label.style.cssText = 'position: relative; cursor: pointer; display: block;';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'workModel';
                radio.value = model.slug;
                radio.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);';
                radio.onchange = () => this._updateWorkModelCards();

                const card = document.createElement('div');
                card.className = 'work-model-card';
                card.style.cssText = 'display: flex; align-items: center; padding: 16px; border-radius: 12px; border: 1px solid transparent; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.03); transition: all 0.2s;';

                // Icon
                const iconWrap = document.createElement('div');
                iconWrap.style.cssText = 'display: flex; width: 48px; height: 48px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 8px; background: ' + style.bg + '; color: ' + style.color + ';';
                const iconEl = document.createElement('span');
                iconEl.className = 'material-icons';
                iconEl.textContent = style.icon;
                iconWrap.appendChild(iconEl);

                // Text
                const textWrap = document.createElement('div');
                textWrap.style.cssText = 'margin-left: 16px; flex: 1;';
                const name = document.createElement('span');
                name.style.cssText = 'display: block; font-size: 15px; font-weight: 700; color: #111827;';
                name.textContent = model.name;
                const desc = document.createElement('span');
                desc.style.cssText = 'display: block; font-size: 13px; color: #6b7280;';
                desc.textContent = model.description || '';
                textWrap.appendChild(name);
                textWrap.appendChild(desc);

                // Radio circle
                const circle = document.createElement('div');
                circle.className = 'wm-radio-circle';
                circle.style.cssText = 'width: 24px; height: 24px; border-radius: 50%; border: 2px solid #e5e7eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;';
                const dot = document.createElement('div');
                dot.className = 'wm-radio-dot';
                dot.style.cssText = 'width: 10px; height: 10px; border-radius: 50%; background: #fff; opacity: 0; transition: opacity 0.2s;';
                circle.appendChild(dot);

                card.appendChild(iconWrap);
                card.appendChild(textWrap);
                card.appendChild(circle);
                label.appendChild(radio);
                label.appendChild(card);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading work models:', error);
        }
    },

    // Update visual state of work model cards
    _updateWorkModelCards() {
        document.querySelectorAll('.work-model-option').forEach(label => {
            const radio = label.querySelector('input[type="radio"]');
            const card = label.querySelector('.work-model-card');
            const circle = label.querySelector('.wm-radio-circle');
            const dot = label.querySelector('.wm-radio-dot');
            if (!radio || !card) return;

            if (radio.checked) {
                card.style.borderColor = '#1392ec';
                card.style.boxShadow = '0 0 0 1px #1392ec, 0 4px 20px rgba(0,0,0,0.05)';
                if (circle) { circle.style.borderColor = '#1392ec'; circle.style.background = '#1392ec'; }
                if (dot) dot.style.opacity = '1';
            } else {
                card.style.borderColor = 'transparent';
                card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                if (circle) { circle.style.borderColor = '#e5e7eb'; circle.style.background = 'transparent'; }
                if (dot) dot.style.opacity = '0';
            }
        });
    },

    // Icon map for benefit chips
    _benefitIcons: {
        'seguro-medico': 'medical_services', 'seguro-dental': 'volunteer_activism',
        'stock-options': 'trending_up', 'bonos-desempeno': 'savings',
        'flexibilidad': 'schedule', 'presupuesto-cursos': 'school',
        'almuerzo': 'restaurant', 'pet-friendly': 'pets',
        'gimnasio': 'fitness_center', 'seguro-vida': 'health_and_safety',
        'salud-mental': 'psychology', 'vacaciones-extra': 'beach_access',
        'dia-cumpleanos': 'cake', 'viernes-cortos': 'wb_sunny',
        'semana-4-dias': 'date_range', 'unlimited-pto': 'all_inclusive',
        'licencias-parentales': 'child_friendly', 'conferencias': 'groups',
        'certificaciones': 'workspace_premium', 'mentoring': 'handshake',
        'bono-bienvenida': 'card_giftcard', 'bono-anual': 'payments',
        'incrementos': 'arrow_upward', 'dias-salud': 'spa',
        'equipamiento': 'devices', 'coworking': 'meeting_room',
        'estacionamiento': 'local_parking',
    },

    // Load benefits from DB as Stitch-style chips for step 7
    async loadCompanyBenefitsChips() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: benefits } = await backend.reference.getCompanyBenefits();
            const container = document.getElementById('companyBenefitsContainer');
            if (!container || !benefits) return;

            container.innerHTML = '';

            benefits.forEach(benefit => {
                const icon = this._benefitIcons[benefit.slug] || 'star';

                const label = document.createElement('label');
                label.className = 'benefit-option';
                label.style.cssText = 'cursor: pointer; display: inline-block;';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = benefit.slug;
                checkbox.style.cssText = 'position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);';
                checkbox.onchange = () => this._updateBenefitChipStyle(chip, checkbox.checked);

                const chip = document.createElement('div');
                chip.style.cssText = 'padding: 10px 16px; border-radius: 99px; border: 1px solid #e5e7eb; background: #fff; color: #4b5563; font-size: 13px; font-weight: 500; font-family: Inter, sans-serif; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';

                const iconEl = document.createElement('span');
                iconEl.className = 'material-icons';
                iconEl.style.cssText = 'font-size: 18px; color: #9ca3af; transition: color 0.2s;';
                iconEl.textContent = icon;

                const text = document.createElement('span');
                text.textContent = benefit.name;

                chip.appendChild(iconEl);
                chip.appendChild(text);
                label.appendChild(checkbox);
                label.appendChild(chip);
                container.appendChild(label);
            });
        } catch (error) {
            console.error('Error loading benefits chips:', error);
        }
    },

    // Update benefit chip visual on toggle
    _updateBenefitChipStyle(chip, isChecked) {
        const icon = chip.querySelector('.material-icons');
        if (isChecked) {
            chip.style.background = '#1392ec';
            chip.style.borderColor = '#1392ec';
            chip.style.color = '#fff';
            chip.style.boxShadow = '0 4px 6px rgba(19,146,236,0.3)';
            if (icon) icon.style.color = '#fff';
        } else {
            chip.style.background = '#fff';
            chip.style.borderColor = '#e5e7eb';
            chip.style.color = '#4b5563';
            chip.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
            if (icon) icon.style.color = '#9ca3af';
        }
    },

    // Cargar positions desde BD
    // Position icon map for Stitch chip style
    _positionIconMap: {
        'ingenieria': 'terminal', 'engineering': 'terminal',
        'diseno': 'palette', 'design': 'palette',
        'producto': 'inventory_2', 'product': 'inventory_2',
        'marketing': 'campaign',
        'ventas': 'trending_up', 'sales': 'trending_up',
        'data': 'analytics', 'datos': 'analytics',
        'operaciones': 'settings', 'operations': 'settings',
        'finanzas': 'account_balance', 'finance': 'account_balance',
        'rrhh': 'people', 'hr': 'people', 'recursos-humanos': 'people',
        'legal': 'gavel',
        'soporte': 'support_agent', 'support': 'support_agent',
        'devops': 'cloud', 'infraestructura': 'cloud',
        'qa': 'bug_report', 'calidad': 'bug_report',
        'seguridad': 'shield', 'security': 'shield',
        'contenido': 'edit_note', 'content': 'edit_note',
    },

    async loadCompanyPositions() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: positions } = await backend.reference.getCompanyPositions();
            const container = document.getElementById('companyPositionsContainer');
            if (!container || !positions) return;

            container.innerHTML = '';
            positions.forEach(pos => {
                const icon = this._positionIconMap[pos.slug] || 'work';
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'position-option';
                chip.dataset.value = pos.slug;
                chip.dataset.selected = 'false';
                chip.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 99px; border: 2px solid #e2e8f0; background: #fff; color: #475569; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit;';
                chip.onclick = () => this.togglePositionChip(chip);
                chip.innerHTML = `<span class="material-icons" style="font-size: 18px;">${icon}</span>${pos.name}`;
                container.appendChild(chip);
            });
        } catch (error) {
            console.error('Error loading positions:', error);
        }
    },

    togglePositionChip(chip) {
        const isSelected = chip.dataset.selected === 'true';
        chip.dataset.selected = isSelected ? 'false' : 'true';

        if (!isSelected) {
            chip.style.background = '#1392ec';
            chip.style.color = '#fff';
            chip.style.borderColor = '#1392ec';
            chip.style.boxShadow = '0 4px 12px rgba(19,146,236,0.3)';
        } else {
            chip.style.background = '#fff';
            chip.style.color = '#475569';
            chip.style.borderColor = '#e2e8f0';
            chip.style.boxShadow = 'none';
        }
    },

    // Seniority card styles
    _seniorityCardStyles: {
        'junior': { icon: 'school', iconBg: '#dcfce7', iconColor: '#16a34a' },
        'semi-senior': { icon: 'trending_up', iconBg: '#eff6ff', iconColor: '#1392ec' },
        'senior': { icon: 'star', iconBg: '#fef3c7', iconColor: '#d97706' },
        'lead': { icon: 'military_tech', iconBg: '#f3e8ff', iconColor: '#7c3aed' },
        'manager': { icon: 'supervisor_account', iconBg: '#fce7f3', iconColor: '#db2777' },
        'director': { icon: 'diamond', iconBg: '#fef2f2', iconColor: '#dc2626' },
    },

    async loadSeniorityLevels() {
        const backend = window.talentlyBackend;
        if (!backend) return;

        try {
            const { data: levels } = await backend.reference.getSeniorityLevels();
            const container = document.getElementById('companySeniorityContainer');
            if (!container || !levels) return;

            container.innerHTML = '';
            levels.forEach(level => {
                const style = this._seniorityCardStyles[level.slug] || { icon: 'person', iconBg: '#f1f5f9', iconColor: '#64748b' };
                const card = document.createElement('div');
                card.className = 'seniority-option';
                card.dataset.value = level.slug;
                card.dataset.selected = 'false';
                card.style.cssText = 'position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 16px; border-radius: 16px; border: 2px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.2s ease; text-align: center;';
                card.onclick = () => this.toggleSeniorityCard(card);

                // Checkbox circle (top-right)
                const checkCircle = document.createElement('div');
                checkCircle.className = 'seniority-check';
                checkCircle.style.cssText = 'position: absolute; top: 12px; right: 12px; width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; transition: all 0.2s;';

                // Icon
                const iconWrap = document.createElement('div');
                iconWrap.style.cssText = `width: 48px; height: 48px; border-radius: 12px; background: ${style.iconBg}; display: flex; align-items: center; justify-content: center;`;
                iconWrap.innerHTML = `<span class="material-icons" style="font-size: 24px; color: ${style.iconColor};">${style.icon}</span>`;

                // Name
                const name = document.createElement('span');
                name.style.cssText = 'font-size: 14px; font-weight: 700; color: #0f172a;';
                name.textContent = level.name;

                // Hidden checkbox for compatibility
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = level.slug;
                checkbox.style.display = 'none';

                card.appendChild(checkCircle);
                card.appendChild(iconWrap);
                card.appendChild(name);
                card.appendChild(checkbox);
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading seniority levels:', error);
        }
    },

    toggleSeniorityCard(card) {
        const isSelected = card.dataset.selected === 'true';
        const checkbox = card.querySelector('input[type="checkbox"]');
        const check = card.querySelector('.seniority-check');

        card.dataset.selected = isSelected ? 'false' : 'true';
        if (checkbox) checkbox.checked = !isSelected;

        if (!isSelected) {
            card.style.borderColor = '#1392ec';
            card.style.background = '#eff6ff';
            card.style.boxShadow = '0 4px 12px rgba(19,146,236,0.15)';
            if (check) {
                check.style.borderColor = '#1392ec';
                check.style.background = '#1392ec';
                check.innerHTML = '<span class="material-icons" style="font-size: 14px; color: #fff;">check</span>';
            }
        } else {
            card.style.borderColor = '#e2e8f0';
            card.style.background = '#fff';
            card.style.boxShadow = 'none';
            if (check) {
                check.style.borderColor = '#cbd5e1';
                check.style.background = 'transparent';
                check.innerHTML = '';
            }
        }
    },

    validateCompanyStep(step) {
        const validateInput = (id, message) => {
            const el = document.getElementById(id);
            if (!el) return true; // Skip if not found
            if (!el.value || el.value === 'NaN') {
                el.style.borderColor = 'var(--danger)';
                // Create inline error if not exists
                this.showToast(message); // Using Toast for feedback
                return false;
            }
            el.style.borderColor = 'var(--border)';
            return true;
        };

        let isValid = true;

        if (step === 2) {
            // Basic Info: name + sector + website + country + city
            isValid = validateInput('companyName', 'El nombre de la empresa es obligatorio') && isValid;
            isValid = validateInput('companySector', 'El sector es obligatorio') && isValid;
            isValid = validateInput('companyCountry', 'El país es obligatorio') && isValid;
            isValid = validateInput('companyCity', 'La ciudad es obligatoria') && isValid;

            // Validar sitio web (opcional, pero si existe debe ser válido)
            const website = document.getElementById('companyWebsite');
            if (website && website.value && website.value.trim() !== '') {
                const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                if (!urlPattern.test(website.value)) {
                    website.style.borderColor = 'var(--danger)';
                    this.showToast('La URL del sitio web no es válida');
                    return false;
                }
                website.style.borderColor = 'var(--border)';
            }
        }

        if (step === 5) {
            // Culture - min 3, max 5 (chip-based)
            const cultureCount = document.querySelectorAll('.company-culture-option[data-selected="true"]').length;
            if (cultureCount < 3) {
                this.showToast('Selecciona al menos 3 valores de cultura');
                return false;
            }
        }

        if (step === 6) {
            const stage = document.querySelector('input[name="companyStage"]:checked');
            if (!stage) {
                this.showToast('Selecciona la etapa de la empresa');
                return false;
            }
        }

        if (step === 7) {
            const workModel = document.querySelector('input[name="workModel"]:checked');
            if (!workModel) {
                this.showToast('Selecciona el modelo de trabajo');
                return false;
            }
        }

        if (step === 8) {
            // Positions - at least 1 (chip-based)
            const posCount = document.querySelectorAll('.position-option[data-selected="true"]').length;
            if (posCount === 0) {
                this.showToast('Selecciona al menos un departamento');
                return false;
            }
            // Seniority - at least 1 (card-based, consolidated from step 9)
            const seniorityCount = document.querySelectorAll('.seniority-option[data-selected="true"]').length;
            if (seniorityCount === 0) {
                this.showToast('Selecciona al menos un nivel de seniority');
                return false;
            }
        }

        if (step === 15) {
            // Logo - mandatory
            if (!this.companyLogo) {
                this.showToast('Debes subir el logo de tu empresa');
                return false;
            }
        }

        return isValid;
    },

    // toggleSeniority removed — replaced by toggleSeniorityCard (Stitch style)

    nextCompanyStep(step) {
        if (this.validateCompanyStep(step - 1)) {

            // Trigger specific renders for steps
            if (step === 2) {
                // Load sectors and countries for the consolidated Basic Info step
                this.loadCompanySizesAndSectors();
                this.renderCountries('companyCountry');
            }

            if (step === 5) {
                // Load culture values from database
                this.loadCompanyCultureValues();
            }

            if (step === 6) {
                // Load company stages + sizes from database (size slider)
                this.loadCompanyStages();
                this.loadCompanySizesForSlider();
            }

            if (step === 7) {
                // Load work models + benefits from database (consolidated step)
                this.loadWorkModels();
                this.loadCompanyBenefitsChips();
            }

            if (step === 8) {
                // Load positions + seniority from database (consolidated step)
                this.loadCompanyPositions();
                this.loadSeniorityLevels();
            }

            if (step === 10) {
                this.renderCompanyTechStack();
                setTimeout(() => this.renderCompanyTechStack(), 100);
            }
            if (step === 14) { // Renumbered Step 15 (Tags) -> 14
                try {
                    this.renderCompanyTags();
                } catch (e) { console.error('Error rendering tags:', e); }
                setTimeout(() => this.renderCompanyTags(), 300);
            }
            this.showView(`companyStep${step}`);
        }
    },

    updateCompanyCities() {
        this.updateCities('companyCountry', 'companyCity');
    },

    toggleMultipleLocations() {
        const isRemote = document.getElementById('companyFullyRemote').value;
        const multipleGroup = document.getElementById('multipleLocationsGroup');
        if (multipleGroup) {
            multipleGroup.style.display = isRemote === 'no' ? 'block' : 'none';
        }
    },

    toggleCompanyCulture(element) {
        const isSelected = element.dataset.selected === 'true';
        const allSelected = document.querySelectorAll('.company-culture-option[data-selected="true"]');

        // If trying to select and already at max 5
        if (!isSelected && allSelected.length >= 5) {
            this.showToast('Máximo 5 valores de cultura');
            return;
        }

        // Toggle state
        element.dataset.selected = isSelected ? 'false' : 'true';
        const iconEl = element.querySelector('.material-icons');

        if (!isSelected) {
            // Select → Stitch selected style (blue border + light blue bg)
            element.style.borderColor = '#1392ec';
            element.style.background = '#e0f2fe';
            element.style.color = '#0c4a6e';
            element.style.fontWeight = '600';
            if (iconEl) iconEl.style.color = '#1392ec';
        } else {
            // Deselect → restore pastel default
            element.style.borderColor = 'transparent';
            element.style.background = element.dataset.defaultBg;
            element.style.color = element.dataset.defaultText;
            element.style.fontWeight = '500';
            if (iconEl) iconEl.style.color = element.dataset.defaultText;
        }
    },

    // togglePosition/toggleSeniority removed — replaced by togglePositionChip/toggleSeniorityCard (Stitch style)

    addTechStack(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const tech = input.value.trim();

            if (!tech) return;

            if (this.companyTechStack.length >= 20) {
                this.showToast('Máximo 20 tecnologías');
                return;
            }

            if (!this.companyTechStack.includes(tech)) {
                this.companyTechStack.push(tech);
                this.renderTechStack();
                input.value = '';
            }
        }
    },

    renderTechStack() {
        const container = document.getElementById('techStackContainer');
        const input = document.getElementById('techStackInput');

        // Clear existing tags
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());

        // Render tags
        this.companyTechStack.forEach((tech, index) => {
            const tag = document.createElement('div');
            tag.className = 'tag-item';
            tag.style.cssText = 'padding: 8px 14px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
            tag.innerHTML = `
                ${tech}
                <button onclick="app.removeTechStack(${index})" style="background: rgba(255,255,255,0.3); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;">×</button>
            `;
            container.insertBefore(tag, input);
        });

        // Update counter
        document.getElementById('techStackCount').textContent = this.companyTechStack.length;

        // Render suggestions once
        if (!this.techSuggestionsRendered) {
            this.renderTechSuggestions();
            this.techSuggestionsRendered = true;
        }
    },

    removeTechStack(index) {
        this.companyTechStack.splice(index, 1);
        this.renderTechStack();
    },

    renderTechSuggestions() {
        const container = document.getElementById('techSuggestions');
        if (!container) return;

        const suggestions = [
            'React', 'Python', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
            'TypeScript', 'Vue', 'Angular', 'Java', 'Go', 'Ruby',
            'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
            'Git', 'Figma', 'Jira', 'Slack', 'Notion', 'Linear',
            'CI/CD', 'Terraform', 'Microservices', 'Agile', 'Scrum', 'TDD'
        ];

        suggestions.forEach(tech => {
            const btn = document.createElement('button');
            btn.textContent = tech;
            btn.style.cssText = 'padding: 8px 14px; background: var(--bg); color: var(--primary); border: 1px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;';
            btn.onmouseover = () => {
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
            };
            btn.onmouseout = () => {
                btn.style.background = 'var(--bg)';
                btn.style.color = 'var(--primary)';
            };
            btn.onclick = () => {
                if (this.companyTechStack.length < 20 && !this.companyTechStack.includes(tech)) {
                    this.companyTechStack.push(tech);
                    this.renderTechStack();
                }
            };
            container.appendChild(btn);
        });
    },

    toggleBenefit(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;

        // Update styling
        if (checkbox.checked) {
            element.style.borderColor = 'var(--primary)';
            element.style.background = 'rgba(108,92,231,0.1)';
        } else {
            element.style.borderColor = 'var(--border)';
            element.style.background = 'var(--surface)';
        }

        // Update counter
        const count = document.querySelectorAll('.benefit-option input:checked').length;
        document.getElementById('benefitsCount').textContent = count;
    },

    updateCharCount(inputId, counterId, maxLength) {
        const input = document.getElementById(inputId);
        const counter = document.getElementById(counterId);

        if (!input || !counter) return;

        const length = input.value.length;
        counter.textContent = `${length} / ${maxLength}`;

        // Update counter color based on length
        if (length < 100) {
            counter.style.color = 'var(--danger)';
        } else {
            counter.style.color = 'var(--success)';
        }
    },

    addCompanyTag(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const tag = input.value.trim();

            if (!tag) return;

            if (this.companyTags.length >= 20) {
                this.showToast('Máximo 20 tags');
                return;
            }

            if (!this.companyTags.includes(tag)) {
                this.companyTags.push(tag);
                this.renderCompanyTags();
                input.value = '';
            }
        }
    },

    renderCompanyTags() {
        const container = document.getElementById('companyTagsContainer');
        const input = document.getElementById('companyTagInput');

        if (!container || !input) return;

        // Clear existing tags
        const existingTags = container.querySelectorAll('.tag-item');
        existingTags.forEach(tag => tag.remove());

        // Render tags
        this.companyTags.forEach((tag, index) => {
            const tagEl = document.createElement('div');
            tagEl.className = 'tag-item';
            tagEl.style.cssText = 'padding: 8px 14px; background: var(--primary); color: white; border-radius: 20px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
            tagEl.innerHTML = `
                ${tag}
                <button onclick="app.removeCompanyTag(${index})" style="background: rgba(255,255,255,0.3); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;">×</button>
            `;
            container.insertBefore(tagEl, input);
        });

        // Update counter
        document.getElementById('companyTagsCount').textContent = this.companyTags.length;

        // Always render suggestions to update visibility
        this.renderCompanyTagSuggestions();
    },

    removeCompanyTag(index) {
        this.companyTags.splice(index, 1);
        this.renderCompanyTags();
    },

    // ============================================
    // EDIT SKILLS LOGIC (DYNAMIC)
    // ============================================



    closeEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (modal) modal.style.display = 'none';
    },

    renderSelectedSkillsChips() {
        const container = document.getElementById('editSkillsSelected');
        const countEl = document.getElementById('editSkillsCount');
        if (!container) return;

        // Update counter
        if (countEl) countEl.textContent = `${this.skillsSelected.length} Seleccionadas`;

        if (this.skillsSelected.length === 0) {
            container.innerHTML = '<span style="color: #64748b; font-size: 13px;">No tienes habilidades seleccionadas aún.</span>';
            return;
        }

        container.innerHTML = this.skillsSelected.map((skill, index) => `
            <button onclick="app.removeSkill(${index})" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #1392ec; color: #ffffff; border: none; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(19,146,236,0.2); transition: all 0.15s;" onmouseenter="this.style.background='#0f7fd0'" onmouseleave="this.style.background='#1392ec'">
                <span>${skill}</span>
                <span class="material-icons" style="font-size: 18px; opacity: 0.7;">close</span>
            </button>
        `).join('');
    },

    removeSkill(index) {
        this.skillsSelected.splice(index, 1);
        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles();
    },

    renderEditSkillsBubbles(filter) {
        const container = document.getElementById('editSkillsBubbles');
        if (!container) return;

        // Category label map
        const categoryLabels = {
            'desarrollo': 'Desarrollo',
            'diseno-ux': 'Diseño UX',
            'producto': 'Producto',
            'marketing': 'Marketing',
            'data': 'Data & Analytics',
            'ventas': 'Ventas',
            'rrhh': 'Recursos Humanos',
            'finanzas': 'Finanzas',
            'other': 'Habilidades Blandas'
        };

        const query = (filter || '').toLowerCase().trim();
        let html = '<h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; position: sticky; top: 0; background: #ffffff; padding: 8px 0; z-index: 10; color: #2D3436;">Sugerencias para ti</h2>';
        html += '<div style="display: flex; flex-direction: column; gap: 24px;">';

        const allAreas = this.skillsByArea || {};
        let hasResults = false;

        Object.entries(allAreas).forEach(([areaKey, skills]) => {
            // Filter skills by search query
            const filtered = query ? skills.filter(s => s.toLowerCase().includes(query)) : skills;
            if (filtered.length === 0) return;
            hasResults = true;

            const label = categoryLabels[areaKey] || areaKey.charAt(0).toUpperCase() + areaKey.slice(1);
            html += `<div>
                <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9CA3AF; margin: 0 0 12px 4px;">${label}</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">`;

            filtered.forEach(skill => {
                const isSelected = this.skillsSelected.includes(skill);
                const escapedSkill = skill.replace(/'/g, "\\'");
                if (isSelected) {
                    html += `<button onclick="app.toggleSkillSelection('${escapedSkill}')" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #1392ec; color: #ffffff; border: none; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 4px 12px rgba(19,146,236,0.2); transition: all 0.15s;">
                        <span>${skill}</span>
                        <span class="material-icons" style="font-size: 18px; opacity: 0.7;">check</span>
                    </button>`;
                } else {
                    html += `<button onclick="app.toggleSkillSelection('${escapedSkill}')" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: #E9ECEF; color: #495057; border: none; border-radius: 9999px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s;">
                        <span>${skill}</span>
                        <span class="material-icons" style="font-size: 18px; color: #6c757d;">add</span>
                    </button>`;
                }
            });

            html += '</div></div>';
        });

        html += '</div>';

        if (!hasResults && query) {
            html += `<div style="text-align: center; padding: 32px 16px; color: #64748b;">
                <span class="material-icons" style="font-size: 48px; display: block; margin-bottom: 12px;">search_off</span>
                <p style="font-size: 14px;">No se encontraron habilidades para "${query}"</p>
            </div>`;
        }

        container.innerHTML = html;
    },

    filterEditSkills(query) {
        this.renderEditSkillsBubbles(query);
    },

    toggleSkillSelection(skill) {
        if (this.skillsSelected.includes(skill)) {
            this.skillsSelected = this.skillsSelected.filter(s => s !== skill);
        } else {
            if (this.skillsSelected.length >= 15) {
                this.showToast('Máximo 15 habilidades');
                return;
            }
            this.skillsSelected.push(skill);
        }
        this.renderSelectedSkillsChips();
        // Re-render bubbles preserving current search filter
        const searchInput = document.getElementById('editSkillsSearch');
        this.renderEditSkillsBubbles(searchInput ? searchInput.value : '');
    },

    async saveEditSkills() {
        this.currentUser.skills = [...this.skillsSelected];
        this.saveProfile();
        this.renderProfile();
        this.closeEditSkills();
        this.showToast('Habilidades actualizadas');
    },

    renderCompanyTagSuggestions() {
        if (!this.companyTags) this.companyTags = [];
        const categories = {
            companyTypeTags: ['Startup', 'Scale-up', 'Unicornio', 'B-Corp', 'Enterprise', 'Bootstrapped', 'VC-backed'],
            cultureTags: ['Remote-first', 'Fast-paced', 'Feedback culture', 'Ownership', 'Work-life balance', 'Flat hierarchy'],
            focusTags: ['Product-led', 'Data-driven', 'AI-powered', 'Customer-centric', 'Mobile-first'],
            growthTags: ['Career growth', 'Mentorship', 'Training budget', 'Internal mobility'],
            valuesTags: ['Diversity', 'Sustainability', 'Innovation', 'Transparency', 'Social Impact'],
            techTags: ['Agile', 'Scrum', 'CI/CD', 'Cloud-native', 'Microservices']
        };

        Object.keys(categories).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('CRITICAL: Container not found:', containerId);
                return;
            }
            // Clear container before re-rendering
            container.innerHTML = '';

            categories[containerId].forEach(tag => {
                // Skip if already selected
                if (this.companyTags.includes(tag)) return;

                const btn = document.createElement('button');
                btn.textContent = tag;
                btn.type = 'button'; // Prevent form submission
                btn.className = 'tag-bubble';
                // Explicit high-contrast colors to fix "empty" appearance
                btn.style.cssText = 'padding: 8px 16px; background-color: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; user-select: none; margin-bottom: 0;';

                btn.onmouseover = () => {
                    btn.style.backgroundColor = '#e5e7eb';
                    btn.style.color = '#111827';
                };
                btn.onmouseout = () => {
                    btn.style.backgroundColor = '#f3f4f6';
                    btn.style.color = '#1f2937';
                };
                btn.onclick = (e) => {
                    e.preventDefault();
                    if (this.companyTags.length < 20 && !this.companyTags.includes(tag)) {
                        this.companyTags.push(tag);
                        this.renderCompanyTags();
                    }
                };
                container.appendChild(btn);
            });
        });
    },

    handleCompanyLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('El logo debe ser menor a 5MB');
                return;
            }

            const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                this.showToast('El logo debe ser PNG, JPG o WEBP');
                return;
            }

            this.companyLogo = file;

            // Show preview in circular avatar
            const avatarDiv = document.getElementById('logoAvatarPreview');
            if (avatarDiv) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarDiv.innerHTML = `<img src="${e.target.result}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                    avatarDiv.style.border = '2px solid #1392ec';
                    avatarDiv.style.background = 'transparent';
                };
                reader.readAsDataURL(file);
            }

            // Show text confirmation
            const previewDiv = document.getElementById('logoPreview');
            if (previewDiv) {
                previewDiv.textContent = 'Logo cargado correctamente';
                previewDiv.style.display = 'block';
            }
        }
    },

    handleCompanyPhotosUpload(event) {
        const files = event.target.files;
        const totalAllowed = 5 - this.companyPhotos.length;
        if (totalAllowed <= 0) {
            this.showToast('Máximo 5 fotos');
            return;
        }

        let validFiles = [];
        for (let i = 0; i < Math.min(files.length, totalAllowed); i++) {
            const file = files[i];
            if (file.size > 5 * 1024 * 1024) {
                this.showToast(`${file.name} es muy grande (máx 5MB)`);
                continue;
            }
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                this.showToast(`${file.name} debe ser PNG o JPG`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            this.companyPhotos = [...this.companyPhotos, ...validFiles];
            this.renderCompanyPhotosGallery();
        }
    },

    removeCompanyPhoto(index) {
        this.companyPhotos.splice(index, 1);
        this.renderCompanyPhotosGallery();
    },

    renderCompanyPhotosGallery() {
        const gallery = document.getElementById('companyPhotosGallery');
        if (!gallery) return;

        gallery.innerHTML = '';

        // Render existing photo previews
        this.companyPhotos.forEach((file, index) => {
            const slot = document.createElement('div');
            slot.style.cssText = 'position: relative; aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.06);';

            const reader = new FileReader();
            reader.onload = (e) => {
                slot.innerHTML = `
                    <img src="${e.target.result}" alt="Foto ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                    <button type="button" onclick="app.removeCompanyPhoto(${index})" style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #475569; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: color 0.2s;"
                        onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#475569'">
                        <span class="material-icons" style="font-size: 16px;">close</span>
                    </button>`;
            };
            reader.readAsDataURL(file);
            gallery.appendChild(slot);
        });

        // Add placeholder slots (up to 4 visible total = photos + placeholders, min 2 placeholders if < 4 photos)
        const remainingSlots = Math.max(2, 4 - this.companyPhotos.length);
        if (this.companyPhotos.length < 5) {
            for (let i = 0; i < Math.min(remainingSlots, 5 - this.companyPhotos.length); i++) {
                const addBtn = document.createElement('button');
                addBtn.type = 'button';
                addBtn.onclick = () => document.getElementById('companyPhotosInput').click();
                addBtn.style.cssText = 'aspect-ratio: 4/3; border-radius: 16px; background: #f8fafc; border: 2px dashed #e2e8f0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; font-family: inherit;';
                addBtn.onmouseover = function () { this.style.borderColor = '#1392ec'; this.style.background = 'rgba(19,146,236,0.03)'; };
                addBtn.onmouseout = function () { this.style.borderColor = '#e2e8f0'; this.style.background = '#f8fafc'; };
                addBtn.innerHTML = `
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; border: 1px solid #f1f5f9;">
                        <span class="material-icons" style="font-size: 22px; color: #94a3b8;">add</span>
                    </div>
                    <span style="font-size: 12px; font-weight: 700; color: #64748b;">Agregar foto</span>`;
                gallery.appendChild(addBtn);
            }
        }
    },

    handleCompanyBannerUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('El banner debe ser menor a 5MB');
                return;
            }

            // Check file type
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                this.showToast('El banner debe ser PNG o JPG');
                return;
            }

            this.companyBanner = file;
            document.getElementById('bannerPreview').style.display = 'block';
        }
    },

    async completeCompanyOnboarding() {

        // Validate logo is required before proceeding
        if (!this.companyLogo) {
            this.showToast('Debes subir el logo de tu empresa');
            return;
        }

        try {
            this.showToast('Guardando perfil de empresa...', 'info');

            // Collect Data
            const companyName = document.getElementById('companyName')?.value;
            const companyWebsite = document.getElementById('companyWebsite')?.value;
            const companySize = this._selectedCompanySize || document.getElementById('companySize')?.value;
            const companySector = document.getElementById('companySector')?.value;
            const companyCountry = document.getElementById('companyCountry')?.value;
            const companyCity = document.getElementById('companyCity')?.value;
            const companyTaxId = document.getElementById('companyTaxId')?.value;
            const companyValueProp = document.getElementById('companyValueProp')?.value;

            // Mission
            const companyMission = document.getElementById('companyMission')?.value;

            // Culture (chip-based, data-selected attribute)
            const culture = Array.from(document.querySelectorAll('.company-culture-option[data-selected="true"]')).map(el => el.dataset.value);

            const stage = document.querySelector('input[name="companyStage"]:checked')?.value;
            const workModel = document.querySelector('input[name="workModel"]:checked')?.value;

            // Positions (chip-based, data-selected + data-value)
            const positions = Array.from(document.querySelectorAll('.position-option[data-selected="true"]')).map(el => el.dataset.value);

            // Seniority (card-based, data-selected + data-value)
            const seniority = Array.from(document.querySelectorAll('.seniority-option[data-selected="true"]')).map(el => el.dataset.value);

            // Benefits
            const benefitsSelected = Array.from(document.querySelectorAll('.benefit-option input:checked')).map(el => el.value);

            // Selection Process
            const selectionStages = document.querySelector('input[name="selectionStages"]:checked')?.value;
            const selectionTime = document.querySelector('input[name="selectionTime"]:checked')?.value;
            const technicalTest = document.querySelector('input[name="technicalTest"]:checked')?.value;
            const paidTest = document.querySelector('input[name="paidTest"]:checked')?.value;

            // Tech Stack is in this.companyTechStack

            // Handle Logo Upload to Supabase Storage
            let logoUrl = null;
            if (this.companyLogo && this.companyLogo instanceof File) {
                if (window.talentlyBackend && window.talentlyBackend.storage) {
                    try {
                        const uploadedUrl = await window.talentlyBackend.storage.uploadImage(this.companyLogo, 'images');
                        if (uploadedUrl) {
                            logoUrl = uploadedUrl;
                        } else {
                            console.error('❌ DEBUG: Logo upload returned null');
                        }
                    } catch (e) {
                        console.error('❌ DEBUG: Logo upload failed:', e);
                    }
                }
            }
            // Fallback logo only if upload failed (should not happen since we validate)
            if (!logoUrl) {
                logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'Company')}&background=random`;
                console.warn('⚠️ DEBUG: Using placeholder logo URL');
            }

            // Prepare company data for COMPANIES table
            const companyData = {
                name: companyName,
                website: companyWebsite,
                company_size: companySize,
                sector: companySector,
                country: companyCountry,
                city: companyCity,
                company_stage: stage,
                work_model: workModel,
                logo_url: logoUrl,
                mission: companyMission,
                culture_values: culture,
                positions_looking: positions,
                seniority_levels: seniority,
                tech_stack: this.companyTechStack,
                benefits: benefitsSelected,
                tags: this.companyTags,
                selection_stages: selectionStages,
                selection_duration: selectionTime,
                technical_test: technicalTest,
                paid_test: paidTest,
                value_proposition: companyValueProp,
                tax_id: companyTaxId,
            };

            // Save to Supabase COMPANIES table

            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const { data: savedCompany, error } = await window.talentlyBackend.companies.create(companyData);
                if (error) {
                    throw error;
                }

                // Update local state
                this.currentUser = { ...this.currentUser, ...savedCompany, user_type: 'company' };
                this.companyProfile = savedCompany;
                // SYNC STATE:
                this.companyTechStack = savedCompany.tech_stack || [];
                this.companyTags = savedCompany.tags || [];
                this.profileType = 'company';
                localStorage.setItem('talently_user_type', 'company');
                localStorage.setItem('talently_logged_in', 'true');
            } else {
                console.warn('⚠️ DEBUG: Backend not ready, saving to localStorage');
                localStorage.setItem('talently_company_profile', JSON.stringify(companyData));
                localStorage.setItem('talently_user_type', 'company');
            }

            // Navigate to company success screen
            this.isAuthenticated = true;
            this.userType = 'company';

            // Populate success view with company data
            const successName = document.getElementById('companySuccessName');
            const successCardName = document.getElementById('companySuccessCardName');
            const successCardLocation = document.getElementById('companySuccessCardLocation');
            const successLogo = document.getElementById('companySuccessLogo');

            if (successName) successName.textContent = companyName || 'Tu Empresa';
            if (successCardName) successCardName.textContent = companyName || 'Tu Empresa';
            if (successCardLocation) successCardLocation.textContent = [companyCity, companyCountry].filter(Boolean).join(', ') || 'Ubicación';
            if (successLogo && logoUrl && !logoUrl.includes('ui-avatars.com')) {
                successLogo.innerHTML = `<img src="${logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">`;
            }

            this.showView('companySuccessView');
            this.showToast('¡Perfil de empresa creado exitosamente!', 'success');
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error saving company profile:', error);
            this.showToast('Error al guardar perfil: ' + error.message);
        }
    },

    goToCompanyDashboard() {
        this.showView('companyApp');
        this.showCompanySection('companyDashboardSection');
        window.scrollTo(0, 0);
    },

    async completeOnboarding() {
        try {
            this.showToast('Guardando perfil...', 'info'); // UI feedback

            // DEBUG: Log collected data

            // 1. Collect Data form DOM
            const experienceLevel = document.querySelector('input[name="experienceLevel"]:checked')?.value || 'junior';
            const educationLink = document.querySelector('input[name="education"]:checked')?.value || 'universitario';
            const workModality = document.querySelector('input[name="workModality"]:checked')?.value || 'remoto';
            const availability = document.querySelector('input[name="availability"]:checked')?.value || 'inmediata';

            // 1b. Handle Image Upload (Real or Fallback)
            // Fix: Use correct name for fallback, not generic 'User'
            const userNameForAvatar = this.currentUser?.name ||
                this.currentUser?.user_metadata?.full_name ||
                'Usuario';

            let imageUrl = this.currentUser?.image;
            if (!imageUrl) {
                imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userNameForAvatar)}&background=random`;
            }

            // Check if we have a pending photo upload
            if (this.pendingUploads && this.pendingUploads.photo) {
                if (window.talentlyBackend && window.talentlyBackend.storage) {
                    try {
                        const uploadedUrl = await window.talentlyBackend.storage.uploadImage(this.pendingUploads.photo);
                        if (uploadedUrl) {
                            imageUrl = uploadedUrl;
                        } else {
                            console.warn('Image upload returned null, using default.');
                        }
                    } catch (uploadErr) {
                        console.error('Image upload failed:', uploadErr);
                        // Continue without failing the whole profile
                    }
                }
            }

            const profileData = {
                onboarding_completed: true,
                // Use name from step 2 field if filled, fallback to metadata
                name: document.getElementById('onboardFullName')?.value?.trim() || userNameForAvatar,

                birth_date: document.getElementById('birthDate')?.value || null,
                gender: document.getElementById('gender')?.value || null,
                country: document.getElementById('country')?.value,
                city: document.getElementById('city')?.value,
                relocation: document.getElementById('relocation')?.value === 'si',
                experience_years: parseInt(document.getElementById('yearsExperience')?.value || 0),
                expected_salary: parseInt((document.getElementById('expectedSalary')?.value || '0').replace(/\./g, '')),
                currency: document.getElementById('currency')?.value,
                current_position: document.getElementById('currentPosition')?.value || 'Sin cargo',
                professional_area: (this._selectedFields && this._selectedFields.length > 0) ? this._selectedFields[0] : (document.getElementById('professionalArea')?.value || ''),

                // Arrays - split skills by category (soft vs technical)
                skills: (this.skillsSelected || []).filter(s => !(this._softSkillsList || []).includes(s)),
                interests: (this._selectedFields && this._selectedFields.length > 0) ? this._selectedFields : (this.interests || []),
                experience_level: experienceLevel,
                education_level: educationLink,
                work_modality: workModality,
                availability: availability,

                user_type: 'candidate', // Explicitly set
                email: this.currentUser?.email, // Ensure email is saved to profile

                // CRITICAL: Include Image
                image: imageUrl,

                languages: [],
                soft_skills: (this.skillsSelected || []).filter(s => (this._softSkillsList || []).includes(s)),

                // Empty arrays (User can add later)
                experience: (this._experienceEntries && this._experienceEntries.length > 0) ? this._experienceEntries : [],
                education: (this._educationEntries && this._educationEntries.length > 0) ? this._educationEntries : [],
                bio: document.getElementById('bioInput')?.value || ''
            };


            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                // EXPLICIT CHECK: Only try to save to DB if we have a real authenticated user
                const { data: { session } } = await window.supabaseClient.auth.getSession();

                if (session && session.user) {
                    const { data, error } = await window.talentlyBackend.profiles.create(profileData);

                    if (error) {
                        console.error('Supabase Error:', error);
                        // Enhance error message
                        throw new Error(error.message || error.details || 'Unknown DB Error');
                    }

                    this.showToast('¡Perfil creado exitosamente!');

                    // Merge returned usage (which might have DB fields)
                    const savedProfile = data || profileData;
                    this.currentUser = { ...this.currentUser, ...savedProfile };
                } else {
                    console.warn('Backend ready but NO SESSION. Saving locally (Demo Mode).');
                    this.currentUser = { ...this.currentUser, ...profileData };
                    this.showToast('Perfil guardado (Modo Demo - Sin Sesión)');
                }

                // Force save to local storage as backup/cache
                localStorage.setItem('talently_current_user', JSON.stringify(this.currentUser));
                this.showSuccessView();
            } else {
                // FALLBACK
                console.warn('Backend not ready, using Mock fallback');
                this.currentUser = { ...this.currentUser, ...profileData };
                localStorage.setItem('talently_profile', JSON.stringify(this.currentUser));
                this.showToast('Perfil guardado (Modo Demo)');
                this.showSuccessView();
            }

        } catch (err) {
            console.error('CRITICAL ONBOARDING ERROR:', err);
            // Alert user but also log to console
            this.showToast('Error al guardar: ' + err.message, 'error');
        }
    },

    showSuccessView() {
        // Personalize title with user's first name
        const titleEl = document.getElementById('successTitle');
        if (titleEl) {
            const fullName = this.currentUser?.name || '';
            const firstName = fullName.split(' ')[0] || '';
            titleEl.textContent = firstName ? '\u00A1Todo listo, ' + firstName + '!' : '\u00A1Todo listo!';
        }
        this.showView('successView');
    },

});
