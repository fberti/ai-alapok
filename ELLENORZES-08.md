# A 8. mérföldkő ellenőrzése

Oldal: `fejezetek/08-genetikus-algoritmusok.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 256–275. fájloldal.

A fejezet az 1–7. fejezet mintájára készült. Csak a 8. mérföldkő valósult meg. A kezdőlap és a hetedik fejezet ide vezet, a 9–10. fejezet nem aktív. Nincs új futásidejű függőség, szerveroldali kód vagy külső erőforrás.

Új vagy módosított fájlok: `assets/js/genetic.js` (modell), `assets/js/chapter-eight.js` (laborvezérlés), `assets/css/chapter-eight.css`, `assets/js/browser-globals.d.ts`, `tesztek/genetic.test.cjs`, `tesztek/bongeszo/chapter-eight.spec.cjs`, `tesztek/pages.test.cjs`, `index.html`, `fejezetek/07-szamitasi-problemak.html` (továbblépés a 8. fejezetre).

## Lefedettség

A PDF szövegét `pdftotext -layout` eszközzel olvastuk ki. A 263., 265–270. és 273–274. oldal ábráit képként is átnéztük, a 273–274. oldal képleteit nagyobb felbontásban.

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 257 | Négy természeti példa, változatosság és szelekció | `#termeszet`, `#termeszet-peldak`, `#ket-ero` |
| 258 | Biológiai számítás, egyed, populáció, rátermettség, irányított próba-szerencse, a biológiai és az algoritmikus cél különbsége | `#optimum`, `#szotar`, `#bio-vs-algo`, `#hasonlat-hatarai` |
| 259 | Evolúciós stratégia, evolúciós programozás, genetikus algoritmus, osztályozó rendszerek, genetikus programozás, évszámokkal | `#csalad`, `#ea-idovonal`, `#ag-tabla`, `#fix-ep` |
| 260 | Az általános evolúciós algoritmus öt lépése, bővítés és szelekció, egyelemű populáció mint sztochasztikus hegymászó | `#lepesek`, `#ea-lepesek`, `#egy-kor`, `#optimum-abra` |
| 261 | Globális kvázioptimum (idézet), rokon algoritmusok, a feladatról szóló tudás helyei, összevetés az analitikus módszerekkel és a kimerítő kereséssel | `#ga`, `#modszerek`, `#fix-kimerito` |
| 262 | A név eredete, populáció, a kezdeti eloszlás, a keresztezés és a mutáció szerepe, korai és késői mutációk | `#feltaras` |
| 263 | Látszólag spontán fejlődés, a populáció mint memória, a k = 0 és k = 5000 ábra | `#k-abra`, `#felszin-labor` |
| 264 | Leképezés, bináris, valós és permutációs kódolás, a téglalap- és a bittérképpélda, gén, kromoszóma, allél (idézet) | `#kodolas`, `#kodolasok`, `#kodolas-peldak`, `#genfogalmak`, `#fix-bitminta`, `#kod-labor` |
| 265–266 | A szelekciós operátor feladata, rulettkerék, párok versenyeztetése, rangsorolás | `#kivalasztas`, `#rulett-pelda`, `#szel-osszevetes`, `#fix-szamozas`, `#szel-labor` |
| 267–268 | Egypontos, kétpontos és egyenletes keresztezés a PDF génsoraival; kétpontos mint két egypontos | `#egypontos`, `#ketpontos`, `#ket-egypontos`, `#egyenletes`, `#fix-egyenletes` |
| 269 | Útvonal-újrakapcsolás a PDF példájával, a három megjegyzés | `#ujrakapcsolas`, `#ujrakapcsolas-eredete` |
| 270 | Mutáció (idézet) és a PDF példája | `#mutacio`, `#mutacio-pelda`, `#ker-labor` |
| 271 | A genetikus algoritmus kilenc lépése | `#ga-lepesek`, `#kezi-generacio`, `#ga-labor` |
| 272 | Öt paraméter példaértékekkel, öt leállási feltétel | `#param-tabla`, `#leallas`, `#plato-pelda` |
| 273 | Relatív rátermettség, diverzitás, Hamming-, euklideszi és Manhattan-távolság | `#uj-populacio`, `#diverzitas-pelda`, `#tavolsagok`, `#fix-genenkent` |
| 274 | Négy túlélési módszer, rangsor alapú képlet, együttes rangsor | `#tuleles-modszerek`, `#rang-pelda`, `#fix-rang`, `#egyuttes-rang` |
| 275 | Az alkalmazhatóság két követelménye (idézet) | `#alkalmazhatosag`, `#kovetelmenyek`, `#mikor-tabla` |

