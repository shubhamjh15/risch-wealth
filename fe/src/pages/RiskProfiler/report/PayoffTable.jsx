import { fmtINR, pct } from '../../../utils/format';

export default function PayoffTable({ portfolios, amount, selectedLabel }) {
  return (
    <table className="payoff-table">
      <thead>
        <tr><th>Portfolio</th><th>Worst case</th><th>Expected</th><th>Best case</th></tr>
      </thead>
      <tbody>
        {portfolios.map((p) => {
          const isSel = p.label === selectedLabel;
          return (
            <tr className={isSel ? 'selected-row' : ''} key={p.label}>
              <td>{p.label}{isSel ? ' [Selected]' : ''}</td>
              <td className="neg">{fmtINR(amount * (1 + p.worst))} ({pct(p.worst * 100)})</td>
              <td className="pos">{fmtINR(amount * (1 + p.exp))} (+{pct(p.exp * 100)})</td>
              <td className="pos">{fmtINR(amount * (1 + p.best))} (+{pct(p.best * 100)})</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
