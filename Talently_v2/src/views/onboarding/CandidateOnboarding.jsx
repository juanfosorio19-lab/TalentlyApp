// src/views/onboarding/CandidateOnboarding.jsx
// Container principal del onboarding candidato — 12 pasos reales.
// Pasos fantasma (5, 7, 10, 13 originales) NO existen aquí.
import useOnboardingCandidate from '../../hooks/useOnboardingCandidate';
import './onboarding.css';

// Step components
import Step1_TipoPerfil from './candidate/Step1_TipoPerfil';
import Step2_DatosPersonales from './candidate/Step2_DatosPersonales';
import Step3_Modalidad from './candidate/Step3_Modalidad';
import Step4_CampoProfesional from './candidate/Step4_CampoProfesional';
import Step5_Educacion from './candidate/Step5_Educacion';
import Step6_Experiencia from './candidate/Step6_Experiencia';
import Step7_Disponibilidad from './candidate/Step7_Disponibilidad';
import Step8_Habilidades from './candidate/Step8_Habilidades';
import Step9_Idiomas from './candidate/Step9_Idiomas';
import Step10_Multimedia from './candidate/Step10_Multimedia';
import Step11_Intereses from './candidate/Step11_Intereses';
import Step12_Final from './candidate/Step12_Final';

const STEP_COMPONENTS = {
    1: Step1_TipoPerfil,
    2: Step2_DatosPersonales,
    3: Step3_Modalidad,
    4: Step4_CampoProfesional,
    5: Step5_Educacion,
    6: Step6_Experiencia,
    7: Step7_Disponibilidad,
    8: Step8_Habilidades,
    9: Step9_Idiomas,
    10: Step10_Multimedia,
    11: Step11_Intereses,
    12: Step12_Final,
};

export default function CandidateOnboarding() {
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
    } = useOnboardingCandidate();

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
            {currentStep < totalSteps && (
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
