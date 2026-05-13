import { useEffect, useRef, useState } from "react";
import "../styles/LandingPage.css";
import "../styles/Windows.css";

function LandingPage() {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [soundMuted, setSoundMuted] = useState(true);
  const [signinWindowVisible, setSigninWindowVisible] = useState(false);
  const [signinWindowPosition, setSigninWindowPosition] = useState({ x: 0, y: 0 });
  const catHitCanvasRef = useRef(null);
  const signinWindowRef = useRef(null);
  const signinWindowDragRef = useRef(null);

  useEffect(() => {
    const catSprite = new Image();
    catSprite.src = "/assets/cat blinking sprite.png";
    catSprite.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = catSprite.width / 2;
      canvas.height = catSprite.height;

      const context = canvas.getContext("2d");
      context.drawImage(
        catSprite,
        0,
        0,
        catSprite.width / 2,
        catSprite.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      catHitCanvasRef.current = canvas;
    };
  }, []);

  const handleCatClick = (event) => {
    const canvas = catHitCanvasRef.current;

    if (canvas) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
      const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
      const context = canvas.getContext("2d");
      const alpha = context.getImageData(x, y, 1, 1).data[3];

      if (alpha < 40) {
        return;
      }
    }

    setMusicPlaying((isPlaying) => !isPlaying);
  };

  const clampSigninWindowPosition = (x, y) => {
    const windowElement = signinWindowRef.current;

    if (!windowElement) {
      return { x, y };
    }

    const visibleHandle = 72;
    const rect = windowElement.getBoundingClientRect();
    const baseLeft = 500 - rect.width / 2;
    const baseTop = window.innerHeight / 2 - rect.height / 2;
    const minX = visibleHandle - rect.width - baseLeft;
    const maxX = window.innerWidth - visibleHandle - baseLeft;
    const minY = 0 - baseTop;
    const maxY = window.innerHeight - visibleHandle - baseTop;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  };

  useEffect(() => {
    const keepSigninWindowReachable = () => {
      setSigninWindowPosition((position) =>
        clampSigninWindowPosition(position.x, position.y),
      );
    };

    window.addEventListener("resize", keepSigninWindowReachable);
    return () => window.removeEventListener("resize", keepSigninWindowReachable);
  }, []);

  const startSigninWindowDrag = (event) => {
    event.preventDefault();
    signinWindowDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      windowX: signinWindowPosition.x,
      windowY: signinWindowPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragSigninWindow = (event) => {
    const dragStart = signinWindowDragRef.current;

    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const nextPosition = clampSigninWindowPosition(
      dragStart.windowX + event.clientX - dragStart.startX,
      dragStart.windowY + event.clientY - dragStart.startY,
    );

    setSigninWindowPosition(nextPosition);
  };

  const stopSigninWindowDrag = (event) => {
    if (signinWindowDragRef.current?.pointerId === event.pointerId) {
      signinWindowDragRef.current = null;
    }
  };

  return (
    <main className="landing-page">
      <button
        className={`sound-toggle ${soundMuted ? "is-muted" : "is-unmuted"}`}
        aria-label={soundMuted ? "Unmute sound" : "Mute sound"}
        aria-pressed={!soundMuted}
        onClick={() => setSoundMuted((isMuted) => !isMuted)}
      >
        <img
          key={soundMuted ? "mute" : "unmute"}
          className="sound-icon"
          src={soundMuted ? "/assets/mute.png" : "/assets/unmute.png"}
          alt=""
          aria-hidden="true"
        />
      </button>
      <img
        className="landing-logo"
        src="/assets/focus picnic logo final.webp"
        alt="Focus Picnic"
      />
      {signinWindowVisible && (
        <div
          id="settle-in-window"
          className="signin-window"
          ref={signinWindowRef}
          onPointerDown={startSigninWindowDrag}
          onPointerMove={dragSigninWindow}
          onPointerUp={stopSigninWindowDrag}
          onPointerCancel={stopSigninWindowDrag}
          style={{
            "--signin-window-drag-x": `${signinWindowPosition.x}px`,
            "--signin-window-drag-y": `${signinWindowPosition.y}px`,
          }}
        >
          <div className="signin-window-controls">
            <button
              className="signin-window-control"
              type="button"
              aria-label="Minimize sign in window"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/minimise for signup.png" alt="" aria-hidden="true" />
            </button>
            <button
              className="signin-window-control"
              type="button"
              aria-label="Close sign in window"
              onClick={() => setSigninWindowVisible(false)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/close button for sign up.png" alt="" aria-hidden="true" />
            </button>
          </div>
          <h2 className="signin-window-title">Settle In</h2>
          <div className="signin-window-body">
            <div className="signin-fields">
              <label className="username">
                <span>USERNAME</span>
                <input
                  type="text"
                  placeholder="enter your username"
                  onPointerDown={(event) => event.stopPropagation()}
                />
              </label>
            </div>
            <button
              className="signup-image-button"
              type="button"
              aria-label="Sign in"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/sign up button.png" alt="" aria-hidden="true" />
              <span className="signup-image-button-text">SIGN IN</span>
            </button>
          </div>
        </div>
      )}
      <div className="link-panel-shell">
        <aside className="link-info-panel" aria-label="Quick links">
          <nav className="navigatin">
            <button
              className="link-panel-button"
              type="button"
              aria-controls="settle-in-window"
              aria-expanded={signinWindowVisible}
              onClick={() => setSigninWindowVisible(true)}
            >
              Settle In
            </button>
            <a className="link-panel-button" href="#link-4">
              Start Picnic
            </a>
          </nav>
          <div className="link-panel-divider"></div>
          <section className="link-panel-info">
            <h2>info /</h2>
            <p>text text text</p>
            <p>text text text</p>
            <p>text text text</p>
            <p>text text text</p>
            <p>text text text</p>
          </section>
          <div className="link-panel-divider"></div>
        </aside>
        <section className="panel-content-column" aria-label="Status and info">
          <div className="panel-box status-box">
            <p>user status: feeling ...</p>
          </div>
          <div className="panel-box image-box" aria-label="Image placeholder"></div>
          <div className="panel-box more-info-box">
            <h2>more info ...</h2>
            <p>text text text text text text</p>
            <p>text text text text text text</p>
            <div className="more-info-divider"></div>
            <p>! important text !</p>
            <p>text text text text text text</p>
          </div>
        </section>
      </div>
      <button
        className="cat cat-down-blink"
        aria-label="Play music"
        onClick={handleCatClick}
      >
        {musicPlaying && <span className="sheet-music"></span>}
      </button>
    </main>
  );
}

export default LandingPage;
