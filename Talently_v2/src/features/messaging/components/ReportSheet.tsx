// SHT-REPORTE · Reportar (M5, ?sheet=reportar): los 7 motivos tipificados en
// su orden, un TextArea opcional y «Enviar reporte», que se habilita al elegir
// un motivo.
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Stack } from '../../../ui/Layout';
import { RadioGroup } from '../../../ui/Radio';
import { TextArea } from '../../../ui/TextArea';
import { copy } from '../copy';

export const screenId = 'SHT-REPORTE';

const REASONS = copy.report.reasons.map((r) => ({ value: r, label: r }));

interface ReportSheetProps {
    open: boolean;
    onClose: () => void;
    /** Recibe el motivo y el detalle (puede ir vacío). */
    onSend: (reason: string, details: string) => void;
}

export function ReportSheet({ open, onClose, onSend }: ReportSheetProps) {
    const [reason, setReason] = useState<string | null>(null);
    const [details, setDetails] = useState('');
    // Cada vez que se abre parte vacía: también si antes se cerró con el atrás del navegador o de Android.
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setReason(null);
            setDetails('');
        }
    }

    const send = () => {
        if (reason) onSend(reason, details.trim());
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.report.title}
            footer={
                <Button size="lg" block disabled={!reason} onClick={send}>
                    {copy.report.send}
                </Button>
            }
        >
            <Stack gap={6} data-screen-id={screenId}>
                <RadioGroup legend={copy.report.legend} options={REASONS} value={reason} onChange={setReason} />
                <TextArea
                    label={copy.report.details}
                    optional
                    maxLength={500}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                />
            </Stack>
        </BottomSheet>
    );
}
