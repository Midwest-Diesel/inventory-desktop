import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { generateClasses, parseClasses } from "@/scripts/tools/utils";

interface Props {
  className?: string
  variant?: ('default')[]
  data: any[]
  setData: (data: any[], page: number) => void
  btnCount?: number
  page?: number
  pageSize: number
  minData?: any[]
}

export default function Pagination({ className = '', variant = [], data, setData, btnCount = 5, page = 1, pageSize, minData }: Props) {
  const classes = generateClasses(className, variant, 'pagination');
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    handleChangePage(page);
  }, [data]);

  const paginateData = (data: any[], page: number, limit: number) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return data.slice(start, end);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
    setData(paginateData(data, page, pageSize), page);
  };

  const totalPages = minData ? Math.ceil(minData.length / pageSize) : Math.ceil(data.length / pageSize);
  let startPage = Math.max(currentPage - Math.floor(btnCount / 2), 1);
  let endPage = Math.min(startPage + btnCount - 1, totalPages);
  
  if (endPage - startPage + 1 < btnCount && startPage > 1) {
    startPage = Math.max(endPage - btnCount + 1, 1);
  }
  
  if (endPage - startPage + 1 < btnCount && endPage < totalPages) {
    endPage = Math.min(startPage + btnCount - 1, totalPages);
  }


  return (
    <div {...parseClasses(classes)}>
      {((minData && minData.length > 0) || (!minData)) &&
        <Button
          onClick={() => handleChangePage(currentPage === 1 ? totalPages : currentPage - 1)}
          variant={[]}
          type="button"
        >
          Previous
        </Button>
      }
      {startPage > 1 && (
        <>
          <Button
            onClick={() => handleChangePage(1)}
            variant={['circle']}
            className={currentPage === 1 ? 'pagination--selected' : ''}
            type="button"
          >
            1
          </Button>
          <p>...</p>
        </>
      )}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
        <Button
          key={pageNum}
          onClick={() => handleChangePage(pageNum)}
          variant={['circle']}
          className={currentPage === pageNum ? 'pagination--selected' : ''}
          type="button"
        >
          {pageNum}
        </Button>
      ))}
      {endPage < totalPages && (
        <>
          <p>...</p>
          <Button
            onClick={() => handleChangePage(totalPages)}
            variant={['circle']}
            className={currentPage === totalPages ? 'pagination--selected' : ''}
            type="button"
          >
            {totalPages}
          </Button>
        </>
      )}
      {((minData && minData.length > 0) || (!minData)) &&
        <Button
          onClick={() => handleChangePage(currentPage === totalPages ? 1 : currentPage + 1)}
          variant={[]}
          type="button"
        >
          Next
        </Button>
      }
    </div>
  );
}
