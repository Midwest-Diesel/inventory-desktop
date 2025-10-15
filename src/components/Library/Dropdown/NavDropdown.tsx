import { useEffect, useState } from "react";

interface Props {
  children: any
  label: string
  className?: string
}


export default function NavDropdown({ children, className, label, ...props }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.addEventListener('click', (e: any) => handleScreenClick(e));

    return () => {
      window.removeEventListener('click', (e: any) => handleScreenClick(e));
    };
  }, []);

  const handleScreenClick = (e: any) => {
    if (e.target.classList[1] === 'alert__btn--primary') return;
    const clickedDropdown = e.target.closest('.nav-dropdown');
    if (!clickedDropdown) setIsOpen(false);
  };


  return (
    <div onClick={() => setIsOpen(!isOpen)} className={`nav-dropdown${className ? className : ''}`} {...props}>
      <span className="nav-dropdown__label">{ label }</span>
      <div className="nav-dropdown__list" style={isOpen ? {} : { display: 'none' }}>
        <div className="nav-dropdown__list--container">
          { children }
        </div>
      </div>
    </div>
  );
}
