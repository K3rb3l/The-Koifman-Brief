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
            {/* Desaturate slightly — warm editorial tone */}
            <feColorMatrix
              type="saturate"
              values="0.15"
              result="gray"
            />
            {/* Gentle contrast boost */}
            <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.2" intercept="-0.05" />
              <feFuncG type="linear" slope="1.2" intercept="-0.05" />
              <feFuncB type="linear" slope="1.2" intercept="-0.05" />
            </feComponentTransfer>
            {/* Subtle edge emphasis */}
            <feConvolveMatrix
              in="contrast"
              order="3"
              kernelMatrix="0 -0.5 0 -0.5 3 -0.5 0 -0.5 0"
              result="edges"
            />
            {/* Slight softness — hand-drawn feel */}
            <feGaussianBlur in="edges" stdDeviation="0.3" />
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
        className="rounded-md object-cover dark:opacity-0"
        style={{ filter: 'url(#pencil-sketch)', transition: 'opacity 0.3s ease-in-out' }}
        priority={priority}
      />
      {/* Dark mode image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="absolute inset-0 rounded-md object-cover opacity-0 dark:opacity-100"
        style={{ filter: 'url(#pencil-sketch-dark)', transition: 'opacity 0.3s ease-in-out' }}
        priority={priority}
      />
    </div>
  )
}
