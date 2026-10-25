import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../v3/AuthLayout';
import { Arrow } from '../v3/ui';
import { login, me } from '../api/authApi';
import PasswordInput from '../components/PasswordInput';
import { Req, ReqLegend } from '../components/Req';


// Staff sign-in only; the portal itself is /employee-portal. There is no
// public sign-up: admins create employee accounts under Team accounts.
export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    me().then((r) => { if (r.user.role !== 'client') navigate('/employee-portal', { replace: true }); }).catch(() => {});
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password) { setNote('Please enter your employee ID or email, and your password.'); return; }
    setBusy(true);
    try {
      await login(form.identifier.trim(), form.password, 'staff');
      navigate('/employee-portal');
    } catch (err) {
      setForm((f) => ({ ...f, password: '' }));
      setNote(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout kicker="Employee access" title="Team sign-in." line="For the RISCH team: clients, requests and records." still="wing-clouds">
      <form noValidate onSubmit={onSubmit}>
        <h2 className="v3-auth-h">Sign in with your RISCH account</h2>
        <ReqLegend />
        <div className="v3-field">
          <label htmlFor="eId">Employee ID or email <Req /></label>
          <input id="eId" aria-required="true" type="text" autoComplete="username" placeholder="e.g. RW1024" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
        </div>
        <div className="v3-field">
          <label htmlFor="ePassword">Password <Req /></label>
          <PasswordInput id="ePassword" aria-required="true" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="v3-pill v3-pill-dark v3-pill-block" disabled={busy}><span>{busy ? 'Signing in…' : 'Sign in'}</span>{!busy && <i><Arrow /></i>}</button>
        {note && <p className="v3-note" role="status">{note}</p>}
        <p className="v3-auth-foot">Accounts are created by a RISCH administrator. Forgotten your password? Ask your administrator to reset it.</p>
      </form>
      <p className="v3-auth-alt">Are you a client? <Link to="/client-login" className="v3-textlink">Go to Client Login <Arrow /></Link></p>
    </AuthLayout>
  );
}
