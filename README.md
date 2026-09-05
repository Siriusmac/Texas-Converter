# Texas Converter

Una webapp italiana che converte lunghezze e superfici metriche in frazioni, multipli e sottomultipli del Texas. Interfaccia western responsive, illustrazione originale e font locale; nessun account o backend proprietario. La ricerca online facoltativa consulta Wikidata.

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
- Ricerca online di città e regioni tramite Wikidata, con selezione del luogo, superficie, data e indicazione dei riferimenti disponibili.
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

## Ricerca di città e regioni

Scrivere nel campo continua a filtrare l'atlante locale. Premere **Cerca online** (o Invio) invia il nome a `https://www.wikidata.org/w/api.php`, senza credenziali, per cercare fino a otto corrispondenze in italiano con fallback delle etichette in inglese. I filtri dell'atlante non limitano la ricerca online.

`src/places.js` usa `wbsearchentities`, poi `wbgetentities` in un'unica richiesta per i candidati. Seleziona voci con coordinate, paese o unità amministrativa e indizi geografici (superficie, popolazione, suddivisioni, capitale, confini o tipi di insediamento noti). Questo filtro è conservativo, non una classificazione esaustiva: alcuni luoghi possono non essere trovati. Non è una ricerca generale sul web né una stima basata su una mappa rettangolare.

Legge la proprietà **P2046**, convertendo km², m² ed ettari in km²; non deduce la larghezza dalla superficie. Esclude rank deprecati, seleziona i rank preferiti quando presenti ed esclude qualificatori diversi da date, in particolare superfici parziali. Unità sconosciute e valori non positivi non vengono convertiti. Se restano più misure le mostra tutte, con le date disponibili, senza sceglierne una arbitrariamente. Il dato può essere datato, non riferito o incompleto: l'interfaccia lo esplicita e collega la scheda Wikidata. Il collegamento punta alla proprietà con i riferimenti, non certifica l'ufficialità del valore.

`src/place-search.js` gestisce selezione, stati vuoti/errori, annullamento quando cambia la ricerca e protezione da risposte obsolete. Ogni ricerca ha un timeout di 15 secondi; fino a 20 ricerche restano in memoria per 5 minuti, senza persistenza. La conversione selezionata passa a Superficie/km² e conserva la provenienza; modificare manualmente la misura elimina l'attribuzione precedente. Nessuna query viene inviata mentre si scrive. La disponibilità online dipende da Wikidata e dalla connessione.

Fonti tecniche: [Wikibase API](https://www.mediawiki.org/wiki/Wikibase/API/en), [CORS](https://www.mediawiki.org/wiki/API:Cross-site_requests/en), [P2046](https://www.wikidata.org/wiki/Property:P2046).

Font Alfa Slab One distribuito secondo `public/FONT-LICENSE.txt`. Illustrazione generata con ImageGen integrato; indicazioni creative in `docs/design.md`.

## Icona nella schermata Home

L'icona raffigura il Texas con la Lone Star e una freccia graduata, in crema e rosso mattone. In `public/icons/` sono inclusi il master PNG 1024×1024, le icone 192×192 e 512×512, l'Apple touch icon 180×180 e la favicon 32×32. Gli angoli sono applicati dal sistema operativo.

`public/site.webmanifest` definisce nome, icone, ambito e avvio in modalità standalone, con percorsi relativi compatibili con GitHub Pages. La Home su iOS usa il collegamento `apple-touch-icon` nell'HTML. La configurazione non aggiunge una modalità offline. Il salvataggio su dispositivi fisici iOS/Android richiede ancora una verifica. Se un collegamento preesistente conserva la vecchia icona, rimuoverlo e aggiungerlo nuovamente dal sito aggiornato.

## Pubblicazione e verifiche

Repository: https://github.com/Siriusmac/Texas-Converter.
Indirizzo GitHub Pages: https://siriusmac.github.io/Texas-Converter/.

Il workflow `.github/workflows/pages.yml` esegue i test, genera `dist/` e pubblica esclusivamente i file del sito su GitHub Pages a ogni push su `main`. È disponibile anche l'avvio manuale da GitHub Actions. Nelle impostazioni Pages della repository, la sorgente deve essere GitHub Actions. Non occorrono segreti personalizzati.

Verificati build, 9 test automatici, ricerche reali di Padova e Veneto, selezione con conversione, assenza di risultati e sostituzione della ricerca in corso nel browser integrato su desktop e viewport mobile 390×844. Safari e dispositivi fisici non ancora verificati.
