import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">🌐</div>
          XR Learning Lab
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-ghost">Log In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <main className="landing-hero">
        <div className="landing-badge">
          ✨ No headset required — learn in your browser
        </div>

        <h1 className="landing-title">
          Learn <span>Augmented & Virtual Reality</span> from Scratch
        </h1>

        <p className="landing-subtitle">
          Master XR development through hands-on 3D exercises, guided by an AI tutor. Write code, see it come alive in real-time, and build your first XR scene — all in your browser.
        </p>

        <div className="landing-cta">
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started — It's Free
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Log In
          </Link>
        </div>
      </main>

      <section className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon blue">🛠️</div>
          <h3>Learn by Doing</h3>
          <p>
            Every module includes a hands-on 3D workspace. Write JavaScript code and watch objects move, light up, and respond to your input in real-time.
          </p>
        </div>

        <div className="landing-feature">
          <div className="landing-feature-icon green">🤖</div>
          <h3>AI-Guided Learning</h3>
          <p>
            An AI tutor guides you through each exercise with progressive hints. It never gives the answer — it helps you discover it yourself.
          </p>
        </div>

        <div className="landing-feature">
          <div className="landing-feature-icon purple">🥽</div>
          <h3>No Headset Needed</h3>
          <p>
            Everything runs in your browser. No downloads, no installations, no hardware. Just open the URL and start learning XR concepts immediately.
          </p>
        </div>
      </section>
    </div>
  )
}
