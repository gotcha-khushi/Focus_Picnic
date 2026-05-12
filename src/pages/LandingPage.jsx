import "../styles/LandingPage.css";

function LandingPage() {
  return (
    <main className="landing-page">
      <img
        className="landing-logo"
        src="/assets/focus picnic logo final.png"
        alt="Focus Picnic"
      />
      <button className="cat cat-down-blink" aria-label="Play music"></button>
    </main>
  );
}

export default LandingPage;
