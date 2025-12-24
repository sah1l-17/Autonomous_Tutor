import { motion } from 'framer-motion';
import './Home.css';

function Home() {
  const features = [
    {
      title: 'Multimodal ingestion',
      description: 'Bring PDFs, text, and images into one structured learning space — ready for tutoring and practice.',
    },
    {
      title: 'Adaptive tutoring',
      description: 'Explanations adjust to your level, detect confusion, and guide you to the next best step.',
    },
    {
      title: 'Practice games',
      description: 'Active recall, spaced repetition, and interactive exercises to turn knowledge into mastery.',
    },
    {
      title: 'Insights & progress',
      description: 'See what you understand, what needs review, and where you improve over time.',
    },
  ];

  const steps = [
    {
      title: 'Upload',
      description: 'Add your material — PDFs, text, or images — and we turn it into a learnable structure.',
    },
    {
      title: 'Learn',
      description: 'Ask questions, get guided explanations, and build understanding with adaptive tutoring.',
    },
    {
      title: 'Practice',
      description: 'Use games and exercises to reinforce concepts and track your progress.',
    },
  ];

  const faqs = [
    {
      question: 'What can I upload?',
      answer: 'PDFs, text documents, and images. The app helps organize content for structured learning.',
    },
    {
      question: 'Does it adapt to my level?',
      answer: 'Yes. The tutoring flow is designed to adjust explanations and prompts based on your responses.',
    },
    {
      question: 'How do practice games help?',
      answer: 'They use active recall to strengthen memory and surface gaps so you can improve faster.',
    },
    {
      question: 'How is progress tracked?',
      answer: 'You’ll get learning insights over time to understand strengths and areas to revisit.',
    },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="badge">AI learning • Adaptive tutoring</div>
            <h1 className="hero-title">
              Learn faster with an <span className="accent">Autonomous Tutor</span>
            </h1>
            <p className="hero-subtitle">
              Upload learning material, get guided explanations, and practice with interactive games — all in one place.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" type="button">Get Started</button>
              <a className="btn btn-secondary" href="#features">Learn more</a>
            </div>

            <div className="hero-meta">
              <div className="meta-item">
                <div className="meta-title">Multimodal</div>
                <div className="meta-desc">PDFs, text, images</div>
              </div>
              <div className="meta-item">
                <div className="meta-title">Adaptive</div>
                <div className="meta-desc">Explains what you need</div>
              </div>
              <div className="meta-item">
                <div className="meta-title">Practice</div>
                <div className="meta-desc">Active recall games</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-media"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="hero-card">
              <img className="hero-image" src="/image0.png" alt="Learning" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Features</div>
            <h2 className="section-title">Everything you need to learn effectively</h2>
            <p className="section-subtitle">A clean workflow that goes from material → understanding → practice.</p>
          </div>

          <div className="feature-grid">
            {features.map((f, idx) => (
              <div key={f.title} className="feature">
                <div className="feature-icon" aria-hidden="true">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container content-grid">
          <div className="content-copy">
            <div className="eyebrow">Designed for clarity</div>
            <h2 className="section-title">Build understanding, not just answers</h2>
            <p className="section-subtitle">
              Explanations are structured, step-by-step, and focused on what you actually need to progress.
            </p>
            <ul className="checklist">
              <li>Break down concepts into smaller steps</li>
              <li>Spot confusion points early</li>
              <li>Practice with recall-first activities</li>
            </ul>
          </div>

          <div className="content-media">
            <div className="content-card">
              <img className="content-image" src="/image1.png" alt="Product preview" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Steps</div>
            <h2 className="section-title">From upload to mastery</h2>
            <p className="section-subtitle">A simple loop you can repeat for any topic.</p>
          </div>

          <div className="steps">
            {steps.map((s, idx) => (
              <div key={s.title} className="step">
                <div className="step-num">{String(idx + 1).padStart(2, '0')}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">FAQs</div>
            <h2 className="section-title">Quick answers</h2>
            <p className="section-subtitle">Everything you need to know before you start.</p>
          </div>

          <div className="quick-cards" aria-label="Quick answers">
            {faqs.map((faq) => (
              <div key={faq.question} className="flip-card" tabIndex={0}>
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <p className="flip-title">{faq.question}</p>
                    <p className="flip-hint">Hover or focus to flip</p>
                  </div>
                  <div className="flip-card-back">
                    <p className="flip-title">Answer</p>
                    <p className="flip-text">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

