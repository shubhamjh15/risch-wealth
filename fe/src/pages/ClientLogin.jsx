import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../v3/AuthLayout';
import { Arrow } from '../v3/ui';
import { FIRM } from '../data/firm';
import { login, me, signupClient } from '../api/authApi';
import PasswordInput from '../components/PasswordInput';
import { Req, ReqLegend } from '../components/Req';

const EMPTY = { fullName: '', email: '', phone: '', password: '', confirm: '' };

// Client sign-in / sign-up. Portfolio holdings themselves live on the
// external platform (FIRM.clientLoginUrl), reached via "View your portfolio".
export default function ClientLogin() {
  const [mode, setMode] = useState('signin');
  const [signin, setSignin] = useState({ email: '', password: '' });
  const [reg, setReg] = useState(EMPTY);
  const [note, setNote] = useState({ text: '', ok: false });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Signed-in clients belong in their portal.
  useEffect(() => {
    me().then((r) => { if (r.user.role === 'client') navigate('/client-portal', { replace: true }); }).catch(() => {});
  }, [navigate]);

  const go = (m) => { setMode(m); setNote({ text: '', ok: false }); };

  const onSignin = async (e) => {
    e.preventDefault();
    if (!signin.email.trim() || !signin.password) { setNote({ text: 'Please enter your email and password.', ok: false }); return; }
    setBusy(true);
    try {
      await login(signin.email.trim(), signin.password, 'client');
      navigate('/client-portal');
    } catch (err) {
      setSignin((s) => ({ ...s, password: '' }));
      setNote({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    if (reg.password.length < 10) { setNote({ text: 'Password must be at least 10 characters.', ok: false }); return; }
    if (reg.password !== reg.confirm) { setNote({ text: 'The two passwords don’t match.', ok: false }); return; }
    setBusy(true);
    try {
      const { confirm, ...data } = reg; // eslint-disable-line no-unused-vars
      const r = await signupClient(data);
      setSignin({ email: reg.email, password: '' });
      setReg(EMPTY);
      setMode('signin');
      setNote({ text: r.message, ok: true });
    } catch (err) {
      setReg((s) => ({ ...s, password: '', confirm: '' }));
      setNote({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  // `req`: required field, marked * (and aria-required for screen readers)
  const field = (id, label, props, req = false) => {
    const all = req ? { ...props, 'aria-required': 'true' } : props;
    return (
      <div className="v3-field">
        <label htmlFor={id}>{label}{req && <> <Req /></>}</label>
        {props.type === 'password' ? <PasswordInput id={id} {...all} /> : <input id={id} {...all} />}
      </div>
    );
  };

  const portfolioLink = (
    <a href={FIRM.clientLoginUrl} target="_blank" rel="noopener noreferrer" className="v3-textlink">View your portfolio <Arrow /></a>
  );

  return (
    <AuthLayout kicker="Client access" title="Client login." line="Your portfolio, statements and risk profile, in one place." still="reel-horizon">
      {mode === 'signin' ? (
        <form noValidate onSubmit={onSignin}>
          <h2 className="v3-auth-h">Sign in to your account</h2>
          <ReqLegend />
          {field('cEmail', 'Email', { type: 'email', autoComplete: 'email', value: signin.email, onChange: (e) => setSignin({ ...signin, email: e.target.value }) }, true)}
          {field('cPassword', 'Password', { type: 'password', autoComplete: 'current-password', value: signin.password, onChange: (e) => setSignin({ ...signin, password: e.target.value }) }, true)}
          <button type="submit" className="v3-pill v3-pill-dark v3-pill-block" disabled={busy}><span>{busy ? 'Signing in…' : 'Login'}</span>{!busy && <i><Arrow /></i>}</button>
          {note.text && <p className={'v3-note' + (note.ok ? ' is-ok' : '')} role="status">{note.text}</p>}
          <div className="v3-auth-actions">
            <button type="button" className="v3-textlink" onClick={() => go('signup')}>Create an account <Arrow /></button>
            {portfolioLink}
          </div>
        </form>
      ) : (
        <form noValidate onSubmit={onSignup}>
          <h2 className="v3-auth-h">Create your client account</h2>
          <ReqLegend />
          {field('rName', 'Full name', { type: 'text', autoComplete: 'name', value: reg.fullName, onChange: (e) => setReg({ ...reg, fullName: e.target.value }) }, true)}
          <div className="v3-field-row">
            {field('rEmail', 'Email', { type: 'email', autoComplete: 'email', value: reg.email, onChange: (e) => setReg({ ...reg, email: e.target.value }) }, true)}
            {field('rPhone', 'Mobile', { type: 'tel', autoComplete: 'tel', placeholder: 'Optional', value: reg.phone, onChange: (e) => setReg({ ...reg, phone: e.target.value }) })}
          </div>
          {field('rPassword', 'Password', { type: 'password', autoComplete: 'new-password', placeholder: 'At least 10 characters', value: reg.password, onChange: (e) => setReg({ ...reg, password: e.target.value }) }, true)}
          {field('rConfirm', 'Confirm password', { type: 'password', autoComplete: 'new-password', value: reg.confirm, onChange: (e) => setReg({ ...reg, confirm: e.target.value }) }, true)}
          <button type="submit" className="v3-pill v3-pill-dark v3-pill-block" disabled={busy}><span>{busy ? 'Creating account…' : 'Create account'}</span>{!busy && <i><Arrow /></i>}</button>
          {note.text && <p className={'v3-note' + (note.ok ? ' is-ok' : '')} role="status">{note.text}</p>}
          <p className="v3-auth-foot">Already have an account? <button type="button" className="v3-textlink" onClick={() => go('signin')}>Sign in</button></p>
        </form>
      )}
    </AuthLayout>
  );
}
