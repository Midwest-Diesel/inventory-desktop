import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import Input from "@/components/library/Input";
import { usePrintQue } from "@/hooks/usePrintQue";
import { getLastWeeksQuotesBySalesman, getQuotesBySalesmanDateRange, getYesterdaysQuotesBySalesman } from "@/scripts/services/quotesService";
import { getAllUsers } from "@/scripts/services/userService";
import { formatDate, parseDateInputValue } from "@/scripts/tools/stringUtils";
import { chunkArray } from "@/scripts/tools/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
}


const MAX_ROWS = 17;

export default function PrintQuotesDialog({ open, setOpen }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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
      queueQuotes(salesman.initials, formatDate(date), quotes);
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
      queueQuotes(salesman.initials, `${formatDate(lastWeekMonday)} - ${formatDate(lastWeekFriday)}`, quotes);
    }

    printQue();
    setOpen(false);
  };

  const onClickPrintDateRange = async () => {
    if (!startDate || !endDate) return;

    for (const salesman of salesmen) {
      const quotes = await getQuotesBySalesmanDateRange(salesman.id, startDate, endDate);
      queueQuotes(salesman.initials, `${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`, quotes);
    }

    printQue();
    setOpen(false);
  };

  const queueQuotes = (salesmanInitials: string, dateLabel: string, quotes: Quote[]) => {
    const chunks = chunkArray(quotes, MAX_ROWS);
    const total = quotes.reduce((acc, quote) => acc + Number(quote.price), 0);

    let i = 0;
    for (const chunk of chunks) {
      addToQue(
        'quotesList',
        'print_quotes_list',
        {
          salesman: salesmanInitials,
          date: dateLabel,
          quotes: chunk,
          total
        },
        '1100px',
        '900px',
        null,
        `quotes_list_${salesmanInitials}_${i}.png`
      );
      i++;
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Print Quotes"
      width={500}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
          <Button onClick={onClickPrintYesterday}>Yesterday</Button>
          <Button onClick={onClickPrintLastWeek}>Last Week</Button>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <Input
            variant={['label-stack', 'label-bold']}
            label="Start Date"
            value={parseDateInputValue(startDate)}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            type="date"
          />
          <Input
            variant={['label-stack', 'label-bold']}
            label="End Date"
            value={parseDateInputValue(endDate)}
            onChange={(e) => setEndDate(new Date(e.target.value))}
            type="date"
          />
          <Button style={{ marginTop: '1.4rem' }} onClick={onClickPrintDateRange}>Date Range</Button>
        </div>
      </div>
    </Dialog>
  );
}
