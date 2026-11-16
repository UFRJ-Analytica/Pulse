# Research

Exploratory notebooks on the NASA data sources behind the Pulse Health indicators. The app does not import anything from this folder; the indicators it uses are defined in [`src/data/catalog.ts`](../src/data/catalog.ts).

| Folder | Source | Notebook | Outputs |
| --- | --- | --- | --- |
| `donki/` | DONKI (solar particle events, flares, CMEs) | `eda_donki.ipynb` | — |
| `ntrs/` | NASA Technical Reports Server | `ntrs_collection.ipynb`, `eda_ntrs.ipynb` | `resultados/`, [`findings.md`](ntrs/findings.md) |
| `osdr/` | OSDR Biological Data API | `osdr_biodata_api_eda.ipynb` | `outputs/` |
| `rad/` | MSL Curiosity RAD (NASA PDS) | `eda_rad.ipynb` | `data/`, `outputs/`, [`findings.md`](rad/findings.md) |
| `nlsp/` | NASA Life Sciences Portal | `eda_nlsp.ipynb` | `nlsp_*.csv`, `nlsp_*.json` |

Notes:

- Markdown and comments are in English. Saved cell outputs, chart labels and some generated file names are still in Portuguese, since they come from the original runs.
- API caches (`osdr/osdr_cache/`, `nlsp/nlsp_experiments_cache.json`) are not versioned; the notebooks download them again on the first run.
- The NTRS notebooks read and write to Google Drive (`MyDrive/space-apps-2026/ntrs`); adjust the path at the top to run them locally.
