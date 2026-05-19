export type AdminToastType = "success" | "error";

export interface AdminToastPayload {
  id: number;
  message: string;
  type: AdminToastType;
}

type Listener = (toast: AdminToastPayload | null) => void;

const listeners = new Set<Listener>();
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function notify(toast: AdminToastPayload | null) {
  listeners.forEach((fn) => fn(toast));
}

export function subscribeAdminToast(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showAdminToast(message: string, type: AdminToastType = "success") {
  const text = message.trim();
  if (!text) return;

  if (hideTimer) clearTimeout(hideTimer);

  notify({ id: Date.now(), message: text, type });

  hideTimer = setTimeout(() => {
    notify(null);
    hideTimer = null;
  }, 4200);
}

export function showAdminSaveSuccess(message = "Successfully saved.") {
  showAdminToast(message, "success");
}

export function showAdminRevertSuccess(message = "Successfully reverted.") {
  showAdminToast(message, "success");
}

export function showAdminError(message: string) {
  showAdminToast(message, "error");
}
