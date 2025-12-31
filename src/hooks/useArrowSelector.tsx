import { useEffect } from "react";


export function useArrowSelector<T extends { id: number }>(data: T[], focusedItem: T | null, setFocusedItem: (item: T) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data.length || !focusedItem) return;

      if (e.key === 'ArrowDown') {
        selectNextRow();
      } else if (e.key === 'ArrowUp') {
        selectPreviousRow();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [data, focusedItem]);

  const findIndex = () =>
    data.findIndex(d => d.id === focusedItem!.id);

  const selectNextRow = () => {
    const index = findIndex();
    const nextIndex = index === -1 || index === data.length - 1
      ? 0
      : index + 1;

    setFocusedItem(data[nextIndex]);
  };

  const selectPreviousRow = () => {
    const index = findIndex();
    const prevIndex = index <= 0
      ? data.length - 1
      : index - 1;

    setFocusedItem(data[prevIndex]);
  };
}
