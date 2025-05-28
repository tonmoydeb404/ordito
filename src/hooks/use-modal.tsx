import { useCallback, useState } from "react";

export function useModal<T = undefined>(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((payload?: T) => {
    setData(payload);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setData(undefined);
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setData(undefined);
      return !prev;
    });
  }, []);

  return { isOpen, open, close, toggle, data };
}

export type TModalProps<T> = {
  isOpen: boolean;
  close: () => void;
  data: T | undefined;
};
