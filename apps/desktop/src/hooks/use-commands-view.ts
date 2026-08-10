import { useOrdito } from "@/context/ordito-context";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo } from "react";
import { useMatch } from "react-router-dom";

export function useCommandsView() {
  const {
    commands,
    query,
    selectCommand,
    runCommand,
    selectedCommand,
    groupNameById,
    groupIdByName,
  } = useOrdito();

  // Group filter is derived from the active route, not context state.
  const groupMatch = useMatch({ path: "/groups/:groupId", end: false });
  const activeGroupId = groupMatch?.params.groupId ?? null;

  const filteredCommands = useMemo(() => {
    let result = commands;

    if (activeGroupId) {
      result = result.filter((cmd) => cmd.groupId === activeGroupId);
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return result;

    return result.filter((command) =>
      [command.name, command.command, command.cwd]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [commands, activeGroupId, query]);

  // Keep selection anchored to a visible command when the list narrows.
  useEffect(() => {
    const selectedId = selectedCommand?.id ?? null;
    if (selectedId === null) return;
    const isSelectedVisible = filteredCommands.some(
      (command) => command.id === selectedId,
    );
    if (!isSelectedVisible && filteredCommands[0]) {
      selectCommand(filteredCommands[0].id);
    }
  }, [filteredCommands, selectedCommand, selectCommand]);

  const moveSelection = useCallback(
    (direction: 1 | -1) => {
      const currentIndex = filteredCommands.findIndex(
        (command) => command.id === (selectedCommand?.id ?? null),
      );
      const nextIndex =
        currentIndex === -1
          ? 0
          : Math.min(
              Math.max(currentIndex + direction, 0),
              filteredCommands.length - 1,
            );
      const nextCommand = filteredCommands[nextIndex];

      if (nextCommand) {
        selectCommand(nextCommand.id);
      }
    },
    [filteredCommands, selectedCommand, selectCommand],
  );

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        runCommand();
      }
    },
    [moveSelection, runCommand],
  );

  const activeGroup = activeGroupId
    ? (groupNameById(activeGroupId) ?? null)
    : null;

  return {
    activeGroupId,
    activeGroup,
    filteredCommands,
    handleSearchKeyDown,
    groupIdByName,
  };
}
