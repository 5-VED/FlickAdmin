import { Bell, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import styles from './TopBar.module.css';

export default function TopBar({ title }) {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user ? `${user.first_name?.[0] || 'A'}${user.last_name?.[0] || ''}` : 'A';
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin' : 'Admin';

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={19} />
          <span className={styles.badge}>
            3
          </span>
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>{initials.toUpperCase()}</span>
          </div>
          <div className={styles.userMeta}>
            <p className={styles.userName}>{displayName}</p>
            <p className={styles.userRole}>{user?.role?.role || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
