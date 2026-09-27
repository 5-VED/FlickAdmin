import { useState, useMemo } from 'react';
import { Search, CheckCircle, RefreshCw, AlertOctagon } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdmin } from '../context/AdminContext';
import styles from './Disputes.module.css';

export default function Disputes() {
  const { disputes: rawDisputes, resolveDispute } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const data = useMemo(() => rawDisputes.map(d => ({
    id: d._id || d.id,
    customer: d.customer || (d.raised_by ? `${d.raised_by.first_name || ''} ${d.raised_by.last_name || ''}`.trim() : 'Unknown'),
    rider: d.rider || (d.against ? `${d.against.first_name || ''} ${d.against.last_name || ''}`.trim() : 'Unknown'),
    rideId: d.rideId || d.ride_id?._id || d.ride_id || '—',
    issue: d.issue || d.issue_type || 'Other',
    status: d.status || 'Open',
    date: d.date || d.createdAt || new Date().toISOString(),
    description: d.description || '',
  })), [rawDisputes]);

  const counts = useMemo(() => ({
    All: data.length,
    Open: data.filter(d => d.status === 'Open').length,
    Resolved: data.filter(d => d.status === 'Resolved').length,
    Escalated: data.filter(d => d.status === 'Escalated').length,
  }), [data]);

  const filtered = useMemo(() => data.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.customer.toLowerCase().includes(q) || d.rider.toLowerCase().includes(q) ||
       d.rideId.toLowerCase().includes(q) || d.issue.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || d.status === statusFilter)
    );
  }), [data, search, statusFilter]);

  function resolve(id) {
    resolveDispute(id, 'Resolved', 'Resolved by admin');
    if (selected?.id === id) setSelected(s => ({ ...s, status: 'Resolved' }));
  }

  function escalate(id) {
    resolveDispute(id, 'Escalated', 'Escalated for review');
    if (selected?.id === id) setSelected(s => ({ ...s, status: 'Escalated' }));
  }

  const columns = [
    { key: 'id', label: 'ID', render: v => <span className={styles.cellId}>{v}</span> },
    { key: 'customer', label: 'Customer', sortable: true, render: v => <span className={styles.cellStrong}>{v}</span> },
    { key: 'rider', label: 'Rider', sortable: true, render: v => <span className={styles.cellMuted}>{v}</span> },
    { key: 'rideId', label: 'Ride ID', render: v => <span className={styles.cellMono}>{v}</span> },
    { key: 'issue', label: 'Issue', sortable: true, render: v => <span className={styles.cellText}>{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'date', label: 'Date', sortable: true, render: v => <span className={styles.cellDate}>{v}</span> },
    {
      key: '_actions', label: 'Actions',
      render: (_, row) => (
        <div className={styles.rowActions}>
          {row.status !== 'Resolved' && (
            <ActionBtn icon={CheckCircle} label="Resolve" color="green" onClick={() => resolve(row.id)} />
          )}
          <ActionBtn icon={RefreshCw} label="Refund" color="yellow" onClick={() => setSelected(row)} />
          {row.status !== 'Escalated' && (
            <ActionBtn icon={AlertOctagon} label="Penalize" color="red" onClick={() => escalate(row.id)} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      {/* Status Tabs */}
      <div className={styles.tabs}>
        {['All', 'Open', 'Escalated', 'Resolved'].map(s => {
          const color = s === 'Open' ? styles.tabYellow : s === 'Resolved' ? styles.tabGreen : s === 'Escalated' ? styles.tabRed : styles.tabWhite;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`${styles.tabBtn} ${active ? `${styles.tabActive} ${color}` : ''}`}
            >
              {s}
              <span className={styles.tabCount}>
                {counts[s]}
              </span>
            </button>
          );
        })}

        <div className={styles.searchPush}>
          <Search size={15} className={styles.searchIcon} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className={styles.searchInput}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={8} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Dispute ${selected?.id ?? ''}`} width="max-w-lg">
        {selected && <DisputeDetail dispute={selected} onResolve={() => resolve(selected.id)} onEscalate={() => escalate(selected.id)} />}
      </Modal>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick }) {
  const cls = {
    green: styles.actionGreen,
    red: styles.actionRed,
    yellow: styles.actionYellow,
  }[color];
  return (
    <button onClick={onClick} title={label} className={`${styles.actionBtn} ${cls}`}>
      <Icon size={14} />
    </button>
  );
}

function DisputeDetail({ dispute: d, onResolve, onEscalate }) {
  return (
    <div className={styles.detail}>
      <div className={styles.detailTop}>
        <div>
          <p className={styles.detailId}>{d.id}</p>
          <p className={styles.detailDate}>{d.date}</p>
        </div>
        <StatusBadge status={d.status} />
      </div>

      <div className={styles.detailBox}>
        {[
          { label: 'Customer', value: d.customer },
          { label: 'Rider', value: d.rider },
          { label: 'Ride ID', value: d.rideId, mono: true },
          { label: 'Issue Type', value: d.issue },
        ].map(item => (
          <div key={item.label} className={styles.detailRow}>
            <span className={styles.detailKey}>{item.label}</span>
            <span className={`${styles.detailVal} ${item.mono ? styles.detailValMono : ''}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <div>
        <p className={styles.descLabel}>Description</p>
        <p className={styles.descBox}>{d.description}</p>
      </div>

      <div className={styles.actionGrid}>
        <button
          onClick={onResolve}
          disabled={d.status === 'Resolved'}
          className={`${styles.gridBtn} ${styles.btnResolve}`}
        >
          <CheckCircle size={14} /> Resolve
        </button>
        <button className={`${styles.gridBtn} ${styles.btnRefund}`}>
          <RefreshCw size={14} /> Refund
        </button>
        <button
          onClick={onEscalate}
          disabled={d.status === 'Escalated'}
          className={`${styles.gridBtn} ${styles.btnPenalize}`}
        >
          <AlertOctagon size={14} /> Penalize
        </button>
      </div>
    </div>
  );
}
