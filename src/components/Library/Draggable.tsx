import ReactDraggable from 'react-draggable';

interface Props {
  children: React.ReactElement;
  handle?: string;
  x?: number;
  y?: number;
}


export default function Draggable({ children, handle, y = 50, x = 550 }: Props) {
  return (
    <ReactDraggable handle={handle} bounds="body" defaultPosition={{ x: x, y: y }}>
      { children }
    </ReactDraggable>
  );
}
