import { motion } from 'framer-motion';
import './Navbar.css';

function Navbar({ currentPage, onNavigate }) {
  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        <motion.div 
          className="navbar-brand" 
          onClick={() => onNavigate('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="brand-text">Autonomous Tutor</span>
        </motion.div>

        <div className="navbar-links">
          <motion.button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
            whileTap={{ scale: 0.98 }}
          >
            Home
          </motion.button>
          <motion.button
            className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
            onClick={() => onNavigate('about')}
            whileTap={{ scale: 0.98 }}
          >
            About
          </motion.button>
        </div>

        <div className="navbar-cta">
          <motion.button
            className="nav-link"
            onClick={() => onNavigate('home')}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
