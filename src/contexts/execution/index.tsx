import { createContext, useContext } from "react";
import { ExecutionContextType } from "./type";

// Create context
export const ExecutionContext = createContext<ExecutionContextType | undefined>(
  undefined
);

// Hook to use context - only for data consumption
export function useExecutionContext() {
  const context = useContext(ExecutionContext);
  if (context === undefined) {
    throw new Error(
      "useExecutionContext must be used within an ExecutionProvider"
    );
  }
  return context;
}
