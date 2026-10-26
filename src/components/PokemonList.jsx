import { useCallback, useEffect, useState } from "react";
import { PokemonModel } from "./PokemonModel";
import "./PokemonCarousel.css";

const TYPE_COLORS = {
  fire: "#ff795e",
  water: "#55b9ff",
  grass: "#73d99a",
  electric: "#ffd65a",
  psychic: "#ff83bd",
  ghost: "#a996ff",
  bug: "#b8d957",
  normal: "#c6ced8",
  poison: "#c58aff",
  ground: "#d7ad79",
  fairy: "#ffadd7",
  fighting: "#f18b7d",
  rock: "#c6b18d",
  steel: "#aebdca",
  ice: "#83e8f2",
  dragon: "#9a91ff",
  dark: "#8b95a8",
  flying: "#9bcaff",
};

const getTypeColor = (pokemon) => {
  const type = pokemon?.types?.[0]?.name?.toLowerCase();
  return TYPE_COLORS[type] ?? "#a78bfa";
};

const getSprite = (pokemon) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

const pad = (id) => String(id).padStart(3, "0");

const STATS = [
  ["HP", "hp"],
  ["ATK", "attack"],
  ["DEF", "defense"],
  ["SP.ATK", "specialAttack"],
  ["SP.DEF", "specialDefense"],
  ["SPD", "speed"],
];

function SideSlot({ pokemon, side, onClick }) {
  if (!pokemon) return <div className="pk-side pk-side-empty" />;

  return (
    <button
      type="button"
      className={`pk-side pk-side-${side}`}
      onClick={onClick}
      style={{ "--side-color": getTypeColor(pokemon) }}
      aria-label={`${side === "prev" ? "Anterior" : "Próximo"}: ${pokemon.name}`}
    >
      <span className="pk-side-label">
        {side === "prev" ? "‹ ANTERIOR" : "PRÓXIMO ›"}
      </span>
      {/* key força a animação de entrada quando o vizinho muda */}
      <img key={pokemon.id} src={getSprite(pokemon)} alt="" />
      <span className="pk-side-number">#{pad(pokemon.id)}</span>
      <span className="pk-side-name">{pokemon.name}</span>
    </button>
  );
}

export function PokemonList({ pokemon = [], onSelect }) {
  const [selectedId, setSelectedId] = useState(null);
  const total = pokemon.length;

  // Se o filtro mudar e o escolhido sumir da lista, volta pro primeiro.
  const foundIndex = pokemon.findIndex((item) => item.id === selectedId);
  const index = foundIndex >= 0 ? foundIndex : 0;
  const selected = pokemon[index] ?? null;

  // Carrossel circular: depois do último volta pro primeiro.
  // Com só 2 Pokémon, mostra apenas o "próximo" pra não repetir o mesmo dos dois lados.
  const prevItem = total > 2 ? pokemon[(index - 1 + total) % total] : null;
  const nextItem =
    total > 1 ? pokemon[(index + 1) % total] : null;

  const goTo = useCallback(
    (item) => item && setSelectedId(item.id),
    []
  );

  // Os botões físicos da carcaça (D-pad e A) mandam eventos pra cá.
  useEffect(() => {
    const onNav = (event) =>
      goTo(event.detail === "prev" ? prevItem : nextItem);
    const onOpen = () => selected && onSelect?.(selected);

    window.addEventListener("dex:nav", onNav);
    window.addEventListener("dex:open", onOpen);

    return () => {
      window.removeEventListener("dex:nav", onNav);
      window.removeEventListener("dex:open", onOpen);
    };
  }, [prevItem, nextItem, selected, onSelect, goTo]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(prevItem);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(nextItem);
    } else if (event.key === "Enter" && selected) {
      onSelect?.(selected);
    }
  };

  if (total === 0) {
    return (
      <div className="empty-state">
        <span>⌕</span>
        <h3>Nenhum Pokémon encontrado</h3>
        <p>Tente outro nome, número ou tipo.</p>
      </div>
    );
  }

  const color = getTypeColor(selected);
  const types = selected.types ?? [];

  return (
    <section
      className="pk-carousel"
      style={{ "--pokemon-color": color }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Carrossel de Pokémon. Use as setas do teclado para navegar."
    >
      <div className="pk-counter">
        <span>REGISTRO</span>
        <strong>
          {pad(selected.id)} <em>/ {total}</em>
        </strong>
      </div>

      <div className="pk-stage">
        <SideSlot
          pokemon={prevItem}
          side="prev"
          onClick={() => goTo(prevItem)}
        />

        <div className="pk-center">
          <div className="pk-holo-ring" aria-hidden="true" />

          <div className="pk-holo" key={selected.id}>
            <PokemonModel
              pokemon={selected}
              fallbackImage={getSprite(selected)}
            />
          </div>

          <div className="pk-platform" aria-hidden="true" />
        </div>

        <SideSlot
          pokemon={nextItem}
          side="next"
          onClick={() => goTo(nextItem)}
        />
      </div>

      <div className="pk-info" key={`info-${selected.id}`}>
        <span className="pk-info-number">Nº {pad(selected.id)}</span>
        <h3>{selected.name}</h3>

        <div className="pk-types">
          {types.length > 0 ? (
            types.map((type) => (
              <span
                key={type.id ?? type.name}
                style={{
                  "--badge-color":
                    TYPE_COLORS[type.name?.toLowerCase()] ?? "#a78bfa",
                }}
              >
                {type.name}
              </span>
            ))
          ) : (
            <span style={{ "--badge-color": "#a78bfa" }}>Desconhecido</span>
          )}
        </div>

        <div className="pk-stats">
          {STATS.map(([label, key]) => {
            const value = selected.stats?.[key] ?? 0;
            return (
              <div className="pk-stat" key={key}>
                <span>{label}</span>
                <strong>{value}</strong>
                <div className="pk-stat-track">
                  <div
                    className="pk-stat-fill"
                    style={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="pk-details-button"
          onClick={() => onSelect?.(selected)}
        >
          ABRIR FICHA COMPLETA <span>↗</span>
        </button>

        <p className="pk-hint">← → para navegar · Enter para abrir a ficha</p>
      </div>
    </section>
  );
}