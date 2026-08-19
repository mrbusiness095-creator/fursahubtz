import { Download } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "./useInstallPrompt";

export function InstallAppButton() {
  const { promptInstall, canPrompt, isInstalled } = useInstallPrompt();

  if (isInstalled) return null;

  const handleClick = async () => {
    if (!canPrompt) {
      // iOS / Safari fallback: guide the user to use the Share sheet.
      toast.info("Kufunga FursaHub:", {
        description: "Gusa 'Share' kwenye browser yako, kisha chagua 'Add to Home Screen'.",
      });
      return;
    }
    const accepted = await promptInstall();
    if (accepted) {
      toast.success("FursaHub inafungwa", {
        description: "Asante! App imefanikiwa kufungwa kwenye simu yako.",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Download FursaHub App"
      className="fixed left-3 bottom-24 z-40 flex animate-bounce-down items-center gap-2 rounded-full bg-gradient-green px-4 py-2.5 text-sm font-extrabold text-primary-foreground shadow-float ring-2 ring-primary-foreground/30 transition-transform active:scale-95"
    >
      <Download className="h-5 w-5" />
      <span>Download App</span>
    </button>
  );
}
