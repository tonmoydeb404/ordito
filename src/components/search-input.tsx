import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchContext } from "@/contexts/search";
import { Search, X } from "lucide-react";

interface Props {
  placeholder?: string;
  className?: string;
  showStats?: boolean;
}

const SearchInput = (props: Props) => {
  const {
    placeholder = "Search groups and commands...",
    className = "",
    showStats = false,
  } = props;
  const { searchQuery, updateSearchQuery, clearSearch, searchInfo } =
    useSearchContext();

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          className={`pl-12 ${searchQuery ? "pr-12" : ""} ${className}`}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showStats && searchInfo.isSearching && (
        <div className="text-sm text-muted-foreground px-2">
          Found {searchInfo.foundCommands} commands in {searchInfo.foundGroups}{" "}
          groups
          {searchInfo.foundGroups < searchInfo.totalGroups && (
            <span className="ml-1 opacity-75">
              (filtered from {searchInfo.totalCommands} commands in{" "}
              {searchInfo.totalGroups} groups)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
