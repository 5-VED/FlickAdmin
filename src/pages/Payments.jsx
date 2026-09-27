import { useState } from 'react';
import { IndianRupee, TrendingUp, Users, Download, CheckCircle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { revenueChartData, payouts } from '../data/mockData';
import styles from './Payments.module.css';
// Payments page uses mock chart data for visualization; real API data feeds the payout table via AdminContext

const gross = revenueChartData.reduce((s, d) => s + d.gross, 0);
const commission = revenueChartData.reduce((s, d) => s + d.commission, 0);
const payout = revenueChartData.reduce((s, d) => s + d.payout, 0);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: 0 }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState(payouts);

  const filtered = data.filter(p => statusFilter === 'All' || p.status === statusFilter);

  function markPaid(row) {
    setData(prev => prev.map(p => p.id === row.id ? { ...p, status: 'Paid' } : p));
  }

  const columns = [
    { key: 'rider', label: 'Rider', sortable: true, render: v => <span className={styles.cellStrong}>{v}</span> },
    { key: 'rides', label: 'Rides', sortable: true, render: v => <span className={styles.cellStrong}>{v}</span> },
    {
      key: 'amount', label: 'Amount', sortable: true,
      render: v => <span className={styles.cellMoney}>₹{v.toLocaleString('en-IN')}</span>,
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'period', label: 'Period', render: v => <span className={styles.cellDate}>{v}</span> },
    {
      key: '_actions', label: '',
      render: (_, row) => row.status === 'Pending' ? (
        <button
          onClick={() => markPaid(row)}
          className={styles.payBtn}
        >
          Mark Paid
        </button>
      ) : (
        <span className={styles.paidLabel}>
          <CheckCircle size={12} /> Paid
        </span>
      ),
    },
  ];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <SummaryCard
          icon={IndianRupee} label="Gross Revenue (7 days)"
          value={`₹${gross.toLocaleString('en-IN')}`}
          sub="All rides combined" color="yellow"
        />
        <SummaryCard
          icon={TrendingUp} label="Platform Commission"
          value={`₹${commission.toLocaleString('en-IN')}`}
          sub="10% of gross revenue" color="orange"
        />
        <SummaryCard
          icon={Users} label="Rider Payouts"
          value={`₹${payout.toLocaleString('en-IN')}`}
          sub="Net to riders" color="green"
        />
      </div>

      {/* Bar Chart */}
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>DAILY REVENUE BREAKDOWN</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revenueChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,215,0,0.04)' }} />
            <Legend
              wrapperStyle={{ paddingTop: 12, fontSize: 11, color: '#888' }}
              formatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <Bar dataKey="gross" fill="#FFD700" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="commission" fill="#FF6B35" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="payout" fill="#4ECDC4" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payout Table */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>RIDER PAYOUTS</h2>
          <div className={styles.headActions}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              {['All', 'Paid', 'Pending'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className={styles.exportBtn}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} pageSize={8} />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    yellow: { box: styles.iconYellow, val: styles.valueYellow },
    orange: { box: styles.iconOrange, val: styles.valueOrange },
    green: { box: styles.iconGreen, val: styles.valueGreen },
  }[color];

  return (
    <div className={styles.summaryCard}>
      <div className={`${styles.summaryIcon} ${colorMap.box}`}>
        <Icon size={19} />
      </div>
      <p className={styles.summaryLabel}>{label}</p>
      <p className={`${styles.summaryValue} ${colorMap.val}`}>{value}</p>
      <p className={styles.summarySub}>{sub}</p>
    </div>
  );
}
