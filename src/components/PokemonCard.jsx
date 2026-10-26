const TYPE_COLORS = {
  fire: "#fb7185",
  water: "#60a5fa",
  grass: "#4ade80",
  electric: "#facc15",
  psychic: "#f472b6",
  ghost: "#a78bfa",
  bug: "#a3e635",
  normal: "#cbd5e1",
  poison: "#c084fc",
  ground: "#d6a76a",
  fairy: "#f9a8d4",
  fighting: "#f87171",
  rock: "#d4b483",
  steel: "#94a3b8",
  ice: "#67e8f9",
  dragon: "#818cf8",
  dark: "#64748b",
  flying: "#93c5fd",
};

export function PokemonCard({ pokemon, onSelect }) {
  const types = pokemon.types ?? [];
  const mainType = types[0]?.name ?? "Normal"; 

  const image =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
    <button
      className="pokemon-card"
      onClick={() => onSelect(pokemon)}
      style={{
        "--card-color":
            TYPE_COLORS[mainType] ?? "#a5b4fc"
      }}
      aria-label={'Ver detalhes do ${pokemon.name}'}
    >
      <span className="pokemon-id">
        #{String(pokemon.id).padStart(3, "0")}
      </span>

      <img src={image} alt={pokemon.name} loading="lazy" />

      <h3>{pokemon.name}</h3>

      <div className="type-list">
        {types.map((type) => (
          <span className="type-badge" key={type.id}>
            {type.name}
          </span>
        ))}
      </div>

      <div className="card-stats">
        <span>HP</span>
        <strong>{pokemon.stats?.hp ?? 0}</strong>
        <span>ATK</span>
        <strong>{pokemon.stats?.attack ?? 0}</strong>
        <span>DEF</span>
        <strong>{pokemon.stats?.defense ?? 0}</strong>
      </div>

      <span className="card-action">Ver detalhes →</span>
    </button>
  );
}