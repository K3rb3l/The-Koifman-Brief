import { config, fields, collection } from '@keystatic/core'

export default config({
  storage: {
    kind: 'github',
    repo: 'K3rb3l/The-Koifman-Brief',
  },

  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*/',
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
        }),
        date: fields.date({
          label: 'Published Date',
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Geopolitics', value: 'geopolitics' },
            { label: 'FinTech', value: 'fintech' },
            { label: 'Real Estate', value: 'real-estate' },
            { label: 'Macro', value: 'macro' },
          ],
          defaultValue: 'geopolitics',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Short summary for homepage cards and SEO meta description',
          multiline: true,
          validation: { isRequired: true },
        }),
        coverImage: fields.image({
          label: 'Cover Image',
          directory: 'public/images/posts',
          publicPath: '/images/posts',
        }),
        body: fields.markdoc({
          label: 'Body',
        }),
      },
    }),
  },
})
