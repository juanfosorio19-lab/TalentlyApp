const fs = require('fs');
const logic = `
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
    }
});
setTimeout(() => { if (typeof app !== 'undefined' && app.initStitchViews) app.initStitchViews(); }, 500);
`;
let content = fs.readFileSync('js/app_fixed.js', 'utf8');
if (!content.includes('initStitchViews')) {
    fs.writeFileSync('js/app_fixed.js', content + '\n' + logic);
    console.log('App logic injected');
} else {
    console.log('Logic already injected');
}
