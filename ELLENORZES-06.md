# A 6. mérföldkő ellenőrzése

Oldal: `fejezetek/06-neuralis-halozatok.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 142–221. fájloldal.

A fejezet az átdolgozott 1–5. fejezet mintájára, újonnan készült. A korábbi, `8570bd3` változat ellenőrzött számítási modelljét (`assets/js/neural.js`) és kiigazításait újrahasznosítottuk, a szöveget, a laborokat és a stílust újraírtuk. A kérés szerint a hang könnyed, és sok kis, kipróbálható példa tagolja a magyarázatot. Csak a 6. mérföldkő valósult meg. A kezdőlap és az ötödik fejezet ide vezet, a 7–10. fejezet nem aktív. Nincs új függőség, szerveroldali kód vagy külső erőforrás.

Új vagy módosított fájlok: `assets/js/neural.js` (modell), `assets/js/chapter-six.js` (laborvezérlés), `assets/css/chapter-six.css`, `tesztek/neural.test.cjs`, `tesztek/bongeszo/chapter-six.spec.cjs`.

## Lefedettség

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 143–147 | Motiváció négy összetevője, ANN-meghatározás (idézet), szubszimbolikus, konnekcionista, adaptív, eltérések a numerikus algoritmusoktól, feladattípusok, nyolc működési jellemző | `#motivacio` |
| 148 | Mind a kilenc alkalmazási példa, feladattípussal | `#alkalmazas-lista` |
| 149–152 | Rosenblatt, biológiai analógia, bemenet, súly, torzítás, aktiváció, neuronábra, jelölések | `#neuron`, `#neuron-abra`, `#jelolesek`, `#buli-labor` |
| 153–166 | Tulajdonságok, lineáris és nemlineáris csoport, mind a 11 függvény képlete és grafikonja, a küszöb-trükk (idézet), Swish β, ELU α | `#aktivacio`, `#aktivacios-galeria`, `#aktivacio-tablazat`, `#aktivacio-labor` |
| 167–173 | Topológia, CAM, irányított gráf, neurontípusok, rétegek, előre- és visszacsatolás, súlymátrix | `#topologia`, `#neurontipusok`, `#elorecsatolt-abra`, `#halo-labor` |
| 174–176 | Hurok, négy visszacsatolásfajta, konvergencia, oszcilláció, belső állapot | `#visszacsatolas`, `#visszacsatolt-abra`, `#hurok-harom`, `#hurok-labor` |
| 177 | A teljes megfeleltetési táblázat | `#megfeleltetes-tabla` |
| 178–181 | Méretválasztás, alul- és túlméretezés (idézet), közelítő és interpoláló görbe, univerzális közelítés, optimális agykárosítás, hálónövesztés, csempéző algoritmus | `#meretezes`, `#kozelito-interpolalo`, `#illesztes-labor`, `#metszes-noveszes` |
| 182–183 | MP-neuron öt előfeltevése, formális modell, egységugrás | `#mp-neuron`, `#mp-labor` |
| 184–192 | Perceptron, retinamodell, szeparálhatóság, hipersík, tanítási lépések, leállási feltételek, Widrow–Hoff, Minsky–Papert, egyenes egyenlete, VAGY és XOR, Adaline | `#perceptron`, `#es-tanitas`, `#vagy-xor`, `#perceptron-labor`, `#perceptron-adaline` |
| 193–195 | MLP, XOR-háló, a lépcsőfüggvény három tanítási gondja | `#tobbretegu`, `#xor-halo`, `#xor-labor`, `#lepcso-gond` |
| 196–203 | Modellmentes közelítés (idézet), tanulás definíciója, felügyelt tanulás formálisan, veszteség, általánosítás, hibajavító, megerősítő és sztochasztikus tanulás | `#tanulas`, `#felugyelt-formalis`, `#tanulasi-modok` |
| 204–206 | Felügyelet nélküli tanulás, klaszterezés, kitüntetett irányok, jellemzőkinyerés, kritériumfüggvények, entrópia, kölcsönös információ, KL-divergencia | `#felugyelet-nelkul`, `#informacio`, `#entropia-labor` |
| 207–209 | Hebb- és delta szabály, gradienscsökkentés (idézet), egy neuron deriváltja | `#hebb-delta`, `#gd-harom`, `#gradiens-labor`, `#derivalt-levezetes` |
| 210–212 | Hibavisszaterjesztés képletei (idézet), lépései, ritka és ugró háló, topologikus sorrend | `#visszaterjesztes`, `#bp-pelda`, `#bp-labor` |
| 213–214 | Modelljellemzők, a hálót meghatározó hat összetevő | `#modell-jellemzok`, `#halo-osszetevok` |
| 215–217 | Tervezési kérdések, hat minősítő jellemző, hét fejlesztői szempont | `#jellemzok`, `#minosites`, `#fejlesztoi-szempontok` |
| 218 | Versengő, együttműködő és normalizáló mechanizmus | `#mechanizmusok`, `#mechanizmus-labor` |
| 219–221 | Betanítási szempontok és a teljesítmény tizenkét összetevője | `#jellemzok`, `#teljesitmeny` |

