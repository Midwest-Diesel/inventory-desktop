import { cloneElement, ReactElement, useRef } from "react";
import ReactDraggable from "react-draggable";

interface Props {
  children: ReactElement
  handle?: string
  x?: number
  y?: number
}


export default function Draggable({ children, handle, y = 50, x = 550 }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);


  return (
    <ReactDraggable
      nodeRef={nodeRef}
      handle={handle}
      bounds="body"
      defaultPosition={{ x: x, y: y }}
    >
      {cloneElement(children, { ref: nodeRef, })}
    </ReactDraggable>
  );
}
