import {
  Html, Head, Body, Container, Text, Link, Hr, Font,
} from '@react-email/components'

type WelcomeEmailProps = {
  unsubscribeUrl: string
}

export function WelcomeEmail({ unsubscribeUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Playfair Display"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTbtbK-F2rA.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Body style={body}>
        <Container style={container}>
          <Text style={label}>THE KOIFMAN BRIEF</Text>
          <Hr style={divider} />
          <Text style={heading}>Welcome aboard.</Text>
          <Text style={bodyText}>
            You&apos;re now subscribed to The Koifman Brief — concise analysis on geopolitics, FinTech, and real estate.
          </Text>
          <Text style={bodyText}>
            New briefs go out when they&apos;re ready, not on a fixed schedule. Quality over frequency.
          </Text>
          <Hr style={divider} />
          <Text style={footer}>
            You received this because you subscribed to The Koifman Brief.
          </Text>
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            Unsubscribe
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#F5F0E8',
  fontFamily: '"Libre Franklin", Helvetica, Arial, sans-serif',
  margin: '0',
  padding: '0',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px',
}

const label = {
  fontSize: '10px',
  fontWeight: '600' as const,
  letterSpacing: '0.3em',
  textTransform: 'uppercase' as const,
  color: '#8B7B6B',
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
}

const divider = {
  borderTop: '1px solid #D4C5B0',
  margin: '0 0 32px 0',
}

const heading = {
  fontFamily: '"Playfair Display", Georgia, serif',
  fontSize: '28px',
  fontWeight: '700' as const,
  lineHeight: '1.3',
  color: '#1A1A1A',
  margin: '0 0 16px 0',
}

const bodyText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4A4A4A',
  margin: '0 0 16px 0',
}

const footer = {
  fontSize: '12px',
  color: '#8B7B6B',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
}

const unsubscribeLink = {
  display: 'block',
  fontSize: '12px',
  color: '#8B7B6B',
  textAlign: 'center' as const,
  textDecoration: 'underline',
}
