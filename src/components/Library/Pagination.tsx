import React, { useEffect, useState } from "react";
import Button from "./Button";
import { generateClasses, parseClasses } from "@/scripts/tools/utils";

interface Props {
  className?: string
  variant?: ('default')[]
  data: any[]
  setData: (data: any[], page: number) => void
  buttonsDisplayed?: number
  page?: number
  pageSize: number
  pageCount?: number
}


export default function Pagination({ className = '', variant = [], data, setData, buttonsDisplayed = 5, page = 1, pageSize, pageCount }: Props) {
  const classes = generateClasses(className, variant, 'pagination');
  const [currentPage, setCurrentPage] = useState(page);

  // useEffect(() => {
  //   handleChangePage(page);
  // }, [data]);

  const paginateData = (data: any[], page: number, limit: number) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return data.slice(start, end);
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
    setData(paginateData(data, page, pageSize), page);
  };

  const totalPages = pageCount ? Math.ceil(pageCount / pageSize) : Math.ceil(data.length / pageSize);
  let startPage = Math.max(currentPage - Math.floor(buttonsDisplayed / 2), 1);
  let endPage = Math.min(startPage + buttonsDisplayed - 1, totalPages);
  
  if (endPage - startPage + 1 < buttonsDisplayed && startPage > 1) {
    startPage = Math.max(endPage - buttonsDisplayed + 1, 1);
  }
  
  if (endPage - startPage + 1 < buttonsDisplayed && endPage < totalPages) {
    endPage = Math.min(startPage + buttonsDisplayed - 1, totalPages);
  }


  return (
    <div {...parseClasses(classes)}>
      {((pageCount && pageCount > 0) || (!pageCount)) &&
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
      {((pageCount && pageCount > 0) || (!pageCount)) &&
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
