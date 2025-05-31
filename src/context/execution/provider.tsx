import ExecutionResultsModal from "@/components/modals/execution-results";
import { ReactNode, useCallback, useState } from "react";
import { ExecutionContext } from ".";
import { ExecutionContextType, ExecutionResponseType } from "./type";

interface Props {
  children: ReactNode;
}

const ExecutionProvider = ({ children }: Props) => {
  const [responses, setResponses] = useState<ExecutionContextType["responses"]>(
    {}
  );
  const [modal, setModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const addResponse = useCallback(
    (id: string, results: ExecutionResponseType) => {
      setResponses((prev) => ({
        ...prev,
        [id]: results,
      }));
    },
    []
  );

  const onRemove = useCallback((id: string) => {
    setResponses((prev) => {
      if (id in prev) {
        delete prev[id];
      }

      return prev;
    });
  }, []);

  const onClear = useCallback(() => {
    setResponses({});
  }, []);

  const showModal = useCallback((id: string | null) => {
    setModal(true);
    setSelectedResponse(id);
  }, []);

  const contextValue: ExecutionContextType = {
    responses,
    selectedResponse,
    addResponse,
    showModal,
  };

  return (
    <ExecutionContext.Provider value={contextValue}>
      {children}
      <ExecutionResultsModal
        isOpen={modal}
        close={() => {
          setModal(false);
          setSelectedResponse(null);
        }}
        selectedResponse={selectedResponse}
        responses={responses}
        onRemove={onRemove}
        onClear={onClear}
      />
    </ExecutionContext.Provider>
  );
};

export default ExecutionProvider;
