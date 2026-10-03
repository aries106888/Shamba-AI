import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIChat from './AIChat';
import {
  LayoutDashboard, CloudSun, ShoppingCart, Truck,
  ClipboardList, Bell, LogOut, Users, Settings, Leaf, Map
} from 'lucide-react';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="app-nav">
      <NavLink to="/" className="nav-logo">
        <Leaf size={24} color="#A8D65C" />
        <div>
          <div className="nav-logo-name">ShambaPoint</div>
          <div className="nav-logo-tag">Climate</div>
        </div>
      </NavLink>

      <ul className="nav-links">
        <li><NavLink to="/forecasts">Forecasts</NavLink></li>
        <li><NavLink to="/marketplace">Marketplace</NavLink></li>
        {user?.role === 'farmer' && <li><NavLink to="/farmer/dashboard">My Farm</NavLink></li>}
        {user?.role === 'buyer'  && <li><NavLink to="/buyer/dashboard">My Orders</NavLink></li>}
        {user?.role === 'admin'  && <li><NavLink to="/admin">Admin</NavLink></li>}
      </ul>

      <div className="nav-actions">
        {user ? (
          <>
            <div className="nav-user-pill">
              <Leaf size={12} />
              {user.phone} · <strong>{user.role}</strong>
            </div>
            <button className="btn-secondary" style={{padding:'0.4rem 1rem', fontSize:'0.82rem'}} onClick={handleLogout}>
              <LogOut size={14}/> Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn-secondary" style={{padding:'0.5rem 1rem'}}>Sign in</NavLink>
            <NavLink to="/register" className="btn-primary">Get Started</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const farmerLinks = [
    { to: '/farmer/dashboard', icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
    { to: '/farmer/yields',    icon: <ClipboardList size={16}/>,   label: 'Yield Registry' },
    { to: '/farmer/alerts',    icon: <Bell size={16}/>,            label: 'Alerts' },
    { to: '/farm-map',         icon: <Map size={16}/>,             label: '🛰️ Farm Map' },
    { to: '/forecasts',        icon: <CloudSun size={16}/>,        label: 'Forecasts' },
    { to: '/marketplace',      icon: <ShoppingCart size={16}/>,    label: 'Marketplace' },
  ];
  const buyerLinks = [
    { to: '/buyer/dashboard',  icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
    { to: '/marketplace',      icon: <ShoppingCart size={16}/>,    label: 'Browse Produce' },
    { to: '/buyer/logistics',  icon: <Truck size={16}/>,           label: 'Logistics' },
    { to: '/farm-map',         icon: <Map size={16}/>,             label: '🛰️ Farm Map' },
    { to: '/forecasts',        icon: <CloudSun size={16}/>,        label: 'County Forecasts' },
  ];
  const adminLinks = [
    { to: '/admin',            icon: <Settings size={16}/>,        label: 'Admin Overview' },
    { to: '/marketplace',      icon: <ShoppingCart size={16}/>,    label: 'Marketplace' },
    { to: '/forecasts',        icon: <CloudSun size={16}/>,        label: 'Forecasts' },
  ];

  const links = user.role === 'farmer' ? farmerLinks : user.role === 'buyer' ? buyerLinks : adminLinks;

  return (
    <aside className="sidebar">
      <div className="section-label">{user.role === 'farmer' ? 'Farm Tools' : user.role === 'buyer' ? 'Buyer Tools' : 'Admin'}</div>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          {l.icon} {l.label}
        </NavLink>
      ))}
    </aside>
  );
}

export default function Layout({ children }) {
  const { user } = useAuth();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div className="app-layout">
        {user && <Sidebar />}
        <main className="page-content">{children}</main>
      </div>
      <AIChat county={user?.county} crop={user?.crop} />
    </div>
  );
}
