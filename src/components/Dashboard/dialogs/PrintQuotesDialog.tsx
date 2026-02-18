import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import { usePrintQue } from "@/hooks/usePrintQue";
import { getLastWeeksQuotesBySalesman, getYesterdaysQuotesBySalesman } from "@/scripts/services/quotesService";
import { getAllUsers } from "@/scripts/services/userService";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
}


export default function PrintQuotesDialog({ open, setOpen }: Props) {
  const { addToQue, printQue } = usePrintQue();

  const { data: salesmen = [] } = useQuery<User[]>({
    queryKey: ['salesmen'],
    queryFn: async () => {
      const res = await getAllUsers();
      return res.filter((user) => user.subtype === 'sales');
    }
  });

  const onClickPrintYesterday = async () => {
    for (const salesman of salesmen) {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const quotes = await getYesterdaysQuotesBySalesman(salesman.id);
      const data = {
        salesman: salesman.initials,
        date: formatDate(date),
        quotes
      };
      addToQue('quotesList', 'print_quotes_list', data, '1100px', '816px');
    }

    printQue();
    setOpen(false);
  };

  const onClickPrintLastWeek = async () => {
    for (const salesman of salesmen) {
      const date = new Date();
      const thisWeekMonday = new Date(date);
      thisWeekMonday.setDate(date.getDate() - date.getDay() + 1);
      const lastWeekMonday = new Date(thisWeekMonday);
      lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
      const lastWeekFriday = new Date(lastWeekMonday);
      lastWeekFriday.setDate(lastWeekMonday.getDate() + 4);

      const quotes = await getLastWeeksQuotesBySalesman(salesman.id);
      const data = {
        salesman: salesman.initials,
        date: `${formatDate(lastWeekMonday)} - ${formatDate(lastWeekFriday)}`,
        quotes
      };
      addToQue('quotesList', 'print_quotes_list', data, '1100px', '816px');
    }

    printQue();
    setOpen(false);
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Print Quotes"
      width={300}
    >
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
        <Button onClick={onClickPrintYesterday}>Yesterday</Button>
        <Button onClick={onClickPrintLastWeek}>Last Week</Button>
      </div>
    </Dialog>
  );
}
