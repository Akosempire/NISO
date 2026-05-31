import { create } from 'zustand';

export type ToastKind = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  description?: string;
  durationMs?: number;
}

interface ToastStore {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;
const nextId = () => `toast-${Date.now()}-${counter++}`;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = nextId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    return id;
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  clear: () => set({ toasts: [] })
}));

export const toast = {
  show: (message: string, opts: Partial<Toast> = {}) =>
    useToastStore.getState().show({ kind: opts.kind || 'info', message, ...opts }),
  info: (message: string, description?: string) =>
    useToastStore.getState().show({ kind: 'info', message, description }),
  success: (message: string, description?: string) =>
    useToastStore.getState().show({ kind: 'success', message, description }),
  warning: (message: string, description?: string) =>
    useToastStore.getState().show({ kind: 'warning', message, description }),
  error: (message: string, description?: string) =>
    useToastStore.getState().show({ kind: 'error', message, description, durationMs: 7000 }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
  clear: () => useToastStore.getState().clear()
};
