import { useEffect, useCallback, useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CustomAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
  variant?: 'default' | 'danger';
}

export default function CustomAlertDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Continue",
  onConfirm,
  variant = 'default'
}: CustomAlertDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match the duration of the fade-out animation
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handle Escape key and body overflow
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle confirm button click
  const handleConfirm = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  }, [onConfirm, onClose]);

  // Don't render if the dialog shouldn't be visible
  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/80",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          isAnimating ? 'opacity-100' : 'opacity-0',
          "transition-opacity duration-200"
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Dialog Content */}
      <div 
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
          "border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 id="dialog-title" className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p id="dialog-description" className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}