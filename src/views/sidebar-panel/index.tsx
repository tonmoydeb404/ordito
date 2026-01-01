import { ThemeToggle } from "@/components/theme-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizablePanel } from "@/components/ui/resizable";
import { GroupResponse } from "@/store/types";
import FolderTree from "@/views/sidebar-panel/folder-tree";
import { Grid3x3Icon, SearchIcon, TerminalIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

type Props = {
  isCollapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;

  selectedGroup: GroupResponse | null;
  setSelectedGroup: Dispatch<SetStateAction<GroupResponse | null>>;
};

const SidebarPanel = (props: Props) => {
  const { isCollapsed, setCollapsed, selectedGroup, setSelectedGroup } = props;
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ResizablePanel
      defaultSize={20}
      minSize={15}
      maxSize={35}
      className={`${
        isCollapsed ? "min-w-12" : "min-w-80"
      } transition-all duration-300`}
    >
      <div className="bg-background border-r border-border flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h1 className="text-foreground font-medium flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-primary" />
              {!isCollapsed && "Commands Manager"}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground p-1 h-auto w-auto"
              data-testid="button-toggle-sidebar"
            >
              <Grid3x3Icon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Search Bar */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search commands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary text-foreground px-3 py-2 pl-8 text-xs border border-border focus:border-primary"
                  data-testid="input-search-commands"
                />
                <SearchIcon className="w-3 h-3 absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
            </div>

            {/* Folder Tree */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <FolderTree
                searchQuery={searchQuery}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
              />
            </div>

            {/* Connection Status */}
            <div className="p-3 border-t border-border">
              <ThemeToggle />
            </div>
          </>
        )}
      </div>
    </ResizablePanel>
  );
};

export default SidebarPanel;
