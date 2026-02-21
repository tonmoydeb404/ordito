import { useEffect, useState } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

interface ExecutionStartedPayload {
  log_id: string;
  command_id: string;
}

interface ExecutionOutputPayload {
  log_id: string;
  chunk: string;
}

interface ExecutionCompletedPayload {
  log_id: string;
  status: "success" | "failed" | "timeout" | "cancelled";
  exit_code: number | null;
}

/**
 * Hook for listening to real-time command execution events from Tauri backend
 *
 * Listens to three event types:
 * - execution:started - When command execution begins
 * - execution:output - Real-time stdout/stderr chunks
 * - execution:completed - When execution finishes
 *
 * @returns {Object} - Contains runningCommands, outputs, and clearOutput function
 */
export function useExecutionEvents() {
  // Track which commands are currently running (by command_id)
  const [runningCommands, setRunningCommands] = useState<Set<string>>(new Set());

  // Store output for each log (by log_id)
  const [outputs, setOutputs] = useState<Record<string, string>>({});

  // Map log_id to command_id for tracking
  const [logToCommandMap, setLogToCommandMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];

    // Listen for execution started
    listen<ExecutionStartedPayload>("execution:started", (event) => {
      const { command_id, log_id } = event.payload;

      // Add to running commands
      setRunningCommands((prev) => new Set(prev).add(command_id));

      // Track log_id -> command_id mapping
      setLogToCommandMap((prev) => ({
        ...prev,
        [log_id]: command_id,
      }));

      // Initialize empty output for this log
      setOutputs((prev) => ({
        ...prev,
        [log_id]: "",
      }));
    }).then((unlisten) => unlisteners.push(unlisten));

    // Listen for output chunks
    listen<ExecutionOutputPayload>("execution:output", (event) => {
      const { log_id, chunk } = event.payload;
      setOutputs((prev) => ({
        ...prev,
        [log_id]: (prev[log_id] || "") + chunk + "\n",
      }));
    }).then((unlisten) => unlisteners.push(unlisten));

    // Listen for execution completed
    listen<ExecutionCompletedPayload>("execution:completed", (event) => {
      const { log_id } = event.payload;

      // Remove from running commands
      const command_id = logToCommandMap[log_id];
      if (command_id) {
        setRunningCommands((prev) => {
          const next = new Set(prev);
          next.delete(command_id);
          return next;
        });
      }
    }).then((unlisten) => unlisteners.push(unlisten));

    // Cleanup on unmount
    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, [logToCommandMap]);

  const clearOutput = (logId: string) => {
    setOutputs((prev) => {
      const next = { ...prev };
      delete next[logId];
      return next;
    });
  };

  return { runningCommands, outputs, clearOutput };
}
