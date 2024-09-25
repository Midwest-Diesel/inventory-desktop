import { FormEvent, useEffect, useState } from "react";
import Dialog from "../../Library/Dialog";
import { addHandwrittenItemChild, editHandwrittenItems, editHandwrittenOrderNotes, getHandwrittenById, getHandwrittenCount, getSomeHandwrittens, searchHandwrittens } from "@/scripts/controllers/handwrittensController";
import Table from "@/components/Library/Table";
import { formatDate } from "@/scripts/tools/stringUtils";
import Pagination from "@/components/Library/Pagination";
import Input from "@/components/Library/Input";
import Button from "@/components/Library/Button";
import Checkbox from "@/components/Library/Checkbox";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  handleAddToHandwritten: (id: number, desc: string, qty: number, price: number, warranty: string) => void
  part: Part
}


export default function SelectHandwrittenDialog({ open, setOpen, handleAddToHandwritten, part }: Props) {
  const [handwrittensData, setHandwrittensData] = useState<Handwritten[]>([]);
  const [handwrittens, setHandwrittens] = useState<Handwritten[]>([]);
  const [handwrittenCount, setHandwrittenCount] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedHandwrittenId, setSelectedHandwrittenId] = useState(0);
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState('');
  const [warranty, setWarranty] = useState('');
  const [noWarranty, setNoWarranty] = useState(false);
  const [noVerbage, setNoVerbage] = useState(false);
  const [injectoryWar, setInjectoryWar] = useState(false);
  const [customWar, setCustomWar] = useState(false);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      resetHandwrittensList();
    };
    setDesc(part.desc);
    setQty(part.qty);
    fetchData();
  }, [open]);

  const resetHandwrittensList = async () => {
    const pageCount = await getHandwrittenCount();
    setHandwrittenCount(pageCount);

    const res = await getSomeHandwrittens(1, 26);
    setHandwrittensData(res);
    setHandwrittens(res);
  };
  
  const handleChangePage = async (data: any, page: number) => {
    if (page === currentPage) return;
    const res = await getSomeHandwrittens(page, 26);
    setHandwrittens(res);
    setCurrentPage(page);
  };

  const handleSelectRow = (id: number) => {
    setSelectedHandwrittenId(id);
    window.open(`${location.origin}/handwrittens/${id}`, '_blank', 'popup=true');
  };

  const handleSubmitNewHandwritten = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedHandwrittenId) return;
    const handwritten = await getHandwrittenById(selectedHandwrittenId) as Handwritten;
    let fullWar = `${handwritten.orderNotes ? '\n' : ''}`;
    if (injectoryWar) fullWar += 'Injector warranty\n';
    if (customWar) fullWar += `${warranty}\n`;
    if (noWarranty) fullWar += 'No CAT Warranty\n';
    if (!fullWar && !warranty && !noVerbage) {
      console.error('Warranty cannot be blank');
      return;
    }
    if (noVerbage) fullWar = '';
    const newItem = handwritten.handwrittenItems.find((item) => item.partNum === part.partNum);
    if (newItem) {
      if (confirm('Part already exists do you want to add qty?')) {
        await editHandwrittenItems({ ...newItem, qty: newItem.qty + Number(qty), handwrittenId: handwritten.id });
        await addHandwrittenItemChild(newItem.id, { partId: part.id, qty: qty, cost: Number(price) } as HandwrittenItemChild);
        await editHandwrittenOrderNotes(handwritten.id, fullWar);
      } else {
        handleAddToHandwritten(selectedHandwrittenId, desc, Number(qty), Number(price), fullWar);
      }
    } else {
      handleAddToHandwritten(selectedHandwrittenId, desc, Number(qty), Number(price), fullWar);
    }
    setOpen(false);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (search) {
      const res = await searchHandwrittens({ customer: search });
      setHandwrittens(res);
      setHandwrittenCount([]);
    } else {
      resetHandwrittensList();
    }
  };


  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Select Handwritten"
      width={600}
    >
      <form onSubmit={handleSubmitNewHandwritten} className="select-handwritten-form">
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
            value={qty}
            onChange={(e: any) => setQty(e.target.value)}
            required
          />
          <Input
            variant={['x-small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
            label="Price"
            type="number"
            value={price}
            onChange={(e: any) => setPrice(e.target.value)}
            required
          />
          <Input
            variant={['small', 'thin', 'label-bold', 'label-stack', 'label-fit-content']}
            label="Warranty"
            value={warranty}
            onChange={(e: any) => setWarranty(e.target.value)}
          />
        </div>
        <div>
          <Checkbox
            label="No CAT Warranty"
            variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
            checked={noWarranty}
            onChange={(e: any) => setNoWarranty(e.target.checked)}
          />
          <Checkbox
            label="No Verbage"
            variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
            checked={noVerbage}
            onChange={(e: any) => setNoVerbage(e.target.checked)}
          />
          <Checkbox
            label="Injector Warranty"
            variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
            checked={injectoryWar}
            onChange={(e: any) => setInjectoryWar(e.target.checked)}
          />
          <Checkbox
            label="Custom Warranty"
            variant={['label-bold', 'dark-bg', 'label-align-center', 'label-fit']}
            checked={customWar}
            onChange={(e: any) => setCustomWar(e.target.checked)}
          />
        </div>
        <Button type="submit" variant={['fit']}>Add to Handwritten</Button>
      </form>

      <form onSubmit={handleSearch} className="search-handwritten-form">
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
                  <td>{ handwritten.customer.company }</td>
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
          pageSize={26}
        />
      </div>
    </Dialog>
  );
}
