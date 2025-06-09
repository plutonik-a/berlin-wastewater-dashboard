# Berlin Wastewater Dashboard

## Project Description

This dashboard visualizes SARS-CoV-2 levels in Berlin’s wastewater to support public health monitoring through open environmental data.

Built with D3.js and a modular structure, it visualizes live data from a public API.

---

## Features

- Interactive time series visualization of viral loads at multiple sampling points  
- Dropdown menu for selecting measuring stations  
- Unified Y-axis scaling for consistent data comparison  
- Dynamic data loading via Fetch API from a custom Express backend  
- Modular JavaScript structure with clear separation of concerns  

---

## Technologies Used

- D3.js (v7) for data visualization
- HTML5 & CSS3
- d3-fetch / Fetch API for data retrieval
- Based on open data from the [Berlin Hygiene Monitor](https://hygiene-monitor.de/dashboard/corona)

---

## Setup

1. Clone the repository  
      ```bash
      git clone https://github.com/plutonik-a/berlin-wastewater-dashboard.git
      ```
2. Install dependencies:
      ```bash
      npm install
      ```
3. Start the local Express server
      ```bash
      npm start
      ```
4. Open your browser at
      ```bash
      http://localhost:3000
      ```

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