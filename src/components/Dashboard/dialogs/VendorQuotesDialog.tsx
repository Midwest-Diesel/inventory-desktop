import Button from "@/components/library/Button";
import Dialog from "@/components/library/Dialog";
import VendorDropdown from "@/components/library/dropdown/VendorDropdown";
import Input from "@/components/library/Input";
import Link from "@/components/library/Link";
import Loading from "@/components/library/Loading";
import Pagination from "@/components/library/Pagination";
import Select from "@/components/library/select/Select";
import UserSelect from "@/components/library/select/UserSelect";
import Table from "@/components/library/Table";
import { getAltsByPartNum } from "@/scripts/services/partsService";
import { addVendorQuote, deleteVendorQuote, getVendorQuoteById, searchVendorQuotes, VendorQuoteSearchData } from "@/scripts/services/vendorQuotesService";
import { formatCurrency, formatDate, parseDateInputValue } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import EditVendorQuoteDialog from "./EditVendorQuoteDialog";
import { ask } from "@/scripts/config/tauri";

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  partNum: string
}


const LIMIT = 25;

export default function VendorQuotesDialog({ open, setOpen, partNum }: Props) {
  const [quoteEdited, setQuoteEdited] = useState<VendorQuote | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<VendorQuoteSearchData>({
    date: null,
    vendor: null,
    partNum,
    condition: null,
    salesmanId: null
  });

  useEffect(() => {
    if (!quoteEdited) return;
    setOpen(false);
  }, [quoteEdited]);
  
  const { data: quotes, isFetching, refetch } = useQuery<{ pageCount: number, rows: VendorQuote[] }>({
    queryKey: ['quotes', open, search, page],
    queryFn: () => searchVendorQuotes(search, page, LIMIT),
    enabled: open
  });

  const { data: alts = [] } = useQuery<string[]>({
    queryKey: ['alts', partNum],
    queryFn: () => getAltsByPartNum(partNum)
  });
  
  const onClickDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteVendorQuote(id);
    refetch();
  };

  const onClickNewQuote = async () => {
    if (!search.partNum) return;
    const id = await addVendorQuote(search.partNum);
    if (!id) return;
    
    const res = await getVendorQuoteById(id);
    setQuoteEdited(res);
  };


  const quote = {
    ...quoteEdited,
    date: quoteEdited?.date ?? search.date,
    vendor: quoteEdited?.vendor ?? search.vendor,
    partNum: quoteEdited?.partNum ?? search.partNum,
    condition: quoteEdited?.condition ?? search.condition
  } as VendorQuote;
  
  return (
    <>
      {quoteEdited &&
        <EditVendorQuoteDialog
          quote={quote}
          setQuote={setQuoteEdited}
          onClose={() => setOpen(true)}
        />
      }

      <Dialog
        open={open}
        setOpen={setOpen}
        title="Vendor Quotes"
        minWidth={1000}
      >
        <div style={{ height: '39rem' }}>
          <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.2rem' }}>
            <Button onClick={onClickNewQuote}>New</Button>
          </div>

          <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <Input
              variant={['label-stack', 'label-bold']}
              label="Date"
              value={parseDateInputValue(search.date)}
              onChange={(e) => setSearch({ ...search, date: e.target.value ? new Date(e.target.value) : null })}
              type="date"
            />

            <Select
              variant={['label-stack', 'label-bold']}
              label="Part Number"
              value={search.partNum ?? ''}
              onChange={(e) => setSearch({ ...search, partNum: e.target.value })}
            >
              {alts.map((alt) => {
                return (
                  <option key={alt}>{ alt }</option>
                );
              })}
            </Select>

            <Select
              variant={['label-stack', 'label-bold']}
              label="Condition"
              value={search.condition ?? ''}
              onChange={(e) => setSearch({ ...search, condition: e.target.value as VendorQuoteCondition })}
            >
              <option value="">-- EMPTY --</option>
              <option>New</option>
              <option>Good Used</option>
              <option>Reconditioned</option>
              <option>Core</option>
            </Select>

            <UserSelect
              variant={['label-stack', 'label-bold']}
              label="Salesman"
              value={search.salesmanId ?? ''}
              onChange={(e) => setSearch({ ...search, salesmanId: e.target.value ? Number(e.target.value) : null })}
              userSubtype="sales"
            />

            <VendorDropdown
              variant={['label-stack', 'label-bold']}
              label="Vendor"
              value={search.vendor ?? ''}
              onChange={(value) => setSearch({ ...search, vendor: value })}
              maxHeight="20rem"
            />
          </div>

          { (!isFetching && (!quotes || quotes.rows.length === 0)) && <p>No Content...</p> }

          {quotes &&
            <>
              <Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Salesman</th>
                    <th>Part Number</th>
                    <th>Price</th>
                    <th>Contact</th>
                    <th>Condition</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes?.rows.map((quote) => {
                    return (
                      <tr key={quote.id}>
                        <td className="table-buttons table-buttons--grid quote-list__btn-grid">
                          <Button
                            variant={['fit']}
                            onClick={() => setQuoteEdited(quote)}
                          >
                            <img alt="Edit" src="/images/icons/edit.svg" width={17} height={17} />
                          </Button>
                          <Button variant={['fit', 'danger']} onClick={() => onClickDelete(quote.id)} data-testid="delete-quote">
                            <img alt="Delete" src="/images/icons/delete.svg" width={17} height={17} />
                          </Button>
                        </td>
                        <td>{ formatDate(quote.date) }</td>
                        <td>
                          {quote.vendor?.id ?
                            <Link href={`/vendors/${quote.vendor.id}`}>{ quote.vendor.name }</Link>
                            :
                            quote.vendor?.name
                          }
                        </td>
                        <td>{ quote.salesman }</td>
                        <td>{ quote.partNum }</td>
                        <td>{ formatCurrency(quote.price) }</td>
                        <td>{ quote.contact }</td>
                        <td>{ quote.condition }</td>
                        <td><div style={{ height: '2.5rem', overflowY: 'auto' }}>{ quote.notes }</div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              { isFetching && <Loading /> }

              <Pagination
                data={quotes.rows}
                setData={(_, page) => setPage(page)}
                pageCount={quotes.pageCount}
                pageSize={LIMIT}
              />
            </>
          }
        </div>
      </Dialog>
    </>
  );
}
