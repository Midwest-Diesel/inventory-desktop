import { useParams } from "react-router-dom";
import { formatCurrency, formatDate, formatPercent } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";
import { getImagesFromPart, getImagesFromStockNum } from "@/scripts/services/imagesService";
import Table from "@/components/Library/Table";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { addToPartQtyHistory, deletePart, editPart, getNextUPStockNum, getPartById, getPartCostIn, getPartEngineCostOut, getPartsQtyHistory } from "@/scripts/services/partsService";
import PartPicturesDialog from "@/components/Dialogs/PartPicturesDialog";
import EditPartDetails from "@/components/EditPartDetails";
import EngineCostOutTable from "@/components/EngineCostOut";
import Loading from "@/components/Library/Loading";
import Link from "@/components/Library/Link";
import { getEngineByStockNum, getEngineCostRemaining } from "@/scripts/services/enginesService";
import PartCostIn from "@/components/PartCostIn";
import StockNumPicturesDialog from "@/components/Dialogs/StockNumPicturesDialog";
import { setTitle } from "@/scripts/tools/utils";
import Modal from "@/components/Library/Modal";
import { getSurplusCostRemaining } from "@/scripts/services/surplusService";
import { useNavState } from "@/hooks/useNavState";
import { usePrintQue } from "@/hooks/usePrintQue";
import { ask } from "@/scripts/config/tauri";
import PartQtyHistoryDialog from "@/components/Dialogs/PartQtyHistoryDialog";


