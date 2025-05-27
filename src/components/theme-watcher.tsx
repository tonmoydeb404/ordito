import { ReactNode, useEffect } from "react";

type Props = {
  children: ReactNode;
};

const ThemeWatcher = (props: Props) => {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return <>{props.children}</>;
};

export default ThemeWatcher;
