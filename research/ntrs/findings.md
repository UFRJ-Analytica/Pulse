# NTRS EDA: findings

Nov 1, 2026 · @Sylvio

## Source and scope

We collected 41,866 unique documents from the NASA Technical Reports Server (NTRS), covering 96.9% of the scope available through the API.

The scope is the Life Sciences division of the NASA STI category scheme, except Exobiology, plus Space Radiation. The criterion uses NASA's own classification instead of search terms chosen by the team. The full NTRS holds 648,500 documents, mostly aeronautics, propulsion and materials.

| Category | Documents in the API | Collected | Mode |
| --- | --- | --- | --- |
| Aerospace Medicine | 8,278 | 8,278 | Full |
| Behavioral Sciences | 2,079 | 2,079 | Full |
| Space Radiation | 9,618 | 9,618 | Full |
| Life Sciences (General) | 11,835 | 10,960 | Sliced by date |
| Man/System Technology and Life Support | 12,107 | 11,627 | Sliced by date |

The API does not paginate past record 10,000. The two largest categories were split by publication date range, and the 1,355 undated documents were left out. Documents in more than one category were counted once.

## EDA steps

The analysis had two stages: collection through the API and corpus exploration in a notebook.

1. **Collection:** API test, choice of categories from NASA's classification and full download, slicing by date to work around the pagination limit.
2. **Quality:** fill rate of each field and identification of record inconsistencies.
3. **Cleaning:** extraction of year, center, standardized categories, number of authors and full-text link.
4. **Composition:** distribution by year, document type, category and center.
5. **Indicators:** search for each challenge indicator's terms in titles and abstracts.
6. **Topics:** topic modeling (TF-IDF and NMF) over the abstracts, to see what the corpus covers beyond the categories.
7. **Numeric values:** extraction of numbers with units (mmHg, bpm, mSv etc.), first unfiltered and then requiring the indicator term nearby.
8. **Subject:** classification of candidates into human, animal or cell studies.
9. **Full text:** the same extraction applied to 237 downloaded documents, to measure the gain over abstracts.

## Composition

The corpus is old and mostly lacks full text: the median publication year is 1994, and only 54% of documents have the text available.

- **Time:** documents from 1958 to 2026. Annual volume drops after 2017, from over 700 to 150–230 per year. Peaks in 1975, 1985 and 1992 match conference proceedings loads.
- **Full text:** ranges from 20% to 60% until 2009 and exceeds 90% from 2010 on.
- **Centers:** JSC (17%) is the main research center. The code `CDMS` appears in 53% of records but is not a center.

| Document type | Documents | % of corpus | % with full text |
| --- | --- | --- | --- |
| REPRINT | 12,248 | 29 | 5 |
| CONFERENCE_PAPER | 8,570 | 20 | 58 |
| OTHER | 7,129 | 17 | 83 |
| PRESENTATION | 3,256 | 8 | 97 |
| ABSTRACT | 3,123 | 7 | 45 |
| CONTRACTOR_REPORT | 2,578 | 6 | 98 |
| TECHNICAL_MEMORANDUM | 1,251 | 3 | 99 |

REPRINT, the most common type, almost never has full text. NASA's own reports (CONTRACTOR_REPORT, TECHNICAL_MEMORANDUM, TECHNICAL_PUBLICATION) have text in nearly every case. PRESENTATION has a median abstract of 31 words.

## Quality

The abstract is present in 96% of documents, but the source has record inconsistencies that require cleaning before any use.

| Field | % filled |
| --- | --- |
| Title, categories, type, center | 100 |
| Abstract | 96 |
| Authors and publication date | 96 |
| Downloadable file | 54 |
| Keywords | 24 |

Issues found:

- The same category appears with different spellings ("And" and "and"). The API filter treats them as different.
- Author names are not standardized ("Cucinotta, F. A." and "Cucinotta, Francis A.").
- Center codes that are not centers: `CDMS` (53%) and `2230`.
- One invalid publication year (992). The `created` field records the system load date, not publication.
- About 5,700 abstracts have fewer than 20 words.
- Keywords in only 24% of records, not enough to map topics.

## Topics

A relevant part of the scope does not deal with human health. Topic modeling (TF-IDF and NMF, 15 topics, 35,112 abstracts with 30 or more words) separates three groups:

| Group | Topics | Likely origin |
| --- | --- | --- |
| Human health | Exercise and cardiovascular, bone loss, radiation dose, motion sickness, crew health on missions | Aerospace Medicine, Behavioral Sciences |
| Engineering and systems | Control, performance and software (the largest topic, 7,902 documents), life support and water | Man/System |
| Out of scope | Astrophysics (cosmic rays, X-rays and gamma rays, solar wind), cell biology, plant growth | Space Radiation, Life Sciences |

The crew health topic gains weight in recent decades, while astrophysics loses it.

## Challenge indicators

