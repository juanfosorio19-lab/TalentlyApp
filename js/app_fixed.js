console.log('TALENTLY APP V56 LOADED');
// Version Check
if (!window.location.search.includes('v=56')) {
    // Force clear stale matches which are causing ID conflits
    localStorage.removeItem('talently_matches');
    console.log('CLEARED STALE MATCHES');
}

const app = {
    currentView: 'welcomeView',
    currentSection: 'swipeSection', // This is default. If it goes to Matches, check why.
    currentIndex: 0,
    profiles: [],
    isAuthenticated: false,
    userData: {},
    profileType: null,
    interests: [],
    suggestedTagsRendered: false,
    skillsSelected: [],


    citiesByCountry: citiesByCountry,

    skillsByArea: skillsByArea,

    interestsByArea: interestsByArea,

    interestsData: interestsData,

    // Company-specific state
    companyTechStack: [],
    companyTags: [],
    companyBenefits: [],
    companyPhotos: [],
    companyLogo: null,
    companyBanner: null,
    techSuggestionsRendered: false,
    companyTagSuggestionsRendered: false,
    referenceData: { countries: [], areas: [], culture_values: [], positions: [], seniority_levels: [], benefits: [], selection_durations: [] }, // Initialize referenceData
    matches: [],
    userProfile: {
        experience: [
            { id: 1, role: 'Senior UX Designer', company: 'TechSolutions', period: '2020 - Presente' }
        ],
        education: [
            { id: 1, degree: 'Diseño Gráfico', school: 'Universidad de Chile', period: '2015 - 2019' }
        ]
    },

    // ============================================
    // SETTINGS & UTILS
    // ============================================

    // ============================================
    // SETTINGS & PROFILE TABS
    // ============================================


    switchProfileTab(tabName) {
        // Update Stitch tab buttons
        const tabCv = document.getElementById('tab-cv');
        const tabActivity = document.getElementById('tab-activity');
        if (tabCv) {
            tabCv.style.background = tabName === 'cv' ? '#ffffff' : 'transparent';
            tabCv.style.color = tabName === 'cv' ? '#1e293b' : '#64748b';
            tabCv.style.fontWeight = tabName === 'cv' ? '600' : '500';
            tabCv.style.boxShadow = tabName === 'cv' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none';
        }
        if (tabActivity) {
            tabActivity.style.background = tabName === 'activity' ? '#ffffff' : 'transparent';
            tabActivity.style.color = tabName === 'activity' ? '#1e293b' : '#64748b';
            tabActivity.style.fontWeight = tabName === 'activity' ? '600' : '500';
            tabActivity.style.boxShadow = tabName === 'activity' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none';
        }

        // Show/Hide Content
        const cvContent = document.getElementById('profile-content-cv');
        const activityContent = document.getElementById('profile-content-activity');

        if (tabName === 'cv') {
            if (cvContent) { cvContent.style.display = 'block'; cvContent.style.visibility = 'visible'; }
            if (activityContent) { activityContent.style.display = 'none'; activityContent.style.visibility = 'hidden'; }
        } else {
            if (cvContent) { cvContent.style.display = 'none'; cvContent.style.visibility = 'hidden'; }
            if (activityContent) { activityContent.style.display = 'block'; activityContent.style.visibility = 'visible'; }
            this.renderActivityStats();
        }
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('talently_dark_mode', isDark);

        // Update toggle UI if exists
        const toggle = document.getElementById('darkModeToggleModal');
        if (toggle) toggle.checked = isDark;

        // Update status text in settings
        const statusText = document.getElementById('darkModeStatusText');
        if (statusText) {
            statusText.textContent = isDark ? 'Modo oscuro' : 'Modo claro';
        }
    },



    async init() {

        // Wait for Supabase
        await this.waitForSupabase();

        // Pre-fetch reference data
        await this.loadReferenceData();

        // Check Dark Mode
        const isDark = localStorage.getItem('talently_dark_mode') === 'true';
        if (isDark) document.body.classList.add('dark-mode');

        this.checkSession();
        this.setupAuthListener();
    },

    // Función para limpiar completamente el caché y reiniciar la app
    clearCache() {
        // Limpiar localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('talently_') || key.includes('supabase')) {
                localStorage.removeItem(key);
            }
        });

        // Limpiar sessionStorage
        sessionStorage.clear();

        // Resetear propiedades del app
        this.isAuthenticated = false;
        this.currentUser = null;
        this.profileType = null;
        this.userType = null;
        this.companyProfile = null;
        this.companyLogo = null;
        this.companyPhotos = [];
        this.companyBanner = null;
        this.companyTechStack = [];

        console.log('✅ Caché limpiado. Recargando app...');

        // Recargar la página con hard refresh
        setTimeout(() => {
            window.location.href = window.location.pathname + '?v=' + Date.now();
        }, 500);
    },

    async loadReferenceData() {
        if (!window.talentlyBackend) return;

        try {
            // Load all reference data in parallel
            const [
                { data: countries },
                { data: areas },
                { data: sectors },
                { data: sizes },
                { data: stages },
                { data: workModalities },
                { data: cultureValues },
                { data: positions },
                { data: seniorityLevels },
                { data: benefits },
                { data: selectionDurations }
            ] = await Promise.all([
                window.talentlyBackend.reference.getCountries(),
                window.talentlyBackend.reference.getAreas(),
                window.talentlyBackend.reference.getCompanySectors(),
                window.talentlyBackend.reference.getCompanySizes(),
                window.talentlyBackend.reference.getCompanyStages(),
                window.talentlyBackend.reference.getWorkModalities(),
                window.talentlyBackend.reference.getCompanyCultureValues(),
                window.talentlyBackend.reference.getCompanyPositions(),
                window.talentlyBackend.reference.getSeniorityLevels(),
                window.talentlyBackend.reference.getCompanyBenefits(),
                window.talentlyBackend.reference.getSelectionDurations()
            ]);

            if (countries) this.referenceData.countries = countries;
            if (areas) this.referenceData.areas = areas;
            if (sectors) this.referenceData.sectors = sectors;
            if (sizes) this.referenceData.sizes = sizes;
            if (stages) this.referenceData.stages = stages;
            if (workModalities) this.referenceData.work_modalities = workModalities;
            if (cultureValues) this.referenceData.culture_values = cultureValues;
            if (positions) this.referenceData.positions = positions;
            if (seniorityLevels) this.referenceData.seniority_levels = seniorityLevels;
            if (benefits) this.referenceData.benefits = benefits;
            if (selectionDurations) this.referenceData.selection_durations = selectionDurations;

        } catch (e) {
            console.error('Error loading reference data:', e);
        }
    },

    async waitForSupabase() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            // Use the exposed client or factory as fallback (though factory fails auth calls)
            // Fix: Use correct client reference
            const client = window.supabaseClient || window.supabase;
            const { data: { session } } = await client.auth.getSession();

            if (session) {
                // Set basic user
                this.currentUser = session.user;

                // Check user type from storage or default
                const savedUserType = localStorage.getItem('talently_user_type');
                let profile = null;

                if (savedUserType === 'company') {
                    const { data: companyData } = await window.talentlyBackend.companies.getById(session.user.id);
                    if (companyData) {
                        profile = { ...companyData, user_type: 'company' };
                    }
                }

                // If not company or not found, try profile
                if (!profile) {
                    const { data: userProfile } = await window.talentlyBackend.profiles.getById(session.user.id);
                    if (userProfile) {
                        profile = userProfile;
                    }
                }

                // CHECK ONBOARDING STATUS
                // If profile exists AND has completed onboarding -> Main App
                // Otherwise -> Onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...this.currentUser, ...profile };
                    // Sync userProfile with DB data (needed for chat alignment)
                    this.userProfile = { ...this.userProfile, ...profile };
                    // Parsear JSONB arrays
                    if (typeof this.currentUser.experience === 'string') {
                        try {
                            this.currentUser.experience = JSON.parse(this.currentUser.experience);
                        } catch (e) {
                            this.currentUser.experience = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.experience)) {
                        this.currentUser.experience = [];
                    }

                    if (typeof this.currentUser.education === 'string') {
                        try {
                            this.currentUser.education = JSON.parse(this.currentUser.education);
                        } catch (e) {
                            this.currentUser.education = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.education)) {
                        this.currentUser.education = [];
                    }

                    // Cargar avatar desde localStorage si existe
                    this.loadAvatarFromLocalStorage();

                    // FIX: prevent auto-redirect loop if already authenticated
                    if (!this.isAuthenticated) {
                        this.enterMainApp();
                    }
                } else {
                    // Ensure no residual mock data
                    this.userProfile = {};
                    if (savedUserType === 'company') {
                        this.showView('companyOnboardingStep1');
                    } else {
                        this.showView('onboardingStep1');
                    }
                }
            } else {
                this.showView('welcomeView');
            }
        } else {
            // Fallback logic
            this.showView('welcomeView');
        }
    },

    async checkSession() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            // Use the exposed client or factory as fallback (though factory fails auth calls)
            // Fix: Use correct client reference
            const client = window.supabaseClient || window.supabase;
            const { data: { session } } = await client.auth.getSession();

            if (session) {

                // Set basic user
                this.currentUser = session.user;

                // Check localStorage to determine user type
                const savedUserType = localStorage.getItem('talently_user_type');

                let profile = null;
                let userType = null;

                // Try to fetch from COMPANIES table first if user_type is company
                if (savedUserType === 'company') {
                    const { data: companyData, error: companyError } = await window.talentlyBackend.companies.getById(session.user.id);
                    if (companyData && !companyError) {
                        profile = { ...companyData, user_type: 'company', onboarding_completed: true };
                        userType = 'company';
                        this.profileType = 'company';
                        this.companyProfile = companyData;
                        // SYNC STATE:
                        this.companyTechStack = companyData.tech_stack || [];
                        this.companyTags = companyData.tags || [];
                    } else {
                    }
                }

                // If not found in companies, try PROFILES table
                if (!profile) {
                    const { data: profileData, error: profileError } = await window.talentlyBackend.profiles.getById(session.user.id);
                    if (profileData && !profileError) {
                        profile = profileData;
                        userType = profileData.user_type || 'candidate';
                        this.profileType = userType;
                    } else {
                    }
                }


                // CHECK ONBOARDING STATUS
                // If profile exists AND has completed onboarding -> Main App
                // Otherwise -> Onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...this.currentUser, ...profile };

                    // Parsear JSONB arrays
                    if (typeof this.currentUser.experience === 'string') {
                        try {
                            this.currentUser.experience = JSON.parse(this.currentUser.experience);
                        } catch (e) {
                            this.currentUser.experience = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.experience)) {
                        this.currentUser.experience = [];
                    }

                    if (typeof this.currentUser.education === 'string') {
                        try {
                            this.currentUser.education = JSON.parse(this.currentUser.education);
                        } catch (e) {
                            this.currentUser.education = [];
                        }
                    }
                    if (!Array.isArray(this.currentUser.education)) {
                        this.currentUser.education = [];
                    }

                    // Cargar avatar desde localStorage si existe
                    this.loadAvatarFromLocalStorage();

                    // FIX: prevent auto-redirect loop if already authenticated
                    if (!this.isAuthenticated) {
                        this.enterMainApp();
                    }
                } else {
                    // Ensure no residual mock data
                    this.userProfile = {};
                    this.showView('onboardingStep1');
                }
            } else {
                this.showView('welcomeView');
            }
        } else {
            // Fallback logic
            this.showView('welcomeView');
        }
    },

    setupAuthListener() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const client = window.supabaseClient || window.supabase;
            if (client && client.auth) {
                client.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        this.currentUser = session.user;

                        const savedUserType = localStorage.getItem('talently_user_type');

                        // Fetch user profile based on type
                        if (savedUserType === 'company' && window.talentlyBackend?.companies) {
                            window.talentlyBackend.companies.getById(session.user.id).then(({ data: comp }) => {
                                if (comp) {
                                    this.currentUser = { ...this.currentUser, ...comp, user_type: 'company' };
                                    // No need to parse experience for company
                                    if (this.currentView === 'companyApp') {
                                        // Update profile data logic if needed
                                    }
                                }
                            });
                        } else if (window.talentlyBackend && window.talentlyBackend.profiles) {
                            window.talentlyBackend.profiles.getById(session.user.id).then(({ data: profile }) => {
                                if (profile) {
                                    this.currentUser = { ...this.currentUser, ...profile };

                                    // Parsear JSONB arrays
                                    if (typeof this.currentUser.experience === 'string') {
                                        try {
                                            this.currentUser.experience = JSON.parse(this.currentUser.experience);
                                        } catch (e) {
                                            this.currentUser.experience = [];
                                        }
                                    }
                                    if (!Array.isArray(this.currentUser.experience)) {
                                        this.currentUser.experience = [];
                                    }

                                    if (typeof this.currentUser.education === 'string') {
                                        try {
                                            this.currentUser.education = JSON.parse(this.currentUser.education);
                                        } catch (e) {
                                            this.currentUser.education = [];
                                        }
                                    }
                                    if (!Array.isArray(this.currentUser.education)) {
                                        this.currentUser.education = [];
                                    }

                                    // Only re-enter mainApp if NOT already authenticated
                                    // This prevents view reset on tab visibility changes
                                    if (this.currentView === 'mainApp' && !this.isAuthenticated) {
                                        this.enterMainApp();
                                    } else if (this.currentView === 'mainApp') {
                                        // Just update profile data without resetting navigation
                                        this.renderProfile();
                                    }
                                }
                            });
                        }
                    } else if (event === 'SIGNED_OUT') {
                        this.currentUser = null;
                        this.isAuthenticated = false;
                        this.showView('welcomeView');
                    }
                });
            }
        }
    },

    showView(viewId) {

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Handle aliases
        if (viewId === 'companyOnboardingStep1') viewId = 'onboardingStep1';

        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewId;
            window.scrollTo(0, 0);
            this.checkAndRenderTags(viewId);
        } else {
            console.error('View not found:', viewId);
        }
    },

    loadAvatarFromLocalStorage() {
        const backup = localStorage.getItem('talently_avatar_backup');
        // console.log('loadAvatarFromLocalStorage - backup exists:', !!backup);
        // console.log('loadAvatarFromLocalStorage - currentUser.avatar_url:', this.currentUser?.avatar_url);

        if (backup && (!this.currentUser.avatar_url || this.currentUser.avatar_url.startsWith('blob:'))) {
            // console.log('Cargando avatar desde localStorage backup');
            this.currentUser.avatar_url = backup;
            this.currentUser.image = backup;
        } else if (!backup) {
            // console.log('No hay backup de avatar en localStorage');
        } else {
            // console.log('Ya hay avatar_url válido:', this.currentUser.avatar_url);
        }

        // SIEMPRE re-renderizar el perfil cuando vuelve la visibilidad
        // para forzar que la imagen se actualice en el DOM
        if (this.currentView === 'mainApp') {
            // console.log('Re-renderizando perfil para actualizar avatar...');
            this.renderProfile();
        }
    },

    // Safety Force Render for Tags
    checkAndRenderTags(viewId) {
        if (viewId === 'companyStep14') {
            if (typeof this.renderCompanyTagSuggestions === 'function') {
                try {
                    this.renderCompanyTagSuggestions();
                } catch (e) {
                    // Silent fail
                }
            }
        }
    },

    showAppSection(sectionId) {
        // FIX: Remove chat mode if leaving chatSection
        if (sectionId !== 'chatSection') {
            document.body.classList.remove('chat-mode');
        }

        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Pause video pitch if playing
        const videoPitchPlayer = document.getElementById('videoPitchPlayer');
        if (videoPitchPlayer && !videoPitchPlayer.paused) {
            videoPitchPlayer.pause();
            const btn = document.getElementById('videoPitchPlayBtn');
            const controls = document.getElementById('videoPitchControls');
            if (btn) btn.innerHTML = '<span class="material-icons" style="font-size: 40px;">play_arrow</span>';
            if (controls) controls.style.opacity = '1';
        }

        const activeSection = document.getElementById(sectionId);
        activeSection.classList.add('active');
        // Stitch sections use flex layout
        const flexSections = ['matchesSection', 'settingsSection', 'chatSection'];
        activeSection.style.display = flexSections.includes(sectionId) ? 'flex' : 'block';

        // Update nav (Stitch inline style nav)
        const navMap = {
            'swipeSection': 'navSwipe',
            'matchesSection': 'navMatches',
            'chatSection': 'navChat',
            'settingsSection': 'navProfile',
        };
        const navIds = ['navSwipe', 'navMatches', 'navChat', 'navProfile'];
        navIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const iconDiv = el.querySelector('div');
            const label = el.querySelector('span:last-child');
            if (id === navMap[sectionId]) {
                if (iconDiv) { iconDiv.style.color = '#1392ec'; }
                if (label) { label.style.color = '#1392ec'; label.style.fontWeight = '700'; }
            } else {
                if (iconDiv) { iconDiv.style.color = '#9ca3af'; }
                if (label) { label.style.color = '#9ca3af'; label.style.fontWeight = '500'; }
            }
        });

        // Legacy nav-item support
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const sections = ['swipeSection', 'matchesSection', 'settingsSection'];
        const sectionIndex = sections.indexOf(sectionId);
        if (sectionIndex >= 0) {
            const navItems = document.querySelectorAll('.nav-item');
            if (navItems[sectionIndex]) navItems[sectionIndex].classList.add('active');
        }

        this.currentSection = sectionId;

        if (sectionId === 'matchesSection') {
            this.renderMatches();
        }
        if (sectionId === 'settingsSection') {
            this.renderProfile();
            this.initNotificationToggle();
        }
    },

    showWelcome() {
        this.showView('welcomeView');
    },

    showLogin() {
        this.showView('loginView');
    },

    showRegister() {
        this.showView('registerView');
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--text-primary);
            color: white;
            padding: 12px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    validatePassword() {
        const passwordInput = document.getElementById('registerPassword');
        const successMsg = document.getElementById('passwordSuccess');
        const reqLength = document.getElementById('reqLength');
        const reqUppercase = document.getElementById('reqUppercase');
        const reqSpecial = document.getElementById('reqSpecial');

        if (!passwordInput) return;

        const password = passwordInput.value;

        // Check requirements
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%&*^()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password);

        // Update length requirement
        if (password.length === 0) {
            reqLength.style.color = 'var(--text-muted)';
            reqLength.querySelector('span').textContent = '○';
        } else if (hasMinLength) {
            reqLength.style.color = 'var(--success)';
            reqLength.querySelector('span').textContent = '?';
        } else {
            reqLength.style.color = 'var(--danger)';
            reqLength.querySelector('span').textContent = '✗';
        }

        // Update uppercase requirement
        if (password.length === 0) {
            reqUppercase.style.color = 'var(--text-muted)';
            reqUppercase.querySelector('span').textContent = '○';
        } else if (hasUppercase) {
            reqUppercase.style.color = 'var(--success)';
            reqUppercase.querySelector('span').textContent = '?';
        } else {
            reqUppercase.style.color = 'var(--danger)';
            reqUppercase.querySelector('span').textContent = '✗';
        }

        // Update special char requirement
        if (password.length === 0) {
            reqSpecial.style.color = 'var(--text-muted)';
            reqSpecial.querySelector('span').textContent = '○';
        } else if (hasSpecialChar) {
            reqSpecial.style.color = 'var(--success)';
            reqSpecial.querySelector('span').textContent = '?';
        } else {
            reqSpecial.style.color = 'var(--danger)';
            reqSpecial.querySelector('span').textContent = '✗';
        }

        // Update input border and success message
        const allValid = hasMinLength && hasUppercase && hasSpecialChar;

        if (password.length === 0) {
            passwordInput.style.borderColor = 'var(--border)';
            successMsg.style.display = 'none';
        } else if (allValid) {
            passwordInput.style.borderColor = 'var(--success)';
            successMsg.style.display = 'block';
        } else {
            passwordInput.style.borderColor = 'var(--danger)';
            successMsg.style.display = 'none';
        }

        return allValid;
    },

    async handleForgotPassword() {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput ? emailInput.value.trim() : '';

        if (!email) {
            this.showToast('Ingresa tu correo electronico primero', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (!window.talentlyBackend || !window.talentlyBackend.isReady) {
            this.showToast('Backend no configurado', 'error');
            return;
        }

        try {
            const { error } = await window.talentlyBackend.auth.resetPassword(email);
            if (error) throw error;
            this._recoveryEmail = email;
            this.showView('recoveryView');
            const emailDisplay = document.getElementById('recoveryEmailDisplay');
            if (emailDisplay) emailDisplay.textContent = email;
            // Focus first input
            const firstInput = document.querySelector('.recovery-code-input[data-index="0"]');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
            this.showToast('Se envio un codigo de recuperacion a tu correo');
        } catch (err) {
            this.showToast('Error al enviar el codigo: ' + (err.message || err), 'error');
        }
    },

    handleRecoveryCodeInput(input, index) {
        // Only allow digits
        input.value = input.value.replace(/[^0-9]/g, '');
        if (input.value && index < 5) {
            const next = document.querySelector(`.recovery-code-input[data-index="${index + 1}"]`);
            if (next) next.focus();
        }
        // Auto-verify when all 6 digits are entered
        const inputs = document.querySelectorAll('.recovery-code-input');
        const code = Array.from(inputs).map(i => i.value).join('');
        if (code.length === 6) {
            this.verifyRecoveryCode();
        }
    },

    handleRecoveryCodeKeydown(e, index) {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            const prev = document.querySelector(`.recovery-code-input[data-index="${index - 1}"]`);
            if (prev) { prev.focus(); prev.value = ''; }
        }
    },

    async verifyRecoveryCode() {
        const inputs = document.querySelectorAll('.recovery-code-input');
        const code = Array.from(inputs).map(i => i.value).join('');

        if (code.length !== 6) {
            this.showToast('Ingresa los 6 digitos del codigo', 'error');
            return;
        }

        if (!this._recoveryEmail) {
            this.showToast('Error: email de recuperacion no encontrado', 'error');
            return;
        }

        try {
            const { data, error } = await window.talentlyBackend.auth.verifyOtp(this._recoveryEmail, code, 'recovery');
            if (error) throw error;
            this.showToast('Codigo verificado correctamente');
            this.showView('newPasswordView');
        } catch (err) {
            this.showToast('Codigo incorrecto o expirado: ' + (err.message || err), 'error');
            // Clear inputs
            inputs.forEach(i => { i.value = ''; });
            if (inputs[0]) inputs[0].focus();
        }
    },

    async resendRecoveryCode() {
        if (!this._recoveryEmail) {
            this.showToast('Error: no hay email registrado', 'error');
            return;
        }
        try {
            const { error } = await window.talentlyBackend.auth.resetPassword(this._recoveryEmail);
            if (error) throw error;
            this.showToast('Se reenvio el codigo a ' + this._recoveryEmail);
        } catch (err) {
            this.showToast('Error al reenviar: ' + (err.message || err), 'error');
        }
    },

    validateNewPassword() {
        const pw = document.getElementById('newPassword').value;
        const checks = [
            { id: 'npReqLength', pass: pw.length >= 8 },
            { id: 'npReqNumber', pass: /[0-9]/.test(pw) },
            { id: 'npReqUpper', pass: /[A-Z]/.test(pw) },
            { id: 'npReqSpecial', pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(pw) }
        ];
        checks.forEach(({ id, pass }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const dot = el.querySelector('div');
            const icon = el.querySelector('.material-icons');
            if (pass) {
                if (dot) dot.style.background = '#22C55E';
                if (icon) { icon.textContent = 'check'; icon.style.color = 'white'; icon.style.fontSize = '14px'; }
                el.querySelector('span:last-child').style.color = '#111827';
                el.querySelector('span:last-child').style.fontWeight = '500';
            } else {
                if (dot) dot.style.background = '#E5E7EB';
                if (icon) { icon.textContent = 'circle'; icon.style.color = '#9CA3AF'; icon.style.fontSize = '14px'; }
                el.querySelector('span:last-child').style.color = '#617589';
                el.querySelector('span:last-child').style.fontWeight = '400';
            }
        });
    },

    async handleSetNewPassword() {
        const password = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;

        if (!password || !confirm) {
            this.showToast('Completa ambos campos', 'error');
            return;
        }
        if (password.length < 8) {
            this.showToast('La contrasena debe tener al menos 8 caracteres', 'error');
            return;
        }
        if (password !== confirm) {
            this.showToast('Las contrasenas no coinciden', 'error');
            return;
        }

        try {
            const { error } = await window.talentlyBackend.auth.updateUser({ password });
            if (error) throw error;
            this.showToast('Contrasena actualizada correctamente');
            this._recoveryEmail = null;
            this.showLogin();
        } catch (err) {
            this.showToast('Error al actualizar: ' + (err.message || err), 'error');
        }
    },

    async handleLogin(e) {
        if (e) e.preventDefault();

        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('loginPassword');

        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';


        if (!email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.auth.signIn(email, password);
                if (error) throw error;


                // Try to fetch from both tables
                let profile = null;
                let userType = null;

                // First try COMPANIES table
                const { data: companyData, error: companyError } = await window.talentlyBackend.companies.getById(data.user.id);
                if (companyData && !companyError) {
                    profile = { ...companyData, user_type: 'company', onboarding_completed: true };
                    userType = 'company';
                    this.profileType = 'company';
                    this.companyProfile = companyData;
                    this.companyTechStack = companyData.tech_stack || [];
                    this.companyTags = companyData.tags || [];
                    localStorage.setItem('talently_user_type', 'company');
                } else {

                    // Try PROFILES table
                    const { data: profileData, error: profileError } = await window.talentlyBackend.profiles.getById(data.user.id);
                    if (profileData && !profileError) {
                        profile = profileData;
                        userType = profileData.user_type || 'candidate';
                        this.profileType = userType;
                        localStorage.setItem('talently_user_type', userType);
                    } else {
                    }
                }


                // Verificar si existe perfil Y si completó onboarding
                if (profile && profile.onboarding_completed) {
                    this.currentUser = { ...data.user, ...profile };
                    this.showToast('¡Bienvenido de nuevo!');
                    this.enterMainApp();
                } else if (profile) {
                    // Perfil existe pero no completó onboarding
                    this.currentUser = { ...data.user, ...profile };
                    this.showToast('Completa tu perfil para continuar');
                    this.showView('onboardingStep1');
                } else {
                    // No hay perfil, debe completar onboarding
                    this.currentUser = data.user;
                    this.showToast('Completa tu perfil para continuar');
                    this.showView('onboardingStep1');
                }
            } catch (err) {
                console.error('❌ DEBUG: Login Error:', err);
                this.showToast('Error al iniciar sesión: ' + err.message, 'error');
            }
            return;
        }

        // Fallback
        if (email.includes('@') && password.length > 5) {
            this.currentUser = { name: 'Demo User', email };
            localStorage.setItem('talently_logged_in', 'true');
            this.showToast('¡Bienvenido de nuevo! (Demo)');
            this.enterMainApp();
        } else {
            this.showToast('Credenciales incorrectas (Demo)', 'error');
        }
    },

    async handleRegisterClick(e) {
        if (e) e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                // 1. Sign Up Auth with Metadata
                const { data, error } = await window.talentlyBackend.auth.signUp(email, password, {
                    data: { full_name: name }
                });
                if (error) throw error;

                // 2. Create Public Profile
                // CRITICAL FIX: Only create profile if we have a valid session (User is logged in).
                // If Supabase returns a user but NO session, it means Email Confirmation is required or User Exists.
                if (data.session) {
                    if (data.user) {
                        const { error: profileError } = await window.talentlyBackend.profiles.create({
                            id: data.user.id,
                            email: email,
                            name: name,
                            user_type: 'candidate',
                            image: `https://ui-avatars.com/api/?name=${name}&background=random`
                        });

                        if (profileError) {
                            console.error('Profile Creation Error RAW:', profileError);
                            const msg = profileError.message || JSON.stringify(profileError);
                            // Don't block flow if profile creation fails (it might conflict with trigger)
                            console.warn('Profile creation warning:', msg);
                        }
                    }

                    // Update local state immediately so UI reflects name/image
                    this.currentUser = {
                        ...data.user,
                        name: name,
                        email: email, // ensure email is available
                        image: `https://ui-avatars.com/api/?name=${name}&background=random`
                    };
                    this.showToast('Cuenta creada exitosamente');
                    this.showView('onboardingStep1');
                } else if (data.user) {
                    // User created (or existed) but no session -> Likely needs email confirmation OR user already exists
                    console.warn('Signup successful but no session. Email confirmation likely required OR user exists.', data);

                    // SAFE MODE/DEV WARNING
                    if (email.includes('test') || email.includes('example')) {
                        this.showToast('⚠️ Modo Prueba: Confirma tu correo real o usa uno válido.', 'info');
                    } else {
                        this.showToast('Registro procesado. Revisa tu correo para confirmar.', 'info');
                    }

                    // Redirect to login to avoid "stuck" state
                    setTimeout(() => {
                        this.showLogin();
                    }, 3500);
                }
            } catch (err) {
                console.error('Signup Error:', err);
                this.showToast('Error al registrarse: ' + err.message, 'error');
            }
            return;
        }

        // ... Mock fallback ...
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            type: 'candidate',
            avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
        };

        this.currentUser = newUser;
        localStorage.setItem('talently_logged_in', 'true');
        this.showToast('Cuenta creada (Demo)');
        this.showView('onboardingStep1');
    },

    // Restored Methods
    async loginWithGoogle() {
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            try {
                const { data, error } = await window.talentlyBackend.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + window.location.pathname
                    }
                });
                if (error) throw error;
                // Supabase will handle the redirect
            } catch (err) {
                console.error('Google Login Error:', err);
                let msg = err.message;
                if (msg && msg.includes('provider is not enabled')) {
                    msg = 'El inicio con Google no está habilitado en Supabase. Contacta al admin.';
                }
                this.showToast('Error: ' + msg, 'error');
            }
        } else {
            // Mock Fallback
            this.userData = { name: 'Usuario Google', email: 'usuario@gmail.com' };
            this.showToast('Login Google (Demo)');
            this.showView('onboardingStep1');
        }
    },

    authenticateUser() {
        this.isAuthenticated = true;
        localStorage.setItem('talently_logged_in', 'true');
        this.enterMainApp();
    },

    enterMainApp() {

        this.isAuthenticated = true;
        this.updateBadge();

        const userType = this.profileType || localStorage.getItem('talently_user_type');
        console.log('[DEBUG] enterMainApp: profileType =', this.profileType, 'localStorage =', localStorage.getItem('talently_user_type'), '→ resolved:', userType);

        // Route to correct app based on user type
        if (userType === 'company') {
            console.log('[DEBUG] enterMainApp: entering COMPANY flow');
            this.showView('companyApp');
            this.showCompanySection('companyOffersSection');
            this.renderCompanyProfile();
            this.updateCompanyHeader();

            // Subscribe to real-time messages for company notifications (regardless of which tab is open)
            this._subscribeToAllCompanyMatches();
            // Also preload matches to have conversations ready for badge updates
            this._loadCompanyMatches();
        } else {
            console.log('[DEBUG] enterMainApp: entering CANDIDATE flow');
            // Only reset view/section if not already in mainApp
            if (this.currentView !== 'mainApp') {
                this.showView('mainApp');
                this.showAppSection('swipeSection');
            }

            this.loadOffers().then(() => {
                this.renderCard();
            });
            this.setupSwipeGestures();
            this.renderProfile();

            // Preload matches from DB so notifications have data to work with
            this.renderMatches();

            // Subscribe to real-time messages for candidate notifications
            this._subscribeToCandidateMessages();
        }
    },

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
                    const isNew = idx < 2;
                    const borderStyle = isNew
                        ? 'background: linear-gradient(135deg, #1392ec, #0b6cb3); padding: 2.5px; border-radius: 50%; box-shadow: 0 4px 12px rgba(19,146,236,0.25);'
                        : 'background: #e2e8f0; padding: 2.5px; border-radius: 50%;';
                    const imgFilter = isNew ? '' : 'filter: grayscale(0.6); opacity: 0.65;';
                    const nameWeight = isNew ? 'font-weight: 600; color: #0f172a;' : 'font-weight: 500; color: #94a3b8;';
                    const onlineHtml = isNew ? `<div style="position: absolute; bottom: 4px; right: 4px; width: 14px; height: 14px; background: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1);"></div>` : '';

                    return `
                    <div onclick="app.openChat('${safeId}', '${safeName}')" style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 72px; cursor: pointer;">
                        <div style="position: relative; ${borderStyle}">
                            <div style="width: 68px; height: 68px; background: #f8fafc; border-radius: 50%; padding: 2px; border: 2px solid white; overflow: hidden;">
                                <img src="${imgUrl}" alt="${safeName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; ${imgFilter}">
                            </div>
                            ${onlineHtml}
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
                                <p>${profile.role}</p>
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
                            <div style="font-weight: 600; color: var(--text-primary);">${exp.role}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">${exp.company} • ${exp.period}</div>
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

    openEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (!modal) return;

        // Initialize state
        this.activeEditSkills = [...(this.currentUser.skills || [])];

        this.renderEditSkillsSelected();
        this.renderEditSkillsBubbles();

        modal.classList.add('active');
    },

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
                            <h3 style="font-weight: 700; font-size: 16px; line-height: 1.3; color: #212529; margin: 0;">${exp.role || ''}</h3>
                            <p style="color: #6c757d; font-size: 14px; margin: 2px 0 0;">${exp.company || ''}${exp.type ? ' \u2022 ' + exp.type : ''}</p>
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
            const preview = document.getElementById('editPhotoPreview');
            if (preview) {
                preview.innerHTML = '';
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
    openEditPersonal() {
        this.openEditProfileFullScreen();
    },

    openEditProfileFullScreen() {
        if (!this.currentUser) return;
        const modal = document.getElementById('editProfileFullScreen');
        if (modal) {
            const bioEl = document.getElementById('editProfileBio');
            if (bioEl) bioEl.value = this.currentUser.about || this.currentUser.bio || '';

            // Populating Experience
            const expContainer = document.getElementById('unifiedEditExperienceList');
            if (expContainer) {
                const exps = this.currentUser.experience || [];
                if (exps.length === 0) {
                    expContainer.innerHTML = '<p class="text-slate-500 text-sm">Sin experiencia registrada.</p>';
                } else {
                    expContainer.innerHTML = exps.map(exp => `
                        <div class="grid grid-cols-[40px_1fr] gap-x-2 relative group mb-2">
                            <div class="flex flex-col items-center">
                                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span class="material-symbols-outlined text-xl">work</span>
                                </div>
                                <div class="w-[2px] bg-slate-100 dark:bg-slate-800 h-full"></div>
                            </div>
                            <div class="flex flex-1 flex-col pb-4 pt-1 pr-8">
                                <p class="text-slate-900 dark:text-slate-100 text-base font-semibold">${exp.position}</p>
                                <p class="text-slate-500 dark:text-slate-400 text-sm">${exp.company} • ${exp.start_date || ''} - ${exp.end_date || 'Presente'}</p>
                                <button onclick="app.removeExperience('${exp.id}')" class="absolute right-0 top-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined">delete</span></button>
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
                        <div class="grid grid-cols-[40px_1fr] gap-x-2 relative group mb-2">
                            <div class="flex flex-col items-center">
                                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span class="material-symbols-outlined text-xl">school</span>
                                </div>
                                <div class="w-[2px] bg-slate-100 dark:bg-slate-800 h-full"></div>
                            </div>
                            <div class="flex flex-1 flex-col pb-4 pt-1 pr-8">
                                <p class="text-slate-900 dark:text-slate-100 text-base font-semibold">${edu.degree}</p>
                                <p class="text-slate-500 dark:text-slate-400 text-sm">${edu.institution} • ${edu.start_date || ''} - ${edu.end_date || 'Presente'}</p>
                                <button onclick="app.removeEducation('${edu.id}')" class="absolute right-0 top-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined">delete</span></button>
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
                        <div class="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full text-sm font-medium">
                            <span>${s}</span>
                        </div>
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
        const bioEl = document.getElementById('editProfileBio');
        if (bioEl) {
            this.currentUser.about = bioEl.value;
            this.currentUser.bio = bioEl.value;
        }
        this.saveProfile();
        this.renderProfile();
        this.closeEditProfileFullScreen();
        this.showToast('Perfil actualizado');
    },


    renderProfile() {
        const profileData = this.currentUser || {};

        // 1. Name & Title (Stitch)
        const nameEl = document.getElementById('profileDisplayName');
        if (nameEl) nameEl.textContent = profileData.name || 'Usuario';
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
            titleEl.textContent = (profileData.current_position || 'Sin cargo definido') + locationString;
        }

        // 2. Avatar
        const imageUrl = profileData.avatar_url || profileData.image;
        const avatarEl = document.getElementById('profileAvatarImg');
        if (avatarEl) {
            if (imageUrl && !imageUrl.startsWith('blob:')) {
                avatarEl.src = imageUrl;
            } else {
                avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=1392ec&color=fff&size=200`;
            }
        }
        // Also update preview images
        document.querySelectorAll('.preview-image').forEach(el => {
            if (avatarEl) el.src = avatarEl.src;
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

            await window.talentlyBackend.profiles.create(payload); // Uses UPSERT now
            this.showToast('Perfil actualizado');
        } else {
            localStorage.setItem('talently_profile', JSON.stringify(this.currentUser));
        }
    },



    appendMessageToUI(text, type) {
        const messagesContainer = document.getElementById('chatMessages') || document.getElementById('companyChatMessages');
        if (!messagesContainer) return;

        let messageHTML = '';
        const now = new Date();
        const timeStr = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: true });

        if (type === 'sent') {
            messageHTML = `
            <div style="display: flex; align-items: flex-end; gap: 12px; max-width: 85%; align-self: flex-end;">
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <div style="background: #1392ec; padding: 14px; border-radius: 16px 16px 4px 16px; box-shadow: 0 2px 8px rgba(19,146,236,0.2);">
                        <p style="font-size: 15px; line-height: 1.5; color: #ffffff; font-weight: 500; margin: 0;">${text}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px; margin-right: 4px;">
                        <span style="font-size: 10px; color: #868E96;">${timeStr}</span>
                        <span class="material-icons" style="font-size: 14px; color: #1392ec;">done_all</span>
                    </div>
                </div>
            </div>`;
        } else if (type === 'received') {
            messageHTML = `
            <div style="display: flex; align-items: flex-end; gap: 12px; max-width: 85%; align-self: flex-start;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="background: #F1F3F5; padding: 14px; border-radius: 16px 16px 16px 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                        <p style="font-size: 15px; line-height: 1.5; color: #343A40; margin: 0;">${text}</p>
                    </div>
                </div>
            </div>`;
        } else if (type === 'error') {
            messageHTML = `
            <div style="display: flex; justify-content: center; padding: 8px;">
                <span style="font-size: 13px; color: #ef4444; font-weight: 500;">${text}</span>
            </div>`;
        }

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    _blockChatInput(reason) {
        // Block both candidate and company chat inputs
        const inputs = [document.getElementById('chatInput'), document.getElementById('companyChatInput')];
        inputs.forEach(input => {
            if (input) {
                input.disabled = true;
                input.placeholder = reason || 'Chat bloqueado';
                input.style.opacity = '0.5';
            }
        });
        // Disable send buttons
        const sendBtns = document.querySelectorAll('.chat-send-btn, #companySendBtn');
        sendBtns.forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            }
        });
        // Show blocked banner
        const containers = [document.getElementById('chatMessages'), document.getElementById('companyChatMessages')];
        containers.forEach(container => {
            if (container) {
                const existingBanner = container.querySelector('.chat-blocked-banner');
                if (!existingBanner) {
                    container.insertAdjacentHTML('beforeend', `
                        <div class="chat-blocked-banner" style="text-align: center; padding: 12px 16px; margin: 8px 0; background: #FFF3E0; border: 1px solid #FFE0B2; border-radius: 12px; color: #E65100; font-size: 13px; font-weight: 500;">
                            🔒 ${reason || 'Chat bloqueado'}
                        </div>
                    `);
                    container.scrollTop = container.scrollHeight;
                }
            }
        });
        this._chatBlocked = true;
    },

    _unblockChatInput() {
        const inputs = [document.getElementById('chatInput'), document.getElementById('companyChatInput')];
        inputs.forEach(input => {
            if (input) {
                input.disabled = false;
                input.placeholder = 'Escribe un mensaje...';
                input.style.opacity = '1';
            }
        });
        const sendBtns = document.querySelectorAll('.chat-send-btn, #companySendBtn');
        sendBtns.forEach(btn => {
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });
        this._chatBlocked = false;
    },

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;
        if (!this.currentMatchId) return;
        if (this._chatBlocked) return;

        // Optimistic UI
        this.appendMessageToUI(message, 'sent');
        input.value = '';

        // Send to Backend
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const { error } = await window.talentlyBackend.matches.sendMessage(this.currentMatchId, message);
            if (error) {
                console.error('Error sending message:', error);
                // Optionally show error state on the message
            }
        }
    },

    openFilters() {
        const type = localStorage.getItem('talently_user_type');
        const isCompany = (type === 'company' || this.profileType === 'company');
        const viewId = isCompany ? 'companyFiltersView' : 'filtersView';
        const view = document.getElementById(viewId);
        if (!view) {
            console.error(viewId + ' not found');
            return;
        }

        // Toggle: Si ya está abierto, cerrar
        if (view.style.transform === 'translateY(0px)' || view.style.transform === 'translateY(0)') {
            this.closeFilters();
            return;
        }

        // Cerrar otros toggles
        this.closeNotifications();
        this.closeSettingsModal();

        // Abrir filtros
        view.style.transform = 'translateY(0)';

        if (isCompany) {
            // Inicializar slider y cargar sugerencias de skills
            this.updateSalarySlider();
            this._loadCompanyFilterSkillSuggestions();
            this._renderFilterSkillTags();
        } else {
            this.loadFilterOptions();
        }
    },

    closeFilters() {
        const view = document.getElementById('filtersView');
        if (view) view.style.transform = 'translateY(100%)';
        const companyView = document.getElementById('companyFiltersView');
        if (companyView) companyView.style.transform = 'translateY(100%)';
    },

    async loadFilterOptions() {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        const chipStyle = "padding: 10px 16px; border-radius: 12px; background: #ffffff; border: 1px solid #e5e7eb; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; font-family: 'Inter', sans-serif; white-space: nowrap;";
        const chipIconStyle = "display: flex; align-items: center; gap: 8px; " + chipStyle;

        // Icon mapping for modalities
        const modalityIcons = { 'remoto': 'home_work', 'hibrido': 'commute', 'presencial': 'apartment', 'remote': 'home_work', 'hybrid': 'commute', 'onsite': 'apartment' };

        // 1. MODALIDAD - Desde BD (with icons)
        const modalityContainer = document.getElementById('filterModalityChips');
        if (modalityContainer) {
            try {
                const { data: modalities } = await window.talentlyBackend.reference.getWorkModalities();
                if (modalities && modalities.length > 0) {
                    modalityContainer.innerHTML = '';
                    modalities.forEach(m => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.onclick = () => this.toggleFilterChip(btn, 'work_modality', m.slug);
                        const icon = modalityIcons[m.slug] || modalityIcons[m.name?.toLowerCase()] || '';
                        btn.innerHTML = icon ? `<span class="material-icons" style="font-size: 18px;">${icon}</span>${m.name}` : m.name;
                        btn.style.cssText = icon ? chipIconStyle : chipStyle;
                        modalityContainer.appendChild(btn);
                    });
                }
            } catch (e) {
                console.error('Error loading modalities:', e);
            }
        }

        // Additional filters loaded dynamically
        if (window.talentlyBackend?.reference) {
            // Seniority
            const expGrid = document.getElementById('filterExperienceGrid');
            if (expGrid && typeof window.talentlyBackend.reference.getSeniorityLevels === 'function') {
                window.talentlyBackend.reference.getSeniorityLevels().then(({ data }) => {
                    if (data && data.length) {
                        expGrid.innerHTML = '';
                        data.forEach(lvl => {
                            const btn = document.createElement('button');
                            btn.className = 'filter-exp-card';
                            btn.onclick = () => this.selectFilterExperience(btn, lvl.dbSlug || lvl.slug);
                            btn.style.cssText = `display:flex;flex-direction:column;align-items:center;padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;cursor:pointer;font-family:'Inter', sans-serif;`;
                            btn.innerHTML = `<span style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:500;">${lvl.name}</span>`;
                            expGrid.appendChild(btn);
                        });
                    }
                }).catch(() => { });
            }
            // Job Types
            const jobContainer = document.getElementById('filterJobTypeChips');
            if (jobContainer && window.supabaseClient) {
                window.supabaseClient.from('job_types').select('*').then(({ data }) => {
                    let d = data || [];
                    if (d.length === 0) d = [
                        { name: 'Full-time', slug: 'full-time' }, { name: 'Part-time', slug: 'part-time' },
                        { name: 'Freelance', slug: 'freelance' }
                    ];
                    jobContainer.innerHTML = '';
                    d.forEach(jt => {
                        const btn = document.createElement('button');
                        btn.className = 'filter-chip';
                        btn.onclick = () => this.toggleFilterChip(btn, 'job_type', jt.slug);
                        btn.style.cssText = chipStyle;
                        btn.textContent = jt.name;
                        jobContainer.appendChild(btn);
                    });
                }).catch(() => { });
            }
        }

        // 2. Load Categories
        this.loadFilterCategories();
    },

    handleSalaryTrackClick(e, type) {
        const track = e.currentTarget;
        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        const clickedValue = percent * 15000;

        let minEl, maxEl;
        if (type === 'candidate') {
            minEl = document.getElementById('filterSalaryMinRange');
            maxEl = document.getElementById('filterSalaryMaxRange');
        } else {
            minEl = document.getElementById('companyFilterSalaryMin');
            maxEl = document.getElementById('companyFilterSalaryMax');
        }

        if (!minEl || !maxEl) return;
        const minVal = parseInt(minEl.value) || 0;
        const maxVal = parseInt(maxEl.value) || 0;

        // Snap to nearest
        if (Math.abs(clickedValue - minVal) < Math.abs(clickedValue - maxVal)) {
            minEl.value = Math.round(clickedValue / 500) * 500;
            minEl.style.zIndex = '4'; maxEl.style.zIndex = '3';
        } else {
            maxEl.value = Math.round(clickedValue / 500) * 500;
            maxEl.style.zIndex = '4'; minEl.style.zIndex = '3';
        }

        if (type === 'candidate') this.updateCandidateSalarySlider(null, 'track');
        else this.updateSalarySlider();
    },

    async loadFilterCategories() {
        const categoryContainer = document.getElementById('filterCategoryChips');
        if (!categoryContainer || !window.talentlyBackend?.isReady) return;
        const chipStyle = "padding: 10px 16px; border-radius: 12px; background: #ffffff; border: 1px solid #e5e7eb; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; font-family: 'Inter', sans-serif; white-space: nowrap;";

        try {
            const { data: areas } = await window.talentlyBackend.reference.getAreas();
            if (areas && areas.length > 0) {
                categoryContainer.innerHTML = '';
                areas.forEach(area => {
                    const btn = document.createElement('button');
                    btn.className = 'filter-chip';
                    btn.onclick = () => this.toggleFilterChip(btn, 'category', area.id);
                    btn.textContent = area.name;
                    btn.style.cssText = chipStyle;
                    categoryContainer.appendChild(btn);
                });
            }
        } catch (e) {
            console.error('Error loading filter categories:', e);
        }
    },

    updateCandidateSalarySlider(el, source) {
        const minRange = document.getElementById('filterSalaryMinRange');
        const maxRange = document.getElementById('filterSalaryMaxRange');
        const minText = document.getElementById('filterSalaryMin');
        const maxText = document.getElementById('filterSalaryMax');
        const fill = document.getElementById('candidateSalaryFill');
        if (!minRange || !maxRange || !minText || !maxText) return;

        let minVal = parseInt(minRange.value) || 0;
        let maxVal = parseInt(maxRange.value) || 0;

        if (source === 'minText') {
            minVal = parseInt(el.value) || 0;
            minRange.value = minVal;
        } else if (source === 'maxText') {
            maxVal = parseInt(el.value) || 0;
            maxRange.value = maxVal;
        } else {
            minText.value = minVal === 0 ? '' : minVal;
            maxText.value = maxVal === 15000 ? '' : maxVal;
        }

        // Prevent crossing
        if (minVal > maxVal && source !== 'maxText') {
            maxVal = minVal;
            maxRange.value = maxVal;
            if (source !== 'maxText') maxText.value = maxVal;
        } else if (minVal > maxVal && source === 'maxText') {
            minVal = maxVal;
            minRange.value = minVal;
            if (source !== 'minText') minText.value = minVal;
        }

        const range = 15000;
        const leftPct = Math.max(0, Math.min(100, (minVal / range) * 100));
        const rightPct = Math.max(0, Math.min(100, ((range - maxVal) / range) * 100));

        if (fill) {
            fill.style.left = `${leftPct}%`;
            fill.style.right = `${rightPct}%`;
        }
    },

    selectFilterExperience(element, value) {
        // Radio-like single select for experience cards
        document.querySelectorAll('#filterExperienceGrid .filter-exp-card').forEach(card => {
            card.classList.remove('selected');
            card.style.background = '#ffffff';
            card.style.color = '#64748b';
            card.style.borderColor = '#e5e7eb';
        });

        if (this._selectedFilterExp === value) {
            // Deselect if clicking same
            this._selectedFilterExp = null;
            this.activeFilters.experience_range = [];
        } else {
            element.classList.add('selected');
            element.style.background = 'rgba(19,146,236,0.06)';
            element.style.color = '#1392ec';
            element.style.borderColor = '#1392ec';
            this._selectedFilterExp = value;
            this.activeFilters.experience_range = [value];
        }
    },

    async loadFilterCities() {
        const countryId = document.getElementById('filterCountry')?.value;
        const citySelect = document.getElementById('filterCity');
        if (!citySelect) return;

        // Reset cities
        citySelect.innerHTML = '<option value="">Todas</option>';

        if (!countryId || !window.talentlyBackend?.isReady) return;

        try {
            const supabase = window.supabaseClient;
            if (!supabase) return;

            const { data: cities } = await supabase.from('cities').select('id, name').eq('country_id', countryId).order('name');
            if (cities) {
                cities.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.name;
                    citySelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.warn('Error loading cities:', e);
        }
    },

    clearAllFilters() {
        // Reset candidate filter chips (Stitch solid pills)
        document.querySelectorAll('#filtersView .filter-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
            chip.style.background = '#ffffff';
            chip.style.color = '#64748b';
            chip.style.borderColor = '#e5e7eb';
        });

        // Reset candidate experience radio cards
        document.querySelectorAll('#filterExperienceGrid .filter-exp-card').forEach(card => {
            card.classList.remove('selected');
            card.style.background = '#ffffff';
            card.style.color = '#64748b';
            card.style.borderColor = '#e5e7eb';
        });
        this._selectedFilterExp = null;

        // Reset candidate salary inputs
        const salaryMin = document.getElementById('filterSalaryMin');
        const salaryMax = document.getElementById('filterSalaryMax');
        if (salaryMin) salaryMin.value = '';
        if (salaryMax) salaryMax.value = '';
        const salaryMinR = document.getElementById('filterSalaryMinRange');
        const salaryMaxR = document.getElementById('filterSalaryMaxRange');
        if (salaryMinR) salaryMinR.value = '0';
        if (salaryMaxR) salaryMaxR.value = '15000';
        if (salaryMinR) this.updateCandidateSalarySlider(salaryMinR, 'min');
        const catSelect = document.getElementById('filterCategory');
        if (catSelect) catSelect.value = '';

        // Reset candidate location input
        const locInput = document.getElementById('filterLocationInput');
        if (locInput) locInput.value = '';

        // Reset COMPANY filter chips (Stitch checkbox pills)
        document.querySelectorAll('#companyFiltersView .filter-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
            chip.style.background = '#ffffff';
            chip.style.color = '#475569';
            chip.style.borderColor = '#e2e8f0';
            const cb = chip.querySelector('.cf-check');
            if (cb) { cb.style.background = '#ffffff'; cb.style.borderColor = '#cbd5e1'; cb.innerHTML = ''; }
        });

        // Reset company salary slider
        const cMin = document.getElementById('companyFilterSalaryMin');
        const cMax = document.getElementById('companyFilterSalaryMax');
        if (cMin) cMin.value = 0;
        if (cMax) cMax.value = 15000;
        this.updateSalarySlider();

        // Reset company location
        const cLocInput = document.getElementById('companyFilterLocation');
        if (cLocInput) cLocInput.value = '';

        // Reset company experience segmented control
        document.querySelectorAll('#companyFilterExperienceSegments .exp-seg').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
            btn.style.boxShadow = 'none';
        });
        this._selectedExpSegment = null;

        // Reset company skill tags
        this._filterSkills = [];
        const skillTags = document.getElementById('companyFilterSkillTags');
        if (skillTags) skillTags.innerHTML = '';
        const skillInput = document.getElementById('companyFilterSkillInput');
        if (skillInput) skillInput.value = '';
        // Re-show all suggestions
        document.querySelectorAll('#companyFilterSkillSuggestions button').forEach(b => b.style.display = '');

        // Reset filter state
        this.activeFilters = {};
        this.showToast('Filtros restablecidos');
    },

    /* ===== Company Filters - Salary Dual Range Slider ===== */
    updateSalarySlider() {
        const minEl = document.getElementById('companyFilterSalaryMin');
        const maxEl = document.getElementById('companyFilterSalaryMax');
        const fill = document.getElementById('companySalaryFill');
        const label = document.getElementById('companySalaryRangeLabel');
        if (!minEl || !maxEl) return;

        let minVal = parseInt(minEl.value) || 0;
        let maxVal = parseInt(maxEl.value) || 0;

        // Prevent crossing
        if (minVal > maxVal) {
            maxVal = minVal;
            maxEl.value = maxVal;
        }

        // Update fill bar position
        const range = 15000;
        const leftPct = Math.max(0, Math.min(100, (minVal / range) * 100));
        const rightPct = Math.max(0, Math.min(100, ((range - maxVal) / range) * 100));
        if (fill) {
            fill.style.left = `calc(8px + ${leftPct}%)`;
            fill.style.right = `calc(8px + ${rightPct}%)`;
        }

        // Dynamic z-index for thumb overlapping
        if (minVal > range / 2) {
            minEl.style.zIndex = '4';
            maxEl.style.zIndex = '3';
        } else {
            maxEl.style.zIndex = '4';
            minEl.style.zIndex = '3';
        }

        // Update label
        if (label) {
            const fmtMin = '$' + minVal.toLocaleString('en-US');
            const fmtMax = maxVal >= 15000 ? '$15,000+' : '$' + maxVal.toLocaleString('en-US');
            label.textContent = `${fmtMin} - ${fmtMax}`;
        }
    },

    /* ===== Company Filters - Experience Segmented Control ===== */
    selectExpSegment(el, value) {
        const wasActive = el.classList.contains('active');

        // Deselect all
        document.querySelectorAll('#companyFilterExperienceSegments .exp-seg').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#64748b';
            btn.style.boxShadow = 'none';
        });

        if (wasActive) {
            // Toggle off
            this._selectedExpSegment = null;
        } else {
            // Activate
            el.classList.add('active');
            el.style.background = '#ffffff';
            el.style.color = '#1392ec';
            el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            this._selectedExpSegment = value;
        }
    },

    /* ===== Company Filters - Skill Tags ===== */
    _filterSkills: [],

    addFilterSkill() {
        const input = document.getElementById('companyFilterSkillInput');
        if (!input) return;
        const val = input.value.trim();
        if (!val || this._filterSkills.includes(val)) { input.value = ''; return; }
        this._filterSkills.push(val);
        input.value = '';
        this._renderFilterSkillTags();
        // Hide matching suggestion
        document.querySelectorAll('#companyFilterSkillSuggestions button').forEach(b => {
            if (b.textContent.trim().toLowerCase() === val.toLowerCase()) b.style.display = 'none';
        });
    },

    removeFilterSkill(skill) {
        this._filterSkills = this._filterSkills.filter(s => s !== skill);
        this._renderFilterSkillTags();
        // Re-show matching suggestion
        document.querySelectorAll('#companyFilterSkillSuggestions button').forEach(b => {
            if (b.textContent.trim().toLowerCase() === skill.toLowerCase()) b.style.display = '';
        });
    },

    addFilterSkillFromSuggestion(el, name) {
        if (this._filterSkills.includes(name)) return;
        this._filterSkills.push(name);
        el.style.display = 'none';
        this._renderFilterSkillTags();
    },

    _renderFilterSkillTags() {
        const container = document.getElementById('companyFilterSkillTags');
        if (!container) return;
        container.innerHTML = this._filterSkills.map(s => `
            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: rgba(19,146,236,0.08); color: #1392ec; border-radius: 99px; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;">
                ${s}
                <span onclick="app.removeFilterSkill('${s.replace(/'/g, "\\'")}')" style="cursor: pointer; display: flex; align-items: center;">
                    <span class="material-icons" style="font-size: 14px; color: #1392ec;">close</span>
                </span>
            </span>
        `).join('');
    },

    async _loadCompanyFilterSkillSuggestions() {
        const container = document.getElementById('companyFilterSkillSuggestions');
        if (!container) return;
        const supabase = window.supabaseClient;
        if (!supabase) return;
        try {
            const { data: skills } = await supabase.from('skills').select('id, name').order('name').limit(20);
            if (skills && skills.length > 0) {
                container.innerHTML = skills.map(s => `
                    <button onclick="app.addFilterSkillFromSuggestion(this, '${s.name.replace(/'/g, "\\'")}')"
                        style="padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 99px; font-size: 12px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; background: #f8fafc; color: #64748b; transition: all 0.15s;"
                        onmouseover="this.style.borderColor='#1392ec';this.style.color='#1392ec'"
                        onmouseout="this.style.borderColor='#e2e8f0';this.style.color='#64748b'">
                        ${s.name}
                    </button>
                `).join('');
            }
        } catch (e) {
            console.warn('Error loading skill suggestions:', e);
        }
    },

    async handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showToast('Por favor selecciona una imagen');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('La imagen no debe superar 5MB');
            return;
        }

        // Show preview immediately y guardar en localStorage como backup
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            const avatarImg = document.getElementById('profileAvatarImg');
            if (avatarImg) avatarImg.src = base64Image;

            // Guardar inmediatamente en localStorage como backup
            localStorage.setItem('talently_avatar_backup', base64Image);
            this.currentUser.image = base64Image;
            this.currentUser.avatar_url = base64Image;
        };
        reader.readAsDataURL(file);

        // Upload to Supabase Storage
        try {
            if (window.talentlyBackend && window.talentlyBackend.isReady) {
                const supabase = window.supabaseClient;
                if (!supabase) return;

                const userId = this.currentUser?.id || (await supabase.auth.getUser())?.data?.user?.id;
                if (!userId) return;

                const fileExt = file.name.split('.').pop();
                const fileName = `${userId}/avatar.${fileExt}`;

                // Upload to storage bucket
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file, { upsert: true });

                if (error) {
                    console.error('Avatar upload error:', error);

                    if (error.message && error.message.includes('Bucket not found')) {
                        this.showToast('Error: Storage no configurado. Contacta al administrador.');
                    } else {
                        this.showToast('Error al subir imagen. Se guardará localmente.');
                    }

                    // Guardar como base64 en lugar de ObjectURL
                    const reader2 = new FileReader();
                    reader2.onload = (e) => {
                        const base64Image = e.target.result;
                        this.currentUser.image = base64Image;
                        this.currentUser.avatar_url = base64Image;
                        localStorage.setItem('talently_avatar_backup', base64Image);
                        this.saveProfile();
                        this.renderProfile();
                    };
                    reader2.readAsDataURL(file);
                    return;
                }

                // Get the public URL
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                const publicUrl = urlData?.publicUrl;
                if (publicUrl) {
                    // Update profile with new image URL (agregar timestamp para evitar cache)
                    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
                    this.currentUser.image = urlWithTimestamp;
                    this.currentUser.avatar_url = urlWithTimestamp;

                    // GUARDAR la URL de Supabase en localStorage como backup permanente
                    localStorage.setItem('talently_avatar_backup', urlWithTimestamp);
                    // console.log('Avatar URL guardada en localStorage:', urlWithTimestamp);

                    await this.saveProfile();
                    this.renderProfile(); // Update UI immediately
                    this.showToast('Foto actualizada correctamente');
                }
            } else {
                this.currentUser.image = URL.createObjectURL(file);
                this.renderProfile(); // Update UI immediately
                this.showToast('Foto actualizada localmente (Backend no listo)');
            }
        } catch (e) {
            console.error('Avatar upload failed:', e);
            this.showToast('Error crítico al subir foto');
            // Prevent disappearance
            this.currentUser.image = URL.createObjectURL(file);
            this.renderProfile(); // Update UI immediately
        }
    },

    // === NOTIFICATION TOGGLE ===
    async toggleNotificationSetting() {
        const statusText = document.getElementById('notifStatusText');
        const isCurrentlyOn = localStorage.getItem('talently_notifications') === 'true';

        if (!isCurrentlyOn) {
            // Turning ON — request permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    localStorage.setItem('talently_notifications', 'true');
                    if (statusText) { statusText.textContent = 'Activado'; statusText.style.color = '#10B981'; }
                    this.showToast('Notificaciones activadas');

                    new Notification('Talently', {
                        body: '¡Notificaciones activadas! Recibirás alertas de matches y mensajes.',
                        icon: 'https://ui-avatars.com/api/?name=T&background=1392ec&color=fff'
                    });
                } else {
                    this.showToast('Permiso de notificaciones denegado por el navegador');
                }
            } else {
                this.showToast('Tu navegador no soporta notificaciones');
            }
        } else {
            // Turning OFF
            localStorage.setItem('talently_notifications', 'false');
            if (statusText) { statusText.textContent = 'Desactivado'; statusText.style.color = '#9CA3AF'; }
            this.showToast('Notificaciones desactivadas');
        }
    },

    initNotificationToggle() {
        const isOn = localStorage.getItem('talently_notifications') === 'true';
        const statusText = document.getElementById('notifStatusText');
        if (!statusText) return;

        if (isOn && 'Notification' in window && Notification.permission === 'granted') {
            statusText.textContent = 'Activado';
            statusText.style.color = '#10B981';
        } else {
            statusText.textContent = 'Desactivado';
            statusText.style.color = '#9CA3AF';
        }
    },

    // === PROFILE COMPLETENESS DETAIL ===
    showProfileCompletenessDetail() {
        if (!this.currentUser) return;

        const fieldLabels = {
            name: 'Nombre',
            email: 'Correo electrónico',
            birth_date: 'Fecha de nacimiento',
            country: 'País',
            city: 'Ciudad',
            current_position: 'Cargo actual',
            work_modality: 'Modalidad de trabajo',
            availability: 'Disponibilidad',
            expected_salary: 'Salario esperado',
            bio: 'Biografía / Sobre mí',
            image: 'Foto de perfil'
        };

        const arrayFieldLabels = {
            skills: 'Habilidades',
            experience: 'Experiencia laboral',
            education: 'Educación'
        };

        const missing = [];

        Object.entries(fieldLabels).forEach(([key, label]) => {
            const val = this.currentUser[key];
            if (!val || val === '') {
                // Check avatar_url as fallback for image
                if (key === 'image' && (this.currentUser.avatar_url)) return;
                missing.push(label);
            }
        });

        Object.entries(arrayFieldLabels).forEach(([key, label]) => {
            const val = this.currentUser[key];
            if (!val || !Array.isArray(val) || val.length === 0) {
                missing.push(label);
            }
        });

        const pct = this.calculateProfileCompleteness();

        if (missing.length === 0) {
            this.showToast('🎉 ¡Tu perfil está 100% completo!');
        } else {
            // Show modal with missing fields
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
            overlay.onclick = () => overlay.remove();

            const modal = document.createElement('div');
            modal.style.cssText = 'background: var(--surface); border-radius: 20px; padding: 24px; max-width: 340px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2);';
            modal.onclick = (e) => e.stopPropagation();

            modal.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 42px; margin-bottom: 8px;">📋</div>
                    <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Perfil ${pct}% completo</h3>
                    <p style="font-size: 13px; color: var(--text-secondary);">Te falta completar ${missing.length} campo${missing.length > 1 ? 's' : ''}</p>
                </div>
                <div style="max-height: 250px; overflow-y: auto;">
                    ${missing.map(f => `
                        <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: rgba(255,107,157,0.08); margin-bottom: 6px;">
                            <span style="color: var(--danger); font-size: 16px;">✕</span>
                            <span style="font-size: 14px; color: var(--text-primary); font-weight: 500;">${f}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('div[style*=fixed]').remove()"
                    style="width: 100%; margin-top: 16px; padding: 14px; background: var(--gradient-primary); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">
                    Entendido
                </button>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        }
    },

    // Video Logic
    async handleVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) return this.showToast('El video debe ser menor a 50MB');
        try {
            this.showToast('Subiendo video...', 'info');
            const fileName = `${this.state.user.id}_intro.${file.name.split('.').pop()}`;
            const { error } = await window.supabaseClient.storage.from('videos').upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: p } = window.supabaseClient.storage.from('videos').getPublicUrl(fileName);
            const { error: e2 } = await window.supabaseClient.from('profiles').update({ video_url: p.publicUrl }).eq('id', this.state.user.id);
            if (e2) throw e2;
            this.setupVideoPlayer(p.publicUrl);
            this.showToast('Video subido exitosamente', 'success');
        } catch (e) {
            console.error(e); this.showToast('Error al subir video. Asegúrate de configurar Supabase Storage primero.', 'error');
        }
    },
    setupVideoPlayer(url) {
        const v = document.getElementById('candidateVideoPlayer'); const t = document.getElementById('candidateVideoThumbnail');
        if (!v || !url) return; v.src = url; v.classList.remove('hidden'); if (t) t.classList.add('hidden');
        v.addEventListener('timeupdate', () => {
            const p = document.getElementById('videoProgressBar'), td = document.getElementById('videoTimeDisplay');
            if (p) p.style.width = `${(v.currentTime / v.duration) * 100}%`;
            if (td) td.innerText = `${Math.floor(v.currentTime)}s / ${Math.floor(v.duration || 0)}s`;
        });
    },
    toggleVideoPlay() {
        const v = document.getElementById('candidateVideoPlayer'), b = document.getElementById('videoPlayBtn');
        if (!v || !v.src) return this.showToast('Aún no tienes un video.');
        if (v.paused) { v.play(); b.innerHTML = '<span class="material-icons text-5xl">pause</span>'; }
        else { v.pause(); b.innerHTML = '<span class="material-icons text-5xl">play_arrow</span>'; }
    },
    toggleVideoMute() {
        const v = document.getElementById('candidateVideoPlayer'), m = document.getElementById('videoMuteIcon');
        if (v) { v.muted = !v.muted; m.innerText = v.muted ? 'volume_off' : 'volume_up'; }
    },
    seekVideo(e) {
        const v = document.getElementById('candidateVideoPlayer');
        if (v && v.duration) { const r = e.currentTarget.getBoundingClientRect(); v.currentTime = (Math.max(0, Math.min(e.clientX - r.left, r.width)) / r.width) * v.duration; }
    },

    updateBadge() {
        const badge = document.querySelector('.icon-btn .badge');
        const dot = document.getElementById('notifBadgeDot');

        // Count unread matches
        const count = this.matches ? this.matches.filter(m => m.hasUnread).length : 0;
        console.log('[DEBUG] updateBadge: unread count =', count, 'total matches =', (this.matches || []).length);

        if (dot) dot.style.display = count > 0 ? 'block' : 'none';

        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update candidate Matches tab badge
        const matchesBadge = document.getElementById('candidateMatchesBadge');
        if (matchesBadge) {
            if (count > 0) {
                matchesBadge.textContent = count > 9 ? '9+' : count;
                matchesBadge.style.display = 'flex';
            } else {
                matchesBadge.style.display = 'none';
            }
        }

        // Also update the list if it's visible or just to be safe
        this.renderNotifications();
    },

    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        // Build notifications array from matches + any custom notifications
        const notifications = [];
        const escapeHtml = (unsafe) => {
            if (typeof unsafe !== 'string') return '';
            return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        };

        // Match-based notifications
        (this.matches || []).filter(m => m.matchDate || m.isReal).forEach(match => {
            const type = match.lastMessage ? 'message' : 'match';
            notifications.push({
                id: String(match.id),
                type: type,
                name: match.name || 'Usuario',
                image: match.image || match.avatar || null,
                title: type === 'match' ? '¡Nuevo Match!' : 'Mensaje recibido',
                body: type === 'match'
                    ? `<span style="font-weight:600;color:#333333;">${escapeHtml(match.name || 'Usuario')}</span> le ha gustado tu perfil. ¡Comienza a chatear ahora!`
                    : escapeHtml(match.lastMessage || 'Tienes un nuevo mensaje'),
                date: match.matchDate ? new Date(match.matchDate) : new Date(),
                isUnread: !!match.hasUnread,
                onclick: `app.markSingleNotificationRead('${escapeHtml(String(match.id))}'); app.openChat('${escapeHtml(String(match.id))}', '${escapeHtml(match.name || 'Usuario')}'); app.closeNotifications();`
            });
        });

        // Add custom notifications if stored
        (this.candidateNotifications || []).forEach(n => {
            notifications.push(n);
        });

        // Sort by date descending
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (notifications.length === 0) {
            list.innerHTML = `<div style="text-align: center; padding: 60px 24px; color: #666666;">
                <span class="material-icons" style="font-size: 48px; color: #E5E7EB; display: block; margin-bottom: 12px;">notifications_none</span>
                <p style="margin: 0; font-size: 14px;">No tienes notificaciones</p>
            </div>`;
            return;
        }

        // Group by date
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const groups = { 'Hoy': [], 'Ayer': [], 'Anteriores': [] };

        notifications.forEach(n => {
            const d = new Date(n.date);
            if (d >= today) groups['Hoy'].push(n);
            else if (d >= yesterday) groups['Ayer'].push(n);
            else groups['Anteriores'].push(n);
        });

        // Type config
        const typeConfig = {
            match: { icon: 'favorite', badgeBg: '#22c55e', badgeColor: '#ffffff' },
            message: { icon: 'chat', badgeBg: '#1392ec', badgeColor: '#ffffff' },
            offer: { icon: 'work', badgeBg: '#8b5cf6', badgeColor: '#ffffff' },
            viewed: { icon: 'mark_email_read', badgeBg: '#6B7280', badgeColor: '#ffffff' },
            security: { icon: 'security', badgeBg: null, badgeColor: '#6B7280' }
        };

        // Relative time
        const relativeTime = (d) => {
            const diff = Math.floor((now - new Date(d)) / 1000);
            if (diff < 60) return 'Ahora';
            if (diff < 3600) return `${Math.floor(diff / 60)}m`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
            return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
        };

        let html = '';
        Object.entries(groups).forEach(([label, items]) => {
            if (items.length === 0) return;
            html += `<div style="padding: 16px 16px 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h2 style="font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">${label}</h2>
                </div>
            </div>`;

            items.forEach(n => {
                const cfg = typeConfig[n.type] || typeConfig.match;
                const safeName = escapeHtml(n.name || '');
                const imgUrl = n.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=1392ec&color=fff`;
                const isUnread = n.isUnread;
                const cardBg = isUnread ? 'background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.15);' : 'background: #ffffff; border: 1px solid #E5E7EB;';
                const unreadDot = isUnread ? `<div style="width: 10px; height: 10px; border-radius: 50%; background: #1392ec; box-shadow: 0 0 8px rgba(19,146,236,0.4);"></div>` : '';
                const timeColor = isUnread ? 'color: #1392ec; font-weight: 500;' : 'color: #9CA3AF;';

                // Avatar section
                let avatarHtml;
                if (n.type === 'security') {
                    avatarHtml = `<div style="height: 48px; width: 48px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; flex-shrink: 0;">
                        <span class="material-icons" style="font-size: 24px; color: #6B7280;">security</span>
                    </div>`;
                } else {
                    avatarHtml = `<div style="position: relative; flex-shrink: 0;">
                        <div style="height: 48px; width: 48px; border-radius: 50%; background: #E5E7EB center / cover; border: 1px solid #f3f4f6; background-image: url('${imgUrl}');"></div>
                        <div style="position: absolute; bottom: -4px; right: -4px; background: ${cfg.badgeBg}; border-radius: 50%; padding: 2px; border: 2px solid #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="font-size: 10px; color: ${cfg.badgeColor}; display: block;">${cfg.icon}</span>
                        </div>
                    </div>`;
                }

                html += `<div style="margin: 0 12px 8px;">
                    <div onclick="${n.onclick || ''}" style="position: relative; display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 12px; ${cardBg} cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04);">
                        <div style="position: absolute; top: 16px; right: 16px; display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 12px; ${timeColor}">${relativeTime(n.date)}</span>
                            ${unreadDot}
                        </div>
                        ${avatarHtml}
                        <div style="flex: 1; padding-right: 48px;">
                            <h3 style="font-size: 16px; font-weight: 700; color: #333333; line-height: 1.3; margin: 0 0 4px;">${escapeHtml(n.title)}</h3>
                            <p style="font-size: 14px; color: #666666; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${n.body}</p>
                        </div>
                    </div>
                </div>`;
            });
        });

        list.innerHTML = html;
    },

    openCardDetail(type, context = 'discovery') {
        const modal = document.getElementById('cardDetailModal');
        if (!modal) return;

        let data;
        if (type === 'self') {
            const profile = this.currentUser;
            if (!profile) return;
            data = {
                id: profile.id,
                name: profile.full_name || profile.name,
                role: profile.current_position || profile.title || profile.role || 'Profesional',
                image: profile.avatar_url || profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.name || 'C')}&background=1392ec&color=fff`,
                seniority: profile.experience_level || 'N/A',
                exp: profile.experience_years || 'N/A',
                salary: profile.expected_salary ? `${profile.currency || '$'} ${profile.expected_salary}` : 'A convenir',
                modality: profile.work_modality || profile.modality || 'Flexible',
                languages: profile.languages || ['Español'],
                skills: profile.skills || [],
                softSkills: profile.soft_skills || [],
                benefits: profile.interests || [],
                bio: profile.bio || profile.description || 'Sin descripción disponible.',
                fit: 100, // Own profile always shows 100% fit dynamically
                location: profile.city || profile.country || 'Sin ubicación',
                education: profile.education_level || 'N/A',
                area: profile.professional_area || 'N/A'
            };
        } else if (type === 'candidate') {
            data = this.candidatesDeck[this.currentCandidateIndex];
            if (!data) return;
        }

        if (type === 'self' || type === 'candidate') {
            // Hero image
            const heroImg = document.getElementById('cdHeroImg');
            const imageUrl = data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1392ec&color=fff&size=600`;
            if (heroImg) heroImg.style.backgroundImage = `url("${imageUrl}")`;

            // Name, role, location
            const nameEl = document.getElementById('cdName');
            const roleEl = document.getElementById('cdRole');
            const locText = document.getElementById('cdLocationText');
            if (nameEl) nameEl.textContent = data.name || 'Candidato';
            if (roleEl) roleEl.textContent = data.role || 'Profesional';
            if (locText) locText.textContent = data.location || 'Sin ubicación';

            // Bio
            const bioEl = document.getElementById('cdBio');
            if (bioEl) bioEl.textContent = data.bio || 'Sin descripción disponible.';

            // Skills
            const skillsEl = document.getElementById('cdSkills');
            if (skillsEl) {
                const allSkills = [...(data.skills || []), ...(data.softSkills || [])];
                skillsEl.innerHTML = allSkills.map((s, i) => {
                    const isSoft = i >= (data.skills || []).length;
                    return isSoft
                        ? `<div style="display: flex; height: 34px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 10px; background: rgba(19,146,236,0.08); border: 1px solid rgba(19,146,236,0.2);"><span style="font-size: 13px; font-weight: 700; color: #1392ec;">${s}</span></div>`
                        : `<div style="display: flex; height: 34px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 10px; background: #e5e7eb; border: 1px solid #d1d5db;"><span style="font-size: 13px; font-weight: 600; color: #1f2937;">${s}</span></div>`;
                }).join('');
            }

            // Experience timeline
            const expEl = document.getElementById('cdExperience');
            if (expEl) {
                expEl.innerHTML = `
                    <div style="position: relative; margin-bottom: 0;">
                        <div style="position: absolute; left: -25px; top: 0; width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 2px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <span class="material-icons" style="font-size: 20px; color: #1392ec;">work</span>
                        </div>
                        <div style="padding-left: 24px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1a202c;">${data.role || 'Profesional'}</h3>
                            <p style="margin: 2px 0 0; font-size: 13px; font-weight: 700; color: #1392ec;">${data.area || ''}</p>
                            <p style="margin: 2px 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">${data.seniority || ''} ${data.exp ? '• ' + data.exp + ' años' : ''}</p>
                        </div>
                    </div>
                `;
            }

            // Education
            const eduEl = document.getElementById('cdEducation');
            if (eduEl) {
                eduEl.innerHTML = `
                    <div style="position: relative;">
                        <div style="position: absolute; left: -25px; top: 0; width: 40px; height: 40px; border-radius: 50%; background: #ffffff; border: 2px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="font-size: 18px; color: #1392ec;">school</span>
                        </div>
                        <div style="padding-left: 24px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1a202c;">${data.education || 'N/A'}</h3>
                        </div>
                    </div>
                `;
            }

            // Preferences
            const salaryEl = document.getElementById('cdSalary');
            const modalityEl = document.getElementById('cdModality');
            if (salaryEl) salaryEl.textContent = data.salary || 'A convenir';
            if (modalityEl) modalityEl.textContent = data.modality || 'Flexible';

            // Show action buttons for candidates
            const actionBtns = document.getElementById('cdActionButtons');
            const matchActionBtns = document.getElementById('cdMatchActionButtons');
            if (context === 'match') {
                if (actionBtns) actionBtns.style.display = 'none';
                if (matchActionBtns) matchActionBtns.style.display = 'block';
            } else if (type === 'self') {
                // Own profile preview - hide action buttons
                if (actionBtns) actionBtns.style.display = 'none';
                if (matchActionBtns) matchActionBtns.style.display = 'none';
            } else {
                if (actionBtns) actionBtns.style.display = 'flex';
                if (matchActionBtns) matchActionBtns.style.display = 'none';
            }

            // Scroll to top
            const scroll = document.getElementById('cardDetailScroll');
            if (scroll) scroll.scrollTop = 0;
        } else {
            // Offer detail - populate same template with offer data
            data = this.currentProfileData || this.profiles[this.currentIndex];
            if (!data) return;

            const heroImg = document.getElementById('cdHeroImg');
            const imageUrl = data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.company || data.name)}&background=1392ec&color=fff&size=600`;
            if (heroImg) heroImg.style.backgroundImage = `url("${imageUrl}")`;

            const nameEl = document.getElementById('cdName');
            const roleEl = document.getElementById('cdRole');
            const locText = document.getElementById('cdLocationText');
            if (nameEl) nameEl.textContent = data.name || 'Oferta';
            if (roleEl) roleEl.textContent = data.company || '';
            if (locText) locText.textContent = data.location || '';

            const bioEl = document.getElementById('cdBio');
            if (bioEl) bioEl.textContent = data.description || 'Sin descripción.';

            const skillsEl = document.getElementById('cdSkills');
            if (skillsEl) {
                skillsEl.innerHTML = (data.skills || []).map(s =>
                    `<div style="display: flex; height: 34px; align-items: center; justify-content: center; padding: 0 14px; border-radius: 10px; background: #e5e7eb; border: 1px solid #d1d5db;"><span style="font-size: 13px; font-weight: 600; color: #1f2937;">${s}</span></div>`
                ).join('');
            }

            const expEl = document.getElementById('cdExperience');
            if (expEl) expEl.innerHTML = `<p style="padding-left: 24px; color: #94a3b8; font-size: 13px;">—</p>`;
            const eduEl = document.getElementById('cdEducation');
            if (eduEl) eduEl.innerHTML = `<p style="padding-left: 24px; color: #94a3b8; font-size: 13px;">—</p>`;

            const salaryEl = document.getElementById('cdSalary');
            const modalityEl = document.getElementById('cdModality');
            if (salaryEl) salaryEl.textContent = data.salary || 'Competitivo';
            if (modalityEl) modalityEl.textContent = data.modality || 'Remoto';

            // Hide candidate action buttons for offers
            const actionBtns = document.getElementById('cdActionButtons');
            if (actionBtns) actionBtns.style.display = 'none';

            const scroll = document.getElementById('cardDetailScroll');
            if (scroll) scroll.scrollTop = 0;
        }

        modal.style.display = 'flex';

        // Track profile view
        if (window.talentlyBackend && window.talentlyBackend.isReady) {
            const targetUserId = type === 'offer' ? data.userId : (data.profileId || data.id);
            if (targetUserId && typeof targetUserId === 'string' && targetUserId.includes('-')) {
                window.talentlyBackend.statistics.incrementForUser(targetUserId, 'profile_views').catch(() => { });
            }
        }
    },

    closeCardDetail() {
        const modal = document.getElementById('cardDetailModal');
        if (modal) modal.style.display = 'none';
    },

    markSingleNotificationRead(matchId) {
        const idx = (this.matches || []).findIndex(m => String(m.id) === String(matchId));
        if (idx !== -1 && this.matches[idx].hasUnread) {
            this.matches[idx].hasUnread = false;
            localStorage.setItem('talently_matches', JSON.stringify(this.matches));
            this.updateBadge();
        }
    },

    // Filter state
    activeFilters: {},

    showFilterTab(tabName) {
        // Update tabs
        document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.filter-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(`filter-${tabName}`).style.display = 'block';
    },

    toggleFilterChip(element, category, value) {
        const isSelected = element.classList.toggle('selected');
        const checkBox = element.querySelector('.cf-check');

        // Visual toggle - Stitch style
        if (isSelected) {
            // Check if inside company filters (checkbox pill style) or candidate filters (solid pill)
            if (checkBox) {
                element.style.background = 'rgba(19,146,236,0.08)';
                element.style.color = '#1392ec';
                element.style.borderColor = '#1392ec';
                checkBox.style.background = '#1392ec';
                checkBox.style.borderColor = '#1392ec';
                checkBox.innerHTML = '<span class="material-icons" style="font-size:12px;color:#fff;line-height:16px;">check</span>';
            } else {
                element.style.background = '#1392ec';
                element.style.color = '#ffffff';
                element.style.borderColor = '#1392ec';
            }
        } else {
            if (checkBox) {
                element.style.background = '#ffffff';
                element.style.color = '#475569';
                element.style.borderColor = '#e2e8f0';
                checkBox.style.background = '#ffffff';
                checkBox.style.borderColor = '#cbd5e1';
                checkBox.innerHTML = '';
            } else {
                element.style.background = '#ffffff';
                element.style.color = '#64748b';
                element.style.borderColor = '#e5e7eb';
            }
        }

        // Update filter state
        if (!this.activeFilters[category]) {
            this.activeFilters[category] = [];
        }

        const index = this.activeFilters[category].indexOf(value);
        if (index > -1) {
            this.activeFilters[category].splice(index, 1);
        } else {
            this.activeFilters[category].push(value);
        }

        this.updateActiveFiltersDisplay();
        if (typeof this.applyFilters === 'function') this.applyFilters();
        else if (typeof this.triggerSearch === 'function') this.triggerSearch();
    },

    updateActiveFiltersDisplay() {
        const container = document.getElementById('activeFilters');
        const allFilters = Object.entries(this.activeFilters)
            .flatMap(([cat, values]) => values.map(v => ({ cat, value: v })));

        if (allFilters.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = allFilters.map(f => `
            <span class="active-filter-tag">
                ${f.value}
                <button class="remove-filter" onclick="app.removeFilter('${f.cat}', '${f.value}')">×</button>
            </span>
        `).join('');
    },

    removeFilter(category, value) {
        const index = this.activeFilters[category].indexOf(value);
        if (index > -1) {
            this.activeFilters[category].splice(index, 1);
        }

        // Update chip state
        document.querySelectorAll('.filter-chip').forEach(chip => {
            if (chip.textContent.includes(value)) {
                chip.classList.remove('selected');
            }
        });

        this.updateActiveFiltersDisplay();
    },

    clearFilters() {
        this.activeFilters = {};
        if (this._unfilteredProfiles && this._unfilteredProfiles.length > 0) {
            this.profiles = [...this._unfilteredProfiles];
            this.currentIndex = 0;
        }
        this._unfilteredProfiles = null;
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('selected');
        });
        this.updateActiveFiltersDisplay();
    },

    applyFilters() {
        const type = localStorage.getItem('talently_user_type');
        const isCompany = (type === 'company' || this.profileType === 'company');

        // 1. Collect filters from UI into this.activeFilters
        const filters = { ...this.activeFilters };

        if (isCompany) {
            const sMin = parseInt(document.getElementById('companyFilterSalaryMin')?.value || '0');
            const sMax = parseInt(document.getElementById('companyFilterSalaryMax')?.value || '15000');
            if (sMin > 0) filters.salaryMin = sMin;
            if (sMax < 15000) filters.salaryMax = sMax;
            const loc = document.getElementById('companyFilterLocation')?.value?.trim();
            if (loc) filters.location = loc;
            if (this._selectedExpSegment) filters.experience = this._selectedExpSegment;
            if (this._filterSkills && this._filterSkills.length > 0) filters.skills = [...this._filterSkills];
        } else {
            const salaryMin = document.getElementById('filterSalaryMin')?.value;
            const salaryMax = document.getElementById('filterSalaryMax')?.value;
            if (salaryMin) filters.salaryMin = parseInt(salaryMin);
            if (salaryMax) filters.salaryMax = parseInt(salaryMax);
            const locationText = document.getElementById('filterLocationInput')?.value?.trim();
            if (locationText) filters.location = locationText;
            if (this._selectedFilterExp) filters.experience = this._selectedFilterExp;

            // Nota: Category es manejado vía array de chips en this.activeFilters['category']
        }
        this.activeFilters = filters;

        // 2. Apply filtering to profile cards (company explore view)
        const active = this.activeFilters;
        if (!this._unfilteredProfiles || this._unfilteredProfiles.length === 0) {
            this._unfilteredProfiles = [...this.profiles];
        }
        let filtered = [...this._unfilteredProfiles];

        if (active.salaryMin) {
            filtered = filtered.filter(p => {
                const min = p.salary_min || (p.salary ? parseInt(String(p.salary).replace(/[^0-9]/g, '')) : 0);
                return min >= active.salaryMin;
            });
        }
        if (active.salaryMax) {
            filtered = filtered.filter(p => {
                const max = p.salary_max || (p.salary ? parseInt(String(p.salary).split('-').pop().replace(/[^0-9]/g, '')) : Infinity);
                return max <= active.salaryMax;
            });
        }
        if (active.modality && active.modality.length > 0) {
            filtered = filtered.filter(p => active.modality.some(m => p.modality && p.modality.includes(m)));
        }
        if (active.modalidad && active.modalidad.length > 0) {
            filtered = filtered.filter(p => active.modalidad.some(m => p.modality && p.modality.includes(m)));
        }
        if (active.location) {
            const loc = active.location.toLowerCase();
            filtered = filtered.filter(p => {
                const city = (p.city || '').toLowerCase();
                const country = (p.country || '').toLowerCase();
                return city.includes(loc) || country.includes(loc);
            });
        }
        if (active.experience) {
            filtered = filtered.filter(p => {
                const yrs = parseInt(p.experience_years || p.years_experience || '0');
                const [lo, hi] = active.experience.includes('+') ? [10, 99] : active.experience.split('-').map(Number);
                return yrs >= lo && yrs <= hi;
            });
        }
        if (active.skills && active.skills.length > 0) {
            filtered = filtered.filter(p => {
                const pSkills = (p.skills || p.techStack || p.tech_stack || []).map(s => s.toLowerCase());
                return active.skills.some(s => pSkills.includes(s.toLowerCase()));
            });
        }
        if (active.sector && active.sector.length > 0) {
            filtered = filtered.filter(p => active.sector.some(s => p.sector && p.sector.includes(s)));
        }
        if (active.techStack && active.techStack.length > 0) {
            filtered = filtered.filter(p => {
                const skills = p.skills || p.techStack || [];
                return active.techStack.some(t => skills.includes(t));
            });
        }
        if (active.category) {
            filtered = filtered.filter(p => {
                const category = p.category || p.area || p.area_id || '';
                return category.toString().toLowerCase() === active.category.toLowerCase();
            });
        }

        // --- NATIVE GEOLOCATION DISTANCE FILTER ---
        if (this.filterDistance && this.filterDistance < 200) {
            // Get current active user/company coordinated
            const sourceLat = this.companyProfile?.latitude || this.currentUser?.latitude;
            const sourceLng = this.companyProfile?.longitude || this.currentUser?.longitude;

            if (sourceLat && sourceLng) {
                filtered = filtered.filter(p => {
                    const targetLat = p.latitude;
                    const targetLng = p.longitude;

                    // Accept candidate if they have no location but we want to filter? 
                    // Usually we drop them if we are filtering explicitly by distance.
                    if (!targetLat || !targetLng) return false;

                    const distKm = this.calculateDistance(sourceLat, sourceLng, targetLat, targetLng);
                    return distKm <= this.filterDistance;
                });
            }
        }
        // ------------------------------------------

        this.profiles = filtered;
        this.currentIndex = 0;

        if (this.profiles.length === 0) {
            const cardStack = document.querySelector('.card-stack');
            if (cardStack) {
                cardStack.innerHTML = `
                    <div class="no-profiles" style="text-align: center; padding: 40px;">
                        <h3>No hay perfiles que coincidan</h3>
                        <p>Intenta ajustar tus filtros</p>
                        <button class="btn-secondary" onclick="app.clearFilters(); app.applyFilters()" style="margin-top: 16px;">Limpiar Filtros</button>
                    </div>`;
            }
            this.showToast('No se encontraron perfiles en este radio de búsqueda');
        } else {
            this.renderCard();
            this.showToast(`${this.profiles.length} perfiles encontrados`);
        }

        this.closeFilters();
    },

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

    // ============================================
    // COMPANY ONBOARDING FUNCTIONS
    // ============================================

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

    openEditSkills() {
        const modal = document.getElementById('editSkillsModal');
        if (!modal) return;

        // Load user's current skills
        this.skillsSelected = [...(this.currentUser.skills || [])];

        // Clear search
        const searchInput = document.getElementById('editSkillsSearch');
        if (searchInput) searchInput.value = '';

        // Render selected chips and all suggestions
        this.renderSelectedSkillsChips();
        this.renderEditSkillsBubbles();

        modal.style.display = 'flex';
    },

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


    // ============================================
    // COMPANY DETAIL MODAL FUNCTIONS
    // ============================================

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
        if (view.style.transform === 'translateY(0px)' || view.style.transform === 'translateY(0)') {
            view.style.transform = 'translateY(100%)';
        } else {
            // Cerrar otros toggles
            this.closeFilters();
            this.closeSettingsModal();

            view.style.transform = 'translateY(0)';
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
            view.style.transform = 'translateY(100%)';
        }
        const companyView = document.getElementById('companyNotificationsView');
        if (companyView) {
            companyView.style.transform = 'translateY(100%)';
        }
    },

    closeSettingsModal() {
        // Cerrar candidate view
        const candidateView = document.getElementById('settingsView');
        if (candidateView) {
            candidateView.style.transform = 'translateY(100%)';
        }

        // Cerrar company settings view
        const companySettingsView = document.getElementById('companySettingsView');
        if (companySettingsView) {
            companySettingsView.style.transform = 'translateY(100%)';
        }

        // Cerrar old company modal (legacy)
        const companyModal = document.getElementById('settingsModal');
        if (companyModal) {
            companyModal.style.display = 'none';
            companyModal.style.opacity = '0';
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
    }
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    app.init();

    // Make app globally accessible for debugging
    window.app = app;

    // Listener para recargar avatar cuando la página vuelve a ser visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && app.currentUser) {
            app.loadAvatarFromLocalStorage();
        }
    });
});

// ===== CANDIDATE SEARCH LOGIC APPENDED =====
Object.assign(app, {
    // ===== CANDIDATE SWIPE LOGIC =====
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
                    <img src="${img}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; background: #e2e8f0;">
                    ${hasOnline ? '<div style="position: absolute; bottom: 1px; right: 1px; width: 13px; height: 13px; background: #22c55e; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 0 1px rgba(34,197,94,0.2);"></div>' : ''}
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
                ? 'background: linear-gradient(135deg, #1392ec, #60a5fa); padding: 2px;'
                : 'background: #e2e8f0; padding: 2px;';

            return `
            <div onclick="app.openCompanyChat('${conv.id}')"
                style="display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 72px; cursor: pointer;">
                <div style="position: relative;">
                    <div style="width: 68px; height: 68px; border-radius: 50%; ${ringStyle} box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                        <img src="${img}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid #ffffff; ${isNew ? '' : 'opacity: 0.9;'}">
                    </div>
                    ${isNew ? '<div style="position: absolute; bottom: 3px; right: 3px; width: 14px; height: 14px; background: #1392ec; border: 2px solid #ffffff; border-radius: 50%;"></div>' : ''}
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

        document.getElementById('messagesListView').style.display = 'none';
        document.getElementById('messagesChatView').style.display = 'flex';

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
        document.getElementById('messagesChatView').style.display = 'none';
        document.getElementById('messagesListView').style.display = 'flex';
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

