import { PageHead, PageFoot } from './ReportChrome';
import TierTabs from './TierTabs';
import TierPanel from './TierPanel';

export default function ReportPage3({ meta, tiers, tierOrder, recommendedTier, amount, activeTab, onSelectTab }) {
  const recMandate = tiers[recommendedTier];
  return (
    <div className="report-page">
      <PageHead dateStr={meta.dateStr} />

      <div className="r-section">
        <h3 className="r-title">Section: Strategic Asset Allocation &amp; Granular Breakdown</h3>
        <p className="r-sub">
          Illustrative asset mix for your risk profile: <strong style={{ color: 'var(--ink-2)' }}>{recMandate.name}</strong>.{' '}
          <span className="screen-only" style={{ color: 'var(--muted)' }}>Use the tabs below to see how each of our four portfolios would be built.</span>
        </p>

        <TierTabs tiers={tiers} tierOrder={tierOrder} recommendedTier={recommendedTier} activeTab={activeTab} onSelect={onSelectTab} />

        {tierOrder.map((t) => (
          <TierPanel
            key={t}
            tier={t}
            mandate={tiers[t]}
            amount={amount}
            isRec={t === recommendedTier}
            isActiveTab={t === activeTab}
          />
        ))}
      </div>
      <PageFoot n={3} />
    </div>
  );
}
