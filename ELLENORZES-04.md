# A 4. mérföldkő ellenőrzése

Oldal: `fejezetek/04-formalis-logika.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 89–121. fájloldal.

Csak a 4. mérföldkő készült el. A kezdőlap és a harmadik fejezet már erre az oldalra mutat. Az 5–10. fejezet továbbra sem aktív. A közös téma, kvíz és haladás kódját újra használjuk. Nincs új függőség, szerveroldali kód vagy külső erőforrásbetöltés.

## Lefedettség

| PDF-oldal | Beépített tartalom | Hely |
|---|---|---|
| 89–90 | Logika, arisztotelészi, formális és nem klasszikus rendszerek, fuzzy kapcsolat | `#tortenet` |
| 91–94 | Ramus, Bacon, Descartes négy elve, Leibniz, Boole, Venn, Jevons, Peirce, De Morgan, Frege, Russell | `#tortenet`, idővonal és kiigazítások |
| 95 | Modális, deontikus, többértékű és valószínűségi logika; Łukasiewicz, Post, Keynes | `#tortenet` |
| 96–97 | Propozíció, atom, víz és macska, eső, Jóska és a mondatsorrend | `#kijelentesek` |
| 98–99 | Jelkészlet, öt művelet, állandók, változók, elsőbbség, formulaépítés | `#muveletek`, `#kijelentesek` |
| 100–101 | Interpretáció, 2ⁿ sor, a négyszereplős képlet mindkét értékelése, teljes műveleti tábla, napsütés és Péter | `#teljes-igazsagtabla`, `#nap-pelda`, `#tabla-labor` |
| 102 | Kielégíthetőség, érvényesség, tautológia, ellentmondás és a négy egyszerűsítés | `#bizonyitas` |
| 103–104 | Igazságtábla, formális levezetés, Quine, Wang, rezolúció; premissza, konklúzió és tagadott cél | `#bizonyitasi-modszerek`, `#bizonyitas` |
| 105–106 | Literál, klóz, KNF, ötklózos példa, az átalakítás négy lépése | `#normalforma`, `#knf-lepesek`, `#knf-pelda` |
| 107–108 | Rezolválható pár, rezolvens, üres klóz, algoritmus, leállás, teljesség, teljes PDF-levezetés | `#rezolucio`, `#pdf-rezolucio`, `#rezolucios-algoritmus` |
| 109–110 | Predikátumok, egyedek, kapcsolatok, kvantorok; hallgató–tárgy–szócséplés feladat | `#predikatumok`, `#szocseples` |
| 111–113 | Elsőrendű jelkészlet, termek és atomok; testvér, gyerek, házaspár és hajszín példák | `#predikatumok`, `#term-peldak` |
| 114–115 | Kvantoros formulaépítés, részeg–ital példa, kötött és szabad előfordulások, mondat | `#kvantorok`, `#hatokor-labor` |
| 116 | A hallgató–tárgy–szócséplés három formulája és a következtetés indoklása | `#szocseples` |
| 117–118 | Nem üres tartomány, állandó-, függvény- és predikátumértelmezés, változóértékelés, érvényes és kielégíthetetlen kvantoros példák | `#elso-rendu`, `#elso-rendu-ervenyesseg` |
| 119–121 | A hallgatók értik a rezolúciót: feltevések, cél tagadása, klózok, minden helyettesítés és teljes levezetés | `#hallgato-rezolucio`, `#elso-rendu-levezetes` |

A 104. oldal szövege képként szerepel a PDF-ben. Külön képi ellenőrzést kapott. A megoldott példák és az átalakítások nem rejtett elemek. A fejezet a PDF nélkül is olvasható. Az idővonal időrendet, a párok fogalmi különbséget, a lépéssorok valódi levezetést mutatnak. Nincs kitalált forrásidézet.

A 12 kiigazítás kezeli a történeti elsőbbséget, Russell paradoxonának pontos alakját, a logikai kategóriák átfedését, a forráspont kontextusát, a kielégíthetőség definícióját, a KNF–DNF elírást, az egy rezolúciós lépésben törölhető párt, az üres klózt és leállást, a függvény–predikátum különbséget, a Dⁿ tartományt és szabad változókat, a személyfüggő egyszerűséget, valamint a tagadott cél új tanúállandóját. A Skolemizálás külön kiegészítésben szerepel.

## Kód és próbák

A `resources/code/` témaköreit áttekintettük. A közvetlenül kapcsolódó fájl a `resources/code/12_Logika.py`. Tényei, szülő- és nagyszülőszabályai, valamint mindhárom lekérdezésének eredménye közvetlenül az egyesítés magyarázatánál szerepel. Az eredeti Python-fájl változatlan. A pyDatalog programot nem futtattuk; a három eredményt a megadott tényekből kézzel vezettük le. A böngésző a saját kijelentéslogikai tanmodelljét futtatja.

A felhasználó jóváhagyta a logikai függvények és a lapvezérlők tesztelését. Az igazságtábla, a normálforma és a rezolúció modelltesztje hibázó próbával indult. Mind az öt labor és a kvíz működését külön hibázó böngészős próba előzte meg. A típusellenőrzés és az egyes tesztfájlok futtatása többször megtörtént.

