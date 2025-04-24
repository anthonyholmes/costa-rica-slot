import Deerhead from "@/app/icon.svg";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto text-center flex items-center justify-center gap-1">
        <span>Website powered by</span>
        <Deerhead className="inline-block size-5 fill-current text-current" />
        <a href="https://antlur.co" className="primary hover:underline">
          Antlur Creative
        </a>
      </div>
    </footer>
  );
}
