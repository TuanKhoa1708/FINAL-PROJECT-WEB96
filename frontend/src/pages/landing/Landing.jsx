

function Landing() {
  return (
    
    <>
      
      <header className="landing-header">
        <div className="auth-buttons">
          <a href="/login" className="btn login">Log in</a>
        </div>
      </header>

      
      <section className="landing-text">
        <div className="landing-overlay">
          <h1>Welcome to</h1>
          <h2>Our International School</h2>
          <p>
            Our school is a place where students are encouraged to explore,
            learn, and grow in an international environment. We focus on
            developing knowledge, creativity, and global understanding.
          </p>
        </div>
      </section>
    </>
  );
}

export default Landing;