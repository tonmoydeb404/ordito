import { createContext, useContext } from "react";
import { ScheduleContextType } from "./type";

// Create context
export const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

// Hook to use context - only for data consumption
export function useScheduleContext() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error(
      "useScheduleContext must be used within a ScheduleProvider"
    );
  }
  return context;
}
