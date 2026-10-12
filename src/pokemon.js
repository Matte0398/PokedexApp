export const TYPES = {
  normal: ["Normale", "#777c85"],
  fire: ["Fuoco", "#da683d"],
  water: ["Acqua", "#4589cd"],
  electric: ["Elettro", "#b99512"],
  grass: ["Erba", "#429a69"],
  ice: ["Ghiaccio", "#389caa"],
  fighting: ["Lotta", "#bc5456"],
  poison: ["Veleno", "#9e65bb"],
  ground: ["Terra", "#b7824d"],
  flying: ["Volante", "#7b91c7"],
  psychic: ["Psico", "#d96389"],
  bug: ["Coleottero", "#879d3e"],
  rock: ["Roccia", "#9f9057"],
  ghost: ["Spettro", "#7765a8"],
  dragon: ["Drago", "#6864c9"],
  dark: ["Buio", "#625e72"],
  steel: ["Acciaio", "#608994"],
  fairy: ["Folletto", "#c775a3"],
};

export const REGIONS = [
  { name: "Tutte", min: 1, max: Infinity },
  { name: "Kanto", min: 1, max: 151 },
  { name: "Johto", min: 152, max: 251 },
  { name: "Hoenn", min: 252, max: 386 },
  { name: "Sinnoh", min: 387, max: 493 },
  { name: "Unima", min: 494, max: 649 },
  { name: "Kalos", min: 650, max: 721 },
  { name: "Alola", min: 722, max: 809 },
  { name: "Galar", min: 810, max: 898 },
  { name: "Hisui", min: 899, max: 905 },
  { name: "Paldea", min: 906, max: Infinity },
];

export const PAGE_SIZES = [24, 48, 96];
export const number = (id) => `#${String(id).padStart(3, "0")}`;
export const nameOf = (name = "") =>
  name.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
export const idFromUrl = (url) => Number(url.split("/").filter(Boolean).at(-1));
export const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const totalStats = (pokemon) =>
  pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

export function filterPokemon(
  list,
  { query = "", region = "Tutte", typeIds = null, sort = "number" } = {},
) {
  const normalized = query.trim().toLowerCase().replace(/^#/, "");
  const numeric = /^\d+$/.test(normalized);
  const range = REGIONS.find((item) => item.name === region) ?? REGIONS[0];

  return list
    .filter(
      (pokemon) =>
        pokemon.id >= range.min &&
        pokemon.id <= range.max &&
        (!typeIds || typeIds.has(pokemon.id)) &&
        (!normalized ||
          (numeric
            ? pokemon.id === Number(normalized)
            : pokemon.name
                .replaceAll("-", " ")
                .includes(normalized.replaceAll("-", " ")))),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "reverse"
          ? b.id - a.id
          : a.id - b.id,
    );
}

export function evolutionPaths(chain) {
  if (!chain) return [];

  const current = {
    id: idFromUrl(chain.species.url),
    name: chain.species.name,
  };

  if (!chain.evolves_to.length) return [[current]];

  return chain.evolves_to.flatMap((child) =>
    evolutionPaths(child).map((path) => [current, ...path]),
  );
}
