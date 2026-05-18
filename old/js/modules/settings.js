// ============================================
// MÓDULO: Settings
// Talently — js/modules/settings.js
// Depende de: app-core.js (debe cargarse antes)
// Métodos: FAQ, soporte, privacidad, seguridad,
//          preferencias, notificaciones, dark mode
// ============================================

Object.assign(app, {

    toggleFAQ(id) {
        const item = document.getElementById(id);
        if (!item) return;
        const content = item.querySelector('.faq-content');
        const icon = item.querySelector('.faq-icon');
        if (!content || !icon) return;

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
        } else {
            content.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        }
    },

    openFAQCategory(categoryId) {
        const modal = document.getElementById('faqCategoryFullScreen');
        if (!modal) return;

        const titleEl = document.getElementById('faqCategoryTitle');
        const subtitleEl = document.getElementById('faqCategorySubtitle');
        const listEl = document.getElementById('faqCategoryList');

        if (titleEl) titleEl.textContent = 'Cargando...';
        if (subtitleEl) subtitleEl.textContent = '';
        if (listEl) listEl.innerHTML = '';

        modal.style.display = 'block';

        const mockCategories = {
            '11111111-1111-1111-1111-111111111111': {
                title: 'Mi Perfil',
                subtitle: 'Todo lo que necesitas saber sobre tu información profesional',
                faqs: [
                    { q: '¿Cómo edito mi experiencia laboral?', a: 'Ve a tu perfil tocando el ícono en la esquina inferior derecha. Luego selecciona "Editar Perfil" y baja hasta la sección de Experiencia.' },
                    { q: '¿Puedo ocultar mi perfil a ciertas empresas?', a: 'Sí, contamos con una función de "Bloqueo de Empresas" en la sección de privacidad.' }
                ]
            },
            '22222222-2222-2222-2222-222222222222': {
                title: 'Privacidad',
                subtitle: 'Controla quién puede ver tu información',
                faqs: [
                    { q: '¿Cómo ocultar mi perfil?', a: 'Ve a Configuración -> Privacidad y desactiva "Perfil Público".' }
                ]
            },
            '33333333-3333-3333-3333-333333333333': {
                title: 'Mensajes',
                subtitle: 'Todo sobre tus chats y matches',
                faqs: [
                    { q: 'No recibo notificaciones', a: 'Ve a Configuración y asegúrate de tener las notificaciones activadas.' }
                ]
            },
            '44444444-4444-4444-4444-444444444444': {
                title: 'Empresas',
                subtitle: 'Información general de empresas en Talently',
                faqs: [
                    { q: '¿Qué ven las empresas?', a: 'Ven tu biografía, experiencia y habilidades. No verán tu email sin tu permiso.' }
                ]
            }
        };

        const cat = mockCategories[categoryId];
        if (cat) {
            if (titleEl) titleEl.textContent = cat.title;
            if (subtitleEl) subtitleEl.textContent = cat.subtitle;
            if (listEl) {
                listEl.innerHTML = cat.faqs.map((faq, i) => `
                    <details class="group bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-transparent overflow-hidden">
                        <summary class="flex items-center justify-between p-4 cursor-pointer list-none">
                            <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">${faq.q}</span>
                            <span class="material-icons text-slate-400 group-open:rotate-180 transition-transform text-xl">keyboard_arrow_down</span>
                        </summary>
                        <div class="px-4 pb-4">
                            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">${faq.a}</p>
                        </div>
                    </details>
                `).join('');
            }
        }
    },

    closeFAQCategory() {
        const modal = document.getElementById('faqCategoryFullScreen');
        if (modal) modal.style.display = 'none';
    },

    openSupportChat() {
        const phoneNumber = "1234567890"; // Reemplazar con el número real de soporte
        const text = encodeURIComponent("Hola, necesito soporte con mi cuenta de Talently.");
        window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
    },

    // --- SETTINGS MODAL (candidato + empresa) ---
    closeSettingsModal() {
        // Cerrar candidate view
        const candidateView = document.getElementById('settingsView');
        if (candidateView) {
            candidateView.style.transform = 'translateX(-50%) translateY(100%)';
        }

        // Cerrar company settings view
        const companySettingsView = document.getElementById('companySettingsView');
        if (companySettingsView) {
            companySettingsView.style.transform = 'translateX(-50%) translateY(100%)';
        }

        // Cerrar old company modal (legacy)
        const companyModal = document.getElementById('settingsModal');
        if (companyModal) {
            companyModal.style.display = 'none';
            companyModal.style.opacity = '0';
        }
    },

    // --- SETTINGS FULL SCREEN ---
    closeSettingsFullScreen() {
        const modal = document.getElementById('settingsFullScreen');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    // --- SUPPORT FULL SCREEN ---
    openSupport() {
        const modal = document.getElementById('supportFullScreen');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            const supportEmailInput = document.getElementById('supportEmail');
            if (supportEmailInput && this.currentUser && this.currentUser.email) {
                supportEmailInput.value = this.currentUser.email;
            }
        }
    },

    closeSupport() {
        const modal = document.getElementById('supportFullScreen');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    async submitSupportRequest() {
        const email = document.getElementById('supportEmail')?.value?.trim();
        const subject = document.getElementById('supportSubject')?.value;
        const message = document.getElementById('supportMessage')?.value?.trim();

        if (!email || !subject || !message) {
            this.showToast('Por favor, completa todos los campos', 'error');
            return;
        }

        try {
            const { error } = await supabaseClient.from('support_tickets').insert([{
                user_id: this.currentUser?.id,
                email: email,
                subject: subject,
                message: message
            }]);

            if (error) throw error;

            this.showToast('Consulta enviada con éxito');
            document.getElementById('supportSubject').value = '';
            document.getElementById('supportMessage').value = '';
            this.closeSupport();

        } catch (err) {
            console.error('Error submitting support ticket:', err);
            this.showToast('Error al enviar la consulta. Inténtalo de nuevo.', 'error');
        }
    },

    // --- PRIVACY FULL SCREEN ---
    openPrivacy() {
        const modal = document.getElementById('privacyFullScreen');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    },

    closePrivacy() {
        const modal = document.getElementById('privacyFullScreen');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    },

    exportPrivateData() {
        this.showToast('Generando archivo de exportación de datos...');
        setTimeout(() => {
            this.showToast('Se ha enviado un enlace de descarga a tu correo.');
        }, 2000);
    },

    requestAccountDeletion() {
        if (confirm('¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.')) {
            this.showToast('Procesando solicitud de eliminación...');
            setTimeout(() => {
                this.logout();
            }, 1500);
        }
    },

    // --- TOGGLE SETTINGS (notificaciones) ---
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

        const newValue = !this.currentSettings[field];
        this.currentSettings[field] = newValue;

        this.updateToggleVisual(toggleId, newValue);

        const txtEl = document.getElementById(textId);
        if (txtEl) txtEl.textContent = newValue ? 'Activado' : 'Desactivado';

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
            toggleEl.style.background = '#1392ec';
            circle.style.transform = 'translateX(24px)';
        } else {
            toggleEl.style.background = '#e5e7eb';
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

        const newPassInput = document.getElementById('securityNewPassword');
        const confPassInput = document.getElementById('securityConfirmPassword');
        if (newPassInput) { newPassInput.value = ''; newPassInput.type = 'password'; }
        if (confPassInput) { confPassInput.value = ''; confPassInput.type = 'password'; }

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

            const { data, error } = await window.supabaseClient.auth.updateUser({ password: newPass });

            if (error) {
                this.showToast(error.message || 'Error al actualizar tu clave', 'error');
            } else {
                this.showToast('Contraseña actualizada con éxito', 'success');
                this.closeSecurityModal();
            }

        } catch (error) {
            console.error('Exception updating password:', error);
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
    // DARK MODE
    // ==========================================
    async toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('talently_dark_mode', isDark);

        const statusText = document.getElementById('darkModeStatusText');
        if (statusText) {
            statusText.textContent = isDark ? 'Modo oscuro' : 'Modo claro';
        }

        // Actualizar toggles visuales
        const toggle = document.getElementById('darkModeToggleModal');
        if (toggle) toggle.checked = isDark;
        const mainToggle = document.getElementById('settingsDarkModeToggle');
        if (mainToggle) mainToggle.checked = isDark;

        if (this.currentUser && this.currentUser.id) {
            try {
                await window.supabaseClient.from('user_settings').upsert({
                    user_id: this.currentUser.id,
                    is_dark_mode: isDark,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            } catch (e) {
                console.error('Error saving dark mode preference:', e);
            }
        }
    },

});
