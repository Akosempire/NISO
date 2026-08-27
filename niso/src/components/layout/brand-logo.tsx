import { useId } from 'react';

type BrandLogoVariant = 'full' | 'wordmark';

interface BrandLogoProps {
  className?: string;
  variant?: BrandLogoVariant;
  title?: string;
}

const WORDMARK_FILL = '#3f686d';
const ACCENT_FILL = '#95c3a8';
const DESCRIPTOR_FILL = '#8fb89f';

function Wordmark({
  clipId,
  maskId,
}: {
  clipId: string;
  maskId: string;
}) {
  const textProps = {
    x: '0',
    y: '214',
    fontFamily: 'Arial Black, Arial, Helvetica, sans-serif',
    fontSize: '250',
    fontWeight: '900',
    letterSpacing: '-12',
  };

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <text {...textProps}>NISO</text>
        </clipPath>
        <mask id={maskId}>
          <rect width="930" height="240" fill="black" />
          <text {...textProps} fill="white">
            NISO
          </text>
          <g fill="black" transform="rotate(-11 420 176)">
            <rect x="-60" y="168" width="350" height="14" rx="7" />
            <rect x="448" y="154" width="238" height="14" rx="7" />
            <rect x="432" y="182" width="278" height="14" rx="7" />
            <rect x="416" y="210" width="318" height="14" rx="7" />
          </g>
        </mask>
      </defs>

      <rect width="930" height="240" fill={WORDMARK_FILL} mask={`url(#${maskId})`} />
      <rect
        x="325"
        y="160"
        width="68"
        height="34"
        rx="4"
        fill={ACCENT_FILL}
        clipPath={`url(#${clipId})`}
      />
    </>
  );
}

export function BrandLogo({
  className,
  variant = 'full',
  title = 'NISO logo',
}: BrandLogoProps) {
  const id = useId().replace(/:/g, '');
  const clipId = `niso-wordmark-clip-${id}`;
  const maskId = `niso-wordmark-mask-${id}`;

  if (variant === 'wordmark') {
    return (
      <svg
        viewBox="0 0 930 240"
        role="img"
        aria-label={title}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <Wordmark clipId={clipId} maskId={maskId} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1580 240"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <Wordmark clipId={clipId} maskId={maskId} />
      <line
        x1="970"
        y1="18"
        x2="970"
        y2="226"
        stroke={DESCRIPTOR_FILL}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <g
        fill={DESCRIPTOR_FILL}
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="64"
        letterSpacing="1.2"
      >
        <text x="1045" y="62">NIGERIAN</text>
        <text x="1045" y="126">INDEPENDENT</text>
        <text x="1045" y="190">SYSTEM OPERATOR</text>
      </g>
    </svg>
  );
}