A 256. oldal a fejezet címlapja, érdemi tartalom nélkül. A szerzői megjelölést a forráslista tartalmazza.

## Kiigazítások

Hét doboz javítja vagy pontosítja a PDF állításait:

- az evolúciós programozás véges automatákat fejlesztett, nem programkódot (259. oldal);
- a kimerítő keresésnél nem mindig hatékonyabb, kis térben és a „nincs ingyenebéd” tétel szerint sem (261.);
- a genotípus nem mindig bitminta (264.);
- a kiválasztási módszerek számozása „1., 2., 2.” helyett 1–3 (266.);
- az egyenletes keresztezés ábráján az első utód utolsó génje 3, nem 2 (268.);
- a távolságokat génenként, nem kromoszómánként számoljuk (273.);
- a rangsor alapú képlet általános alakja, és P < 0,5 esetén az utolsó egyed többletesélye (274.).

## Kódok

A `resources/code/` három genetikus programja szervesen szerepel a magyarázatban: a rátermettség, a rulettkerék, a versenyeztetés, a három keresztezés, a mutáció, az elitizmus és a rangsorolás részleteinél. A 14. rész összegzi a futási eredményeket.

Mindhárom programot változatlan kóddal, Python 3.12-vel, 0–99-es véletlenmaggal futtattuk. A sakkmintás programhoz egy ideiglenes környezetben telepített numpy 2.5 kellett, a projekt függőségei nem változtak.

| Program | Eredmény 100 futásból |
|---|---|
| `15_Genetikus_algoritmus_sakkminta.py` | 97 futásban mind a 20 egyed eléri a célmintát. 3 futásban mind a 20 egyed ugyanazt a 8/9-es mintát hordozza. |
| `16_Genetikus_algoritmus_hatizsak.py` | 79-szer 18 (az optimum), 15-ször 17, 6-szor 16. A végső populáció mindig 8 egyedes. |
| `17_Genetikus_algoritmus_blackjack.py` | 8-szor van 21-es egyed a végső populációban, 48-szor a legjobb egyed is 0 pontos. |

A fejezet a kódok ezen tulajdonságait jelzi: a sakkmintás program a keresztezést addig ismétli, amíg sikerül, és a túlélési versenyt csak az utódok első feléből húzza. A hátizsákprogram populációja 8 egyedre zsugorodik, és a két keresztezési pont 1/5 eséllyel egybeesik. A blackjackprogram a túlélést csak változatosság alapján dönti el, a pontszámokat pedig egyszer, a ciklus előtt számolja.

## Saját anyag

Nem a PDF-ből származik: a négyegyedes populáció és minden rá épülő számítás, a szupersztár-populáció, a valós kódolás, a permutációs buktató, a mutációs, a platós, a rangsoros és a diverzitási példa, a gyakorló feladatok, a kvíz, a döntési táblázat, a hegymászó és a kétcsúcsú felszín ábrája. Minden számot a `genetic.js` modell tesztjei vagy Python-számítás ellenőrzött.

## Tesztek

- `npm test`: 53 sikeres teszt, köztük a modell 9 új tesztje és a bővített oldalteszt.
- `npx playwright test`: 146 sikeres böngészőteszt asztali és telefonos beállítással. A 8. fejezet 11 tesztje mindkét beállításon lefutott.
- A böngészőtesztek ellenőrzik a hibamentes betöltést, mind az öt labort, a kvízt, a csukott gyakorló blokkokat, a 320, 390, 768 és 1365 px széles nézetet világos és sötét témában, a JavaScript nélküli olvasást fájlból, a nyomtatást és a navigációt.
- Asztali világos és telefonos sötét képernyőképet is átnéztünk.
- `git diff --check`: sikeres.
- `npm run typecheck`: az új fájlokban nincs hiba. A futás korábban is meglévő hibákat jelez a `assets/js/chapter-one.js` fájlban, ehhez a fájlhoz ez a mérföldkő nem nyúlt.

Firefox és Safari nem kapott külön futtatást. A nyomtatást emulált nyomtatási nézetben ellenőriztük, valódi nyomtatón nem.
