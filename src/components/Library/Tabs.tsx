import { generateClasses, parseClasses } from "@/scripts/tools/utils";
import React, { useState } from "react";
import Button from "./Button";

interface Props {
  children: any
  className?: string
  variant?: ('no-top-margin')[]
}


export default function Tabs({ children, className = '', variant = [], ...props }: Props) {
  const classes = generateClasses(className, variant, 'tabs');
  const tabLinks = children[0].props.children;
  const [activeTab, setActiveTab] = useState(1);

  const openTab = (i: number) => {
    setActiveTab(i);
  };


  return (
    <div
      {...parseClasses(classes)}
      {...props}
    >
      <div className="tabs__links">
        {tabLinks.map((child: any, i: number) => {
          return (
            <Button
              key={i}
              className={i + 1 === activeTab ? 'tabs__links--active' : ''}
              onClick={() => openTab(i + 1)}
            >
              { child.props.children }
            </Button>
          );
        })}
      </div>

      {children.map((child: any, i: number) => {        
        if (i === activeTab) {
          return (
            <div key={i} className={child.props.className ? child.props.className : ''}>
              { child.props.children }
            </div>
          );
        }
      })}
    </div>
  );
}
