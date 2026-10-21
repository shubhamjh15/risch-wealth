import { Link } from 'react-router-dom';
import Logo from './Logo';

// The RISCH logo at the top of the portal sidebars.
export default function RingLogo({ to, label }) {
  return (
    <Link to={to} className="ring-logo portal-logo" aria-label={label}>
      <Logo title="" />
    </Link>
  );
}
