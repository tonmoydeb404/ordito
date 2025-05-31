import { TCommandGroup } from "@/types/command";

export interface SearchInfo {
  isSearching: boolean;
  totalGroups: number;
  totalCommands: number;
  foundGroups: number;
  foundCommands: number;
}

export interface SearchContextType {
  // Search state
  searchQuery: string;

  // Search methods
  updateSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // Filtered data
  filteredGroups: TCommandGroup[];

  // Search info
  searchInfo: SearchInfo;
  hasResults: boolean;
}
