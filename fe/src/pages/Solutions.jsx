import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow } from '../v3/ui';
import { DISCIPLINE_VIZ, VizCards } from '../v3/principles';
import { scrollToTarget } from '../v3/smooth';
import { RiskGauge, ReturnGap } from '../v3/understand';
import Allocation from '../v3/Allocation';
import { PrinciplesBand, Solutions as Routes } from '../v3/sections';
import HorizonSelector from '../components/solutions/HorizonSelector';
import Icon from '../components/solutions/Icons';
import { useRiskProfile } from '../hooks/useRiskProfile';
import { ALLOCATION, CLOSING, HERO, HORIZONS, PHILOSOPHY, TOGETHER, UNDERSTAND, horizonForYears } from '../content/solutions';

// What We Provide: risk first, portfolio second. Understanding you, the
// asset mix your horizon points to, the principles behind every portfolio,
// and how it all comes together. All copy lives in content/solutions.js.
export default function Solutions() {
  const { status, profile, isClient } = useRiskProfile();
  const complete = status === 'complete';
  const reviewHref = '/client-portal/risk-profile';
  const startHref = isClient ? '/client-portal/risk-assessment' : '/risk-profiler';

  const [years, setYears] = useState(6);
  const alloc = useRef(null);
  const seeMix = () => alloc.current?.choose(HORIZONS.findIndex((h) => h.id === horizonForYears(years)));
  const goUnderstand = () => scrollToTarget(document.getElementById('understand'));

  const U = UNDERSTAND;
  return (
    <PageShell>
      <PageHero
        kicker="What we provide"
        lines={[HERO.title[0], <em key="e">{HERO.title[1]}</em>]}
        lede={HERO.body}
        actions={(
          <>
            <button type="button" className="v3-pill v3-pill-dark" onClick={goUnderstand}><span>{HERO.secondary}</span><i><Arrow /></i></button>
            <Link to={startHref} className="v3-textlink">Start Risk Profile <Arrow /></Link>
          </>
        )}
      />

      {/* ============ 01 · UNDERSTAND ============ */}
      <section className="v3-sec" id="understand">
        <div className="v3-wrap">
          <Head num="01" label="Your profile" title={U.title}>
            <p className="v3-head-sub" data-reveal>{U.intro}</p>
            {complete && (
              <p className="v3-saved" data-reveal>Your saved profile: <strong>{profile.tierName}</strong>. <Link to={reviewHref} className="v3-textlink">Review it <Arrow /></Link></p>
            )}
          </Head>
          <div className="v3-und">
            <article className="v3-und-card" data-reveal>
              <span className="v3-und-icon"><Icon name="gauge" size={26} /></span>
              <h3>{U.tolerance.title}</h3>
              <p>{U.tolerance.body}</p>
              <RiskGauge />
            </article>
            <article className="v3-und-card v3-und-card-wide" data-reveal>
              <span className="v3-und-icon"><Icon name="hourglass" size={26} /></span>
              <h3>{U.horizon.title}</h3>
              <p>{U.horizon.body}</p>
              <HorizonSelector years={years} onYears={setYears} onSeeMix={seeMix} />
              <p className="v3-und-note">{U.horizon.note}</p>
            </article>
            <article className="v3-und-card" data-reveal>
              <span className="v3-und-icon"><Icon name="brain" size={26} /></span>
              <h3>{U.behaviour.title}</h3>
              <p>{U.behaviour.body}</p>
              <ReturnGap funds={U.behaviour.fundsReturned} investors={U.behaviour.investorsEarned} gap={U.behaviour.figure} caption={U.behaviour.gapCaption} />
              <blockquote className="v3-und-quote">
                <p>&ldquo;{U.behaviour.quote}&rdquo;</p>
                <cite>{U.behaviour.quoteBy}</cite>
              </blockquote>
            </article>
          </div>
        </div>
      </section>

      {/* ============ 02 · ASSET ALLOCATION ============ */}
      <section className="v3-sec v3-sec-tight v3-tint">
        <div className="v3-wrap">
          <Head num="02" label="Asset allocation" title={ALLOCATION.title}>
            <p className="v3-head-sub" data-reveal>{ALLOCATION.intro}</p>
          </Head>
        </div>
      </section>
      <div className="v3-stage v3-stage-tint"><Allocation num="02" className="v3-stage-panel" ref={alloc} /></div>
      <section className="v3-sec v3-sec-after v3-tint">
        <div className="v3-wrap">
          <ul className="v3-points" data-reveal="stagger">
            {ALLOCATION.points.map(([t, d], i) => (
              <li key={t}><span>0{i + 1}</span><b>{t}</b><p>{d}</p></li>
            ))}
          </ul>
          <p className="v3-fine" data-reveal>{ALLOCATION.disclaimer}</p>
        </div>
      </section>

      {/* ============ 03 · PHILOSOPHY ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <div className="v3-split">
            <Head num="03" label="Our principles" title={PHILOSOPHY.title} />
            <blockquote className="v3-pull v3-split-side" data-reveal>
              <p>&ldquo;{PHILOSOPHY.quote}&rdquo;</p>
            </blockquote>
          </div>
        </div>
        <div className="v3-wrap v3-wrap-wide"><PrinciplesBand /></div>
      </section>

      {/* ============ 04 · HOW IT COMES TOGETHER ============ */}
      <section className="v3-sec v3-tint">
        <div className="v3-wrap">
          <Head num="04" label="Our process" title={TOGETHER.title} />
          <ol className="v3-process" data-reveal="stagger">
            {TOGETHER.steps.map(([t, d], i) => (
              <li key={t}>
                <span className="v3-process-n">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="v3-sec v3-sec-tight">
        <div className="v3-wrap">
          <Head num="05" label="What we offer" title={TOGETHER.blocksTitle}>
            <p className="v3-head-sub" data-reveal>{TOGETHER.blocksIntro}</p>
          </Head>
        </div>
        <Routes />
      </section>

      <section className="v3-sec">
        <div className="v3-wrap">
          <div className="v3-split">
            <Head num="06" label="Disciplines" title={TOGETHER.disciplinesTitle} />
            <p className="v3-lead v3-split-side" data-reveal>{CLOSING.title}</p>
          </div>
          <VizCards
            items={TOGETHER.disciplines.map((d) => ({ ...d, href: `/contact?topic=${encodeURIComponent(d.t)}` }))}
            viz={DISCIPLINE_VIZ}
            linkLabel="Discuss this"
          />
        </div>
      </section>

      <CloseBand
        kicker="The right conversation"
        title="Start with your risk. We will take it from there."
        primary={complete ? { to: reviewHref, label: 'Review Risk Profile' } : { to: startHref, label: 'Start Risk Profile' }}
        secondary={{ to: '/contact', label: 'Get in touch' }}
      />
    </PageShell>
  );
}
