import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucidePlus, Search, Terminal } from "lucide-react";
import { useState } from "react";

type Props = {};

const HeaderSection = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [_groupDialogOpen, setGroupDialogOpen] = useState(false);

  return (
    <>
      <div className="bg-card">
        <div className="container mx-auto px-6 pt-6 pb-2 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-black text-primary">
            <Terminal className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ordito</h1>
            <p className="text-muted-foreground">
              Organize and execute your commands efficiently
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12"
            />
          </div>

          <Button onClick={() => setGroupDialogOpen(true)} size="lg">
            <LucidePlus />
            New Group
          </Button>
        </div>
      </div>
    </>
  );
};

export default HeaderSection;
