import styles from './StatusBadge.module.css';

const STATUS_CLASS = {
  Active: styles.green,
  Blocked: styles.red,
  Online: styles.green,
  Offline: styles.muted,
  Completed: styles.green,
  Cancelled: styles.red,
  Ongoing: styles.blue,
  Open: styles.yellow,
  Resolved: styles.green,
  Escalated: styles.red,
  Paid: styles.green,
  Pending: styles.yellow,
  Requested: styles.gray,
};

export default function StatusBadge({ status }) {
  const variant = STATUS_CLASS[status] ?? styles.gray;
  return (
    <span className={`${styles.pill} ${variant}`}>
      <span className={styles.dot} />
      {status}
    </span>
  );
}
