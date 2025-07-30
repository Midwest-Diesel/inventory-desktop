import { useEffect } from "react";


export function useArrowSelector<T>(data: T[], focusedItem: T, setFocusedItem: (data: T) => void) {
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedItem]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      selectNextRow();
    } else if (e.key === 'ArrowUp') {
      selectPreviousRow();
    }
  };

  const selectNextRow = () => {
    const index = (data.indexOf(focusedItem!) ?? -1) + 1;
    if (index > data.length) {
      setFocusedItem(data[0]);
    } else {
      setFocusedItem(data[index]);
    }
  };

  const selectPreviousRow = () => {
    const index = (data.indexOf(focusedItem!) ?? data.length) - 1;
    if (index < 0) {
      setFocusedItem(data[data.length - 1]);
    } else {
      setFocusedItem(data[index]);
    }
  };

  return {};
}