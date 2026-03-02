import { ReactNode } from "react";

interface Props {
  children: ReactNode
}


export default function TableSplitRow({ children }: Props) {
  return (
    <tr className="table-split-row">
      { children }
    </tr>
  );
}
