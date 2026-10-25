import LogoMark from '../../../components/LogoMark';

export function PageHead({ dateStr }) {
  return (
    <div className="report-head">
      <div>
        <LogoMark alt="RISCH Wealth" />
        <p className="body-s" style={{ marginTop: 8, color: 'var(--muted)', fontSize: '10.5px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>RISCH Private Wealth</p>
      </div>
      <div className="rh-right">
        <p className="tag">RISCH Risk Profile Report</p>
        <h2>{dateStr}</h2>
      </div>
    </div>
  );
}

export function PageMeta({ meta }) {
  return (
    <div className="report-meta">
      <div className="m-cell"><div className="m-label">Client Name</div><div className="m-value">{meta.clientName}<small>Age: {meta.clientAge}</small></div></div>
      <div className="m-cell"><div className="m-label">Client Contact</div><div className="m-value" style={{ fontSize: '11.5px' }}>{meta.clientEmail}<small>{meta.clientPhone}</small></div></div>
      <div className="m-cell"><div className="m-label">Prepared By</div><div className="m-value">RISCH Wealth</div></div>
      <div className="m-cell"><div className="m-label">Report Date</div><div className="m-value">{meta.dateStr}<small>www.rischwealth.com</small></div></div>
    </div>
  );
}

export function PageFoot({ n }) {
  return (
    <div className="pg-foot">
      <span>www.rischwealth.com · Confidential</span>
      <span>Page {n} of 4</span>
    </div>
  );
}
