import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FIRM } from '../data/firm';
import { Arrow, MEDIA, RiseLine } from './ui';
import { useReel } from './useReel';
import { SCENES } from './scenes';

// The opening film: five short scenes, each a different picture of what
// patient capital looks like, cross-fading under the headline. Story-style
// bars show where the reel is and jump to a scene on click. Only the current
// and next clips are loaded; the reel pauses when it's off screen.
const SCENE_MS = 6000;
const YEARS = new Date().getFullYear() - FIRM.careerStartYear;
const YEARS_WORD = YEARS === 20 ? 'Twenty' : String(YEARS);

// Bengaluru time, ticking. Blank on the server so hydration matches.
function LocalTime() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: false });
    const tick = () => setT(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || '--:--'}</span>;
}

export default function HeroReel() {
  const n = SCENES.length;
  const { i, setI, live, root, vids } = useReel(n, SCENE_MS);

  const scene = SCENES[i];

  return (
    <header ref={root} className={'v2-hero' + (live ? ' is-live' : '')}>
      <div className="v2-hero-media">
        {SCENES.map((s, k) => (
          <video
            key={s.clip}
            ref={(el) => { vids.current[k] = el; }}
            className={'v2-cover v2-hero-clip' + (k === i ? ' is-on' : '')}
            src={`${MEDIA}/${s.clip}.mp4`}
            poster={`${MEDIA}/${s.clip}.jpg`}
            muted
            playsInline
            loop
            preload={k === 0 ? 'auto' : 'none'}
            autoPlay={k === 0}
            aria-hidden="true"
            tabIndex={-1}
          />
        ))}
      </div>
      <div className="v2-hero-veil" aria-hidden="true" />

      <div className="v2-wrap v2-hero-inner">
        {/* "We manage portfolios." is the line from the client brochure the
            founder wants kept in the hero; it leads as the kicker. */}
        <p className="v2-hero-kicker" data-hero>We manage portfolios <i /> Bengaluru <i /> Since {FIRM.foundedYear}</p>
        <h1 className="v2-hero-title">
          <span className="v2-hero-l"><span className="v2-hero-in">Preserve.</span></span>
          <span className="v2-hero-l"><span className="v2-hero-in">Compound.</span></span>
          <span className="v2-hero-l"><span className="v2-hero-in"><em>Pass on.</em></span></span>
          <RiseLine className="v2-hero-rise" />
        </h1>
        <div className="v2-hero-row">
          <p className="v2-hero-lede" data-hero>Private wealth management for entrepreneurs, families, professionals and global Indians. {YEARS_WORD} years of private banking, with nothing of our own to sell.</p>
          <div className="v2-hero-ctas" data-hero>
            <Link to="/contact" className="v2-btn" data-magnetic="0.2"><span>Begin a wealth review</span><Arrow /></Link>
            <Link to="/about" className="v2-link">Meet the founder <Arrow /></Link>
          </div>
        </div>
      </div>

      <div className="v2-wrap v2-hero-foot" data-hero>
        <div className="v2-reel" aria-label="Film chapters">
          <p className="v2-reel-now" aria-live="polite">
            <span className="v2-reel-n">{String(i + 1).padStart(2, '0')}</span>
            <span key={scene.word} className="v2-reel-word"><b>{scene.word}</b> {scene.line}</span>
          </p>
          <div className="v2-reel-bars">
            {SCENES.map((s, k) => (
              <button
                key={s.clip}
                type="button"
                className={'v2-reel-bar' + (k === i ? ' is-on' : '') + (k < i ? ' is-done' : '')}
                aria-label={`Scene ${k + 1}: ${s.word}`}
                aria-current={k === i}
                onClick={() => setI(k)}
              >
                <i key={k === i ? `on-${i}` : 'off'} style={{ animationDuration: `${SCENE_MS}ms`, animationPlayState: live ? 'running' : 'paused' }} />
              </button>
            ))}
          </div>
        </div>
        <p className="v2-hero-facts">
          <span>AMFI ARN <b>{FIRM.registrations[0].id.replace('ARN-', '')}</b></span>
          <span>APMI APRN <b>{FIRM.registrations[1].id.replace('APRN-', '')}</b></span>
          <span className="v2-hero-clock">Bengaluru <b><LocalTime /></b> IST</span>
        </p>
      </div>
    </header>
  );
}
