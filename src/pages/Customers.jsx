import { useState, useMemo } from 'react';
import { Search, Eye, Ban, Trash2, CheckCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdmin } from '../context/AdminContext';
import styles from './Customers.module.css';

function fmt(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Customers() {
  const { customers: rawCustomers, updateCustomerStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  // Normalize API and mock data to same shape
  const data = useMemo(() => rawCustomers.map(c => ({
    id: c._id || c.id,
    name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
    email: c.email,
    phone: c.phone,
    city: c.city || c.address || '—',
    totalRides: c.totalRides || 0,
    totalSpent: c.totalSpent || 0,
    status: c.status || (c.is_active === false ? 'Blocked' : 'Active'),
    joined: c.joined || c.createdAt || new Date().toISOString(),
    wallet: c.wallet || 0,
  })), [rawCustomers]);

  const cities = useMemo(() => ['All', ...new Set(data.map(c => c.city).filter(Boolean))], [data]);

  const filtered = useMemo(() => data.filter(c => {
    const q = search.toLowerCase();
    return (
      ((c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.email || '').toLowerCase().includes(q)) &&
      (statusFilter === 'All' || c.status === statusFilter) &&
      (cityFilter === 'All' || c.city === cityFilter)
    );
  }), [data, search, statusFilter, cityFilter]);

  function toggleBlock(c) {
    const newActive = c.status !== 'Active';
    updateCustomerStatus(c.id, newActive);
    if (selected?.id === c.id) setSelected(s => ({ ...s, status: newActive ? 'Active' : 'Blocked' }));
  }

  function deleteCustomer(c) {
    if (!window.confirm(`Block ${c.name}? This will disable their account.`)) return;
    updateCustomerStatus(c.id, false);
    if (selected?.id === c.id) setSelected(null);
  }

  const columns = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: (v, row) => (
        <div>
          <p className={styles.cellMain}>{v}</p>
          <p className={styles.cellSub}>{row.phone}</p>
        </div>
      ),
    },
    { key: 'city', label: 'City', sortable: true, render: v => <span className={styles.cellMuted}>{v}</span> },
    { key: 'totalRides', label: 'Rides', sortable: true, render: v => <span className={styles.cellBold}>{v}</span> },
    {
      key: 'totalSpent', label: 'Total Spent', sortable: true,
      render: v => <span className={styles.cellMoney}>₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'joined', label: 'Joined', sortable: true, render: v => <span className={styles.cellDate}>{fmt(v)}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <div className={styles.rowActions}>
          <ActionBtn icon={Eye} title="View Profile" color="yellow" onClick={() => setSelected(row)} />
          <ActionBtn
            icon={row.status === 'Blocked' ? CheckCircle : Ban}
            title={row.status === 'Blocked' ? 'Unblock' : 'Block'}
            color={row.status === 'Blocked' ? 'green' : 'red'}
            onClick={() => toggleBlock(row)}
          />
          <ActionBtn icon={Trash2} title="Delete" color="red" onClick={() => deleteCustomer(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className={styles.searchInput}
          />
        </div>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={['All', 'Active', 'Blocked']} />
        <FilterSelect value={cityFilter} onChange={setCityFilter} options={cities} />
        <span className={styles.count}>{filtered.length} of {data.length}</span>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={8} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width="max-w-xl">
        {selected && <CustomerDetail customer={selected} onBlock={() => toggleBlock(selected)} />}
      </Modal>
    </div>
  );
}

function ActionBtn({ icon: Icon, title, color, onClick }) {
  const cls = {
    yellow: styles.actionYellow,
    red: styles.actionRed,
    green: styles.actionGreen,
  }[color];
  return (
    <button onClick={onClick} title={title} className={`${styles.actionBtn} ${cls}`}>
      <Icon size={14} />
    </button>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      className={styles.select}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function CustomerDetail({ customer: c, onBlock }) {
  const stats = [
    { label: 'Total Rides', value: c.totalRides },
    { label: 'Total Spent', value: `₹${c.totalSpent.toLocaleString('en-IN')}` },
    { label: 'Wallet', value: `₹${c.wallet}` },
  ];

  const recentRides = [
    { from: 'Andheri West', to: 'Bandra', fare: 120, date: 'Jan 15', status: 'Completed' },
    { from: 'Powai', to: 'Thane', fare: 155, date: 'Jan 10', status: 'Completed' },
    { from: 'Kurla', to: 'Andheri', fare: 90, date: 'Jan 13', status: 'Cancelled' },
  ];

  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div className={styles.detailAvatar}>
          <span className={styles.detailAvatarText}>{c.name[0]}</span>
        </div>
        <div className={styles.detailId}>
          <p className={styles.detailName}>{c.name}</p>
          <p className={styles.detailLine}>{c.email}</p>
          <p className={styles.detailLine}>{c.phone}</p>
        </div>
        <StatusBadge status={c.status} />
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
          { label: 'City', value: c.city },
          { label: 'Referral Code', value: c.referralCode },
          { label: 'Customer ID', value: c.id },
          { label: 'Member Since', value: new Date(c.joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label}>
            <p className={styles.infoLabel}>{item.label}</p>
            <p className={styles.infoValue}>{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h4 className={styles.sectionTitle}>RECENT RIDES</h4>
        <div className={styles.rideList}>
          {recentRides.map((r, i) => (
            <div key={i} className={styles.rideRow}>
              <div>
                <p className={styles.rideRoute}>{r.from} → {r.to}</p>
                <p className={styles.rideDate}>{r.date}</p>
              </div>
              <div className={styles.rideRight}>
                <span className={styles.rideFare}>₹{r.fare}</span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onBlock}
        className={`${styles.blockBtn} ${c.status === 'Blocked' ? styles.blockBtnSafe : styles.blockBtnDanger}`}
      >
        {c.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
      </button>
    </div>
  );
}
