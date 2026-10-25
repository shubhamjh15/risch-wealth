export default function StrategySummary({ mandate, isRec }) {
  const equity = (mandate.india + mandate.intl).toFixed(2);
  return (
    <table className="mini-table">
      <thead><tr><th>Portfolio</th><th>Equity</th><th>Debt</th><th>Cash</th></tr></thead>
      <tbody>
        <tr>
          <td>{mandate.short}{isRec ? ' [Your profile]' : ''}</td>
          <td>{equity}%</td>
          <td>{mandate.debt.toFixed(2)}%</td>
          <td>{mandate.cash.toFixed(2)}%</td>
        </tr>
      </tbody>
    </table>
  );
}
