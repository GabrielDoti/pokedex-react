import { PokemonCard } from "./PokemonCard";

export function PokemonList({ pokemon, onSelect }) {
  if (pokemon.length === 0) {
    return (
      <div className="empty-state">
        <span>🔎</span>
        <h3>Nenhum Pokémon encontrado</h3>
        <p>Tente outro nome, número ou tipo.</p>
      </div>
    );
  }

  return (
    <div className="pokemon-grid">
      {pokemon.map((item) => (
        <PokemonCard
          key={item.id}
          pokemon={item}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}