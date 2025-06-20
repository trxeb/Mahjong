// client/src/components/SideBar.js
import React from 'react';
import { Nav, NavItem, NavLink, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUserCircle,
  faChessKing,
  faClipboardList,
  faTrophy,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';

export default function SideBar({ onNavigate, currentPage }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully from SideBar');
    } catch (error) {
      console.error('Error logging out from SideBar:', error);
    }
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: faHome },
    { key: 'profile', label: 'Profile', icon: faUserCircle },
    { key: 'gmPage', label: 'GM Page', icon: faChessKing },
    { key: 'records', label: 'Records', icon: faClipboardList },
    { key: 'score', label: 'Score', icon: faTrophy }
  ];

  return (
    <div
      style={{
        width: '200px',
        backgroundColor: '#4c5b4e', // Sidebar background
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
        {navItems.map(({ key, label, icon }) => (
          <NavItem className="mb-2" key={key}>
            <NavLink
              href="#"
              onClick={() => onNavigate(key)}
              className="d-flex align-items-center rounded py-2 px-3"
              style={{
                backgroundColor: currentPage === key ? '#173680' : 'transparent',
                color: currentPage === key ? '#ffffff' : '#f0f0f0',
                fontWeight: currentPage === key ? 'bold' : 'normal',
                transition: 'background-color 0.3s'
              }}
            >
              <FontAwesomeIcon icon={icon} size="lg" className="me-3" />
              {label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <div className="mt-auto px-3 pb-3">
        <Button
          color="danger"
          onClick={handleLogout}
          className="w-100 rounded-pill"
          style={{ backgroundColor: '#802017', borderColor: '#802017' }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
