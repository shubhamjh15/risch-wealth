import { useCallback, useEffect, useState } from 'react';
import { listStaffTestimonials, setTestimonialStatus } from '../../api/authApi';
import { PageHead, fmtDate } from '../ClientPortal/ui';
import { RowMenu } from './common';

const STATUS = { published: ['Live', 'active'], hidden: ['Hidden', 'disabled'] };
const TABS = [
  { key: '', label: 'All', count: (c) => c.published + c.hidden },
  { key: 'published', label: 'Live', count: (c) => c.published },
  { key: 'hidden', label: 'Hidden', count: (c) => c.hidden },
];

// Testimonials sent from the public Testimonials page. They go live as soon
// as they're submitted; any staff member can hide one, or show it again.
export default function Testimonials() {
  const [tab, setTab] = useState('');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => listStaffTestimonials(tab).then((r) => { setRes(r); setErr(''); }).catch((e) => setErr(e.message)), [tab]);
  useEffect(() => { load(); }, [load]);
  const move = (id, status) => setTestimonialStatus(id, status).then(load).catch((e) => setErr(e.message));

  return (
    <>
      <PageHead title="Testimonials" sub="Sent from the public Testimonials page and shown there straight away. Hide anything that shouldn’t be public." />
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
                  const items = [
                    t.status === 'published'
                      ? { label: 'Hide from website', onClick: () => move(t.id, 'hidden') }
                      : { label: 'Show on website', onClick: () => move(t.id, 'published') },
                  ];
                  return (
                    <tr key={t.id} onClick={() => setOpenId(expanded ? null : t.id)} aria-expanded={expanded}>
                      <td>{fmtDate(t.createdAt)}</td>
                      <td className="sp-contact"><strong>{t.name}</strong><span>{t.email}</span><span>{[t.role, t.place, t.group].filter(Boolean).join(' · ')}</span></td>
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
