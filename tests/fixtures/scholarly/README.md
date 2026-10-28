# Scholarly QA corpus

49 distinct real DOI journal records, fetched from individual Crossref works endpoints on October 28, 2026. The frozen JSON contains the selected original metadata, retrieval URL/time and SHA-256. No abstracts/full texts are archived. Metadata registration is not independent peer-review, access, quality, or claim verification.

Coverage: 7 explicit article numbers, 1 naturally missing author list, 7 missing issues, and 11 author lists longer than 20; capitalization and non-ASCII names are retained. Missing title/year/journal cases in tests are explicitly synthetic omissions of a real source, not extra real records. DOI URL/case/encoding variants are generated from the frozen records and are not counted as distinct sources.

Run npm test offline for normalization, integrity, round-trip and citation invariant checks. The corpus is not 49 independently certified APA/MLA reference strings. Exact expected citations for selected official APA examples and an MLA core-template case are separately asserted in tests/corpus.test.ts, with manual capitalization corrections explicitly marked.

To reproduce acquisition from scratch, copy this project to a disposable folder, remove only the generated crossref-records.json there, and run node scripts/refresh-scholarly-dataset.mjs. The script resumes existing snapshots, paces requests, retries 429/timeouts, records failures, and requires >=40 successful records. Live metadata can change; it will not necessarily reproduce the historical bytes. Never replace the committed snapshot without reviewing provenance, coverage and tests. No API key or paid endpoint is used.

