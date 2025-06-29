import SettingsDropdown from "@/components/dropdowns/settings";
import CreateGroupModal from "@/components/modals/create-group";
import SearchInput from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { useExecutionContext } from "@/contexts/execution";
import { useScheduleContext } from "@/contexts/schedule";
import { useModal } from "@/hooks/use-modal";
import { LucideClock, LucidePlus, LucideTerminal } from "lucide-react";

type Props = {};

const HeaderSection = (props: Props) => {
  const createModal = useModal<void>();
  const execution = useExecutionContext();
  const schedule = useScheduleContext();

  return (
    <>
      <div className="bg-card hidden lg:block">
        <div className="container mx-auto px-6 pt-6 pb-2 flex items-center gap-4">
          <img src="/logo.svg" alt="Logo" width={50} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Ordito
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Organize and execute your commands efficiently
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md w-full">
            <SearchInput
              placeholder="Search by group & command..."
              className="h-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => createModal.open()}>
              <LucidePlus />
              New Group
            </Button>

            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={() => execution.showModal(null)}
            >
              <LucideTerminal />
            </Button>

            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={() => schedule.openModal()}
            >
              <LucideClock />
            </Button>

            <SettingsDropdown />
          </div>
        </div>
      </div>

      <CreateGroupModal {...createModal} />
    </>
  );
};

export default HeaderSection;
