// The result, first and in plain words: the profile, where it sits among
// the four, the two scores behind it and a rounded illustrative mix. The
// detailed report follows below it.
const MEANING = {
  1: 'You value steadiness. An illustrative mix for this profile leans on fixed income to soften market falls, with equity for growth over time.',
  2: 'You want growth and can accept some ups and downs. An illustrative mix for this profile holds a little over half in equity, with fixed income for balance.',
  3: 'You are investing for the long run and can sit through sharp falls. An illustrative mix for this profile is mostly equity.',
  4: 'You are comfortable with large swings for higher long-term growth. An illustrative mix for this profile is concentrated in equity.',
};
const TIME_MAX = 17;
const RISK_MAX = 100;

export default function ResultSummary({ name, scoreResult }) {
  const { tier, tierOrder, tiers, timeHorizonScore, riskPreferenceScore } = scoreResult;
  const m = tiers[tier];
  const mix = [
    ['Equity', Math.round(m.india + m.intl)],
    ['Fixed income', Math.round(m.debt)],
    ['Cash', Math.round(m.cash)],
  ];
  return (
    <section className="rp-sum">
      <p className="rp-sum-k">{name ? `${name.split(' ')[0]}, your risk profile` : 'Your risk profile'}</p>
      <h2 className="rp-sum-name">{m.short.replace('Active ', '')}</h2>
      <p className="rp-sum-meaning">{MEANING[tier]}</p>

      <ol className="rp-sum-scale" aria-label="The four risk profiles">
        {tierOrder.map((t) => (
          <li key={t} className={t === tier ? 'is-on' : undefined}><i />{tiers[t].short.replace('Active ', '')}</li>
        ))}
      </ol>

      <div className="rp-sum-grid">
        <div className="rp-sum-scores">
          <Bar label="Time horizon" value={timeHorizonScore} max={TIME_MAX} />
          <Bar label="Comfort with ups and downs" value={riskPreferenceScore} max={RISK_MAX} />
        </div>
        <div className="rp-sum-mix">
          <p>Illustrative mix</p>
          <div className="rp-sum-stack">{mix.map(([k, v]) => v > 0 && <span key={k} style={{ flexGrow: v }} title={`${k} ${v}%`} />)}</div>
          <ul>{mix.map(([k, v]) => <li key={k}><b>{v}%</b>{k}</li>)}</ul>
        </div>
      </div>
      <p className="rp-sum-note">Illustrative only, not a recommendation. Your full report is below.</p>
    </section>
  );
}

function Bar({ label, value, max }) {
  return (
    <div className="rp-sum-bar">
      <p><span>{label}</span><b>{value} / {max}</b></p>
      <i><b style={{ width: `${Math.round((value / max) * 100)}%` }} /></i>
    </div>
  );
}
