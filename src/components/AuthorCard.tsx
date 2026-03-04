export function AuthorCard() {
  return (
    <div className="flex items-center gap-4 py-6 border-t border-border mt-12">
      <div className="w-14 h-14 rounded-full bg-muted/20 shrink-0" />
      <div>
        <p className="font-serif font-semibold text-foreground">Shahar Koifman</p>
        <p className="text-sm text-muted font-sans">
          Intelligence background. FinTech, CRE, and geopolitics analyst.
        </p>
      </div>
    </div>
  )
}
