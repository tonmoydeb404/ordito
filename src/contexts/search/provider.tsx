import { useAppContext } from "@/contexts/app";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { SearchContext } from ".";
import { SearchContextType } from "./type";

interface SearchProviderProps {
  children: ReactNode;
}

const SearchProvider = ({ children }: SearchProviderProps) => {
  const { groups } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Search methods
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groups;
    }

    const query = searchQuery.toLowerCase().trim();

    return groups
      .map((group) => {
        // Check if group title matches
        const groupMatches = group.title.toLowerCase().includes(query);

        // Filter commands that match the search query
        const filteredCommands = group.commands.filter(
          (command) =>
            command.label.toLowerCase().includes(query) ||
            command.cmd.toLowerCase().includes(query)
        );

        // Include group if:
        // 1. Group title matches, or
        // 2. At least one command matches
        if (groupMatches || filteredCommands.length > 0) {
          return {
            ...group,
            // If group title matches, show all commands
            // If only commands match, show only matching commands
            commands: groupMatches ? group.commands : filteredCommands,
          };
        }

        return null;
      })
      .filter(Boolean) as typeof groups;
  }, [groups, searchQuery]);

  // Search results info
  const searchInfo = useMemo(() => {
    const totalGroups = groups.length;
    const totalCommands = groups.reduce(
      (acc, group) => acc + group.commands.length,
      0
    );

    if (!searchQuery.trim()) {
      return {
        isSearching: false,
        totalGroups,
        totalCommands,
        foundGroups: totalGroups,
        foundCommands: totalCommands,
      };
    }

    const foundGroups = filteredGroups.length;
    const foundCommands = filteredGroups.reduce(
      (acc, group) => acc + group.commands.length,
      0
    );

    return {
      isSearching: true,
      totalGroups,
      totalCommands,
      foundGroups,
      foundCommands,
    };
  }, [groups, filteredGroups, searchQuery]);

  // Check if there are results for current search
  const hasResults = useMemo(() => {
    return !searchInfo.isSearching || filteredGroups.length > 0;
  }, [searchInfo.isSearching, filteredGroups.length]);

  const contextValue: SearchContextType = {
    searchQuery,
    updateSearchQuery,
    clearSearch,
    filteredGroups,
    searchInfo,
    hasResults,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
