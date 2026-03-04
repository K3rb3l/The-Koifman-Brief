import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 },
    )
  }

  const res = await fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_address: email }),
  })

  if (!res.ok) {
    if (res.status === 400) {
      return NextResponse.json(
        { error: 'This email is already subscribed.' },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
