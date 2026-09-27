import { useState, useMemo } from 'react';
import { Search, Eye, Flag } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdmin } from '../context/AdminContext';
import styles from './Rides.module.css';

function fmt(dt) {
  return new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const TIMELINE = [
  { step: 'Booked', desc: 'Customer placed ride request' },
  { step: 'Assigned', desc: 'Rider accepted the request' },
  { step: 'Started', desc: 'Rider reached pickup & started ride' },
  { step: 'Completed', desc: 'Ride completed & fare collected' },
];

export default function Rides() {
  const { rides: rawRides } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const rides = useMemo(() => rawRides.map(r => ({
    id: r._id || r.id,
    customer: r.customer || (r.boked_by ? `${r.boked_by.first_name || ''} ${r.boked_by.last_name || ''}`.trim() : 'Unknown'),
    rider: r.rider || (r.captain ? `${r.captain.first_name || ''} ${r.captain.last_name || ''}`.trim() : 'Unassigned'),
    pickup: r.pickup || r.pickup_location || '—',
    drop: r.drop || r.drop_location || '—',
    fare: r.fare || 0,
    status: r.status || 'Requested',
    vehicle: r.vehicle || r.vehicle_type || 'Bike',
    date: r.date || r.createdAt || new Date().toISOString(),
    duration: r.duration || r.trip_duration || '—',
    distance: r.distance || r.trip_distance || '—',
    platformFee: r.platformFee || Math.round((r.fare || 0) * 0.1),
    riderEarning: r.riderEarning || Math.round((r.fare || 0) * 0.9),
  })), [rawRides]);

  const filtered = useMemo(() => rides.filter(r => {
    const q = search.toLowerCase();
    const idStr = String(r.id || '');
    return (
      (idStr.toLowerCase().includes(q) || (r.customer || '').toLowerCase().includes(q) || (r.rider || '').toLowerCase().includes(q)) &&
      (statusFilter === 'All' || r.status === statusFilter) &&
      (vehicleFilter === 'All' || r.vehicle === vehicleFilter)
    );
  }), [rides, search, statusFilter, vehicleFilter]);

  const columns = [
    { key: 'id', label: 'Ride ID', render: v => <span className={styles.cellId}>{v}</span> },
    {
      key: 'customer', label: 'Customer', sortable: true,
      render: v => <span className={styles.cellStrong}>{v}</span>,
    },
    { key: 'rider', label: 'Rider', sortable: true, render: v => <span className={styles.cellMuted}>{v}</span> },
    {
      key: 'pickup', label: 'Route',
      render: (v, row) => (
        <div className={styles.routeCell}>
          <p className={styles.routeFrom}>{v}</p>
          <p className={styles.routeTo}>→ {row.drop}</p>
        </div>
      ),
    },
    {
      key: 'fare', label: 'Fare', sortable: true,
      render: v => <span className={styles.cellMoney}>₹{v}</span>,
    },
    { key: 'vehicle', label: 'Type', sortable: true, render: v => <span className={styles.cellMutedSm}>{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'date', label: 'Date', sortable: true, render: v => <span className={styles.cellDate}>{fmt(v)}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => (
        <button
          onClick={() => setSelected(row)}
          className={styles.viewBtn}
          title="View Details"
        >
          <Eye size={14} />
        </button>
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
            placeholder="Search ride ID, customer, rider…"
            className={styles.searchInput}
          />
        </div>
        <Sel value={statusFilter} onChange={setStatusFilter} options={['All', 'Completed', 'Ongoing', 'Cancelled']} />
        <Sel value={vehicleFilter} onChange={setVehicleFilter} options={['All', 'Bike', 'Auto', 'Cab']} />
        <span className={styles.count}>{filtered.length} rides</span>
      </div>

      {/* Summary pills */}
      <div className={styles.pills}>
        {[
          { label: 'Completed', color: styles.pillGreen, count: rides.filter(r => r.status === 'Completed').length },
          { label: 'Ongoing', color: styles.pillBlue, count: rides.filter(r => r.status === 'Ongoing').length },
          { label: 'Cancelled', color: styles.pillRed, count: rides.filter(r => r.status === 'Cancelled').length },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(statusFilter === s.label ? 'All' : s.label)}
            className={`${styles.pillBtn} ${s.color} ${statusFilter === s.label ? styles.pillActive : ''}`}
          >
            {s.count} {s.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Ride ${selected?.id ?? ''}`} width="max-w-xl">
        {selected && <RideDetail ride={selected} />}
      </Modal>
    </div>
  );
}

function Sel({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={styles.select}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RideDetail({ ride: r }) {
  const completedSteps = r.status === 'Completed' ? 4 : r.status === 'Ongoing' ? 3 : 1;

  return (
    <div className={styles.detail}>
      {/* Header */}
      <div className={styles.detailTop}>
        <div>
          <p className={styles.detailId}>{r.id}</p>
          <p className={styles.detailDate}>{fmt(r.date)}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {/* Parties */}
      <div className={styles.partyGrid}>
        <div className={styles.partyBox}>
          <p className={styles.partyLabel}>Customer</p>
          <p className={styles.partyValue}>{r.customer}</p>
        </div>
        <div className={styles.partyBox}>
          <p className={styles.partyLabel}>Rider</p>
          <p className={styles.partyValue}>{r.rider}</p>
        </div>
      </div>

      {/* Route */}
      <div className={styles.routeBox}>
        <div className={styles.routeRow}>
          <div className={styles.routeDots}>
            <div className={styles.dotStart} />
            <div className={styles.dotLine} />
            <div className={styles.dotEnd} />
          </div>
          <div className={styles.routePoints}>
            <div>
              <p className={styles.partyLabel}>Pickup</p>
              <p className={styles.partyValue} style={{ fontWeight: 400, fontSize: '0.875rem' }}>{r.pickup}</p>
            </div>
            <div>
              <p className={styles.partyLabel}>Drop</p>
              <p className={styles.partyValue} style={{ fontWeight: 400, fontSize: '0.875rem' }}>{r.drop}</p>
            </div>
          </div>
        </div>
        <div className={styles.routeMeta}>
          <span>{r.distance}</span>
          <span>{r.duration}</span>
          <span>{r.vehicle}</span>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className={styles.sectionTitle}>TIMELINE</h4>
        <div className={styles.timeline}>
          {TIMELINE.map((step, i) => {
            const done = i < completedSteps;
            return (
              <div key={step.step} className={styles.timelineRow}>
                <div className={styles.timelineRail}>
                  <div className={`${styles.timelineDot} ${done ? styles.timelineDotDone : ''}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && <div className={`${styles.timelineLine} ${done ? styles.timelineLineDone : ''}`} />}
                </div>
                <div className={styles.timelineBody}>
                  <p className={`${styles.timelineStep} ${done ? styles.timelineStepDone : styles.timelineStepTodo}`}>{step.step}</p>
                  <p className={`${styles.timelineDesc} ${done ? styles.timelineDescDone : styles.timelineDescTodo}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fare Breakdown */}
      <div>
        <h4 className={`${styles.sectionTitle} ${styles.sectionTitleSm}`}>FARE BREAKDOWN</h4>
        <div className={styles.fareBox}>
          {[
            { label: 'Total Fare', value: `₹${r.fare}` },
            { label: 'Platform Commission (10%)', value: `₹${r.platformFee}` },
            { label: 'Rider Earning', value: `₹${r.riderEarning}`, highlight: true },
          ].map(item => (
            <div key={item.label} className={`${styles.fareRow} ${item.highlight ? styles.fareRowHi : ''}`}>
              <span className={styles.fareLabel}>{item.label}</span>
              <span className={item.highlight ? styles.fareValueHi : styles.fareValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <button className={styles.flagBtn}>
        <Flag size={14} /> Flag as Dispute
      </button>
    </div>
  );
}
