import { createContext, useContext } from "react";
import { SearchContextType } from "./type";

// Create context
export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

// Hook to use context
export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
