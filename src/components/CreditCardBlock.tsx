import { editHandwrittenPaymentType } from "@/scripts/services/handwrittensService";
import Button from "./Library/Button";
import Input from "./Library/Input";
import Select from "./Library/Select/Select";
import Table from "./Library/Table";
import { useRef } from "react";
import { paymentTypes } from "@/scripts/logic/handwrittens";

interface Props {
  handwritten: Handwritten
  setPromptLeaveWindow: (value: boolean) => void
  cardNum: string
  expDate: string
  cvv: string
  cardZip: string
  cardName: string
  cardAddress: string
  payment: string
  setPayment: (value: string) => void
  setCardNum: (value: string) => void
  setExpDate: (value: string) => void
  setCvv: (value: string) => void
  setCardZip: (value: string) => void
  setCardName: (value: string) => void
  setCardAddress: (value: string) => void
}


export default function CreditCardBlock({
  handwritten,
  setPromptLeaveWindow,
  cardNum,
  expDate,
  cvv,
  cardZip,
  cardName,
  cardAddress,
  payment,
  setPayment,
  setCardNum,
  setExpDate,
  setCvv,
  setCardZip,
  setCardName,
  setCardAddress
}: Props) {
  const ccLabelRef = useRef(null);

  const handleChangeCard = () => {
    if (cardNum || cvv || expDate) {
      setPromptLeaveWindow(true);
    } else {
      setPromptLeaveWindow(false);
    }
  };

  const handleDetectPaymentType = async (num: string) => {
    if (!num) return;
    switch (Number(num)) {
    case 3:
      await handleChangePayment(handwritten.id, 'AMEX');
      break;
    case 4:
      await handleChangePayment(handwritten.id, 'Visa');
      break;
    case 5:
      await handleChangePayment(handwritten.id, 'Mastercard');
      break;
    case 6:
      await handleChangePayment(handwritten.id, 'Discover');
      break;
    default:
      break;
    }
  };

  const handleChangePayment = async (id: number, value: string) => {
    setPayment(value);
    await editHandwrittenPaymentType(id, value);
  };


  return (
    <div ref={ccLabelRef}>
      <Table variant={['plain', 'edit-row-details']}>
        <tbody>
          <tr>
            <th>Card Number</th>
            <td>
              <Input
                variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                value={cardNum}
                onChange={(e: any) => {
                  setCardNum(e.target.value);
                  handleChangeCard();
                  if (e.target.value.length === 1 || `${cardNum}`.charAt(0) !== e.target.value.trim().charAt(0)) {
                    handleDetectPaymentType(e.target.value.trim().charAt(0));
                  }
                }}
              />
            </td>
          </tr>
          <tr>
            <th>Exp Date</th>
            <td>
              <Input
                variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                value={expDate}
                onChange={(e: any) => {
                  setExpDate(e.target.value);
                  handleChangeCard();
                }}
              />
            </td>
          </tr>
          <tr>
            <th>Security Code</th>
            <td>
              <Input
                variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                value={cvv}
                type="number"
                onChange={(e: any) => {
                  setCvv(e.target.value);
                  handleChangeCard();
                }}
              />
            </td>
          </tr>
          <tr>
            <th>Card Zip Code</th>
            <td>
              <Input
                variant={['x-small', 'thin', 'label-space-between', 'label-full-width', 'label-bold']}
                value={cardZip}
                onChange={(e: any) => setCardZip(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <th>Card Address</th>
            <td>
              <Input
                variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold', 'search']}
                value={cardAddress}
                onChange={(e: any) => setCardAddress(e.target.value)}
              >
                <Button
                  variant={['x-small']}
                  style={{ width: '10rem' }}
                  onClick={() => {
                    setCardAddress(handwritten.billToAddress ?? '');
                    setCardZip(handwritten.billToZip ?? '');
                  }}
                  type="button"
                >
                  Same as Bill To
                </Button>
              </Input>
            </td>
          </tr>
          <tr>
            <th>Card Name</th>
            <td>
              <Input
                variant={['small', 'thin', 'label-space-between', 'label-full-width', 'label-bold', 'search']}
                value={cardName}
                onChange={(e: any) => setCardName(e.target.value)}
              >
                <Button variant={['x-small']} style={{ width: '10rem' }} onClick={() => setCardName(handwritten.billToCompany ?? '')} type="button">Same as Bill To</Button>
              </Input>
            </td>
          </tr>
          <tr>
            <th>Payment Type</th>
            <td>
              <Select
                value={payment}
                onChange={(e: any) => handleChangePayment(handwritten.id, e.target.value)}
              >
                <option value="">-- SELECT PAYMENT TYPE --</option>
                {paymentTypes.map((type, i) => {
                  return <option key={i}>{ type }</option>;
                })}
              </Select>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
