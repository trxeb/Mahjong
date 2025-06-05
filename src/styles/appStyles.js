// src/styles/appStyles.js

// This file contains a JavaScript object representation of the provided CSS.
// Note: Pseudo-classes (:hover), pseudo-elements (::after), and @keyframes
// cannot be directly applied via React's inline styles.
// For full functionality of these, you would typically use:
// 1. A traditional .css file imported into your components.
// 2. A CSS-in-JS library (e.g., Styled Components, Emotion).
// 3. A utility-first CSS framework (e.g., Tailwind CSS).

const appStyles = {
    // Global Styles
    htmlBody: {
        fontFamily: "'Arial', sans-serif",
        background: "linear-gradient(135deg, #f3ead8 0%, #e8ddc7 100%)",
        color: "#2c3e2d",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box", // Apply to all elements implicitly
    },
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#f3ead8",
        minHeight: "100vh",
        boxShadow: "0 0 40px rgba(109, 122, 113, 0.2)",
    },
    header: {
        background: "linear-gradient(135deg, #6d7a71 0%, #5a6660 100%)",
        padding: "15px 30px",
        color: "#f3ead8",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(109, 122, 113, 0.2)",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    logoTiles: {
        display: "flex",
        gap: "3px",
    },
    miniTile: {
        width: "24px",
        height: "30px",
        background: "#f3ead8",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#6d7a71",
        border: "1px solid #6d7a71",
    },
    logoText: {
        fontSize: "24px",
        fontWeight: "bold",
    },
    taskbar: {
        background: "linear-gradient(135deg, #6d7a71 0%, #5a6660 100%)",
        padding: 0,
        display: "flex",
        justifyContent: "center",
        boxShadow: "0 2px 10px rgba(109, 122, 113, 0.2)",
    },
    taskbarItem: {
        display: "flex",
        alignItems: "center",
        color: "#f3ead8",
        textDecoration: "none",
        padding: "15px 30px",
        transition: "all 0.3s ease",
        fontSize: "16px",
        fontWeight: "500",
        position: "relative",
    },
    // taskbarItemHover: { // Cannot be directly applied inline
    //     background: "rgba(243, 234, 216, 0.1)",
    // },
    // taskbarItemHoverAfter: { // Cannot be directly applied inline
    //     content: "''",
    //     position: "absolute",
    //     bottom: 0,
    //     left: 0,
    //     right: 0,
    //     height: "3px",
    //     background: "#f3ead8",
    //     animation: "slideIn 0.3s ease", // @keyframes also not inline
    // },
    taskbarItemActive: {
        background: "rgba(243, 234, 216, 0.2)",
    },
    // taskbarItemActiveAfter: { // Cannot be directly applied inline
    //     content: "''",
    //     position: "absolute",
    //     bottom: 0,
    //     left: 0,
    //     right: 0,
    //     height: "3px",
    //     background: "#f3ead8",
    // },
    // @keyframes slideIn { // Cannot be directly applied inline
    //     from { transform: "scaleX(0)"; }
    //     to { transform: "scaleX(1)"; }
    // },
    screen: {
        display: "none",
        padding: "40px",
        minHeight: "80vh",
    },
    screenActive: {
        display: "block",
    },
    btn: {
        background: "linear-gradient(135deg, #6d7a71 0%, #5a6660 100%)",
        color: "#f3ead8",
        border: "none",
        padding: "15px 30px",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 15px rgba(109, 122, 113, 0.3)",
        margin: "10px 5px",
    },
    // btnHover: { // Cannot be directly applied inline
    //     transform: "translateY(-2px)",
    //     boxShadow: "0 6px 20px rgba(109, 122, 113, 0.4)",
    // },
    btnDisabled: {
        opacity: 0.5,
        cursor: "not-allowed",
        transform: "none",
    },
    btnSecondary: {
        background: "transparent",
        border: "2px solid #6d7a71",
        color: "#6d7a71",
    },
    btnLarge: {
        padding: "20px 40px",
        fontSize: "18px",
        width: "300px",
        margin: "20px auto",
        display: "block",
    },
    inputGroup: {
        margin: "20px 0",
        maxWidth: "400px",
    },
    inputGroupLabel: {
        display: "block",
        marginBottom: "8px",
        fontWeight: "bold",
        color: "#6d7a71",
        fontSize: "16px",
    },
    inputGroupInput: {
        width: "100%",
        padding: "15px 20px",
        border: "2px solid #6d7a71",
        borderRadius: "8px",
        background: "rgba(243, 234, 216, 0.8)",
        fontSize: "16px",
        color: "#2c3e2d",
    },
    // inputGroupInputFocus: { // Cannot be directly applied inline
    //     outline: "none",
    //     borderColor: "#5a6660",
    //     boxShadow: "0 0 0 3px rgba(109, 122, 113, 0.1)",
    // },
    card: {
        background: "rgba(255, 255, 255, 0.6)",
        borderRadius: "15px",
        padding: "30px",
        margin: "30px 0",
        boxShadow: "0 4px 15px rgba(109, 122, 113, 0.1)",
        border: "1px solid rgba(109, 122, 113, 0.2)",
        maxWidth: "800px",
    },
    welcomeSection: {
        textAlign: "center",
        margin: "60px 0",
    },
    welcomeTitle: {
        fontSize: "36px",
        fontWeight: "bold",
        color: "#6d7a71",
        margin: "30px 0",
    },
    welcomeSubtitle: {
        fontSize: "18px",
        color: "#6d7a71",
        opacity: 0.8,
        marginBottom: "40px",
    },
    mahjongDecoration: {
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        margin: "30px 0",
    },
    decorationTile: {
        width: "50px",
        height: "60px",
        background: "#f3ead8",
        border: "2px solid #6d7a71",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#6d7a71",
        transform: "rotate(-5deg)",
    },
    // decorationTileNthChild2: { transform: "rotate(3deg)", }, // Cannot be directly applied inline
    // decorationTileNthChild3: { transform: "rotate(-2deg)", }, // Cannot be directly applied inline
    roomSection: {
        display: "flex",
        gap: "40px",
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
    },
    roomCodeDisplay: { // Renamed from room-code to avoid conflict
        fontSize: "32px",
        fontWeight: "bold",
        textAlign: "center",
        background: "linear-gradient(135deg, #6d7a71 0%, #5a6660 100%)",
        color: "#f3ead8",
        padding: "30px",
        borderRadius: "15px",
        margin: "30px 0",
        letterSpacing: "4px",
        maxWidth: "400px",
    },
    playerList: {
        background: "rgba(255, 255, 255, 0.4)",
        borderRadius: "10px",
        padding: "20px",
        margin: "20px 0",
    },
    playerItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 0",
        borderBottom: "1px solid rgba(109, 122, 113, 0.2)",
        fontSize: "16px",
    },
    // playerItemLastChild: { borderBottom: "none", }, // Cannot be directly applied inline
    scoreItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.4)",
        borderRadius: "10px",
        margin: "15px 0",
        borderLeft: "4px solid #6d7a71",
        fontSize: "16px",
    },
    scoreItemWinner: {
        background: "linear-gradient(135deg, #6d7a71 0%, #5a6660 100%)",
        color: "#f3ead8",
        borderLeft: "4px solid #f3ead8",
    },
    modal: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "none", // Controlled by React state
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modalActive: {
        display: "flex",
    },
    modalContent: {
        background: "#f3ead8",
        borderRadius: "20px",
        padding: "40px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
    },
    modalHeader: {
        textAlign: "center",
        marginBottom: "30px",
        color: "#6d7a71",
        fontSize: "24px",
        fontWeight: "bold",
    },
    tileSelector: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
        gap: "15px",
        margin: "20px 0",
    },
    tile: {
        aspectRatio: "3/4",
        background: "#f3ead8",
        border: "2px solid #6d7a71",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "16px",
        color: "#6d7a71",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    // tileHover: { // Cannot be directly applied inline
    //     transform: "scale(1.05)",
    //     boxShadow: "0 4px 15px rgba(109, 122, 113, 0.3)",
    // },
    tileSelected: {
        background: "#6d7a71",
        color: "#f3ead8",
    },
    checkboxContainer: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        margin: "20px 0",
    },
    checkboxInput: {
        width: "20px",
        height: "20px",
        accentColor: "#6d7a71",
    },
    wheelSelector: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        margin: "30px 0",
    },
    wheelBtn: {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "#6d7a71",
        color: "#f3ead8",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    wheelValue: {
        fontSize: "36px",
        fontWeight: "bold",
        color: "#6d7a71",
        minWidth: "100px",
        textAlign: "center",
    },
    errorMessage: {
        background: "#e74c3c",
        color: "white",
        padding: "15px 20px",
        borderRadius: "8px",
        margin: "15px 0",
        textAlign: "center",
        fontSize: "16px",
    },
    dropdownContainer: {
        display: "flex",
        gap: "15px",
        margin: "20px 0",
        flexWrap: "wrap",
    },
    dropdownSelect: {
        flex: 1,
        minWidth: "200px",
    },
    centerContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
    // Media Queries - These cannot be directly applied via inline styles.
    // For responsive design, you would typically use:
    // 1. A dedicated CSS file with @media rules imported into your project.
    // 2. A CSS-in-JS library that supports media queries (e.g., styled-components, Emotion).
    // 3. JavaScript-based responsive logic (e.g., using window.innerWidth and useEffect).
    // @media (max-width: 768px) {
    //     .container { margin: 0; boxShadow: "none"; }
    //     .header { padding: "15px 20px"; }
    //     .logo-text { fontSize: "20px"; }
    //     .taskbar-item { padding: "12px 20px"; fontSize: "14px"; }
    //     .screen { padding: "20px"; }
    //     .welcome-title { fontSize: "28px"; }
    //     .room-section { flexDirection: "column"; alignItems: "center"; }
    //     .btn-large { width: "100%"; maxWidth: "300px"; }
    // }
};

export default appStyles;
