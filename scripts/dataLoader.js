import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function loadData() {
  const raw = await d3.json("../data/demo.json");
  return { rawData: raw.body };
}

export function getStations(rawData) {
  return [...new Set(rawData.map(d => d.measuring_point))];
}

export function filterDataByStation(rawData, station) {
  return rawData
    .filter(d => d.measuring_point === station)
    .map(d => {
      const avg = d.results?.[0]?.parameter
        ?.map(p => +p.result)
        ?.filter(r => !isNaN(r));
      return {
        date: d3.timeParse("%d.%m.%Y")(d.extraction_date),
        value: avg?.length ? d3.mean(avg) : null
      };
    })
    .filter(d => d.date && d.value !== null);
}