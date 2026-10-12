import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Github,
  LoaderCircle,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { getResource, mapConcurrent } from "./api.js";
import {
  artwork,
  evolutionPaths,
  filterPokemon,
  idFromUrl,
  nameOf,
  number,
  PAGE_SIZES,
  REGIONS,
  totalStats,
  TYPES,
} from "./pokemon.js";
import { localizedError, translations } from "./translations.js";

function storedPreference(key, fallback, validValues) {
  try {
    const value = localStorage.getItem(key);
    return validValues.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function useResource(loader, dependencies) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    Promise.resolve()
      .then(loader)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [...dependencies, attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}

function Ball({ className = "" }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      alt=""
      className={className}
    />
  );
}

function TypeBadge({ type, t }) {
  const color = TYPES[type]?.[1] ?? "#777c85";
  return (
    <span className="type-badge" style={{ "--type-color": color }}>
      <span className="badge-dot" />
      {t.typeNames[type] || nameOf(type)}
    </span>
  );
}

function PokemonImage({ id, name, className = "", src, t }) {
  const [failed, setFailed] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setFailed(false);
    setFallback(false);
  }, [id, src]);

  if (failed)
    return (
      <div
        className={`image-unavailable ${className}`}
        role="img"
        aria-label={`${t.imageUnavailable}: ${name}`}
      >
        <Ball className="fallback-ball" />
      </div>
    );

  return (
    <img
      className={className}
      src={
        fallback
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
          : src || artwork(id)
      }
      alt={nameOf(name)}
      loading="lazy"
      onError={() => (fallback ? setFailed(true) : setFallback(true))}
    />
  );
}

function ErrorState({ error, retry, t }) {
  return (
    <div role="alert" className="error-state">
      <p>{localizedError(error, t)}</p>
      <button className="primary-button" onClick={retry}>
        {t.retry}
      </button>
    </div>
  );
}

function Loading({ label }) {
  return (
    <div role="status" className="loading">
      <LoaderCircle className="spin" size={20} />
      {label}
    </div>
  );
}

function PokemonCard({ pokemon, onSelect, t }) {
  const type = pokemon.types[0].type.name;
  return (
    <button
      className="pokemon-card"
      style={{ "--type-color": TYPES[type]?.[1] || "#777c85" }}
      onClick={() => onSelect(pokemon.id)}
      aria-label={`${t.openPokemon} ${nameOf(pokemon.name)}, ${number(pokemon.id)}`}
    >
      <div className="card-top">
        <span className="pokemon-number">{number(pokemon.id)}</span>
        <ArrowUpRight size={17} />
      </div>
      <div className="artwork-stage">
        <div className="artwork-disc" />
        <PokemonImage
          id={pokemon.id}
          name={pokemon.name}
          className="pokemon-art"
          src={pokemon.sprites.other?.["official-artwork"]?.front_default}
          t={t}
        />
      </div>
      <h3>{nameOf(pokemon.name)}</h3>
      <div className="type-list">
        {pokemon.types.map(({ type: entry }) => (
          <TypeBadge key={entry.name} type={entry.name} t={t} />
        ))}
      </div>
      <div className="card-footer">
        <span>
          {t.statsTotal} <b>{totalStats(pokemon)}</b>
        </span>
        <span>
          {t.discoverCard} <ChevronRight size={13} />
        </span>
      </div>
    </button>
  );
}

