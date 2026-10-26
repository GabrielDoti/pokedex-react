import { useMemo, useState } from "react";
import data from "./data/pokedex-data.json";
import BootSequence from "./components/BootSequence";
import { PokemonList } from "./components/PokemonList";
import { PokemonDetails } from "./components/PokemonDetails";
import "./index.css";
import "./PokedexShell.css"; // precisa vir depois do index.css

const pokemonData = data.pokemon ?? [];
const trainers = data.trainers ?? [];
const pokemonById = new Map(pokemonData.map((p) => [p.id, p]));

const getSprite = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Botões físicos da carcaça conversam com o carrossel por eventos.
const sendNav = (direction) =>
  window.dispatchEvent(new CustomEvent("dex:nav", { detail: direction }));
const sendOpen = () => window.dispatchEvent(new CustomEvent("dex:open"));

export default function App() {
  const [systemStarted, setSystemStarted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [section, setSection] = useState("pokemon");

  const types = useMemo(() => {
    return [
      ...new Set(
        pokemonData.flatMap((pokemon) =>
          (pokemon.types ?? []).map((type) => type.name)
        )
      ),
    ].sort();
  }, []);

  const typeOptions = useMemo(() => ["Todos", ...types], [types]);

  const filteredPokemon = useMemo(() => {
    const term = search.trim().toLowerCase();

    return pokemonData.filter((pokemon) => {
      const matchesSearch =
        pokemon.name.toLowerCase().includes(term) ||
        String(pokemon.id).includes(term);

      const matchesType =
        selectedType === "Todos" ||
        pokemon.types?.some((type) => type.name === selectedType);

      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);

  if (!systemStarted) {
    return <BootSequence onComplete={() => setSystemStarted(true)} />;
  }

  // D-pad ↑ ↓ troca o filtro de tipo.
  const cycleType = (direction) => {
    const current = typeOptions.indexOf(selectedType);
    const next =
      (current + direction + typeOptions.length) % typeOptions.length;
    setSelectedType(typeOptions[next]);
  };

  return (
    <main className="dex-page">
      <div className="dex-device">
        <header className="dex-top">
          <div className="dex-lens" aria-hidden="true" />

          <div className="dex-leds" aria-hidden="true">
            <i className="led-red" />
            <i className="led-yellow" />
            <i className="led-green" />
          </div>

          <span className="dex-brand">
            Poké<span>Dex</span>
          </span>

          <nav className="dex-nav">
            <button
              className={section === "pokemon" ? "nav-active" : ""}
              onClick={() => setSection("pokemon")}
            >
              Pokémon
            </button>
            <button
              className={section === "trainers" ? "nav-active" : ""}
              onClick={() => setSection("trainers")}
            >
              Treinadores
            </button>
          </nav>
        </header>

        <div className="dex-hinge" aria-hidden="true" />

        <div className="dex-bezel">
          <div className="dex-screen">
            <div className="dex-screen-bar">
              <span className="dex-screen-title">
                <i /> KALOS POKEDEX
              </span>
              <span>
                {section === "pokemon"
                  ? `${filteredPokemon.length} ENCONTRADOS`
                  : `${trainers.length} TREINADORES`}
              </span>
            </div>

            {section === "pokemon" ? (
              <>
                <div className="toolbar">
                  <label className="search-box">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      placeholder="Buscar por nome ou número..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>

                  <label className="filter-box">
                    <span>Tipo</span>
                    <select
                      value={selectedType}
                      onChange={(event) => setSelectedType(event.target.value)}
                    >
                      <option value="Todos">Todos os tipos</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <PokemonList
                  pokemon={filteredPokemon}
                  onSelect={setSelectedPokemon}
                />
              </>
            ) : (
              <div className="dex-trainers">
                {trainers.map((trainer, index) => {
                  const slots = Math.max(8, trainer.badges ?? 0);

                  return (
                    <article className="dex-trainer" key={trainer.id}>
                      <div className="dex-trainer-head">
                        <div className="dex-trainer-avatar">
                          {trainer.name === "Team Rocket" ? "🚀" : "🧢"}
                        </div>
                        <div>
                          <span className="dex-trainer-number">
                            TREINADOR #{String(index + 1).padStart(2, "0")}
                          </span>
                          <h3>{trainer.name}</h3>
                        </div>
                      </div>

                      <div
                        className="dex-badges"
                        title={`${trainer.badges} insígnias`}
                      >
                        {Array.from({ length: slots }, (_, i) => (
                          <i
                            key={i}
                            className={i < (trainer.badges ?? 0) ? "on" : ""}
                          />
                        ))}
                      </div>

                      <div className="dex-team">
                        {(trainer.pokemonIds ?? []).map((id, i) => {
                          const member = pokemonById.get(id);
                          if (!member) return null;

                          return (
                            <button
                              key={`${id}-${i}`}
                              type="button"
                              title={member.name}
                              aria-label={`Ver detalhes de ${member.name}`}
                              onClick={() => setSelectedPokemon(member)}
                            >
                              <img src={getSprite(id)} alt="" loading="lazy" />
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="dex-bottom">
          <div className="dex-dpad">
            <button
              type="button"
              className="dpad-up"
              aria-label="Tipo anterior"
              onClick={() => cycleType(-1)}
            >
              ▲
            </button>
            <button
              type="button"
              className="dpad-left"
              aria-label="Pokémon anterior"
              onClick={() => sendNav("prev")}
            >
              ◀
            </button>
            <div className="dpad-center" aria-hidden="true" />
            <button
              type="button"
              className="dpad-right"
              aria-label="Próximo Pokémon"
              onClick={() => sendNav("next")}
            >
              ▶
            </button>
            <button
              type="button"
              className="dpad-down"
              aria-label="Próximo tipo"
              onClick={() => cycleType(1)}
            >
              ▼
            </button>
          </div>

          <div className="dex-speaker" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="dex-ab">
            <button
              type="button"
              className="btn-b"
              aria-label="Fechar ficha"
              onClick={() => setSelectedPokemon(null)}
            >
              B
            </button>
            <button
              type="button"
              className="btn-a"
              aria-label="Abrir ficha"
              onClick={sendOpen}
            >
              A
            </button>
          </div>
        </div>
      </div>

      <p className="dex-foot">
        ◉ PokéDex · Projeto acadêmico desenvolvido com React + Vite.
      </p>

      <PokemonDetails
        pokemon={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </main>
  );
}