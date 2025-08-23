import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants';

interface UseKeyboardShortcutsProps {
  onOpenCommandPalette?: () => void;
  onCreateCommand?: () => void;
  onOpenSettings?: () => void;
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onCreateCommand,
  onOpenSettings,
}: UseKeyboardShortcutsProps = {}) {
  
  useHotkeys(KEYBOARD_SHORTCUTS.COMMAND_PALETTE, useCallback(() => {
    onOpenCommandPalette?.();
  }, [onOpenCommandPalette]), {
    preventDefault: true,
    enableOnContentEditable: true,
  });
  
  useHotkeys(KEYBOARD_SHORTCUTS.NEW_COMMAND, useCallback(() => {
    onCreateCommand?.();
  }, [onCreateCommand]), {
    preventDefault: true,
    enableOnContentEditable: true,
  });
  
  useHotkeys(KEYBOARD_SHORTCUTS.SETTINGS, useCallback(() => {
    onOpenSettings?.();
  }, [onOpenSettings]), {
    preventDefault: true,
    enableOnContentEditable: true,
  });
  
  return {
    shortcuts: KEYBOARD_SHORTCUTS,
  };
}