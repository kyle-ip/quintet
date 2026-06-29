import { useEffect, useRef, type ReactNode } from "react";
import "./AppModal.css";

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AppModal({
  open,
  onClose,
  title,
  titleId,
  className,
  children,
  footer,
}: AppModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleClose() {
      onClose();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`app-modal${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="app-modal-panel">
        <header className="app-modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="app-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="app-modal-body">{children}</div>
        {footer ? <footer className="app-modal-footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
