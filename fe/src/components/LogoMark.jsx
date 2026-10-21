import Logo from './Logo';

// The RISCH logo as a block, sized with --h (its height) in CSS. Used on the
// printable risk report.
export default function LogoMark({ alt = 'RISCH', className = '' }) {
  return (
    <span className={`logo-mark ${className}`.trim()}>
      <Logo title={alt} />
    </span>
  );
}
