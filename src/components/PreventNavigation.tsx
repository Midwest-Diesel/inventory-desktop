import { useEffect } from 'react';
import { useNavState } from '../hooks/useNavState';
import { ask } from '@/scripts/config/tauri';

interface Props {
  shouldPrevent?: boolean
  text?: string
}


export const PreventNavigation = ({ shouldPrevent = true, text }: Props) => {
  const { backward, push } = useNavState();

  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link: HTMLAnchorElement | null = target.closest('a');
      if (shouldPrevent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (await ask(text ?? 'Are you sure you want to leave the page?')) push(link?.textContent || 'Home', link?.getAttribute('data-href') || '/');
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (!shouldPrevent) backward();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldPrevent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', handleClick);
    });
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.querySelectorAll('a').forEach((link) => {
        link.removeEventListener('click', handleClick);
      });
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPrevent]);

  
  return (<></>);
};
