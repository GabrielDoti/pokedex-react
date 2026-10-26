import { useEffect, useRef, useState } from "react";
import "./BootSequence.css";

const LOGS = [
  "NUCLEO DO SISTEMA ..... OK",
  "SINCRONIZANDO DADOS ... OK",
  "1025 ESPECIES LIDAS ... OK",
  "BEM-VINDO, TREINADOR!",
];

const SUBTITLES = [
  "AGUARDANDO ENERGIA...",
  "LIGANDO APARELHO...",
  "SINCRONIZANDO PESQUISA...",
  "CARREGANDO REGISTROS...",
  "SISTEMA PRONTO.",
];

const PROGRESS = [0, 25, 55, 85, 100];

export default function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [finished, setFinished] = useState(false);

  // Guarda o callback num ref pra os timers não reiniciarem se o pai re-renderizar.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 500),
      window.setTimeout(() => setPhase(2), 1500),
      window.setTimeout(() => setPhase(3), 2600),
      window.setTimeout(() => setPhase(4), 3600),
      window.setTimeout(() => setLeaving(true), 4400),
      window.setTimeout(() => {
        setFinished(true);
        onCompleteRef.current?.();
      }, 5200),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, []);

  function skipIntro() {
    setFinished(true);
    onCompleteRef.current?.();
  }

  if (finished) return null;

  return (
    <main
      className={`kalos-intro bt-phase-${phase} ${leaving ? "is-leaving" : ""}`}
    >
      <div className="bt-grid" aria-hidden="true" />

      <div className={`bt-device ${leaving ? "is-zooming" : ""}`}>
        <div className="bt-top">
          <div className={`bt-lens ${phase >= 1 ? "is-lit" : ""}`}>
            <span />
          </div>

          <div className="bt-leds" aria-hidden="true">
            <i className={`led-red ${phase >= 1 ? "on" : ""}`} />
            <i className={`led-yellow ${phase >= 2 ? "on" : ""}`} />
            <i className={`led-green ${phase >= 3 ? "on" : ""}`} />
          </div>

          <span className="bt-model">MODEL XY-01</span>
        </div>

        <div className="bt-bezel">
          <div className="bt-screen">
            <div className="bt-screen-off" aria-hidden="true" />

            <div className="bt-screen-head">
              <span>POKEDEX OS</span>
              <span>v1.0</span>
            </div>

            <h1>
              POKÉ<span>DEX</span>
            </h1>
            <p className="bt-sub">{SUBTITLES[phase]}</p>

            <ul className="bt-log">
              {LOGS.map((line, index) => (
                <li key={line} className={phase > index ? "show" : ""}>
                  &gt; {line}
                </li>
              ))}
            </ul>

            <div className="bt-progress">
              <span style={{ width: `${PROGRESS[phase]}%` }} />
            </div>
            <div className="bt-pct">
              <span>KALOS DATABASE</span>
              <strong>{PROGRESS[phase]}%</strong>
            </div>
          </div>
        </div>

        <div className="bt-bottom" aria-hidden="true">
          <span className="bt-dpad" />
          <span className="bt-speaker">
            <i />
            <i />
            <i />
          </span>
          <span className="bt-ab">
            <i />
            <i />
          </span>
        </div>
      </div>

      <button type="button" className="intro-skip" onClick={skipIntro}>
        PULAR INTRODUÇÃO <span aria-hidden="true">›</span>
      </button>
    </main>
  );
}