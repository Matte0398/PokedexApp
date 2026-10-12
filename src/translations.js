export const translations = {
  it: {
    tagline: 'La tua guida al mondo Pokémon', eyebrow: 'IL MONDO POKÉMON, A PORTATA DI MANO',
    title: 'Ogni Pokémon, una scoperta.', subtitle: 'Esplora le regioni. Conosci i tuoi preferiti. Trovali tutti.',
    discover: 'Pokémon da scoprire', search: 'Cerca Pokémon per nome o numero', allRegions: 'Tutte',
    region: 'REGIONI', allTypes: 'Tutti i tipi', catalog: 'Esplora il Pokédex', results: 'risultati',
    sortNumber: 'Numero crescente', sortReverse: 'Numero decrescente', sortName: 'Nome A–Z',
    clearFilters: 'Cancella filtri', noResults: 'Nessun Pokémon trovato', noResultsText: 'Prova un altro nome o numero oppure modifica i filtri.',
    showAll: 'Mostra tutti i Pokémon', loading: 'Caricamento Pokémon…', loadingEvolutions: 'Caricamento evoluzioni…',
    retry: 'Riprova', timeout: 'La richiesta sta impiegando troppo tempo. Riprova.',
    network: 'Non è stato possibile contattare PokéAPI. Controlla la connessione e riprova.',
    perPage: 'Pokémon per pagina', page: 'Pagina', of: 'di', previous: 'Precedente', next: 'Successivo',
    statsTotal: 'Totale statistiche', discoverCard: 'Scopri',
    overview: 'Panoramica', stats: 'Statistiche', evolution: 'Evoluzioni',
    nationalDex: 'POKÉDEX NAZIONALE', height: 'Altezza', weight: 'Peso', category: 'Categoria',
    legendary: 'Leggendario', mythical: 'Misterioso', standard: 'Standard', abilities: 'Abilità', hidden: 'nascosta',
    statsBase: 'Totale statistiche base', noDescription: 'Descrizione non disponibile per questa specie.',
    noEvolutions: 'Evoluzioni non disponibili.', noEvolution: 'Questo Pokémon non ha evoluzioni.',
    selectEvolution: 'Seleziona un Pokémon per esplorare la sua scheda.',
    imageUnavailable: 'Immagine non disponibile', openPokemon: 'Apri la scheda di',
    close: 'Chiudi scheda', light: 'Attiva tema chiaro', dark: 'Attiva tema scuro',
    github: 'Progetto originale su GitHub', filters: 'Ricerca e filtri', skip: 'Vai al catalogo',
    footerSource: 'Dati da', footerNote: 'Un progetto per esplorare e imparare. Pokémon © Nintendo / Game Freak.',
    backTop: 'Torna su ↑', pagePrevious: 'Pagina precedente', pageNext: 'Pagina successiva',
    selectLanguage: 'Seleziona lingua', typeNames: Object.fromEntries([
      ['normal','Normale'],['fire','Fuoco'],['water','Acqua'],['electric','Elettro'],['grass','Erba'],['ice','Ghiaccio'],
      ['fighting','Lotta'],['poison','Veleno'],['ground','Terra'],['flying','Volante'],['psychic','Psico'],['bug','Coleottero'],
      ['rock','Roccia'],['ghost','Spettro'],['dragon','Drago'],['dark','Buio'],['steel','Acciaio'],['fairy','Folletto']
    ]),
    statNames: { hp:'PS', attack:'Attacco', defense:'Difesa', 'special-attack':'Attacco speciale', 'special-defense':'Difesa speciale', speed:'Velocità' }
  },
  en: {
    tagline: 'Your guide to the Pokémon world', eyebrow: 'THE POKÉMON WORLD AT YOUR FINGERTIPS',
    title: 'Every Pokémon, a discovery.', subtitle: 'Explore the regions. Meet your favorites. Discover them all.',
    discover: 'Pokémon to discover', search: 'Search Pokémon by name or number', allRegions: 'All',
    region: 'REGIONS', allTypes: 'All types', catalog: 'Explore the Pokédex', results: 'results',
    sortNumber: 'Number ascending', sortReverse: 'Number descending', sortName: 'Name A–Z',
    clearFilters: 'Clear filters', noResults: 'No Pokémon found', noResultsText: 'Try another name or number, or change the filters.',
    showAll: 'Show all Pokémon', loading: 'Loading Pokémon…', loadingEvolutions: 'Loading evolutions…',
    retry: 'Retry', timeout: 'The request took too long. Please retry.',
    network: 'Could not reach PokéAPI. Check your connection and try again.',
    perPage: 'Pokémon per page', page: 'Page', of: 'of', previous: 'Previous', next: 'Next',
    statsTotal: 'Total stats', discoverCard: 'Discover',
    overview: 'Overview', stats: 'Stats', evolution: 'Evolutions',
    nationalDex: 'NATIONAL POKÉDEX', height: 'Height', weight: 'Weight', category: 'Category',
    legendary: 'Legendary', mythical: 'Mythical', standard: 'Standard', abilities: 'Abilities', hidden: 'hidden',
    statsBase: 'Base stats total', noDescription: 'No description available for this species.',
    noEvolutions: 'No evolutions available.', noEvolution: 'This Pokémon has no evolutions.',
    selectEvolution: 'Select a Pokémon to view its details.',
    imageUnavailable: 'Image unavailable', openPokemon: 'View details for',
    close: 'Close details', light: 'Enable light theme', dark: 'Enable dark theme',
    github: 'Original project on GitHub', filters: 'Search and filters', skip: 'Skip to catalog',
    footerSource: 'Data from', footerNote: 'A project to explore and learn. Pokémon © Nintendo / Game Freak.',
    backTop: 'Back to top ↑', pagePrevious: 'Previous page', pageNext: 'Next page',
    selectLanguage: 'Select language', typeNames: Object.fromEntries([
      ['normal','Normal'],['fire','Fire'],['water','Water'],['electric','Electric'],['grass','Grass'],['ice','Ice'],
      ['fighting','Fighting'],['poison','Poison'],['ground','Ground'],['flying','Flying'],['psychic','Psychic'],['bug','Bug'],
      ['rock','Rock'],['ghost','Ghost'],['dragon','Dragon'],['dark','Dark'],['steel','Steel'],['fairy','Fairy']
    ]),
    statNames: { hp:'HP', attack:'Attack', defense:'Defense', 'special-attack':'Sp. Attack', 'special-defense':'Sp. Defense', speed:'Speed' }
  }
};

export function localizedError(error, messages) {
  return messages[error?.message] || messages.network;
}
