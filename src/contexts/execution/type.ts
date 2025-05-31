export type ExecutionContextType = {
  responses: Record<string, ExecutionResponseType>;
  selectedResponse: string | null;

  addResponse: (timestamp: string, result: ExecutionResponseType) => void;
  showModal: (responseId: string | null) => void;
};

export type ExecutionResponseType = {
  label: string;
  result: [label: string, response: string][];
};
