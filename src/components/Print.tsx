import { useEffect, useRef } from "react";

interface Props {
  html: string
}


export default function Print({ html }: Props) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.innerHTML = html;
  }, [html]);


  return (
    <div ref={ref}></div>
  );
}
