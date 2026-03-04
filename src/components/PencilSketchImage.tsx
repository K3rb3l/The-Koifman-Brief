import Image from 'next/image'

type PencilSketchImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function PencilSketchImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority,
}: PencilSketchImageProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* SVG filters for pencil/pen illustration effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Light mode filter */}
          <filter id="pencil-sketch">
            {/* Grayscale */}
            <feColorMatrix
              type="saturate"
              values="0"
              result="gray"
            />
            {/* High contrast / ink threshold */}
            <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.8" intercept="-0.3" />
              <feFuncG type="linear" slope="1.8" intercept="-0.3" />
              <feFuncB type="linear" slope="1.8" intercept="-0.3" />
            </feComponentTransfer>
            {/* Edge emphasis — pen strokes */}
            <feConvolveMatrix
              in="contrast"
              order="3"
              kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
              result="edges"
            />
            {/* Slight softness — hand-drawn feel */}
            <feGaussianBlur in="edges" stdDeviation="0.4" />
          </filter>

          {/* Dark mode filter — brighter output */}
          <filter id="pencil-sketch-dark">
            {/* Grayscale */}
            <feColorMatrix
              type="saturate"
              values="0"
              result="gray"
            />
            {/* Higher brightness for dark backgrounds */}
            <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.6" intercept="0.0" />
              <feFuncG type="linear" slope="1.6" intercept="0.0" />
              <feFuncB type="linear" slope="1.6" intercept="0.0" />
            </feComponentTransfer>
            {/* Edge emphasis */}
            <feConvolveMatrix
              in="contrast"
              order="3"
              kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"
              result="edges"
            />
            {/* Slight softness */}
            <feGaussianBlur in="edges" stdDeviation="0.4" />
          </filter>
        </defs>
      </svg>

      {/* Light mode image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="dark:hidden rounded-md object-cover"
        style={{ filter: 'url(#pencil-sketch)' }}
        priority={priority}
      />
      {/* Dark mode image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="hidden dark:block rounded-md object-cover"
        style={{ filter: 'url(#pencil-sketch-dark)' }}
        priority={priority}
      />
    </div>
  )
}
