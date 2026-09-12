# Az 5. mérföldkő ellenőrzése

Oldal: `fejezetek/05-prolog-es-fuzzy.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 122–141. fájloldal.

Csak az 5. mérföldkő készült el. A kezdőlap és a negyedik fejezet már ide vezet. A 6–10. fejezet továbbra sem aktív. A közös téma, kvíz és haladás kódját újra használjuk. Nincs új projektfüggőség vagy szerveroldali kód.

## Lefedettség

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 122–123 | Prolog eredete, célja, deklaratív jelleg, sorrend, logika és vezérlés | `#prolog`, `#prolog-idovonal` |
| 124–125 | Tény, szabály, fej, törzs, cél, Horn-klóz, SLD-rezolúció, symbol és termek | `#prolog`, `#kereses`, `#eszkozok` |
| 125–126 | Változók, true és fail, rendszerpredikátumok, beolvasás, kiírás, circle, infix relációk, aritmetika, metahívás, klózok mint adatok | `#rendszerpredikatumok` és kiigazításai |
| 126 | assert, retract, fej–farok lista, rekurzió, cut és ára | `#lista-pelda`, `#eszkozok`, `#kereses` |
| 127 | A teljes Kleopátra–Gina–Ursula program; régi Turbo Prolog blokkjai és mai alakja | `#kleopatra-program` |
| 128–129 | Egyesítés, visszalépés, hátraláncolás, F1/F2 részcélfa és a levelek értelme | `#hatralanc`, `#altalanos-fa` |
| 130–131 | Mindkét ténysorrend keresőfája, kötései és eredménye; vágással elvesző válasz | `#keresofak`, `#prolog-labor` |
| 132–134 | Zadeh, fuzzy halmaz, nyelvi érték, tagsági fok és függvény, hórihorgas 200 cm → 0,9 | `#tagsag`, `#horihorgas` |
| 135 | Rámpa, lineáris váll, általánosított harang, háromszög, trapéz, Gauss; közép, szélesség, meredekség, szórás | `#gorbe-alakok`, `#gorbe-labor` és kapcsolódó szöveg |
| 136 | Öt hőmérsékleti címke, összes töréspont, átfedés és kvartilisalapú kerítések | `#homerseklet-halmazok` |
| 137–138 | Előzmény, következmény, nyelvi tagság, minimum ÉS és maximum VAGY | `#kovetkeztetes`, `#fuzzy-muveletek` |
| 139 | Együttes következtetés, levágás, egyesítés; három defuzzifikálási elv és korlátai | `#fuzzy-folyamat`, `#defuzz-modszerek` |
| 140 | Mindkét vizsgaszabály, tagságok, két minimum, közös görbe és számszerű kimenet | `#vizsga`, `#vizsga-parameterek`, `#vizsga-levezetes`, `#vizsga-labor` |
| 141 | Mérés, fuzzifikálás, szabálybázis, következtetés, defuzzifikálás, fizikai beavatkozás és visszacsatolás | `#szabalyozasi-kor`, `#fuzzy-kod` |

A 129., 135., 136. és 140. oldalt külön képként is megvizsgáltuk. A tartalmuk nem maradt ki a szövegkinyerés miatt. A történet idővonalat, a keresési alternatívák fákat, az összevetések párhuzamos nézetet, a számítások lépéssort kaptak. A magyarázatok nem rejtett elemek. Nincs kitalált forrásidézet.

A 11 kiigazítás kezeli az első Prolog dátumát, a Horn-klóz fogalmát, a keresés sorrendjét és korlátait, a cut lehetséges válaszvesztését, az egyesítés és aritmetika különbségét, a Prolog-változatokat, Zadeh nevének elírását, a tagság és valószínűség különbségét, a minimum–maximum módszer hatókörét, a maximumhelyek többértelműségét és a hiányos vizsgaszabályokat.

A vizsgalabor számozott skálája saját oktatási kiegészítés. A PDF nem ad elegendő paramétert az egyetlen számszerű eredmény rekonstruálásához. A fejezet ezt világosan jelzi, és minden használt töréspontot megad.

## Kód és próbák

A kapcsolódó oktatói fájlokat a fejezet megírása előtt áttekintettük:

- `resources/code/12_Logika.py`: a nagyszülőszabály változatlan részlete a közös változó és a két összekapcsolt reláció magyarázatánál szerepel. A két választ kézzel vezettük le. A pyDatalog programot nem futtattuk, és nem állítjuk, hogy a Prolog mélységi vezérlését követi.
- `resources/code/11_Fuzzy.py`: a bemeneti tartományok, automatikus tagsági függvények, mindhárom szabály, bemenetek és kimenetszámítás a szabályozási magyarázatba épültek. A megjegyzésben álló görbefajták és a MOM-változat is magyarázatot kapott.

A fuzzy Python-kód számítási részét scikit-fuzzy 0.5.0-val, ideiglenes `uv run --no-project` környezetben futtattuk. Csak a grafikus háttér lett Agg a TkAgg helyett; a `view()` és `plt.show()` hívásokat kihagytuk. A projekt forrásfájlja nem változott. A tényleges eredmény `1.6499999999999997`, a módszer `centroid`. A tananyag 1,65-öt ír. A 0,1,2,3 kimeneti rács mintavételezését külön megmagyarázza.

