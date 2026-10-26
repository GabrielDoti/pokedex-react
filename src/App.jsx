import { useMemo, useState } from "react";
import data from "./data/pokedex-data.json";
import BootSequence from "./components/BootSequence";
import { PokemonList } from "./components/PokemonList";
import { PokemonDetails } from "./components/PokemonDetails";
import "./index.css";


const pokemonData = data.pokemon ?? [];
const trainers = [
  "Ash", "Brock", "Misty", "Lt. Surge",
  "Erika", "Koga", "Sabrina", "Blaine",
  "Giovanni", "Gary", "Team Rocket", "Lance",
];





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

  const filteredPokemon = useMemo(() => {
    const term = search.trim().toLowerCase();

    return pokemonData.filter((pokemon) => {
      const matchesSearch =
        pokemon.name.toLowerCase().includes(term) ||
        String(pokemon.id).includes(term);

      const matchesType =
        selectedType === "Todos" ||
        pokemon.types?.some(
          (type) => type.name === selectedType
        );

      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);


    if (!systemStarted) {
  return (
    <BootSequence
      onComplete={() => setSystemStarted(true)}
    />
  );
}


  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          href="#inicio"
          className="brand"
          onClick={() => setSection("pokemon")}
        >
          <span className="brand-ball">◉</span>
          Poké<span>Dex</span>
        </a>

        <nav>
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

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">EXPLORE O MUNDO POKÉMON</span>
          <h1>Encontre seu próximo <span>Pokémon.</span></h1>
          <p>
            Explore espécies, descubra atributos e monte
            sua equipe favorita.
          </p>
          <div className="hero-count">
            <strong>{pokemonData.length}</strong>
            <span>Pokémon no catálogo</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            alt=""
          />
          <span className="spark spark-one">✦</span>
          <span className="spark spark-two">✧</span>
        </div>
      </section>

      {section === "pokemon" ? (
        <section className="catalog">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SEU GUIA POKÉMON</span>
              <h2>Pokédex</h2>
              <p>Pesquise e descubra novas criaturas.</p>
            </div>
            <span className="result-count">
              {filteredPokemon.length} encontrados
            </span>
          </div>

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
                onChange={(event) =>
                  setSelectedType(event.target.value)
                }
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
        </section>
      ) : (
        <section className="catalog">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LÍDERES E AVENTUREIROS</span>
              <h2>Treinadores</h2>
              <p>Conheça os treinadores do universo Pokémon.</p>
            </div>
          </div>

          <div className="trainer-grid">
            {trainers.map((trainer, index) => (
              <article className="trainer-card" key={trainer}>
                <div className="trainer-avatar">
                  {trainer === "Team Rocket" ? "🚀" : "🧢"}
                </div>
                <div>
                  <span className="trainer-number">
                    TREINADOR #{String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{trainer}</h3>
                </div>
              </article>
            ))}
          </div>
          <p className="trainer-note">
            Esta seção apresenta os nomes dos treinadores.
            Para exibir insígnias e equipes, conecte os dados
            correspondentes do arquivo JSON, caso disponíveis.
          </p>
        </section>
      )}

      <footer>
        <span>◉ PokéDex</span>
        <p>Projeto acadêmico desenvolvido com React + Vite.</p>
      </footer>

      <PokemonDetails
        pokemon={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </main>
  );
}