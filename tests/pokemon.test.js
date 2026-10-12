import test from 'node:test';
import assert from 'node:assert/strict';
import { evolutionPaths, filterPokemon, PAGE_SIZES, REGIONS } from '../src/pokemon.js';
import { translations } from '../src/translations.js';

const sample = [
  { id: 1, name: 'bulbasaur' },
  { id: 25, name: 'pikachu' },
  { id: 152, name: 'chikorita' },
  { id: 906, name: 'sprigatito' }
];

test('the entire catalog is selected by default', () => {
  assert.equal(REGIONS[0].name, 'Tutte');
  assert.deepEqual(filterPokemon(sample).map((entry) => entry.id), [1, 25, 152, 906]);
});

test('filters by region, partial name, and exact number', () => {
  assert.deepEqual(filterPokemon(sample, { region: 'Kanto' }).map((entry) => entry.id), [1, 25]);
  assert.deepEqual(filterPokemon(sample, { query: 'pika' }).map((entry) => entry.id), [25]);
  assert.deepEqual(filterPokemon(sample, { query: '#025' }).map((entry) => entry.id), [25]);
});

test('supports type filters and sorting', () => {
  assert.deepEqual(filterPokemon(sample, { typeIds: new Set([25, 906]) }).map((entry) => entry.id), [25, 906]);
  assert.deepEqual(filterPokemon(sample, { sort: 'reverse' }).map((entry) => entry.id), [906, 152, 25, 1]);
  assert.deepEqual(filterPokemon(sample, { sort: 'name' }).map((entry) => entry.name), ['bulbasaur', 'chikorita', 'pikachu', 'sprigatito']);
});

test('supports the three pagination sizes', () => {
  assert.deepEqual(PAGE_SIZES, [24, 48, 96]);
});

test('both language dictionaries contain the same translation keys', () => {
  assert.deepEqual(Object.keys(translations.it).sort(), Object.keys(translations.en).sort());
  assert.deepEqual(Object.keys(translations.it.typeNames).sort(), Object.keys(translations.en.typeNames).sort());
  assert.deepEqual(Object.keys(translations.it.statNames).sort(), Object.keys(translations.en.statNames).sort());
});

test('evolution paths include branched evolutions', () => {
  const link = (id) => `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
  const chain = { species: { url: link(133), name: 'eevee' }, evolves_to: [
    { species: { url: link(134), name: 'vaporeon' }, evolves_to: [] },
    { species: { url: link(135), name: 'jolteon' }, evolves_to: [] }
  ] };
  assert.deepEqual(evolutionPaths(chain).map((path) => path.map((item) => item.name)), [['eevee','vaporeon'],['eevee','jolteon']]);
});
