import Table from "../Library/Table";
import Button from "../Library/Button";
import { extractStatusColors, formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import Pagination from "../Library/Pagination";
import Link from "../Library/Link";
import { getImagesFromPart, getImagesFromStockNum } from "@/scripts/services/imagesService";
import { useState } from "react";
import PartPicturesDialog from "../Dialogs/PartPicturesDialog";
import StockNumPicturesDialog from "../Dialogs/StockNumPicturesDialog";
import { useTooltip } from "@/hooks/useTooltip";

interface Props {
  parts: Part[]
  partsData: Part[]
  pageCount: number
  partsQty: number
  rowsHidden: number | null
  quotePart: (part: Part) => void
  onChangePage: (data: any, page: number) => void
  onOpenSelectHandwrittenDialog: (part: Part) => void
  onQuickPick: (part: Part) => Promise<void>
  limit: number
}


export default function PartsTable({ parts, partsData, pageCount, partsQty, rowsHidden, quotePart, onChangePage, onOpenSelectHandwrittenDialog, onQuickPick, limit }: Props) {
  const tooltip = useTooltip();
  const [partImages, setPartImages] = useState<Picture[]>([]);
  const [picturesPartNum, setPicturesPartNum] = useState<string>('');
  const [snImages, setSnImages] = useState<Picture[]>([]);
  const [picturesStockNum, setPicturesStockNum] = useState<string>('');
  const [partImagesOpen, setPartImagesOpen] = useState(false);
  const [snImagesOpen, setSnImagesOpen] = useState(false);

  const openPartImages = async (part: Part) => {
    setPartImages(await getImagesFromPart(part.partNum));
    setPicturesPartNum(part.partNum);
    setPartImagesOpen(true);
  };

  const openStockNumImages = async (part: Part) => {
    setSnImages(await getImagesFromStockNum(part.stockNum ?? ''));
    setPicturesStockNum(part.stockNum ?? '');
    setSnImagesOpen(true);
  };

  const partCostStyles = (part: Part) => {
    if (!part.costRemaining) return;
    return part.costRemaining >= 0.04 ? { color: 'var(--orange-1)', fontWeight: 'bold' } : {};
  };


  return (
    <>
      <PartPicturesDialog open={partImagesOpen} setOpen={setPartImagesOpen} pictures={partImages} partNum={picturesPartNum} />
      <StockNumPicturesDialog open={snImagesOpen} setOpen={setSnImagesOpen} pictures={snImages} stockNum={picturesStockNum} />

      <div style={{ width:'fit-content', overflow: 'auto', maxHeight: '68vh' }}>
        { rowsHidden && <p>Hidden rows: { rowsHidden }</p> }
        <Table data-testid="part-search-table">
          <thead>
            <tr>
              <th>Total Qty <span className="parts-search__total-qty">{ partsQty }</span></th>
              <th>Part Number</th>
              <th>Entry Date</th>
              <th>Qty</th>
              <th>Description</th>
              <th>Stock Number</th>
              <th>Location</th>
              <th>Remarks</th>
              <th>Our Cost</th>
              <th>New Price</th>
              <th>Reman Price</th>
              <th>Serial Number</th>
              <th>HP</th>
            </tr>
          </thead>
          <tbody className="parts-list">
            {parts && parts.map((part: Part, i) => {
              const status = extractStatusColors(part.remarks);
              return (
                <tr key={i}>
                  <td className="parts-list__left-col table-buttons table-buttons--grid">
                    <Button
                      variant={['x-small', 'fit']}
                      onClick={() => quotePart(part)}
                      data-testid="quote-part-btn"
                      onMouseEnter={() => tooltip.set('Quote Part')}
                      onMouseLeave={() => tooltip.set('')}
                    >
                      <img alt="Quote part" src="/images/icons/clipboard.svg" width={17} height={17} />
                    </Button>
                    <Button
                      variant={['x-small', 'fit']}
                      onClick={() => onOpenSelectHandwrittenDialog(part)}
                      data-testid="add-item-btn"
                      onMouseEnter={() => tooltip.set('Add to Handwritten')}
                      onMouseLeave={() => tooltip.set('')}
                    >
                      <img alt="Add to handwritten" src="/images/icons/invoice.svg" width={17} height={17} />
                    </Button>
                    <Button
                      variant={['x-small', 'fit']}
                      onClick={() => onQuickPick(part)}
                      data-testid="quick-pick-btn"
                      onMouseEnter={() => tooltip.set('Quick Pick')}
                      onMouseLeave={() => tooltip.set('')}
                    >
                      <img alt="Quick pick" src="/images/icons/crosshair.svg" width={17} height={17} />
                    </Button>
                  </td>
                  <td>
                    <div className="parts-list__left-content">
                      {part.imageExists &&
                        <Button
                          variant={['plain', 'hover-move']}
                          style={{ padding: '0.1rem' }}
                          onClick={() => openPartImages(part)}
                        >
                          <img src="/images/icons/image.svg" alt="detail" width={20} height={20} style={{ alignSelf: 'center' }} />
                        </Button>
                      }
                      <Link href={`/part/${part.id}`} data-testid="part-num-link">{ part.partNum }</Link>
                    </div>
                  </td>
                  <td>{ formatDate(part.entryDate) }</td>
                  <td style={part.qty > 0 ? {} : { color: 'var(--red-2)', fontWeight: 'bold' }} data-testid="qty">{ part.qty }</td>
                  <td style={{ width: '16rem' }}>{ part.desc }</td>
                  <td>
                    <div className="parts-list__left-content">
                      {part.snImageExists &&
                        <Button
                          variant={['plain', 'hover-move']}
                          style={{ padding: '0.1rem' }}
                          onClick={() => openStockNumImages(part)}
                        >
                          <img src="/images/icons/image.svg" alt="detail" width={20} height={20} style={{ alignSelf: 'center' }} />
                        </Button>
                      }
                      <span data-testid="stock-num">{ part.stockNum }</span>
                    </div>
                  </td>
                  <td>{ part.location }</td>
                  <td style={{ width:'22rem', fontSize:'var(--font-xsm)', backgroundColor:`var(--status-${status})`, color: `${status ? 'black' : 'white'}` }}>
                    { part.remarks }
                  </td>
                  <td style={partCostStyles(part)}>{ formatCurrency(part.purchasePrice) }</td>
                  <td style={{ fontSize: 'var(--font-xsm)' }}>
                    <strong>List:</strong> { formatCurrency(part.listPrice) }<br />
                    <strong>Fleet:</strong> { formatCurrency(part.fleetPrice) }
                  </td>
                  <td>{ formatCurrency(part.remanListPrice) }</td>
                  <td>{ part.serialNum }</td>
                  <td>{ part.horsePower }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <Pagination
        data={partsData}
        setData={onChangePage}
        pageCount={pageCount}
        pageSize={limit}
      />
      { parts.length === 0 && <p>No parts data found...</p> }
    </>
  );
}
