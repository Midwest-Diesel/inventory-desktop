import { useEffect, useState } from "react";

interface Props {
  msg: string;
}


const OFFSET = 25;
const DELAY = 800;

export default function Tooltip({ msg }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const updatePosition = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    if (msg) {
      window.addEventListener("mousemove", updatePosition);

      showTimer = setTimeout(() => {
        setVisible(true);
      }, DELAY);
    }

    return () => {
      if (showTimer) {
        clearTimeout(showTimer);
      }

      window.removeEventListener("mousemove", updatePosition);
      setVisible(false);
    };
  }, [msg]);


  if (!msg || !visible) return null;

  return (
    <div
      className="tooltip"
      style={{ top: pos.y - OFFSET, left: pos.x, opacity: 1 }}
    >
      { msg }
    </div>
  );
}
