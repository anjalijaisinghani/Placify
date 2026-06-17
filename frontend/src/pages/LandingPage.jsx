import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-body">

      {/* ── Navbar ── */}
      <nav className="l-nav" ref={navRef}>
        <div className="l-nav-inner">
          <Link className="l-brand" to="/" onClick={closeMenu}>
            <img src="/images/Logo.png" alt="Placify" />
            <span className="l-brand-name">Placify</span>
          </Link>

          <div className={`l-nav-links${menuOpen ? ' open' : ''}`}>
            <a className="l-nav-link active" href="#home" onClick={closeMenu}>Home</a>
            <a className="l-nav-link" href="#features" onClick={closeMenu}>Features</a>
            <a className="l-nav-link" href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a className="l-nav-link" href="#about" onClick={closeMenu}>About</a>
          </div>

          <div className={`l-nav-actions${menuOpen ? ' open' : ''}`}>
            <Link className="button ghost" to="/login" onClick={closeMenu}>Login</Link>
            <Link className="button primary" to="/register" onClick={closeMenu}>Sign Up Free</Link>
          </div>

          <button
            className="l-nav-toggle"
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect y="2" width="18" height="2" rx="1" fill="currentColor"/>
              <rect y="8" width="18" height="2" rx="1" fill="currentColor"/>
              <rect y="14" width="18" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className="l-page" id="home">

        {/* ── Hero ── */}
        <section className="l-hero">
          <div className="l-hero-inner">
            <div className="l-hero-text">
              <div className="l-hero-badge">
                <span>New</span> Smart campus placement, simplified
              </div>
              <h1 className="l-hero-title">
                Campus placements<br />made <em>effortless</em>
              </h1>
              <p className="l-hero-desc">
                One secure platform where students discover jobs, recruiters hire top talent, and admins keep everything running smoothly.
              </p>
              <div className="l-hero-actions">
                <Link className="button primary" to="/register">Get Started Free</Link>
                <Link className="button ghost" to="/login">Sign In</Link>
              </div>
              <p className="l-hero-note">No credit card required &bull; Free for students</p>
            </div>

            <div className="l-hero-visual">
              <div className="l-mockup">
                <div className="l-mockup-bar">
                  <span className="l-mockup-dot" />
                  <span className="l-mockup-dot" />
                  <span className="l-mockup-dot" />
                  <span className="l-mockup-title">Placify Dashboard</span>
                </div>
                <div className="l-mockup-body">
                  <div className="l-mockup-stat-row">
                    <div className="l-mockup-stat"><small>Active Roles</small><strong>24</strong></div>
                    <div className="l-mockup-stat"><small>Shortlisted</small><strong>08</strong></div>
                    <div className="l-mockup-stat"><small>Companies</small><strong>12</strong></div>
                  </div>
                  <div className="l-mockup-list">
                    <div className="l-mockup-row">
                      <span className="l-mockup-row-dot green" />
                      <div className="l-mockup-row-text">
                        <span>Software Engineer — Microsoft</span>
                        <small>B.Tech CSE, 2026 batch</small>
                      </div>
                      <span className="l-mockup-row-pill success">Active</span>
                    </div>
                    <div className="l-mockup-row">
                      <span className="l-mockup-row-dot yellow" />
                      <div className="l-mockup-row-text">
                        <span>Data Analyst — Amazon</span>
                        <small>Any branch, 7.0+ CGPA</small>
                      </div>
                      <span className="l-mockup-row-pill warning">In Review</span>
                    </div>
                    <div className="l-mockup-row">
                      <span className="l-mockup-row-dot indigo" />
                      <div className="l-mockup-row-text">
                        <span>Backend Developer — Deloitte</span>
                        <small>B.Tech, 2025–2026 batch</small>
                      </div>
                      <span className="l-mockup-row-pill indigo">Applied</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="l-section l-section--stats">
          <div className="l-section-inner">
            <div className="l-stats-row">
              <div className="l-stat-item">
                <span className="l-stat-num">500+</span>
                <span className="l-stat-lbl">Students Placed</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-num">80+</span>
                <span className="l-stat-lbl">Companies Hiring</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-num">300+</span>
                <span className="l-stat-lbl">Active Job Listings</span>
              </div>
              <div className="l-stat-item">
                <span className="l-stat-num">95%</span>
                <span className="l-stat-lbl">Placement Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="l-section" id="features">
          <div className="l-section-inner">
            <div className="l-section-header">
              <span className="l-label">Features</span>
              <h2 className="l-heading">Everything your placement cell needs</h2>
              <p className="l-subheading">
                Built for every stakeholder — students, recruiters, and admins all have dedicated workflows.
              </p>
            </div>
            <div className="l-features-grid">
              <div className="l-feature-card">
                <div className="l-feature-icon indigo">🎓</div>
                <p className="l-feature-title">For Students</p>
                <p className="l-feature-desc">
                  Manage your profile, discover eligible jobs, and track every application from one place.
                </p>
                <ul className="l-feature-list">
                  <li>Browse and filter active job listings</li>
                  <li>One-click application submission</li>
                  <li>Real-time application status timeline</li>
                  <li>Profile with skills, CGPA, and resume upload</li>
                </ul>
              </div>
              <div className="l-feature-card">
                <div className="l-feature-icon cyan">💼</div>
                <p className="l-feature-title">For Recruiters</p>
                <p className="l-feature-desc">
                  Post openings, review candidates, and move talent through your pipeline with minimal friction.
                </p>
                <ul className="l-feature-list">
                  <li>Create and manage job postings</li>
                  <li>Per-job applicant pipeline view</li>
                  <li>Inline status updates with notifications</li>
                  <li>Export applicant data to CSV</li>
                </ul>
              </div>
              <div className="l-feature-card">
                <div className="l-feature-icon green">🛡️</div>
                <p className="l-feature-title">For Admins</p>
                <p className="l-feature-desc">
                  Maintain platform integrity — manage companies, oversee all jobs, and keep data structured.
                </p>
                <ul className="l-feature-list">
                  <li>Full company directory management</li>
                  <li>Platform-wide oversight of all jobs</li>
                  <li>Admin-level application controls</li>
                  <li>Role-based access enforcement</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="l-section l-steps l-section--steps" id="how-it-works">
          <div className="l-section-inner l-section-inner--steps">
            <div className="l-section-header--narrow">
              <span className="l-label cyan">How it works</span>
              <h2 className="l-heading">From sign-up to placement in 3 steps</h2>
            </div>
            <div className="l-steps-grid">
              <div className="l-step">
                <div className="l-step-num">01</div>
                <p className="l-step-title">Create your profile</p>
                <p className="l-step-desc">
                  Register, fill in your branch, skills, and upload your resume. Recruiters see a clean verified profile — not a cluttered CV.
                </p>
              </div>
              <div className="l-step">
                <div className="l-step-num">02</div>
                <p className="l-step-title">Discover and apply</p>
                <p className="l-step-desc">
                  Browse jobs filtered by title, company, eligibility, or location. Apply in one click directly from the listings page.
                </p>
              </div>
              <div className="l-step">
                <div className="l-step-num">03</div>
                <p className="l-step-title">Track your outcome</p>
                <p className="l-step-desc">
                  Follow your application through Applied → Under Review → Shortlisted → Interview → Selected in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="l-cta-section" id="about">
          <div className="l-cta-inner">
            <span className="l-label l-label--spaced">Get started today</span>
            <h2 className="l-cta-title">Ready to streamline your campus placements?</h2>
            <p className="l-cta-desc">
              Join students and recruiters already using Placify to make campus hiring faster, fairer, and fully transparent.
            </p>
            <div className="l-cta-actions">
              <Link className="button primary" to="/register">Create Free Account</Link>
              <Link className="button ghost" to="/login">Sign In</Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="l-footer">
          <div className="l-footer-inner">
            <div className="l-footer-brand">
              <img src="/images/Logo.png" alt="Placify" />
              Placify
            </div>
            <span className="l-footer-copy">&copy; 2026 Placify. Smart Campus Placement OS.</span>
            <div className="l-footer-links">
              <Link className="l-footer-link" to="/login">Login</Link>
              <Link className="l-footer-link" to="/register">Register</Link>
              <Link className="l-footer-link" to="/jobs">Jobs</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
