/*!
 * Berlin Wastewater Dashboard
 * Copyright (c) 2025 Alexandra von Criegern
 * Licensed under the ISC License.
 */

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { loadData, filterDataByStation, getStations } from "./dataLoader.js";
import { drawChart } from "./chart.js";

/**
 * Main entry point: loads data from API, populates the station dropdown,
 * sets up the change event handler on the dropdown to update the chart,
 * and renders the initial chart for the first station.
 */
loadData()
  .then(({ rawData }) => {
    //console.log("Example raw:", rawData[0]);
    //console.log("API response:", rawData);
    const stations = getStations(rawData);

    const select = d3.select("#stationSelect");
    select.selectAll("option")
      .data(stations)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);

    select.on("change", event => {
      const selectedStation = event.target.value;
      const filtered = filterDataByStation(rawData, selectedStation);
      drawChart(filtered, rawData);
    });

    const initialData = filterDataByStation(rawData, stations[0]);
    drawChart(initialData, rawData);
  })
  .catch(error => {
    console.error("Failed to load data:", error);
    document.getElementById('error-message').textContent = "Failed to load data.";
  });