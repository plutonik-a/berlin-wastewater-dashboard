/*!
 * Berlin Wastewater Dashboard
 * Copyright (c) 2025 Alexandra von Criegern
 * Licensed under the ISC License.
 */

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Loads measurement data from the Express API endpoint.
 * Expects the JSON response to be an array of data entries.
 *
 * If the request fails or the response is not in the expected format,
 * an error is thrown with a meaningful message including HTTP status info.
 *
 * @returns {Promise<{rawData: Array}>} Promise resolving to an object containing the raw data array.
 * @throws {Error} If the fetch fails, the response is not OK, or the response body is not an array.
 */
export async function loadData() {
  const response = await fetch("/api/data");

  if (!response.ok) {
    let errorMsg = `Failed to load data (HTTP ${response.status} ${response.statusText})`;
    try {
      const err = await response.json();
      if (err && err.error) {
        errorMsg = `${err.error} (HTTP ${response.status} ${response.statusText})`;
      }
    } catch (e) {
      console.error("Failed to parse error response as JSON:", e);
    }
    throw new Error(errorMsg);
  }

  const raw = await response.json();

  if (!Array.isArray(raw)) {
    throw new Error("API response is not an array");
  }

  return { rawData: raw };
}

/**
 * Extracts unique station names from raw data.
 * Returns an empty array if input is invalid.
 * @param {Array} rawData - The full dataset loaded from the API.
 * @returns {Array<string>} List of unique station names.
 */
export function getStations(rawData) {
  if (!Array.isArray(rawData)) {
    console.warn("getStations called with invalid rawData:", rawData);
    return [];
  }
  return [...new Set(rawData.map(d => d.measuring_point))];
}

/**
 * Filters data by the selected measuring station and calculates average value per date.
 * Filters out entries with invalid dates or missing values.
 * @param {Array} rawData - The full dataset loaded from the API.
 * @param {string} station - The station name to filter data for.
 * @returns {Array<{date: Date, value: number}>} Filtered and processed data ready for visualization.
 */
export function filterDataByStation(rawData, station) {
  if (!Array.isArray(rawData)) {
    console.warn("filterDataByStation called with invalid rawData:", rawData);
    return [];
  }
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