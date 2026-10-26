export function PokemonDetails({ pokemon, onClose }) {
  if (!pokemon) return null;

  const stats = [
    ["HP", pokemon.stats?.hp],
    ["Ataque", pokemon.stats?.attack],
    ["Defesa", pokemon.stats?.defense],
    ["Ataque especial", pokemon.stats?.specialAttack],
    ["Defesa especial", pokemon.stats?.specialDefense],
    ["Velocidade", pokemon.stats?.speed],
  ];

  const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${pokemon.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Fechar detalhes"
        >
          ✕
        </button>

        <span className="pokemon-id">
          #{String(pokemon.id).padStart(3, "0")}
        </span>

        <img
          className="details-image"
          src={image}
          alt={pokemon.name}
        />

        <h2>{pokemon.name}</h2>

        <div className="type-list">
          {pokemon.types?.map((type) => (
            <span className="type-badge" key={type.id}>
              {type.name}
            </span>
          ))}
        </div>

        <h3>Atributos</h3>

        <div className="stats-list">
          {stats.map(([label, value]) => (
            <div className="stat-row" key={label}>
              <span>{label}</span>
              <strong>{value ?? 0}</strong>
              <div className="stat-track">
                <div
                  className="stat-fill"
                  style={{
                    width: `${Math.min(
                      Number(value ?? 0) / 255 * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}