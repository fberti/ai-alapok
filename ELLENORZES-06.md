# A 6. mérföldkő ellenőrzése

Oldal: `fejezetek/06-neuralis-halozatok.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 142–221. fájloldal.

Csak a 6. mérföldkő készült el. A kezdőlap és az ötödik fejezet már ide vezet. A 7–10. fejezet továbbra sem aktív. A közös téma, kvíz és haladás kódját újra használjuk. Új modul: `assets/js/neural.js` (számítási modell), `assets/js/chapter-six.js` (laborvezérlés), `assets/js/chapter-six-quiz.js`, `assets/css/chapter-six.css`. Nincs új projektfüggőség vagy szerveroldali kód.

## Lefedettség

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 143–145 | Motiváció négy összetevője, ANN-meghatározás (idézet), szubszimbolikus, konnekcionista, adaptív háló, eltérések a numerikus algoritmusoktól | `#motivacio` |
| 146–147 | Statisztikai, operációkutatási és analízisfeladatok; nyolc működési jellemző | `#motivacio` |
| 148 | Mind a kilenc alkalmazási példa, feladattípussal | `#alkalmazas-lista` |
| 149–152 | Rosenblatt, biológiai analógia, neuronábra, képlet, torzítás, u/o/w/a jelölések, aggregáció | `#neuron`, `#neuron-abra`, `#jelolesek` |
| 153–166 | Aktivációk általános tulajdonságai; mind a 11 függvény képlete és grafikonja; Swish és ELU paraméteres rajza | `#aktivacio`, `#aktivacios-galeria`, `#aktivacio-tablazat` |
| 167–176 | Topológia, gráf, CAM, neurontípusok, rétegek, előre- és visszacsatolás, négy visszacsatolásfajta, konvergencia, oszcilláció, belső állapot | `#topologia`, `#neurontipusok`, `#elore-vissza`, `#visszacsatolas` |
| 177 | A teljes megfeleltetési táblázat | `#megfeleltetes` |
| 178–181 | Topológiaválasztás, alul- és túlméretezés, approximáló és interpoláló görbe, univerzális közelítés, optimális agykárosítás, hálónövesztés, csempéző algoritmus | `#meretezes`, `#illesztes-labor`, `#metszes-noveszes` |
| 182–183 | MP-neuron öt előfeltevése, formális modell, egységugrás | `#mp-neuron`, `#neuron` |
| 184–188 | Perceptron, retinamodell, lineáris szeparálhatóság, hipersík, tanítási lépések, leállási feltételek | `#perceptron`, `#perceptron-lepesek`, `#perceptron-pelda` |
| 189–191 | Widrow–Hoff-szabály, Minsky–Papert, egyenes egyenlete, VAGY és XOR | `#perceptron`, `#vagy-xor` |
| 192 | Adaline | `#perceptron` |
| 193–195 | MLP, XOR-háló kézi súlyokkal, a lépcsőfüggvény három tanítási gondja | `#tobbretegu`, `#xor-halo`, `#lepcso-gond` |
| 196 | Modellmentes közelítés (idézet) | `#tanulas` |
| 197–203 | Tanulás definíciója, felügyelt tanulás formálisan, veszteség, általánosítás, hibajavító, megerősítő és sztochasztikus tanulás | `#felugyelt-formalis`, `#tanulasi-modok` |
| 204–206 | Felügyelet nélküli tanulás, jellemzőkinyerés, kritériumfüggvények, entrópia, kölcsönös információ, KL-divergencia | `#felugyelet-nelkul`, `#informacio` |
| 207–209 | Hebb- és delta szabály, gradienscsökkentés, egy neuron deriváltja | `#hebb-delta`, `#gradiens`, `#derivalt-levezetes` |
| 210–212 | Hibavisszaterjesztés képletei és lépései, ritka és ugró háló, topológiai sorrend | `#visszaterjesztes`, `#bp-lepesek`, `#bp-pelda` |
| 213–214 | Modelljellemzők, a hálót meghatározó hat összetevő | `#jellemzok`, `#tervezes` |
| 215–217 | Tervezési kérdések, hat minősítő jellemző, hét fejlesztői szempont | `#tervezes`, `#minosites` |
| 218 | Versengő, együttműködő és normalizáló mechanizmus | `#mechanizmusok` |
| 219–221 | Betanítási szempontok és a teljesítmény összetevői | `#tervezes`, `#teljesitmeny` |

