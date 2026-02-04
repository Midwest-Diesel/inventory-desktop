import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "./Button";
import Input from "./Input";

interface Props {
  message?: string
  defaultValue?: string
  onClose: (value: string | null) => void
}


export function Prompt({ message = '', defaultValue = '', onClose }: Props) {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(null);
      if (e.key === 'Enter') onClose(value);
    };
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
    }
  }, [value, onClose]);


  return ReactDOM.createPortal(
    <div className="prompt__background">
      <div className="prompt">
        <h4>{ message }</h4>

        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="prompt__buttons">
          <Button onClick={() => onClose(value)}>OK</Button>
          <Button onClick={() => onClose(null)}>Cancel</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}


export function prompt(message: string, defaultValue = ''): Promise<string | null> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    function handleClose(value: string | null) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      resolve(value);
    }

    ReactDOM.render(
      <Prompt message={message} defaultValue={defaultValue} onClose={handleClose} />,
      container
    );
  });
}
