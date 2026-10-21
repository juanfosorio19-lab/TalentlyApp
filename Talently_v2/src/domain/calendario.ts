// Archivo .ics de un evento (TUR-01 y MSG-02 «Agregar al calendario»).
// RFC 5545: cada VEVENT lleva UID, DTSTAMP, DTSTART y DTEND; las líneas van
// con CRLF y el texto escapa \ ; , y saltos de línea. Hora local de Chile
// (America/Santiago) sin zona en el valor: el teléfono la interpreta como local.

export interface CalendarEvent {
    /** Identificador estable del evento (id del turno o de la entrevista). */
    uid: string;
    title: string;
    /** «2026-12-12T18:00» (hora local). */
    start: string;
    /** «2026-12-13T00:00». Si termina al día siguiente, va con esa fecha. */
    end: string;
    location?: string;
    description?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** «2026-12-12T18:00» → «20261212T180000». */
function localStamp(value: string): string {
    const [date = '', time = '00:00'] = value.split('T');
    return `${date.replaceAll('-', '')}T${time.replace(':', '').padEnd(4, '0')}00`;
}

/** Ahora en UTC: «20261210T130000Z». */
function utcStamp(now: Date): string {
    return (
        `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
        `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
    );
}

function escapeText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Corta las líneas de más de 75 octetos (RFC 5545 §3.1). */
function fold(line: string): string {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const parts: string[] = [];
    let current = '';
    for (const ch of line) {
        if (new TextEncoder().encode(current + ch).length > (parts.length ? 74 : 75)) {
            parts.push(current);
            current = ch;
        } else {
            current += ch;
        }
    }
    parts.push(current);
    return parts.join('\r\n ');
}

export function buildIcs(event: CalendarEvent, now: Date = new Date()): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Talently//Agenda//ES',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${event.uid}@talently.app`,
        `DTSTAMP:${utcStamp(now)}`,
        `DTSTART:${localStamp(event.start)}`,
        `DTEND:${localStamp(event.end)}`,
        `SUMMARY:${escapeText(event.title)}`,
        ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
        ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
        'END:VEVENT',
        'END:VCALENDAR',
    ];
    return lines.map(fold).join('\r\n') + '\r\n';
}
