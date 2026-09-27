import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

export default function StatCard({ icon: Icon, label, value, delta, deltaType = 'up' }) {
  const positive = deltaType === 'up';

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.iconWrap}>
          <Icon size={19} />
        </div>
        {delta && (
          <span className={`${styles.delta} ${positive ? styles.deltaUp : styles.deltaDown}`}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
