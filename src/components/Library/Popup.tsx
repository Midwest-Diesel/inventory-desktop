interface Props {
  text: string
  open: boolean
  setOpen: (value: boolean) => void
  yesCallback?: () => void
  noCallback?: () => void
  className?: string
  type?: 'confirm' | 'question' | 'prompt'
}


export default function Popup({ text, open, setOpen, yesCallback, noCallback, className = '', type = 'confirm' }: Props) {
  return (
    <>
      {open &&
        <div
          className={`popup${className ? ' ' : ''}${className}`}
        >
          <p>{ text }</p>
          <div className="popup__buttons">
            {type === 'confirm' &&
              <>
                <button
                  className="popup__btn popup__btn--primary"
                  autoFocus
                  onClick={() => {
                    setOpen(false);
                    yesCallback && yesCallback();
                  }}
                >
                  Ok
                </button>
                <button
                  className="popup__btn popup__btn--secondary"
                  onClick={() => {
                    setOpen(false);
                    noCallback && noCallback();
                  }}
                >
                  Cancel
                </button>
              </>
            }
            {type === 'question' &&
              <>
                <button
                  className="popup__btn popup__btn--primary"
                  autoFocus
                  onClick={() => {
                    setOpen(false);
                    yesCallback && yesCallback();
                  }}
                >
                  Yes
                </button>
                <button
                  className="popup__btn popup__btn--secondary"
                  onClick={() => {
                    setOpen(false);
                    noCallback && noCallback();
                  }}
                >
                  No
                </button>
              </>
            }
          </div>
        </div>
      }
    </>
  );
}
