import { FormEvent, useEffect, useState } from "react";
import Button from "../Library/Button";
import Grid from "../Library/Grid/Grid";
import GridItem from "../Library/Grid/GridItem";
import Input from "../Library/Input";
import Table from "../Library/Table";
import { parseDateInputValue } from "@/scripts/tools/stringUtils";
import { addWarrantyItem, deleteWarrantyItem, editWarranty, editWarrantyItem, getWarrantyById } from "@/scripts/services/warrantiesService";
import Checkbox from "../Library/Checkbox";
import CustomerDropdown from "../Library/Select/CustomerDropdown";
import { getCustomerByName } from "@/scripts/services/customerService";
import { PreventNavigation } from "../PreventNavigation";
import { ask } from "@/scripts/config/tauri";

interface Props {
  warrantyData: Warranty
  setWarranty: (warrantyData: Warranty) => void
  setIsEditing: (value: boolean) => void
}


export default function EditWarrantyDetails({ warrantyData, setWarranty, setIsEditing }: Props) {
  const [company, setCompany] = useState(warrantyData.customer?.company ?? '');
  const [date, setDate] = useState<Date>(warrantyData.date);
  const [vendor, setVendor] = useState(warrantyData.vendor ?? '');
  const [vendorWarrantyNum, setVendorWarrantyNum] = useState<number | null>(warrantyData.vendorWarrantyNum);
  const [handwrittenId, setHandwrittenId] = useState<number | null>(warrantyData.handwrittenId);
  const [warrantyItems, setWarrantyItems] = useState<WarrantyItem[]>(warrantyData.warrantyItems);
  const [changesSaved, setChangesSaved] = useState(true);

  useEffect(() => setWarrantyItems(warrantyData.warrantyItems), [warrantyData]);

  const saveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(false);
    const newCustomer = await getCustomerByName(company);
    const newWarranty = {
      id: Number(warrantyData.id),
      customer: newCustomer,
      date,
      vendor,
      vendorWarrantyNum: vendorWarrantyNum ?? null,
      warrantyItems,
      handwrittenId
    } as Warranty;
    await editWarranty(newWarranty);
    if (JSON.stringify(warrantyItems) !== JSON.stringify(warrantyData.warrantyItems)) {
      for (let i = 0; i < warrantyItems.length; i++) {
        const item = warrantyItems[i];
        await editWarrantyItem(item);
      }
    }
    setWarranty(await getWarrantyById(warrantyData.id));
    setIsEditing(false);
  };

  const stopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  const handleEditItem = async (item: WarrantyItem, i: number) => {
    const newItems = [...warrantyItems];
    newItems[i] = item;
    setWarrantyItems(newItems);
  };

  const handleDeleteItem = async (id: number) => {
    if (!await ask('Are you sure you want to delete this item?')) return;
    const newItems = warrantyItems.filter((i: WarrantyItem) => i.id !== id);
    await deleteWarrantyItem(id);
    setWarrantyItems(newItems);
  };

  const handleNewItem = async () => {
    const newItem = {
      warrantyId: warrantyData.id,
      stockNum: '',
      qty: 0,
      partNum: '',
      desc: '',
      cost: 0,
      price: 0,
      returnedVendorDate: null,
      claimReason: '',
      vendorReport: '',
      hasVendorReplacedPart: false,
      vendorCredit: '',
      isCustomerCredited: false,
    } as any;
    await addWarrantyItem(newItem);
    const res = await getWarrantyById(warrantyData.id);
    setWarranty(res);
  };


  return (
    <>
      <PreventNavigation shouldPrevent={!changesSaved} text="Leave without saving changes?" />

      {warrantyData &&
        <form className="edit-warranty-details" onSubmit={(e) => saveChanges(e)} onChange={() => setChangesSaved(false)}>
          <div className="edit-warranty-details__header">
            <h2>{ warrantyData.id }</h2>
          
            <div className="header__btn-container">
              <Button
                variant={['save']}
                className="edit-warranty-details__save-btn"
                type="submit"
              >
                Save
              </Button>
              <Button
                className="edit-warranty-details__close-btn"
                type="button"
                onClick={stopEditing}
              >
                Cancel Editing
              </Button>
            </div>
          </div>

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={6} breakpoints={[{ width: 1600, colStart: 1, colEnd: 8 }]} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Customer</th>
                    <td>
                      <CustomerDropdown
                        variant={['fill', 'label-full-width', 'label-full-height', 'no-margin']}
                        value={company}
                        onChange={(value: any) => setCompany(value)}
                        maxHeight="15rem"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Warranty Date</th>
                    <td>
                      <Input
                        variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                        value={parseDateInputValue(date)}
                        type="date"
                        onChange={(e: any) => setDate(new Date(e.target.value))}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={6} colEnd={11} breakpoints={[{ width: 1600, colStart: 1, colEnd: 6 }]} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'edit-row-details']}>
                <tbody>
                  <tr>
                    <th>Vendor</th>
                    <td>
                      <Input
                        value={vendor}
                        onChange={(e: any) => setVendor(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Vendor Warranty Number</th>
                    <td>
                      <Input
                        type="number"
                        value={vendorWarrantyNum ?? ''}
                        onChange={(e: any) => setVendorWarrantyNum(e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Connected Handwritten</th>
                    <td>
                      <Input
                        type="number"
                        value={handwrittenId ?? ''}
                        onChange={(e: any) => setHandwrittenId(e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={1} colEnd={12} variant={['no-style']} style={{ marginTop: '1rem' }}>
              <h3>Warranty Items</h3> 
              <Table>
                <thead>
                  <tr>
                    <th>Stock Num</th>
                    <th>Qty</th>
                    <th>Part Num</th>
                    <th>Desc</th>
                    <th>Cost</th>
                    <th>Price</th>
                    <th>Returned to Vendor</th>
                    <th>Claim Reason</th>
                    <th>Vendor Report</th>
                    <th>Vendor Credit</th>
                    <th>Part Replaced by Vendor</th>
                    <th>Customer Credited</th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyItems.map((item: WarrantyItem, i: number) => { 
                    return (
                      <tr key={i}>
                        <td>
                          <Input
                            value={item.stockNum ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, stockNum: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            value={item.qty ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, qty: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.partNum ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, partNum: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.desc ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, desc: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="any"
                            value={item.cost ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, cost: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            type="number"
                            step="any"
                            value={item.price ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, price: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            type="date"
                            value={parseDateInputValue(item.returnedVendorDate)}
                            onChange={(e: any) => handleEditItem({ ...item, returnedVendorDate: new Date(e.target.value) }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.claimReason ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, claimReason: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.vendorReport ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, vendorReport: e.target.value }, i)}
                          />
                        </td>
                        <td>
                          <Input
                            value={item.vendorCredit ?? ''}
                            onChange={(e: any) => handleEditItem({ ...item, vendorCredit: e.target.value }, i)}
                          />
                        </td>
                        <td className="cbx-td">
                          <Checkbox
                            checked={item.hasVendorReplacedPart}
                            onChange={(e: any) => handleEditItem({ ...item, hasVendorReplacedPart: e.target.checked }, i)}
                          />
                        </td>
                        <td className="cbx-td">
                          <Checkbox
                            checked={item.isCustomerCredited}
                            onChange={(e: any) => handleEditItem({ ...item, isCustomerCredited: e.target.checked }, i)}
                          />
                        </td>
                        <td>
                          <Button
                            variant={['red-color']}
                            onClick={() => handleDeleteItem(item.id)}
                            type="button"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <Button type="button" onClick={handleNewItem}>Add</Button>
            </GridItem>
          </Grid>
        </form>
      }
    </>
  );
}