function Evolutions({ url, selectedId, onSelect, t }) {
  const resource = useResource(() => (url ? getResource(url) : null), [url]);

  if (resource.loading) return <Loading label={t.loadingEvolutions} />;
  if (resource.error)
    return <ErrorState error={resource.error} retry={resource.retry} t={t} />;

  const paths = evolutionPaths(resource.data?.chain);

  if (!paths.length) return <p className="muted">{t.noEvolutions}</p>;

  return (
    <div className="evolutions">
      <p className="muted small">
        {paths.length === 1 && paths[0].length === 1
          ? t.noEvolution
          : t.selectEvolution}
      </p>
      {paths.map((path, index) => (
        <div className="evolution-path" key={index}>
          {path.map((pokemon, position) => (
            <div className="evolution-step" key={pokemon.id}>
              {position > 0 && <ChevronRight size={18} />}
              <button
                className={`evolution-item ${selectedId === pokemon.id ? "selected" : ""}`}
                onClick={() => onSelect(pokemon.id)}
                aria-label={`${t.openPokemon} ${nameOf(pokemon.name)}`}
              >
                <PokemonImage
                  id={pokemon.id}
                  name={pokemon.name}
                  className="evolution-art"
                  t={t}
                />
                <span className="muted small">{number(pokemon.id)}</span>
                <strong>{nameOf(pokemon.name)}</strong>
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PokemonDetails({ id, onClose, onSelect, catalog, language, t }) {
  const dialog = useRef(null);
  const [tab, setTab] = useState("overview");
  const [shiny, setShiny] = useState(false);
  const pokemon = useResource(async () => {
    const species = await getResource(`pokemon-species/${id}`);
    const defaultForm = species.varieties.find((variety) => variety.is_default);
    const data = await getResource(defaultForm?.pokemon.url || `pokemon/${id}`);
    return { data, species };
  }, [id]);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    setTab("overview");
    setShiny(false);
  }, [id]);

  const data = pokemon.data?.data;
  const species = pokemon.data?.species;
  const color = TYPES[data?.types[0].type.name]?.[1] || "#e54747";
  const description =
    species?.flavor_text_entries.find(
      (entry) => entry.language.name === language,
    ) ??
    species?.flavor_text_entries.find((entry) => entry.language.name === "en");
  const genus =
    species?.genera.find((entry) => entry.language.name === language)?.genus ??
    species?.genera.find((entry) => entry.language.name === "en")?.genus;
  const index = catalog.findIndex((item) => item.id === id);
  const tabs = [
    ["overview", t.overview],
    ["stats", t.stats],
    ["evolution", t.evolution],
  ];

  function onTabKey(event, position) {
    const next =
      event.key === "ArrowRight"
        ? (position + 1) % 3
        : event.key === "ArrowLeft"
          ? (position + 2) % 3
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : null;

    if (next !== null) {
      event.preventDefault();
      setTab(tabs[next][0]);
      document.getElementById(`tab-${tabs[next][0]}`)?.focus();
    }
  }

  return (
    <dialog
      ref={dialog}
      className="detail-dialog"
      aria-labelledby="detail-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== dialog.current) return;
        const rect = dialog.current.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <button
        className="icon-button detail-close"
        aria-label={t.close}
        onClick={onClose}
        autoFocus
      >
        <X size={21} />
      </button>
      <h2 id="detail-title" className="sr-only">
        {data ? nameOf(species.name) : `Pokémon ${number(id)}`}
      </h2>
      {pokemon.loading ? (
        <Loading label={t.loading} />
      ) : pokemon.error ? (
        <ErrorState error={pokemon.error} retry={pokemon.retry} t={t} />
      ) : (
        <>
          <div className="detail-hero" style={{ "--type-color": color }}>
            <span className="pokemon-number">
              {t.nationalDex} / {number(id)}
            </span>
            <PokemonImage
              id={data.id}
              name={species.name}
              src={
                shiny
                  ? data.sprites.other?.["official-artwork"]?.front_shiny
                  : data.sprites.other?.["official-artwork"]?.front_default
              }
              className="detail-art"
              t={t}
            />
            {data.sprites.other?.["official-artwork"]?.front_shiny && (
              <button
                className={`shiny-button ${shiny ? "active" : ""}`}
                aria-pressed={shiny}
                onClick={() => setShiny((value) => !value)}
              >
                <Sparkles size={15} /> Shiny
              </button>
            )}
            <h3>{nameOf(species.name)}</h3>
            <p className="muted small">{genus}</p>
            <div className="type-list">
              {data.types.map(({ type }) => (
                <TypeBadge key={type.name} type={type.name} t={t} />
              ))}
            </div>
          </div>
          <div className="detail-tabs" role="tablist" aria-label={t.catalog}>
            {tabs.map(([key, label], position) => (
              <button
                id={`tab-${key}`}
                role="tab"
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                tabIndex={tab === key ? 0 : -1}
                onKeyDown={(event) => onTabKey(event, position)}
                key={key}
                onClick={() => setTab(key)}
                className={tab === key ? "active" : ""}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="detail-content"
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
          >
            {tab === "overview" && (
              <>
                <p className="description" lang={description?.language.name}>
                  {description?.flavor_text.replace(/[\n\f\r]/g, " ") ||
                    t.noDescription}
                </p>
                <dl className="measurements">
                  <div className="measurement">
                    <dt>{t.height}</dt>
                    <dd>
                      {(data.height / 10).toLocaleString(
                        language === "it" ? "it-IT" : "en-US",
                      )}{" "}
                      <small>m</small>
                    </dd>
                  </div>
                  <div className="measurement">
                    <dt>{t.weight}</dt>
                    <dd>
                      {(data.weight / 10).toLocaleString(
                        language === "it" ? "it-IT" : "en-US",
                      )}{" "}
                      <small>kg</small>
                    </dd>
                  </div>
                  <div className="measurement">
                    <dt>{t.category}</dt>
                    <dd className="category-value">
                      {species.is_mythical
                        ? t.mythical
                        : species.is_legendary
                          ? t.legendary
                          : t.standard}
                    </dd>
                  </div>
                </dl>
                <h4>{t.abilities}</h4>
                <div className="abilities">
                  {data.abilities.map(({ ability, is_hidden }) => (
                    <span className="ability" key={ability.name}>
                      {nameOf(ability.name)}
                      {is_hidden && <small> · {t.hidden}</small>}
                    </span>
                  ))}
                </div>
              </>
            )}
            {tab === "stats" && (
              <div className="stats-panel">
                {data.stats.map(({ stat, base_stat }) => (
                  <div className="stat-row" key={stat.name}>
                    <span>{t.statNames[stat.name] || nameOf(stat.name)}</span>
                    <b>{base_stat}</b>
                    <meter
                      min="0"
                      max="255"
                      value={base_stat}
                      aria-label={t.statNames[stat.name] || nameOf(stat.name)}
                      style={{ "--type-color": color }}
                    >
                      {base_stat}
                    </meter>
                  </div>
                ))}
                <div className="stats-total">
                  <span>{t.statsBase}</span>
                  <span>{totalStats(data)}</span>
                </div>
              </div>
            )}
            {tab === "evolution" && (
              <Evolutions
                url={species.evolution_chain?.url}
                selectedId={id}
                onSelect={onSelect}
                t={t}
              />
            )}
          </div>
          <div className="detail-pagination">
            <button
              disabled={index <= 0}
              onClick={() => onSelect(catalog[index - 1].id)}
            >
              <ArrowLeft size={16} />
              {t.previous}
            </button>
            <span>{number(id)}</span>
            <button
              disabled={index < 0 || index >= catalog.length - 1}
              onClick={() => onSelect(catalog[index + 1].id)}
            >
              {t.next}
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("Tutte");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("number");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    Number(storedPreference("pokedex-page-size", "24", ["24", "48", "96"])),
  );
  const [selectedId, setSelectedId] = useState(null);
  const [theme, setTheme] = useState(() =>
    storedPreference("pokedex-theme", "dark", ["light", "dark"]),
  );
  const [language, setLanguage] = useState(() =>
    storedPreference("pokedex-language", "it", ["it", "en"]),
  );
  const t = translations[language];
  const search = useRef(null);
  const catalog = useResource(
    async () =>
      (await getResource("pokemon-species?limit=20000")).results.map(
        (item) => ({ id: idFromUrl(item.url), name: item.name }),
      ),
    [],
  );
  const typeResource = useResource(
    async () =>
      type
        ? new Set(
            (await getResource(`type/${type}`)).pokemon.map(({ pokemon }) =>
              idFromUrl(pokemon.url),
            ),
          )
        : null,
    [type],
  );
  const filtered = useMemo(
    () =>
      filterPokemon(catalog.data || [], {
        query,
        region,
        typeIds: typeResource.data,
        sort,
      }),
    [catalog.data, query, region, typeResource.data, sort],
  );
  const pages = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(1, pages));
  const visibleCatalog = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageIds = visibleCatalog.map((item) => item.id).join(",");
  const ready =
    !catalog.loading &&
    !catalog.error &&
    !typeResource.loading &&
    !typeResource.error;
  const cards = useResource(async () => {
    if (!ready || !pageIds) return [];
    return mapConcurrent(pageIds.split(","), (id) =>
      getResource(`pokemon/${id}`),
    );
  }, [pageIds, ready]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;

    try {
      localStorage.setItem("pokedex-theme", theme);
      localStorage.setItem("pokedex-language", language);
      localStorage.setItem("pokedex-page-size", String(pageSize));
    } catch {
      /* Preferences remain active in memory. */
    }
  }, [theme, language, pageSize]);

  useEffect(() => {
    const onKey = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "k" &&
        selectedId === null
      ) {
        event.preventDefault();
        search.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [selectedId]);

  function reset() {
    setQuery("");
    setRegion("Tutte");
    setType("");
    setSort("number");
    setPage(1);
  }

  function changePage(value) {
    setPage(value);
    document
      .getElementById("catalog-title")
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  const error = catalog.error || typeResource.error || cards.error;
  const loading = catalog.loading || typeResource.loading || cards.loading;
  const locale = language === "it" ? "it-IT" : "en-US";

  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a href="./" className="brand" aria-label="Pokédex">
            <Ball className="brand-ball" />
            <span>
              pokédex<span className="brand-dot">.</span>
            </span>
          </a>
          <div className="header-right">
            <span className="header-caption">{t.tagline}</span>
            <label className="sr-only" htmlFor="language">
              {t.selectLanguage}
            </label>
            <select
              id="language"
              className="language-select"
              aria-label={t.selectLanguage}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="it">🇮🇹 IT</option>
              <option value="en">🇬🇧 EN</option>
            </select>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? t.light : t.dark}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <a
              className="icon-button"
              href="https://github.com/Matte0398/PokedexApp"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>
      <main id="main" className="main-container">
        <section className="intro">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p className="muted intro-subtitle">{t.subtitle}</p>
          </div>
          <div className="catalog-counter">
            <Ball className="counter-ball" />
            <div>
              <strong>
                {catalog.data
                  ? catalog.data.length.toLocaleString(locale)
                  : "—"}
              </strong>
              <span>{t.discover}</span>
            </div>
          </div>
        </section>
        <section aria-label={t.filters} className="search-panel">
          <div className="filter-fields">
            <div className="search-field">
              <Search size={21} />
              <input
                ref={search}
                aria-label={t.search}
                placeholder={t.search}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  aria-label={t.clearFilters}
                >
                  <X size={17} />
                </button>
              )}
              <kbd>Ctrl K</kbd>
            </div>
            <label className="select-field">
              <span className="sr-only">{t.allTypes}</span>
              <select
                value={type}
                aria-label={t.allTypes}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">{t.allTypes}</option>
                {Object.keys(TYPES).map((key) => (
                  <option key={key} value={key}>
                    {t.typeNames[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="region-row">
            <span className="region-label">{t.region}</span>
            <div className="regions">
              {REGIONS.map((entry) => (
                <button
                  key={entry.name}
                  className={region === entry.name ? "active" : ""}
                  onClick={() => {
                    setRegion(entry.name);
                    setPage(1);
                  }}
                >
                  {entry.name === "Tutte" ? t.allRegions : entry.name}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section aria-labelledby="catalog-title">
          <div className="catalog-heading">
            <div>
              <h2 id="catalog-title">{t.catalog}</h2>
              <span className="result-count">
                {filtered.length.toLocaleString(locale)} {t.results}
              </span>
            </div>
            <div className="catalog-controls">
              <label className="sort-label">
                <span className="sr-only">{t.sortNumber}</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="number">{t.sortNumber}</option>
                  <option value="reverse">{t.sortReverse}</option>
                  <option value="name">{t.sortName}</option>
                </select>
              </label>
              <label className="sort-label">
                {t.perPage}
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {(query || region !== "Tutte" || type) && (
            <div className="filter-summary">
              <span>
                {filtered.length.toLocaleString(locale)} {t.results}
              </span>
              <button onClick={reset}>
                <X size={14} /> {t.clearFilters}
              </button>
            </div>
          )}
          {error ? (
            <ErrorState
              error={error}
              retry={
                catalog.error
                  ? catalog.retry
                  : typeResource.error
                    ? typeResource.retry
                    : cards.retry
              }
              t={t}
            />
          ) : loading ? (
            <div className="pokemon-grid">
              {Array.from({ length: Math.min(pageSize, 12) }, (_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-image" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : !filtered.length ? (
            <div className="empty-state">
              <h3>{t.noResults}</h3>
              <p className="muted">{t.noResultsText}</p>
              <button className="primary-button" onClick={reset}>
                {t.showAll}
              </button>
            </div>
          ) : (
            <>
              <div className="pokemon-grid">
                {cards.data?.map((pokemon) => (
                  <PokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    onSelect={setSelectedId}
                    t={t}
                  />
                ))}
              </div>
              <div className="pagination">
                <span className="muted small">
                  {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filtered.length)} {t.of}{" "}
                  {filtered.length.toLocaleString(locale)} Pokémon
                </span>
                <nav aria-label={t.page}>
                  <button
                    className="page-button"
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                    aria-label={t.pagePrevious}
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <span>
                    {t.page} <b>{currentPage}</b> {t.of} {pages}
                  </span>
                  <button
                    className="page-button"
                    disabled={currentPage === pages}
                    onClick={() => changePage(currentPage + 1)}
                    aria-label={t.pageNext}
                  >
                    <ArrowRight size={17} />
                  </button>
                </nav>
              </div>
            </>
          )}
        </section>
        <footer>
          <span>
            <Check size={14} />
            {t.footerSource}{" "}
            <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
              PokéAPI
            </a>
          </span>
          <p>{t.footerNote}</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
          >
            {t.backTop}
          </button>
        </footer>
      </main>
      {selectedId !== null && (
        <PokemonDetails
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onSelect={setSelectedId}
          catalog={catalog.data || []}
          language={language}
          t={t}
        />
      )}
    </>
  );
}
