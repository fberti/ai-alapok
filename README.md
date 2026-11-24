# MI-alapok – fejlesztési terv

Ez a könyvtár egy magyar nyelvű, többoldalas, interaktív MI-kurzus terve.

A forrás a következő fájl:

`/forlinux/MEGA/MEGABase/ME/mest_int_alapjai/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`

A forrás 307 oldalból áll.

## Állapot

- [x] A PDF tartalmának felosztása elkészült.
- [x] A tíz fejezet és mérföldkő terve elkészült.
- [x] A teljes lefedettségi térkép elkészült.
- [x] 1. mérföldkő: kezdőlap, közös alkalmazásváz és az első fejezet.
- [x] 2. mérföldkő: tudásbázisok és szakértőrendszerek.
- [x] 3. mérföldkő: tudásreprezentáció, hálók, keretek és esetek.
- [x] 4. mérföldkő: formális logika, igazságtáblák, kvantorok és rezolúció.
- [x] 5. mérföldkő: Prolog, keresési sorrend, vágás és fuzzy szabályozás.
- [x] 6. mérföldkő: neuron, aktivációk, perceptron, gradienscsökkentés és hibavisszaterjesztés.
- [x] 7. mérföldkő: P, NP, NP-teljes, NP-nehéz és a PDF nevezetes számítási problémái.
- [x] 8. mérföldkő: evolúciós és genetikus algoritmusok, kódolás, kiválasztás, keresztezés, mutáció és túlélés.
- [x] 9. mérföldkő: állapottér, keresőfa, front, szélességi, egyenletes költségű, mélységi és mélységkorlátos keresés, iteratív mélyítés.
- [x] 10. mérföldkő: informált és lokális keresés.
- [x] A teljes kurzus lezárása: fogalomtár és kereső, végső ellenőrzés a GitHub Pages alkönyvtárából.
- [x] 11. fejezet: zárthelyi-gyakorló a 2025. december 5-i minta-zh alapján.

## Az elkészült alkalmazás

Nyisd meg az `index.html` fájlt.

Használat, tesztelés és GitHub Pages: [HASZNALAT.md](HASZNALAT.md).

Az első fejezet hat interaktív bemutatót és tíz opcionális kvízkérdést tartalmaz.

A második fejezet öt interaktív bemutatót és kilenc opcionális kvízkérdést tartalmaz.

Az átdolgozott második fejezet a PDF nélkül is követhető. Látható lépéssorok, összevetések és szerkesztett párbeszéd tagolják. A kézikönyv és a részletes tudás teljes tartalma kattintás nélkül olvasható. Mindkét láncolási irányhoz írásos levezetés tartozik. Az oktatói `resources/code/12_Logika.py` szabályait a kapcsolódó magyarázat mutatja be.

A harmadik fejezet négy interaktív labort és nyolc opcionális kvízkérdést tartalmaz.

Az átdolgozott harmadik fejezet a PDF 65–88. oldalát önállóan olvasható leckévé szervezi. A kanári útvonalai, Pityuka adatlapja és a két biztosítási ág segítik a hálók megértését. A keretek teljes adatlapokat, az öröklés és az esethasonlóság végigvezetett megoldásokat kapott. Minden szükséges magyarázat kattintás és JavaScript nélkül is olvasható.

A negyedik fejezet a PDF 89–121. oldalát dolgozza fel. Öt labor segíti a tanulást: igazságtábla-generátor, mondatból képlet, KNF-lépésgép, rezolúciós fa és kvantorhatókör. Tizenkét választható kvízkérdés tartozik hozzá. A forrás mindkét elsőrendű példája és a pyDatalog családi kapcsolatai teljes magyarázatot kaptak. A tananyag JavaScript nélkül és nyomtatva is olvasható.

Az ötödik fejezet a PDF 122–141. oldalát dolgozza fel. Három labor tartozik hozzá: Prolog-léptető ténysorrenddel, vágással és harmadik ténnyel; tagságifüggvény-rajzoló öt alakkal; élő vizsgajegy három defuzzifikálási módszerrel. Tíz választható kvízkérdés segít az ellenőrzésben. Mindkét keresőfa, a PDF képi oldalai, a vizsgajegy teljes számítása és a `11_Fuzzy.py` termosztátja JavaScript nélkül is olvasható. A hiányos szabálybázis nem ad kitalált jegyet.

A hatodik fejezet a PDF 142–221. oldalát dolgozza fel, könnyed hangon, tizenkét kipróbálható mini példával: péntek esti neuron, aktivációs függvények közös grafikonja, hálóépítő, önmagára visszacsatolt neuron, túlillesztés, McCulloch–Pitts-neuron, egyeneshúzó és perceptrontanítás, XOR-kapcsoló, cinkelt érmék, gradiensvölgy, lépésenkénti hibavisszaterjesztés és versengő réteg. Tizennégy választható kvízkérdés segít az ellenőrzésben. Minden ábra, levezetés és számpélda JavaScript nélkül is olvasható. A derivált előjelét a fejezet számpéldával javítja. Az oktató kézzel írt hálójának futtatása kimutatta, hogy nem végez hibavisszaterjesztést; a javított változat is szerepel.

