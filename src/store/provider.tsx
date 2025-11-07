import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./config";

type Props = {
  children: ReactNode;
};

export const StoreProvider = (props: Props) => {
  return <Provider store={store}>{props.children}</Provider>;
};
