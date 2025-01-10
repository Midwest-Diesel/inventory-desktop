interface Props {
  text: string
  open: boolean
  setOpen: (value: boolean) => void
  yesCallback?: () => void
  noCallback?: () => void
  className?: string
  type?: 'confirm' | 'question' | 'prompt'
}


export default function Alert({ text, open, setOpen, yesCallback, noCallback, className = '', type = 'confirm' }: Props) {
  return (
    <>
      {open &&
        <div
          className={`alert${className ? ' ' : ''}${className}`}
        >
          <p>{ text }</p>
          <div className="alert__buttons">
            {type === 'confirm' &&
              <>
                <button
                  className="alert__btn alert__btn--primary"
                  onClick={() => {
                    setOpen(false);
                    yesCallback && yesCallback();
                  }}
                >
                  Ok
                </button>
                <button
                  className="alert__btn alert__btn--secondary"
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
                  className="alert__btn alert__btn--primary"
                  onClick={() => {
                    setOpen(false);
                    yesCallback && yesCallback();
                  }}
                >
                  Yes
                </button>
                <button
                  className="alert__btn alert__btn--secondary"
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
