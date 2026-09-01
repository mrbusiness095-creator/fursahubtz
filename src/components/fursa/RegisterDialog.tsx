import { Link } from "@tanstack/react-router";

export function RegisterDialog({
  open,
  onClose,
  title,
  message,
  backLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  backLabel: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-float">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-3xl">
          🔒
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <Link
          to="/register"
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-green px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-card"
        >
          👤 Jisajili Sasa
        </Link>
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-foreground"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
