import { useEffect } from 'react';

type ShortcutOptions = {
  metaKey?: boolean;  // Cmd on Mac, Ctrl on Windows/Linux
  ctrlKey?: boolean;  // Explicitly Ctrl
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(
  keys: string[], 
  callback: (e: KeyboardEvent) => void, 
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Check modifiers (handle Cmd on Mac and Ctrl on Windows/Linux for metaKey)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const metaKeyPressed = isMac ? event.metaKey : event.ctrlKey;

      if (options.metaKey && !metaKeyPressed) return;
      if (options.ctrlKey && !event.ctrlKey) return;
      if (options.shiftKey && !event.shiftKey) return;
      if (options.altKey && !event.altKey) return;

      // Prevent triggering if user is typing in an input/textarea (unless they hit Escape or Enter)
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isTyping && keys[0] !== 'Escape' && keys[0] !== 'Enter') return;

      // 2. Check the actual key
      const key = event.key.toLowerCase();
      if (keys.map(k => k.toLowerCase()).includes(key)) {
        if (options.preventDefault !== false) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, options]);
}