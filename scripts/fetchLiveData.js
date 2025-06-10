/*!
 * Berlin Wastewater Dashboard
 * Copyright (c) 2025 Alexandra von Criegern
 * Licensed under the ISC License.
 */

import fs from "fs/promises";

/**
 * API endpoint URL for fetching COVID wastewater data
 * @constant {string}
 */
const API_URL = "https://api.hygiene-monitor.de/openData/getCovidOpenDataByDateRange";

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param {Date} date - Date object to format
 * @returns {string} formatted date string
 */
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Parses a date string in 'dd.mm.yyyy' format into a Date object
 * @param {string} dateStr - date string in 'dd.mm.yyyy'
 * @returns {Date}
 */
function parseCustomDate(dateStr) {
  const [day, month, year] = dateStr.split(".");
  return new Date(`${year}-${month}-${day}`);
}

/**
 * Calculates the next monthly interval (start and end dates)
 * given the last extraction date.
 * @param {string} lastDateStr - last extraction date in 'dd.mm.yyyy'
 * @returns {{startDate: string, endDate: string}} next interval in 'YYYY-MM-DD'
 */
function getNextMonthInterval(lastDateStr) {
  const lastDate = parseCustomDate(lastDateStr);
  // next month start
  const nextMonthStart = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1);
  // first day of the month after next
  const nextNextMonthStart = new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth() + 1, 1);
  // end of next month (one day before nextNextMonthStart)
  const nextMonthEnd = new Date(nextNextMonthStart.getTime() - 1);

  return {
    startDate: formatDate(nextMonthStart),
    endDate: formatDate(nextMonthEnd),
  };
}

/**
 * Filters out duplicates from newData that are already present in existingData.
 * Duplicate definition: matching sample_number and extraction_date.
 * @param {Array} existingData - Array of existing data objects
 * @param {Array} newData - Array of new data objects to filter
 * @returns {Array} filtered new data with no duplicates
 */
function filterDuplicates(existingData, newData) {
  return newData.filter(
    (newEntry) =>
      !existingData.some(
        (existingEntry) =>
          existingEntry.sample_number === newEntry.sample_number &&
          existingEntry.extraction_date === newEntry.extraction_date
      )
  );
}

/**
 * Fetches data from the API for the given date range.
 * @param {string} startDate - Start date in 'YYYY-MM-DD'
 * @param {string} endDate - End date in 'YYYY-MM-DD'
 * @returns {Promise<Array>} Promise resolving to the API response body array
 * @throws Will throw an error if fetch fails or response is invalid
 */
async function fetchData(startDate, endDate) {
  console.log(`Fetching data from ${startDate} to ${endDate}...`);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      extraction_date_start: startDate,
      extraction_date_end: endDate,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();

  if (!json.body) {
    throw new Error("Unexpected API response format: 'body' property missing");
  }

  return json.body;
}

/**
 * Reads existing data from data.json if present and valid.
 * @returns {Promise<Array>} Promise resolving to existing data array or empty array if no valid data found
 */
async function readExistingData() {
  try {
    const dataStr = await fs.readFile("data/data.json", "utf-8");
    const data = JSON.parse(dataStr);
    if (!Array.isArray(data)) {
      throw new Error("Data is not an array");
    }
    return data;
  } catch {
    console.log("No valid existing data found.");
    return [];
  }
}

/**
 * Finds the latest extraction_date from data array.
 * @param {Array} data - Array of data objects
 * @returns {string|null} latest extraction_date in 'dd.mm.yyyy' or null if no data
 */
function findLatestExtractionDate(data) {
  if (data.length === 0) return null;

  // sort descending by extraction_date
  const sorted = data.slice().sort((a, b) => {
    return parseCustomDate(b.extraction_date) - parseCustomDate(a.extraction_date);
  });
  return sorted[0].extraction_date;
}

/**
 * Main function to fetch new data incrementally by months,
 * merge it with existing data, and save back to disk.
 */
async function fetchAllDataIncremental() {
  try {
    const existingData = await readExistingData();

    let startDate;
    let endDate;
    const todayStr = formatDate(new Date());

    if (existingData.length === 0) {
      console.log("No existing data found. Starting from Feb 2022.");
      startDate = "2022-02-01";
      // fetch initial month only
      endDate = "2022-02-28";
    } else {
      const latestExtractionDate = findLatestExtractionDate(existingData);
      if (!latestExtractionDate) {
        throw new Error("Could not determine latest extraction date from existing data");
      }
      const nextInterval = getNextMonthInterval(latestExtractionDate);

      // never go beyond today
      startDate = nextInterval.startDate;
      endDate = nextInterval.endDate > todayStr ? todayStr : nextInterval.endDate;
    }

    // fetch new data for the computed interval
    const newData = await fetchData(startDate, endDate);

    // filter duplicates before merging existing and new data
    const uniqueNewData = filterDuplicates(existingData, newData);

    if (uniqueNewData.length === 0) {
      console.log("No new unique data found for this interval.");
      return;
    }

    // merge arrays
    const combinedData = existingData.concat(uniqueNewData);

    // sort combined data by extraction_date ascending
    combinedData.sort((a, b) => parseCustomDate(a.extraction_date) - parseCustomDate(b.extraction_date));

    // write merged data back to file
    await fs.writeFile("data/data.json", JSON.stringify(combinedData, null, 2), "utf-8");

    console.log(`Data saved successfully. Total records: ${combinedData.length}`);
  } catch (error) {
    console.error("Error fetching or saving data:", error);
    process.exit(1);
  }
}

fetchAllDataIncremental();