A felhasználó jóváhagyta a Prolog-nyomkövetés, a fuzzy matematika és a lapvezérlők tesztelését. A modell első próbája, majd a cut, a tagsági görbék és a vizsgaszámítás próbája hibázó futással indult. Mindhárom labor vezérlését külön hibázó böngészős próba előzte meg. A típusellenőrzés és az egyes tesztfájlok többször futottak. A kvíz és az olvasási nézetek további ellenőrzést kaptak.

Végső futtatások:

- `npm run typecheck`: sikeres.
- `npm test`: 33 sikeres teszt, ebből 5 az új modellé.
- `npm run test:browser -- --workers=2`: 120 sikeres futás, ebből 16 az ötödik fejezeté.
- `git diff --check`: sikeres.

A modellpróbák mindkét ténysorrendet vágással és nélküle ellenőrzik. A fuzzy próbák a görbék csúcsait, vállait és széleit, az ismert vizsgaszámítást, egyetlen aktív szabályt, holtversenyt, nulla aktivitást és hibás bemenetet vizsgálnak. A vizsgapélda elvárt súlypontja független kézi integrálásból származik: terület 5/8, első nyomaték 253/96, súlypont 253/60. A számítás a görbe töréspontjai között pontosan integrál, nem a rajz pixeleit vagy durva mintarácsát használja.

A böngészőpróbák ellenőrzik a léptetést, a sorrend és vágás utáni tiszta újraindulást, a csúszkák billentyűzetes használatát, a három kimeneti módszert, az üres kimenet jelzését és a visszaállítást. Mind a tíz helyes kvízválaszt, a hiányzó és hibás válasz kezelését, a kihagyást és az újrakezdést is ellenőrzik. A haladás külön mentődik az ötödik fejezethez.

A lap `/ai-alapok/` alkönyvtárból és közvetlen `file://` megnyitással is működik. JavaScript nélkül minden szükséges magyarázat és megoldott példa látható. A nyomtatási próbák mindkét témában ellenőrzik az olvasási elemek és szövegük megmaradását.

Ellenőrzött szélességek: 320, 390, 768, 1024 és 1365 pixel. Világos és sötét témában sincs oldalsó túlnyúlás, a kitöltött keresési nyomkövetéssel sem. A rendszer csökkentettmozgás-beállítását a közös CSS kezeli. Képen is ellenőriztük a világos asztali nyitóképet, a sötét telefonos nyitóképet, a keresőfákat és a vizsgalabort. Ideiglenes nyomtatott PDF-ben a paramétertábla és a teljes számítás is olvasható.

Axe WCAG 2 A/AA: világos asztali és sötét telefonos nézetben 0 automatikus hiba. A tíz SVG-tengelyfelirat kontrasztját az eszköz kézi ellenőrzésre hagyta. A szöveg és a labor háttere közötti arány 13,82:1, illetve 14,58:1. Mindkettő meghaladja a 4,5:1 határt. A görbevonal és háttér aránya 7,50:1, illetve 9,18:1. A telefonos tengelyfeliratok külön nagyítást kaptak. Az automatikus audit nem teljes hozzáférhetőségi bizonyítvány.

Nem észleltünk JavaScript-hibát. Nincs `eval`, bevitelt HTML-ként beszúró kód, hálózati adatküldés vagy beírt Prolog/Python futtatása. A böngészőnek nem kell Python-csomag.

## Szabályok szerinti kódellenőrzés

A felhasználó által jóváhagyott kiindulópont: `4d304c694c307eacea37ffd79f3487b9f2777010`.

A vizsgálat a kiindulópont és a munkapéldány változásait nézte, az új fájlok teljes tartalmával együtt. Forrásai: `AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md`, a code-review skill kódszag-listája és a meglévő modulok mintája.

Ebben a munkamenetben nincs alügynök-indító eszköz. A két szempontot ezért kézzel, külön ellenőriztük. Nem készült független, párhuzamos alügynöki review.

A modell és a lapvezérlés külön fájlban maradt. A téma, kvíz és haladás közös kódja nem kapott másolt változatot. A két fuzzy rajz ugyanazt a koordináta-átváltást használja. A numerikus módszer véges, a Prolog-nyomkövetés rögzített kis programot kezel. A felület nem ígér általános értelmezőt.

A vizsgálat során a telefonos tengelyszámok nagyobb betűméretet kaptak. A kiadás leírásából korábban hiányzó `resources/` mappát pótoltuk, mert a fejezet helyi PDF- és kódhivatkozásai igénylik.

Nincs nyitott szabálysértés.

## Specifikáció szerinti kódellenőrzés

Forrás: `TERV.md`, 5. mérföldkő; `LEFEDETTSEGI_TERKEP.md`, 5. mérföldkő; a PDF 122–141. oldala.

Javított eltérések:

- A Prolog-léptető szabálykibontási sora a cut bekapcsolását is mutatja, nem csak a későbbi vágási lépés.
- A fuzzy Python-példa első becsült kimenetét tényleges könyvtárfuttatással ellenőriztük és 1,65-re javítottuk. A durva kimeneti rács magyarázata megmaradt.
- Zadeh nevének javítása külön kiigazításdobozba került, nem maradt néma helyesbítés.

Mind az öt kért interakció megvan a három laborban: léptetés, ténysorrendcsere, cut-kapcsoló, tagságifüggvény-rajzolás és élő vizsgajegyszámítás. Az opcionális kvíz tíz kérdéses. A következő fejezet anyagát nem valósítottuk meg előre.

Összesítés: 0 nyitott szabályeltérés; 0 nyitott specifikációs hiány.
