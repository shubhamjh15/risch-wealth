import { PageShell } from './page';
import { MEDIA } from './ui';

// The sign-in pages: a picture panel with a line of brand copy beside the
// form card. Forms keep native scrolling.
//   still   a still in public/visuals for the panel
export default function AuthLayout({ kicker, title, line, still = 'reel-horizon', children }) {
  return (
    <PageShell solid smooth={false}>
      <section className="v3-auth">
        <div className="v3-wrap v3-auth-grid">
          <aside className="v3-auth-panel v3-ph-in" style={{ '--d': '.1s' }} aria-hidden="true">
            <img src={`${MEDIA}/${still}.jpg`} alt="" width="1920" height="1080" />
            <div className="v3-auth-panel-copy">
              <p className="v3-kicker"><span>RISCH</span>{kicker}</p>
              <p className="v3-auth-line">{line}</p>
            </div>
          </aside>
          <div className="v3-auth-main">
            <h1 className="v3-lh-title v3-auth-title">
              <span className="v3-ph-l"><span style={{ '--d': '.15s' }}>{title}</span></span>
            </h1>
            <div className="v3-auth-card v3-ph-in" style={{ '--d': '.3s' }}>{children}</div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