| DOI | Snapshot title | Coverage flags |
|---|---|---|
| [10.1002/andp.19053221004](https://doi.org/10.1002/andp.19053221004) | Zur Elektrodynamik bewegter Körper |  |
| [10.1007/bf01397280](https://doi.org/10.1007/bf01397280) | �ber den anschaulichen Inhalt der quantentheoretischen Kinematik und Mechanik |  |
| [10.1016/j.caeai.2022.100049](https://doi.org/10.1016/j.caeai.2022.100049) | Artificial intelligence in early childhood education: A scoping review | no issue; article number |
| [10.1016/j.chb.2017.02.038](https://doi.org/10.1016/j.chb.2017.02.038) | How do older and young adults start searching for information? Impact of age, domain knowledge and problem complexity on the different steps of information searching | no issue |
| [10.1016/j.uclim.2025.102290](https://doi.org/10.1016/j.uclim.2025.102290) | Urban stormwater resilience: Global insights and strategies for climate adaptation | no issue; article number |
| [10.1016/s0140-6736(20)30183-5](https://doi.org/10.1016/s0140-6736(20)30183-5) | Clinical features of patients infected with 2019 novel coronavirus in Wuhan, China | 21+ authors |
| [10.1016/s0140-6736(20)30566-3](https://doi.org/10.1016/s0140-6736(20)30566-3) | Clinical course and risk factors for mortality of adult inpatients with COVID-19 in Wuhan, China: a retrospective cohort study |  |
| [10.1017/s0144686x20001932](https://doi.org/10.1017/s0144686x20001932) | Ageing consumers and e-commerce activities |  |
| [10.1037/cbs0000411](https://doi.org/10.1037/cbs0000411) | Is the goal intrinsic or extrinsic? Examining self-determination theory researchers’ and the general publics’ perceptions of exercise goals. |  |
| [10.1037/ppm0000185](https://doi.org/10.1037/ppm0000185) | Emotions in storybooks: A comparison of storybooks that represent ethnic and racial groups in the United States. |  |
| [10.1038/171737a0](https://doi.org/10.1038/171737a0) | Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid |  |
| [10.1038/35057062](https://doi.org/10.1038/35057062) | Initial sequencing and analysis of the human genome | 21+ authors |
| [10.1038/nature12373](https://doi.org/10.1038/nature12373) | Nanometre-scale thermometry in a living cell |  |
| [10.1038/nature14236](https://doi.org/10.1038/nature14236) | Human-level control through deep reinforcement learning |  |
| [10.1038/nature14539](https://doi.org/10.1038/nature14539) | Deep learning |  |
| [10.1038/nature16961](https://doi.org/10.1038/nature16961) | Mastering the game of Go with deep neural networks and tree search |  |
| [10.1038/nature24270](https://doi.org/10.1038/nature24270) | Mastering the game of Go without human knowledge |  |
| [10.1038/nbt.1754](https://doi.org/10.1038/nbt.1754) | Integrative genomics viewer |  |
| [10.1038/nbt.2954](https://doi.org/10.1038/nbt.2954) | A genealogy of the citrus family |  |
| [10.1038/nmeth.1226](https://doi.org/10.1038/nmeth.1226) | Mapping and quantifying mammalian transcriptomes by RNA-Seq |  |
| [10.1038/nmeth.1618](https://doi.org/10.1038/nmeth.1618) | Points of view: Color blindness |  |
| [10.1038/nmeth.1923](https://doi.org/10.1038/nmeth.1923) | Fast gapped-read alignment with Bowtie 2 |  |
| [10.1038/nmeth.2019](https://doi.org/10.1038/nmeth.2019) | Fiji: an open-source platform for biological-image analysis |  |
| [10.1038/nmeth.2109](https://doi.org/10.1038/nmeth.2109) | jModelTest 2: more models, new heuristics and parallel computing |  |
| [10.1038/nmeth.3317](https://doi.org/10.1038/nmeth.3317) | HISAT: a fast spliced aligner with low memory requirements |  |
| [10.1038/s41586-020-2649-2](https://doi.org/10.1038/s41586-020-2649-2) | Array programming with NumPy | 21+ authors |
| [10.1038/s41586-021-03819-2](https://doi.org/10.1038/s41586-021-03819-2) | Highly accurate protein structure prediction with AlphaFold | 21+ authors |
| [10.1056/nejmoa2021436](https://doi.org/10.1056/nejmoa2021436) | Dexamethasone in Hospitalized Patients with Covid-19 |  |
| [10.1056/nejmoa2034577](https://doi.org/10.1056/nejmoa2034577) | Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine | 21+ authors |
| [10.1056/nejmoa2035389](https://doi.org/10.1056/nejmoa2035389) | Efficacy and Safety of the mRNA-1273 SARS-CoV-2 Vaccine | 21+ authors |
| [10.1093/bioinformatics/btp163](https://doi.org/10.1093/bioinformatics/btp163) | Biopython: freely available Python tools for computational molecular biology and bioinformatics |  |
| [10.1093/bioinformatics/btu170](https://doi.org/10.1093/bioinformatics/btu170) | Trimmomatic: a flexible trimmer for Illumina sequence data |  |
| [10.1093/geroni/igaf122.2051](https://doi.org/10.1093/geroni/igaf122.2051) | Living Well With Cognitive Impairment: Social Connection, Well-Being, and Cognition in Very Old Age | article number |
| [10.1093/nar/gkaa1100](https://doi.org/10.1093/nar/gkaa1100) | UniProt: the universal protein knowledgebase in 2021 | 21+ authors |
| [10.1093/nar/gks1219](https://doi.org/10.1093/nar/gks1219) | The SILVA ribosomal RNA gene database project: improved data processing and web-based tools |  |
| [10.1093/nar/gky1121](https://doi.org/10.1093/nar/gky1121) | IRES-dependent ribosome repositioning directs translation of a +1 overlapping ORF that enhances viral infection |  |
| [10.1103/physrevlett.116.061102](https://doi.org/10.1103/physrevlett.116.061102) | Observation of Gravitational Waves from a Binary Black Hole Merger | article number; 21+ authors |
| [10.1126/science.1058040](https://doi.org/10.1126/science.1058040) | The Sequence of the Human Genome | 21+ authors |
| [10.1126/science.1156409](https://doi.org/10.1126/science.1156409) | Genetic Mapping in Human Disease |  |
| [10.1126/science.1258096](https://doi.org/10.1126/science.1258096) | The new frontier of genome engineering with CRISPR-Cas9 | article number |
| [10.1126/science.169.3946.635](https://doi.org/10.1126/science.169.3946.635) | The Structure of Ordinary Water |  |
| [10.1136/bmj.l4898](https://doi.org/10.1136/bmj.l4898) | RoB 2: a revised tool for assessing risk of bias in randomised trials | no issue; 21+ authors |
| [10.1136/bmj.n71](https://doi.org/10.1136/bmj.n71) | The PRISMA 2020 statement: an updated guideline for reporting systematic reviews | no issue; 21+ authors |
| [10.1186/1471-2105-10-421](https://doi.org/10.1186/1471-2105-10-421) | BLAST+: architecture and applications | article number |
| [10.1371/journal.pmed.0020124](https://doi.org/10.1371/journal.pmed.0020124) | Why Most Published Research Findings Are False | e-locator in page |
| [10.1371/journal.pmed.1000097](https://doi.org/10.1371/journal.pmed.1000097) | Preferred Reporting Items for Systematic Reviews and Meta-Analyses: The PRISMA Statement | e-locator in page |
| [10.1371/journal.pone.0193972](https://doi.org/10.1371/journal.pone.0193972) | Teaching medicine with the help of “Dr. House” | e-locator in page |
| [10.33184/dokbsu-2018.1.8](https://doi.org/10.33184/dokbsu-2018.1.8) | Connection of the visual system functional condition with person social well-being | no deposited authors; no issue |
| [10.3389/fpsyg.2018.00072](https://doi.org/10.3389/fpsyg.2018.00072) | Environmental Physiology and Diving Medicine | no issue; article number |
