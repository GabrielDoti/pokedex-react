
import { useEffect, useState } from "react";
import "./BootSequence.css";

export default function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 400),
      window.setTimeout(() => setPhase(2), 1400),
      window.setTimeout(() => setPhase(3), 2600),
      window.setTimeout(() => {
        setFinished(true);
        onComplete?.();
      }, 4400),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [onComplete]);

  function skipIntro() {
    setFinished(true);
    onComplete?.();
  }

  if (finished) return null;

  return (
    <main className={`kalos-intro intro-phase-${phase}`}>
      <div className="kalos-intro-noise" aria-hidden="true" />
      <div className="kalos-intro-lines" aria-hidden="true" />

      <header className="intro-header">
        <span className="intro-game-mark">
          <span className="intro-mark-dot" />
          KALOS POKÉDEX SYSTEM
        </span>
        <span className="intro-version">MODEL XY-01</span>
      </header>

      <section className="intro-center">
        <div className="intro-flash" aria-hidden="true" />

        <div className="intro-orbit intro-orbit-one" aria-hidden="true" />
        <div className="intro-orbit intro-orbit-two" aria-hidden="true" />
        <div className="intro-orbit intro-orbit-three" aria-hidden="true" />

        <div className="intro-crest" aria-hidden="true">
          <div className="crest-inner">
            <span className="crest-letter">X</span>
            <span className="crest-slash" />
            <span className="crest-letter crest-y">Y</span>
          </div>
        </div>

        <div className="intro-title">
          <span className="intro-eyebrow">
            {phase < 2 ? "INICIANDO SISTEMA" : "BANCO DE DADOS CONECTADO"}
          </span>

          <h1>
            POKÉ<span>DEX</span>
          </h1>

          <p>
            {phase < 1
              ? "Preparando interface de Kalos..."
              : phase < 2
                ? "Sincronizando dados de pesquisa..."
                : phase < 3
                  ? "Carregando registros Pokémon..."
                  : "Sistema pronto. Bem-vindo à região de Kalos."}
          </p>
        </div>
      </section>

      <footer className="intro-footer">
        <div className="intro-loading">
          <div className="intro-loading-label">
            <span>INITIALIZING KALOS DATABASE</span>
            <strong>{phase === 0 ? "12%" : phase === 1 ? "38%" : phase === 2 ? "72%" : "100%"}</strong>
          </div>
          <div className="intro-progress">
            <span />
          </div>
        </div>

        <div className="intro-bottom-row">
          <span>POKÉMON RESEARCH LAB</span>
          <span>REGION: KALOS</span>
          <span>VERSION 1.0</span>
        </div>
      </footer>

      <button
        type="button"
        className="intro-skip"
        onClick={skipIntro}
      >
        PULAR INTRODUÇÃO <span aria-hidden="true">›</span>
      </button>
    </main>
  );
}
