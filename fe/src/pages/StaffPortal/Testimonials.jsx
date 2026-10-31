import { useCallback, useEffect, useState } from 'react';
import { apiUrl, listStaffTestimonials, setTestimonialStatus } from '../../api/authApi';
import { PageHead, fmtDate } from '../ClientPortal/ui';
import { RowMenu } from './common';

const STATUS = { pending: ['To review', 'progress'], published: ['Live', 'active'], hidden: ['Not shown', 'disabled'] };
const TABS = [
  { key: 'pending', label: 'To review', count: (c) => c.pending },
  { key: 'published', label: 'Live', count: (c) => c.published },
  { key: 'hidden', label: 'Not shown', count: (c) => c.hidden },
  { key: '', label: 'All', count: (c) => c.pending + c.published + c.hidden },
];

// Testimonials sent from the public Testimonials page. Each one is emailed
// to the firm and waits here until a staff member publishes it; a live one
// can be taken down again.
export default function Testimonials() {
  const [tab, setTab] = useState('pending');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => listStaffTestimonials(tab).then((r) => { setRes(r); setErr(''); }).catch((e) => setErr(e.message)), [tab]);
  useEffect(() => { load(); }, [load]);
  const move = (id, status) => setTestimonialStatus(id, status).then(load).catch((e) => setErr(e.message));

  return (
    <>
      <PageHead title="Testimonials" sub="Sent from the public Testimonials page. Nothing appears on the website until you publish it." />
      <div className="cp-chips" role="tablist">
        {TABS.map((t) => (
          <button key={t.key || 'all'} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            {t.label}{res ? ` (${t.count(res.counts)})` : ''}
          </button>
        ))}
      </div>
      <section className="cp-card">
        {err && <p className="auth-note" role="alert">{err}</p>}
        {!res ? <p className="cp-muted">Loading…</p> : res.testimonials.length === 0 ? <p className="cp-muted">No testimonials here.</p> : (
          <div className="cp-table-wrap">
            <table className="cp-table sp-rows">
              <thead><tr><th>Date</th><th>From</th><th>Testimonial</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {res.testimonials.map((t) => {
                  const expanded = openId === t.id;
                  const items = t.status === 'published'
                    ? [{ label: 'Take off website', onClick: () => move(t.id, 'hidden') }]
                    : [
                      { label: 'Publish on website', onClick: () => move(t.id, 'published') },
                      ...(t.status === 'pending' ? [{ label: 'Don’t publish', onClick: () => move(t.id, 'hidden') }] : []),
                    ];
                  return (
                    <tr key={t.id} onClick={() => setOpenId(expanded ? null : t.id)} aria-expanded={expanded}>
                      <td>{fmtDate(t.createdAt)}</td>
                      <td className="sp-contact sp-tm-from">
                        {t.photo
                          ? <img src={apiUrl(t.photo)} alt="" width="44" height="44" loading="lazy" />
                          : <i aria-hidden="true">{t.name.trim().charAt(0).toUpperCase()}</i>}
                        <div><strong>{t.name}</strong><span>{t.email}</span><span>{[t.role, t.place, t.group].filter(Boolean).join(' · ')}</span></div>
                      </td>
                      <td className="sp-req-cell"><p className={expanded ? '' : 'sp-clamp'}>{t.quote}</p></td>
                      <td><span className={`status-pill ${STATUS[t.status][1]}`}>{STATUS[t.status][0]}</span></td>
                      <td className="num"><RowMenu label={`Actions for ${t.name}’s testimonial`} items={items} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
