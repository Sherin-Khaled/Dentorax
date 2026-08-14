# X Dental — Brand & Category Database Audit (READ-ONLY)

Generated: 2026-08-10
Source: live PostgreSQL development database, read directly via Prisma (`server/src/generated/prisma-client-runtime`), read-only queries only. No records were created, updated, or deleted. No schema, code, or import logic was changed.

Also written as part of this audit:
- `docs/catalogue-audit/existing-brands.json` — full machine-readable brand list (578 records)
- `docs/catalogue-audit/existing-categories.json` — full machine-readable category list (218 records, with computed `parentName`/`depth`)

---

## A. BRAND DATABASE SCHEMA

Prisma model: `Brand` (`server/prisma/schema.prisma`)

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key, internal database ID |
| `externalBrandId` | String? | Optional external/reference ID from a source system (e.g. `BR-3M`) |
| `sourceSystem` | String? | Which import pipeline/source populated this brand (e.g. `EXCEL_IMPORT`) |
| `name` | String | **Unique.** English name. This is the only name field — there is no `nameAr` on Brand. |
| `slug` | String | **Unique.** URL slug, derived from `name` |
| `country` | String? | Free-text manufacturer country (not an enum) |
| `logoUrl` | String? | Absolute URL or local path (`/brand-logos/<slug>.webp`) or a `logo.dev` fallback URL |
| `description` | String? | Optional free text |
| `featured` | Boolean | Default `false` |
| `status` | Enum `BrandStatus` | `ACTIVE` \| `INACTIVE` \| `NEEDS_LOGO` |
| `products` | Product[] | Reverse relation (`Product.brandRecord`) |
| `createdAt` / `updatedAt` | DateTime | |

Constraints:
- `@@unique([name])`, `@@unique([slug])`
- `@@unique([sourceSystem, externalBrandId])` — a brand is uniquely identified per source system by its external ID
- Indexes on `status`, `featured`, `country`

**No Arabic brand name field exists.** If the Toothpick mapping needs an Arabic brand name, the schema would need a `nameAr` column added — that is out of scope for this read-only audit and is not done here.

---

## B. ALL EXISTING BRANDS (578 total, sorted A→Z)

Full detail (including `description`, timestamps) is in `docs/catalogue-audit/existing-brands.json`. Compact table below — "Logo Source" is derived from the `logoUrl` value (`local` = `/brand-logos/...`, `logo.dev` = fallback URL, `none` = no logo yet).

