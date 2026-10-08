/** Une nombres de clase e ignora los falsos (`cx('tl-btn', loading && 'is-loading')`). */
export function cx(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(' ');
}
