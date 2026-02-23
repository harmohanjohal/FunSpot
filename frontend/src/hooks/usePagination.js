import { useState } from 'react';

function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [firstDoc, setFirstDoc] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const nextPage = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };
  
  const goToPage = (pageNumber) => {
    if (pageNumber > 0) {
      setPage(pageNumber);
    }
  };
  
  const resetPagination = () => {
    setPage(initialPage);
    setFirstDoc(null);
    setLastDoc(null);
    setHasMore(true);
  };
  
  return {
    page,
    setPage,
    firstDoc,
    setFirstDoc,
    lastDoc,
    setLastDoc,
    hasMore,
    setHasMore,
    nextPage,
    prevPage,
    goToPage,
    resetPagination
  };
}

export default usePagination;