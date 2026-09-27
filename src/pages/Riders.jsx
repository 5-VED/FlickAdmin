import { useState, useMemo } from 'react';
import { Search, Eye, Ban, Trash2, CheckCircle, ShieldCheck, ShieldX } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdmin } from '../context/AdminContext';
import styles from './Riders.module.css';

function fmt(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const VEHICLE_ICON = { Bike: '🏍️', Auto: '🛺', Cab: '🚖' };

export default function Riders() {
  const { riders: rawRiders, verifyRider, updateCustomerStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  // Normalize both API and mock data
  const data = useMemo(() => rawRiders.map(r => ({
    id: r._id || r.id,
    name: r.name || (r.user_id ? `${r.user_id.first_name || ''} ${r.user_id.last_name || ''}`.trim() : 'Unknown'),
    phone: r.phone || r.user_id?.phone || '—',
    city: r.city || r.user_id?.city || '—',
    vehicle: r.vehicle || r.vehicle_category || r.vehicle_details?.category || 'Bike',
    rating: r.rating || 0,
    totalRides: r.totalRides || r.total_rides || 0,
    earnings: r.earnings || 0,
    status: r.status || (r.on_duty ? 'Online' : 'Offline'),
    joined: r.joined || r.createdAt || r.user_id?.createdAt || new Date().toISOString(),
    docVerified: r.docVerified ?? r.doc_verified ?? false,
    vehicleNo: r.vehicleNo || r.vehicle_details?.vehicle_no || '—',
  })), [rawRiders]);

  const filtered = useMemo(() => data.filter(r => {
    const q = search.toLowerCase();
    return (
      ((r.name || '').toLowerCase().includes(q) || (r.phone || '').includes(q)) &&
      (statusFilter === 'All' || r.status === statusFilter) &&
      (vehicleFilter === 'All' || r.vehicle === vehicleFilter)
    );
  }), [data, search, statusFilter, vehicleFilter]);

  function toggleBlock(r) {
    const isBlocked = r.status === 'Blocked';
    updateCustomerStatus(r.id, isBlocked);
    if (selected?.id === r.id) setSelected(s => ({ ...s, status: isBlocked ? 'Offline' : 'Blocked' }));
  }

  function deleteRider(r) {
    if (!window.confirm(`Block ${r.name}? This will disable their account.`)) return;
    updateCustomerStatus(r.id, false);
    if (selected?.id === r.id) setSelected(null);
  }

  function handleVerify(r, verified) {
    verifyRider(r.id, verified);
    if (selected?.id === r.id) setSelected(s => ({ ...s, docVerified: verified }));
  }

  const columns = [
    {
      key: 'name', label: 'Rider', sortable: true,
      render: (v, row) => (
        <div>
          <p className={styles.cellMain}>{v}</p>
          <p className={styles.cellSub}>{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'vehicle', label: 'Vehicle', sortable: true,
      render: v => (
        <span className={styles.cellVehicle}>
          <span>{VEHICLE_ICON[v]}</span>{v}
        </span>
      ),
    },
    {
      key: 'rating', label: 'Rating', sortable: true,
      render: v => <span className={styles.cellRating}>⭐ {v}</span>,
    },
    { key: 'totalRides', label: 'Rides', sortable: true, render: v => <span className={styles.cellBold}>{v}</span> },
    {
      key: 'earnings', label: 'Earnings', sortable: true,
      render: v => <span className={styles.cellMoney}>₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'docVerified', label: 'Docs',
      render: v => v
        ? <span className={styles.docOk}><ShieldCheck size={13} />Verified</span>
        : <span className={styles.docPending}><ShieldX size={13} />Pending</span>,
    },
    { key: 'joined', label: 'Joined', sortable: true, render: v => <span className={styles.cellDate}>{fmt(v)}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <div className={styles.rowActions}>
          <Btn icon={Eye} title="View" color="yellow" onClick={() => setSelected(row)} />
          <Btn
            icon={row.status === 'Blocked' ? CheckCircle : Ban}
            title={row.status === 'Blocked' ? 'Unblock' : 'Block'}
            color={row.status === 'Blocked' ? 'green' : 'red'}
            onClick={() => toggleBlock(row)}
          />
          <Btn icon={Trash2} title="Delete" color="red" onClick={() => deleteRider(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search rider name or phone…"
            className={styles.searchInput}
          />
        </div>
        <Sel value={statusFilter} onChange={setStatusFilter} options={['All', 'Online', 'Offline', 'Blocked']} />
        <Sel value={vehicleFilter} onChange={setVehicleFilter} options={['All', 'Bike', 'Auto', 'Cab']} />
        <span className={styles.count}>{filtered.length} of {data.length}</span>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={8} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width="max-w-xl">
        {selected && <RiderDetail rider={selected} onBlock={() => toggleBlock(selected)} />}
      </Modal>
    </div>
  );
}

function Btn({ icon: Icon, title, color, onClick }) {
  const cls = { yellow: styles.actionYellow, red: styles.actionRed, green: styles.actionGreen }[color];
  return <button onClick={onClick} title={title} className={`${styles.actionBtn} ${cls}`}><Icon size={14} /></button>;
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={styles.select}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RiderDetail({ rider: r, onBlock }) {
  const stats = [
    { label: 'Total Rides', value: r.totalRides },
    { label: 'Earnings', value: `₹${r.earnings.toLocaleString('en-IN')}` },
    { label: 'Rating', value: `⭐ ${r.rating}` },
  ];

  const earningsBreakdown = [
    { label: 'Gross Earnings', value: `₹${r.earnings.toLocaleString('en-IN')}` },
    { label: 'Platform Fee (10%)', value: `−₹${Math.round(r.earnings * 0.1).toLocaleString('en-IN')}` },
    { label: 'Net Payout', value: `₹${Math.round(r.earnings * 0.9).toLocaleString('en-IN')}`, highlight: true },
  ];

  const recentRides = [
    { from: 'Andheri West', to: 'Bandra', fare: 120, date: 'Jan 15', status: 'Completed' },
    { from: 'Powai', to: 'Thane', fare: 155, date: 'Jan 10', status: 'Completed' },
    { from: 'Borivali', to: 'Andheri', fare: 90, date: 'Jan 13', status: 'Completed' },
  ];

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div className={styles.detailAvatar}>
          <span className={styles.detailAvatarText}>{r.name[0]}</span>
        </div>
        <div className={styles.detailId}>
          <div className={styles.detailNameRow}>
            <p className={styles.detailName}>{r.name}</p>
            <span>{VEHICLE_ICON[r.vehicle]}</span>
          </div>
          <p className={styles.detailLine}>{r.phone}</p>
          <p className={styles.detailLine}>{r.vehicleNo}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      <div className={styles.statGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statBox}>
            <p className={styles.statValue}>{s.value}</p>
            <p className={styles.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={styles.infoGrid}>
        {[
          { label: 'City', value: r.city },
          { label: 'Vehicle Type', value: r.vehicle },
          { label: 'Rider ID', value: r.id },
          { label: 'Documents', value: r.docVerified ? '✅ Verified' : '⏳ Pending' },
          { label: 'Joined', value: new Date(r.joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label}>
            <p className={styles.infoLabel}>{item.label}</p>
            <p className={styles.infoValue}>{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className={styles.sectionTitle}>EARNINGS BREAKDOWN</h4>
        <div className={styles.breakdown}>
          {earningsBreakdown.map(e => (
            <div key={e.label} className={`${styles.breakdownRow} ${e.highlight ? styles.breakdownHighlight : ''}`}>
              <span className={styles.breakdownLabel}>{e.label}</span>
              <span className={e.highlight ? styles.breakdownValueHi : styles.breakdownValue}>{e.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className={`${styles.sectionTitle} ${styles.sectionTitleSpaced}`}>RECENT RIDES</h4>
        <div className={styles.rideList}>
          {recentRides.map((ride, i) => (
            <div key={i} className={styles.rideRow}>
              <div>
                <p className={styles.rideRoute}>{ride.from} → {ride.to}</p>
                <p className={styles.rideDate}>{ride.date}</p>
              </div>
              <div className={styles.rideRight}>
                <span className={styles.rideFare}>₹{ride.fare}</span>
                <StatusBadge status={ride.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBlock}
        className={`${styles.blockBtn} ${r.status === 'Blocked' ? styles.blockBtnSafe : styles.blockBtnDanger}`}
      >
        {r.status === 'Blocked' ? 'Unblock Rider' : 'Block Rider'}
      </button>
    </div>
  );
}
