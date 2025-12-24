import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Autonomous Tutor</div>
            <p className="footer-tagline">Adaptive learning with structured content, tutoring, and practice.</p>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <div className="footer-heading">Product</div>
              <a className="footer-link" href="#features">Features</a>
              <a className="footer-link" href="#">Security</a>
              <a className="footer-link" href="#">Roadmap</a>
            </div>
            <div className="footer-col">
              <div className="footer-heading">Company</div>
              <a className="footer-link" href="#">About</a>
              <a className="footer-link" href="#">Careers</a>
              <a className="footer-link" href="#">Contact</a>
            </div>
            <div className="footer-col">
              <div className="footer-heading">Resources</div>
              <a className="footer-link" href="#">Docs</a>
              <a className="footer-link" href="#">Support</a>
              <a className="footer-link" href="#">FAQ</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {currentYear} Autonomous Tutor</p>
          <div className="footer-legal">
            <a className="footer-link" href="#privacy">Privacy</a>
            <a className="footer-link" href="#terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
