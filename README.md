# Berlin Wastewater Dashboard

## Project Description

This project is a dashboard for visualizing SARS-CoV-2 and other potential pathogens in Berlin’s wastewater.  
It serves as a demonstrator and a starting point for working with open API data, data visualization using D3.js, and interactive web applications.

---

## Features

- Interactive time series visualization of viral loads at multiple sampling points
- Dropdown selection to choose different measuring stations
- Unified Y-axis scaling for better comparison
- Dynamic loading of JSON demo data from the Berlin Hygiene Monitor
- Tooltip showing detailed measurement values on hover

---

## Technologies Used

- D3.js (v7) for data visualization
- HTML5 & CSS3
- d3-fetch / Fetch API for data retrieval
- Based on open data from the Berlin Hygiene Monitor

---

## Setup

1. Clone the repository  
   ```bash
   git clone https://github.com/plutonik-a/berlin-wastewater-dashboard.git
   ```
2.	Install dependencies:
   ```
   npm install
   ```
3.	Start a local HTTP server (e.g. Live Server extension in VSCode)
4.	Open index.html in your browser and use the dashboard

## Data Source

The data is sourced from the Berlin Hygiene Monitor API:  
[https://api.hygiene-monitor.de/openData/getCovidOpenDataByDateRange](https://api.hygiene-monitor.de/openData/getCovidOpenDataByDateRange)

Currently available test types include:  

- RT_PCR_1 N1 (SARS-CoV-2)  
- RT_PCR_2 E-gene (SARS-CoV-2)  
- RT_PCR_3 Replicase gene of pepper mild mottle virus (PMMoV)  
- NGS Illumina  

Additional pathogens are planned for future inclusion.  

---

## License

This project is licensed under the ISC License.
See the LICENSE file for details.

---

## Contact

For questions or suggestions, feel free to open an issue or contact directly.