import type { Metadata } from 'next'
import { t } from '@/lib/i18n'
import { SubscribeForm } from '@/components/SubscribeForm'
import { ScrollReveal } from '@/components/ScrollReveal'
import { PencilSketchImage } from '@/components/PencilSketchImage'
import { DecorativeRule } from '@/components/DecorativeRule'
import { StaggeredBullet } from '@/components/StaggeredBullet'

export const metadata: Metadata = {
  title: t('about.title'),
  description: t('about.description'),
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
            reveal
          />
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
              {t('about.name')}
            </h1>
            <p className="text-muted font-sans leading-relaxed mb-3">
              {t('about.bio1')}
            </p>
            <p className="text-muted font-sans leading-relaxed">
              {t('about.bio2')}
            </p>
          </div>
        </div>
      </ScrollReveal>

      <DecorativeRule />

      <ScrollReveal delay={0.1}>
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            {t('about.whatIWrite')}
          </h2>
          <div className="space-y-4 text-foreground font-sans leading-relaxed">
            <p>
              {t('about.intro')}
            </p>
            <div className="space-y-5">
              <StaggeredBullet index={0}>
                <span className="font-semibold text-accent">{t('about.geo.label')}</span> {t('about.geo.desc')}
              </StaggeredBullet>
              <StaggeredBullet index={1}>
                <span className="font-semibold text-accent">{t('about.fintech.label')}</span> {t('about.fintech.desc')}
              </StaggeredBullet>
              <StaggeredBullet index={2}>
                <span className="font-semibold text-accent">{t('about.realestate.label')}</span> {t('about.realestate.desc')}
              </StaggeredBullet>
            </div>
            <p>
              {t('about.conclusion')}
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
            {t('about.connect')}
          </h2>
          <div className="flex gap-6 font-sans text-sm">
            <a
              href="https://www.linkedin.com/in/shahar-koifman-b29a76226"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer"
            >
              {t('about.linkedin')}
            </a>
            <a
              href="mailto:shahar@koifmanbrief.com"
              className="text-accent hover:text-link-hover transition-colors duration-200 cursor-pointer"
            >
              {t('about.email')}
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