| # | Name | Slug | Country | External ID | Source | Status | Featured | Products | Logo Source |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 3B Ortho | 3b-ortho | — | — | — | ACTIVE | no | 0 | logo.dev |
| 2 | 3D Shinning | 3d-shinning | — | — | — | ACTIVE | no | 0 | local |
| 3 | 3M | 3m | United States | BR-3M | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 4 | A.Uno | auno | — | — | — | ACTIVE | no | 0 | local |
| 5 | A3 Dent | a3-dent | — | — | — | ACTIVE | no | 0 | local |
| 6 | Acrostone | acrostone | — | — | — | ACTIVE | no | 0 | local |
| 7 | Acteon | acteon | — | — | — | ACTIVE | no | 0 | local |
| 8 | Aditek | aditek | — | — | — | ACTIVE | no | 0 | logo.dev |
| 9 | ADS | ads | — | — | — | ACTIVE | no | 0 | local |
| 10 | Aidite | aidite | — | — | — | ACTIVE | no | 0 | logo.dev |
| 11 | Algines | algines | — | — | — | ACTIVE | no | 0 | local |
| 12 | Allaya | allaya | — | — | — | ACTIVE | no | 0 | local |
| 13 | Alliedstar | alliedstar | — | — | — | ACTIVE | no | 0 | logo.dev |
| 14 | Alpha Aire | alpha-aire | — | — | — | ACTIVE | no | 0 | local |
| 15 | Alpha Dent | alpha-dent | — | — | — | ACTIVE | no | 0 | local |
| 16 | Alpha Endo | alpha-endo | — | — | — | ACTIVE | no | 0 | local |
| 17 | ALTTION | alttion | — | — | — | ACTIVE | no | 0 | local |
| 18 | Alyarmuk | alyarmuk | — | — | — | ACTIVE | no | 0 | logo.dev |
| 19 | AmannGirrbach | amanngirrbach | — | — | — | ACTIVE | no | 0 | logo.dev |
| 20 | Amd Lasers | amd-lasers | — | — | — | ACTIVE | no | 0 | logo.dev |
| 21 | American Orthodontics | american-orthodontics | — | — | — | ACTIVE | no | 0 | logo.dev |
| 22 | Anaconda | anaconda | — | — | — | ACTIVE | no | 0 | local |
| 23 | Angelus | angelus | — | — | — | ACTIVE | no | 0 | logo.dev |
| 24 | Anger G&A | anger-ga | — | — | — | ACTIVE | no | 0 | local |
| 25 | Anle | anle | — | — | — | ACTIVE | no | 0 | local |
| 26 | Anya | anya | — | — | — | ACTIVE | no | 0 | logo.dev |
| 27 | Aomai | aomai | — | — | — | ACTIVE | no | 0 | local |
| 28 | Apex for Medical Wears | apex-for-medical-wears | — | — | — | ACTIVE | no | 0 | local |
| 29 | Apixia | apixia | — | — | — | ACTIVE | no | 0 | logo.dev |
| 30 | Apoza | apoza | — | — | — | ACTIVE | no | 0 | local |
| 31 | Appledental | appledental | — | — | — | ACTIVE | no | 0 | local |
| 32 | AquaCare | aquacare | — | — | — | ACTIVE | no | 0 | local |
| 33 | AR Instrumed | ar-instrumed | — | — | — | ACTIVE | no | 0 | logo.dev |
| 34 | Ardet | ardet | — | — | — | ACTIVE | no | 0 | logo.dev |
| 35 | Ark Medical | ark-medical | — | — | — | ACTIVE | no | 0 | local |
| 36 | Artech | artech | — | — | — | ACTIVE | no | 0 | local |
| 37 | ArteScope | artescope | — | — | — | ACTIVE | no | 0 | local |
| 38 | Artman | artman | — | — | — | ACTIVE | no | 0 | logo.dev |
| 39 | Asa Dental | asa-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 40 | Assut Sutures | assut-sutures | — | — | — | ACTIVE | no | 0 | local |
| 41 | ATOS | atos | — | — | — | ACTIVE | no | 0 | local |
| 42 | Atria | atria | — | — | — | ACTIVE | no | 0 | local |
| 43 | Ats Dental | ats-dental | — | — | — | ACTIVE | no | 0 | local |
| 44 | B Chem | b-chem | — | — | — | ACTIVE | no | 0 | local |
| 45 | Baioden | baioden | — | — | — | ACTIVE | no | 0 | local |
| 46 | BANNA | banna | — | — | — | ACTIVE | no | 0 | local |
| 47 | Baolai | baolai | — | — | — | ACTIVE | no | 0 | local |
| 48 | Bausch | bausch | — | — | — | ACTIVE | no | 0 | logo.dev |
| 49 | Bemlase | bemlase | — | — | — | ACTIVE | no | 0 | local |
| 50 | Best | best | — | — | — | ACTIVE | no | 0 | local |
| 51 | Beta | beta | — | — | — | ACTIVE | no | 0 | local |
| 52 | Better Way | better-way | — | — | — | ACTIVE | no | 0 | local |
| 53 | Beviston | beviston | — | — | — | ACTIVE | no | 0 | logo.dev |
| 54 | Beyond | beyond | — | — | — | ACTIVE | no | 0 | logo.dev |
| 55 | BG Light LTD | bg-light-ltd | — | — | — | ACTIVE | no | 0 | logo.dev |
| 56 | Bibodent | bibodent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 57 | Bilumix | bilumix | — | — | — | ACTIVE | no | 0 | local |
| 58 | Bioclear | bioclear | — | — | — | ACTIVE | no | 0 | logo.dev |
| 59 | Biodent | biodent | — | — | — | ACTIVE | no | 0 | local |
| 60 | Bioglove | bioglove | — | — | — | ACTIVE | no | 0 | local |
| 61 | Biolase | biolase | — | — | — | ACTIVE | no | 0 | logo.dev |
| 62 | BioMTA | biomta | — | — | — | ACTIVE | no | 0 | local |
| 63 | Biotech Dental | biotech-dental | — | — | — | ACTIVE | no | 0 | local |
| 64 | Bisco | bisco | — | — | — | ACTIVE | no | 0 | logo.dev |
| 65 | Bisico | bisico | Germany | BR-BISICO | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 66 | Bitvae | bitvae | — | — | — | ACTIVE | no | 0 | local |
| 67 | Bl.Z Dental | blz-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 68 | Blancone | blancone | — | — | — | ACTIVE | no | 0 | logo.dev |
| 69 | Blu | blu | — | — | — | ACTIVE | no | 0 | local |
| 70 | BlueDent | bluedent | — | — | — | ACTIVE | no | 0 | local |
| 71 | BM4 | bm4 | — | — | — | ACTIVE | no | 0 | local |
| 72 | BMS | bms | — | — | — | ACTIVE | no | 0 | logo.dev |
| 73 | Bomedent | bomedent | — | — | — | ACTIVE | no | 0 | local |
| 74 | Bondent | bondent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 75 | Bookology | bookology | — | — | — | ACTIVE | no | 0 | local |
| 76 | Bossklein | bossklein | — | — | — | ACTIVE | no | 0 | local |
| 77 | Burite | burite | — | — | — | ACTIVE | no | 0 | local |
| 78 | Buzzy | buzzy | — | — | — | ACTIVE | no | 0 | local |
| 79 | C-k Dental | c-k-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 80 | C-Root | c-root | — | — | — | ACTIVE | no | 0 | local |
| 81 | Cameo | cameo | — | — | — | ACTIVE | no | 0 | local |
| 82 | CapKidz | capkidz | — | — | — | ACTIVE | no | 0 | local |
| 83 | Caredent | caredent | — | — | — | ACTIVE | no | 0 | local |
| 84 | Carestream | carestream | — | — | — | ACTIVE | no | 0 | logo.dev |
| 85 | Carlo De Giorgi | carlo-de-giorgi | — | — | — | ACTIVE | no | 0 | logo.dev |
| 86 | Carpo Dental | carpo-dental | — | — | — | ACTIVE | no | 0 | local |
| 87 | Castellini | castellini | — | — | — | ACTIVE | no | 0 | local |
| 88 | Cavex | cavex | Netherlands | BR-CAVEX | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 89 | Centrix | centrix | — | — | — | ACTIVE | no | 0 | logo.dev |
| 90 | Ceramic One | ceramic-one | — | — | — | ACTIVE | no | 0 | local |
| 91 | Ceyflex | ceyflex | — | — | — | ACTIVE | no | 0 | logo.dev |
| 92 | Charizard Dental | charizard-dental | — | — | — | ACTIVE | no | 0 | local |
| 93 | Cherry Dental | cherry-dental | — | — | — | ACTIVE | no | 0 | local |
| 94 | Chifa | chifa | — | — | — | ACTIVE | no | 0 | local |
| 95 | Chinese | chinese | — | — | — | ACTIVE | no | 0 | local |
| 96 | Chirana | chirana | — | — | — | ACTIVE | no | 0 | local |
| 97 | Cingol | cingol | — | — | — | ACTIVE | no | 0 | logo.dev |
| 98 | CJ Optik | cj-optik | — | — | — | ACTIVE | no | 0 | logo.dev |
| 99 | CMA | cma | — | — | — | ACTIVE | no | 0 | local |
| 100 | Codyson | codyson | — | — | — | ACTIVE | no | 0 | local |
| 101 | Coltene | coltene | Switzerland | BR-COLTENE | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 102 | Comfort-in | comfort-in | — | — | — | ACTIVE | no | 0 | local |
| 103 | Complete | complete | — | — | — | ACTIVE | no | 0 | local |
| 104 | Coral Clean | coral-clean | — | — | — | ACTIVE | no | 0 | local |
| 105 | Coredeep | coredeep | — | — | — | ACTIVE | no | 0 | local |
| 106 | Corpus Vac | corpus-vac | — | — | — | ACTIVE | no | 0 | local |
| 107 | Cotisen | cotisen | — | — | — | ACTIVE | no | 0 | logo.dev |
| 108 | COXO | coxo | — | — | — | ACTIVE | no | 0 | logo.dev |
| 109 | Crystal | crystal | — | — | — | ACTIVE | no | 0 | local |
| 110 | CX | cx | — | — | — | ACTIVE | no | 0 | local |
| 111 | Cy International | cy-international | — | — | — | ACTIVE | no | 0 | local |
| 112 | D-Perfect S | d-perfect-s | — | — | — | ACTIVE | no | 0 | local |
| 113 | D-Tech | d-tech | — | — | — | ACTIVE | no | 0 | logo.dev |
| 114 | DB | db | — | — | — | ACTIVE | no | 0 | local |
| 115 | DBA | dba | — | — | — | ACTIVE | no | 0 | local |
| 116 | De Götzen | de-gotzen | — | — | — | ACTIVE | no | 0 | logo.dev |
| 117 | Defend | defend | — | — | — | ACTIVE | no | 0 | local |
| 118 | Deger | deger | — | — | — | ACTIVE | no | 0 | local |
| 119 | DeltaMed | deltamed | — | — | — | ACTIVE | no | 0 | logo.dev |
| 120 | Dempex | dempex | — | — | — | ACTIVE | no | 0 | local |
| 121 | Denject | denject | — | — | — | ACTIVE | no | 0 | local |
| 122 | Denjoy | denjoy | — | — | — | ACTIVE | no | 0 | local |
| 123 | Denrum Orthodontic | denrum-orthodontic | — | — | — | ACTIVE | no | 0 | logo.dev |
| 124 | Dentac | dentac | — | — | — | ACTIVE | no | 0 | logo.dev |
| 125 | DentaFlux | dentaflux | — | — | — | ACTIVE | no | 0 | logo.dev |
| 126 | Dental Film | dental-film | — | — | — | ACTIVE | no | 0 | local |
| 127 | Dental Plus | dental-plus | — | — | — | ACTIVE | no | 0 | local |
| 128 | Dental Technologies | dental-technologies | — | — | — | ACTIVE | no | 0 | logo.dev |
| 129 | Dentalfarm | dentalfarm | — | — | — | ACTIVE | no | 0 | logo.dev |
| 130 | Dentamaze | dentamaze | — | — | — | ACTIVE | no | 0 | local |
| 131 | Dentaurum | dentaurum | — | — | — | ACTIVE | no | 0 | logo.dev |
| 132 | Dentax | dentax | — | — | — | ACTIVE | no | 0 | local |
| 133 | Dentech KSK | dentech-ksk | — | — | — | ACTIVE | no | 0 | logo.dev |
| 134 | dentex | dentex | — | — | — | ACTIVE | no | 0 | local |
| 135 | DentKist | dentkist | — | — | — | ACTIVE | no | 0 | local |
| 136 | Dentplus | dentplus | — | — | — | ACTIVE | no | 0 | local |
| 137 | Dentra | dentra | — | — | — | ACTIVE | no | 0 | local |
| 138 | Dentsply Sirona | dentsply-sirona | — | — | — | ACTIVE | no | 0 | logo.dev |
| 139 | Denu | denu | — | — | — | ACTIVE | no | 0 | local |
| 140 | Deppeler | deppeler | — | — | — | ACTIVE | no | 0 | logo.dev |
| 141 | Derby | derby | — | — | — | ACTIVE | no | 0 | logo.dev |
| 142 | Dexis | dexis | — | — | — | ACTIVE | no | 0 | logo.dev |
| 143 | Dharma | dharma | — | — | — | ACTIVE | no | 0 | logo.dev |
| 144 | Dia Dent | dia-dent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 145 | Diamond | diamond | — | — | — | ACTIVE | no | 0 | local |
| 146 | Diaswiss | diaswiss | — | — | — | ACTIVE | no | 0 | local |
| 147 | Dimed Laser | dimed-laser | — | — | — | ACTIVE | no | 0 | logo.dev |
| 148 | DM Trust | dm-trust | — | — | — | ACTIVE | no | 0 | local |
| 149 | Dmg | dmg | — | — | — | ACTIVE | no | 0 | logo.dev |
| 150 | DMP | dmp | — | — | — | ACTIVE | no | 0 | logo.dev |
| 151 | Doctor Scope | doctor-scope | — | — | — | ACTIVE | no | 0 | local |
| 152 | Doctorseyes | doctorseyes | — | — | — | ACTIVE | no | 0 | local |
| 153 | dolgunn | dolgunn | — | — | — | ACTIVE | no | 0 | logo.dev |
| 154 | Dota Endo | dota-endo | — | — | — | ACTIVE | no | 0 | local |
| 155 | Dr. Kim | dr-kim | — | — | — | ACTIVE | no | 0 | local |
| 156 | Dr. Schumacher | dr-schumacher | — | — | — | ACTIVE | no | 0 | logo.dev |
| 157 | Dr. Smith | dr-smith | — | — | — | ACTIVE | no | 0 | local |
| 158 | Dr.Ortho | drortho | — | — | — | ACTIVE | no | 0 | local |
| 159 | Drdent | drdent | — | — | — | ACTIVE | no | 0 | local |
| 160 | Dream Liner | dream-liner | — | — | — | ACTIVE | no | 0 | local |
| 161 | DTC | dtc | — | — | — | ACTIVE | no | 0 | local |
| 162 | DTE | dte | — | — | — | ACTIVE | no | 0 | local |
| 163 | Durr_Dental | durr-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 164 | DYM | dym | — | — | — | ACTIVE | no | 0 | local |
| 165 | DynaFlex | dynaflex | — | — | — | ACTIVE | no | 0 | logo.dev |
| 166 | E-Press | e-press | — | — | — | ACTIVE | no | 0 | local |
| 167 | East Dent | east-dent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 168 | Easyinsmile | easyinsmile | — | — | — | ACTIVE | no | 0 | logo.dev |
| 169 | Easysee Egypt | easysee-egypt | — | — | — | ACTIVE | no | 0 | local |
| 170 | Edgeendo | edgeendo | — | — | — | ACTIVE | no | 0 | logo.dev |
| 171 | Egypt Company For Trading & Distribution | egypt-company-for-trading-distribution | Egypt | BR-EGYPT-CO-TRADING | EXCEL_IMPORT | ACTIVE | no | 2 | none |
| 172 | Egyption | egyption | — | — | — | ACTIVE | no | 0 | local |
| 173 | Eighteeth | eighteeth | — | — | — | ACTIVE | no | 0 | logo.dev |
| 174 | Eksen | eksen | — | — | — | ACTIVE | no | 0 | local |
| 175 | El Dawlia Med | el-dawlia-med | — | — | — | ACTIVE | no | 0 | logo.dev |
| 176 | Elephant | elephant | — | — | — | ACTIVE | no | 0 | local |
| 177 | Elexxion | elexxion | — | — | — | ACTIVE | no | 0 | logo.dev |
| 178 | Elite | elite | — | BR-ELITE | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 179 | Ena Hri | ena-hri | — | — | — | ACTIVE | no | 0 | local |
| 180 | Endoart | endoart | — | — | — | ACTIVE | no | 0 | logo.dev |
| 181 | Endostar | endostar | — | — | — | ACTIVE | no | 0 | logo.dev |
| 182 | ENP | enp | — | — | — | ACTIVE | no | 0 | local |
| 183 | Epic | epic | — | — | — | ACTIVE | no | 0 | local |
| 184 | ETA Group | eta-group | — | — | — | ACTIVE | no | 0 | local |
| 185 | Etadent | etadent | — | — | — | ACTIVE | no | 0 | local |
| 186 | Ethicon | ethicon | — | — | — | ACTIVE | no | 0 | local |
| 187 | EuroDent | eurodent | — | — | — | ACTIVE | no | 0 | local |
| 188 | Euronda | euronda | — | — | — | ACTIVE | no | 0 | logo.dev |
| 189 | Evony | evony | — | — | — | ACTIVE | no | 0 | local |
| 190 | EX | ex | — | — | — | ACTIVE | no | 0 | local |
| 191 | Exam Vision | exam-vision | — | — | — | ACTIVE | no | 0 | logo.dev |
| 192 | EZ-Pac | ez-pac | — | — | — | ACTIVE | no | 0 | local |
| 193 | Fanta | fanta | — | BR-FANTA | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 194 | FGM | fgm | — | — | — | ACTIVE | no | 0 | logo.dev |
| 195 | FKG | fkg | — | — | — | ACTIVE | no | 0 | logo.dev |
| 196 | Flamingo | flamingo | — | — | — | ACTIVE | no | 0 | local |
| 197 | Fomos | fomos | — | — | — | ACTIVE | no | 0 | local |
| 198 | Fona | fona | — | — | — | ACTIVE | no | 0 | logo.dev |
| 199 | Forma | forma | — | — | — | ACTIVE | no | 0 | local |
| 200 | Fotona | fotona | — | — | — | ACTIVE | no | 0 | logo.dev |
| 201 | Fourtek | fourtek | — | — | — | ACTIVE | no | 0 | local |
| 202 | France | france | — | — | — | ACTIVE | no | 0 | local |
| 203 | Fuchs | fuchs | — | — | — | ACTIVE | no | 0 | local |
| 204 | Fussen | fussen | — | — | — | ACTIVE | no | 0 | logo.dev |
| 205 | FYYL Dental | fyyl-dental | — | — | — | ACTIVE | no | 0 | local |
| 206 | G&H | gh | — | — | — | ACTIVE | no | 0 | logo.dev |
| 207 | Galaxy | galaxy | — | — | — | ACTIVE | no | 0 | local |
| 208 | Gama Dent | gama-dent | — | — | — | ACTIVE | no | 0 | local |
| 209 | Garrison | garrison | — | — | — | ACTIVE | no | 0 | logo.dev |
| 210 | GC | gc | Japan | BR-GC | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 211 | Generic | generic | — | — | — | ACTIVE | no | 0 | none |
| 212 | Generic (unbranded) | generic-unbranded | Pakistan | BR-GENERIC | EXCEL_IMPORT | ACTIVE | no | 3 | none |
| 213 | Genoray | genoray | — | — | — | ACTIVE | no | 0 | local |
| 214 | Geosoft | geosoft | — | — | — | ACTIVE | no | 0 | logo.dev |
| 215 | Germ.X | germx | — | — | — | ACTIVE | no | 0 | local |
| 216 | Gigaa Laser | gigaa-laser | — | — | — | ACTIVE | no | 0 | logo.dev |
| 217 | Gingi-Pak | gingi-pak | — | — | — | ACTIVE | no | 0 | logo.dev |
| 218 | Gladent | gladent | — | — | — | ACTIVE | no | 0 | local |
| 219 | Glovesy | glovesy | — | — | — | ACTIVE | no | 0 | none |
| 220 | Glydo | glydo | — | — | — | ACTIVE | no | 0 | local |
| 221 | GMP | gmp | — | — | — | ACTIVE | no | 0 | local |
| 222 | GMS | gms | — | — | — | ACTIVE | no | 0 | local |
| 223 | GMT | gmt | — | — | — | ACTIVE | no | 0 | local |
| 224 | GNI | gni | — | — | — | ACTIVE | no | 0 | local |
| 225 | Godent | godent | — | — | — | ACTIVE | no | 0 | local |
| 226 | Gold Plus | gold-plus | — | — | — | ACTIVE | no | 0 | local |
| 227 | GoodDrs | gooddrs | — | — | — | ACTIVE | no | 0 | logo.dev |
| 228 | GuardDent | guarddent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 229 | GZ | gz | — | — | — | ACTIVE | no | 0 | local |
| 230 | Hahnenkratt | hahnenkratt | — | — | — | ACTIVE | no | 0 | logo.dev |
| 231 | HAN DAE | han-dae | — | — | — | ACTIVE | no | 0 | local |
| 232 | Handy | handy | — | — | — | ACTIVE | no | 0 | local |
| 233 | Harvard | harvard | — | — | — | ACTIVE | no | 0 | logo.dev |
| 234 | Headway | headway | — | — | — | ACTIVE | no | 0 | local |
| 235 | Heine | heine | — | — | — | ACTIVE | no | 0 | logo.dev |
| 236 | Henry Schein | henry-schein | — | — | — | ACTIVE | no | 0 | logo.dev |
| 237 | Hexa | hexa | — | — | — | ACTIVE | no | 0 | local |
| 238 | Heydent | heydent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 239 | Hi Dental Tech | hi-dental-tech | — | — | — | ACTIVE | no | 0 | local |
| 240 | Hi-Fill | hi-fill | — | — | — | ACTIVE | no | 0 | local |
| 241 | Hirol | hirol | — | — | — | ACTIVE | no | 0 | local |
| 242 | Hori | hori | — | — | — | ACTIVE | no | 0 | local |
| 243 | Horico | horico | — | — | — | ACTIVE | no | 0 | logo.dev |
| 244 | Hubit | hubit | — | — | — | ACTIVE | no | 0 | local |
| 245 | Huiley | huiley | — | — | — | ACTIVE | no | 0 | local |
| 246 | Hulaser | hulaser | — | — | — | ACTIVE | no | 0 | local |
| 247 | Hygenic | hygenic | — | BR-HYGENIC | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 248 | I-Dental | i-dental | — | — | — | ACTIVE | no | 0 | local |
| 249 | IcanClave | icanclave | — | — | — | ACTIVE | no | 0 | logo.dev |
| 250 | Ice | ice | — | — | — | ACTIVE | no | 0 | local |
| 251 | IMD | imd | — | — | — | ACTIVE | no | 0 | local |
| 252 | Imicryl | imicryl | — | — | — | ACTIVE | no | 0 | logo.dev |
| 253 | Indusbello | indusbello | — | — | — | ACTIVE | no | 0 | logo.dev |
| 254 | Infinity | infinity | — | — | — | ACTIVE | no | 0 | local |
| 255 | Intensiv | intensiv | — | — | — | ACTIVE | no | 0 | logo.dev |
| 256 | Interdent | interdent | — | — | — | ACTIVE | no | 0 | local |
| 257 | Ionyx | ionyx | — | — | — | ACTIVE | no | 0 | logo.dev |
| 258 | IOS | ios | — | — | — | ACTIVE | no | 0 | local |
| 259 | IP | ip | — | — | — | ACTIVE | no | 0 | local |
| 260 | Ires | ires | — | — | — | ACTIVE | no | 0 | logo.dev |
| 261 | isorb | isorb | — | — | — | ACTIVE | no | 0 | local |
| 262 | Italian | italian | — | — | — | ACTIVE | no | 0 | local |
| 263 | Itena | itena | — | — | — | ACTIVE | no | 0 | logo.dev |
| 264 | Ivoclar Vivadent | ivoclar-vivadent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 265 | JAINTEK | jaintek | — | — | — | ACTIVE | no | 0 | local |
| 266 | Jeep Dental | jeep-dental | — | — | — | ACTIVE | no | 0 | local |
| 267 | Jendental | jendental | — | — | — | ACTIVE | no | 0 | local |
| 268 | Jerry | jerry | — | — | — | ACTIVE | no | 0 | local |
| 269 | Jetax | jetax | — | — | — | ACTIVE | no | 0 | local |
| 270 | JG Dental | jg-dental | — | — | — | ACTIVE | no | 0 | local |
| 271 | Jinme | jinme | — | — | — | ACTIVE | no | 0 | logo.dev |
| 272 | JK Dental Vision | jk-dental-vision | — | — | — | ACTIVE | no | 0 | local |
| 273 | Johnson Promident | johnson-promident | — | — | — | ACTIVE | no | 0 | local |
| 274 | Joident | joident | — | — | — | ACTIVE | no | 0 | local |
| 275 | Junwei | junwei | — | — | — | ACTIVE | no | 0 | local |
| 276 | K&K | kk | — | — | — | ACTIVE | no | 0 | local |
| 277 | Kap | kap | — | — | — | ACTIVE | no | 0 | local |
| 278 | Kayan | kayan | — | — | — | ACTIVE | no | 0 | local |
| 279 | Keepers Dent | keepers-dent | — | — | — | ACTIVE | no | 0 | local |
| 280 | Keju | keju | — | — | — | ACTIVE | no | 0 | logo.dev |
| 281 | Kemdent | kemdent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 282 | Kenda | kenda | — | — | — | ACTIVE | no | 0 | logo.dev |
| 283 | Kerr | kerr | — | — | — | ACTIVE | no | 0 | logo.dev |
| 284 | Kettenbach | kettenbach | — | — | — | ACTIVE | no | 0 | logo.dev |
| 285 | Kiato | kiato | — | — | — | ACTIVE | no | 0 | local |
| 286 | Kids-e-Dental | kids-e-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 287 | King | king | — | — | — | ACTIVE | no | 0 | local |
| 288 | Kingcera | kingcera | — | — | — | ACTIVE | no | 0 | local |
| 289 | Koden | koden | — | — | — | ACTIVE | no | 0 | local |
| 290 | Kohler | kohler | — | — | — | ACTIVE | no | 0 | logo.dev |
| 291 | Komet | komet | — | — | — | ACTIVE | no | 0 | logo.dev |
| 292 | Korea | korea | — | — | — | ACTIVE | no | 0 | local |
| 293 | KP | kp | — | — | — | ACTIVE | no | 0 | local |
| 294 | Krafit | krafit | — | — | — | ACTIVE | no | 0 | local |
| 295 | Kulzer | kulzer | — | — | — | ACTIVE | no | 0 | logo.dev |
| 296 | Kunshan Adhesive | kunshan-adhesive | — | — | — | ACTIVE | no | 0 | local |
| 297 | L&R | lr | — | — | — | ACTIVE | no | 0 | logo.dev |
| 298 | Lafomed | lafomed | — | — | — | ACTIVE | no | 0 | local |
| 299 | LARGEV | largev | — | — | — | ACTIVE | no | 0 | logo.dev |
| 300 | Larident | larident | — | — | — | ACTIVE | no | 0 | logo.dev |
| 301 | Lascod | lascod | — | — | — | ACTIVE | no | 0 | logo.dev |
| 302 | Leone | leone | — | — | — | ACTIVE | no | 0 | logo.dev |
| 303 | LH | lh | — | — | — | ACTIVE | no | 0 | local |
| 304 | Liang Ya | liang-ya | — | — | — | ACTIVE | no | 0 | local |
| 305 | Lifebuoy | lifebuoy | — | — | — | ACTIVE | no | 0 | logo.dev |
| 306 | Linx | linx | — | — | — | ACTIVE | no | 0 | local |
| 307 | LM | lm | — | — | — | ACTIVE | no | 0 | logo.dev |
| 308 | LT MAC | lt-mac | — | — | — | ACTIVE | no | 0 | local |
| 309 | Lumix | lumix | — | — | — | ACTIVE | no | 0 | local |
| 310 | Lunray | lunray | — | — | — | ACTIVE | no | 0 | logo.dev |
| 311 | Lunx | lunx | — | — | — | ACTIVE | no | 0 | local |
| 312 | Luster Dent | luster-dent | — | — | — | ACTIVE | no | 0 | local |
| 313 | Lux Sutures | lux-sutures | — | — | — | ACTIVE | no | 0 | logo.dev |
| 314 | Lysoform | lysoform | — | — | — | ACTIVE | no | 0 | logo.dev |
| 315 | Mac Ortho | mac-ortho | — | — | — | ACTIVE | no | 0 | local |
| 316 | Madespa | madespa | — | — | — | ACTIVE | no | 0 | logo.dev |
| 317 | Mailyard | mailyard | — | — | — | ACTIVE | no | 0 | local |
| 318 | Malaysia | malaysia | — | — | — | ACTIVE | no | 0 | local |
| 319 | Mani | mani | — | — | — | ACTIVE | no | 0 | logo.dev |
| 320 | Maquira | maquira | — | — | — | ACTIVE | no | 0 | logo.dev |
| 321 | Marathon | marathon | — | — | — | ACTIVE | no | 0 | local |
| 322 | Marathon III | marathon-iii | — | — | — | ACTIVE | no | 0 | local |
| 323 | Martina Italy | martina-italy | — | — | — | ACTIVE | no | 0 | local |
| 324 | Maruchi | maruchi | — | — | — | ACTIVE | no | 0 | logo.dev |
| 325 | MAS | mas | — | — | — | ACTIVE | no | 0 | local |
| 326 | Matt-Orthodontics | matt-orthodontics | — | — | — | ACTIVE | no | 0 | logo.dev |
| 327 | Max | max | — | — | — | ACTIVE | no | 0 | local |
| 328 | MD Dental | md-dental | — | — | — | ACTIVE | no | 0 | local |
| 329 | MDC Dental | mdc-dental | — | — | — | ACTIVE | no | 0 | local |
| 330 | Mdclus | mdclus | — | — | — | ACTIVE | no | 0 | local |
| 331 | Mecco | mecco | — | — | — | ACTIVE | no | 0 | local |
| 332 | Medesy | medesy | — | — | — | ACTIVE | no | 0 | local |
| 333 | Medflair | medflair | — | — | — | ACTIVE | no | 0 | local |
| 334 | Medic | medic | — | — | — | ACTIVE | no | 0 | local |
| 335 | Medicare | medicare | — | — | — | ACTIVE | no | 0 | local |
| 336 | Mediclus | mediclus | — | — | — | ACTIVE | no | 0 | local |
| 337 | Medin | medin | — | — | — | ACTIVE | no | 0 | logo.dev |
| 338 | Meditech | meditech | — | BR-MEDITECH | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 339 | MediWorks | mediworks | — | — | — | ACTIVE | no | 0 | logo.dev |
| 340 | Medline | medline | — | — | — | ACTIVE | no | 0 | logo.dev |
| 341 | Mednext | mednext | — | — | — | ACTIVE | no | 0 | local |
| 342 | Medpark | medpark | — | — | — | ACTIVE | no | 0 | logo.dev |
| 343 | Medprotect | medprotect | — | — | — | ACTIVE | no | 0 | local |
| 344 | Mega Biodent | mega-biodent | — | — | — | ACTIVE | no | 0 | local |
| 345 | Meisinger | meisinger | — | — | — | ACTIVE | no | 0 | logo.dev |
| 346 | Meite Dental | meite-dental | — | — | — | ACTIVE | no | 0 | local |
| 347 | Mera | mera | — | — | — | ACTIVE | no | 0 | local |
| 348 | Mercy For Dent | mercy-for-dent | — | — | — | ACTIVE | no | 0 | local |
| 349 | Meta Biomed | meta-biomed | South Korea | BR-META-BIOMED | EXCEL_IMPORT | ACTIVE | no | 2 | none |
| 350 | Metoxit | metoxit | — | — | — | ACTIVE | no | 0 | logo.dev |
| 351 | Micro - Medica | micro-medica | — | — | — | ACTIVE | no | 0 | local |
| 352 | Micro NX | micro-nx | — | — | — | ACTIVE | no | 0 | logo.dev |
| 353 | Microblaster | microblaster | — | — | — | ACTIVE | no | 0 | local |
| 354 | Microdont | microdont | — | — | — | ACTIVE | no | 0 | logo.dev |
| 355 | Micromega | micromega | — | — | — | ACTIVE | no | 0 | local |
| 356 | Miglionico | miglionico | — | — | — | ACTIVE | no | 0 | logo.dev |
| 357 | Mipont | mipont | — | — | — | ACTIVE | no | 0 | local |
| 358 | Miratrade | miratrade | — | — | — | ACTIVE | no | 0 | logo.dev |
| 359 | Mitex | mitex | — | — | — | ACTIVE | no | 0 | local |
| 360 | MK-dent | mk-dent | — | — | — | ACTIVE | no | 0 | local |
| 361 | MLG | mlg | — | — | — | ACTIVE | no | 0 | local |
| 362 | Mocom | mocom | — | — | — | ACTIVE | no | 0 | logo.dev |
| 363 | Modern | modern | — | — | — | ACTIVE | no | 0 | local |
| 364 | Morita | morita | — | — | — | ACTIVE | no | 0 | logo.dev |
| 365 | Motranser | motranser | — | — | — | ACTIVE | no | 0 | logo.dev |
| 366 | Mr Chem | mr-chem | Egypt | BR-MR-CHEM | EXCEL_IMPORT | ACTIVE | no | 3 | none |
| 367 | NC Endo | nc-endo | — | — | — | ACTIVE | no | 0 | local |
| 368 | Neolix | neolix | — | — | — | ACTIVE | no | 0 | logo.dev |
| 369 | Neoss | neoss | — | — | — | ACTIVE | no | 0 | logo.dev |
| 370 | New Life Radiology | new-life-radiology | — | — | — | ACTIVE | no | 0 | local |
| 371 | NIC | nic | — | — | — | ACTIVE | no | 0 | logo.dev |
| 372 | nic tone | nic-tone | — | — | — | ACTIVE | no | 0 | local |
| 373 | Nordin | nordin | — | — | — | ACTIVE | no | 0 | logo.dev |
| 374 | NSK | nsk | — | — | — | ACTIVE | no | 0 | logo.dev |
| 375 | NTI | nti | — | — | — | ACTIVE | no | 0 | logo.dev |
| 376 | Octa Dent | octa-dent | — | — | — | ACTIVE | no | 0 | local |
| 377 | Olident | olident | — | — | — | ACTIVE | no | 0 | logo.dev |
| 378 | Optek | optek | — | — | — | ACTIVE | no | 0 | local |
| 379 | Oradent | oradent | — | — | — | ACTIVE | no | 0 | local |
| 380 | Orakit | orakit | — | — | — | ACTIVE | no | 0 | local |
| 381 | Orca Dental | orca-dental | — | — | — | ACTIVE | no | 0 | local |
| 382 | Orchids | orchids | — | — | — | ACTIVE | no | 0 | local |
| 383 | Orikam | orikam | — | — | — | ACTIVE | no | 0 | logo.dev |
| 384 | Ormco | ormco | — | — | — | ACTIVE | no | 0 | logo.dev |
| 385 | Oro | oro | — | — | — | ACTIVE | no | 0 | local |
| 386 | Orodeka | orodeka | — | — | — | ACTIVE | no | 0 | logo.dev |
| 387 | Orthmay | orthmay | — | — | — | ACTIVE | no | 0 | local |
| 388 | Ortho Classic | ortho-classic | — | — | — | ACTIVE | no | 0 | logo.dev |
| 389 | Ortho Organizers | ortho-organizers | — | — | — | ACTIVE | no | 0 | logo.dev |
| 390 | Ortho Xpress | ortho-xpress | — | — | — | ACTIVE | no | 0 | local |
| 391 | Orthometric | orthometric | — | — | — | ACTIVE | no | 0 | logo.dev |
| 392 | OrthoTechnology | orthotechnology | — | — | — | ACTIVE | no | 0 | logo.dev |
| 393 | Oruite | oruite | — | — | — | ACTIVE | no | 0 | local |
| 394 | OT Dent | ot-dent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 395 | Over Fibers | over-fibers | — | — | — | ACTIVE | no | 0 | local |
| 396 | Pakistan | pakistan | — | — | — | ACTIVE | no | 0 | local |
| 397 | Panora | panora | — | — | — | ACTIVE | no | 0 | local |
| 398 | Parkell | parkell | — | — | — | ACTIVE | no | 0 | logo.dev |
| 399 | PD | pd | — | — | — | ACTIVE | no | 0 | local |
| 400 | PDental | pdental | — | — | — | ACTIVE | no | 0 | local |
| 401 | Pearl Beam | pearl-beam | — | — | — | ACTIVE | no | 0 | local |
| 402 | Pentron | pentron | — | — | — | ACTIVE | no | 0 | logo.dev |
| 403 | Perfect Dent | perfect-dent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 404 | Perfection Plus | perfection-plus | — | — | — | ACTIVE | no | 0 | logo.dev |
| 405 | Pharaohs | pharaohs | — | — | — | ACTIVE | no | 0 | local |
| 406 | Phoco | phoco | — | — | — | ACTIVE | no | 0 | local |
| 407 | PicoPack | picopack | — | — | — | ACTIVE | no | 0 | logo.dev |
| 408 | Pioon | pioon | — | — | — | ACTIVE | no | 0 | logo.dev |
| 409 | Pippa | pippa | — | — | — | ACTIVE | no | 0 | local |
| 410 | Plus | plus | — | — | — | ACTIVE | no | 0 | local |
| 411 | Plus Med | plus-med | — | — | — | ACTIVE | no | 0 | local |
| 412 | Point | point | — | — | — | ACTIVE | no | 0 | local |
| 413 | PoloDent | polodent | — | — | — | ACTIVE | no | 0 | local |
| 414 | Polydentia | polydentia | — | — | — | ACTIVE | no | 0 | logo.dev |
| 415 | Pop | pop | — | — | — | ACTIVE | no | 0 | local |
| 416 | Power | power | — | — | — | ACTIVE | no | 0 | local |
| 417 | Power Dent | power-dent | — | — | — | ACTIVE | no | 0 | local |
| 418 | Pratex | pratex | — | — | — | ACTIVE | no | 0 | local |
| 419 | Premia | premia | — | — | — | ACTIVE | no | 0 | local |
| 420 | Prevest | prevest | — | — | — | ACTIVE | no | 0 | logo.dev |
| 421 | Prime Dental | prime-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 422 | Prodent Egypt | prodent-egypt | — | — | — | ACTIVE | no | 0 | local |
| 423 | Profa Dental | profa-dental | — | — | — | ACTIVE | no | 0 | local |
| 424 | Professional Group | professional-group | Egypt | BR-PROFESSIONAL-GROUP | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 425 | Promedica | promedica | — | — | — | ACTIVE | no | 0 | local |
| 426 | Protect | protect | — | — | — | ACTIVE | no | 0 | local |
| 427 | Protecta | protecta | — | — | — | ACTIVE | no | 0 | local |
| 428 | PSP | psp | — | — | — | ACTIVE | no | 0 | logo.dev |
| 429 | Pure | pure | — | — | — | ACTIVE | no | 0 | local |
| 430 | Puritex | puritex | — | — | — | ACTIVE | no | 0 | logo.dev |
| 431 | Purity | purity | — | — | — | ACTIVE | no | 0 | local |
| 432 | Qartz | qartz | — | — | — | ACTIVE | no | 0 | local |
| 433 | Queen Dental | queen-dental | — | — | — | ACTIVE | no | 0 | local |
| 434 | R&S | rs | — | — | — | ACTIVE | no | 0 | local |
| 435 | Rabbit 3 | rabbit-3 | — | — | — | ACTIVE | no | 0 | local |
| 436 | Ramo RCS | ramo-rcs | — | BR-RAMO-RCS | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 437 | Ranova | ranova | — | — | — | ACTIVE | no | 0 | local |
| 438 | Ray | ray | — | — | — | ACTIVE | no | 0 | logo.dev |
| 439 | RDT | rdt | — | — | — | ACTIVE | no | 0 | local |
| 440 | Reborn Endo | reborn-endo | — | — | — | ACTIVE | no | 0 | local |
| 441 | Refine-NSK | refine-nsk | — | — | — | ACTIVE | no | 0 | local |
| 442 | Reliance | reliance | — | — | — | ACTIVE | no | 0 | logo.dev |
| 443 | Remedi | remedi | — | — | — | ACTIVE | no | 0 | local |
| 444 | Resinify Technology | resinify-technology | — | — | — | ACTIVE | no | 0 | logo.dev |
| 445 | Restora Dent | restora-dent | — | — | — | ACTIVE | no | 0 | local |
| 446 | Ribbond | ribbond | — | — | — | ACTIVE | no | 0 | logo.dev |
| 447 | Ristea | ristea | — | — | — | ACTIVE | no | 0 | local |
| 448 | Rixi | rixi | — | — | — | ACTIVE | no | 0 | logo.dev |
| 449 | RMO | rmo | — | — | — | ACTIVE | no | 0 | local |
| 450 | RN | rn | — | — | — | ACTIVE | no | 0 | local |
| 451 | Rock | rock | — | — | — | ACTIVE | no | 0 | local |
| 452 | Rogin Dental | rogin-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 453 | Rolence | rolence | — | — | — | ACTIVE | no | 0 | local |
| 454 | RooTA | roota | — | — | — | ACTIVE | no | 0 | local |
| 455 | Rose Micro Solutions | rose-micro-solutions | — | — | — | ACTIVE | no | 0 | logo.dev |
| 456 | Roson | roson | — | — | — | ACTIVE | no | 0 | logo.dev |
| 457 | Rotex | rotex | — | — | — | ACTIVE | no | 0 | local |
| 458 | RTD | rtd | — | — | — | ACTIVE | no | 0 | logo.dev |
| 459 | Rubydent | rubydent | — | — | — | ACTIVE | no | 0 | local |
| 460 | Rundeer | rundeer | — | — | — | ACTIVE | no | 0 | local |
| 461 | Runyes | runyes | — | — | — | ACTIVE | no | 0 | logo.dev |
| 462 | Saeshin | saeshin | — | — | — | ACTIVE | no | 0 | logo.dev |
| 463 | Sanaden | sanaden | — | — | — | ACTIVE | no | 0 | local |
| 464 | Sanctuary | sanctuary | — | — | — | ACTIVE | no | 0 | logo.dev |
| 465 | Sani | sani | — | — | — | ACTIVE | no | 0 | local |
| 466 | Sari Dent | sari-dent | — | — | — | ACTIVE | no | 0 | local |
| 467 | Schutz Dental | schutz-dental | — | — | — | ACTIVE | no | 0 | logo.dev |
| 468 | SciCan | scican | — | — | — | ACTIVE | no | 0 | logo.dev |
| 469 | SCS | scs | — | — | — | ACTIVE | no | 0 | local |
| 470 | SDS | sds | — | — | — | ACTIVE | no | 0 | logo.dev |
| 471 | Seil Global | seil-global | — | — | — | ACTIVE | no | 0 | logo.dev |
| 472 | Sendoline | sendoline | — | — | — | ACTIVE | no | 0 | local |
| 473 | Shinva | shinva | — | — | — | ACTIVE | no | 0 | logo.dev |
| 474 | SHM | shm | — | — | — | ACTIVE | no | 0 | local |
| 475 | Shofu | shofu | — | — | — | ACTIVE | no | 0 | local |
| 476 | Siger | siger | — | — | — | ACTIVE | no | 0 | local |
| 477 | SKL | skl | — | — | — | ACTIVE | no | 0 | local |
| 478 | Sky | sky | — | — | — | ACTIVE | no | 0 | local |
| 479 | Sky Dent | sky-dent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 480 | SMI | smi | — | — | — | ACTIVE | no | 0 | local |
| 481 | SOCO | soco | — | — | — | ACTIVE | no | 0 | local |
| 482 | Soga | soga | — | — | — | ACTIVE | no | 0 | local |
| 483 | Solase | solase | — | — | — | ACTIVE | no | 0 | local |
| 484 | Solo Dam | solo-dam | — | — | — | ACTIVE | no | 0 | local |
| 485 | Solventum | solventum | — | — | — | ACTIVE | no | 0 | local |
| 486 | SOS | sos | — | — | — | ACTIVE | no | 0 | local |
| 487 | Speedjet | speedjet | — | — | — | ACTIVE | no | 0 | local |
| 488 | Spident | spident | — | — | — | ACTIVE | no | 0 | local |
| 489 | Spine | spine | — | — | — | ACTIVE | no | 0 | local |
| 490 | Splash | splash | — | — | — | ACTIVE | no | 0 | local |
| 491 | SSWhite | sswhite | — | — | — | ACTIVE | no | 0 | local |
| 492 | Stardent | stardent | — | — | — | ACTIVE | no | 0 | local |
| 493 | Steri Medical | steri-medical | — | — | — | ACTIVE | no | 0 | local |
| 494 | Steristar | steristar | — | — | — | ACTIVE | no | 0 | local |
| 495 | SternWeber | sternweber | — | — | — | ACTIVE | no | 0 | local |
| 496 | Sun | sun | — | — | — | ACTIVE | no | 0 | local |
| 497 | Suntem | suntem | — | — | — | ACTIVE | no | 0 | local |
| 498 | Super Pro | super-pro | — | — | — | ACTIVE | no | 0 | local |
| 499 | SuperCare | supercare | — | — | — | ACTIVE | no | 0 | local |
| 500 | SuperFile | superfile | — | — | — | ACTIVE | no | 0 | local |
| 501 | Supermax | supermax | — | — | — | ACTIVE | no | 0 | local |
| 502 | Surgicrafts | surgicrafts | — | — | — | ACTIVE | no | 0 | local |
| 503 | Surgispon | surgispon | — | — | — | ACTIVE | no | 0 | local |
| 504 | Swedent | swedent | — | — | — | ACTIVE | no | 0 | local |
| 505 | Syden | syden | — | — | — | ACTIVE | no | 0 | local |
| 506 | Taglus | taglus | — | — | — | ACTIVE | no | 0 | local |
| 507 | Taisier-Med | taisier-med | — | — | — | ACTIVE | no | 0 | local |
| 508 | Task | task | — | — | — | ACTIVE | no | 0 | local |
| 509 | TDV | tdv | — | — | — | ACTIVE | no | 0 | local |
| 510 | Tealth Foshan | tealth-foshan | — | — | — | ACTIVE | no | 0 | local |
| 511 | Tecno-Gaz | tecno-gaz | — | — | — | ACTIVE | no | 0 | local |
| 512 | Tehno Dent | tehno-dent | — | — | — | ACTIVE | no | 0 | local |
| 513 | Tejan Al Khaleej | tejan-al-khaleej | — | — | — | ACTIVE | no | 0 | local |
| 514 | Thomas Tivoly | thomas-tivoly | — | — | — | ACTIVE | no | 0 | local |
| 515 | TKD | tkd | — | — | — | ACTIVE | no | 0 | local |
| 516 | Toboom | toboom | — | — | — | ACTIVE | no | 0 | local |
| 517 | Tokuyama Dental | tokuyama-dental | Japan | BR-TOKUYAMA | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 518 | Toothmate | toothmate | — | — | — | ACTIVE | no | 0 | local |
| 519 | Top Dental | top-dental | — | — | — | ACTIVE | no | 0 | local |
| 520 | Tor Bm | tor-bm | — | — | — | ACTIVE | no | 0 | local |
| 521 | Tor VM | tor-vm | — | — | — | ACTIVE | no | 0 | logo.dev |
| 522 | Toye | toye | — | — | — | ACTIVE | no | 0 | logo.dev |
| 523 | TP Orthodontics | tp-orthodontics | — | — | — | ACTIVE | no | 0 | logo.dev |
| 524 | Tpc | tpc | — | — | — | ACTIVE | no | 0 | logo.dev |
| 525 | Trend | trend | — | — | — | ACTIVE | no | 0 | local |
| 526 | Tri Group Materials | tri-group-materials | Egypt | BR-TRI-GROUP | EXCEL_IMPORT | ACTIVE | no | 2 | none |
| 527 | Tribest | tribest | — | — | — | ACTIVE | no | 0 | local |
| 528 | Trident | trident | — | — | — | ACTIVE | no | 0 | logo.dev |
| 529 | Tristar | tristar | — | — | — | ACTIVE | no | 0 | local |
| 530 | TrollDental | trolldental | — | — | — | ACTIVE | no | 0 | local |
| 531 | True Dent | true-dent | — | — | — | ACTIVE | no | 0 | local |
| 532 | Trust Dental | trust-dental | — | — | — | ACTIVE | no | 0 | local |
| 533 | Twocore | twocore | — | — | — | ACTIVE | no | 0 | local |
| 534 | UDG | udg | — | — | — | ACTIVE | no | 0 | local |
| 535 | Ultradent | ultradent | United States | BR-ULTRADENT | EXCEL_IMPORT | ACTIVE | no | 1 | none |
| 536 | Unica Group | unica-group | — | — | — | ACTIVE | no | 0 | logo.dev |
| 537 | Unipro | unipro | — | — | — | ACTIVE | no | 0 | local |
| 538 | UP3D | up3d | — | — | — | ACTIVE | no | 0 | logo.dev |
| 539 | Valuedent | valuedent | — | — | — | ACTIVE | no | 0 | local |
| 540 | Vaniman | vaniman | — | — | — | ACTIVE | no | 0 | logo.dev |
| 541 | Vannini | vannini | — | — | — | ACTIVE | no | 0 | logo.dev |
| 542 | VDW | vdw | — | — | — | ACTIVE | no | 0 | logo.dev |
| 543 | Verdent | verdent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 544 | Vericom | vericom | — | — | — | ACTIVE | no | 0 | logo.dev |
| 545 | Videya | videya | — | — | — | ACTIVE | no | 0 | logo.dev |
| 546 | Vigodent | vigodent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 547 | Vita | vita | — | — | — | ACTIVE | no | 0 | logo.dev |
| 548 | Voco | voco | — | — | — | ACTIVE | no | 0 | logo.dev |
| 549 | Voldent | voldent | — | — | — | ACTIVE | no | 0 | logo.dev |
| 550 | VRN | vrn | — | — | — | ACTIVE | no | 0 | local |
| 551 | VSI | vsi | — | — | — | ACTIVE | no | 0 | local |
| 552 | W&H | wh | — | — | — | ACTIVE | no | 0 | local |
| 553 | Waterpik | waterpik | — | — | — | ACTIVE | no | 0 | logo.dev |
| 554 | Waterpulse | waterpulse | — | — | — | ACTIVE | no | 0 | local |
| 555 | Welco | welco | — | — | — | ACTIVE | no | 0 | local |
| 556 | Wellmed | wellmed | — | — | — | ACTIVE | no | 0 | local |
| 557 | Whitesmile Flash | whitesmile-flash | — | — | — | ACTIVE | no | 0 | local |
| 558 | Wismy | wismy | — | — | — | ACTIVE | no | 0 | local |
| 559 | Woodpecker | woodpecker | — | — | — | ACTIVE | no | 0 | local |
| 560 | World Work | world-work | — | — | — | ACTIVE | no | 0 | logo.dev |
| 561 | Woson | woson | — | — | — | ACTIVE | no | 0 | logo.dev |
| 562 | WP Dental | wp-dental | — | — | — | ACTIVE | no | 0 | local |
| 563 | Xpect Vision | xpect-vision | — | — | — | ACTIVE | no | 0 | logo.dev |
| 564 | Yamakin | yamakin | — | — | — | ACTIVE | no | 0 | logo.dev |
| 565 | YDA | yda | — | — | — | ACTIVE | no | 0 | local |
| 566 | Yes!Star | yesstar | — | — | — | ACTIVE | no | 0 | logo.dev |
| 567 | Yeson | yeson | — | — | — | ACTIVE | no | 0 | logo.dev |
| 568 | Yoga | yoga | — | — | — | ACTIVE | no | 0 | local |
| 569 | YouJoy | youjoy | — | — | — | ACTIVE | no | 0 | local |
| 570 | Yousi | yousi | — | — | — | ACTIVE | no | 0 | local |
| 571 | Youtodent | youtodent | — | — | — | ACTIVE | no | 0 | local |
| 572 | Zafdent | zafdent | — | — | — | ACTIVE | no | 0 | local |
| 573 | Zhermack | zhermack | — | — | — | ACTIVE | no | 0 | logo.dev |
| 574 | Zogear | zogear | — | — | — | ACTIVE | no | 0 | logo.dev |
| 575 | Zotion | zotion | — | — | — | ACTIVE | no | 0 | logo.dev |
| 576 | Zt Dental | zt-dental | — | — | — | ACTIVE | no | 0 | local |
| 577 | Zumax | zumax | — | — | — | ACTIVE | no | 0 | logo.dev |
| 578 | ZZ | zz | — | — | — | ACTIVE | no | 0 | local |

