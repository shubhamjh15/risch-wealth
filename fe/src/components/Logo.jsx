// The RISCH logo (public/risch-logo.svg): the wordmark with the rising
// swoosh and arrow. Inlined so it takes its colour from CSS (`color`),
// orange by default, ivory on navy. Decorative when a label is given to the
// link around it; otherwise it announces itself as "RISCH".
import { PATHS } from './logoPaths';

export default function Logo({ className = '', title = 'RISCH' }) {
  return (
    <svg className={`risch-logo ${className}`.trim()} viewBox="40 40 304 150" role="img" aria-label={title} focusable="false">
      <g fill="currentColor">
        {PATHS.map((d) => <path key={d.slice(0, 24)} d={d} />)}
      </g>
    </svg>
  );
}
