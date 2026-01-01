import React from "react";

export interface InputActionWrapperProps {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InputActionWrapper({
  leftAction,
  rightAction,
  children,
  className = "",
}: InputActionWrapperProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {leftAction && <div className="shrink-0">{leftAction}</div>}
      <div className="flex-1 min-w-0">{children}</div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
}
