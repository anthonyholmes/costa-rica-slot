export function SkipToMain({ anchor = "#main" }: { anchor?: string }) {
  return (
    <a
      href={anchor}
      className="z-50 sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:m-4 focus:p-2 focus:bg-secondary focus:text-secondary-foreground focus:ring-2 focus:ring-secondary focus:rounded-lg"
    >
      Skip to Main Content
    </a>
  );
}
