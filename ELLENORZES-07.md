# A 7. mérföldkő ellenőrzése

Oldal: `fejezetek/07-szamitasi-problemak.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 222–255. fájloldal.

A fejezet az átdolgozott 1–6. fejezet mintájára készült. Csak a 7. mérföldkő valósult meg. A kezdőlap és a hatodik fejezet ide vezet, a 8–10. fejezet nem aktív. Nincs új függőség, szerveroldali kód vagy külső erőforrás.

Új vagy módosított fájlok: `assets/js/complexity.js` (modell), `assets/js/chapter-seven.js` (laborvezérlés), `assets/css/chapter-seven.css`, `tesztek/complexity.test.cjs`, `tesztek/bongeszo/chapter-seven.spec.cjs`.

## Lefedettség

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 222–223 | Csoportosítás megoldási idő szerint, P, NP két meghatározása (idézet), determinisztikus és nemdeterminisztikus Turing-gép, NP-teljes, NP-nehéz, visszavezetés, döntési–keresési–optimalizálási változat, halmazábra | `#gyorsasag`, `#harom-valtozat`, `#osztalyok`, `#np-idezet`, `#visszavezetes`, `#venn-abrak`, `#novekedes-labor`, `#venn-labor` |
| 224–225 | Áramkörérték, topologikus rendezés, Boole-képlet kiértékelése | `#p-szamolas`, `#aramkor-pelda` |
| 226 | 3SUM, O(n²), k-SUM | `#harom-osszeg-pelda` |
| 227 | Hozzárendelés, kiegyensúlyozott, kiegyensúlyozatlan, lineáris | `#hozzarendeles-pelda` |
| 228 | Ütközési probléma, 2 az 1-hez, lekérdezések, a két függvényábra | `#p-szamolas` |
| 229 | Élfedés, elszigetelt pont, legkisebb élfedés | `#elfedes-abra` |
| 230 | Elemmegkülönböztetés rendezéssel, lineáris várható idő, ismétlődők | `#p-lefedes` |
| 231 | Nyelvüresség, üres nyelv, véges automata, O(n²), nehezebb változatok | `#automata-abra` |
| 232 | LCS, két sorozat, NP-nehéz tetszőleges számra, dinamikus programozás | `#lcs-pelda` |
| 233–234 | SAT, interpretáció, kielégíthető és kielégíthetetlen, Cook és Levin (idézet) | `#sat`, `#cook-levin-idezet` |
| 235 | 3-SAT, a PDF példaformulája megoldással, mind a négy felsorolt változat | `#harom-sat-pelda`, `#harom-sat-megoldas`, `#sat-valtozatok`, `#sat-labor` |
| 236 | Hamilton-kör és -út, csúcsfedésből bizonyítás, mind az öt gráfosztály | `#grafok`, `#graf-harmas` |
| 237 | Klikk, feszített teljes részgráf, döntési kérdés | `#grafok`, `#graf-labor` |
| 238 | Csúcsfedés döntési változata | `#grafok` |
| 239 | Hátizsák, érték, súly, súlykorlát, darabszám, 1897, a kép öt doboza | `#hatizsak`, `#hatizsak-elemek`, `#hatizsak-pelda`, `#hatizsak-labor` |
| 240–242 | Utazóügynök, 1930, viszonyítási alap, alkalmazások (idézet), DNS és csillagászat, heurisztika és optimum, a két képes példa | `#utazougynok`, `#tsp-abrak`, `#tsp-labor` |
| 243 | Legkisebb csúcsfedés optimalizálási változata | `#grafok` |
| 244–246 | Teljes színezés, k-minimum feszítőfa (1993), Max-3SAT | `#nehez-terep` |
| 247 | Metrikus k-középpont, gráfelméleti megfogalmazás | `#kkozeppont-abra` |
| 248 | Flow shop, átfutási idő, változatok, termelésinformatika | `#flowshop-pelda` |
| 249 | Háromdimenziós párosítás, meghatározás | `#tovabbi-nehez` |
| 250 | Rekeszpakolás és alkalmazásai | `#pakolas`, `#rekesz-pelda`, `#rekesz-labor` |
| 251 | Leghosszabb egyszerű út, élszám és súly | `#pakolas` |
| 252–253 | Utazóügynök döntési változata, tanú és polinomiális ellenőrzés | `#tsp-dontes-pelda` |
| 254 | Részgráf-izomorfizmus, klikk és Hamilton általánosítása, polinomiális esetek | `#np-beli` |
| 255 | Faktorizálás döntési változata, klasszikus és kvantumalgoritmus | `#np-beli` |

A képes oldalakat (228., 236–239., 242., 244., 247–250.) képként is átnéztük. A 239. oldal öt doboza és a 242. oldal két utazóügynök-példája a jegyzet adata lett, a PDF piros körútja megegyezik a modell által talált optimummal (17,34). Az időrend idővonalat, az összevetések párhuzamos nézetet, a visszavezetés folyamatábrát, a nehéz feladatok kezelése lépéssort kapott. A PDF összes feladatát egy 28 soros térképtáblázat foglalja össze, PDF-csoport és pontos besorolás szerint. Három kiemelt idézet szerepel, mind szó szerinti PDF-szöveg oldalszámmal.

