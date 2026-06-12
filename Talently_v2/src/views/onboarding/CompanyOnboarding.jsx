// src/views/onboarding/CompanyOnboarding.jsx
// Container del onboarding empresa — 11 pasos reales.
// La selección de tipo (candidato/empresa) NO es un paso de este wizard:
// vive solo en el paso 1 del wizard de candidato (pantalla duplicada
// eliminada el 2026-06-11). Los archivos conservan su nombre StepN_ viejo;
// el número real del paso es la key de STEP_COMPONENTS.
// companyBanner NO se implementa aquí (vive en Settings).
import { useNavigate } from 'react-router-dom';
import useOnboardingCompany from '../../hooks/useOnboardingCompany';
import './onboarding.css';

import Step2_InfoBasica from './company/Step2_InfoBasica';
import Step3_Detalles from './company/Step3_Detalles';
import Step4_Cultura from './company/Step4_Cultura';
import Step5_EtapaTamano from './company/Step5_EtapaTamano';
import Step6_ModalidadesBeneficios from './company/Step6_ModalidadesBeneficios';
import Step7_PosicionesSeniority from './company/Step7_PosicionesSeniority';
import Step9_ProcesoSeleccion from './company/Step9_ProcesoSeleccion';
import Step10_Unicidad from './company/Step10_Unicidad';
import Step11_Tags from './company/Step11_Tags';
import Step12_Multimedia from './company/Step12_Multimedia';

// El stack tecnológico NO se pregunta en el onboarding: solo aplica a
// empresas TI y se pide al crear una oferta de área tecnológica
// (decisión 2026-06-11 — una constructora no debería responder esto).
const STEP_COMPONENTS = {
    1: Step2_InfoBasica,
    2: Step3_Detalles,
    3: Step4_Cultura,
    4: Step5_EtapaTamano,
    5: Step6_ModalidadesBeneficios,
    6: Step7_PosicionesSeniority,
    7: Step9_ProcesoSeleccion,
    8: Step10_Unicidad,
    9: Step11_Tags,
    10: Step12_Multimedia,
};

export default function CompanyOnboarding() {
    const navigate = useNavigate();
    const {
        currentStep,
        formData,
        loading,
        saving,
        saveError,
        totalSteps,
        saveStep,
        goBack,
        completeOnboarding,
        uploadFile,
    } = useOnboardingCompany();

    if (loading) {
        return (
            <div className="ob-screen">
                <div className="ob-loading">
                    <span className="material-symbols-rounded" style={{ fontSize: 32 }}>
                        hourglass_top
                    </span>
                    Cargando tu progreso…
                </div>
            </div>
        );
    }

    const StepComponent = STEP_COMPONENTS[currentStep];
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

    const handleNext = async (stepData) => {
        if (currentStep === totalSteps) {
            // ⚠️ Pasar los datos del ÚLTIMO paso: completeOnboarding usa
            // formData (estado) y sin esto el logo y las fotos del paso
            // final se perdían (bug 2026-06-11)
            await completeOnboarding(stepData);
        } else {
            await saveStep(currentStep, stepData);
        }
    };

    return (
        <div className="ob-screen">
            {/* ── Progress bar ── */}
            <div className="ob-progress">
                <div className="ob-header">
                    {/* Volver desde el paso 1 regresa a la selección de tipo
                        (paso 1 del wizard de candidato) por si se equivocó */}
                    <button
                        className="ob-back-btn"
                        onClick={currentStep > 1 ? goBack : () => navigate('/onboarding/candidate')}
                        aria-label="Volver"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <span className="ob-step-label">Paso {currentStep} de {totalSteps}</span>
                </div>
                <div className="ob-progress-bar">
                    <div
                        className="ob-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* ── Error de guardado (el paso NO avanza si falla el upsert) ── */}
            {saveError && (
                <div className="ob-error" role="alert">
                    <span className="material-symbols-rounded">error</span>
                    {saveError}
                </div>
            )}

            {/* ── Current step ── */}
            {StepComponent && (
                <StepComponent
                    data={formData}
                    onNext={handleNext}
                    onBack={goBack}
                    stepNumber={currentStep}
                    saving={saving}
                    uploadFile={uploadFile}
                />
            )}
        </div>
    );
}
