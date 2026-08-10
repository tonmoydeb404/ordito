export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div id="top" className="container flex-1 py-16 md:py-20">
      {children}
    </div>
  );
}
