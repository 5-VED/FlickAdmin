import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Car, CreditCard,
  AlertTriangle, Settings, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/riders', icon: UserCheck, label: 'Riders' },
  { to: '/rides', icon: Car, label: 'Rides' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/disputes', icon: AlertTriangle, label: 'Disputes' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={styles.aside}
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className={`${styles.logo} ${collapsed ? styles.logoCenter : ''}`}>
        <div className={styles.logoIcon}>
          <Zap size={17} />
        </div>
        {!collapsed && (
          <span className={styles.logoText}>
            FLICK<span className={styles.logoDot}>.</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `${styles.navLink} ${collapsed ? styles.navLinkCollapsed : styles.navLinkExpanded} ${
                isActive ? styles.navLinkActive : ''
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className={styles.activeBar} />
                )}
                <Icon size={18} className={styles.navIcon} />
                {!collapsed && (
                  <span className={styles.navLabel}>{label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={styles.toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>
    </aside>
  );
}
