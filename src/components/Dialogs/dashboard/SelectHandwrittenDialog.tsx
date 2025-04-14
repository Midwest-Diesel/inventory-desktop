import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import { addHandwritten, getHandwrittenById, getHandwrittenCount, getSomeHandwrittens, searchHandwrittens } from "@/scripts/controllers/handwrittensController";
import Table from "@/components/Library/Table";
import { formatDate } from "@/scripts/tools/stringUtils";
import Pagination from "@/components/Library/Pagination";
import Input from "@/components/Library/Input";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";
import Toast from "@/components/Library/Toast";
import { useAtom } from "jotai";
import { selectedCustomerAtom, userAtom } from "@/scripts/atoms/state";
import { confirm } from "@/scripts/config/tauri";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  part: Part
  customer: Customer | null
  setHandwrittenCustomer: (customer: Customer) => void
  onSubmit: (handwritten: Handwritten, warranty: string, qty: number, desc: string, price: number) => void
}


export default function SelectHandwrittenDialog({ open, setOpen, part, customer, setHandwrittenCustomer, onSubmit }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [selectedCustomer] = useAtom<Customer>(selectedCustomerAtom);
  const [handwrittensData, setHandwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [handwrittenCount, setHandwrittenCount] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHandwrittenId, setSelectedHandwrittenId] = useState(0);
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [warranty, setWarranty] = useState('');
  const [noWarranty, setNoWarranty] = useState(false);
  const [noVerbage, setNoVerbage] = useState(false);
  const [injectorWar, setInjectorWar] = useState(false);
  const [customWar, setCustomWar] = useState(false);
  const [search, setSearch] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [showWarranty, setShowWarranty] = useState(false);
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
      const res = await searchHandwrittens(searchData);
      setHandwrittens(res?.rows);
      setHandwrittenCount(res?.minItems);
    } else {
      const pageCount = await getHandwrittenCount();
      setHandwrittenCount(pageCount);
      const res = await getSomeHandwrittens(1, LIMIT);
      setHandwrittensData(res);
      setHandwrittens(res);
      setSearch('');
    }
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
      const res = await searchHandwrittens(searchData);
      setHandwrittens(res?.rows);
      setHandwrittenCount(res?.minItems);
    } else {
      const res = await getSomeHandwrittens(page, LIMIT);
      setHandwrittens(res);
    }
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
      const res = await searchHandwrittens(searchData);
      setHandwrittens(res?.rows);
      setHandwrittenCount(res?.minItems);
    } else {
      resetHandwrittensList();
    }
  };

  const handleNewHandwritten = async () => {
    if (!customer) return;
    const newHandwritten = {
      customer,
      date: new Date(),
      poNum: '',
      billToCompany: customer.company,
      billToAddress: customer.billToAddress,
      billToAddress2: customer.billToAddress2,
      billToCity: customer.billToCity,
      billToState: customer.billToState,
      billToZip: customer.billToZip,
      billToCountry: null,
      billToPhone: customer.billToPhone,
      fax: '',
      shipToCompany: customer.company,
      shipToAddress: customer.shipToAddress,
      shipToAddress2: customer.shipToAddress2,
      shipToCity: customer.shipToCity,
      shipToState: customer.shipToState,
      shipToZip: customer.shipToZip,
      source: null,
      contactName: '',
      payment: customer.paymentType,
      salesmanId: user.id,
      phone: '',
      cell: null,
      engineSerialNum: '',
      isBlindShipment: false,
      isNoPriceInvoice: false,
      shipViaId: null,
      cardNum: '',
      expDate: '',
      cvv: null,
      cardZip: null,
      cardName: '',
      invoiceStatus: 'INVOICE PENDING',
      accountingStatus: '',
      shippingStatus: '',
    } as any;
    await addHandwritten(newHandwritten);
    setToastOpen(true);
    await handleSearch();
    setHandwrittenCustomer(selectedCustomer);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedHandwrittenId) return;

    if (await confirm('Add warranty?')) {
      setShowWarranty(true);
    } else {
      setOpen(false);
      const handwritten = await getHandwrittenById(selectedHandwrittenId);
      if (!handwritten) return;
      onSubmit(handwritten, '', Number(qty), desc, Number(price));
    }
  };

  const handleSubmitWarranty = async (e: FormEvent) => {
    e.preventDefault();
    const handwritten = await getHandwrittenById(selectedHandwrittenId);
    if (!handwritten) return;

    let fullWar = `${handwritten.orderNotes ? '\n' : ''}`;
    if (injectorWar) fullWar += 'Injector warranty\n';
    if (customWar) fullWar += `${warranty}\n`;
    if (noWarranty) fullWar += 'No CAT Warranty\n';
    if (!fullWar && !warranty && !noVerbage) {
      console.error('Warranty cannot be blank');
      return;
    }
    if (noVerbage) fullWar = '';
    onSubmit(handwritten, fullWar, Number(qty), desc, Number(price));
  };


  return (
    <>
      <Toast msg="Created handwritten" type="success" open={toastOpen} setOpen={setToastOpen} />
    
      <Dialog
        open={open}
        setOpen={(value: boolean) => {
          setShowWarranty(false);
          setOpen(value);
        }}
        title="Select Handwritten"
        width={600}
      >
        {showWarranty ?
          <form onSubmit={handleSubmitWarranty}>
            <Input
              variant={['small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
              label="Warranty"
              value={warranty}
              onChange={(e: any) => setWarranty(e.target.value)}
            />
            <div>
              <Checkbox
                label="No CAT Warranty"
                variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
                checked={noWarranty}
                onChange={(e: any) => setNoWarranty(e.target.checked)}
              />
              <Checkbox
                label="Injector Warranty"
                variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
                checked={injectorWar}
                onChange={(e: any) => setInjectorWar(e.target.checked)}
              />
              <Checkbox
                label="Custom Warranty"
                variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
                checked={customWar}
                onChange={(e: any) => setCustomWar(e.target.checked)}
              />
            </div>
            <div className="form__footer">
              <Button type="submit">Submit</Button>
              <Button type="submit" onClick={() => setNoVerbage(true)}>Cancel Warranty</Button>
            </div>
          </form>
          :
          <>
            <form onSubmit={handleSubmit} className="select-handwritten-form">
              {/* <Button
                variant={['x-small', 'fit']}
                onClick={handleNewHandwritten}
                type="button"
                disabled={!customer?.company}
              >
                New Handwritten
              </Button> */}
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
                />
                <Input
                  variant={['x-small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
                  label="Qty"
                  type="number"
                  value={qty ?? ''}
                  onChange={(e: any) => setQty(e.target.value)}
                  required
                />
                <Input
                  variant={['x-small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
                  label="Price"
                  type="number"
                  value={price ?? ''}
                  onChange={(e: any) => setPrice(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant={['fit']}>Add Item to Handwritten</Button>
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
                  {handwrittens.map((handwritten: Handwritten) => {
                    return (
                      <tr key={handwritten.id} onClick={() => handleSelectRow(handwritten.id)} className={handwritten.id === selectedHandwrittenId ? 'select-handwritten-dialog--selected' : ''}>
                        <td>{ handwritten.id }</td>
                        <td>{ formatDate(handwritten.date) }</td>
                        <td>{ handwritten.customer ? handwritten.customer.company : null }</td>
                        <td>{ handwritten.billToCompany }</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <Pagination
                data={handwrittensData}
                setData={handleChangePage}
                minData={handwrittenCount}
                pageSize={LIMIT}
              />
            </div>
          </>
        }
      </Dialog>
    </>
  );
}
