import { Link } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import PageHero from '../components/page/PageHero';

export default function NotFound() {
  return (
    <>
      <Nav overHero />

      <PageHero
        className="pg-hero-full"
        eyebrow="Page Not Found"
        lines={['This page', <em key="e">doesn&rsquo;t exist.</em>]}
        lede="The link may be out of date, or the address may have a typo."
        aside={(
          <div className="pg-ctas">
            <Link to="/" className="btn btn-primary btn-fill"><span>Go to the home page</span></Link>
            <Link to="/contact" className="btn btn-line">Contact us</Link>
          </div>
        )}
      />

      <Footer />
    </>
  );
}
