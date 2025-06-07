/*!
 * Berlin Wastewater Dashboard
 * Copyright (c) 2025 Alexandra von Criegern
 * Licensed under the ISC License.
 */

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

/**
 * Draws the line chart with enhanced tooltip and vertical focus line.
 * Supports both mouse and touch interactions for desktop and mobile usability.
 * @param {Array<{date: Date, value: number}>} data - Filtered data for selected station.
 * @param {Array} rawData - Full unfiltered dataset for global scaling.
 */
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

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Y-axis
  g.append("g")
    .call(d3.axisLeft(y));

  // X-axis label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Date");

  // Y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Virus Load (Average)");

  // Line generator
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  // Draw line path
  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#007acc")
    .attr("stroke-width", 2)
    .attr("d", line);

  const tooltip = d3.select("#tooltip");

  // Vertical focus line
  const focusLine = g.append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("y1", 0)
    .attr("y2", height)
    .style("opacity", 0);

  // Circles for data points
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .attr("r", 5)
    .attr("fill", "#007acc");

  // Bisector to find closest data point by date
  const bisectDate = d3.bisector(d => d.date).left;

  // Overlay rectangle to capture pointer events
  const overlay = svg.append("rect")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");

  /**
   * Updates the tooltip and focus line position based on pointer event.
   * Dynamically repositions tooltip to ensure it stays fully visible within the viewport.
   * @param {Event} event - Mouse or touch event.
   */
  function updateTooltip(event) {
    const pointer = d3.pointer(event);
    const mx = pointer[0];
    const x0 = x.invert(mx);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    let dClosest = d0;
    if (d1 && (x0 - d0.date > d1.date - x0)) dClosest = d1;

    // Update vertical focus line position
    focusLine
      .attr("x1", x(dClosest.date))
      .attr("x2", x(dClosest.date))
      .style("opacity", 1);

    // Update tooltip content
    tooltip
      .style("opacity", 1)
      .html(`
        <strong>Date:</strong> ${d3.timeFormat("%d.%m.%Y")(dClosest.date)}<br/>
        <strong>Value:</strong> ${dClosest.value.toFixed(2)}
      `);

    // Calculate tooltip dimensions and viewport size
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;

    const pageX = event.pageX;
    const pageY = event.pageY;

    const padding = 10; // Padding from viewport edges

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Position tooltip horizontally: 
    // right side if enough space, else left side
    let left = pageX + 15;
    if (left + tooltipWidth + padding > vw) {
      left = pageX - tooltipWidth - 15;
    }
    if (left < padding) left = padding;
    
    // Position tooltip vertically: 
    // center on pointer, adjust to stay in viewport
    // to avoid tooltip clipping
    let top = pageY - tooltipHeight / 2;
    if (top + tooltipHeight + padding > vh) {
      top = vh - tooltipHeight - padding;
    }
    if (top < padding) top = padding;

    // Apply final tooltip position
    tooltip.style("left", left + "px")
           .style("top", top + "px");
  }

  // Mouse events for desktop
  overlay.on("mousemove", updateTooltip)
         .on("mouseout", () => {
           focusLine.style("opacity", 0);
           tooltip.style("opacity", 0);
         });

  // Touch events for mobile
  overlay.on("touchmove", event => {
    event.preventDefault();
    updateTooltip(event);
  })
  .on("touchend", () => {
    focusLine.style("opacity", 0);
    tooltip.style("opacity", 0);
  });
}