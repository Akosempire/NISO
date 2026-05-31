interface LogoProps {
  height?: number;
  className?: string;
  alt?: string;
  onDark?: boolean;
}

export default function Logo({
  height = 40,
  className,
  alt = 'NISO — Nigerian Independent System Operator',
  onDark = false
}: LogoProps) {
  return (
    <img
      src="/niso-logo.png"
      alt={alt}
      height={height}
      className={className}
      style={{
        height: `${height}px`,
        width: 'auto',
        display: 'block',
        filter: onDark ? 'brightness(0) invert(1)' : undefined
      }}
    />
  );
}
