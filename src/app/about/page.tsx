import type { Metadata } from 'next'
import { SubscribeForm } from '@/components/SubscribeForm'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Shahar Koifman and The Koifman Brief.',
}

export default function AboutPage() {
  return (
    <div className="max-w-[680px]">
      <div className="flex flex-col sm:flex-row items-start gap-8 mb-12">
        <div className="w-40 h-40 rounded-md bg-muted/20 shrink-0" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Shahar Koifman
          </h1>
          <p className="text-muted font-sans leading-relaxed">
            Intelligence background with expertise spanning geopolitics, financial technology, and commercial real estate. Focused on the macro forces that create structural shifts — and the second-order consequences that most analysis misses.
          </p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
          What This Publication Covers
        </h2>
        <div className="space-y-4 text-foreground font-sans leading-relaxed">
          <p>
            The Koifman Brief sits at the intersection of three domains that look disparate on the surface but share a common analytical thread.
          </p>
          <ul className="list-none space-y-4 pl-0">
            <li>
              <strong className="text-accent">Geopolitics</strong> — The operating environment that shapes everything else. Policy shifts, sanctions regimes, and regional dynamics that create structural risks and opportunities.
            </li>
            <li>
              <strong className="text-accent">FinTech</strong> — Where regulatory frameworks meet technological disruption. Payments, digital assets, and the infrastructure that moves capital.
            </li>
            <li>
              <strong className="text-accent">Real Estate</strong> — Where macro forces become tangible. Interest rates, demographic shifts, and policy changes manifest in physical assets and capital flows.
            </li>
          </ul>
          <p>
            Each piece traces implications beyond the obvious first-order effects. The goal is not prediction but clarity — understanding the forces at work well enough to make better decisions.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
          Connect
        </h2>
        <div className="flex gap-6 font-sans text-sm">
          <a
            href="https://linkedin.com/in/shaharkoifman"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer"
          >
            LinkedIn
          </a>
          <a
            href="mailto:shahar@koifmanbrief.com"
            className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer"
          >
            Email
          </a>
        </div>
      </section>

      <SubscribeForm />
    </div>
  )
}
