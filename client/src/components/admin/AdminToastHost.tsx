import { useEffect, useState } from "react";
import {
  subscribeAdminToast,
  type AdminToastPayload,
} from "../../utils/adminToast";

export default function AdminToastHost() {
  const [toast, setToast] = useState<AdminToastPayload | null>(null);

  useEffect(() => subscribeAdminToast(setToast), []);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-5 right-5 z-[200] max-w-sm pointer-events-none"
    >
      <div
        className={`rounded-xl border px-4 py-3 shadow-2xl ${
          isSuccess
            ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-100"
            : "border-red-500/40 bg-red-950/95 text-red-100"
        }`}
      >
        <p className="text-sm font-semibold">{isSuccess ? "Success" : "Error"}</p>
        <p className="text-sm mt-0.5">{toast.message}</p>
      </div>
    </div>
  );
}
