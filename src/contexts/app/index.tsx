import { createContext, useContext } from "react";
import { AppContextType } from "./type";

// Create context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook to use context - only for data consumption
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
