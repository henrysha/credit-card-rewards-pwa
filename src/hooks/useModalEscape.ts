import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface DialogStackEntry {
  id: symbol;
  getDialogEl: () => HTMLElement | null;
  onClose: () => void;
}

const activeDialogStack: DialogStackEntry[] = [];
let lastOutsideFocusedElement: HTMLElement | null = null;

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null
  );
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'focusin',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && !target.closest('.modal-overlay')) {
        lastOutsideFocusedElement = target;
      }
    },
    true
  );

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (activeDialogStack.length === 0) return;
      const topEntry = activeDialogStack[activeDialogStack.length - 1];
      const dialogEl = topEntry.getDialogEl();

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        topEntry.onClose();
        return;
      }

      if (event.key === 'Tab' && dialogEl) {
        const focusables = getFocusableElements(dialogEl);
        if (focusables.length === 0) {
          event.preventDefault();
          dialogEl.focus();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          if (!active || !dialogEl.contains(active) || active === first || active === dialogEl) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (!active || !dialogEl.contains(active) || active === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    },
    true
  );
}

/**
 * Stack-aware modal dialog accessibility hook:
 * - Binds to the specific dialog element via the returned ref
 * - Only the topmost open dialog handles Escape and Tab/Shift+Tab trapping
 * - Restores focus to returnFocusRef (if provided) or the previously focused element (including an underlying dialog control)
 */
export function useModalEscape<T extends HTMLElement = HTMLElement>(
  onClose: () => void,
  isOpen = true,
  returnFocusRef?: RefObject<HTMLElement | null>
) {
  const dialogRef = useRef<T | null>(null);
  const onCloseRef = useRef(onClose);
  const returnFocusRefHolder = useRef(returnFocusRef);

  useEffect(() => {
    onCloseRef.current = onClose;
    returnFocusRefHolder.current = returnFocusRef;
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!isOpen) return;

    const entryId = Symbol('dialog');
    const getDialogEl = (): HTMLElement | null => {
      if (dialogRef.current) return dialogRef.current;
      const overlays = document.querySelectorAll<HTMLElement>('.modal-overlay');
      const lastOverlay = overlays[overlays.length - 1];
      return lastOverlay?.querySelector<HTMLElement>('.modal-content') ?? null;
    };

    const dialogEl = getDialogEl();
    const currentActive = document.activeElement;
    const triggerElement =
      currentActive instanceof HTMLElement &&
      currentActive !== document.body &&
      (!dialogEl || !dialogEl.contains(currentActive))
        ? currentActive
        : lastOutsideFocusedElement;

    activeDialogStack.push({
      id: entryId,
      getDialogEl,
      onClose: () => onCloseRef.current(),
    });

    if (dialogEl) {
      if (!dialogEl.hasAttribute('tabindex')) {
        dialogEl.setAttribute('tabindex', '-1');
      }
      if (!dialogEl.contains(document.activeElement)) {
        const preferred = dialogEl.querySelector<HTMLElement>('[data-autofocus="true"]');
        const focusables = getFocusableElements(dialogEl);
        const initialTarget = preferred ?? focusables[0] ?? dialogEl;
        initialTarget.focus();
      }
    }

    return () => {
      const idx = activeDialogStack.findIndex((entry) => entry.id === entryId);
      if (idx !== -1) {
        activeDialogStack.splice(idx, 1);
      }

      const explicitTarget = returnFocusRefHolder.current?.current;
      if (explicitTarget && typeof explicitTarget.focus === 'function' && document.contains(explicitTarget)) {
        explicitTarget.focus();
        return;
      }

      if (triggerElement && typeof triggerElement.focus === 'function' && document.contains(triggerElement)) {
        triggerElement.focus();
      }
    };
  }, [isOpen]);

  return dialogRef;
}
