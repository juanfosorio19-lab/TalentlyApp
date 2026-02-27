const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf-8');

if (!indexHtml.includes('cdn.tailwindcss.com')) {
    const tailwindScript = `
    <!-- TAILWIND CSS FOR STITCH VIEWS -->
    <script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
    <script>
        tailwind.config = {
            corePlugins: { preflight: false },
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#4F46E5",
                        "primary-dark": "#2563EB",
                        "accent": "#F43F5E",
                        "background-light": "#F3F4F6",
                        "background-dark": "#111827",
                        "card-light": "#FFFFFF",
                        "card-dark": "#1F2937",
                        "text-main-light": "#111827",
                        "text-main-dark": "#F9FAFB",
                        "text-sub-light": "#6B7280",
                        "text-sub-dark": "#9CA3AF",
                        "reject": "#EF4444",
                        "like": "#10B981",
                        "surface-light": "#FFFFFF",
                        "surface-dark": "#1F2937",
                        "text-light": "#1F2937",
                        "text-dark": "#F9FAFB",
                    },
                    fontFamily: {
                        display: ["Inter", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "1rem", "xl": "1.5rem", "2xl": "2rem", "3xl": "32px",
                    },
                    boxShadow: {
                        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    },
                    animation: {
                        'bounce-slow': 'bounce 2s infinite',
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'pop-in': 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                    },
                    keyframes: {
                        popIn: {
                            '0%': { opacity: '0', transform: 'scale(0.5)' },
                            '100%': { opacity: '1', transform: 'scale(1)' },
                        }
                    }
                },
            },
        };
    </script>
    <style>
        .match-gradient-text { background: linear-gradient(to right, #3B82F6, #F43F5E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .avatar-glow { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        .dark .avatar-glow { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
        .confetti-bg { background-image: radial-gradient(#F43F5E 2px, transparent 2.5px), radial-gradient(#3B82F6 2px, transparent 2.5px), radial-gradient(#10B981 2px, transparent 2.5px); background-size: 40px 40px; background-position: 0 0, 20px 20px, 10px 30px; opacity: 0.2; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-area-top { padding-top: env(safe-area-inset-top, 20px); }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .card-stack { position: relative; height: 100%; width: 100%; }
        .card-item { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: transform 0.3s ease, opacity 0.3s ease; }
        .card-item:nth-child(1) { z-index: 3; transform: scale(1) translateY(0); }
        .card-item:nth-child(2) { z-index: 2; transform: scale(0.95) translateY(12px); opacity: 0.8; }
        .card-item:nth-child(3) { z-index: 1; transform: scale(0.90) translateY(24px); opacity: 0.6; }
    </style>
`;
    indexHtml = indexHtml.replace('</head>', tailwindScript + '\n</head>');
}

const swipeHtmlRaw = fs.readFileSync('stitch_swipe.html', 'utf-8');
const swipeBodyMatch = swipeHtmlRaw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let swipeBody = swipeBodyMatch ? swipeBodyMatch[1] : '';
swipeBody = swipeBody.replace(/<script>[\s\S]*?<\/script>/gi, '');
swipeBody = swipeBody.replace(/id="detailModal"/g, 'id="candidateDetailModal"');

const companySwipeView = `\n    <!-- ===== COMPANY SWIPE VIEW ===== -->\n    <div id="companySwipeView" class="view" style="width:100%; height:100vh; overflow:hidden; background:var(--bg);">\n      <div class="font-display bg-background-light dark:bg-background-dark h-full w-full overflow-hidden flex flex-col antialiased transition-colors duration-200">\n${swipeBody}\n      </div>\n    </div>\n`;

const overlayHtmlRaw = fs.readFileSync('stitch_overlay.html', 'utf-8');
const overlayBodyMatch = overlayHtmlRaw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let overlayBody = overlayBodyMatch ? overlayBodyMatch[1] : '';
overlayBody = overlayBody.replace(/<script>[\s\S]*?<\/script>/gi, '');

const matchSuccessOverlay = `\n    <!-- ===== MATCH SUCCESS OVERLAY ===== -->\n    <div id="matchSuccessOverlay" class="view" style="position:fixed; inset:0; z-index:2000; display:none; flex-direction:column; background:rgba(0,0,0,0.5);">\n      <div class="font-display bg-background-light dark:bg-background-dark h-full w-full overflow-hidden flex items-center justify-center relative">\n${overlayBody}\n      </div>\n    </div>\n`;

if (!indexHtml.includes('id="companySwipeView"')) {
    indexHtml = indexHtml.replace('<script src="js/supabase-client.js"></script>', companySwipeView + matchSuccessOverlay + '\n    <script src="js/supabase-client.js"></script>');
    fs.writeFileSync('index.html', indexHtml);
    console.log("Successfully injected views.");
} else {
    console.log("Views already injected.");
}