---

## C. BRAND SUMMARY

| Metric | Value |
|---|---|
| Total brands | **578** |
| Active | 578 |
| Inactive | 0 |
| Needs logo (`NEEDS_LOGO` status) | 0 |
| Featured | 0 |
| Brands with `country` set | 13 (all 13 came in via the `EXCEL_IMPORT` sourceSystem batch) |
| Brands with `externalBrandId` / `sourceSystem` set | 18 (`EXCEL_IMPORT`) — the other 560 have no external id / source system (`null`) |
| Logo: local file (`/brand-logos/...`) | 353 |
| Logo: `logo.dev` fallback URL | 205 |
| Logo: none | 20 |
| Exact / case-insensitive duplicate names | **0** |
| Normalized duplicates (spacing/punctuation-insensitive) | **0** |

**Countries used** (only on the 18 `EXCEL_IMPORT` brands): United States, Germany, Netherlands, Switzerland, Egypt, Japan, Pakistan, South Korea.

**Brands that look like generic/source labels, not real manufacturers:**
- `Generic` (slug `generic`) — no country, no products yet
- `Generic (unbranded)` (slug `generic-unbranded`, country Pakistan, `BR-GENERIC`, 3 products) — an explicit "no real brand" placeholder
- `Chinese` (slug `chinese`) — a country/origin label used as a brand name, not a manufacturer

