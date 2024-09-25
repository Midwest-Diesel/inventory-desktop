interface Props {
  children: any
  value: string
  data?: any
  className?: string
  defaultOption?: boolean
  onClick?: () => void
  disabled?: boolean
}

export default function DropdownOption({ children, value, data, className, defaultOption, onClick, disabled = false }: Props) {
  return (
    <li className={`dropdown__option ${className || ''}${disabled ? ' dropdown__option--disabled' : ''}`} onClick={() => (onClick && !disabled) && onClick()}>
      { children }
    </li>
  );
}