export default function PartDetailsContainer() {
  const { closeBtn, push } = useNavState();
  const { addToQue, printQue } = usePrintQue();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [part, setPart] = useState<Part | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [history, setHistory] = useState<PartQtyHistory[]>([]);
  const [picturesOpen, setPicturesOpen] = useState(false);
  const [snPicturesOpen, setSnPicturesOpen] = useState(false);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [snPictures, setSnPictures] = useState<Picture[]>([]);
  const [isEditingPart, setIsEditingPart] = useState(false);
  const [costRemaining, setCostRemaining] = useState<number | null>(null);
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>([]);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>([]);
  const [costAlertAmount, setCostAlertAmount] = useState('');
  const [costAlertPurchasedFrom, setCostAlertPurchasedFrom] = useState('');
  const [costAlertOpen, setCostAlertOpen] = useState(false);
  const [partQtyHistoryOpen, setPartQtyHistoryOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  useEffect(() => {
    if (!part || isEditingPart) return;
    const fetchTables = async () => {
      const costRes = await getEngineCostRemaining(part?.engineNum ?? 0);
      setCostRemaining(costRes);
      setPartCostIn(await getPartCostIn(part?.stockNum ?? ''));
      setEngineCostOut(await getPartEngineCostOut(part?.stockNum ?? ''));
    };
    fetchTables();
  }, [isEditingPart]);

  useEffect(() => {
    if (!part) return;
    const fetchData = async () => {
      const history = await getPartsQtyHistory(part.id);
      setHistory(history);
    };
    fetchData();
  }, [partQtyHistoryOpen, part]);

  useEffect(() => {}, [pictures, snPictures, part]);

  const fetchData = async () => {
    if (!params) return;
    const part = await getPartById(Number(params.partNum));
    if (!part) return;
    const engine = await getEngineByStockNum(part.engineNum);
    setTitle(`${part.partNum} ${part.desc}`);
    setPart(part);
    setEngine(engine);

    const costRes = await getEngineCostRemaining(part.engineNum ?? 0);
    setCostRemaining(costRes);
    if (Number(costRes) > 0) {
      setCostAlertAmount(formatCurrency(costRes));
      setCostAlertOpen(true);
    }
    
    setPartCostIn(await getPartCostIn(part.stockNum ?? ''));
    setEngineCostOut(await getPartEngineCostOut(part.stockNum ?? ''));

    const pictures = await getImagesFromPart(part.partNum) ?? [];
    setPictures(pictures);
    setSnPictures(await getImagesFromStockNum(part.stockNum ?? '') ?? []);

    if (!part.purchasedFrom) return;
    const costRemaining = await getSurplusCostRemaining(part.purchasedFrom);
    if (Number(costRemaining) > 0) {
      setCostAlertAmount(formatCurrency(costRemaining));
      setCostAlertPurchasedFrom(part.purchasedFrom ?? '');
      setCostAlertOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!part?.id || user.accessLevel <= 1 || prompt('Type "confirm" to delete this part') !== 'confirm') return;
    await deletePart(part.id);
    await push('Home', '/');
  };

  const handleAddToUP = async () => {
    const qty = Number(prompt('Enter qty to add'));
    if (!qty || !part) return;
    await editPart({ ...part, qty: qty + (part?.qty ?? 0) });
    await addToPartQtyHistory(part.id, qty);
    await fetchData();
    await handlePrint();
  };

  const handlePrint = async () => {
    const copies = Number(prompt('How many tags do you want to print?', '1'));
    if (copies <= 0) return;
    const pictures = await getImagesFromPart(part?.partNum ?? '') ?? [];

    for (let i = 0; i < copies; i++) {
      const args = {
        stockNum: part?.stockNum ?? '',
        model: engine?.model ?? '',
        serialNum: engine?.serialNum ?? '',
        hp: engine?.horsePower ?? '',
        location: part?.location ?? '',
        remarks: part?.remarks ?? '',
        date: formatDate(part?.entryDate) ?? '',
        partNum: part?.partNum ?? '',
        rating: part?.rating,
        hasPictures: pictures.length > 0
      };
      addToQue('partTag', 'print_part_tag', args, '1500px', '1000px');
    }
    printQue();
  };

  const handleSetNextUP = async () => {
    const latestUP = await getNextUPStockNum();
    if (!latestUP || !part || !await ask(`Change the current stock number to ${latestUP}?`)) return;
    const newPart = { ...part, stockNum: latestUP };
    await editPart(newPart);
    setPart(newPart);
  };


  return (
    <div>
      {costAlertOpen &&
        <Modal
          style={{ backgroundColor: 'var(--orange-1)' }}
          open={costAlertOpen}
          setOpen={setCostAlertOpen}
        >
          <h2>If you are selling this part</h2>
          <h1>STOP!!!</h1>
          <br />
          {costAlertPurchasedFrom &&
            <>
              <h2>This part is from:</h2>
              <h1>{ costAlertPurchasedFrom }</h1>
            </>
          }
          <h2>Cost Remaining:</h2>
          <h1>{ costAlertAmount }</h1>
        </Modal>
      }

      {part &&
        <PartQtyHistoryDialog
          open={partQtyHistoryOpen}
          setOpen={setPartQtyHistoryOpen}
          part={part}
          history={history}
        />
      }

      {part ? isEditingPart ?
        <EditPartDetails
          part={part}
          setPart={setPart}
          setIsEditingPart={setIsEditingPart}
          partCostInData={partCostIn}
          engineCostOutData={engineCostOut}
          setPartCostInData={setPartCostIn}
          setEngineCostOutData={setEngineCostOut}
        />
        :
        <div className="part-details">
          <div className="part-details__header">
            <div className="header__btn-container">
              <Button
                variant={['blue']}
                className="part-details__edit-btn"
                onClick={() => setIsEditingPart(true)}
                disabled={costRemaining === null}
                data-testid="edit-btn"
              >
                Edit
              </Button>
              <Button
                className="part-details__close-btn"
                onClick={async () => await closeBtn()}
              >
                Back
              </Button>
              {user.accessLevel > 1 &&
                <Button
                  variant={['danger']}
                  className="part-details__delete-btn"
                  onClick={handleDelete}
                  data-testid="delete-btn"
                >
                  Delete
                </Button>
              }
            </div>

            <h2>{ part.partNum }</h2>
            <h2>{ part.desc }</h2>
            {part.imageExists &&
              <Button
                variant={['plain','hover-move']}
                onClick={() => setPicturesOpen(true)}
              >
                <img
                  src="/images/icons/image.svg"
                  alt="detail"
                  width={20}
                  height={20}
                  style={{ alignSelf: 'center' }}
                />
              </Button>
            }
          </div>

          <div className="part-details__top-bar">
            <Button onClick={handleAddToUP} data-testid="add-to-up-btn">Add to UP</Button>
            <Button onClick={() => handlePrint()}>Print Tag</Button>
            <Button onClick={() => handleSetNextUP()}>Set Next UP #</Button>
            <Button onClick={() => setPartQtyHistoryOpen(true)} disabled={history.length === 0}>Qty History</Button>
          </div>


          { part.imageExists && picturesOpen && <PartPicturesDialog open={picturesOpen} setOpen={setPicturesOpen} pictures={pictures} partNum={part.partNum} /> }        
          { part.snImageExists && snPicturesOpen && <StockNumPicturesDialog open={snPicturesOpen} setOpen={setSnPicturesOpen} pictures={snPictures} stockNum={part.stockNum} /> }

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={7} rowStart={1} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Qty</th>
                    <td data-testid="qty">{ part.qty }</td>
                  </tr>
                  <tr>
                    <th>Stock Number</th>
                    <td>
                      <div className="part-details__stock-pics">
                        { part.stockNum }
                        {part.snImageExists &&
                          <Button
                            variant={['plain','hover-move']}
                            onClick={() => setSnPicturesOpen(true)}
                          >
                            <img
                              src="/images/icons/image.svg"
                              alt="detail"
                              width={20}
                              height={20}
                              style={{ alignSelf: 'center' }}
                            />
                          </Button>
                        }
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>{ part.location }</td>
                  </tr>
                  <tr>
                    <th>Manufacturer</th>
                    <td>{ part.manufacturer }</td>
                  </tr>
                  <tr>
                    <th>Purchased From</th>
                    <td>{ part.purchasedFrom }</td>
                  </tr>
                  <tr>
                    <th>Condition</th>
                    <td>{ part.condition }</td>
                  </tr>
                  <tr>
                    <th>Rating</th>
                    <td>{ part.rating }</td>
                  </tr>
                  <tr>
                    <th>Core Family</th>
                    <td>{ part.coreFam }</td>
                  </tr>
                  <tr>
                    <th>Entry Date</th>
                    <td>{ formatDate(part.entryDate) }</td>
                  </tr>
                  <tr>
                    <th>Price Last Updated</th>
                    <td>{ formatDate(part.priceLastUpdated) }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={1} colEnd={7} rowStart={2} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>New List Price</th>
                    <td>{ formatCurrency(part.listPrice) }</td>
                  </tr>
                  <tr>
                    <th>Dealer Price</th>
                    <td>{ formatCurrency(part.fleetPrice) }</td>
                  </tr>
                  <tr>
                    <th>Reman List Price</th>
                    <td>{ formatCurrency(part.remanListPrice) }</td>
                  </tr>
                  <tr>
                    <th>Reman Fleet Price</th>
                    <td>{ formatCurrency(part.remanFleetPrice) }</td>
                  </tr>
                  <tr>
                    <th>Core Price</th>
                    <td>{ formatCurrency(part.corePrice) }</td>
                  </tr>
                  <tr>
                    <th>Purchase Price</th>
                    <td>{ formatCurrency(part.purchasePrice) }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem rowStart={1} colStart={7} colEnd={13} variant={['no-style']}>
              <GridItem variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr style={{ height: '4rem' }}>
                      <th>Alt Parts</th>
                      <td data-testid="alt-parts">{ part.altParts.join(', ') }</td>
                    </tr>
                    <tr style={{ height: '4rem' }}>
                      <th>Remarks</th>
                      <td>{ part.remarks }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>
              <br />

              <GridItem variant={['low-opacity-bg']}>
                <Table variant={['plain', 'row-details']}>
                  <tbody>
                    <tr>
                      <th>Sold Date</th>
                      <td data-testid="sold-date">{ formatDate(part.soldToDate) }</td>
                    </tr>
                    <tr>
                      <th>Qty Sold</th>
                      <td data-testid="qty-sold">{ part.qtySold }</td>
                    </tr>
                    <tr>
                      <th>Sell Price</th>
                      <td data-testid="selling-price">{ formatCurrency(part.sellingPrice) }</td>
                    </tr>
                    <tr>
                      <th>Sold To</th>
                      <td data-testid="sold-to">{ part.soldTo }</td>
                    </tr>
                    <tr>
                      <th>Profit Margin</th>
                      <td data-testid="profit-margin">{ formatCurrency(part.profitMargin) }</td>
                    </tr>
                    <tr>
                      <th>Profit %</th>
                      <td data-testid="profit-percent">{ Number(part.profitPercent) > 0 && formatPercent(part.profitPercent) }</td>
                    </tr>
                    <tr>
                      <th>Handwritten</th>
                      <td>{ part.handwrittenId ? <Link href={`/handwrittens/${part.handwrittenId}`}>{ part.handwrittenId }</Link> : null }</td>
                    </tr>
                  </tbody>
                </Table>
              </GridItem>
            </GridItem>

            <GridItem colStart={7} colEnd={13} rowStart={2} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Engine Stock #</th>
                    <td>
                      {engine && (part?.engineNum ?? 0) > 1 ?
                        <Link href={`/engines/${part.engineNum}`}>{ part.engineNum }</Link>
                        :
                        <p>{ part.engineNum }</p>
                      }
                    </td>
                  </tr>
                  <tr>
                    <th>Serial Number</th>
                    <td>{ engine?.serialNum }</td>
                  </tr>
                  <tr>
                    <th>Horse Power</th>
                    <td>{ engine?.horsePower }</td>
                  </tr>
                  <tr>
                    {costRemaining !== null ?
                      <>
                        <th style={costRemaining > 0 ? { color: 'var(--red-2)' } : { color: 'var(--green-light-1)' }}>Engine Cost Remaining</th>
                        <td>{ formatCurrency(costRemaining) }</td>
                      </>
                      :
                      <>
                        <th>Engine Cost Remaining</th>
                        <td><Loading size={20} /></td>
                      </>
                    }
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={1} colEnd={7} rowStart={3} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Shipping Weights/Dims</th>
                    <td>{ part.weightDims }</td>
                  </tr>
                  <tr style={{ height: '4rem' }}>
                    <th>Sales Notes</th>
                    <td>{ part.specialNotes }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            {part.partsCostIn && part.partsCostIn.length > 0 &&
              <GridItem variant={['no-style']} rowStart={3} colStart={1} colEnd={12}>
                <h2>Parts Cost In</h2>
                <Table>
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Vendor</th>
                      <th>Cost Type</th>
                      <th>Cost</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {part.partsCostIn.map((item, i) => {
                      return (
                        <tr key={i}>
                          <td>{ item.invoiceNum }</td>
                          <td>{ item.vendor }</td>
                          <td>{ item.costType }</td>
                          <td>{ item.cost }</td>
                          <td>{ item.note }</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </GridItem>
            }

            <GridItem variant={['no-style']} rowStart={4} colStart={1} colEnd={6}>
              <h2>Part Cost In</h2>
              {partCostIn.length > 0 ?
                <PartCostIn partCostInData={partCostIn} />
                :
                <p>Empty</p>
              }
            </GridItem>

            <GridItem variant={['no-style']} rowStart={4} colStart={7} colEnd={12}>
              <h2>Engine Cost Out</h2>
              {engineCostOut.length > 0 ?
                <EngineCostOutTable engineCostOut={engineCostOut} />
                :
                <p>Empty</p>
              }
            </GridItem>
          </Grid>
        </div>
        :
        <Loading />
      }
    </div>
  );
}
