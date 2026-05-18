// src/views/onboarding/CompanyOnboarding.jsx
// Container del onboarding empresa — 12 pasos reales.
// Pasos fantasma (9, 11 originales) NO existen aquí.
// companyBanner NO se implementa aquí (vive en Settings).
import useOnboardingCompany from '../../hooks/useOnboardingCompany';
import './onboarding.css';

import Step1_TipoPerfil from './company/Step1_TipoPerfil';
import Step2_InfoBasica from './company/Step2_InfoBasica';
import Step3_Detalles from './company/Step3_Detalles';
import Step4_Cultura from './company/Step4_Cultura';
import Step5_EtapaTamano from './company/Step5_EtapaTamano';
import Step6_ModalidadesBeneficios from './company/Step6_ModalidadesBeneficios';
import Step7_PosicionesSeniority from './company/Step7_PosicionesSeniority';
import Step8_Stack from './company/Step8_Stack';
import Step9_ProcesoSeleccion from './company/Step9_ProcesoSeleccion';
import Step10_Unicidad from './company/Step10_Unicidad';
import Step11_Tags from './company/Step11_Tags';
import Step12_Multimedia from './company/Step12_Multimedia';

const STEP_COMPONENTS = {
    1: Step1_TipoPerfil,
    2: Step2_InfoBasica,
    3: Step3_Detalles,
    4: Step4_Cultura,
    5: Step5_EtapaTamano,
    6: Step6_ModalidadesBeneficios,
    7: Step7_PosicionesSeniority,
    8: Step8_Stack,
    9: Step9_ProcesoSeleccion,
    10: Step10_Unicidad,
    11: Step11_Tags,
    12: Step12_Multimedia,
};

export default function CompanyOnboarding() {
    const {
        currentStep,
        formData,
        loading,
        saving,
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
            await completeOnboarding();
        } else {
            await saveStep(currentStep, stepData);
        }
    };

    return (
        <div className="ob-screen">
            {/* ── Progress bar ── */}
            <div className="ob-progress">
                <div className="ob-header">
                    {currentStep > 1 && (
                        <button className="ob-back-btn" onClick={goBack} aria-label="Volver">
                            <span className="material-symbols-rounded">arrow_back</span>
                        </button>
                    )}
                    <span className="ob-step-label">Paso {currentStep} de {totalSteps}</span>
                </div>
                <div className="ob-progress-bar">
                    <div
                        className="ob-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

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