14 kiigazítás: az NP neve és a P elírása, az NP-teljes feladatok „megoldhatatlansága”, az NP-nehéz feladatok eldönthetősége, a k-SUM, az ütközési probléma jellege, az LCS besorolása, Levin neve, a DNF-változat, a csúcsfedés „legfeljebb k” kérdése, a hátizsák változatai, az utazóügynök algoritmusai, a flow shop meghatározása, a rekeszpakolás rekeszei és a faktorizálás helye.

## Kód és próbák

A kapcsolódó oktatói fájl: `resources/code/16_Genetikus_algoritmus_hatizsak.py`. A feladatleírása és a `calculate_fitness` függvénye a 8. részben szerepel, jelölt rövidítéssel, mint az NP-beli ellenőrzés lépése. A programot Python 3.12-vel, 100 véletlenmaggal, változatlan kóddal futtattuk: a két próbahívás mindig 14-et és 0-t ad, a végeredmény 79 futásban 18 (az optimum, kétféle részhalmazzal), 15-ben 17, 6-ban 16. A genetikus részt a 8. mérföldkő dolgozza fel.

A tesztvezérelt munka két határfelületen folyt. A modell (`complexity.js`) 13 próbája előbb hibázva futott, ezek a PDF példáit is rögzítik (a 3-SAT egyetlen megoldása, a hátizsák 15 és 36 dolláros optimuma, a két utazóügynök-optimum 17,34 és 63). A 13 böngészős próba a vezérlőkód előtt készült, és hibázva indult.

A statikus ábrákat (halmazábrák, áramkör, élfedés, automata, a három gráffeladat, utazóügynök, k-középpont, flow shop, rekeszpakolás, LCS-táblázat) egy ideiglenes, nem mentett generátor állította elő a tesztelt modellből. A lap ezért JavaScript nélkül is minden számot és ábrát tartalmaz.

Végső futtatások:

- `npm run typecheck`: az új fájlokban nincs hiba. A `chapter-one.js` korábbi típushibái változatlanok.
- `npm test`: 44 sikeres teszt, ebből 13 a modellé.
- `npm run test:browser -- --workers=4`: 124 sikeres futás, ebből 26 a hetedik fejezeté, asztali és telefonos projektben.

Képernyőképen ellenőriztük a világos asztali és a sötét telefonos nézetet. Ennek nyomán javítottuk: az áramkör nyílhegyei a vastag vonallal együtt túl nagyra nőttek; a k-középpont ábráján a csoportok kilógtak; az utazóügynök-térkép tengelyfeliratai levágódtak; a rekeszek felső tétele nem fért ki.

A laborok csak számokat és rögzített szövegeket írnak az oldalba. Nincs `eval` és hálózati adatküldés.

## Kódellenőrzés

A két szempontot két független alügynök vizsgálta: a szabályokat (`AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md`, kódszagok) és a specifikációt (`TERV.md` 7. mérföldkő, PDF 222–255). Az idézetek szó szerintiek, a számpéldák (növekedési táblázat, 3SUM, hozzárendelés, élfedés, LCS, 3-SAT, gráflabor, hátizsák, két utazóügynök-optimum, flow shop, rekeszpakolás, k-középpont) és mind a 14 kvízválasz újraszámolva helyes.

Javítva:

- Három helyen fordított logika állt: „hacsak P ≠ NP”. Most: „hacsak nem P = NP”. A halmazábra-labor kettős tagadása is egyszerűbb lett.
- A leghosszabb út magyarázata fordítva mondta a speciális esetet. Most: a Hamilton-út a leghosszabb út speciális esete.
- A `hasFactorBelow` prím n-re és k > n esetén nemet mondott, holott f = n jó tanú. A hibát előbb próba rögzítette, aztán javítottuk.
- A gráflabor és az útvonalrajzoló újrarajzoláskor elvesztette a `<title>` azonosítóját, így az `aria-labelledby` címkéje is eltűnt.
- A „flow shop” magyar névvel, „folyamatsoros ütemezés (flow shop)” alakban szerepel. A PSPACE és a co-NP első előfordulásnál magyarázatot kapott. Az idővonal 1973-as sorában a PDF-en túli rész kiegészítésként jelölt.
- Pontosítva: az Euler-kör feltétele összefüggő gráfot kér; nem minden optimalizálási feladat NP-nehéz; a „huszonnyolc feladat” helyett a PDF összes feladata szerepel; a 4–5. rész feladatai a kiigazítások megszorításaival P-beliek. Két ismételt CSS-szabályt összevontunk.

Tudatosan meghagyva: a hátizsák és a rekeszpakolás két külön labor, mert más részben szerepelnek. A gráf és a térkép koordinátái a statikus ábrákban és a vezérlőben is szerepelnek, mert a lapnak JavaScript nélkül is teljesnek kell lennie. A modell néhány függvényét (például `kSum`, `assignment`, `lcs`) csak a próbák hívják: ezek a lapon közölt számokat ellenőrzik. A fejezet stíluslapja a hatodik fejezet mintájából indul, ahogy a korábbi fejezeteké is.
