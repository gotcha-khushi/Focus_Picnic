import { useEffect, useRef, useState } from "react";
import "../styles/LandingPage.css";
import "../styles/Windows.css";

const USERNAME_STORAGE_KEY = "focusPicnicUsername";
const GUIDE_SEEN_STORAGE_KEY = "focusPicnicHasSeenGuide";

function LandingPage({ onStartPicnic }) {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [soundMuted, setSoundMuted] = useState(true);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem(USERNAME_STORAGE_KEY) ?? "";
  });
  const [guideVisible, setGuideVisible] = useState(false);
  const [signinWindowVisible, setSigninWindowVisible] = useState(false);
  const [timerWindowVisible, setTimerWindowVisible] = useState(false);
  const [avatarWindowVisible, setAvatarWindowVisible] = useState(false);
  const [cloverAnimating, setCloverAnimating] = useState(false);
  const [cloverReturning, setCloverReturning] = useState(false);
  const [cloverHovered, setCloverHovered] = useState(false);
  const [catAnimating, setCatAnimating] = useState(false);
  const [catReturning, setCatReturning] = useState(false);
  const [catHovered, setCatHovered] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(25);
  const [selectedBreakTimer, setSelectedBreakTimer] = useState(5);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [avatarSlideDirection, setAvatarSlideDirection] = useState("next");
  const [signinWindowPosition, setSigninWindowPosition] = useState({ x: 0, y: 0 });
  const [timerWindowPosition, setTimerWindowPosition] = useState({ x: 0, y: 0 });
  const [avatarWindowPosition, setAvatarWindowPosition] = useState({ x: 0, y: 0 });
  const catHitCanvasRef = useRef(null);
  const meowAudioRef = useRef(null);
  const signinWindowRef = useRef(null);
  const signinWindowDragRef = useRef(null);
  const timerWindowRef = useRef(null);
  const timerWindowDragRef = useRef(null);
  const avatarWindowRef = useRef(null);
  const avatarWindowDragRef = useRef(null);
  const avatarOptions = [
    { name: "Ada", src: "/assets/ada.png", className: "avatar-preview-ada" },
    { name: "Avi", src: "/assets/avi.png", className: "avatar-preview-avi" },
  ];
  const selectedAvatar = avatarOptions[selectedAvatarIndex];
  const isVeteranUser = username.trim().length > 0;

  useEffect(() => {
    const savedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
    const hasSeenGuide = localStorage.getItem(GUIDE_SEEN_STORAGE_KEY) === "true";

    if (!savedUsername && !hasSeenGuide) {
      setGuideVisible(true);
    }
  }, []);

  const saveUsername = () => {
    const nextUsername = username.trim();

    if (nextUsername) {
      localStorage.setItem(USERNAME_STORAGE_KEY, nextUsername);
      setUsername(nextUsername);
    }

    setSigninWindowVisible(false);
  };

  const openGuideFromClover = () => {
    if (isVeteranUser) {
      setGuideVisible(true);
    }
  };

  const closeGuide = () => {
    localStorage.setItem(GUIDE_SEEN_STORAGE_KEY, "true");
    setGuideVisible(false);
  };

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

  const handleCatHover = () => {
    if (soundMuted) {
      return;
    }

    if (!meowAudioRef.current) {
      meowAudioRef.current = new Audio("/assets/meow.m4a");
      meowAudioRef.current.volume = 0.45;
    }

    meowAudioRef.current.muted = soundMuted;
    meowAudioRef.current.volume = 0.45;
    meowAudioRef.current.currentTime = 0;
    meowAudioRef.current.play().catch(() => {});
  };

  const startCatHover = () => {
    handleCatHover();
    setCatAnimating(false);
    setCatReturning(false);
    setCatHovered(true);
    requestAnimationFrame(() => setCatAnimating(true));
  };

  const stopCatHover = () => {
    setCatHovered(false);
    if (!catAnimating) {
      setCatReturning(true);
    }
  };

  const finishCatAnimation = (event) => {
    if (event.animationName === "cat-hover-grow") {
      setCatAnimating(false);
      if (!catHovered) {
        setCatReturning(true);
      }
    }

    if (event.animationName === "cat-hover-shrink") {
      setCatReturning(false);
    }
  };

  useEffect(() => {
    if (meowAudioRef.current) {
      meowAudioRef.current.muted = soundMuted;
    }
  }, [soundMuted]);

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

  const clampAvatarWindowPosition = (x, y) => {
    const windowElement = avatarWindowRef.current;

    if (!windowElement) {
      return { x, y };
    }

    const visibleHandle = 72;
    const rect = windowElement.getBoundingClientRect();
    const baseLeft = window.innerWidth * 0.48 - rect.width / 2;
    const baseTop = window.innerHeight * 0.48 - rect.height / 2;
    const minX = visibleHandle - rect.width - baseLeft;
    const maxX = window.innerWidth - visibleHandle - baseLeft;
    const minY = 0 - baseTop;
    const maxY = window.innerHeight - visibleHandle - baseTop;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  };

  const clampTimerWindowPosition = (x, y) => {
    const windowElement = timerWindowRef.current;

    if (!windowElement) {
      return { x, y };
    }

    const visibleHandle = 72;
    const rect = windowElement.getBoundingClientRect();
    const baseLeft = window.innerWidth * 0.52 - rect.width / 2;
    const baseTop = window.innerHeight * 0.46 - rect.height / 2;
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
    const keepWindowsReachable = () => {
      setSigninWindowPosition((position) =>
        clampSigninWindowPosition(position.x, position.y),
      );
      setAvatarWindowPosition((position) =>
        clampAvatarWindowPosition(position.x, position.y),
      );
      setTimerWindowPosition((position) =>
        clampTimerWindowPosition(position.x, position.y),
      );
    };

    window.addEventListener("resize", keepWindowsReachable);
    return () => window.removeEventListener("resize", keepWindowsReachable);
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

  const startAvatarWindowDrag = (event) => {
    event.preventDefault();
    avatarWindowDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      windowX: avatarWindowPosition.x,
      windowY: avatarWindowPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragAvatarWindow = (event) => {
    const dragStart = avatarWindowDragRef.current;

    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const nextPosition = clampAvatarWindowPosition(
      dragStart.windowX + event.clientX - dragStart.startX,
      dragStart.windowY + event.clientY - dragStart.startY,
    );

    setAvatarWindowPosition(nextPosition);
  };

  const stopAvatarWindowDrag = (event) => {
    if (avatarWindowDragRef.current?.pointerId === event.pointerId) {
      avatarWindowDragRef.current = null;
    }
  };

  const startTimerWindowDrag = (event) => {
    event.preventDefault();
    timerWindowDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      windowX: timerWindowPosition.x,
      windowY: timerWindowPosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragTimerWindow = (event) => {
    const dragStart = timerWindowDragRef.current;

    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const nextPosition = clampTimerWindowPosition(
      dragStart.windowX + event.clientX - dragStart.startX,
      dragStart.windowY + event.clientY - dragStart.startY,
    );

    setTimerWindowPosition(nextPosition);
  };

  const stopTimerWindowDrag = (event) => {
    if (timerWindowDragRef.current?.pointerId === event.pointerId) {
      timerWindowDragRef.current = null;
    }
  };

  const closeTimerWindow = () => {
    setTimerWindowVisible(false);
    setAvatarWindowVisible(false);
  };

  return (
    <main
      className="landing-page"
      data-guide-visible={guideVisible}
      data-veteran-user={isVeteranUser}
    >
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
          style={{
            "--signin-window-drag-x": `${signinWindowPosition.x}px`,
            "--signin-window-drag-y": `${signinWindowPosition.y}px`,
          }}
        >
          <div
            className="signin-window-drag-bar"
            onPointerDown={startSigninWindowDrag}
            onPointerMove={dragSigninWindow}
            onPointerUp={stopSigninWindowDrag}
            onPointerCancel={stopSigninWindowDrag}
          ></div>
          <div className="signin-window-blocks" aria-hidden="true">
            <span className="signin-window-heart heart-one">
              <span className="signin-window-block block-one"></span>
              <span className="signin-window-block block-two"></span>
              <span className="signin-window-block block-three"></span>
            </span>
            <span className="signin-window-heart heart-two">
              <span className="signin-window-block block-one"></span>
              <span className="signin-window-block block-two"></span>
              <span className="signin-window-block block-three"></span>
            </span>
            <span className="signin-window-heart heart-three">
              <span className="signin-window-block block-one"></span>
              <span className="signin-window-block block-two"></span>
              <span className="signin-window-block block-three"></span>
            </span>
          </div>
          <div className="signin-window-controls">
            <button
              className="signin-window-control"
              type="button"
              aria-label="Minimize sign in window"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/minimise button settle in.png" alt="" aria-hidden="true" />
            </button>
            <button
              className="signin-window-control"
              type="button"
              aria-label="Close sign in window"
              onClick={() => setSigninWindowVisible(false)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/close button settle in window.png" alt="" aria-hidden="true" />
            </button>
          </div>
          <h2 className="signin-window-title">Settle In</h2>
          <div className="signin-window-body">
            <div className="signin-fields">
              <label className="username">
                <span>USERNAME</span>
                <input
                  type="text"
                  value={username}
                  placeholder="enter your username"
                  onChange={(event) => setUsername(event.target.value)}
                  onPointerDown={(event) => event.stopPropagation()}
                />
              </label>
            </div>
            <button
              className="signup-image-button"
              type="button"
              aria-label="Sign in"
              onClick={saveUsername}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <span className="signup-image-button-text">DONE</span>
            </button>
          </div>
        </div>
      )}
      {timerWindowVisible && (
        <div
          className="timer-window"
          ref={timerWindowRef}
          aria-label="Select timer window"
          style={{
            "--timer-window-drag-x": `${timerWindowPosition.x}px`,
            "--timer-window-drag-y": `${timerWindowPosition.y}px`,
          }}
        >
          <div
            className="timer-window-drag-bar"
            onPointerDown={startTimerWindowDrag}
            onPointerMove={dragTimerWindow}
            onPointerUp={stopTimerWindowDrag}
            onPointerCancel={stopTimerWindowDrag}
          ></div>
          <div className="timer-window-circles" aria-hidden="true">
            <span className="timer-window-circle timer-circle-one"></span>
            <span className="timer-window-circle timer-circle-two"></span>
            <span className="timer-window-circle timer-circle-three"></span>
          </div>
          <div className="timer-window-controls">
            <button
              className="timer-window-control"
              type="button"
              aria-label="Minimize select timer window"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/timer minimise button.png" alt="" aria-hidden="true" />
            </button>
            <button
              className="timer-window-control"
              type="button"
              aria-label="Close select timer window"
              onClick={closeTimerWindow}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/timer close button.png" alt="" aria-hidden="true" />
            </button>
          </div>
          <div className="timer-window-body">
            <h2 className="timer-window-title">Select Timer</h2>
            <p className="timer-window-note">(in minutes)</p>
            <div className="timer-options" aria-label="Timer options">
              <button
                className={selectedTimer === 25 ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setSelectedTimer((timer) => (timer === 25 ? null : 25))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                25
              </button>
              <button
                className={selectedTimer === 30 ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setSelectedTimer((timer) => (timer === 30 ? null : 30))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                30
              </button>
              <button
                className={selectedTimer === 40 ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setSelectedTimer((timer) => (timer === 40 ? null : 40))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                40
              </button>
            </div>
            <h3 className="pastel-break-title">Select Break Timer</h3>
            <div className="break-options" aria-label="Break timer options">
              <button
                className={selectedBreakTimer === 5 ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setSelectedBreakTimer((timer) => (timer === 5 ? null : 5))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                5
              </button>
              <button
                className={selectedBreakTimer === 15 ? "is-selected" : ""}
                type="button"
                onClick={() =>
                  setSelectedBreakTimer((timer) => (timer === 15 ? null : 15))
                }
                onPointerDown={(event) => event.stopPropagation()}
              >
                15
              </button>
            </div>
            <label className="room-code-field">
              <span className="room-code-title">
                Enter code
                <span>(if any)</span>
              </span>
              <input
                type="text"
                onPointerDown={(event) => event.stopPropagation()}
              />
            </label>
            <label className="private-room-toggle">
              <input
                type="checkbox"
                onPointerDown={(event) => event.stopPropagation()}
              />
              <span>Make private room</span>
            </label>
            <button
              className="select-avatar-button"
              type="button"
              onClick={() => setAvatarWindowVisible(true)}
              onPointerDown={(event) => event.stopPropagation()}
            >
              Select Avatar
            </button>
          </div>
        </div>
      )}
      {avatarWindowVisible && (
        <div
          className="avatar-window"
          ref={avatarWindowRef}
          aria-label="Avatar window"
          style={{
            "--avatar-window-drag-x": `${avatarWindowPosition.x}px`,
            "--avatar-window-drag-y": `${avatarWindowPosition.y}px`,
          }}
        >
          <div
            className="avatar-window-drag-bar"
            onPointerDown={startAvatarWindowDrag}
            onPointerMove={dragAvatarWindow}
            onPointerUp={stopAvatarWindowDrag}
            onPointerCancel={stopAvatarWindowDrag}
          ></div>
          <div className="avatar-window-hearts" aria-hidden="true">
            <span className="avatar-heart avatar-heart-one">
              <span className="avatar-heart-block avatar-heart-block-one"></span>
              <span className="avatar-heart-block avatar-heart-block-two"></span>
              <span className="avatar-heart-block avatar-heart-block-three"></span>
            </span>
            <span className="avatar-heart avatar-heart-two">
              <span className="avatar-heart-block avatar-heart-block-one"></span>
              <span className="avatar-heart-block avatar-heart-block-two"></span>
              <span className="avatar-heart-block avatar-heart-block-three"></span>
            </span>
            <span className="avatar-heart avatar-heart-three">
              <span className="avatar-heart-block avatar-heart-block-one"></span>
              <span className="avatar-heart-block avatar-heart-block-two"></span>
              <span className="avatar-heart-block avatar-heart-block-three"></span>
            </span>
          </div>
          <h2 className="avatar-window-title">Select your avatar</h2>
          <div className="avatar-preview">
            <img
              key={selectedAvatar.name}
              className={`avatar-preview-character ${selectedAvatar.className} avatar-slide-${avatarSlideDirection}`}
              src={selectedAvatar.src}
              alt={selectedAvatar.name}
            />
          </div>
          <div className="avatar-circle-controls">
            <button
              className="avatar-player-circle"
              type="button"
              aria-label="Previous avatar"
              onClick={() => {
                setAvatarSlideDirection("previous");
                setSelectedAvatarIndex(0);
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/avatar window previous.png" alt="" aria-hidden="true" />
            </button>
            <button
              className="avatar-player-oval"
              type="button"
              aria-label="Select avatar"
              onClick={onStartPicnic}
              onPointerDown={(event) => event.stopPropagation()}
            >
              Start Picnic
            </button>
            <button
              className="avatar-player-circle"
              type="button"
              aria-label="Next avatar"
              onClick={() => {
                setAvatarSlideDirection("next");
                setSelectedAvatarIndex(1);
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <img src="/assets/avatar window next.png" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {avatarWindowVisible && (
        <div
          className="avatar-taken-window"
          style={{
            "--avatar-window-drag-x": `${avatarWindowPosition.x}px`,
            "--avatar-window-drag-y": `${avatarWindowPosition.y}px`,
          }}
        >
          Avatar alredy taken for that room
        </div>
      )}
      <div className="link-panel-shell">
        <aside className="link-info-panel" aria-label="Quick links">
          <img
            className={`nav-panel-clover ${cloverAnimating ? "is-animating" : ""} ${cloverReturning ? "is-returning" : ""} ${cloverHovered ? "is-hovered" : ""}`}
            src="/assets/clover.png"
            alt=""
            aria-hidden="true"
            onClick={openGuideFromClover}
            onMouseEnter={() => {
              setCloverAnimating(false);
              setCloverReturning(false);
              setCloverHovered(true);
              requestAnimationFrame(() => setCloverAnimating(true));
            }}
            onMouseLeave={() => {
              setCloverHovered(false);
              if (!cloverAnimating) {
                setCloverReturning(true);
              }
            }}
            onAnimationEnd={(event) => {
              if (event.animationName === "clover-hover-grow") {
                setCloverAnimating(false);
                if (!cloverHovered) {
                  setCloverReturning(true);
                }
              }

              if (event.animationName === "clover-hover-shrink") {
                setCloverReturning(false);
              }
            }}
          />
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
            <button
              className="link-panel-button"
              type="button"
              aria-expanded={timerWindowVisible}
              onClick={() => setTimerWindowVisible(true)}
            >
              Select Timer
            </button>
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
      </div>
      <button
        className={`cat cat-down-blink ${catAnimating ? "is-animating" : ""} ${catReturning ? "is-returning" : ""} ${catHovered ? "is-hovered" : ""}`}
        aria-label="Play music"
        onClick={handleCatClick}
        onMouseEnter={startCatHover}
        onMouseLeave={stopCatHover}
        onAnimationEnd={finishCatAnimation}
      >
        {musicPlaying && <span className="sheet-music"></span>}
      </button>
    </main>
  );
}

export default LandingPage;