A képként tárolt oldalakat (150–151, 155–166, 175, 183, 185, 188–191, 194, 207, 209–212) képként is átnéztük. Az időrend idővonalat, az összevetések párhuzamos nézetet, a folyamatok lépéssort kaptak. A két kiemelt idézet és a Kiigazítás-dobozok idézőjeles részletei szó szerinti PDF-szövegek, oldalszámmal.

A 17 kiigazítás. A PDF-ről: a mai hálók és az agy, a történeti alkalmazások, Rosenblatt szerepe, az aktivációk tulajdonságai és csoportosítása, a lineáris aktiváció, a lépcső deriváltja, a szigmoid mai szerepe, a visszacsatolt hálók működése, az univerzális közelítés, a hipersík és az origó, a delta szabály, a „mindig létezik” idézet, a megerősítéses tanulás besorolása, a derivált előjele, a zajtűrés és az átláthatóság. Az oktatói kódról: a `learn_delta` és a Keras-kiértékelés.

## Kód és próbák

A kapcsolódó oktatói fájlokat a fejezet megírása előtt áttekintettük:

- `resources/code/13_Neuralis_halo_kezzel.py`: a négy aktivációs függvény az aktivációs résznél, a `learn_delta` a hibavisszaterjesztésnél szerepel. A tanítást Python 3-mal 100 véletlenmaggal futtattuk. A tanítórész változatlan, csak a kiírásokat hagytuk ki. Eredmény: egyik futás sem tanulta meg mind a 4 XOR-mintát. 93 futás 3 helyes mintánál állt meg, 7 futás `OverflowError` hibával leállt. Saját, jelölt javítással, azonos beállítással mind a 100 futás mind a 4 mintát megtanulta. Rejtett hiba is kiderült: a „Relu” felirat után `test(threshold)` áll.
- `resources/code/14_Neuralis_halo_keras.py`: a modellépítést, a hat aktivációt és a kiértékelést magyarázzuk. Nem futtattuk, mert TensorFlow, Keras és egy hiányzó `iris.data` fájl kellene. A tanítóadaton mért pontosságot és a Keras `threshold` függvényét kiigazítás tárgyalja.

A tesztvezérelt munka két határfelületen folyt: a `neural.js` modell és a laborvezérlés között. Minden modellfüggvény próbája előbb hibázva futott, csak utána készült el a függvény. Ez igaz a perceptronlépésre és a visszacsatoló súlyok számolására is. A hat laborpróba is előbb hibázva futott, és csak utána készült el a `chapter-six.js`.

A modellpróbák ellenőrzik: mind a 11 aktivációs képletet; a neuront; a kézi XOR-hálót; a perceptron ÉS/VAGY/NEM-ÉS konvergenciáját és az XOR kudarcát; a helyes és a hibás előjelű gradiens hatását; a gradienscsökkentés konvergenciáját, oszcillációját, elszállását és a lokális minimumot; a hibavisszaterjesztés kézzel levezetett számait; az XOR-tanítást; a hálószerkesztő számolását; a túlillesztési görbét; az entrópiát, a kölcsönös információt és a KL-divergenciát.

Végső futtatások:

- `npm run typecheck`: sikeres.
- `npm test`: 45 sikeres teszt, ebből 12 az új modellé.
- `npm run test:browser -- --workers=2`: 142 sikeres futás, ebből 22 a hatodik fejezeté. A munkapéldány mappaneve nem `ai-alapok`, ezért egy ideiglenes, nem mentett konfiguráció szimbolikus linken keresztül szolgálta ki ugyanezt az `/ai-alapok/` útvonalat.
- `git diff --check`: sikeres.

