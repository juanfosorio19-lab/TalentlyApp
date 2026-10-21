// MSG-02b · Compartir certificado de antecedentes (hoja sobre MSG-02): solo lo
// inicia quien trabaja, después del match. Voluntario, lo ve solo esa persona
// durante 7 días y se puede dejar de compartir (spec §10.1.1).
import { useState } from 'react';
import { Avatar, type AvatarKind } from '../../../ui/Avatar';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconDocument, IconUpload } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { OptionGroup } from '../../../ui/OptionCard';
import { copy } from '../copy';

export const sheetId = 'MSG-02b';

type Choice = 'existente' | 'nuevo';

interface CertificateSheetProps {
    open: boolean;
    onClose: () => void;
    /** Quién lo verá: la otra parte de la conversación. */
    peer: { name: string; kind: AvatarKind; initials: string };
    /** «Emitido el 30-11-2026» del que ya subió; sin él, solo «Subir uno nuevo». */
    issued?: string;
    /** «Usar el que ya subí» → la tarjeta entra a la conversación. */
    onShare: () => void;
    /** «Subir uno nuevo»: aún no se suben archivos en la demostración. */
    onUpload: () => void;
}

export function CertificateSheet({ open, onClose, peer, issued, onShare, onUpload }: CertificateSheetProps) {
    const [choice, setChoice] = useState<Choice>(issued ? 'existente' : 'nuevo');
    const options = [
        ...(issued ? [{ value: 'existente' as const, icon: IconDocument, title: copy.share.existing, example: issued }] : []),
        { value: 'nuevo' as const, icon: IconUpload, title: copy.share.upload, example: copy.share.uploadSub },
    ];
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.share.title}
            footer={
                <Button size="lg" block onClick={choice === 'existente' ? onShare : onUpload}>
                    {copy.share.action}
                </Button>
            }
        >
            <Stack gap={6} data-screen-id={sheetId}>
                <Stack gap={4}>
                    <p className="body-l msg-flush">{copy.share.intro}</p>
                    <Stack row gap={3}>
                        <Avatar name={peer.name} kind={peer.kind} initials={peer.initials} size={32} />
                        <span className="body msg-muted">
                            {copy.share.willSee} <strong className="msg-strong">{peer.name}</strong>
                        </span>
                    </Stack>
                </Stack>
                <OptionGroup mode="single" legend={copy.share.legend} legendHidden options={options} value={choice} onChange={setChoice} />
            </Stack>
        </BottomSheet>
    );
}
