// client/src/components/SideBar.js
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Nav, NavItem, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUserCircle,
  faChessKing,
  faClipboardList,
  faTrophy,
  faSignOutAlt,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';

const SideBar = () => {
  const lastRoomCode = localStorage.getItem('lastRoomCode');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out from SideBar:', error);
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: faHome, exact: true },
    { to: '/profile', label: 'Profile', icon: faUserCircle },
    { to: '/settings', label: 'Settings', icon: faCog },
    { to: lastRoomCode ? `/gamemaster/${lastRoomCode}` : '#', label: 'GM Page', icon: faChessKing, disabled: !lastRoomCode },
    { to: lastRoomCode ? `/records/${lastRoomCode}` : '#', label: 'Records', icon: faClipboardList, disabled: !lastRoomCode },
    { to: lastRoomCode ? `/score/${lastRoomCode}`: '#', label: 'Score', icon: faTrophy, disabled: !lastRoomCode }
  ];

  const activeLinkStyle = {
    backgroundColor: '#173680',
    color: '#ffffff',
    fontWeight: 'bold',
  };

  return (
    <div
      className="sidebar"
      style={{
        width: '200px',
        backgroundColor: '#4A5C52',
        color: '#f0f0f0',
        minHeight: '100vh',
        paddingTop: '20px',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '2px 0 5px rgba(0,0,0,0.2)'
      }}
    >
      <Nav vertical className="w-100">
        {navItems.map(({ to, label, icon, exact, disabled }) => (
          <NavItem className="mb-2" key={label}>
            <RouterNavLink
              to={disabled ? '#' : to}
              end={exact}
              className={`nav-link d-flex align-items-center rounded py-2 px-3 ${disabled ? 'disabled' : ''}`}
              style={({ isActive }) => ({
                color: '#f0f0f0',
                textDecoration: 'none',
                transition: 'background-color 0.3s',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                ...(isActive && !disabled ? activeLinkStyle : {})
              })}
              onClick={(e) => disabled && e.preventDefault()}
            >
              <FontAwesomeIcon icon={icon} size="lg" className="me-3" />
              {label}
            </RouterNavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="mt-auto px-3 pb-3">
        <Button
          color="danger"
          onClick={handleLogout}
          className="w-100 rounded-pill"
          style={{ backgroundColor: '#A94442', borderColor: '#A94442' }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
