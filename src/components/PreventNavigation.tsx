'use client';

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Alert from './Library/Alert';

interface PreventNavigationProps {
  isDirty?: boolean
  text?: string
}


export const PreventNavigation = ({ isDirty = true, text }: PreventNavigationProps) => {
  const [leavingPage, setLeavingPage] = useState(false);
  const router = useRouter();
  const confirmationFn = useRef<() => void>(() => {});

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

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (isDirty) {
        confirmationFn.current = () => {};
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
  }, [isDirty, router]);

  
  return (
    <>
      <Alert
        text={text || 'Are you sure you want to leave the page?'}
        type="question"
        open={leavingPage}
        setOpen={setLeavingPage}
        noCallback={() => {
          confirmationFn.current = () => {};
        }}
        yesCallback={() => {
          confirmationFn.current();
          confirmationFn.current = () => {};
        }}
      />
    </>
  );
};
