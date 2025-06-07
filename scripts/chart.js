import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function drawChart(data, rawData) {
  d3.select("svg").selectAll("*").remove();

  const svg = d3.select("svg");
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const globalMax = d3.max(rawData, d =>
    d3.max(d.results?.[0]?.parameter || [], p => +p.result)
  );

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, globalMax]).nice()
    .range([height, 0]);

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y));

  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Date");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Virus Load (Average)");

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#007acc")
    .attr("stroke-width", 2)
    .attr("d", line);

  const tooltip = d3.select("#tooltip");

  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .attr("r", 5)
    .attr("fill", "#007acc")
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`📅 ${d3.timeFormat("%d.%m.%Y")(d.date)}<br>🔬 Value: ${Math.round(d.value)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
}