import Dialog from "@/components/Library/Dialog";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}


export default function SalesEndOfDayDialog({ open, setOpen }: Props) {
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Sales End of Day"
    >
      <div>
        
      </div>
    </Dialog>
  );
}
