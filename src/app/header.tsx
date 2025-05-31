import CreateGroupModal from "@/components/modals/create-group";
import SearchInput from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { LucidePlus, Terminal } from "lucide-react";

type Props = {};

const HeaderSection = (props: Props) => {
  const createModal = useModal<void>();

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
          <div className="max-w-md w-full">
            <SearchInput
              placeholder="Search by group & command..."
              className="h-12"
            />
          </div>

          <Button onClick={() => createModal.open()} size="lg">
            <LucidePlus />
            New Group
          </Button>
        </div>
      </div>

      <CreateGroupModal {...createModal} />
    </>
  );
};

export default HeaderSection;
