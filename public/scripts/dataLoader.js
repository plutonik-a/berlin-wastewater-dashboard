/*!
 * Berlin Wastewater Dashboard
 * Copyright (c) 2025 Alexandra von Criegern
 * Licensed under the ISC License.
 */

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Loads data from the Express API endpoint.
 * Expects the JSON to contain a 'body' property holding the data array.
 * @returns {Promise<{rawData: Array}>} Promise resolving with the raw data object containing measurement entries.
 */
export async function loadData() {
  const response = await fetch("/api/data");
  const raw = await response.json();
  return { rawData: raw.body };
}

/**
 * Extracts unique station names from raw data.
 * @param {Array} rawData - The full dataset loaded from the API.
 * @returns {Array<string>} List of unique station names.
 */
export function getStations(rawData) {
  return [...new Set(rawData.map(d => d.measuring_point))];
}

/**
 * Filters data by the selected measuring station and calculates average value per date.
 * @param {Array} rawData - The full dataset loaded from the API.
 * @param {string} station - The station name to filter data for.
 * @returns {Array<{date: Date, value: number}>} Filtered and processed data ready for visualization.
 */
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