A lap `/ai-alapok/` alkönyvtárból és közvetlen `file://` megnyitással is működik. JavaScript nélkül minden magyarázat, a galéria, a végigszámolt példák, a táblázatok és a kiinduló ábrák láthatók. A nyomtatási próba mindkét témában ellenőrzi az olvasási elemek láthatóságát és szövegét.

Ellenőrzött szélességek: 320, 390, 768, 1024 és 1365 pixel, világos és sötét témában, bekapcsolt visszacsatolásokkal és kitöltött nyomkövetésekkel. Nincs oldalsó túlnyúlás. Képen is ellenőriztük a neuronlabort, a galériát, a hálószerkesztőt, a perceptron-, gradiens-, illesztési és hibavisszaterjesztési labort, valamint az XOR-ábrát. Ennek nyomán a perceptronábra szélessége korlátot kapott, az XOR-ábra feliratai pedig nem fedik egymást.

Axe WCAG 2 A/AA: világos asztali és sötét telefonos nézetben 0 automatikus hiba. 37 kontrasztelemet, főleg SVG-feliratot, az eszköz kézi ellenőrzésre hagyott. Az automatikus audit nem teljes hozzáférhetőségi bizonyítvány.

Nem észleltünk JavaScript-hibát. Nincs `eval`, bevitelt HTML-ként beszúró kód vagy hálózati adatküldés. A laborok minden szöveget `textContent`-tel írnak.

## Szabályok szerinti kódellenőrzés

Kiindulópont: `120c2a6`, a munkapéldány nem véglegesített változásaival és az új fájlok teljes tartalmával. Források: `AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md`, a code-review skill kódszag-listája. A vizsgálatot külön alügynök végezte, a specifikáció szerinti vizsgálattal párhuzamosan.

Javított eltérések:

- Hiányzott az „Egyszerűen mondva” doboz. Három került be: a túlillesztéshez, a derivált irányához és a hibavisszaterjesztéshez.
- A Kiigazítás-dobozok rövid PDF-idézetei mellől hiányzott az oldalszám. Mind a 15 PDF-kiigazítás oldalszámot kapott. Két idézőjeles részlet nem volt szó szerinti; ezeket a PDF pontos szövegére cseréltük.
- A `learn_delta` és a Keras-részlet rövidített volt, mégis „változatlanul” jelölést kapott. Most jelezzük a kihagyott sorokat.
- Angol szakszó került a lokális minimum, a plató, a topológiai sorrend, a klaszter, a hibatűrés és a katasztrofális felejtés mellé. A teljesítményösszetevők rövid sorai példát kaptak.
- A CSS-ből kikerültek az ötödik fejezetből másolt, itt nem használt szabályok. A `networkSummary` az elemi hurkokat külön számolja, nem a torzítások számából. A `polyFit` a pontszámot a számolás előtt ellenőrzi.

Tudatosan meghagyott ítéleti kérdések: a közös `--green` változónév a téma örökölt neve; a `element`/`input`/`select` segédfüggvények a korábbi fejezetek mintáját követik; a modell tágabb bemeneti határokat enged, mint a felület.

## Specifikáció szerinti kódellenőrzés

Forrás: `TERV.md`, 6. mérföldkő; `LEFEDETTSEGI_TERKEP.md`, 6. mérföldkő; a PDF 142–221. oldala.

Az ellenőrzés a PDF szövegével vetette össze a lefedést, és újraszámolta a fejezet összes számpéldáját és mind a 14 kvízválaszt. Számítási hibát nem talált. Javított eltérések:

- A normalizáló mechanizmus leírása enyhítette a PDF „soha ne tüzeljenek” mondatát. Most a PDF szövegét idézzük, és külön jelezzük az értelmezést.
- A túlillesztési táblázat az 5. fokot egyedüli minimumnak mondta; a 6. fok kerekítve ugyanannyi. Ez most szerepel.

Mind a nyolc kért interaktív elem megvan hat laborban. Az 5 kötelező pontosítás külön Kiigazítás-dobozt kapott. A 7. fejezet anyagát nem valósítottuk meg előre.

Összesítés: 0 nyitott szabályeltérés; 0 nyitott specifikációs hiány.