A hetedik fejezet a PDF 222–255. oldalát dolgozza fel. Hét labor tartozik hozzá: növekedési verseny, „Hová tartozik?” halmazábra, SAT mini-megoldó, gráflabor klikkhez, csúcsfedéshez és Hamilton-úthoz, hátizsák, utazóügynök-útvonalrajzoló és rekeszpakoló. Tizennégy választható kvízkérdés segít az ellenőrzésben. A PDF összes feladata egy térképtáblázatban is szerepel, pontos besorolással. Tizennégy kiigazítás javítja többek között az NP jelentését, az NP-teljes feladatok „megoldhatatlanságát”, a csúcsfedés kérdését és a faktorizálás helyét. Az oktatói hátizsák-kód kiértékelő függvényét 100 futással ellenőriztük.

A nyolcadik fejezet a PDF 256–275. oldalát dolgozza fel. Öt labor tartozik hozzá: fenotípus–genotípus átalakító, a három kiválasztási mód összevetése, keresztezés és mutáció kézi laborja, paraméterezhető teljes genetikus algoritmus és egy kétcsúcsú felszín, amelyen a populáció és a hegymászó összevethető. Négy lenyíló gyakorló blokk és tizenkét választható, tippekkel ellátott kvízkérdés segít az ellenőrzésben. Hét kiigazítás javítja többek között az evolúciós programozás tárgyát, az egyenletes keresztezés ábráját és a rangsor alapú képletet. Az oktató három genetikus programját 100–100 futással ellenőriztük.

A kilencedik fejezet a PDF 276–298. oldalát dolgozza fel. Három labor tartozik hozzá: az amőba három reprezentációjának elágazás-összevetése, egy közös keresőlabor (városgráf, minta-zh gráf, absztrakt gráf, kurzuskód és saját, szövegesen megadott állapottér; mind az öt eljárás lépésenként, élő fronttal, bejárt listával, térképpel és keresőfával, választható céltesztelési és ismétléskezelési konvencióval), valamint egy idő- és memóriaigény-grafikon. Öt lenyíló gyakorló blokk, köztük a minta-zh mélységi keresési feladatának kidolgozott megoldása mindhárom konvencióval, és tizennégy választható kvízkérdés segít az ellenőrzésben. Nyolc kiigazítás javítja többek között az egyenletes költségű keresés nevét, feltételeit és képletét, a mélységi keresés képleteit, a front meghatározását és a PDF egyenletes költségű táblázatát. Az oktató két keresőprogramját lefuttattuk; a `21_Ugralas_es_elagazas.py` aszimmetrikus éle a futást nem befolyásolja. A keresés logikája a tesztelt `assets/js/search.js` modulban van.

A tizedik fejezet a PDF 299–307. oldalát dolgozza fel. Négy labor tartozik hozzá: heurisztika-tervező a fejezet három gráfjához (városok, minta-zh, kurzuskód) a valódi hátralévő költség, az elfogadhatóság és a konzisztencia ellenőrzésével, a mohó legjobb-első és az A* keresés egymás melletti, lépésenkénti futtatásával; hegymászó egy többcsúcsú, fennsíkos felszínen véletlen újraindításokkal; szimulált hűtés hőmérséklet-, ütem- és véletlenmag-beállítással, száz futásos sikeraránnyal; és egy keresőválasztó a kurzus mind a tíz keresőjét összevető záró táblázathoz. Öt lenyíló gyakorló blokk, köztük a minta-zh A*-feladatának (8(b)) kidolgozott megoldása, és tizenkét választható kvízkérdés segít az ellenőrzésben. Nyolc kiigazítás javítja többek között a mohó keresés teljességét, az A* optimalitásának feltételeit, a hegymászó pszeudokódjának hiányzó megállását és a szimulált hűtés globális optimumra vonatkozó állítását; kettő az oktatói `18_A_csillag_algoritmus.py` (h(D) = 25 > 24) és a minta-zh (h(W) = 4 > 2) túlbecslő becslését mutatja ki. A kurzus zárásaként elkészült a `fogalomtar.html`: mind a tíz fejezet fogalmai és szakaszai egy kereshető oldalon.

