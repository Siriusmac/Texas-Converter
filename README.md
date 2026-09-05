# Texas Converter

Una webapp italiana che converte lunghezze e superfici metriche in frazioni, multipli e sottomultipli del Texas. Interfaccia western responsive, illustrazione originale e font locale; nessun account, backend o tracciamento.

## Avvio

Richiede Node.js 20 o successivo. Non ci sono dipendenze da installare.

```sh
node server.mjs
# http://localhost:5173
node --test tests/*.test.mjs
node build.mjs
```

La build genera `dist/`, pubblicabile su un hosting statico. I percorsi sono relativi e supportano un sottopercorso. Il server di sviluppo ascolta solo su localhost. Non è un server di produzione.

## Funzioni

- Lunghezza: mm, cm, metri, km. Superficie: mm², cm², m², km².
- Virgola o punto decimale, notazione scientifica; non usare separatori delle migliaia.
- Risultato con quattro cifre significative, frazione approssimata e prefisso da picoTexas a teraTexas.
- 40 confronti: 8 stati USA, 7 continenti/regioni continentali, diametri e superfici stimate degli 8 pianeti, Luna e Sole, 5 distanze o unità astronomiche.
- Filtri, ricerca, caricamento progressivo e selezione di esempi nel convertitore.
- Font e immagini locali, controlli da tastiera, etichette accessibili, aggiornamenti annunciati e movimento ridotto.

## Riferimenti e limiti

Lunghezza: 773 miglia × 1,609344 = 1.244,022912 km. Il riferimento geografico di partenza è approssimato. Fonte: [Texas Almanac, 1992–1993, p.74](https://texashistory.unt.edu/ark:/67531/metapth279642/m1/78/).

Superficie: 695.662 km², terre e acque del Texas; riferimento [Census 2010](https://www.census.gov/geographies/reference-files/2010/geo/state-area.html), anche per gli stati USA. L'area non è il quadrato della larghezza.

Diametri equatoriali: [NASA](https://science.nasa.gov/solar-system/planets/planet-sizes-and-locations-in-our-solar-system/). Luna e Sole: diametro doppio dei raggi arrotondati di 1.740 e 700.000 km riportati nelle rispettive pagine NASA. Le superfici πd² sono stime sferiche, non aree geodetiche: per pianeti gassosi e Sole non indicano una superficie solida.

Continenti: [dataset JSONLint](https://jsonlint.com/datasets/continents.json); aree indicative secondo convenzioni geografiche, con Oceania comprensiva di Australia e isole del Pacifico.

Unità astronomiche: [IAU](https://iauarchive.eso.org/public/themes/measuring/). au = 149.597.870,7 km; anno luce = c × 365,25 giorni; parsec = 648.000/π au; secondo luce = 299.792,458 km. Terra–Luna è una distanza media di 384.400 km, non la distanza in tempo reale.

Le frazioni con denominatore ≤32 sono usate se l'errore relativo è ≤1%; per valori più piccoli è mostrato un reciproco approssimato. I prefissi Texas sono un espediente divulgativo. Calcoli IEEE-754: valori fuori intervallo sono segnalati.

## Struttura

`src/converter.js`: calcoli puri; `src/catalog.js`: dati e fonti; `src/app.js`: interazioni DOM; `src/style.css`: stile responsive; `tests/`: test delle conversioni.

Font Alfa Slab One distribuito secondo `public/FONT-LICENSE.txt`. Illustrazione generata con ImageGen integrato; indicazioni creative in `docs/design.md`.

## Pubblicazione e verifiche

Repository: https://github.com/Siriusmac/Texas-Converter.
Indirizzo GitHub Pages: https://siriusmac.github.io/Texas-Converter/.

Il workflow `.github/workflows/pages.yml` esegue i test, genera `dist/` e pubblica esclusivamente i file del sito su GitHub Pages a ogni push su `main`. È disponibile anche l'avvio manuale da GitHub Actions. Nelle impostazioni Pages della repository, la sorgente deve essere GitHub Actions. Non occorrono segreti personalizzati.

Verificati build, 4 test automatici e interazioni nel browser integrato su desktop e viewport mobile 390×844. Safari e dispositivi fisici non ancora verificati.
