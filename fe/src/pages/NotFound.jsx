import { Link } from 'react-router-dom';
import { PageShell, LightHero } from '../v3/page';
import { Arrow } from '../v3/ui';

export default function NotFound() {
  return (
    <PageShell solid smooth={false}>
      <LightHero
        kicker="Page not found"
        lines={['This page', <em key="e">doesn’t exist.</em>]}
        lede="The link may be out of date, or the address may have a typo."
      >
        <div className="v3-row-actions v3-ph-in" style={{ '--d': '.55s' }}>
          <Link to="/" className="v3-pill v3-pill-dark"><span>Go to the home page</span><i><Arrow /></i></Link>
          <Link to="/contact" className="v3-textlink">Contact us <Arrow /></Link>
        </div>
      </LightHero>
    </PageShell>
  );
}
