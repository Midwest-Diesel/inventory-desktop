import { generateClasses, parseClasses } from "@/scripts/tools/utils";

interface Props extends InputHTML {
  className?: string
  labelClass?: string
  variant?: ('label-thin' | 'label-space-between' | 'label-full-width' | 'label-bold' | 'dark-bg' | 'label-stack' | 'label-content-center' | 'label-align-center' | 'label-fit')[]
  label?: string
  disabled?: boolean
}


export default function Checkbox({ className, labelClass, variant = [], label, disabled = false, ...props }: Props) {
  const labelClassList = variant.filter((v) => v.includes('label'));
  const classes = generateClasses(`${className ? ` ${className}` : ''}inp-cbx`, variant ? variant.filter((v) => !labelClassList.includes(v)) : [], 'checkbox');
  const labelClasses = generateClasses(`${labelClass ? ` ${labelClass}` : ''}checkbox-wrapper-4`, labelClassList, 'checkbox');


  return (
    <label {...parseClasses(labelClasses)}>
      { label && label }
      <input
        type="checkbox"
        disabled={disabled}
        {...parseClasses(classes)}
        {...props}
      />
      <div className={`cbx${disabled ? ' cbx--disabled' : ''}`}><span>
        <svg width="12px" height="10px">
          <use xlinkHref="#check-4"></use>
        </svg></span></div>
      <svg className="inline-svg">
        <symbol id="check-4" viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </symbol>
      </svg>
    </label>
  );
}
