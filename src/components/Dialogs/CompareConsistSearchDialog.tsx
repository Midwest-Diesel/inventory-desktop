import Dialog from "../Library/Dialog";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  search: { customer: Customer, serialNum: string, arrNum: string }
  searchData: CompareConsist[]
}


export default function CompareConsistSearchDialog({ open, setOpen, search, searchData }: Props) {
  const { customer, serialNum, arrNum } = search;
  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Search Results"
      y={-100}
      width={500}
      height={300}
    >
      <h3>{ searchData.length } search results { customer && ` For ${customer.company}` }</h3>
      <br />
      { serialNum && <p><strong>Serial Number</strong> {serialNum}</p> }
      { arrNum && <p><strong>Arrangement Number</strong> {arrNum}</p> }
    </Dialog>
  );
}