These three are worth a decision before the Toothpick mapping: keep as-is (useful as an "unknown/unbranded" bucket) or fold Toothpick's own "no brand" rows into `Generic (unbranded)` specifically, since that one already has the placeholder semantics and an external ID. Not changed as part of this audit.

**Algorithmic near-duplicate check:** ran both an exact-match and a normalized (lowercase, punctuation/space-stripped) pass — zero duplicates either way. A looser Levenshtein-distance pass (edit distance ≤ 1, names ≥ 5 chars) surfaced ~12 candidate pairs, but spot-checking them shows this method is unreliable for this brand list: e.g. it flags `Bisco` vs `Bisico`, which are two genuinely different, real dental material manufacturers (Bisco is a US resin/adhesive brand, Bisico is a German impression-material brand — confirmed distinct by the `country` field on the EXCEL_IMPORT record for Bisico). Given the brand list was already manually verified against toothpick.com/eg.toothpick.com in a prior logo-correction pass, **no near-duplicates are being flagged as likely errors** — only listed here for transparency:
`Bibodent`/`Biodent`, `Bisco`/`Bisico`, `Dentac`/`Dentax`, `Dentax`/`dentex`, `I-Dental`/`PDental`, `Larident`/`Sari Dent`, `MD Dental`/`MDC Dental`, `Medic`/`Medin`, `PDental`/`WP Dental`, `Protect`/`Protecta`, `Roson`/`Woson`, `Tor Bm`/`Tor VM`.

