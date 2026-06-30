import { AppModal } from "@/components/Modal/AppModal";

const STORAGE_KEY = "quintet-endless-tutorial-seen";

interface EndlessTutorialProps {
  open: boolean;
  onClose: () => void;
}

export function shouldShowEndlessTutorial(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== "1";
}

export function EndlessTutorial({ open, onClose }: EndlessTutorialProps) {
  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  }

  return (
    <AppModal
      open={open}
      onClose={dismiss}
      title="Endless mode"
      titleId="endless-tutorial-title"
      footer={
        <button type="button" className="btn-primary" onClick={dismiss}>
          Got it
        </button>
      }
    >
      <ol className="endless-tutorial-steps">
        <li>Clear consecutive Quintet boards. Each floor has a score target that rises every floor.</li>
        <li>Strong runs face pace targets based on your earlier scores. You have 3 lives; Boss floors every 5 floors.</li>
      </ol>
    </AppModal>
  );
}
