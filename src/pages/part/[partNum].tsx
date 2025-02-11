import { Layout } from "@/components/Layout";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";
import { getImagesFromPart, getImagesFromStockNum } from "@/scripts/controllers/imagesController";
import Table from "@/components/Library/Table";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { deletePart, editPart, getPartById, getPartCostIn, getPartEngineCostOut } from "@/scripts/controllers/partsController";
import PartPicturesDialog from "@/components/Dialogs/PartPicturesDialog";
import EditPartDetails from "@/components/Dashboard/EditPartDetails";
import EngineCostOutTable from "@/components/EngineCostOut";
import Loading from "@/components/Library/Loading";
import Link from "next/link";
import { getEngineByStockNum, getEngineCostRemaining } from "@/scripts/controllers/enginesController";
import PartCostIn from "@/components/PartCostIn";
import StockNumPicturesDialog from "@/components/Dialogs/StockNumPicturesDialog";
import { setTitle } from "@/scripts/tools/utils";
import { invoke } from "@/scripts/config/tauri";
import Modal from "@/components/Library/Modal";


export default function PartDetails() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [part, setPart] = useState<Part>(null);
  const [engine, setEngine] = useState<Engine>(null);
  const [picturesOpen, setPicturesOpen] = useState(false);
  const [snPicturesOpen, setSnPicturesOpen] = useState(false);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [snPictures, setSnPictures] = useState<Picture[]>([]);
  const [isEditingPart, setIsEditingPart] = useState(false);
  const [costRemaining, setCostRemaining] = useState(null);
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>([]);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>([]);
  const [costAlertMsg, setCostAlertMsg] = useState('');
  const [costAlertOpen, setCostAlertOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  useEffect(() => {}, [pictures, snPictures, part]);

  const fetchData = async () => {
    if (!params) return;
    const part = await getPartById(Number(params.partNum));
    const engine = await getEngineByStockNum(part.engineNum);
    setTitle(`${part.partNum} ${part.desc}`);
    setPart(part);
    setEngine(engine);

    const pictures = await getImagesFromPart(part.partNum);
    setPictures(pictures);
    setSnPictures(await getImagesFromStockNum(part.stockNum));

    const costRes = await getEngineCostRemaining(part.engineNum);
    setCostRemaining(costRes);
    setPartCostIn(await getPartCostIn(part.stockNum));
    setEngineCostOut(await getPartEngineCostOut(part.stockNum));
    if (costRes > 0) {
      setCostAlertMsg(`${formatCurrency(costRes)} remaining on engine`);
      setCostAlertOpen(true);
    }
  };

  const getTotalCostIn = () => {
    return partCostIn.reduce((acc, val) => acc + val.cost, 0);
  };

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this part') !== 'confirm') return;
    await deletePart(part.id);
    router.replace('/');
  };

  const handleAddToUP = async () => {
    const qty = Number(prompt('Enter qty to add'));
    if (!qty) return;
    await editPart({ ...part, qty: qty + part.qty });
    await fetchData();
    await handlePrint();
  };

  const handlePrint = async () => {
    const copies = Number(prompt('How many tags do you want to print?', '1'));
    if (copies <= 0) return;
    const args = {
      stockNum: part.stockNum || '',
      model: engine.model || '',
      serialNum: engine.serialNum || '',
      hp: engine.horsePower || '',
      location: part.location || '',
      remarks: part.remarks || '',
      date: formatDate(part.entryDate) || '',
      partNum: part.partNum || '',
      rating: Number(part.rating) || 0,
      copies
    };
    await invoke('print_part_tag', { args });
  };


  return (
    <Layout title="Part">
      {costAlertOpen &&
        <Modal
          style={{ backgroundColor: 'var(--orange-1)' }}
          open={costAlertOpen}
          setOpen={setCostAlertOpen}
        >
          <h1>Cost Remaining</h1>
          <h2>{ costAlertMsg }</h2>
        </Modal>
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
                data-id="edit-btn"
              >
                Edit
              </Button>
              <Button
                className="part-details__close-btn"
                onClick={() => window.history.back()}
              >
                Close
              </Button>
              {user.accessLevel > 1 &&
                <Button
                  variant={['danger']}
                  className="part-details__delete-btn"
                  onClick={handleDelete}
                  data-id="delete-btn"
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
                <Image
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
            <Button onClick={handleAddToUP} data-id="add-to-up-btn">Add to UP</Button>
            <Button onClick={handlePrint}>Print Tag</Button>
          </div>


          { part.imageExists && <PartPicturesDialog open={picturesOpen} setOpen={setPicturesOpen} pictures={pictures} /> }        
          { part.snImageExists && <StockNumPicturesDialog open={snPicturesOpen} setOpen={setSnPicturesOpen} pictures={snPictures} /> }

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={7} rowStart={1} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Qty</th>
                    <td data-id="qty">{ part.qty }</td>
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
                            <Image
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
                    <th>Entry Date</th>
                    <td>{ formatDate(part.entryDate) }</td>
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
                    <th>New Fleet Price</th>
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
                    <th>Our Cost</th>
                    <td>{ formatCurrency(getTotalCostIn()) }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem rowStart={1} colStart={7} colEnd={12} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr style={{ height: '4rem' }}>
                    <th>Alt Parts</th>
                    <td data-id="alt-parts">{ part.altParts.join(', ') }</td>
                  </tr>
                  <tr style={{ height: '4rem' }}>
                    <th>Remarks</th>
                    <td>{ part.remarks }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={7} colEnd={12} rowStart={2} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Engine Stock #</th>
                    <td>
                      {engine && part.engineNum > 1 ?
                        <Link href={`/engines/${part.engineNum}`}>{ part.engineNum }</Link>
                        :
                        <p>{ part.engineNum }</p>
                      }
                    </td>
                  </tr>
                  <tr>
                    <th>Serial Number</th>
                    <td>{ engine.serialNum }</td>
                  </tr>
                  <tr>
                    <th>Horse Power</th>
                    <td>{ engine.horsePower }</td>
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

            <GridItem variant={['no-style']} rowStart={4} colStart={6} colEnd={12}>
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
    </Layout>
  );
}