A képként tárolt oldalakat (150–151., 155–166., 175., 178., 183., 185., 188–191., 194., 207., 209–212.) képként is átnéztük. Az időrend idővonalat, az összevetések párhuzamos nézetet, a folyamatok lépéssort, a tanítás körforgása kört kapott. Hat kiemelt idézet szerepel, mind szó szerinti PDF-szöveg oldalszámmal.

17 kiigazítás. A PDF-ről 15: a mai hálók és az agy, a történeti alkalmazások, Rosenblatt szerepe, az aktivációk tulajdonságai és csoportosítása, a lineáris aktiváció, a lépcső deriváltja, a szigmoid mai szerepe, a visszacsatolt hálók működése, az univerzális közelítés, a hipersík és az origó, a delta szabály, a „mindig létezik” idézet, a megerősítéses tanulás besorolása, a derivált előjele, a zajtűrés és az átláthatóság. Az oktatói kódról 2: a `learn_delta` és a Keras-kiértékelés. A „soha ne tüzeljenek” mondatot kiegészítés értelmezi.

## Kód és próbák

A kapcsolódó oktatói fájlokat a fejezet megírása előtt áttekintettük:

- `resources/code/13_Neuralis_halo_kezzel.py`: az aktivációs függvényei az 5. részben, a `predict` és a `learn_delta` a 16. részben szerepel, jelölt rövidítéssel. A tanítást újra lefuttattuk Python 3.12-vel, 100 véletlenmaggal, változatlan tanítórésszel: 0 futás tanulta meg mind a 4 XOR-mintát, 93 megállt 3-nál, 7 `OverflowError` hibával leállt. Hibavisszaterjesztéssel javítva mind a 100 futás megtanulta. A „Relu” felirat után `test(threshold)` áll, ezt is jelezzük.
- `resources/code/14_Neuralis_halo_keras.py`: teljes szövege a 17. részben, lépésenkénti magyarázattal. Nem futtattuk, mert TensorFlow, Keras és egy hiányzó `iris.data` kellene.

A tesztvezérelt munka két határfelületen folyt. A modellhez négy új függvény került (`derivative`, `mpNeuron`, `recurrentTrace`, `mechanism`), mindegyik próbája előbb hibázva futott. A tizennyolc böngészős próba a vezérlőkód előtt készült, és hibázva indult. Az első futás két valódi hibát talált (a kimeneti nyíl súlyozott élként számított; a visszacsatolt neuron 0-ról indulva instabil nyugalmi pontban maradt), ezeket javítottuk. Az utóbbi most külön jelzést ad az instabil nyugalmi pontról.

A statikus ábrákat (aktivációs galéria, illesztés, VAGY/XOR, gradiensvölgyek, visszacsatolt neuron, hálórajzok) és az ÉS-tanítás táblázatát egy ideiglenes, nem mentett generátor állította elő a tesztelt modellből. A lap ezért JavaScript nélkül is minden számot és ábrát tartalmaz.

Végső futtatások:

- `npm run typecheck`: az új fájlokban nincs hiba. A `chapter-one.js` korábbi típushibái változatlanok.
- `npm test`: 31 sikeres teszt, ebből 16 a modellé.
- `npm run test:browser -- --workers=4`: 98 sikeres futás, ebből 36 a hatodik fejezeté, asztali és telefonos projektben.

Képernyőképen ellenőriztük a világos asztali és a sötét telefonos nézetet. Ennek nyomán javítottuk: az ötödik fejezetből átvett `svg [class^=u-s]` szabály az `u-svg-…` feliratokat láthatatlanná tette; a neuronábra két felirata fedte egymást; az ÉS-tanítás táblázata telefonon túl széles volt; a hibavisszaterjesztés rajzán az elvárt érték kilógott.

A laborok csak számokat és rögzített szövegeket írnak az oldalba, a napló `textContent`-et használ. Nincs `eval` és hálózati adatküldés.

## Kódellenőrzés

A két szempontot két független alügynök vizsgálta: a szabályokat (`AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md`, kódszagok) és a specifikációt (`TERV.md` 6. mérföldkő, PDF 142–221). Az idézetek szó szerintiek, a számpéldák, a túlillesztési táblázat és mind a 14 kvízválasz újraszámolva helyes, a kiigazítások és az idővonal tényei pontosak.

Javítva:

- Egy átfogalmazott részlet idézőjelben, oldalszám nélkül szerepelt („18 hüvelykes részletek…”). Most a PDF pontos szövege áll, oldalszámmal.
- Nem volt hálóolvasási kvízkérdés. Az 5. kérdés most a 7. rész ábráját olvastatja.
- A perceptrontanítás csak gombnyomásra lépett. Új „Lejátszás” gomb másodpercenként léptet, és újra megnyomva megáll. Próbája a böngészős tesztben van.
- Az idővonal 1969-es sorában a PDF-en túli rész (XOR, „MI-tél”) most kiegészítésként jelölt. A fejléc évszám nélküli oldalt nem hivatkozik.
- A versengő labor a modell `winner` értékét használja. Egy angol megjegyzés magyar lett.

Tudatosan meghagyva: az egyenes-húzó és a perceptrontanítás egy laborban van, mert ugyanazt az egyenest mozgatják. Az `activations` rekord és a `derivative` elágazása két helyen sorolja a függvényeket. A `bias` és a `Θ` átváltása a felület szélén marad. A témaszínek nyomtatási ismétlése az ötödik fejezet mintáját követi.
