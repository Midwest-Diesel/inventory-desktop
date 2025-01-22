'use client';

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Popup from './Library/Popup';

interface Props {
  isDirty?: boolean
  text?: string
}


export const PreventNavigation = ({ isDirty = true, text }: Props) => {
  const [leavingPage, setLeavingPage] = useState(false);
  const router = useRouter();
  const confirmationFn = useRef<() => void>(() => {});
  const cancelFn = useRef<() => void>(() => {});

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (isDirty) {
        e.preventDefault();
        confirmationFn.current = () => {
          router.push(target.href || '/');
        };
        setLeavingPage(true);
      }
    };

    const handleDropdownClick = (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (target.classList[0] === 'nav__link') setLeavingPage(true);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setLeavingPage(false);
      cancelFn.current();
      confirmationFn.current = () => {};
      cancelFn.current = () => {};
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (isDirty) {
        confirmationFn.current = () => {};
        cancelFn.current = () => {};
        setLeavingPage(true);
      } else {
        router.back();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.querySelectorAll('.nav-dropdown').forEach((elmt) => {
      elmt.addEventListener('click', handleDropdownClick);
    });
    document.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', handleClick);
    });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.querySelectorAll('.nav-dropdown').forEach((elmt) => {
        elmt.removeEventListener('click', handleDropdownClick);
      });
      document.querySelectorAll('a').forEach((link) => {
        link.removeEventListener('click', handleClick);
      });
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, router]);

  
  return (
    <Popup
      text={text || 'Are you sure you want to leave the page?'}
      type="question"
      open={leavingPage}
      setOpen={setLeavingPage}
      noCallback={() => {
        cancelFn.current();
        confirmationFn.current = () => {};
        cancelFn.current = () => {};
      }}
      yesCallback={() => {
        confirmationFn.current();
        confirmationFn.current = () => {};
        cancelFn.current = () => {};
      }}
    />
  );
};
