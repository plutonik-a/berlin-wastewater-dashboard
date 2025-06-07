import { loadData, filterDataByStation, getStations } from "./dataLoader.js";
import { drawChart } from "./chart.js";

loadData().then(({ rawData }) => {
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

  // initial chart
  const initialData = filterDataByStation(rawData, stations[0]);
  drawChart(initialData, rawData);
});