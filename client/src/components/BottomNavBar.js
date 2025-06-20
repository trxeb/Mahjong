// client/src/components/BottomNavBar.js
import React from 'react';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserCircle, faChessKing, faClipboardList, faTrophy } from '@fortawesome/free-solid-svg-icons';

export default function BottomNavBar({ onNavigate, currentPage }) {
    const navLinks = [
        { name: 'Home', icon: faHome, page: 'home' },
        { name: 'Profile', icon: faUserCircle, page: 'profile' },
        { name: 'GM Page', icon: faChessKing, page: 'gmPage' },
        { name: 'Records', icon: faClipboardList, page: 'records' },
        { name: 'Score', icon: faTrophy, page: 'score' },
    ];

    return (
        <Navbar color="light" light fixed="bottom" className="shadow-lg-top px-2">
            <Nav className="w-100 d-flex justify-content-around align-items-center">
                {navLinks.map((link) => (
                    <NavItem key={link.page}>
                        <NavLink
                            href="#"
                            onClick={() => onNavigate(link.page)}
                            className={`d-flex align-items-center gap-2 ${currentPage === link.page ? 'text-primary fw-bold' : 'text-muted'}`}
                            style={{ fontSize: '0.85rem' }}
                        >
                            <FontAwesomeIcon icon={link.icon} />
                            <span>{link.name}</span>
                        </NavLink>
                    </NavItem>
                ))}
            </Nav>
        </Navbar>
    );
}
