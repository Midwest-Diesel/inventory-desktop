import { generateClasses, generateRandId, parseClasses } from "@/scripts/tools/utils";
import React, { Children, useState, useEffect } from "react";
import DropdownOption from "./DropdownOption";
import Image from "next/image";


interface Props {
  children: any
  className?: string
  variant?: ('small' | 'input' | 'label-space-between' | 'label-stack' | 'label-inline' | 'label-full-width' | 'large' | 'no-margin' | 'label-full-height' | 'fill' | 'gap' | 'label-bold')[]
  label?: string
  value?: string
  onChange?: (value?: any, data?: any) => void
  maxHeight?: string
}

export default function Dropdown({ children, className = '', variant = [], label = '', value, onChange, maxHeight = 'none' }: Props) {
  const classes = generateClasses(className, variant && variant.filter((v) => !v.includes('label-stack' || 'label-space-between' || 'label-bold')), 'dropdown');
  const [isOpen, setIsOpen] = useState(false);
  const [idProp, setIdProp] = useState('');
  let id = '';

  const removeDuplicateRows = (dropdownOptions: any[]) => {
    const seenValues = new Set();
    const filteredOptions = dropdownOptions.filter((child: any) => {
      const value = child.props.value;
      if (seenValues.has(value)) {
        return false;
      }
      seenValues.add(value);
      return true;
    });
    return filteredOptions;
  };

  const dropdownOptions: any = removeDuplicateRows(Children.toArray(children));
  const defaultValue = value || dropdownOptions[0].props.value;
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [previouslySelectedOption, setPreviouslySelectedOption] = useState(defaultValue);
  

  useEffect(() => {
    id = generateRandId();
    setIdProp(id);
    window.addEventListener('click', (e: any) => handleScreenClick(e));
  }, []);

  useEffect(() => {
    setSelectedOption(defaultValue);
  }, [defaultValue]);
  


  const handleScreenClick = (e: any) => {
    const clickedDropdown = e.target.closest('.dropdown__option');
  
    if(clickedDropdown) {
      const array = (Array.from(clickedDropdown.classList).find((c: any) => c.includes('drop-id-')));
      if (!array) return;
      const clickedId = (array as string).replace('drop-id-', '');
      if (clickedId !== id) setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  const selectOption = (value: string, data?: any) => {
    setSelectedOption(value);
    setIsOpen(false);
    if (onChange && previouslySelectedOption !== value) {
      onChange(value, data);
      setPreviouslySelectedOption(value);
    }
  };

  const getSortedDropdownOptions = dropdownOptions.sort((a: any, b: any) => {
    return a.props.value === selectedOption ? -1 : b.props.value === selectedOption ? 1 : 0;
  });

  const orderDropdownOptions = (dropdownOptions: any[]) => {
    dropdownOptions.sort((a, b) => a.props.value && a.props.value.localeCompare(b.props.value));
    const selected = dropdownOptions.find((child: any) => child.props.value === selectedOption);
    dropdownOptions.unshift(selected);
    return dropdownOptions;
  };

  let labelClass = '';
  if (variant) {
    if (variant.includes('label-space-between')) {
      labelClass += 'input--label-space-between ';
    }
    if (variant.includes('label-stack')) {
      labelClass += 'dropdown--label-stack ';
    }
    if (variant.includes('label-bold')) {
      labelClass += 'dropdown--label-bold ';
    }
  }

  let containerClass = '';
  if (variant) {
    if (variant.includes('small')) {
      containerClass = 'dropdown--small';
    }
  }


  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: variant.includes('gap') ? '0.5rem' : 0 }} className={labelClass}>
      <p className="dropdown__label">{ label }</p>
      <div className={`dropdown__container ${containerClass}`}>
        <ul {...parseClasses(classes)} style={isOpen ? { position: 'absolute', zIndex: 2 } : {}}>
          {isOpen ?
            <>
              {/* Selected option */}
              {(orderDropdownOptions([...dropdownOptions])[0].props.value === selectedOption) &&
                <DropdownOption
                  {...orderDropdownOptions([...dropdownOptions])[0].props}
                  className="dropdown__option--selected"
                  onClick={() => selectOption(orderDropdownOptions([...dropdownOptions])[0].props.value, orderDropdownOptions([...dropdownOptions])[0].props.data)}
                >
                  <>
                    { orderDropdownOptions([...dropdownOptions])[0].props.children }
                    <Image className="dropdown__arrow" src="/images/icons/arrow-up.svg" alt="arrow" width={20} height={20} />
                  </>
                </DropdownOption>
              }
              {/* Other options */}
              <div style={{ maxHeight: maxHeight, overflowY: 'auto' }}>
                {orderDropdownOptions([...dropdownOptions])
                  .map((child: any, i: number) => {
                    const { value, children, data } = child.props;
                    
                    return (
                      <React.Fragment key={i}>
                        {(value !== selectedOption && i !== 0) &&
                          <DropdownOption
                            {...child.props}
                            className={`${value === selectedOption && i === 0 ? 'dropdown__option--selected' : ''}`}
                            onClick={() => selectOption(value, data)}
                            key={i}
                          >
                            <React.Fragment key={i}>
                              { children }
                            </React.Fragment>
                          </DropdownOption>
                        }
                      </React.Fragment>
                    );
                  })
                }
              </div>
            </>
            :
            getSortedDropdownOptions.map((child: any) => {
              const { value, children, className } = child.props;

              if (value === selectedOption) {
                return (
                  <DropdownOption
                    {...child.props}
                    className={`${className} dropdown__option--selected drop-id-${idProp}`}
                    value={value}
                    onClick={() => setIsOpen(true)}
                    key={value}
                  >
                    <React.Fragment key={value}>
                      { children }
                      <Image className="dropdown__arrow" src="/images/icons/arrow-down.svg" alt="arrow" width={20} height={20} />
                    </React.Fragment>
                  </DropdownOption>
                );
              }
            })
          }
        </ul>
      </div>
    </div>
  );
}
