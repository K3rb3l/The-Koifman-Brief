export type Locale = 'en' | 'fa'

export const locale: Locale =
  (process.env.NEXT_PUBLIC_LOCALE as Locale) ?? 'en'

export const isRTL = locale === 'fa'

export const siteUrl =
  locale === 'fa'
    ? 'https://fa.thekoifmanbrief.com'
    : 'https://thekoifmanbrief.com'

export const alternateSiteUrl =
  locale === 'fa'
    ? 'https://thekoifmanbrief.com'
    : 'https://fa.thekoifmanbrief.com'

const dict: Record<string, { en: string; fa: string }> = {
  // Brand
  'brand.name': { en: 'The Koifman Brief', fa: 'خلاصه کویفمن' },
  'brand.tagline': { en: 'Clarity in complexity', fa: 'وضوح در پیچیدگی' },

  // Nav
  'nav.home': { en: 'Home', fa: 'خانه' },
  'nav.about': { en: 'About', fa: 'درباره' },

  // Language toggle
  'lang.switch': { en: 'فارسی', fa: 'English' },

  // Home
  'home.byline': { en: 'by Shahar Koifman', fa: 'نوشته شاهار کویفمن' },
  'home.subtitle': {
    en: 'Geopolitics, FinTech, and real estate — tracing the macro forces that create structural shifts.',
    fa: 'ژئوپلیتیک، فین‌تک و املاک — ردیابی نیروهای کلان که تحولات ساختاری ایجاد می‌کنند.',
  },
  'home.prev': { en: 'Prev', fa: 'قبلی' },
  'home.next': { en: 'Next', fa: 'بعدی' },
  'home.empty': { en: 'No briefs yet. Check back soon.', fa: 'هنوز مطلبی منتشر نشده. به‌زودی بازگردید.' },

  // Post card
  'post.briefNo': { en: 'No.', fa: 'شماره' },
  'post.readBrief': { en: 'Read brief', fa: 'خواندن مطلب' },

  // Post content
  'post.notFound.title': { en: 'Brief not found', fa: 'مطلب یافت نشد' },
  'post.notFound.body': {
    en: "This brief doesn't exist or has been removed.",
    fa: 'این مطلب وجود ندارد یا حذف شده است.',
  },
  'post.byline': { en: 'By Shahar Koifman', fa: 'نوشته شاهار کویفمن' },

  // Post navigation
  'post.previous': { en: 'Previous', fa: 'قبلی' },
  'post.next': { en: 'Next', fa: 'بعدی' },

  // Articles page
  'articles.archive': { en: 'Archive', fa: 'آرشیو' },
  'articles.allBriefs': { en: 'All Briefs', fa: 'همه مطالب' },
  'articles.published': { en: 'published', fa: 'منتشر شده' },
  'articles.brief': { en: 'brief', fa: 'مطلب' },
  'articles.briefs': { en: 'briefs', fa: 'مطلب' },
  'articles.empty': { en: 'No briefs yet.', fa: 'هنوز مطلبی منتشر نشده.' },

  // About page
  'about.title': { en: 'About', fa: 'درباره' },
  'about.description': {
    en: 'About Shahar Koifman and The Koifman Brief.',
    fa: 'درباره شاهار کویفمن و خلاصه کویفمن.',
  },
  'about.name': { en: 'Shahar Koifman', fa: 'شاهار کویفمن' },
  'about.bio1': {
    en: 'Shahar Koifman spent over 20 years in Israeli Defense Intelligence, retiring as Lt. Col. from the Research & Analysis Division. He went on to lead investment research in the private sector, covering financial technology and commercial real estate.',
    fa: 'شاهار کویفمن بیش از ۲۰ سال در اطلاعات دفاعی اسرائیل خدمت کرد و با درجه سرهنگ‌دوم از بخش تحقیق و تحلیل بازنشسته شد. او سپس رهبری تحقیقات سرمایه‌گذاری در بخش خصوصی را بر عهده گرفت و حوزه‌های فناوری مالی و املاک تجاری را پوشش داد.',
  },
  'about.bio2': {
    en: 'The Koifman Brief draws on both worlds: the analytical rigor of intelligence work applied to the macro forces and structural shifts that shape geopolitics, markets, and capital flows.',
    fa: 'خلاصه کویفمن از هر دو دنیا بهره می‌برد: دقت تحلیلی کار اطلاعاتی در کنار نیروهای کلان و تحولات ساختاری که ژئوپلیتیک، بازارها و جریان سرمایه را شکل می‌دهند.',
  },
  'about.whatIWrite': { en: 'What I Write About', fa: 'درباره چه می‌نویسم' },
  'about.intro': {
    en: 'The Koifman Brief sits at the intersection of three domains that look disparate on the surface but share a common analytical thread.',
    fa: 'خلاصه کویفمن در تقاطع سه حوزه قرار دارد که در ظاهر متفاوت به نظر می‌رسند اما ریشه تحلیلی مشترکی دارند.',
  },
  'about.geo.label': { en: 'Geopolitics:', fa: 'ژئوپلیتیک:' },
  'about.geo.desc': {
    en: 'The operating environment that shapes everything else. Policy shifts, sanctions regimes, and regional dynamics that create structural risks and opportunities.',
    fa: 'محیط عملیاتی که همه چیز دیگر را شکل می‌دهد. تغییرات سیاستی، رژیم‌های تحریمی و پویایی‌های منطقه‌ای که ریسک‌ها و فرصت‌های ساختاری ایجاد می‌کنند.',
  },
  'about.fintech.label': { en: 'FinTech:', fa: 'فین‌تک:' },
  'about.fintech.desc': {
    en: 'Where regulatory frameworks meet technological disruption. Payments, digital assets, and the infrastructure that moves capital.',
    fa: 'جایی که چارچوب‌های نظارتی با اختلال فناوری روبرو می‌شوند. پرداخت‌ها، دارایی‌های دیجیتال و زیرساختی که سرمایه را جابجا می‌کند.',
  },
  'about.realestate.label': { en: 'Real Estate:', fa: 'املاک:' },
  'about.realestate.desc': {
    en: 'Where macro forces become tangible. Interest rates, demographic shifts, and policy changes manifest in physical assets and capital flows.',
    fa: 'جایی که نیروهای کلان ملموس می‌شوند. نرخ بهره، تغییرات جمعیتی و تغییرات سیاستی در دارایی‌های فیزیکی و جریان سرمایه تجلی می‌یابند.',
  },
  'about.conclusion': {
    en: 'Each piece traces implications beyond the obvious first-order effects. The goal is not prediction but clarity: understanding the forces at work well enough to make better decisions.',
    fa: 'هر مطلب پیامدها را فراتر از اثرات بدیهی مرتبه اول ردیابی می‌کند. هدف پیش‌بینی نیست بلکه وضوح است: درک نیروهای در کار به اندازه‌ای که تصمیم‌گیری بهتری ممکن شود.',
  },
  'about.connect': { en: 'Connect', fa: 'ارتباط' },
  'about.linkedin': { en: 'LinkedIn', fa: 'لینکدین' },
  'about.email': { en: 'Email', fa: 'ایمیل' },

  // Subscribe
  'subscribe.label': { en: 'Newsletter', fa: 'خبرنامه' },
  'subscribe.heading': { en: 'Get the next brief', fa: 'مطلب بعدی را دریافت کنید' },
  'subscribe.description': {
    en: 'Concise analysis on macro forces and structural shifts. No spam.',
    fa: 'تحلیل مختصر درباره نیروهای کلان و تحولات ساختاری. بدون هرزنامه.',
  },
  'subscribe.placeholder': { en: 'your@email.com', fa: 'ایمیل شما' },
  'subscribe.button': { en: 'Subscribe', fa: 'عضویت' },
  'subscribe.loading': { en: 'Subscribing', fa: 'در حال عضویت' },
  'subscribe.success': {
    en: "You're subscribed. Check your email to confirm.",
    fa: 'عضو شدید. ایمیل خود را برای تأیید بررسی کنید.',
  },
  'subscribe.error': {
    en: 'Something went wrong. Please try again.',
    fa: 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
  },

  // Share
  'share.label': { en: 'Share:', fa: 'اشتراک‌گذاری:' },
  'share.linkedin': { en: 'Share on LinkedIn', fa: 'اشتراک در لینکدین' },
  'share.x': { en: 'Share on X', fa: 'اشتراک در ایکس' },

  // Author card
  'author.name': { en: 'Shahar Koifman', fa: 'شاهار کویفمن' },
  'author.bio': {
    en: 'Intelligence background. FinTech, CRE, and geopolitics analyst.',
    fa: 'پیشینه اطلاعاتی. تحلیلگر فین‌تک، املاک تجاری و ژئوپلیتیک.',
  },

  // Footer
  'footer.copyright': { en: 'The Koifman Brief', fa: 'خلاصه کویفمن' },
  'footer.linkedin': { en: 'Follow on LinkedIn', fa: 'دنبال کردن در لینکدین' },
  'footer.x': { en: 'Follow on X', fa: 'دنبال کردن در ایکس' },

  // Errors
  'error.title': { en: 'Something went wrong', fa: 'مشکلی پیش آمد' },
  'error.message': { en: 'Please try refreshing the page.', fa: 'لطفاً صفحه را مجدداً بارگذاری کنید.' },
  'error.retry': { en: 'Try again', fa: 'تلاش مجدد' },

  // Loading
  'loading.title': { en: 'THE KOIFMAN BRIEF', fa: 'خلاصه کویفمن' },
  'loading.tagline': { en: 'Clarity in complexity', fa: 'وضوح در پیچیدگی' },

  // Theme toggle
  'theme.light': { en: 'Switch to light mode', fa: 'تغییر به حالت روشن' },
  'theme.dark': { en: 'Switch to dark mode', fa: 'تغییر به حالت تاریک' },

  // Categories
  'category.geopolitics': { en: 'Geopolitics', fa: 'ژئوپلیتیک' },
  'category.fintech': { en: 'FinTech', fa: 'فین‌تک' },
  'category.real-estate': { en: 'Real Estate', fa: 'املاک' },
  'category.macro': { en: 'Macro', fa: 'کلان' },

  // Metadata
  'meta.description': {
    en: 'Clarity in complexity. Geopolitics, FinTech, and real estate analysis by Shahar Koifman.',
    fa: 'وضوح در پیچیدگی. تحلیل ژئوپلیتیک، فین‌تک و املاک توسط شاهار کویفمن.',
  },
}

export function t(key: string): string {
  const entry = dict[key]
  if (!entry) return key
  return entry[locale]
}

export function postTitle(post: { title: string; title_fa?: string }): string {
  return (locale === 'fa' ? post.title_fa : undefined) ?? post.title
}

export function postExcerpt(post: { excerpt: string; excerpt_fa?: string }): string {
  return (locale === 'fa' ? post.excerpt_fa : undefined) ?? post.excerpt
}

export function postBody(post: { body: string; body_fa?: string }): string {
  return (locale === 'fa' ? post.body_fa : undefined) ?? post.body
}
