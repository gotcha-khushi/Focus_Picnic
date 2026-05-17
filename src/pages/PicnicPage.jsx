import { useEffect, useState } from "react";
import "../styles/PicnicPage.css";

function PicnicPage({ room }) {
  const [adaStanding, setAdaStanding] = useState(false);
  const [adaLeftStanding, setAdaLeftStanding] = useState(false);
  const [aviStanding, setAviStanding] = useState(false);
  const [aviLeftStanding, setAviLeftStanding] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [timerMode] = useState("focus");
  const selectedAvatar = room?.avatar ?? "ada";
  const showAda = selectedAvatar === "ada";
  const showAvi = selectedAvatar === "avi";

  useEffect(() => {
    const backgroundRatio = 887 / 1448;
    const halfRiverPosition = 0.94;
    const scaledBackgroundHeight = window.innerWidth * backgroundRatio;
    const targetScroll = Math.max(
      0,
      Math.min(
        scaledBackgroundHeight * halfRiverPosition - window.innerHeight,
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    );
    const duration = 2700;
    const startTime = performance.now();

    window.scrollTo(0, 0);

    const scrollPicnicPage = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;

      window.scrollTo(0, targetScroll * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(scrollPicnicPage);
      }
    };

    const frameId = requestAnimationFrame(scrollPicnicPage);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <main className="picnic-page" aria-label="Focus picnic" spellCheck={false}>
      <section className="picnic-scroll-space">
        <div className="picnic-room-code-badge">
          Room Code : {room?.roomCode ?? "FP-0000"}
        </div>
        <aside
          className={`picnic-chat-box ${chatMinimized ? "is-minimized" : ""}`}
          aria-label="Picnic chat"
        >
          <div className="picnic-chat-box-controls">
            <button
              className="picnic-chat-box-control"
              type="button"
              aria-label="Close chat box"
              onClick={() => setChatMinimized(true)}
            >
              <img src="/assets/close button settle in window.png" alt="" aria-hidden="true" />
            </button>
          </div>
          <button
            className="picnic-chat-box-banner"
            type="button"
            aria-label={chatMinimized ? "Open chat box" : "Chat box"}
            onClick={() => {
              if (chatMinimized) {
                setChatMinimized(false);
              }
            }}
          >
            Chat Box
          </button>
          <div className="picnic-chat-box-body">
            <p><span>{room?.username ?? "User1"}:</span> ready to focus?</p>
            <p><span>Room:</span> waiting for friend</p>
            <p><span>Timer:</span> {room?.focusMinutes ?? 25}/{room?.breakMinutes ?? 5} min</p>
          </div>
        </aside>
        <aside
          className={`picnic-musicbox ${musicPlaying ? "is-playing" : "is-paused"}`}
          aria-label="Music box"
        >
          <img className="picnic-musicbox-cd" src="/assets/CD.png" alt="" aria-hidden="true" />
          <div className="picnic-musicbox-controls">
            <button
              className="picnic-musicbox-button picnic-musicbox-previous"
              type="button"
              aria-label="Previous song"
            >
              <img src="/assets/avatar window previous.png" alt="" aria-hidden="true" />
            </button>
            <button
              className={`picnic-musicbox-play-button ${musicPlaying ? "is-playing" : ""}`}
              type="button"
              aria-label={musicPlaying ? "Pause music" : "Play music"}
              aria-pressed={musicPlaying}
              onClick={() => setMusicPlaying((isPlaying) => !isPlaying)}
            >
              <span className="picnic-musicbox-play-icon" aria-hidden="true"></span>
            </button>
            <button
              className="picnic-musicbox-button picnic-musicbox-next"
              type="button"
              aria-label="Next song"
            >
              <img src="/assets/avatar window next.png" alt="" aria-hidden="true" />
            </button>
          </div>
        </aside>
        <aside className="picnic-userbox" aria-label="Picnic status">
          <div className="picnic-userbox-controls">
            <button
              className="picnic-userbox-control"
              type="button"
              aria-label="Close picnic status"
            >
              <img src="/assets/close button settle in window.png" alt="" aria-hidden="true" />
            </button>
          </div>
          <div className="picnic-userbox-hearts" aria-hidden="true">
            <span className="picnic-userbox-heart userbox-heart-one">
              <span className="picnic-userbox-heart-block block-one"></span>
              <span className="picnic-userbox-heart-block block-two"></span>
              <span className="picnic-userbox-heart-block block-three"></span>
            </span>
            <span className="picnic-userbox-heart userbox-heart-two">
              <span className="picnic-userbox-heart-block block-one"></span>
              <span className="picnic-userbox-heart-block block-two"></span>
              <span className="picnic-userbox-heart-block block-three"></span>
            </span>
            <span className="picnic-userbox-heart userbox-heart-three">
              <span className="picnic-userbox-heart-block block-one"></span>
              <span className="picnic-userbox-heart-block block-two"></span>
              <span className="picnic-userbox-heart-block block-three"></span>
            </span>
          </div>
          <div className="picnic-userbox-body">
            <p className="picnic-userbox-username">@{room?.username ?? "user"}</p>
            <div className="picnic-userbox-info-card">
              <strong>{String(room?.focusMinutes ?? 25).padStart(2, "0")}:00</strong>
              <span className="picnic-timer-mode">
                {timerMode === "break" ? "break" : "focused"}
              </span>
            </div>
          </div>
        </aside>
        {showAda && (
          <span
            className={`picnic-ada-walker ${adaStanding ? "is-standing" : ""}`}
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.animationName === "ada-walk-path") {
                setAdaStanding(true);
              }
            }}
          ></span>
        )}
        {showAvi && (
          <span
            className={`picnic-avi-walker ${aviStanding ? "is-standing" : ""}`}
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.animationName === "avi-walk-path") {
                setAviStanding(true);
              }
            }}
          ></span>
        )}
        {showAda && adaStanding && (
          <span
            className={`picnic-ada-left-sprite ${adaLeftStanding ? "is-standing" : ""}`}
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.animationName === "ada-left-slide") {
                setAdaLeftStanding(true);
              }
            }}
          ></span>
        )}
        {showAvi && aviStanding && (
          <span
            className={`picnic-avi-left-sprite ${aviLeftStanding ? "is-standing" : ""}`}
            aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.animationName === "avi-left-slide") {
                setAviLeftStanding(true);
              }
            }}
          ></span>
        )}
      </section>
    </main>
  );
}

export default PicnicPage;
