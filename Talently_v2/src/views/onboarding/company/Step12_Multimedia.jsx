// Company Step 12 — Multimedia: logo + fotos de equipo/oficina
// companyBanner NO se sube aquí — vive exclusivamente en Settings.
import { useState, useRef } from 'react';
import { UPLOAD_LIMITS } from '../../../lib/constants';

const MAX_PHOTOS = 5;

export default function Step12_Multimedia({ data, onNext, saving, uploadFile }) {
    const [logo, setLogo] = useState(data.company_logo || '');
    const [photos, setPhotos] = useState(data.company_photos || []);
    const [uploading, setUploading] = useState(''); // 'logo' | 'photos' | ''
    const [error, setError] = useState('');

    const logoRef = useRef(null);
    const photosRef = useRef(null);

    // ── Logo ──
    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Solo imágenes (JPG, PNG, WebP)'); return; }
        if (file.size > UPLOAD_LIMITS.image.maxSize) { setError('El logo no puede superar 5 MB'); return; }
        setError('');
        setUploading('logo');
        try {
            const url = await uploadFile(file, 'image');
            if (url) setLogo(url);
            else setError('Error al subir el logo. Intenta de nuevo.');
        } catch { setError('Error al subir el logo.'); }
        finally { setUploading(''); e.target.value = ''; }
    };

    // ── Fotos ──
    const handlePhotosUpload = async (e) => {
        const typeFiltered = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
        const files = typeFiltered.filter((f) => f.size <= UPLOAD_LIMITS.image.maxSize);
        if (typeFiltered.length > files.length) setError('Algunas imágenes superan 5 MB y fueron omitidas');
        if (files.length === 0) return;
        const available = MAX_PHOTOS - photos.length;
        if (available <= 0) return;
        setError('');
        setUploading('photos');
        try {
            const urls = [];
            for (const file of files.slice(0, available)) {
                const url = await uploadFile(file, 'image');
                if (url) urls.push(url);
            }
            setPhotos((prev) => [...prev, ...urls]);
        } catch { setError('Error al subir fotos.'); }
        finally { setUploading(''); e.target.value = ''; }
    };

    const removePhoto = (index) => setPhotos((prev) => prev.filter((_, i) => i !== index));

    const handleNext = () => {
        onNext({ company_logo: logo, company_photos: photos });
    };

    const atMaxPhotos = photos.length >= MAX_PHOTOS;
    const emptySlots = Math.max(0, MAX_PHOTOS - photos.length);

    return (
        <>
            <h2 className="ob-title">
                Agrega la imagen de tu{' '}
                <span style={{ color: 'var(--primary)' }}>empresa</span>
            </h2>
            <p className="ob-subtitle">
                Sube tu logo y fotos del equipo u oficina. Las empresas con al menos 3 fotos reciben <strong>4x más matches</strong>.
            </p>

            <div className="ob-content">
                {/* ── Logo ── */}
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Logo de la empresa</label>
                        <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: 'var(--text-secondary)',
                            background: 'var(--bg)',
                            padding: '3px 8px', borderRadius: 6,
                            border: '1px solid var(--border)',
                        }}>
                            Requerido
                        </span>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={logoRef}
                        style={{ display: 'none' }}
                        onChange={handleLogoUpload}
                    />

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 20,
                        padding: 16, borderRadius: 16,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                    }}>
                        {/* Círculo upload */}
                        <div
                            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                            onClick={() => logoRef.current?.click()}
                        >
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: 'var(--bg)',
                                border: `2px dashed ${logo ? 'var(--success)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden',
                                transition: 'border-color 0.2s ease',
                            }}>
                                {logo ? (
                                    <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : uploading === 'logo' ? (
                                    <span className="material-symbols-rounded" style={{ fontSize: 28, color: 'var(--primary)' }}>hourglass_top</span>
                                ) : (
                                    <span className="material-symbols-rounded" style={{ fontSize: 28, color: 'var(--text-muted)' }}>add_a_photo</span>
                                )}
                            </div>
                            {/* Edit overlay */}
                            <div style={{
                                position: 'absolute', bottom: -2, right: -2,
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'var(--primary)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--surface)',
                            }}>
                                <span className="material-symbols-rounded" style={{ fontSize: 12 }}>edit</span>
                            </div>
                        </div>

                        {/* Texto */}
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {uploading === 'logo' ? 'Subiendo…' : logo ? 'Cambiar logo' : 'Subir logo'}
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                Formato: PNG, JPG — Recomendado fondo transparente
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0' }} />

                {/* ── Fotos del equipo ── */}
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Vida en la empresa</label>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {photos.length} / {MAX_PHOTOS}
                        </span>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={photosRef}
                        style={{ display: 'none' }}
                        onChange={handlePhotosUpload}
                    />

                    {/* Grid fotos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {/* Fotos existentes */}
                        {photos.map((url, i) => (
                            <div key={url} style={{ position: 'relative', paddingBottom: '75%', borderRadius: 16, overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', inset: 0 }}>
                                    <img
                                        src={url}
                                        alt={`Foto ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    {/* Close overlay */}
                                    <button
                                        onClick={() => removePhoto(i)}
                                        aria-label="Eliminar foto"
                                        style={{
                                            position: 'absolute', top: 8, right: 8,
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(4px)',
                                            border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-primary)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                    >
                                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Slots vacíos */}
                        {!atMaxPhotos && Array.from({ length: emptySlots }).map((_, i) => (
                            <button
                                key={`empty-${i}`}
                                onClick={() => photosRef.current?.click()}
                                disabled={uploading === 'photos'}
                                style={{
                                    paddingBottom: '75%',
                                    position: 'relative',
                                    borderRadius: 16,
                                    background: 'var(--bg)',
                                    border: '2px dashed var(--border)',
                                    cursor: uploading === 'photos' ? 'not-allowed' : 'pointer',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease, background 0.2s ease',
                                }}
                            >
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: 'var(--surface)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: '1px solid var(--border)',
                                    }}>
                                        <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'var(--text-muted)' }}>
                                            {uploading === 'photos' && i === 0 ? 'hourglass_top' : 'add'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                                        + Agregar foto
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tip */}
                    <p style={{
                        marginTop: 12, fontSize: 12, textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'var(--bg)',
                        padding: '8px 12px', borderRadius: 8,
                        border: '1px solid var(--border)',
                    }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Tip:</strong>{' '}
                        Muestra tu workspace, eventos del equipo o beneficios de la empresa.
                    </p>
                </div>

                {error && (
                    <div className="ob-error">
                        <span className="material-symbols-rounded">error</span>
                        {error}
                    </div>
                )}
            </div>

            <div className="ob-nav">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    onClick={handleNext}
                    disabled={saving || !!uploading}
                >
                    {saving ? 'Finalizando…' : uploading ? 'Subiendo…' : 'Finalizar'}
                    <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                </button>
            </div>
        </>
    );
}
