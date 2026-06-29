// One-off: convert udit-001/india-maps-data TopoJSON → mobile/src/data/indiaStateDistricts.js
//
// Source data: https://github.com/udit-001/india-maps-data  (CC0 1.0 / public domain)
// TopoJSON:    https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json
//
// The topojson contains TWO layers — 'states' and 'districts'. We use the
// 'districts' layer here (NOT 'states') and key by the parent state name so
// the registration form can offer a state → districts drill-down.
//
// Usage:
//   1) Install build-time deps once:  npm i --no-save --prefix %TEMP% topojson-client
//   2) Fetch the source file:
//        curl -L https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json -o %TEMP%/india.json
//   3) Run: node mobile/scripts/build-india-districts.js
//
// Output: mobile/src/data/indiaStateDistricts.js — a flat name-only map
// (no geometry) suitable for embedding directly in the mobile bundle.

const fs = require('fs');
const path = require('path');

// Resolved package location (Windows %TEMP%/node_modules after the install step).
const TEMP_NODE_MODULES = 'C:/Users/shiva/AppData/Local/Temp/node_modules';
const topojson = require(path.join(TEMP_NODE_MODULES, 'topojson-client'));

const TOPOJSON_PATH = 'C:/Users/shiva/AppData/Local/Temp/india.json';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'indiaStateDistricts.js');

const topo = JSON.parse(fs.readFileSync(TOPOJSON_PATH, 'utf8'));

// The pitfall: topojson/india.json ships with multiple layers. The 'districts'
// layer (if present) has parent-state info on every feature via the 'NAME_1'
// property. If only the single combined layer is present, we still pull
// NAME_1/NAME_2 from features.
const districtLayer = topo.objects.districts || topo.objects[Object.keys(topo.objects)[0]];
if (!districtLayer) {
  console.error('No usable layer found in topojson');
  process.exit(1);
}
const fc = topojson.feature(topo, districtLayer);

// Build { stateName: Set(districtName) }. The udit-001/india-maps-data
// fork uses 'st_nm' for the state name and 'district' for the district name
// on every feature in the 'districts' layer. Other forks sometimes use
// NAME_1 / NAME_2 — try those after, in case the upstream data changes.
const getProp = (props, names) => {
  for (const n of names) if (props?.[n]) return props[n];
  return null;
};

const map = {};
let skipped = 0;
for (const f of fc.features) {
  const props = f.properties || {};
  const state = getProp(props, ['st_nm', 'NAME_1', 'state', 'ST_NAME', 'State']);
  const district = getProp(props, ['district', 'NAME_2', 'dt_name', 'DT_NAME', 'District']);
  if (!state || !district) { skipped++; continue; }
  if (!map[state]) map[state] = new Set();
  map[state].add(district);
}

// Sort states alphabetically and districts within each state, then convert
// Sets to arrays for serialization.
const sorted = {};
for (const state of Object.keys(map).sort()) {
  sorted[state] = Array.from(map[state]).sort((a, b) => a.localeCompare(b));
}

const header = `// AUTO-GENERATED from udit-001/india-maps-data (CC0 1.0 / public domain)
// Source: https://github.com/udit-001/india-maps-data  (topojson/india.json)
// Do not edit by hand; regenerate via mobile/scripts/build-india-districts.js
//
// Flat { stateName: [districtNames] } map used by the registration form's
// state → district drill-down. Names only — no geometry — so the bundle
// stays small enough to ship inline.

export const INDIA_STATE_DISTRICTS = {
`;

const body = Object.entries(sorted)
  .map(([state, districts]) => `  ${JSON.stringify(state)}: ${JSON.stringify(districts)},\n`)
  .join('');

const footer = `};
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, header + body + footer);
const sizeKb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
console.log(`Wrote ${OUTPUT_PATH} (${sizeKb} KB) — ${Object.keys(sorted).length} states/UTs, ${skipped} features skipped`);