A tizenegyedik, gyakorló fejezet (`fejezetek/11-zh-gyakorlo.html`) a 2025. december 5-i minta-zárthelyi mind a kilenc feladatát a feladatlap sorrendjében dolgozza fel. Minden feladathoz tartozik a feladatlap szó szerinti szövege, egy lenyitható megoldás a kulcslépésekkel (a teljes levezetésre a megfelelő fejezet hivatkozik) és egy gyakorló blokk új, ugyanolyan típusú kérdésekkel: 36 új igaz–hamis állítás, 8 kifejtős kérdés mintaválasszal, új láncolási, rezolúciós (köztük egy nem bizonyítható), predikátumlogikai, fuzzy (köztük egy hiányos szabálybázisú), keresési és genetikus feladatok. A keresési gyakorláshoz egy új, elfogadható és konzisztens becslésű gráf tartozik mind az öt keresővel, amelyet a kurzus `18_A_csillag_algoritmus.py` programjával is ellenőriztünk. Két eszköz segít: egy változatgenerátor a 4., 7. és 9. feladathoz, és egy önértékelő pontlap, amely a gyenge pontokhoz tartozó fejezetekre mutat. Egy döntési táblázat, tizennégy fogalomkártya és tizenkét kvízkérdés zárja. A számításokat a tesztelt `assets/js/zh.js` modell végzi.

A 9., a 10. és a 11. fejezet ábráit, valamint a fogalomtárat generálóscriptek állítják elő az `eszkozok/` mappában; a futtatásukat a [HASZNALAT.md](HASZNALAT.md) írja le.

Ellenőrzés: [ELLENORZES-02.md](ELLENORZES-02.md), [ELLENORZES-03.md](ELLENORZES-03.md), [ELLENORZES-04.md](ELLENORZES-04.md), [ELLENORZES-05.md](ELLENORZES-05.md), [ELLENORZES-06.md](ELLENORZES-06.md), [ELLENORZES-07.md](ELLENORZES-07.md), [ELLENORZES-08.md](ELLENORZES-08.md), [ELLENORZES-09.md](ELLENORZES-09.md), [ELLENORZES-10.md](ELLENORZES-10.md).

A kiigazítások kiemelt dobozban, magyarázattal és forrással szerepelnek.

## Összevetés az előadásdiákkal és a minta-zh-val

Az 1–8. fejezetet összevetettük a kurzus újabb anyagaival: az MI1–MI6 előadásdiákkal, a gyakorlati táblával, a kézírásos logikai feladatsorokkal, a 2025. december 5-i minta-zárthelyivel, egy 2017-es vizsgasorral és az oktatói kódok újabb változataival (`fuzzylev.py`, `ga_knapsack.py`, `ga_sakkminta.py`). Ezek a források nem részei a tárnak.

A fejezetek lenyitható, JavaScript nélkül is olvasható gyakorló feladatokat kaptak a zh feladattípusaihoz: előre- és hátraláncolás (2.), esetalapú tervezés (3.), propozíciós és predikátumlogikai rezolúció a)–e) menettel (4.), fuzzy szimuláció súlyponttal (5.), előreterjesztés ReLU-hálón (6.), genetikus algoritmus a lámpás hátizsákfeladaton (8.). A minta-zh igaz–hamis állításai a megfelelő fejezetekből eldönthetők.

Új kiigazítások: a táblai előreláncolás T5–T6 ténybázisa (2.), az Anna–Béla–Cili feladat ellentmondásos premisszái (4.), a táblai fuzzy feladat Meleg(16) értéke (5.) és a dia hibás OX-példája (8.). A részleteket az `ELLENORZES-0N.md` fájlok záró szakaszai tartalmazzák.

A minta-zh legnagyobb feladata (25 pont) mélységi keresés és A* egy súlyozott gráfon. A mélységi (a) részt a 9., az A*-os (b) részt a 10. fejezet kidolgozott gyakorlója tartalmazza.

## Tartalmi forma

Minden fejezet önállóan érthető tananyag legyen.

Az olvasónak ne kelljen mellette megnyitnia a forrás PDF-et.

A forrás érdemi anyaga szervesen simuljon bele a magyarázatba.

A hosszabb szöveget tartalmi célú vizuális elemek tagolják.

Időrendi anyaghoz idővonal tartozik.

Összevetéshez párhuzamos elrendezés tartozik.

Folyamathoz lépéssor vagy folyamatábra tartozik.

A hiteles forrásmondatok idézetet és látható forrásjelölést kaphatnak.

A vizuális tagolás nem válthatja fel a teljes, összefüggő magyarázatot.

A részletes szabályokat az `IMPLEMENTALASI_SZABALYOK.md` tartalmazza.

## Parancs

Egy fejezet megvalósításához ezt a formát használd:

```text
/implement #1
```

A szám 1 és 10 között lehet.

A parancs csak a megadott mérföldkövet valósítja meg.

A megvalósítás előtt az ügynök olvassa el ezeket a fájlokat:

1. `README.md`
2. `TERV.md`
3. `LEFEDETTSEGI_TERKEP.md`
4. `IMPLEMENTALASI_SZABALYOK.md`

## A mérföldkövek sorrendje

1. MI, intelligencia és alkalmazások
2. Tudásbázisok és szakértőrendszerek
3. Tudásreprezentáció
4. Formális logika
5. Prolog és fuzzy logika
6. Mesterséges neurális hálózatok
7. Nevezetes számítási problémák
8. Genetikus algoritmusok
9. Neminformált keresés
10. Informált és lokális keresés

A részletes terv a `TERV.md` fájlban van.
