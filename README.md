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
- [ ] 8–10. mérföldkő: további fejezetek.

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

Ellenőrzés: [ELLENORZES-02.md](ELLENORZES-02.md), [ELLENORZES-03.md](ELLENORZES-03.md), [ELLENORZES-04.md](ELLENORZES-04.md), [ELLENORZES-05.md](ELLENORZES-05.md), [ELLENORZES-06.md](ELLENORZES-06.md), [ELLENORZES-07.md](ELLENORZES-07.md).

A kiigazítások kiemelt dobozban, magyarázattal és forrással szerepelnek.

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
