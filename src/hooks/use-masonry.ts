import { useEffect, useMemo, useState } from "react";

interface MasonryItem {
  id: string | number;
  [key: string]: any;
}

interface UseMasonryProps<T> {
  items: T[];
  breakpoints?: { [key: number]: number }; // screen width : column count
}

function useMasonry<T extends MasonryItem>({
  items,
  breakpoints = { 0: 1, 640: 1, 768: 2, 1024: 3, 1440: 4 },
}: UseMasonryProps<T>) {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      const sortedBreakpoints = Object.keys(breakpoints)
        .map(Number)
        .sort((a, b) => a - b);

      let newColumnCount = 1;
      for (const bp of sortedBreakpoints) {
        if (width >= bp) {
          newColumnCount = breakpoints[bp];
        }
      }

      setColumnCount(newColumnCount);
    };

    handleResize(); // Set on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoints]);

  const columns = useMemo(() => {
    const newColumns: T[][] = Array.from({ length: columnCount }, () => []);

    items.forEach((item, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(item);
    });

    return newColumns;
  }, [items, columnCount]);

  return columns;
}

export default useMasonry;
