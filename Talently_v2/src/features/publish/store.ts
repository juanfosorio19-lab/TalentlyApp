// Estado de los asistentes de publicar mientras la app está abierta: el
// borrador de cada actor (lo escrito se conserva al ir y volver entre pasos,
// y «Guardar y salir» lo deja para después), lo recién publicado (PUBL-07) y
// la identidad enviada a revisión al publicar (PUBL-04-identidad → VER-02).
// Solo lo usa este feature; lo que otra pestaña debe ver (la publicación en
// ACT-03, la identidad en VER-01) está pedido para demo/sessionStore.
import { useSyncExternalStore } from 'react';
import type { DemoActorId } from '../demo/session';
import type { HogarDraft } from './model/hogar';
import type { WizardKind } from './model/publisher';
import type { TurnoDraft } from './model/turno';

function createExternal<S>(initial: S) {
    let state = initial;
    const listeners = new Set<() => void>();
    const subscribe = (l: () => void) => {
        listeners.add(l);
        return () => listeners.delete(l);
    };
    const get = () => state;
    function useStore(): S {
        return useSyncExternalStore(subscribe, get, get);
    }
    return {
        get,
        set(next: S) {
            state = next;
            listeners.forEach((l) => l());
        },
        reset() {
            state = initial;
            listeners.forEach((l) => l());
        },
        useStore,
    };
}

// ─── Borradores ─────────────────────────────────────────────────────────────

export interface DraftEntry<T> {
    draft: T;
    /** «Guardar y salir» (o salir hacia VER-02 o Ayuda): se conserva al dejar el asistente. */
    saved: boolean;
    /** Paso desde el que sigue después («Sigues después desde este paso»). */
    savedStep: number;
}

export interface DraftStore<T> {
    get: (actorId: DemoActorId) => DraftEntry<T> | undefined;
    useEntry: (actorId: DemoActorId) => DraftEntry<T> | undefined;
    /** Cambia campos sobre el borrador ACTUAL (no el de la última pintada): dos cambios seguidos no se pisan. */
    patch: (actorId: DemoActorId, initial: T, patch: Partial<T>) => void;
    replace: (actorId: DemoActorId, draft: T) => void;
    save: (actorId: DemoActorId, initial: T, step: number) => void;
    discard: (actorId: DemoActorId) => void;
    reset: () => void;
}

function createDraftStore<T>(): DraftStore<T> {
    const store = createExternal<ReadonlyMap<DemoActorId, DraftEntry<T>>>(new Map());
    const put = (actorId: DemoActorId, entry: DraftEntry<T>) => {
        const next = new Map(store.get());
        next.set(actorId, entry);
        store.set(next);
    };
    const get = (actorId: DemoActorId) => store.get().get(actorId);
    return {
        get,
        useEntry: (actorId) => store.useStore().get(actorId),
        patch(actorId, initial, patch) {
            const prev = get(actorId);
            put(actorId, { draft: { ...(prev?.draft ?? initial), ...patch }, saved: false, savedStep: prev?.savedStep ?? 1 });
        },
        replace(actorId, draft) {
            put(actorId, { draft, saved: false, savedStep: get(actorId)?.savedStep ?? 1 });
        },
        save(actorId, initial, step) {
            put(actorId, { draft: get(actorId)?.draft ?? initial, saved: true, savedStep: step });
        },
        discard(actorId) {
            if (!get(actorId)) return;
            const next = new Map(store.get());
            next.delete(actorId);
            store.set(next);
        },
        reset: store.reset,
    };
}

export const turnoDrafts = createDraftStore<TurnoDraft>();
export const hogarDrafts = createDraftStore<HogarDraft>();

// ─── Lo publicado y la identidad ────────────────────────────────────────────

/** Lo que muestra PUBL-07: sale del borrador al publicar. */
export interface PublishedSummary {
    kind: WizardKind;
    titulo: string;
    /** «hasta el dom 20 dic» (turno). */
    hasta: string | null;
    /** «En revisión» en vez de «Publicada». */
    review: boolean;
}

interface PublishState {
    /** `${actorId}:${kind}` → lo último publicado en esta sesión. */
    published: ReadonlyMap<string, PublishedSummary>;
    /** `${actorId}:${kind}` → tocó «Verificar ahora»: al volver de VER-02, PUBL-07 termina de publicar. */
    awaitingIdentity: ReadonlySet<string>;
}

const INITIAL: PublishState = { published: new Map(), awaitingIdentity: new Set() };
const session = createExternal<PublishState>(INITIAL);

const keyOf = (actorId: DemoActorId, kind: WizardKind) => `${actorId}:${kind}`;

export function markPublished(actorId: DemoActorId, summary: PublishedSummary): void {
    const s = session.get();
    const key = keyOf(actorId, summary.kind);
    const published = new Map(s.published);
    published.set(key, summary);
    const awaitingIdentity = new Set(s.awaitingIdentity);
    awaitingIdentity.delete(key);
    session.set({ ...s, published, awaitingIdentity });
}

/** «Verificar ahora»: el aviso queda guardado y se publica (en revisión) al terminar VER-02. */
export function awaitIdentity(actorId: DemoActorId, kind: WizardKind): void {
    const s = session.get();
    const key = keyOf(actorId, kind);
    if (s.awaitingIdentity.has(key)) return;
    session.set({ ...s, awaitingIdentity: new Set([...s.awaitingIdentity, key]) });
}

export function isAwaitingIdentity(actorId: DemoActorId, kind: WizardKind): boolean {
    return session.get().awaitingIdentity.has(keyOf(actorId, kind));
}

/** Volvió de VER-02 sin enviar (atrás): PUBL-07 ya no termina de publicar por su cuenta. */
export function cancelAwaitIdentity(actorId: DemoActorId, kind: WizardKind): void {
    const s = session.get();
    const key = keyOf(actorId, kind);
    if (!s.awaitingIdentity.has(key)) return;
    const awaitingIdentity = new Set(s.awaitingIdentity);
    awaitingIdentity.delete(key);
    session.set({ ...s, awaitingIdentity });
}

/** Lo publicado en esta sesión, sin React (al montar un asistente). */
export function getPublished(actorId: DemoActorId, kind: WizardKind): PublishedSummary | undefined {
    return session.get().published.get(keyOf(actorId, kind));
}

export function usePublished(actorId: DemoActorId, kind: WizardKind): PublishedSummary | undefined {
    return session.useStore().published.get(keyOf(actorId, kind));
}

export function useAwaitingIdentity(actorId: DemoActorId, kind: WizardKind): boolean {
    return session.useStore().awaitingIdentity.has(keyOf(actorId, kind));
}

/** Solo para pruebas. */
export function resetPublishStore(): void {
    turnoDrafts.reset();
    hogarDrafts.reset();
    session.reset();
}
