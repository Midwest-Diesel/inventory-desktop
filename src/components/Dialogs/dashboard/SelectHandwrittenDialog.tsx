import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import { getHandwrittenById, searchSelectHandwrittensDialogData } from "@/scripts/services/handwrittensService";
import Table from "@/components/Library/Table";
import { formatDate } from "@/scripts/tools/stringUtils";
import Pagination from "@/components/Library/Pagination";
import Input from "@/components/Library/Input";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import { useAtom } from "jotai";
import { selectedCustomerAtom, selectedHandwrittenIdAtom } from "@/scripts/atoms/state";
import { ask, message } from "@tauri-apps/api/dialog";
import { useToast } from "@/hooks/useToast";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  part: Part
  onSubmit: (handwritten: Handwritten, warranty: string, qty: number, desc: string, price: number, stockNum: string, cost: number) => void
}


export default function SelectHandwrittenDialog({ open, setOpen, part, onSubmit }: Props) {
  const toast = useToast();
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [selectedHandwrittenId, setSelectedHandwrittenId] = useAtom(selectedHandwrittenIdAtom);
  const [handwrittensData, setHandwrittensData] = useState<SelectHandwrittenDialogResult[]>([]);
  const [handwrittens, setHandwrittens] = useState<SelectHandwrittenDialogResult[]>([]);
  const [handwrittenCount, setHandwrittenCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [warranty, setWarranty] = useState('');
  const [noWarranty, setNoWarranty] = useState(false);
  const [noVerbage, setNoVerbage] = useState(false);
  const [injectorWar, setInjectorWar] = useState(false);
  const [customWar, setCustomWar] = useState(false);
  const [search, setSearch] = useState('');
  const [showWarranty, setShowWarranty] = useState(false);
  const [showButons, setShowButtons] = useState(true);
  const LIMIT = 26;
  
  useEffect(() => {
    setSearch('');
    setDesc(part.desc ?? '');
    setQty(null);
    setPrice(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      await resetHandwrittensList();
      const cost = part.partsCostIn.reduce((acc, val) => acc + val.cost, 0) || 0.01;
      if (cost === 0.04) await message('Warning: This part has $0.04 cost!', { type: 'warning' });
    };
    fetchData();
  }, [open, selectedCustomer]);

  const resetHandwrittensList = async () => {
    if (search || selectedCustomer?.id) {
      const searchData = {
        billToCompany: search ?? '',
        limit: LIMIT,
        offset: (currentPage - 1) * LIMIT,
        ...((!search && selectedCustomer?.id) && { customerId: selectedCustomer?.id })
      };
      const res = await searchSelectHandwrittensDialogData(searchData);
      if (res.rows.length > 0) {
        setHandwrittens(res.rows);
        setHandwrittenCount(res.pageCount);
        return;
      }
    }
    
    const res = await searchSelectHandwrittensDialogData({ billToCompany: '', limit: LIMIT, offset: (currentPage - 1) * LIMIT, customerId: 0 });
    setHandwrittensData(res.rows);
    setHandwrittens(res.rows);
    setHandwrittenCount(res.pageCount);
    setSearch('');
  };
  
  const handleChangePage = async (_: any, page: number) => {
    if (page === currentPage) return;
    if (search || selectedCustomer?.id) {
      const searchData = {
        billToCompany: search ?? '',
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        ...((!search && selectedCustomer?.id) && { customerId: selectedCustomer?.id })
      };
      const res = await searchSelectHandwrittensDialogData(searchData);
      if (res.rows.length > 0) {
        setHandwrittens(res.rows);
        setHandwrittenCount(res.pageCount);
        setCurrentPage(page);
        return;
      }
    }
    
    const res = await searchSelectHandwrittensDialogData({ billToCompany: '', limit: LIMIT, offset: (page - 1) * LIMIT, customerId: 0 });
    setHandwrittens(res.rows);
    setHandwrittenCount(res.pageCount);
    setCurrentPage(page);
  };

  const handleSelectRow = (id: number) => {
    setSelectedHandwrittenId(id);
  };

  const handleSearch = async () => {
    if (search) {
      const searchData = {
        billToCompany: search,
        limit: LIMIT,
        offset: (currentPage - 1) * LIMIT
      };
      const res = await searchSelectHandwrittensDialogData(searchData);
      setHandwrittens(res?.rows);
      setHandwrittenCount(res?.pageCount);
    } else {
      resetHandwrittensList();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowButtons(false);
    if (!selectedHandwrittenId) return;
    const handwritten = await getHandwrittenById(selectedHandwrittenId);
    if (!handwritten) return;
    if (handwritten.invoiceStatus === 'SENT TO ACCOUNTING') {
      toast.sendToast('Can\'t add items to handwritten when status is SENT TO ACCOUNTING', 'error');
      return;
    }

    if (await ask('Add warranty?')) {
      setShowWarranty(true);
    } else {
      setOpen(false);
      const cost = part.partsCostIn.reduce((acc, val) => acc + val.cost, 0) || 0.01;
      onSubmit(handwritten, '', Number(qty), desc, Number(price), part.stockNum ?? '', cost);
    }
    setShowButtons(true);
  };

  const handleSubmitWarranty = async (e: FormEvent) => {
    e.preventDefault();
    setShowButtons(false);
    const handwritten = await getHandwrittenById(selectedHandwrittenId);
    if (!handwritten) return;

    let fullWar = [handwritten.orderNotes];
    if (customWar) fullWar.push(`${warranty}`);
    if (noWarranty) fullWar.push('No CAT Warranty');
    if (injectorWar) fullWar.push('Injector warranty');
    if (!fullWar && !warranty && !noVerbage) {
      console.error('Warranty cannot be blank');
      return;
    }
    if (noVerbage) fullWar = [handwritten.orderNotes];
    const filteredWar = new Set(fullWar);
    const cost = part.partsCostIn.reduce((acc, val) => acc + val.cost, 0) || 0.01;
    onSubmit(handwritten, [...Array.from(filteredWar)].join('\n').trim(), Number(qty), desc, Number(price), part.stockNum ?? '', cost);
    setShowButtons(true);
  };


  return (
    <>
      <Dialog
        open={open}
        setOpen={(value: boolean) => {
          setShowWarranty(false);
          setOpen(value);
        }}
        title="Select Handwritten"
        width={600}
        height={680}
        data-testid="select-handwritten-dialog"
      >
        {showWarranty ?
          <form onSubmit={handleSubmitWarranty}>
            <Input
              variant={['small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
              label="Warranty"
              value={warranty}
              onChange={(e: any) => setWarranty(e.target.value)}
              data-testid="warranty"
            />
            <div>
              <Checkbox
                label="No CAT Warranty"
                variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
                checked={noWarranty}
                onChange={(e: any) => setNoWarranty(e.target.checked)}
                data-testid="no-cat-warranty"
              />
              <Checkbox
                label="Injector Warranty"
                variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
                checked={injectorWar}
                onChange={(e: any) => setInjectorWar(e.target.checked)}
                data-testid="inj-warranty"
              />
              <Checkbox
                label="Custom Warranty"
                variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
                checked={customWar}
                onChange={(e: any) => setCustomWar(e.target.checked)}
                data-testid="custom-warranty"
              />
            </div>
            {showButons &&
              <div className="form__footer">
                <Button type="submit" data-testid="warranty-submit-btn">Submit</Button>
                <Button type="submit" onClick={() => setNoVerbage(true)}>Cancel Warranty</Button>
              </div>
            }
          </form>
          :
          <>
            <form onSubmit={handleSubmit} className="select-handwritten-form">
              {part &&
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.3rem' }}>
                  <p><strong>Part Num</strong> { part.partNum }</p>
                  <p><strong>Stock Num</strong> { part.stockNum }</p>
                </div>
              }
              <div className="select-handwritten-form__inputs">
                <Input
                  variant={['small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
                  label="Description"
                  value={desc}
                  onChange={(e: any) => setDesc(e.target.value)}
                  required
                  data-testid="select-handwritten-desc"
                />
                <Input
                  variant={['x-small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
                  label="Qty"
                  type="number"
                  value={qty ?? ''}
                  onChange={(e: any) => setQty(e.target.value)}
                  required
                  data-testid="select-handwritten-qty"
                />
                <Input
                  variant={['x-small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
                  label="Price"
                  type="number"
                  step="any"
                  value={price ?? ''}
                  onChange={(e: any) => setPrice(e.target.value)}
                  required
                  data-testid="select-handwritten-price"
                />
              </div>
              { showButons && <Button type="submit" variant={['fit']} data-testid="select-handwritten-submit-btn">Add Item to Handwritten</Button> }
            </form>

            <form
              className="search-handwritten-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="select-handwritten-form__inputs">
                <Input
                  variant={['label-bold', 'label-stack', 'label-fit-content']}
                  label="Search Company"
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                />
              </div>
            </form>

            <div className="select-handwritten-dialog">
              <Table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Bill To Company</th>
                  </tr>
                </thead>
                <tbody>
                  {handwrittens.map((handwritten: SelectHandwrittenDialogResult) => {
                    return (
                      <tr
                        key={handwritten.id}
                        onClick={() => handleSelectRow(handwritten.id)}
                        className={handwritten.id === selectedHandwrittenId ? 'select-handwritten-dialog--selected' : ''}
                        data-testid="select-handwritten-row"
                      >
                        <td>{ handwritten.id }</td>
                        <td>{ formatDate(handwritten.date) }</td>
                        <td>{ handwritten.customer }</td>
                        <td>{ handwritten.billToCompany }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <Pagination
                data={handwrittensData}
                setData={handleChangePage}
                pageCount={handwrittenCount}
                pageSize={LIMIT}
              />
            </div>
          </>
        }
      </Dialog>
    </>
  );
}
