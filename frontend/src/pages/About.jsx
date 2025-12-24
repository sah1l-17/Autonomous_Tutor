import './About.css';

function About() {
  return (
    <div className="about">
      <section className="about-hero">
        <div className="container">
          <div className="eyebrow">About</div>
          <h1 className="about-title">Built to make learning feel straightforward</h1>
          <p className="about-subtitle">
            Autonomous Tutor combines structured content ingestion with adaptive tutoring and practice loops.
          </p>
          <div className="about-actions">
            <a className="btn btn-primary" href="#mission">Our mission</a>
            <a className="btn btn-secondary" href="#how">How it works</a>
          </div>
        </div>
      </section>

      <section id="mission" className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Mission</div>
            <h2 className="section-title">Turn content into understanding</h2>
            <p className="section-subtitle">
              The goal is not just answers — it’s repeatable learning with feedback, practice, and progress.
            </p>
          </div>

          <div className="grid">
            <div className="card">
              <h3 className="card-title">Clarity first</h3>
              <p className="card-desc">Break complex topics into steps and focus on what matters next.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Adaptive help</h3>
              <p className="card-desc">Explanations adjust based on your responses and confusion points.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Practice loops</h3>
              <p className="card-desc">Recall-first exercises reinforce learning and reveal gaps quickly.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section section-muted">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">How it works</div>
            <h2 className="section-title">A simple workflow</h2>
            <p className="section-subtitle">Upload → learn → practice, repeat.</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div>
                <div className="step-title">Ingest</div>
                <div className="step-desc">Bring your materials into a structured learning outline.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div>
                <div className="step-title">Tutor</div>
                <div className="step-desc">Ask questions and get guided explanations that adapt.</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div>
                <div className="step-title">Practice</div>
                <div className="step-desc">Use active recall to reinforce knowledge and track progress.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
