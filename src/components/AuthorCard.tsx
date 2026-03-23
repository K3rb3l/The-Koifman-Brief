import { AnimatedPortrait } from './AnimatedPortrait'

export function AuthorCard() {
  return (
    <div className="flex items-center gap-4 py-6 border-t border-border mt-12">
      <a href="/about"><AnimatedPortrait className="w-14 h-14 rounded-full shrink-0" /></a>
      <div>
        <a href="/about" className="font-serif font-semibold text-foreground hover:text-accent transition-colors duration-200">Shahar Koifman</a>
        <p className="text-sm text-muted font-sans">
          Intelligence background. FinTech, CRE, and geopolitics analyst.
        </p>
      </div>
    </div>
  )
}
