// One-off: convert udit-001/india-maps-data TopoJSON -> mobile/src/data/indiaStates.js
//
// Source data: https://github.com/udit-001/india-maps-data  (CC0 1.0 / public domain)
// TopoJSON:    https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json
// State list:  https://raw.githubusercontent.com/udit-001/india-maps-data/main/state-list.json
//
// Usage:
//   1) Install build-time deps once:  npm i --no-save --prefix %TEMP% topojson-client @turf/turf
//   2) Fetch the source files into %TEMP%:
//        curl -L https://raw.githubusercontent.com/udit-001/india-maps-data/main/topojson/india.json -o %TEMP%/india.json
//        curl -L https://raw.githubusercontent.com/udit-001/india-maps-data/main/state-list.json   -o %TEMP%/state-list.json
//   3) Run: node mobile/scripts/build-india-svg.js
//
// Output: mobile/src/data/indiaStates.js — a hand-picked equirectangular projection
// of all 36 states/UTs onto a 1000x1100 viewBox, with centroid and bbox per state.

const fs = require('fs');
const path = require('path');

// Resolved package locations (Windows %TEMP%/node_modules after the install step).
const TEMP_NODE_MODULES = 'C:/Users/shiva/AppData/Local/Temp/node_modules';
const topojson = require(path.join(TEMP_NODE_MODULES, 'topojson-client'));
const turf = require(path.join(TEMP_NODE_MODULES, '@turf/turf'));

const TOPOJSON_PATH = 'C:/Users/shiva/AppData/Local/Temp/india.json';
const STATE_LIST_PATH = 'C:/Users/shiva/AppData/Local/Temp/state-list.json';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'indiaStates.js');

const LON_MIN = 68, LON_MAX = 98;
const LAT_MIN = 6,  LAT_MAX = 38;
const VB_W = 1000, VB_H = 1100;

const topo = JSON.parse(fs.readFileSync(TOPOJSON_PATH, 'utf8'));
const stateList = JSON.parse(fs.readFileSync(STATE_LIST_PATH, 'utf8'));
const nameToSlug = Object.fromEntries(stateList.map((s) => [s.name, s.slug]));

// Prefer the 'states' layer when present (36 geometries) — otherwise fall back
// to the only available layer (e.g. districts).
const stateLayer = topo.objects.states || topo.objects[Object.keys(topo.objects)[0]];
const fc = topojson.feature(topo, stateLayer);

function project(lon, lat) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VB_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VB_H;
  return [x, y];
}

function ringToPath(ring) {
  return ring
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}

function featureToPath(feature) {
  const g = feature.geometry;
  if (g.type === 'Polygon') return g.coordinates.map(ringToPath).join(' ');
  if (g.type === 'MultiPolygon') {
    return g.coordinates.map((poly) => poly.map(ringToPath).join(' ')).join(' ');
  }
  return '';
}

const features = [];
for (const f of fc.features) {
  const props = f.properties || {};
  const name = props.NAME_1 || props.name || props.State || props.st_nm || props.NAME;
  if (!name) continue;
  const d = featureToPath(f);
  if (!d) continue;
  // For features with multiple polygons (e.g. Andaman & Nicobar Islands,
  // Puducherry's four enclaves), place the centroid on the largest polygon
  // so labels don't drift into another state.
  let labelFeature = f;
  const g = f.geometry;
  if (g.type === 'MultiPolygon' && g.coordinates.length > 1) {
    let bestArea = -1;
    let bestRing = null;
    for (const poly of g.coordinates) {
      const ring = poly[0];
      let area = 0;
      let proj = [];
      for (const [lon, lat] of ring) proj.push(project(lon, lat));
      for (let i = 0; i < proj.length - 1; i++) {
        area += proj[i][0] * proj[i + 1][1] - proj[i + 1][0] * proj[i][1];
      }
      area = Math.abs(area) / 2;
      if (area > bestArea) { bestArea = area; bestRing = ring; }
    }
    if (bestRing) {
      labelFeature = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [bestRing] }, properties: f.properties };
    }
  }
  let centroid = turf.centroid(labelFeature).geometry.coordinates;
  let bbox = turf.bbox(f);
  let w = (bbox[2] - bbox[0]) * (VB_W / (LON_MAX - LON_MIN));
  let h = (bbox[3] - bbox[1]) * (VB_H / (LAT_MAX - LAT_MIN));
  // Some UTs have degenerate source geometry (Lakshadweep is a single point
  // in this dataset). If the bbox is essentially zero, fall back to a
  // hardcoded label position at the actual geographic centre.
  if (w < 5 || h < 5) {
    const fallback = {
      'Lakshadweep': [72.5, 10.5],
      'Chandigarh':  [76.78, 30.73],
    };
    if (fallback[name]) {
      const [lon, lat] = fallback[name];
      centroid = [lon, lat];
      bbox = [lon - 0.1, lat - 0.1, lon + 0.1, lat + 0.1];
      w = (bbox[2] - bbox[0]) * (VB_W / (LON_MAX - LON_MIN));
      h = (bbox[3] - bbox[1]) * (VB_H / (LAT_MAX - LAT_MIN));
    }
  }
  const [cx, cy] = project(centroid[0], centroid[1]);
  features.push({ name, slug: nameToSlug[name] || null, d, cx, cy, w, h });
}

const ordered = stateList.map((s) => {
  const hit = features.find((f) => f.name === s.name || f.slug === s.slug);
  return hit ? { name: s.name, slug: s.slug, d: hit.d, cx: hit.cx, cy: hit.cy, w: hit.w, h: hit.h } : null;
});

console.log(`Resolved ${ordered.filter(Boolean).length}/${stateList.length} states/UTs`);

const header = `// AUTO-GENERATED from udit-001/india-maps-data (CC0 1.0 / public domain)
// Source: https://github.com/udit-001/india-maps-data  (topojson/india.json)
// Do not edit by hand; regenerate via mobile/scripts/build-india-svg.js
//
// Projection: simple equirectangular fit to a 1000x1100 viewBox.
// Each entry has a centroid (cx, cy) and bounding box (w, h) for label placement.

export const INDIA_VIEWBOX = { width: ${VB_W}, height: ${VB_H} };
export const INDIA_STATES_GEO = [
`;

const body = ordered
  .map((f, i) => {
    if (!f) return `  // ${stateList[i].name}: geometry missing in source\n`;
    return (
      `  { name: ${JSON.stringify(f.name)}, slug: ${JSON.stringify(f.slug)},` +
      ` cx: ${f.cx.toFixed(1)}, cy: ${f.cy.toFixed(1)},` +
      ` w: ${f.w.toFixed(1)}, h: ${f.h.toFixed(1)},` +
      ` d: ${JSON.stringify(f.d)} },\n`
    );
  })
  .join('');

const footer = `];
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, header + body + footer);
console.log(`Wrote ${OUTPUT_PATH} (${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)} KB)`);