// ===== MESSAGES FEATURE LOGIC REMOVED (Legacy Mock Data causing bugs) =====
// The correct logic is implemented in the main app object above.

// Init search events
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('candidateSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') app.searchCandidates();
        });
    }
});

// Expose app globally for inline HTML handlers
window.app = app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof app !== 'undefined' && app.init) {
        app.init();
    }
});


// STITCH VIEWS INTEGRATION
Object.assign(app, {
    initStitchViews() {
        // swipe buttons
        const sw = document.getElementById('companySwipeView');
        if (sw) {
            const btns = sw.querySelectorAll('.max-w-md.flex.justify-center.items-center.gap-8 button');
            if (btns.length >= 3) {
                btns[0].onclick = () => app.handleStitchSwipe('left');
                btns[1].onclick = () => app.handleStitchSwipe('superlike');
                btns[2].onclick = () => app.handleStitchSwipe('right');
            }
        }
        // modal buttons
        const dm = document.getElementById('candidateDetailModal');
        if (dm) {
            Array.from(dm.querySelectorAll('button')).forEach(b => {
                if (b.textContent.includes('Rechazar')) {
                    b.onclick = () => { dm.classList.add('hidden'); dm.classList.remove('flex'); app.handleStitchSwipe('left'); };
                }
                if (b.textContent.includes('Me Interesa')) {
                    b.onclick = () => { dm.classList.add('hidden'); dm.classList.remove('flex'); app.handleStitchSwipe('right'); };
                }
            });
        }
        // overlay buttons
        const ov = document.getElementById('matchSuccessOverlay');
        if (ov) {
            const ovb = Array.from(ov.querySelectorAll('button'));
            const cbd = ovb.find(b => b.innerHTML.includes('close'));
            const mbd = ovb.find(b => b.textContent.includes('Enviar mensaje'));
            const ebd = ovb.find(b => b.textContent.includes('Seguir explorando'));

            if (cbd) cbd.onclick = () => ov.style.display = 'none';
            if (ebd) ebd.onclick = () => ov.style.display = 'none';
            if (mbd) mbd.onclick = () => {
                ov.style.display = 'none';
                app.showAppSection('chatSection');
            };
        }
    },
    async handleStitchSwipe(dir) {
        if (!window.talentlyBackend || !window.talentlyBackend.swipes) return;
        const mockId = 'd8fbc2e0-0b61-420a-8a18-d73df4b9e28f';
        try {
            const { error, isMutualMatch } = await window.talentlyBackend.swipes.create(mockId, dir);

            // Visual fade out
            const cards = document.querySelectorAll('#companySwipeView .card-item');
            const vc = Array.from(cards).filter(c => c.style.display !== 'none' && c.style.opacity !== '0');
            if (vc.length > 0) {
                vc[0].style.transform = dir === 'left' ? 'translateX(-100vw) rotate(-20deg)' : 'translateX(100vw) rotate(20deg)';
                vc[0].style.opacity = '0';
                setTimeout(() => vc[0].style.display = 'none', 300);
            }

            if (dir === 'right' || dir === 'superlike') {
                const match = Math.random() > 0.5;
                if (match || isMutualMatch) {
                    setTimeout(() => app.showMatchSuccessOverlay(mockId), 500);
                }
            }
        } catch (e) {
            console.error(e);
        }
    },
    showMatchSuccessOverlay(id) {
        const ov = document.getElementById('matchSuccessOverlay');
        if (ov) ov.style.display = 'flex';
    },
    showCompanySwipe() {
        app.showView('companySwipeView');
        app.initStitchViews();
    },

    // ============================================
    // GEOLOCALIZACION Y DISTANCIA (NUEVO)
    // ============================================

    filterDistance: 200,

    updateDistanceFilter(value) {
        this.filterDistance = parseInt(value, 10);
        const display = document.getElementById('distanceFilterValue');
        if (display) {
            display.textContent = this.filterDistance >= 200 ? 'Cualquiera' : `Hasta ${this.filterDistance} km`;
        }

        // Mostrar advertencia si la empresa no tiene ubicación configurada y usa el filtro
        const warning = document.getElementById('distanceFilterWarning');
        if (warning && this.currentUser) {
            const hasLocation = this.currentUser.latitude || this.companyProfile?.latitude;
            warning.style.display = (!hasLocation && this.filterDistance < 200) ? 'block' : 'none';
        }

        // Re-aplicar filtros automáticamente si estamos en la vista de Explorar
        if (typeof this.applyFilters === 'function') {
            this.applyFilters();
        }
    },

    requestDeviceLocation(type = 'candidate') {
        const statusEl = document.getElementById(type === 'company' ? 'cpGeoStatus' : 'userGeoStatus');

        if (!navigator.geolocation) {
            this.showToast('La geolocalización no es soportada por este navegador.', 'error');
            if (statusEl) statusEl.textContent = 'Error: Navegador no soportado';
            return;
        }

        if (statusEl) statusEl.textContent = 'Solicitando permisos...';
        this.showToast('Permite el acceso a tu ubicación...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (statusEl) {
                    statusEl.innerHTML = `<span style="color: #059669;">Guardada (${lat.toFixed(4)}, ${lng.toFixed(4)})</span>`;
                }

                // Inyectar en campos ocultos si es empresa
                if (type === 'company') {
                    const latHidden = document.getElementById('cpLatitude');
                    const lngHidden = document.getElementById('cpLongitude');
                    if (latHidden) latHidden.value = lat;
                    if (lngHidden) lngHidden.value = lng;
                }

                this.showToast('🌍 Ubicación capturada exitosamente', 'success');

                // Si el usuario actual está logueado, guardarlo en la DB de Supabase
                if (this.currentUser && this.currentUser.id && window.supabaseClient) {
                    try {
                        const table = type === 'company' ? 'companies' : 'profiles';
                        const idToUpdate = type === 'company' ? (this.companyProfile?.id || this.currentUser.id) : this.currentUser.id;

                        const { error } = await window.supabaseClient
                            .from(table)
                            .update({ latitude: lat, longitude: lng })
                            .eq('id', idToUpdate);

                        if (!error) {
                            this.currentUser.latitude = lat;
                            this.currentUser.longitude = lng;
                            if (this.companyProfile) {
                                this.companyProfile.latitude = lat;
                                this.companyProfile.longitude = lng;
                            }
                        }
                    } catch (e) {
                        console.error('Error guardando loc:', e);
                    }
                }
            },
            (error) => {
                console.error('Geolocation Error:', error);
                let msg = 'Error obteniendo ubicación';
                if (error.code === 1) msg = 'Permiso de ubicación denegado';
                if (statusEl) statusEl.innerHTML = `<span style="color: #ef4444;">${msg}</span>`;
                this.showToast(msg, 'error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;

        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en km
    },

    // ==========================================
    // NOTIFICATIONS & SETTINGS MODAL
    // ==========================================
    async openSettingsModal() {
        if (!this.currentUser || !this.currentUser.id) {
            this.showToast('Debes iniciar sesión para configurar tus alertas', 'error');
            return;
        }

        const modal = document.getElementById('settingsFullScreen');
        if (!modal) return;

        // Default state fallback
        this.currentSettings = {
            match_alerts: false,
            message_alerts: false,
            marketing_alerts: false
        };

        // Fetch user settings from Supabase
        try {
            const { data, error } = await window.supabaseClient
                .from('user_settings')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
                console.error('Error fetching settings:', error);
                this.showToast('No se pudieron cargar tus preferencias. Usando por defecto.', 'error');
            }

            if (data) {
                this.currentSettings.match_alerts = data.match_alerts || false;
            }
        } catch (err) {
            console.error('Exception fetching settings:', err);
        }

        // Set visual state of toggles
        const notifToggle = document.querySelector('#settingsFullScreen input[type="checkbox"][onchange*="toggleSetting"]');
        if (notifToggle) {
            notifToggle.checked = this.currentSettings.match_alerts;
        }

        const dmToggle = document.getElementById('settingsDarkModeToggle');
        if (dmToggle) {
            dmToggle.checked = document.body.classList.contains('dark-mode');
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    closeSettingsFullScreen() {
        const modal = document.getElementById('settingsFullScreen');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';
    },

    async toggleSetting(type) {
        if (!this.currentUser || !this.currentUser.id) return;

        if (!this.currentSettings) {
            this.currentSettings = { match_alerts: false, message_alerts: false, marketing_alerts: false };
        }

        let field = '';
        let toggleId = '';
        let textId = '';

        if (type === 'match') {
            field = 'match_alerts';
            toggleId = 'matchToggle';
            textId = 'matchToggleText';
        } else if (type === 'message') {
            field = 'message_alerts';
            toggleId = 'messageToggle';
            textId = 'messageToggleText';
        } else if (type === 'marketing') {
            field = 'marketing_alerts';
            toggleId = 'marketingToggle';
            textId = 'marketingToggleText';
        }

        if (!field) return;

        // Optimistic UI Update
        const newValue = !this.currentSettings[field];
        this.currentSettings[field] = newValue;

        this.updateToggleVisual(toggleId, newValue);

        const txtEl = document.getElementById(textId);
        if (txtEl) txtEl.textContent = newValue ? 'Activado' : 'Desactivado';

        // Upsert to Supabase
        try {
            const { error } = await window.supabaseClient
                .from('user_settings')
                .upsert({
                    user_id: this.currentUser.id,
                    [field]: newValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('Error updating setting:', error);

                // Revert UI on failure
                this.currentSettings[field] = !newValue;
                this.updateToggleVisual(toggleId, !newValue);
                if (txtEl) txtEl.textContent = !newValue ? 'Activado' : 'Desactivado';

                this.showToast('Hubo un error al guardar tu preferencia', 'error');
            }
        } catch (err) {
            console.error('Exception updating setting:', err);
        }
    },

    updateToggleVisual(toggleId, isON) {
        const toggleEl = document.getElementById(toggleId);
        if (!toggleEl) return;

        const circle = toggleEl.querySelector('div');
        if (!circle) return;

        if (isON) {
            toggleEl.style.background = '#1392ec'; // Blue
            circle.style.transform = 'translateX(24px)';
        } else {
            toggleEl.style.background = '#e5e7eb'; // Gray
            circle.style.transform = 'translateX(0)';
        }
    },

    // ==========================================
    // SECURITY MODAL & CHANGE PASSWORD
    // ==========================================
    openSecurityModal() {
        if (!this.currentUser || !this.currentUser.id) {
            this.showToast('Inicia sesión para gestionar tu seguridad', 'error');
            return;
        }

        // Reset fields
        const newPassInput = document.getElementById('securityNewPassword');
        const confPassInput = document.getElementById('securityConfirmPassword');
        if (newPassInput) {
            newPassInput.value = '';
            newPassInput.type = 'password';
        }
        if (confPassInput) {
            confPassInput.value = '';
            confPassInput.type = 'password';
        }

        // Reset Icons
        const newIcon = document.getElementById('securityNewPasswordIcon');
        const confIcon = document.getElementById('securityConfirmPasswordIcon');
        if (newIcon) newIcon.textContent = 'visibility_off';
        if (confIcon) confIcon.textContent = 'visibility_off';

        const modal = document.getElementById('securityModal');
        if (modal) modal.style.display = 'block';
    },

    closeSecurityModal() {
        const modal = document.getElementById('securityModal');
        if (modal) modal.style.display = 'none';
    },

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(inputId + 'Icon');
        if (!input || !icon) return;

        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility_off';
        }
    },

    async changePassword() {
        const btn = document.getElementById('securitySaveBtn');
        const newPass = document.getElementById('securityNewPassword')?.value;
        const confPass = document.getElementById('securityConfirmPassword')?.value;

        if (!newPass || !confPass) {
            this.showToast('Por favor, completa ambos campos de contraseña', 'warning');
            return;
        }

        if (newPass !== confPass) {
            this.showToast('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        if (newPass.length < 6) {
            this.showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span class="material-icons rotating" style="font-size: 20px;">sync</span> Actualizando...`;
            }

            const { data, error } = await window.supabaseClient.auth.updateUser({
                password: newPass
            });

            if (error) {
                console.error('Password Update Error:', error);
                this.showToast(error.message || 'Error al actualizar tu clave', 'error');
            } else {
                this.showToast('Contraseña actualizada con éxito', 'success');
                this.closeSecurityModal();
            }

        } catch (error) {
            console.error('Exception upading password:', error);
            this.showToast('Error inesperado al conectar con Supabase', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<span class="material-icons" style="font-size: 20px;">lock_reset</span> Actualizar Contraseña`;
            }
        }
    },

    // ==========================================
    // PREFERENCES MODAL (Language & Region)
    // ==========================================
    async openPreferencesModal() {
        if (!this.currentUser || !this.currentUser.id) {
            this.showToast('Inicia sesión para gestionar tus preferencias', 'error');
            return;
        }

        const modal = document.getElementById('preferencesModal');
        if (!modal) return;

        // Fetch from Supabase config
        try {
            const { data, error } = await window.supabaseClient
                .from('user_settings')
                .select('language, region')
                .eq('user_id', this.currentUser.id)
                .single();

            const langSelect = document.getElementById('prefLanguage');
            const regionSelect = document.getElementById('prefRegion');

            if (data && !error) {
                if (langSelect && data.language) langSelect.value = data.language;
                if (regionSelect && data.region) regionSelect.value = data.region;
            } else {
                // Set default values if no row exists or error
                if (langSelect) langSelect.value = 'es';
                if (regionSelect) regionSelect.value = 'America/Lima';
            }
        } catch (e) {
            console.error('Error fetching preferences', e);
        }

        modal.style.display = 'block';
    },

    closePreferencesModal() {
        const modal = document.getElementById('preferencesModal');
        if (modal) modal.style.display = 'none';
    },

    async savePreferences() {
        if (!this.currentUser || !this.currentUser.id) return;

        const langVal = document.getElementById('prefLanguage')?.value || 'es';
        const regionVal = document.getElementById('prefRegion')?.value || 'America/Lima';

        const btn = document.querySelector('#preferencesModal button:last-of-type');
        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<span class="material-icons rotating" style="font-size: 20px;">sync</span> Guardando...`;
            }

            const { error } = await window.supabaseClient
                .from('user_settings')
                .upsert({
                    user_id: this.currentUser.id,
                    language: langVal,
                    region: regionVal,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;

            this.showToast('Preferencias actualizadas con éxito', 'success');
            this.closePreferencesModal();
        } catch (e) {
            console.error('Error saving settings:', e);
            this.showToast('Error al guardar. Probablemente falten las columnas correspondientes en base de datos.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<span class="material-icons" style="font-size: 20px;">save</span> Guardar Preferencias`;
            }
        }
    },

    // ==========================================
    // APARIENCIA (Dark Mode)
    // ==========================================
    async toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        const statusText = document.getElementById('darkModeStatusText');
        if (statusText) {
            statusText.textContent = isDark ? 'Modo oscuro' : 'Modo claro';
        }

        if (this.currentUser && this.currentUser.id) {
            try {
                // Se asume que existirá la columna is_dark_mode en user_settings
                await window.supabaseClient.from('user_settings').upsert({
                    user_id: this.currentUser.id,
                    is_dark_mode: isDark,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            } catch (e) {
                console.error('Error saving dark mode preference:', e);
            }
        }
    }
});
setTimeout(() => { if (typeof app !== 'undefined' && app.initStitchViews) app.initStitchViews(); }, 500);
