import { useState } from 'react';
import { Car, Users, UserCheck, IndianRupee, XCircle, Star, Clock, CheckCircle, AlertTriangle, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAdmin } from '../context/AdminContext';
import { ridesChartData, activityFeed } from '../data/mockData';
import styles from './Dashboard.module.css';

const ACTIVITY_ICON = { booked: Car, assigned: UserCheck, completed: CheckCircle, dispute: AlertTriangle, joined: UserPlus };
const ACTIVITY_COLOR = {
  booked: styles.activityBlue,
  assigned: styles.activityYellow,
  completed: styles.activityGreen,
  dispute: styles.activityRed,
  joined: styles.activityPurple,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} rides</p>
    </div>
  );
};

export default function Dashboard() {
  const { stats, riders } = useAdmin();
  const [period, setPeriod] = useState('7d');

  const topRiders = [...riders].sort((a, b) => (b.totalRides || b.total_rides || 0) - (a.totalRides || a.total_rides || 0)).slice(0, 5);

  const kpiCards = stats ? [
    { icon: Car, label: 'Total Rides', value: String(stats.totalRides), delta: `${stats.ongoingRides} live`, deltaType: 'up' },
    { icon: UserCheck, label: 'Total Riders', value: String(stats.totalRiders), delta: 'registered', deltaType: 'up' },
    { icon: Users, label: 'Customers', value: String(stats.totalCustomers), delta: 'registered', deltaType: 'up' },
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, delta: 'completed rides', deltaType: 'up' },
    { icon: XCircle, label: 'Cancelled', value: String(stats.cancelledRides), delta: 'total cancelled', deltaType: 'down' },
    { icon: AlertTriangle, label: 'Open Disputes', value: String(stats.openDisputes), delta: 'need action', deltaType: stats.openDisputes > 0 ? 'down' : 'up' },
  ] : [
    { icon: Car, label: 'Total Rides Today', value: '43', delta: '+12%', deltaType: 'up' },
    { icon: UserCheck, label: 'Active Riders', value: '28', delta: '+3', deltaType: 'up' },
    { icon: Users, label: 'Active Customers', value: '156', delta: '+8%', deltaType: 'up' },
    { icon: IndianRupee, label: 'Revenue Today', value: '₹4,890', delta: '+15%', deltaType: 'up' },
    { icon: XCircle, label: 'Cancelled Rides', value: '6', delta: '-2', deltaType: 'up' },
    { icon: Star, label: 'Avg Rating', value: '4.6', delta: '+0.1', deltaType: 'up' },
  ];

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.kpiGrid}>
        {kpiCards.map((card, i) => (
          <StatCard key={i} icon={card.icon} label={card.label} value={card.value} delta={card.delta} deltaType={card.deltaType} />
        ))}
      </div>

      <div className={styles.row3}>
        <div className={`${styles.panel} ${styles.span2}`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>RIDES OVER TIME</h2>
            <div className={styles.periodToggle}>
              {['7d', '30d'].map(p => (
                <button
                  key={p} onClick={() => setPeriod(p)}
                  className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ridesChartData[period]} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2F2F2F" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} interval={period === '30d' ? 4 : 0} />
              <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="rides" stroke="#FFD700" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFD700', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle} style={{ marginBottom: '1rem' }}>LIVE ACTIVITY</h2>
          <div className={styles.activityList}>
            {activityFeed.map(item => {
              const Icon = ACTIVITY_ICON[item.type] ?? Car;
              const color = ACTIVITY_COLOR[item.type] ?? styles.activityGray;
              return (
                <div key={item.id} className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${color}`}>
                    <Icon size={13} />
                  </div>
                  <div className={styles.activityBody}>
                    <p className={styles.activityMsg}>{item.message}</p>
                    <p className={styles.activityTime}><Clock size={9} />{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.row3}>
        <div className={`${styles.panel} ${styles.span2}`}>
          <div className={styles.panelHead} style={{ marginBottom: '1rem' }}>
            <h2 className={styles.panelTitle}>LIVE RIDES MAP</h2>
            <div className={styles.legend}>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendActive}`} />Active</span>
              <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendDone}`} />Completed</span>
            </div>
          </div>
          <CityMap />
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle} style={{ marginBottom: '1rem' }}>TOP RIDERS</h2>
          <div className={styles.riderList}>
            {topRiders.map((rider, i) => (
              <div key={rider.id || rider._id} className={styles.riderRow}>
                <span className={`${styles.rank} ${
                  i === 0 ? styles.rank1 : i === 1 ? styles.rank2 : i === 2 ? styles.rank3 : styles.rankOther
                }`}>
                  {i + 1}
                </span>
                <div className={styles.riderMeta}>
                  <p className={styles.riderName}>
                    {rider.name || (rider.user_id ? `${rider.user_id.first_name} ${rider.user_id.last_name}` : 'Unknown')}
                  </p>
                  <p className={styles.riderSub}>
                    {rider.totalRides || rider.total_rides || 0} rides · ⭐ {rider.rating || 4.5}
                  </p>
                </div>
                <StatusBadge status={rider.status || (rider.on_duty ? 'Online' : 'Offline')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVE_DOTS = [
  { x: 95, y: 72 }, { x: 195, y: 118 }, { x: 295, y: 65 },
  { x: 72, y: 148 }, { x: 372, y: 94 }, { x: 258, y: 172 },
  { x: 148, y: 212 }, { x: 338, y: 192 }, { x: 430, y: 140 },
];

const COMPLETED_DOTS = [
  { x: 140, y: 95 }, { x: 230, y: 140 }, { x: 310, y: 190 },
  { x: 68, y: 200 }, { x: 400, y: 70 },
];

function CityMap() {
  return (
    <svg viewBox="0 0 480 270" className={styles.map}>
      {[40, 90, 140, 190, 240].map(y => <line key={`h${y}`} x1="0" y1={y} x2="480" y2={y} stroke="#2A2A2A" strokeWidth="10" />)}
      {[60, 120, 180, 240, 300, 360, 420].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="270" stroke="#2A2A2A" strokeWidth="10" />)}
      {[65, 115, 165, 215].map(y => <line key={`hm${y}`} x1="0" y1={y} x2="480" y2={y} stroke="#222" strokeWidth="4" />)}
      {[30, 90, 150, 210, 270, 330, 390, 450].map(x => <line key={`vm${x}`} x1={x} y1="0" x2={x} y2="270" stroke="#222" strokeWidth="4" />)}
      <rect x="40" y="40" width="130" height="90" rx="2" fill="#FFD700" opacity="0.025" />
      <rect x="210" y="40" width="150" height="75" rx="2" fill="#4A9EFF" opacity="0.025" />
      <rect x="75" y="155" width="190" height="80" rx="2" fill="#4ECDC4" opacity="0.025" />
      {COMPLETED_DOTS.map((d, i) => <circle key={`c${i}`} cx={d.x} cy={d.y} r="3.5" fill="#34D399" opacity="0.7" />)}
      {ACTIVE_DOTS.map((d, i) => (
        <g key={`a${i}`}>
          <circle cx={d.x} cy={d.y} r="10" fill="#FFD700" opacity="0">
            <animate attributeName="r" values="5;18;5" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={d.x} cy={d.y} r="4" fill="#FFD700" />
        </g>
      ))}
      <text x="50" y="82" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">ANDHERI</text>
      <text x="225" y="72" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">BANDRA</text>
      <text x="88" y="190" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">DADAR</text>
      <text x="315" y="160" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">KURLA</text>
      <text x="390" y="105" fill="#555" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="1">POWAI</text>
    </svg>
  );
}