Végső futtatások:

- `npm run typecheck`: sikeres.
- `npm test`: 28 sikeres teszt, ebből 8 a logikai modellhez tartozik.
- `npm run test:browser -- --workers=2`: 104 sikeres futás. Ebből 22 a negyedik fejezethez tartozik, asztali és telefonos projektben.
- `git diff --check`: sikeres.

A modellpróbák ellenőrzik mind az öt műveletet, az állandókat, az elsőbbséget, a hibás bemenetet, a PDF értékeléseit, az ekvivalencia felbontását, De Morgan szabályait, a kétoldali szétosztást, a konstans klózok egyszerűsítését, a nagy kifejezések korlátját és a teljes rezolúciós láncot. Az ellentett párok egyszerre törlése nem megengedett.

A böngészős próbák ellenőrzik az öt labort, a hiba utáni újrakezdést, az ekvivalens megoldás elfogadását, a fa szülőkapcsolatait, a kvantorok billentyűzetes kijelölését és mind a 12 kvízválaszt. A haladás a negyedik fejezethez külön mentődik. A projekt-alkönyvtárból megnyitás és újratöltés működik. A közvetlen `file://` megnyitás JavaScripttel és nélküle is sikeres.

Képernyőszélességek: 320, 390, 768, 1024 és 1365 pixel. Mindkét témában elfér a teljes tartalom, a 16 soros generált tábla és a kitöltött KNF-labor is. Nincs oldalsó túlnyúlás. A mozgáscsökkentő rendszerbeállítást a közös CSS kezeli.

Képernyőképen ellenőriztük a világos asztali nyitóképet, a sötét telefonos nyitóképet és a teljes kijelentéslogikai bizonyítás telefonos részét. Sötét témából A4-es PDF készült ideiglenes fájlba. A kinyomtatott bizonyítást és az algoritmus lépéssorát képen is ellenőriztük. A papír fehér, a tartalom olvasható. A nyomtatási teszt mindkét témában ellenőrzi minden olvasási elem és a szöveg megmaradását.

Axe WCAG 2 A/AA: világos asztali és sötét telefonos nézetben 0 automatikus hiba. Egy kézi ellenőrzést kérő szabály maradt: négy önálló ∧ jel és a □ kvízválasz kontrasztja. Ezek színeit külön ellenőriztük. A jel/papír arány világos témában 6,64:1, sötétben 10,10:1. A kvíz szövegének aránya 12,59:1, illetve 15,94:1. Mindegyik meghaladja a 4,5:1 határt. Nem állítjuk, hogy az automatikus vizsgálat teljes hozzáférhetőségi bizonyítvány.

Nem észleltünk JavaScript-hibát. A bevitt képletek kizárólag szövegként jelennek meg. Nincs `eval` vagy bevitelt HTML-ként beszúró kód.

## Szabályok szerinti kódellenőrzés

A felhasználó által jóváhagyott kiindulópont: `f41806757ab407909613b079bff521e3fcc5ea84`.

A vizsgálat a munkapéldány és a kiindulópont közötti változásokat nézte, az új fájlok teljes tartalmával együtt. Forrásai: `AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md`, a code-review skill kódszag-listája és a közös modulok mintája.

Ebben a munkamenetben nem állt rendelkezésre alügynök-indító eszköz. A két vizsgálati szempontot ezért kézzel, külön ellenőriztük; nem készült független párhuzamos alügynöki review.

Javított hibák:

- A KNF-átalakítás műveleti korlátja önmagában nem védte a kiírást: a megosztott részfák szöveggé bontása nagyra nőhetett. A kiírás is munkakeretet kapott. A 30 ekvivalenciából álló próbát gyorsan elutasítja.
- A mondatfeladat az ellenőrzéshez összefűzte a két formulát. Ez rövidítés nélkül is túlléphette a beviteli korlátot. Most a két külön igazságtábla megfelelő sorait hasonlítja össze.

Nincs nyitott szabálysértés. A fejezetszín és az olvasási elemek külön CSS-ben maradtak. A logikai modell és a lapkezelés külön fájl. A közös kvíz, téma és haladás nem kapott másolt változatot.

## Specifikáció szerinti kódellenőrzés

Forrás: `TERV.md`, 4. mérföldkő; `LEFEDETTSEGI_TERKEP.md`, 4. mérföldkő.

Javított forráshivatkozás: a Jevons-életrajz önmagában nem támasztotta alá a Stanhope-gépre vonatkozó mondatot. A kiigazítás megkapta a Science Museum Group tárgyi forrását is.

Nincs nyitott tartalmi hiány. Minden előírt fogalom és példa szerepel. Az öt interakció és a 12 kérdés működik. A normálforma-labor kijelentéslogikai, a faépítő a PDF öt klózából indul; a határokat az oldal kimondja. Az elsőrendű rezolúciót teljes, helyettesítésekkel ellátott statikus levezetés tanítja, nem rejtett automatikus megoldó. Az 5. fejezet tananyagát nem valósítottuk meg előre.

Összesítés: 0 nyitott szabályeltérés; 0 nyitott specifikációs hiány.
