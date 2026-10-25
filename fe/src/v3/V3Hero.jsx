import { Link } from 'react-router-dom';
import { FIRM } from '../data/firm';
import { Arrow, MEDIA, MEDIA_V, RiseLine } from './ui';
import { useReel } from './useReel';
import { SCENES } from './scenes';

const SCENE_MS = 6500;

// The home page opening: a five-scene reel set in a rounded frame inside
// the page, with a floating card that leads to the risk profiler and
// the firm's registrations in a strip underneath.
export default function V3Hero() {
  const n = SCENES.length;
  const { i, setI, live, root, vids } = useReel(n, SCENE_MS);
  const scene = SCENES[i];

  return (
    <header ref={root} className="v3-hero">
      <div className="v3-hero-frame">
        <div className="v3-hero-media">
          {SCENES.map((s, k) => (
            <video
              key={s.clip}
              ref={(el) => { vids.current[k] = el; }}
              className={'v3-cover v3-hero-clip' + (k === i ? ' is-on' : '')}
              src={`${MEDIA}/${s.clip}.mp4?v=${MEDIA_V}`}
              poster={`${MEDIA}/${s.clip}.jpg?v=${MEDIA_V}`}
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
        <div className="v3-hero-shade" aria-hidden="true" />

        <div className="v3-hero-copy">
          {/* "We manage portfolios." is the brochure line the founder wants
              kept in the hero; it leads as the kicker. */}
          <p className="v3-hero-kicker" data-hero>We manage portfolios · Bengaluru · Since {FIRM.foundedYear}</p>
          <h1 className="v3-hero-title">
            <span className="v3-hero-l"><span className="v3-hero-in">Your wealth.</span></span>
            <span className="v3-hero-l"><span className="v3-hero-in">Our undivided attention.</span></span>
            <RiseLine className="v3-hero-rise" />
          </h1>
          <p className="v3-hero-lede" data-hero>Open-architecture private wealth management for entrepreneurs, families, professionals and global Indians. No in-house products, so every conversation starts with you, not a product.</p>
          <div className="v3-hero-ctas" data-hero>
            <Link to="/contact" className="v3-pill v3-pill-dark"><span>Begin a wealth review</span><i><Arrow /></i></Link>
            <Link to="/about" className="v3-textlink">Meet the founder <Arrow /></Link>
          </div>
        </div>

        <Link to="/risk-profiler" className="v3-hero-card" data-hero>
          <span className="v3-hero-card-k">Risk profile</span>
          <b>Find your risk profile in three minutes.</b>
          <span className="v3-hero-card-d">Eight questions, with your time horizon and risk preference scored separately. A starting point for a conversation with us.</span>
          <span className="v3-hero-card-go">Start <Arrow /></span>
        </Link>

        <div className="v3-hero-reel" data-hero>
          <p key={scene.word}><b>{scene.word}</b> {scene.line}</p>
          <div className="v3-hero-bars">
            {SCENES.map((s, k) => (
              <button key={s.clip} type="button" aria-label={`Scene ${k + 1}: ${s.word}`} aria-current={k === i}
                className={(k === i ? 'is-on' : '') + (k < i ? ' is-done' : '')} onClick={() => setI(k)}>
                <i key={k === i ? `on-${i}` : 'off'} style={{ animationDuration: `${SCENE_MS}ms`, animationPlayState: live ? 'running' : 'paused' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="v3-cred" data-reveal="stagger">
        <li><span>AMFI-registered Mutual Fund Distributor</span><b>{FIRM.registrations[0].id}</b></li>
        <li><span>APMI-registered PMS Distributor</span><b>{FIRM.registrations[1].id}</b></li>
        <li><span>Founded in Bengaluru</span><b>{FIRM.foundedYear}</b></li>
        <li><span>Open architecture</span><b>No in-house products</b></li>
      </ul>
    </header>
  );
}