About 75% of documents mention none of the challenge indicators. The useful core (some indicator, published since 2000, with full text) has 2,629 documents.

| Indicator | Documents since 2000 with full text |
| --- | --- |
| Radiation | 1,497 |
| Bone | 467 |
| Muscle | 316 |
| Mood and behavior | 257 |
| Blood pressure | 223 |
| Sleep | 221 |
| Heart rate | 143 |
| Blood glucose | 40 |
| Body temperature | 35 |

The indicators were the examples from the challenge statement (blood pressure, heart rate, blood glucose, temperature, sleep, mood) plus bone, muscle and radiation. Radiation dominates because of the Space Radiation category. A document can mention several indicators.

## Numeric values and thresholds

Only 2% of abstracts contain numbers with indicator units, and most of them do not refer to the indicator. With a context filter, 211 documents remain.

The raw extraction accepts any number followed by the unit. The contextual one requires an indicator term nearby (e.g., mmHg near *blood pressure* or *systolic*).

| Unit | Indicator | Occurrences (raw) | Occurrences (contextual) | % kept |
| --- | --- | --- | --- | --- |
| mmHg | Blood pressure | 725 | 155 | 21 |
| mGy/Gy | Radiation | 462 | 12 | 3 |
| °C | Body temperature | 410 | 20 | 5 |
| bpm | Heart rate | 139 | 110 | 79 |
| mSv/Sv | Radiation | 52 | 29 | 56 |
| %/month | Bone and muscle | 19 | 17 | 89 |
| mg/dL | Blood glucose | 19 | 11 | 58 |
| h/night | Sleep | 6 | 6 | 100 |

What the filter removed: mmHg for CO2 pressure and intraocular pressure, °C for ambient and experiment temperatures, Gy for doses applied in the lab. Bone loss rates (0.5 to 2% per month) and sleep hours (4 to 6 h per night) were already in the right context.

Of the 211 candidates, 78% are human studies, 12% animal, 1% cell, 7% mixed and 2% without an identified subject. Animal cases cluster in blood pressure (14 of 100) and heart rate (8 of 65). Blood glucose has only 5 candidates, 2 of them in humans.

In the full text of 237 documents, contextual values grow from 84 to 297. The gain is concentrated in 44 documents, mainly the Human Research Program Evidence Reports (e.g., *Risk of Ionizing Radiation Carcinogenesis*, *Risk of Cardiovascular Disease*). Radiation gains the most, from 16 to 122 values.

## Limitations

- **Measurement subject:** the human, animal or cell classification relies on terms and can be wrong. "Human" appears in texts about animal models, and mixed cases need reading.
- **Relative values:** a value near the right term can be a difference ("an 8 bpm increase"), not a reference range.
- **Term search:** indicator coverage depends on the expressions used. Synonyms not included are missed.
- **Topics:** topic numbering and composition may vary across scikit-learn versions.
- **Full text:** analyzed only in the 237 downloaded documents, not in the whole corpus.
- **Scope:** health documents classified under other categories (e.g., Lunar and Planetary Exploration) were not collected.

## Possible implications

NTRS works as an evidence base about health risks, not as a source of astronaut health data. The points below are options for the team to decide, not final recommendations.

- **Health data:** NTRS has no individual astronaut measurements. If the solution needs vital signs, they must be simulated or come from another source.
- **Indicator choice:** coverage per indicator can justify which ones to monitor. Radiation, bone, muscle and blood pressure have a broad base. Body temperature and blood glucose have little.
- **Thresholds:** the HRP Evidence Reports hold the most useful values found. Outside the data, the NASA-STD-3001 standard is a source of official limits to check.
- **Sourced explanations:** if the solution cites documents, the corpus would need a subject filter (human, animal, cell) and removal of out-of-scope topics.
- **Sleep and mood:** they barely appear with values, because they are measured with scales and questionnaires. Other Space Data Atlas sources, such as OSDR and the Life Sciences Data Archive, may cover them better.

## Files

| File | Content | Where |
| --- | --- | --- |
| `ntrs_collection.ipynb` | Category collection through the API | Repository |
| `eda_ntrs.ipynb` | Full analysis, with charts and tables | Repository |
| `resultados/candidatos_limiares.csv` | 211 documents with contextual values, excerpts, subject and score | Repository |
| `resultados/valores_extraidos.csv` | One value per row, extracted from abstracts | Repository |
| `resultados/valores_texto_completo.csv` | One value per row, extracted from full text | Repository |
| `ntrs_saude.parquet` | 41,866 collected documents (48.7 MB) | Drive, `MyDrive/space-apps-2026/ntrs` |
| `eda/textos_candidatos.json.gz` | Downloaded full texts (237 documents) | Drive, regenerated by the notebook |

The notebooks read from and write to `MyDrive/space-apps-2026/ntrs`. To run them from the repository, you need that folder in Drive or must adjust the path at the top of each notebook.
