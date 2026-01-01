import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableCell, TableRow } from "@/components/ui/table";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import React, { Fragment, type ReactNode } from "react";

// ----------------------------------------------------------------------

type Variant = "default" | "table";
type ContainerWrapper = (children: React.ReactNode) => React.ReactNode;

const wrapContainer = (
  content: ReactNode,
  variant: Variant,
  userContainer?: ContainerWrapper
) => {
  if (userContainer) {
    return userContainer(content);
  }

  if (variant === "table") {
    return (
      <TableRow>
        <TableCell colSpan={100}>{content}</TableCell>
      </TableRow>
    );
  }

  return content;
};

// ----------------------------------------------------------------------

interface StateWrapperProps<T> {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isEmpty: boolean;
  data: T | undefined;
  errorMessage?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  errorComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorContainer?: ContainerWrapper;
  loadingContainer?: ContainerWrapper;
  emptyContainer?: ContainerWrapper;
  loadersCount?: number;
  render: (data: T) => React.ReactNode;
  variant?: Variant;
}

const StateWrapper = <T,>(props: StateWrapperProps<T>) => {
  const {
    isLoading,
    isError,
    isSuccess,
    isEmpty,
    data,
    errorMessage = "Something went wrong. Please try again.",
    loadingMessage = "Loading...",
    emptyMessage = "No data available.",
    errorComponent,
    loadingComponent,
    emptyComponent,
    errorContainer,
    loadingContainer,
    emptyContainer,
    loadersCount = 1,
    render,
    variant = "default",
  } = props;

  // Error state
  if (!isLoading && isError) {
    if (errorComponent) {
      return <>{wrapContainer(errorComponent, variant, errorContainer)}</>;
    }

    const defaultErrorContent = (
      <Alert
        variant="destructive"
        direction={variant === "table" ? "center" : "left"}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );

    return <>{wrapContainer(defaultErrorContent, variant, errorContainer)}</>;
  }

  // Empty state
  if (!isLoading && isEmpty) {
    if (emptyComponent) {
      return <>{wrapContainer(emptyComponent, variant, emptyContainer)}</>;
    }

    const defaultEmptyContent = (
      <Alert direction={variant === "table" ? "center" : "left"}>
        <Inbox className="h-4 w-4" />
        <AlertDescription>{emptyMessage}</AlertDescription>
      </Alert>
    );

    return <>{wrapContainer(defaultEmptyContent, variant, emptyContainer)}</>;
  }

  // Success state
  if (!isLoading && isSuccess && data !== undefined) {
    return <>{render(data)}</>;
  }

  // Loading state
  if (loadingComponent) {
    const loaders = Array.from({ length: loadersCount }, (_, index) => (
      <Fragment key={index}>{loadingComponent}</Fragment>
    ));

    return <>{wrapContainer(loaders, "default", loadingContainer)}</>;
  }

  const defaultLoadingContent = Array.from(
    { length: loadersCount },
    (_, index) => (
      <Alert key={index} direction={variant === "table" ? "center" : "left"}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>{loadingMessage}</AlertDescription>
      </Alert>
    )
  );

  return <>{wrapContainer(defaultLoadingContent, variant, loadingContainer)}</>;
};

export default StateWrapper;
