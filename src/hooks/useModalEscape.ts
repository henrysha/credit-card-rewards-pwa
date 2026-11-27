import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

let lastOutsideFocusedElement: HTMLElement | null = null;

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
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null
  );
}

/**
 * Manages modal dialog accessibility:
 * - Captures trigger element before initial focus shifts
 * - Moves initial focus inside the dialog when opened
 * - Traps Tab / Shift+Tab focus cycle inside the dialog
 * - Dismisses on Escape and restores focus to the trigger element
 */
export function useModalEscape(onClose: () => void, isOpen = true) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const overlays = document.querySelectorAll<HTMLElement>('.modal-overlay');
    const activeOverlay = overlays[overlays.length - 1] ?? null;
    const dialogEl = activeOverlay?.querySelector<HTMLElement>('.modal-content') ?? null;

    const currentActive = document.activeElement;
    const triggerElement =
      currentActive instanceof HTMLElement && (!activeOverlay || !activeOverlay.contains(currentActive))
        ? currentActive
        : lastOutsideFocusedElement;

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
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
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (triggerElement && typeof triggerElement.focus === 'function' && document.contains(triggerElement)) {
        triggerElement.focus();
      }
    };
  }, [isOpen]);
}
