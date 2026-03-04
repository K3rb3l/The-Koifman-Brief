import type { Metadata } from 'next'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PencilSketchImage } from '@/components/PencilSketchImage'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Shahar Koifman and The Koifman Brief.',
}

export default function AboutPage() {
  return (
    <div className="max-w-[680px]">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row items-start gap-8 mb-12">
          <PencilSketchImage
            src="https://storage.googleapis.com/the-koifman-brief-images/images/shahar-koifman.jpg"
            alt="Shahar Koifman"
            width={160}
            height={160}
            className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 [&_img]:rounded-md"
            priority
          />
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
              Shahar Koifman
            </h1>
            <p className="text-muted font-sans leading-relaxed">
              Intelligence background with expertise spanning geopolitics, financial technology, and commercial real estate. Focused on the macro forces that create structural shifts -and the second-order consequences that most analysis misses.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="decorative-rule"><span className="diamond" /></div>

      <ScrollReveal delay={0.1}>
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            What This Publication Covers
          </h2>
          <div className="space-y-4 text-foreground font-sans leading-relaxed">
            <p>
              The Koifman Brief sits at the intersection of three domains that look disparate on the surface but share a common analytical thread.
            </p>
            <div className="space-y-5">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 bg-accent rotate-45 mt-2.5 shrink-0" />
                <div>
                  <span className="font-semibold text-accent">Geopolitics</span> -The operating environment that shapes everything else. Policy shifts, sanctions regimes, and regional dynamics that create structural risks and opportunities.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 bg-accent rotate-45 mt-2.5 shrink-0" />
                <div>
                  <span className="font-semibold text-accent">FinTech</span> -Where regulatory frameworks meet technological disruption. Payments, digital assets, and the infrastructure that moves capital.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 bg-accent rotate-45 mt-2.5 shrink-0" />
                <div>
                  <span className="font-semibold text-accent">Real Estate</span> -Where macro forces become tangible. Interest rates, demographic shifts, and policy changes manifest in physical assets and capital flows.
                </div>
              </li>
            </div>
            <p>
              Each piece traces implications beyond the obvious first-order effects. The goal is not prediction but clarity -understanding the forces at work well enough to make better decisions.
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Connect
          </h2>
          <div className="flex gap-6 font-sans text-sm">
            <a
              href="https://www.linkedin.com/in/shahar-koifman-b29a76226"
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
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <SubscribeForm />
      </ScrollReveal>
    </div>
  )
}
