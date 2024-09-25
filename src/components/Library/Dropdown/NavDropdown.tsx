import { useEffect, useState } from "react";

interface Props {
  children: any
  label: string
  className?: string
}


export default function NavDropdown({ children, className, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('click', (e: any) => handleScreenClick(e));

    return () => {
      window.removeEventListener('click', (e: any) => handleScreenClick(e));
    };
  }, []);

  const handleScreenClick = (e: any) => {
    const clickedDropdown = e.target.closest('.nav-dropdown');
    if (!clickedDropdown) setIsOpen(false);
  };


  return (
    <div onClick={() => setIsOpen(!isOpen)} className={`nav-dropdown${className ? className : ''}`}>
      <p>{ label }</p>
      <div className="nav-dropdown__list">
        <div className="nav-dropdown__list--container">
          { isOpen && children }
        </div>
      </div>
    </div>
  );
}
