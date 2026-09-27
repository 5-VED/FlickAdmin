import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import styles from './Settings.module.css';

export default function Settings() {
  const [commission, setCommission] = useState(10);
  const [surgeEnabled, setSurgeEnabled] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.5);
  const [vehicles, setVehicles] = useState({ Bike: true, Auto: true, Cab: true });
  const [admin, setAdmin] = useState({ name: 'Admin User', email: 'admin@flickapp.in', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState('');

  function save(section) {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  }

  function toggleVehicle(v) {
    setVehicles(prev => ({ ...prev, [v]: !prev[v] }));
  }

  return (
    <div className={`${styles.page} animate-fade-in`}>
      {/* Commission */}
      <Section title="Platform Commission" desc="Percentage deducted from each ride as platform fee.">
        <div className={styles.commissionRow}>
          <div className={styles.commissionMain}>
            <label className={styles.fieldLabel}>Commission Rate (%)</label>
            <div className={styles.commissionRow}>
              <input
                type="range" min={1} max={30} value={commission}
                onChange={e => setCommission(+e.target.value)}
                className={styles.range}
              />
              <div className={styles.valueBox}>
                <span className={styles.valueNum}>{commission}</span>
                <span className={styles.valueUnit}>%</span>
              </div>
            </div>
            <p className={styles.hint}>
              On a ₹100 fare → Platform earns ₹{commission}, Rider earns ₹{100 - commission}
            </p>
          </div>
        </div>
        <SaveBtn saved={saved === 'commission'} onClick={() => save('commission')} />
      </Section>

      {/* Surge Pricing */}
      <Section title="Surge Pricing" desc="Automatically increase fares during high-demand periods.">
        <div className={styles.switchCol}>
          <div className={styles.switchRow}>
            <div>
              <p className={styles.switchTitle}>Enable Surge Pricing</p>
              <p className={styles.switchDesc}>Multiplier applied when demand exceeds capacity</p>
            </div>
            <Toggle enabled={surgeEnabled} onToggle={() => setSurgeEnabled(v => !v)} />
          </div>

          {surgeEnabled && (
            <div className={`${styles.surgeBox} animate-fade-in`}>
              <label className={styles.fieldLabel}>Surge Multiplier</label>
              <div className={styles.surgeRow}>
                <input
                  type="range" min={1.1} max={3.0} step={0.1} value={surgeMultiplier}
                  onChange={e => setSurgeMultiplier(+parseFloat(e.target.value).toFixed(1))}
                  className={styles.range}
                />
                <div className={`${styles.valueBox} ${styles.valueBoxAlt}`}>
                  <span className={styles.valueNum}>{surgeMultiplier}x</span>
                </div>
              </div>
              <p className={styles.hint}>
                ₹100 base fare → ₹{Math.round(100 * surgeMultiplier)} with surge
              </p>
            </div>
          )}
        </div>
        <SaveBtn saved={saved === 'surge'} onClick={() => save('surge')} />
      </Section>

      {/* Vehicle Types */}
      <Section title="Vehicle Management" desc="Enable or disable vehicle categories on the platform.">
        <div className={styles.vehicleList}>
          {[
            { key: 'Bike', label: 'Bike', icon: '🏍️', desc: 'Two-wheeler rides for solo commuters' },
            { key: 'Auto', label: 'Auto', icon: '🛺', desc: 'Three-wheeler auto-rickshaws' },
            { key: 'Cab', label: 'Cab', icon: '🚖', desc: 'Four-wheeler cab rides' },
          ].map(v => (
            <div key={v.key} className={`${styles.vehicleRow} ${vehicles[v.key] ? '' : styles.vehicleOff}`}>
              <div className={styles.vehicleLeft}>
                <span className={styles.vehicleIcon}>{v.icon}</span>
                <div>
                  <p className={`${styles.vehicleName} ${vehicles[v.key] ? '' : styles.vehicleNameOff}`}>{v.label}</p>
                  <p className={styles.vehicleDesc}>{v.desc}</p>
                </div>
              </div>
              <Toggle enabled={vehicles[v.key]} onToggle={() => toggleVehicle(v.key)} />
            </div>
          ))}
        </div>
        <SaveBtn saved={saved === 'vehicles'} onClick={() => save('vehicles')} />
      </Section>

      {/* Admin Account */}
      <Section title="Admin Account" desc="Update your admin profile and change password.">
        <div className={styles.switchCol}>
          <div className={styles.formGrid}>
            <Field label="Display Name" value={admin.name} onChange={v => setAdmin(a => ({ ...a, name: v }))} />
            <Field label="Email Address" type="email" value={admin.email} onChange={v => setAdmin(a => ({ ...a, email: v }))} />
          </div>
          <div className={styles.divider}>
            <p className={styles.fieldLabel}>Change Password</p>
            <div className={styles.formGrid}>
              <div className={styles.passWrap}>
                <Field
                  label="New Password" type={showPass ? 'text' : 'password'}
                  value={admin.password} onChange={v => setAdmin(a => ({ ...a, password: v }))}
                />
                <button
                  onClick={() => setShowPass(v => !v)}
                  className={styles.eyeBtn}
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Field
                label="Confirm Password" type={showPass ? 'text' : 'password'}
                value={admin.confirm} onChange={v => setAdmin(a => ({ ...a, confirm: v }))}
              />
            </div>
            {admin.password && admin.confirm && admin.password !== admin.confirm && (
              <p className={styles.error}>Passwords do not match</p>
            )}
          </div>
        </div>
        <SaveBtn saved={saved === 'account'} onClick={() => save('account')} />
      </Section>
    </div>
  );
}

function Section({ title, desc, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title.toUpperCase()}</h2>
        <p className={styles.sectionDesc}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        className={styles.textInput}
      />
    </div>
  );
}

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`${styles.toggle} ${enabled ? styles.toggleOn : ''}`}
      type="button"
      role="switch"
      aria-checked={enabled}
    >
      <span className={`${styles.toggleKnob} ${enabled ? styles.knobOn : styles.knobOff}`} />
    </button>
  );
}

function SaveBtn({ saved, onClick }) {
  return (
    <div className={styles.saveRow}>
      <button
        onClick={onClick}
        className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
      >
        <Save size={14} />
        {saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
