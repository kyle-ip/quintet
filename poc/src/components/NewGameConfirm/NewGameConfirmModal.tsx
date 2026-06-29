import { AppModal } from "@/components/Modal/AppModal";

interface NewGameConfirmModalProps {
  open: boolean;
  hasProgress: boolean;
  isFinished: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function NewGameConfirmModal({
  open,
  hasProgress,
  isFinished,
  onConfirm,
  onClose,
}: NewGameConfirmModalProps) {
  let message = "Deal a fresh board and reset your score.";
  if (hasProgress && isFinished) {
    message = "Start a new game? Your completed score and board will be cleared.";
  } else if (hasProgress) {
    message =
      "You have a game in progress. Starting a new game will discard your current board and score.";
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Start new game?"
      titleId="new-game-title"
      className="new-game-modal"
      footer={
        <>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            New game
          </button>
        </>
      }
    >
      <p>{message}</p>
    </AppModal>
  );
}
