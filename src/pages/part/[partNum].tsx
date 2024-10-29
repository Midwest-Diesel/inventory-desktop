import { Layout } from "@/components/Layout";
import { useParams } from "next/navigation";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";
import { checkImageExists, getImagesFromPart, getImagesFromStockNum } from "@/scripts/controllers/imagesController";
import Table from "@/components/Library/Table";
import Button from "@/components/Library/Button";
import Grid from "@/components/Library/Grid/Grid";
import GridItem from "@/components/Library/Grid/GridItem";
import { useAtom } from "jotai";
import { picturesAtom, snPicturesAtom, userAtom } from "@/scripts/atoms/state";
import { deletePart, getPartById, getPartCostIn, getPartEngineCostOut } from "@/scripts/controllers/partsController";
import PartPicturesDialog from "@/components/Dialogs/PartPicturesDialog";
import EditPartDetails from "@/components/Dashboard/EditPartDetails";
import EngineCostOutTable from "@/components/EngineCostOut";
import Loading from "@/components/Library/Loading";
import Link from "next/link";
import { getEngineCostRemaining } from "@/scripts/controllers/enginesController";
import PartCostIn from "@/components/PartCostIn";
import Toast from "@/components/Library/Toast";
import StockNumPicturesDialog from "@/components/Dialogs/StockNumPicturesDialog";
import { setTitle } from "@/scripts/tools/utils";
import { confirm } from '@tauri-apps/api/dialog';


export default function PartDetails() {
  const params = useParams();
  const [user] = useAtom<User>(userAtom);
  const [part, setPart] = useState<Part>();
  const [picturesOpen, setPicturesOpen] = useState(false);
  const [snPicturesOpen, setSnPicturesOpen] = useState(false);
  const [picturesData] = useAtom<any[]>(picturesAtom);
  const [snPicturesData] = useAtom<any[]>(snPicturesAtom);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [snPictures, setSnPictures] = useState<Picture[]>([]);
  const [isEditingPart, setIsEditingPart] = useState(false);
  const [costRemaining, setCostRemaining] = useState(null);
  const [partCostIn, setPartCostIn] = useState<PartCostIn[]>([]);
  const [engineCostOut, setEngineCostOut] = useState<EngineCostOut[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const part = await getPartById(Number(params.partNum));
      setTitle(`${part.partNum} ${part.desc}`);
      setPart(part);
      setPictures(await getImagesFromPart(part.partNum));
      setSnPictures(await getImagesFromStockNum(part.stockNum));
      if (pictures.length > 0) return;
      const costRes = await getEngineCostRemaining(part.engineNum);
      setCostRemaining(costRes);
      setPartCostIn(await getPartCostIn(part.stockNum));
      setEngineCostOut(await getPartEngineCostOut(part.stockNum));
      if (costRes > 0) {
        setToastMsg(`${formatCurrency(costRes)} remaining on engine`);
        setToastOpen(true);
      }
    };
    fetchData();
  }, [params]);

  useEffect(() => {}, [pictures, snPictures, part]);
  
  const getTotalCostIn = () => {
    return partCostIn.filter((num) => num.cost !== 0.04 && num.cost !== 0.01 && num.costType !== 'ReconPrice').reduce((acc, val) => acc + val.cost, 0);
  };

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || prompt('Type "confirm" to delete this part') !== 'confirm') return;
    await deletePart(part.id);
    location.replace('/');
  };


  return (
    <Layout title="Part">
      <Toast
        msg={toastMsg}
        type="warning"
        open={toastOpen}
        setOpen={setToastOpen}
      />

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
                data-cy="edit-btn"
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
                  data-cy="delete-btn"
                >
                  Delete
                </Button>
              }
            </div>

            <h2>{ part.partNum }</h2>
            <h2>{ part.desc }</h2>
            {checkImageExists(picturesData, part.partNum) &&
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
            <Button variant={['link']} disabled={part.engineNum === 0}>
              {part.engineNum != 0 ?
                <Link href={`/engines/${part.engineNum}`} style={{ padding: '0.4rem' }}>Engine Details</Link>
                :
                <p style={{ padding: '0.4rem' }}>Engine Details</p>
              }
            </Button>
          </div>


          <PartPicturesDialog open={picturesOpen} setOpen={setPicturesOpen} pictures={pictures} />         
          <StockNumPicturesDialog open={snPicturesOpen} setOpen={setSnPicturesOpen} pictures={snPictures} />

          <Grid rows={1} cols={12} gap={1}>
            <GridItem colStart={1} colEnd={5} rowStart={1} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Qty</th>
                    <td>{ part.qty }</td>
                  </tr>
                  <tr>
                    <th>Stock Number</th>
                    <td>
                      <div className="part-details__stock-pics">
                        { part.stockNum }
                        {checkImageExists(snPicturesData, part.stockNum) &&
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

            <GridItem colStart={1} colEnd={5} rowStart={2} variant={['low-opacity-bg']}>
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
                    <td></td>
                  </tr>
                  <tr>
                    <th>Reman Fleet Price</th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>Core Price</th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>Our Cost</th>
                    <td>{ formatCurrency(getTotalCostIn()) }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem rowStart={1} colStart={5} colEnd={10} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr style={{ height: '4rem' }}>
                    <th>Alt Parts</th>
                    <td data-cy="alt-parts">{ part.altParts.join(', ') }</td>
                  </tr>
                  <tr style={{ height: '4rem' }}>
                    <th>Remarks</th>
                    <td>{ part.remarks }</td>
                  </tr>
                </tbody>
              </Table>
            </GridItem>

            <GridItem colStart={5} colEnd={10} rowStart={2} variant={['low-opacity-bg']}>
              <Table variant={['plain', 'row-details']}>
                <tbody>
                  <tr>
                    <th>Engine Stock #</th>
                    <td>{ part.engineNum }</td>
                  </tr>
                  <tr>
                    <th>Serial Number</th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>Horse Power</th>
                    <td></td>
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

            {part.partsCostIn && part.partsCostIn.length > 0 &&
              <GridItem variant={['no-style']} rowStart={2} colStart={1} colEnd={10}>
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

            <GridItem variant={['no-style']} rowStart={3} colStart={1} colEnd={6}>
              <h2>Part Cost In</h2>
              {partCostIn.length > 0 ?
                <PartCostIn partCostInData={partCostIn} />
                :
                <p>Empty</p>
              }
            </GridItem>

            <GridItem variant={['no-style']} rowStart={3} colStart={6} colEnd={12}>
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