---

## D. CATEGORY DATABASE SCHEMA

Prisma model: `Category` (`server/prisma/schema.prisma`)

| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key, internal database ID |
| `externalCategoryId` | String? | Optional external/reference ID (e.g. `CAT-005`) |
| `sourceSystem` | String? | Which import populated it (e.g. `EXCEL_IMPORT`) |
| `name` | String | **Unique.** English name |
| `nameAr` | String? | Arabic name (present on 9 of 218 categories — the ones imported from the owner's Excel taxonomy) |
| `slug` | String | **Unique** |
| `description` | String? | |
| `icon` | String? | Unused on every current record |
| `imageUrl` | String? | Unused on every current record |
| `parentId` | String? | Self-relation FK → `Category.id`. Null = top-level |
| `parent` / `children` | Category / Category[] | Self-relation (`CategoryTree`), `onDelete: SetNull` |
| `displayOrder` | Int | Default `0`, sort order within its parent |
| `status` | Enum `CategoryStatus` | `ACTIVE` \| `DRAFT` \| `INACTIVE` |
| `products` | Product[] | Reverse relation (`Product.categoryRecord`) |
| `createdAt` / `updatedAt` | DateTime | |

Constraints:
- `@@unique([name])`, `@@unique([slug])`
- `@@unique([sourceSystem, externalCategoryId])`
- Indexes on `status`, `parentId`, `displayOrder`

**No `show_in_menu` field exists** in the current schema — there is no boolean controlling menu visibility separate from `status`. If Toothpick's mapping needs that distinction, it isn't representable today without a schema change (not done here).

**Category depth is not stored** — it's derived by walking `parentId`. The current tree is 3 levels deep (0/1/2); nothing enforces a max depth.

---

## E. ALL EXISTING CATEGORIES (218 total, hierarchy order)

Full detail is in `docs/catalogue-audit/existing-categories.json`. Indentation in the "Name" column reflects nesting depth (0 = top-level).

| # | Name (indented = hierarchy) | Arabic Name | Slug | Depth | Parent | External ID | Status | Sort Order | Products |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Books | — | books | 0 | — | — | INACTIVE | 0 | 0 |
| 2 | Disposable Materials | المستلزمات الطبية المستهلكة | disposable-materials | 0 | — | CAT-005 | ACTIVE | 0 | 0 |
| 3 | ⁠ Gloves | قفازات | gloves | 1 | Disposable Materials | CAT-006 | ACTIVE | 1 | 7 |
| 4 | Machine Inquiries | — | machine-inquiries | 0 | — | — | INACTIVE | 0 | 0 |
| 5 | Online Courses | — | online-courses | 0 | — | — | INACTIVE | 0 | 0 |
| 6 | Others | — | others | 0 | — | — | INACTIVE | 0 | 0 |
| 7 | Periodontics | — | periodontics | 0 | — | — | INACTIVE | 0 | 0 |
| 8 | Radiology | — | radiology | 0 | — | — | INACTIVE | 0 | 0 |
| 9 | Sterilization Material | — | sterilization-material | 0 | — | — | INACTIVE | 0 | 0 |
| 10 | Surgery | الجراحة | surgery | 0 | — | CAT-007 | INACTIVE | 0 | 0 |
| 11 | ⁠ Extraction Instruments | أدوات الخلع | extraction-instruments | 1 | Surgery | CAT-008 | ACTIVE | 0 | 4 |
| 12 | Restorative | الترميم | restorative | 0 | — | CAT-001 | ACTIVE | 1 | 0 |
| 13 | ⁠ Composite Restorative Materials | مواد الترميم المركبة | composite-restorative-materials | 1 | Restorative | CAT-002 | ACTIVE | 0 | 5 |
| 14 | ⁠ Composite | — | composite | 1 | Restorative | — | ACTIVE | 1 | 0 |
| 15 | ⁠ Amalgam | — | amalgam | 1 | Restorative | — | ACTIVE | 2 | 0 |
| 16 | ⁠ Etch & Bond | — | etch-bond | 1 | Restorative | — | ACTIVE | 3 | 0 |
| 17 | ⁠ Compomer | — | compomer | 1 | Restorative | — | ACTIVE | 5 | 0 |
| 18 | ⁠ Base liner | — | base-liner | 1 | Restorative | — | ACTIVE | 6 | 0 |
| 19 | ⁠ Finishing & Polishing Rest | — | finishing-polishing-rest | 1 | Restorative | — | ACTIVE | 7 | 0 |
| 20 | ⁠ Caries detectors | — | caries-detectors | 1 | Restorative | — | ACTIVE | 8 | 0 |
| 21 | ⁠ Temporary Filling | — | temporary-filling | 1 | Restorative | — | ACTIVE | 9 | 0 |
| 22 | ⁠ Crown Form | — | crown-form | 1 | Restorative | — | ACTIVE | 10 | 0 |
| 23 | ⁠ Glass ionomer Rest. | — | glass-ionomer-rest | 1 | Restorative | — | ACTIVE | 11 | 0 |
| 24 | ⁠ fissure sealent | — | fissure-sealent | 1 | Restorative | — | ACTIVE | 12 | 0 |
| 25 | Endodontics | علاج الجذور | endodontics | 0 | — | — | ACTIVE | 2 | 0 |
| 26 | ⁠ Obturation Materials | مواد سد قناة الجذر | obturation-materials | 1 | Endodontics | CAT-004 | ACTIVE | 0 | 7 |
| 27 | ⁠ Root Canal Sealer | — | root-canal-sealer | 1 | Endodontics | — | ACTIVE | 1 | 0 |
| 28 | ⁠ Files & Reamers | — | files-reamers | 1 | Endodontics | — | ACTIVE | 2 | 0 |
| 29 | ⁠⁠ K. FILL | — | k-fill | 2 | Files & Reamers | — | ACTIVE | 1 | 0 |
| 30 | ⁠⁠ H.FILL | — | h-fill | 2 | Files & Reamers | — | ACTIVE | 2 | 0 |
| 31 | ⁠⁠ Reamer | — | reamer | 2 | Files & Reamers | — | ACTIVE | 3 | 0 |
| 32 | ⁠⁠ File Protaper | — | file-protaper | 2 | Files & Reamers | — | ACTIVE | 4 | 0 |
| 33 | ⁠ Nerve Broach | — | nerve-broach | 1 | Endodontics | — | ACTIVE | 3 | 0 |
| 34 | ⁠ Paper Point & Gutta Percha | — | paper-point-gutta-percha | 1 | Endodontics | — | ACTIVE | 4 | 0 |
| 35 | ⁠ Rotary Files | — | rotary-files | 1 | Endodontics | — | ACTIVE | 5 | 0 |
| 36 | ⁠ Gates Glidden & Pesso Drills | — | gates-glidden-pesso-drills | 1 | Endodontics | — | ACTIVE | 6 | 0 |
| 37 | ⁠ Spearders & Pluggers | — | spearders-pluggers | 1 | Endodontics | — | ACTIVE | 7 | 0 |
| 38 | ⁠ Endo Accessories | — | endo-accessories | 1 | Endodontics | — | ACTIVE | 8 | 0 |
| 39 | ⁠ Vitality Testers | — | vitality-testers | 1 | Endodontics | — | ACTIVE | 9 | 0 |
| 40 | ⁠ Medications & Irrigations | — | medications-irrigations | 1 | Endodontics | — | ACTIVE | 10 | 0 |
| 41 | ⁠ MTAs | — | mtas | 1 | Endodontics | — | ACTIVE | 11 | 0 |
| 42 | ⁠ Calcium Hydroxide | — | calcium-hydroxide | 1 | Endodontics | — | ACTIVE | 12 | 0 |
| 43 | ⁠ Zinc Oxide Restoration | — | zinc-oxide-restoration | 1 | Endodontics | — | ACTIVE | 13 | 0 |
| 44 | ⁠ Rubber dam | — | rubber-dam | 1 | Endodontics | — | ACTIVE | 14 | 0 |
| 45 | Prosthodontics | التعويضات السنية | prosthodontics | 0 | — | CAT-009 | ACTIVE | 3 | 0 |
| 46 | ⁠ Impression Material | — | impression-material | 1 | Prosthodontics | — | ACTIVE | 1 | 0 |
| 47 | ⁠ Stainless Steel Crowns | — | stainless-steel-crowns | 1 | Prosthodontics | — | ACTIVE | 2 | 0 |
| 48 | ⁠ Temporary Crown | — | temporary-crown | 1 | Prosthodontics | — | ACTIVE | 3 | 0 |
| 49 | ⁠⁠ Polycarbonate Crown | — | polycarbonate-crown | 2 | Temporary Crown | — | ACTIVE | 1 | 0 |
| 50 | ⁠ Cements | مواد اللصق | cements | 1 | Prosthodontics | CAT-010 | ACTIVE | 4 | 2 |
| 51 | ⁠⁠ G.I. Cement | — | g-i-cement | 2 | Cements | — | ACTIVE | 1 | 0 |
| 52 | ⁠⁠ Polycarboxylate Cement | — | polycarboxylate-cement | 2 | Cements | — | ACTIVE | 2 | 0 |
| 53 | ⁠⁠ Zinc Phosphate Cement | — | zinc-phosphate-cement | 2 | Cements | — | ACTIVE | 3 | 0 |
| 54 | ⁠ Core Material | — | core-material | 1 | Prosthodontics | — | ACTIVE | 4 | 0 |
| 55 | ⁠ Posts | — | posts | 1 | Prosthodontics | — | ACTIVE | 5 | 0 |
| 56 | ⁠⁠ Fiber Posts | — | fiber-posts | 2 | Posts | — | ACTIVE | 1 | 0 |
| 57 | ⁠⁠ Metallic Posts | — | metallic-posts | 2 | Posts | — | ACTIVE | 2 | 0 |
| 58 | ⁠ Soft liners | — | soft-liners | 1 | Prosthodontics | — | ACTIVE | 6 | 0 |
| 59 | Perio & Surgery | اللثة والجراحة | perio-surgery | 0 | — | — | ACTIVE | 4 | 0 |
| 60 | ⁠ Haemostatics | — | haemostatics | 1 | Perio & Surgery | — | ACTIVE | 1 | 0 |
| 61 | ⁠ Perio Packs | — | perio-packs | 1 | Perio & Surgery | — | ACTIVE | 2 | 0 |
| 62 | ⁠ Soft Tissue Graft | — | soft-tissue-graft | 1 | Perio & Surgery | — | ACTIVE | 3 | 0 |
| 63 | ⁠ Bone Graft | — | bone-graft | 1 | Perio & Surgery | — | ACTIVE | 4 | 0 |
| 64 | ⁠ Scaling & Polishing | — | scaling-polishing | 1 | Perio & Surgery | — | ACTIVE | 5 | 0 |
| 65 | ⁠ Surgical Medication | — | surgical-medication | 1 | Perio & Surgery | — | ACTIVE | 6 | 0 |
| 66 | ⁠ Suture Needle | — | suture-needle | 1 | Perio & Surgery | — | ACTIVE | 7 | 0 |
| 67 | Orthodontics | تقويم الأسنان | orthodontics | 0 | — | — | ACTIVE | 5 | 0 |
| 68 | ⁠ Wires | — | wires | 1 | Orthodontics | — | ACTIVE | 1 | 0 |
| 69 | ⁠ Orthodontic Instruments | — | orthodontic-instruments | 1 | Orthodontics | — | ACTIVE | 2 | 0 |
| 70 | ⁠ Elastic O-Tie & Ligature | — | elastic-o-tie-ligature | 1 | Orthodontics | — | ACTIVE | 3 | 0 |
| 71 | ⁠ Orthodontic Accessories | — | orthodontic-accessories | 1 | Orthodontics | — | ACTIVE | 4 | 0 |
| 72 | ⁠ Brackets | — | brackets | 1 | Orthodontics | — | ACTIVE | 5 | 0 |
| 73 | ⁠ Spring / Coils & Hooks | — | spring-coils-hooks | 1 | Orthodontics | — | ACTIVE | 6 | 0 |
| 74 | ⁠ Buccal Tubes | — | buccal-tubes | 1 | Orthodontics | — | ACTIVE | 7 | 0 |
| 75 | ⁠ Cheek Retractors | — | cheek-retractors | 1 | Orthodontics | — | ACTIVE | 8 | 0 |
| 76 | ⁠ Bands | — | bands | 1 | Orthodontics | — | ACTIVE | 9 | 0 |
| 77 | ⁠ Screws | — | screws | 1 | Orthodontics | — | ACTIVE | 10 | 0 |
| 78 | ⁠ Adhesive | — | adhesive | 1 | Orthodontics | — | ACTIVE | 11 | 0 |
| 79 | ⁠ Photography | — | photography | 1 | Orthodontics | — | ACTIVE | 23 | 0 |
| 80 | ⁠ Intra Oral & Extra Oral | — | intra-oral-extra-oral | 1 | Orthodontics | — | ACTIVE | 24 | 0 |
| 81 | Consumables | المستهلكات | consumables | 0 | — | — | ACTIVE | 6 | 0 |
| 82 | ⁠ Protective Wear | — | protective-wear | 1 | Consumables | — | ACTIVE | 1 | 0 |
| 83 | ⁠⁠ Mask | — | mask | 2 | Protective Wear | — | ACTIVE | 2 | 0 |
| 84 | ⁠⁠ Lab Coat | — | lab-coat | 2 | Protective Wear | — | ACTIVE | 3 | 0 |
| 85 | ⁠⁠ Gown | — | gown | 2 | Protective Wear | — | ACTIVE | 4 | 0 |
| 86 | ⁠⁠ Scrubs | — | scrubs | 2 | Protective Wear | — | ACTIVE | 5 | 0 |
| 87 | ⁠⁠ Protective Glasses | — | protective-glasses | 2 | Protective Wear | — | ACTIVE | 6 | 0 |
| 88 | ⁠ Matrix & Wedges | — | matrix-wedges | 1 | Consumables | — | ACTIVE | 2 | 0 |
| 89 | ⁠ Isolation | — | isolation | 1 | Consumables | — | ACTIVE | 3 | 0 |
| 90 | ⁠ Retraction | — | retraction | 1 | Consumables | — | ACTIVE | 4 | 0 |
| 91 | ⁠ Occlusal Adjustment | — | occlusal-adjustment | 1 | Consumables | — | ACTIVE | 5 | 0 |
| 92 | ⁠ Anesthesia | التخدير | anesthesia | 1 | Consumables | — | ACTIVE | 6 | 0 |
| 93 | ⁠ Disinfection & Steralization | — | disinfection-steralization | 1 | Consumables | — | ACTIVE | 7 | 0 |
| 94 | ⁠ XRay film & Material | — | xray-film-material | 1 | Consumables | — | ACTIVE | 8 | 0 |
| 95 | ⁠⁠ XRay film | — | xray-film | 2 | XRay film & Material | — | ACTIVE | 1 | 0 |
| 96 | ⁠⁠ Protective Glass | — | protective-glass | 2 | XRay film & Material | — | ACTIVE | 2 | 0 |
| 97 | ⁠ Disposable Pouch | — | disposable-pouch | 1 | Consumables | — | ACTIVE | 9 | 0 |
| 98 | ⁠ Saliva Ejector | — | saliva-ejector | 1 | Consumables | — | ACTIVE | 10 | 0 |
| 99 | ⁠ Cotton Roll | — | cotton-roll | 1 | Consumables | — | ACTIVE | 11 | 0 |
| 100 | ⁠ Diagnostic Set | — | diagnostic-set | 1 | Consumables | — | ACTIVE | 12 | 0 |
| 101 | ⁠ Tooth Picks | — | tooth-picks | 1 | Consumables | — | ACTIVE | 13 | 0 |
| 102 | ⁠ Barrier Film | — | barrier-film | 1 | Consumables | — | ACTIVE | 14 | 0 |
| 103 | ⁠ Plastic Instrument Tray | — | plastic-instrument-tray | 1 | Consumables | — | ACTIVE | 15 | 0 |
| 104 | ⁠ Dental Needle | — | dental-needle | 1 | Consumables | — | ACTIVE | 16 | 0 |
| 105 | ⁠ Fluoride Tray | — | fluoride-tray | 1 | Consumables | — | ACTIVE | 17 | 0 |
| 106 | ⁠ Disposable Syringe | — | disposable-syringe | 1 | Consumables | — | ACTIVE | 18 | 0 |
| 107 | ⁠ Chemicals | — | chemicals | 1 | Consumables | — | ACTIVE | 19 | 0 |
| 108 | ⁠ Towels | — | towels | 1 | Consumables | — | ACTIVE | 20 | 0 |
| 109 | ⁠ Disposable Cups | — | disposable-cups | 1 | Consumables | — | ACTIVE | 21 | 0 |
| 110 | ⁠ General items | — | general-items | 1 | Consumables | — | ACTIVE | 22 | 0 |
| 111 | ⁠⁠ Accessories | — | accessories | 2 | General items | — | ACTIVE | 1 | 0 |
| 112 | ⁠⁠ Student case | — | student-case | 2 | General items | — | ACTIVE | 2 | 0 |
| 113 | Instruments | أدوات الأسنان | instruments | 0 | — | — | ACTIVE | 7 | 0 |
| 114 | ⁠ Filling instruments | — | filling-instruments | 1 | Instruments | — | ACTIVE | 1 | 0 |
| 115 | ⁠ Extraction Forceps | — | extraction-forceps | 1 | Instruments | — | ACTIVE | 2 | 0 |
| 116 | ⁠ Elevators | — | elevators | 1 | Instruments | — | ACTIVE | 3 | 0 |
| 117 | ⁠ Soft Tissue Instruments | — | soft-tissue-instruments | 1 | Instruments | — | ACTIVE | 4 | 0 |
| 118 | ⁠ Retractors | — | retractors | 1 | Instruments | — | ACTIVE | 5 | 0 |
| 119 | ⁠ Impression Accessories | — | impression-accessories | 1 | Instruments | — | ACTIVE | 6 | 0 |
| 120 | ⁠⁠ Aluminium Tray | — | aluminium-tray | 2 | Impression Accessories | — | ACTIVE | 1 | 0 |
| 121 | ⁠⁠ Plastic Impression Tray | — | plastic-impression-tray | 2 | Impression Accessories | — | ACTIVE | 2 | 0 |
| 122 | ⁠⁠ Stainless Steel Tray | — | stainless-steel-tray | 2 | Impression Accessories | — | ACTIVE | 3 | 0 |
| 123 | ⁠ Crown Remover & Caliber | — | crown-remover-caliber | 1 | Instruments | — | ACTIVE | 7 | 0 |
| 124 | ⁠ Shade Guide | — | shade-guide | 1 | Instruments | — | ACTIVE | 8 | 0 |
| 125 | ⁠ Articulation Adjustment | — | articulation-adjustment | 1 | Instruments | — | ACTIVE | 9 | 0 |
| 126 | ⁠ Mixing Guns | — | mixing-guns | 1 | Instruments | — | ACTIVE | 10 | 0 |
| 127 | ⁠ Scalers & Curettes | — | scalers-curettes | 1 | Instruments | — | ACTIVE | 11 | 0 |
| 128 | ⁠ Condenser | — | condenser | 1 | Instruments | — | ACTIVE | 12 | 0 |
| 129 | ⁠ Cotton Plier | — | cotton-plier | 1 | Instruments | — | ACTIVE | 13 | 0 |
| 130 | ⁠ Plier | — | plier | 1 | Instruments | — | ACTIVE | 14 | 0 |
| 131 | ⁠ Excavator | — | excavator | 1 | Instruments | — | ACTIVE | 15 | 0 |
| 132 | ⁠ Explorer | — | explorer | 1 | Instruments | — | ACTIVE | 16 | 0 |
| 133 | ⁠ Probe | — | probe | 1 | Instruments | — | ACTIVE | 17 | 0 |
| 134 | ⁠ Retainer | — | retainer | 1 | Instruments | — | ACTIVE | 18 | 0 |
| 135 | ⁠ Scissors | — | scissors | 1 | Instruments | — | ACTIVE | 19 | 0 |
| 136 | ⁠ Dispenser | — | dispenser | 1 | Instruments | — | ACTIVE | 20 | 0 |
| 137 | ⁠ Syring | — | syring | 1 | Instruments | — | ACTIVE | 21 | 0 |
| 138 | ⁠ Amalgam Carrier | — | amalgam-carrier | 1 | Instruments | — | ACTIVE | 22 | 0 |
| 139 | ⁠ Bone File | — | bone-file | 1 | Instruments | — | ACTIVE | 23 | 0 |
| 140 | ⁠ Bone Rongeur | — | bone-rongeur | 1 | Instruments | — | ACTIVE | 24 | 0 |
| 141 | ⁠ Burnisher | — | burnisher | 1 | Instruments | — | ACTIVE | 25 | 0 |
| 142 | ⁠ Carver | — | carver | 1 | Instruments | — | ACTIVE | 26 | 0 |
| 143 | ⁠ Bone Curette | — | bone-curette | 1 | Instruments | — | ACTIVE | 27 | 0 |
| 144 | ⁠ Bur Holder | — | bur-holder | 1 | Instruments | — | ACTIVE | 28 | 0 |
| 145 | ⁠ Bur Brush | — | bur-brush | 1 | Instruments | — | ACTIVE | 29 | 0 |
| 146 | ⁠ Surgical Blades & Blade Handles | — | surgical-blades-blade-handles | 1 | Instruments | — | ACTIVE | 30 | 0 |
| 147 | ⁠⁠ Hand of Blade | — | hand-of-blade | 2 | Surgical Blades & Blade Handles | — | ACTIVE | 1 | 0 |
| 148 | ⁠ Napkin Holder | — | napkin-holder | 1 | Instruments | — | ACTIVE | 31 | 0 |
| 149 | ⁠ Needle Holder | — | needle-holder | 1 | Instruments | — | ACTIVE | 32 | 0 |
| 150 | ⁠ Periodontal File | — | periodontal-file | 1 | Instruments | — | ACTIVE | 33 | 0 |
| 151 | ⁠ Periosteal Elevator | — | periosteal-elevator | 1 | Instruments | — | ACTIVE | 34 | 0 |
| 152 | ⁠ Wax Knife | — | wax-knife | 1 | Instruments | — | ACTIVE | 35 | 0 |
| 153 | ⁠ Wax Carver | — | wax-carver | 1 | Instruments | — | ACTIVE | 36 | 0 |
| 154 | ⁠ Dappen Dish | — | dappen-dish | 1 | Instruments | — | ACTIVE | 37 | 0 |
| 155 | ⁠ mirror | — | mirror | 1 | Instruments | — | ACTIVE | 38 | 0 |
| 156 | ⁠ hand mirror | — | hand-mirror | 1 | Instruments | — | ACTIVE | 39 | 0 |
| 157 | ⁠ Puncture | — | puncture | 1 | Instruments | — | ACTIVE | 40 | 0 |
| 158 | ⁠ Rubber Dam Clamp Forceps | — | rubber-dam-clamp-forceps | 1 | Instruments | — | ACTIVE | 41 | 0 |
| 159 | ⁠ Metal frame | — | metal-frame | 1 | Instruments | — | ACTIVE | 42 | 0 |
| 160 | ⁠ Rubber Dam Clamp | — | rubber-dam-clamp | 1 | Instruments | — | ACTIVE | 43 | 0 |
| 161 | ⁠ Hand Plugger | — | hand-plugger | 1 | Instruments | — | ACTIVE | 44 | 0 |
| 162 | ⁠ Hand Spreader | — | hand-spreader | 1 | Instruments | — | ACTIVE | 45 | 0 |
| 163 | ⁠ Spatula Cement | — | spatula-cement | 1 | Instruments | — | ACTIVE | 46 | 0 |
| 164 | Equipments | الأجهزة | equipments | 0 | — | — | ACTIVE | 8 | 0 |
| 165 | ⁠ Dental Unit | — | dental-unit | 1 | Equipments | — | ACTIVE | 1 | 0 |
| 166 | ⁠ Dental Unit Parts & Accessories | — | dental-unit-parts-accessories | 1 | Equipments | — | ACTIVE | 2 | 0 |
| 167 | ⁠ Light Cure | — | light-cure | 1 | Equipments | — | ACTIVE | 3 | 0 |
| 168 | ⁠ Endomotor | — | endomotor | 1 | Equipments | — | ACTIVE | 4 | 0 |
| 169 | ⁠ Apex Locator | — | apex-locator | 1 | Equipments | — | ACTIVE | 5 | 0 |
| 170 | ⁠ Handpieces | — | handpieces | 1 | Equipments | — | ACTIVE | 6 | 0 |
| 171 | ⁠⁠ Straight Handpiece | — | straight-handpiece | 2 | Handpieces | — | ACTIVE | 1 | 0 |
| 172 | ⁠⁠ Low Speed Handpiece | — | low-speed-handpiece | 2 | Handpieces | — | ACTIVE | 2 | 0 |
| 173 | ⁠⁠ Air motor | — | air-motor | 2 | Handpieces | — | ACTIVE | 3 | 0 |
| 174 | ⁠⁠ Air motor Kit | — | air-motor-kit | 2 | Handpieces | — | ACTIVE | 4 | 0 |
| 175 | ⁠⁠ High-Speed Handpiece | — | high-speed-handpiece | 2 | Handpieces | — | ACTIVE | 5 | 0 |
| 176 | ⁠ Micromotor | — | micromotor | 1 | Equipments | — | ACTIVE | 7 | 0 |
| 177 | ⁠ Amalgamator | — | amalgamator | 1 | Equipments | — | ACTIVE | 8 | 0 |
| 178 | ⁠ Compressor | — | compressor | 1 | Equipments | — | ACTIVE | 9 | 0 |
| 179 | ⁠ Autoclav | — | autoclav | 1 | Equipments | — | ACTIVE | 10 | 0 |
| 180 | ⁠ Obturation Systems | — | obturation-systems | 1 | Equipments | — | ACTIVE | 11 | 0 |
| 181 | ⁠ GuttaPercha Cutter | — | guttapercha-cutter | 1 | Equipments | — | ACTIVE | 12 | 0 |
| 182 | ⁠ CAD/CAM | — | cad-cam | 1 | Equipments | — | ACTIVE | 13 | 0 |
| 183 | ⁠ Water Distiller | — | water-distiller | 1 | Equipments | — | ACTIVE | 14 | 0 |
| 184 | ⁠ Ultrasonic Cleaner | — | ultrasonic-cleaner | 1 | Equipments | — | ACTIVE | 15 | 0 |
| 185 | ⁠ Ultrasonic Scaler | — | ultrasonic-scaler | 1 | Equipments | — | ACTIVE | 16 | 0 |
| 186 | ⁠ Sealing Machine | — | sealing-machine | 1 | Equipments | — | ACTIVE | 17 | 0 |
| 187 | ⁠ Xray unit | — | xray-unit | 1 | Equipments | — | ACTIVE | 18 | 0 |
| 188 | ⁠ XRay Sensor | — | xray-sensor | 1 | Equipments | — | ACTIVE | 19 | 0 |
| 189 | ⁠ Intraoral Camera | — | intraoral-camera | 1 | Equipments | — | ACTIVE | 20 | 0 |
| 190 | ⁠ XRay Viewer | — | xray-viewer | 1 | Equipments | — | ACTIVE | 21 | 0 |
| 191 | ⁠ Loups | — | loups | 1 | Equipments | — | ACTIVE | 22 | 0 |
| 192 | ⁠ Soft Tissue Laser | — | soft-tissue-laser | 1 | Equipments | — | ACTIVE | 23 | 0 |
| 193 | ⁠ Hand pressing | — | hand-pressing | 1 | Equipments | — | ACTIVE | 24 | 0 |
| 194 | ⁠ Prophy Jet | — | prophy-jet | 1 | Equipments | — | ACTIVE | 25 | 0 |
| 195 | ⁠ Cartidge | — | cartidge | 1 | Equipments | — | ACTIVE | 26 | 0 |
| 196 | Implant | زراعة الأسنان | implant | 0 | — | — | ACTIVE | 9 | 0 |
| 197 | Dental lab | مختبر الأسنان | dental-lab | 0 | — | — | ACTIVE | 10 | 0 |
| 198 | ⁠ Acrylic | — | acrylic | 1 | Dental lab | — | ACTIVE | 1 | 0 |
| 199 | ⁠ Porcelain metal | — | porcelain-metal | 1 | Dental lab | — | ACTIVE | 2 | 0 |
| 200 | Bleaching | تبييض الأسنان | bleaching | 0 | — | — | ACTIVE | 11 | 0 |
| 201 | ⁠ Whitening Material | — | whitening-material | 1 | Bleaching | — | ACTIVE | 1 | 0 |
| 202 | Burs & Stones | المبارد والأحجار | burs-stones | 0 | — | — | ACTIVE | 12 | 0 |
| 203 | ⁠ Diamond | — | diamond | 1 | Burs & Stones | — | ACTIVE | 1 | 0 |
| 204 | ⁠⁠ Diamond Low Speed | — | diamond-low-speed | 2 | Diamond | — | ACTIVE | 1 | 0 |
| 205 | ⁠⁠ Diamond High Speed | — | diamond-high-speed | 2 | Diamond | — | ACTIVE | 2 | 0 |
| 206 | ⁠ Carbid | — | carbid | 1 | Burs & Stones | — | ACTIVE | 2 | 0 |
| 207 | ⁠⁠ Carbid Low Speed | — | carbid-low-speed | 2 | Carbid | — | ACTIVE | 1 | 0 |
| 208 | ⁠⁠ Carbid High Speed | — | carbid-high-speed | 2 | Carbid | — | ACTIVE | 2 | 0 |
| 209 | ⁠ Surgical Burs | — | surgical-burs | 1 | Burs & Stones | — | ACTIVE | 3 | 0 |
| 210 | ⁠ Endo Burs | — | endo-burs | 1 | Burs & Stones | — | ACTIVE | 4 | 0 |
| 211 | Pedodontics | طب أسنان الأطفال | pedodontics | 0 | — | — | ACTIVE | 13 | 0 |
| 212 | ⁠ Pediatric Crown & Band | — | pediatric-crown-band | 1 | Pedodontics | — | ACTIVE | 1 | 0 |
| 213 | ⁠ Pulpotomy & Pulpectomy | — | pulpotomy-pulpectomy | 1 | Pedodontics | — | ACTIVE | 2 | 0 |
| 214 | ⁠ Medication & Fluoride | — | medication-fluoride | 1 | Pedodontics | — | ACTIVE | 5 | 0 |
| 215 | Oral Care System | العناية بالفم والأسنان | oral-care-system | 0 | — | — | ACTIVE | 14 | 0 |
| 216 | ⁠ Interdental Cleaning | — | interdental-cleaning | 1 | Oral Care System | — | ACTIVE | 1 | 0 |
| 217 | ⁠ Mouthwash | — | mouthwash | 1 | Oral Care System | — | ACTIVE | 2 | 0 |
| 218 | ⁠ Toothbrush | — | toothbrush | 1 | Oral Care System | — | ACTIVE | 3 | 0 |

---

## F. CATEGORY HIERARCHY (tree view)

```
- Disposable Materials [ACTIVE, order=0, products=0]
  - Gloves [ACTIVE, order=1, products=7]
- Periodontics [INACTIVE, order=0, products=0]
- Sterilization Material [INACTIVE, order=0, products=0]
- Machine Inquiries [INACTIVE, order=0, products=0]
- Radiology [INACTIVE, order=0, products=0]
- Online Courses [INACTIVE, order=0, products=0]
- Others [INACTIVE, order=0, products=0]
- Books [INACTIVE, order=0, products=0]
- Surgery [INACTIVE, order=0, products=0]
  - Extraction Instruments [ACTIVE, order=0, products=4]
- Restorative [ACTIVE, order=1, products=0]
  - Composite Restorative Materials [ACTIVE, order=0, products=5]
  - Composite [ACTIVE, order=1, products=0]
  - Amalgam [ACTIVE, order=2, products=0]
  - Etch & Bond [ACTIVE, order=3, products=0]
  - Compomer [ACTIVE, order=5, products=0]
  - Base liner [ACTIVE, order=6, products=0]
  - Finishing & Polishing Rest [ACTIVE, order=7, products=0]
  - Caries detectors [ACTIVE, order=8, products=0]
  - Temporary Filling [ACTIVE, order=9, products=0]
  - Crown Form [ACTIVE, order=10, products=0]
  - Glass ionomer Rest. [ACTIVE, order=11, products=0]
  - fissure sealent [ACTIVE, order=12, products=0]
- Endodontics [ACTIVE, order=2, products=0]
  - Obturation Materials [ACTIVE, order=0, products=7]
  - Root Canal Sealer [ACTIVE, order=1, products=0]
  - Files & Reamers [ACTIVE, order=2, products=0]
    - K. FILL [ACTIVE, order=1, products=0]
    - H.FILL [ACTIVE, order=2, products=0]
    - Reamer [ACTIVE, order=3, products=0]
    - File Protaper [ACTIVE, order=4, products=0]
  - Nerve Broach [ACTIVE, order=3, products=0]
  - Paper Point & Gutta Percha [ACTIVE, order=4, products=0]
  - Rotary Files [ACTIVE, order=5, products=0]
  - Gates Glidden & Pesso Drills [ACTIVE, order=6, products=0]
  - Spearders & Pluggers [ACTIVE, order=7, products=0]
  - Endo Accessories [ACTIVE, order=8, products=0]
  - Vitality Testers [ACTIVE, order=9, products=0]
  - Medications & Irrigations [ACTIVE, order=10, products=0]
  - MTAs [ACTIVE, order=11, products=0]
  - Calcium Hydroxide [ACTIVE, order=12, products=0]
  - Zinc Oxide Restoration [ACTIVE, order=13, products=0]
  - Rubber dam [ACTIVE, order=14, products=0]
- Prosthodontics [ACTIVE, order=3, products=0]
  - Impression Material [ACTIVE, order=1, products=0]
  - Stainless Steel Crowns [ACTIVE, order=2, products=0]
  - Temporary Crown [ACTIVE, order=3, products=0]
    - Polycarbonate Crown [ACTIVE, order=1, products=0]
  - Core Material [ACTIVE, order=4, products=0]
  - Cements [ACTIVE, order=4, products=2]
    - G.I. Cement [ACTIVE, order=1, products=0]
    - Polycarboxylate Cement [ACTIVE, order=2, products=0]
    - Zinc Phosphate Cement [ACTIVE, order=3, products=0]
  - Posts [ACTIVE, order=5, products=0]
    - Fiber Posts [ACTIVE, order=1, products=0]
    - Metallic Posts [ACTIVE, order=2, products=0]
  - Soft liners [ACTIVE, order=6, products=0]
- Perio & Surgery [ACTIVE, order=4, products=0]
  - Haemostatics [ACTIVE, order=1, products=0]
  - Perio Packs [ACTIVE, order=2, products=0]
  - Soft Tissue Graft [ACTIVE, order=3, products=0]
  - Bone Graft [ACTIVE, order=4, products=0]
  - Scaling & Polishing [ACTIVE, order=5, products=0]
  - Surgical Medication [ACTIVE, order=6, products=0]
  - Suture Needle [ACTIVE, order=7, products=0]
- Orthodontics [ACTIVE, order=5, products=0]
  - Wires [ACTIVE, order=1, products=0]
  - Orthodontic Instruments [ACTIVE, order=2, products=0]
  - Elastic O-Tie & Ligature [ACTIVE, order=3, products=0]
  - Orthodontic Accessories [ACTIVE, order=4, products=0]
  - Brackets [ACTIVE, order=5, products=0]
  - Spring / Coils & Hooks [ACTIVE, order=6, products=0]
  - Buccal Tubes [ACTIVE, order=7, products=0]
  - Cheek Retractors [ACTIVE, order=8, products=0]
  - Bands [ACTIVE, order=9, products=0]
  - Screws [ACTIVE, order=10, products=0]
  - Adhesive [ACTIVE, order=11, products=0]
  - Photography [ACTIVE, order=23, products=0]
  - Intra Oral & Extra Oral [ACTIVE, order=24, products=0]
- Consumables [ACTIVE, order=6, products=0]
  - Protective Wear [ACTIVE, order=1, products=0]
    - Mask [ACTIVE, order=2, products=0]
    - Lab Coat [ACTIVE, order=3, products=0]
    - Gown [ACTIVE, order=4, products=0]
    - Scrubs [ACTIVE, order=5, products=0]
    - Protective Glasses [ACTIVE, order=6, products=0]
  - Matrix & Wedges [ACTIVE, order=2, products=0]
  - Isolation [ACTIVE, order=3, products=0]
  - Retraction [ACTIVE, order=4, products=0]
  - Occlusal Adjustment [ACTIVE, order=5, products=0]
  - Anesthesia [ACTIVE, order=6, products=0]
  - Disinfection & Steralization [ACTIVE, order=7, products=0]
  - XRay film & Material [ACTIVE, order=8, products=0]
    - XRay film [ACTIVE, order=1, products=0]
    - Protective Glass [ACTIVE, order=2, products=0]
  - Disposable Pouch [ACTIVE, order=9, products=0]
  - Saliva Ejector [ACTIVE, order=10, products=0]
  - Cotton Roll [ACTIVE, order=11, products=0]
  - Diagnostic Set [ACTIVE, order=12, products=0]
  - Tooth Picks [ACTIVE, order=13, products=0]
  - Barrier Film [ACTIVE, order=14, products=0]
  - Plastic Instrument Tray [ACTIVE, order=15, products=0]
  - Dental Needle [ACTIVE, order=16, products=0]
  - Fluoride Tray [ACTIVE, order=17, products=0]
  - Disposable Syringe [ACTIVE, order=18, products=0]
  - Chemicals [ACTIVE, order=19, products=0]
  - Towels [ACTIVE, order=20, products=0]
  - Disposable Cups [ACTIVE, order=21, products=0]
  - General items [ACTIVE, order=22, products=0]
    - Accessories [ACTIVE, order=1, products=0]
    - Student case [ACTIVE, order=2, products=0]
- Instruments [ACTIVE, order=7, products=0]
  - Filling instruments [ACTIVE, order=1, products=0]
  - Extraction Forceps [ACTIVE, order=2, products=0]
  - Elevators [ACTIVE, order=3, products=0]
  - Soft Tissue Instruments [ACTIVE, order=4, products=0]
  - Retractors [ACTIVE, order=5, products=0]
  - Impression Accessories [ACTIVE, order=6, products=0]
    - Aluminium Tray [ACTIVE, order=1, products=0]
    - Plastic Impression Tray [ACTIVE, order=2, products=0]
    - Stainless Steel Tray [ACTIVE, order=3, products=0]
  - Crown Remover & Caliber [ACTIVE, order=7, products=0]
  - Shade Guide [ACTIVE, order=8, products=0]
  - Articulation Adjustment [ACTIVE, order=9, products=0]
  - Mixing Guns [ACTIVE, order=10, products=0]
  - Scalers & Curettes [ACTIVE, order=11, products=0]
  - Condenser [ACTIVE, order=12, products=0]
  - Cotton Plier [ACTIVE, order=13, products=0]
  - Plier [ACTIVE, order=14, products=0]
  - Excavator [ACTIVE, order=15, products=0]
  - Explorer [ACTIVE, order=16, products=0]
  - Probe [ACTIVE, order=17, products=0]
  - Retainer [ACTIVE, order=18, products=0]
  - Scissors [ACTIVE, order=19, products=0]
  - Dispenser [ACTIVE, order=20, products=0]
  - Syring [ACTIVE, order=21, products=0]
  - Amalgam Carrier [ACTIVE, order=22, products=0]
  - Bone File [ACTIVE, order=23, products=0]
  - Bone Rongeur [ACTIVE, order=24, products=0]
  - Burnisher [ACTIVE, order=25, products=0]
  - Carver [ACTIVE, order=26, products=0]
  - Bone Curette [ACTIVE, order=27, products=0]
  - Bur Holder [ACTIVE, order=28, products=0]
  - Bur Brush [ACTIVE, order=29, products=0]
  - Surgical Blades & Blade Handles [ACTIVE, order=30, products=0]
    - Hand of Blade [ACTIVE, order=1, products=0]
  - Napkin Holder [ACTIVE, order=31, products=0]
  - Needle Holder [ACTIVE, order=32, products=0]
  - Periodontal File [ACTIVE, order=33, products=0]
  - Periosteal Elevator [ACTIVE, order=34, products=0]
  - Wax Knife [ACTIVE, order=35, products=0]
  - Wax Carver [ACTIVE, order=36, products=0]
  - Dappen Dish [ACTIVE, order=37, products=0]
  - mirror [ACTIVE, order=38, products=0]
  - hand mirror [ACTIVE, order=39, products=0]
  - Puncture [ACTIVE, order=40, products=0]
  - Rubber Dam Clamp Forceps [ACTIVE, order=41, products=0]
  - Metal frame [ACTIVE, order=42, products=0]
  - Rubber Dam Clamp [ACTIVE, order=43, products=0]
  - Hand Plugger [ACTIVE, order=44, products=0]
  - Hand Spreader [ACTIVE, order=45, products=0]
  - Spatula Cement [ACTIVE, order=46, products=0]
- Equipments [ACTIVE, order=8, products=0]
  - Dental Unit [ACTIVE, order=1, products=0]
  - Dental Unit Parts & Accessories [ACTIVE, order=2, products=0]
  - Light Cure [ACTIVE, order=3, products=0]
  - Endomotor [ACTIVE, order=4, products=0]
  - Apex Locator [ACTIVE, order=5, products=0]
  - Handpieces [ACTIVE, order=6, products=0]
    - Straight Handpiece [ACTIVE, order=1, products=0]
    - Low Speed Handpiece [ACTIVE, order=2, products=0]
    - Air motor [ACTIVE, order=3, products=0]
    - Air motor Kit [ACTIVE, order=4, products=0]
    - High-Speed Handpiece [ACTIVE, order=5, products=0]
  - Micromotor [ACTIVE, order=7, products=0]
  - Amalgamator [ACTIVE, order=8, products=0]
  - Compressor [ACTIVE, order=9, products=0]
  - Autoclav [ACTIVE, order=10, products=0]
  - Obturation Systems [ACTIVE, order=11, products=0]
  - GuttaPercha Cutter [ACTIVE, order=12, products=0]
  - CAD/CAM [ACTIVE, order=13, products=0]
  - Water Distiller [ACTIVE, order=14, products=0]
  - Ultrasonic Cleaner [ACTIVE, order=15, products=0]
  - Ultrasonic Scaler [ACTIVE, order=16, products=0]
  - Sealing Machine [ACTIVE, order=17, products=0]
  - Xray unit [ACTIVE, order=18, products=0]
  - XRay Sensor [ACTIVE, order=19, products=0]
  - Intraoral Camera [ACTIVE, order=20, products=0]
  - XRay Viewer [ACTIVE, order=21, products=0]
  - Loups [ACTIVE, order=22, products=0]
  - Soft Tissue Laser [ACTIVE, order=23, products=0]
  - Hand pressing [ACTIVE, order=24, products=0]
  - Prophy Jet [ACTIVE, order=25, products=0]
  - Cartidge [ACTIVE, order=26, products=0]
- Implant [ACTIVE, order=9, products=0]
- Dental lab [ACTIVE, order=10, products=0]
  - Acrylic [ACTIVE, order=1, products=0]
  - Porcelain metal [ACTIVE, order=2, products=0]
- Bleaching [ACTIVE, order=11, products=0]
  - Whitening Material [ACTIVE, order=1, products=0]
- Burs & Stones [ACTIVE, order=12, products=0]
  - Diamond [ACTIVE, order=1, products=0]
    - Diamond Low Speed [ACTIVE, order=1, products=0]
    - Diamond High Speed [ACTIVE, order=2, products=0]
  - Carbid [ACTIVE, order=2, products=0]
    - Carbid Low Speed [ACTIVE, order=1, products=0]
    - Carbid High Speed [ACTIVE, order=2, products=0]
  - Surgical Burs [ACTIVE, order=3, products=0]
  - Endo Burs [ACTIVE, order=4, products=0]
- Pedodontics [ACTIVE, order=13, products=0]
  - Pediatric Crown & Band [ACTIVE, order=1, products=0]
  - Pulpotomy & Pulpectomy [ACTIVE, order=2, products=0]
  - Medication & Fluoride [ACTIVE, order=5, products=0]
- Oral Care System [ACTIVE, order=14, products=0]
  - Interdental Cleaning [ACTIVE, order=1, products=0]
  - Mouthwash [ACTIVE, order=2, products=0]
  - Toothbrush [ACTIVE, order=3, products=0]
```

---

## G. CATEGORY SUMMARY

| Metric | Value |
|---|---|
| Total categories | **218** |
| Top-level (no parent) | **23** |
| Child/subcategories | **195** (163 at depth 1, 32 at depth 2) |
| Max depth | 3 levels (0, 1, 2) |
| Active | 210 |
| Inactive | 8 (all top-level) |
| Draft | 0 |
| With `externalCategoryId` (`EXCEL_IMPORT` source) | 9 |
| Duplicate names | **0** |
| Orphan `parentId` (points at a non-existent category) | **0** |
| Circular references | **0** |

**The 8 inactive categories are all top-level:** `Periodontics`, `Sterilization Material`, `Machine Inquiries`, `Radiology`, `Online Courses`, `Others`, `Books`, `Surgery`. Per prior project context, these are legacy/flat categories left over from before the current Excel-based taxonomy import and were deliberately deactivated (not deleted, to preserve history) rather than reconnected into the new tree.

---

## H. PRODUCT → BRAND/CATEGORY RELATIONSHIP

From `Product` in `server/prisma/schema.prisma`:

1. **Brand link:** `Product.brandId` (`String?`, FK → `Brand.id`, `onDelete: SetNull`) via the relation `brandRecord`. There is also a legacy plain-text `Product.brand` (`String?`) column that both import paths keep in sync with `brandRecord.name`, but it is not itself a foreign key and is not authoritative.
2. **Primary category link:** `Product.categoryId` (`String?`, FK → `Category.id`, `onDelete: SetNull`) via the relation `categoryRecord`. Same pattern: a mirrored plain-text `Product.category` (`String?`) column exists alongside it.
3. **Secondary/multiple categories: not supported.** There is no join table between `Product` and `Category` — a product has exactly one `categoryId`, full stop. If Toothpick data implies multiple categories per product, only one can be stored as the primary category today; that is a schema gap, not something fixed by this audit.
4. Both `brandId` and `categoryId` are **nullable** — a product can exist with no brand and/or no category.

---

## I. IMPORT MATCHING RULES

Two separate code paths can write Brand/Category/Product data. For a 13,188-row Toothpick batch, the relevant one is the bulk **Catalog Import** pipeline (this is also documented in `docs/catalog-import-contract-v1.md`, which this section cross-checks against the code in `server/src/services/catalogImport.service.js`):

### Bulk Catalog Import pipeline (`CatalogImportBatch` / `CatalogImportRow`, preview-first)
- **Products** are matched (in this order, first hit wins) by: `sourceSystem` + `externalProductId`, then case-insensitive `sku`, then `slug`. Two different identifiers resolving to two different existing rows = `CONFLICT`, never silently merged.
- **Brands** (as their own `BRANDS` rows in the batch) are matched by: `sourceSystem` + `externalBrandId`, then exact case-insensitive `name`.
- **Categories** (as their own `CATEGORIES` rows) are matched by: `sourceSystem` + `externalCategoryId`, then exact case-insensitive `name`. A category's parent is referenced by `parentExternalCategoryId`, resolved the same way — never by raw database ID.
- **A Product row's brand/category reference** is resolved via `brandExternalId` / `categoryExternalId` on that row, matched only against `Brand.externalBrandId` / `Category.externalCategoryId` scoped to `sourceSystem`. **Matching is by external ID, not by database ID, slug, or name**, for this linkage specifically.
- Apply order is fixed: `BRANDS → CATEGORIES → PRODUCTS → ...` inside one transaction, so a brand/category can be defined as its own row earlier in the *same* batch and a product row later in that same batch can reference it — it does not have to already exist in the database beforehand.
- **Must Brand/Category already exist?** Effectively yes, but "exist" means either (a) already in the database, matched by `sourceSystem`+external ID, or (b) present as its own `BRANDS`/`CATEGORIES` row anywhere earlier in the same import batch. Nothing auto-creates a brand/category purely from a product row's reference.
- **Unknown brand/category reference on a product row:** the row is classified `ERROR` at preview time (`"brandExternalId ... was not found in the database or earlier in this import."` / same wording for category) and is **never applied** — the product is not created, and the whole erroring row blocks nothing else in the batch (other valid rows can still apply), but that specific product is skipped until fixed.

### Admin dashboard single-product editor (`server/src/controllers/adminCatalog.controller.js`)
- Matches Brand/Category strictly by **internal database `id`** (a dropdown selection), via `resolveBrand(id)` / `resolveCategory(id)`.
- **Unknown ID:** HTTP 400, `"Brand not found."` / `"Category not found."` — the request is rejected outright. Nothing is auto-created.
- Not the relevant path for a 13,188-row bulk import; only worth knowing this exists as a second, ID-only matching path.

### Practical implication for the Toothpick mapping
Every Toothpick brand/category that doesn't already have an `externalBrandId`/`externalCategoryId` match in the DB (see Section C — only 18 of 578 brands and 9 of 218 categories currently carry an external ID) needs either: (a) a `BRANDS`/`CATEGORIES` sheet/row included in the same import batch defining it (preferred — creates it and links products to it in one pass), or (b) to be pre-matched to an existing brand/category by exact name before the batch is built, since name is the only other match key and it's case-insensitive but must be an **exact** string match (no fuzzy matching in the importer).

---

## J. ISSUES OR DUPLICATES FOUND

1. **No true duplicate brand or category names** — exact and normalized (case/punctuation-insensitive) checks both return zero.
2. **Three brand records look like generic/source placeholders rather than real manufacturers:** `Generic`, `Generic (unbranded)` (has `BR-GENERIC` external ID, country Pakistan, 3 products already), and `Chinese` (a country-of-origin label, not a brand). Decide before mapping whether Toothpick's "no brand" rows should target one of these or get their own placeholder.
3. **Inconsistent state: `Surgery` (top-level category) is `INACTIVE`, but its child `Extraction Instruments` is `ACTIVE` with 4 products attached.** An inactive parent with an active, populated child is contradictory for menu/visibility purposes — worth a decision (reactivate `Surgery`, or move `Extraction Instruments` under an active parent) before more products land under it. Not changed as part of this read-only audit.
4. **Only 578 of 578 brands are ACTIVE and only 210 of 218 categories are ACTIVE** — i.e. there are currently zero brands in `INACTIVE`/`NEEDS_LOGO` status and zero categories in `DRAFT`, so those statuses exist in the schema but are unused today.
5. **Only 18 brands and 9 categories carry `sourceSystem`/external IDs** (all from the `EXCEL_IMPORT` batch); the other 560 brands and 209 categories have `sourceSystem = null`. That's fine for name-based matching, but means the Toothpick import can't rely on external-ID matching for the vast majority of existing brands/categories — it will fall through to exact-name matching for those.
6. **No `nameAr` field exists on `Brand`** and **no `show_in_menu` field exists on `Category`** — if the Toothpick mapping expects either, that's a schema gap, not something already available.
7. **The database currently has only 30 real `Product` rows** — this is effectively a pre-import/pilot state, consistent with preparing for the 13,188-row Toothpick catalogue as the first real bulk load.
8. Algorithmic near-duplicate brand-name candidates were checked and are **not** flagged as real issues (see Section C) — spot-checking confirms the dental-supply market genuinely has many similarly-spelled but distinct manufacturer names.

---

## Files written by this audit

- `docs/catalogue-audit/existing-brands.json` — 578 brand records, full field set, sorted A→Z
- `docs/catalogue-audit/existing-categories.json` — 218 category records, full field set, with computed `parentName` and `depth`, sorted by hierarchy
- `docs/catalogue-audit/brand-category-audit.md` — this report
