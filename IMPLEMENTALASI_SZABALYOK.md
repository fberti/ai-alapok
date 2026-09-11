# Megvalósítási szabályok

## Cél

A kész termék egy magyar nyelvű, többoldalas, interaktív tananyag legyen.

A tananyag fedje le a forrás PDF minden érdemi állítását, példáját és algoritmusát.

A tananyag javítsa ki a forrás hibás, elavult vagy félreérthető állításait.

A javítás ne legyen néma.

Minden javítást jól látható, kiemelt „Kiigazítás” dobozban kell jelezni.

A doboz mutassa meg a PDF eredeti állításának lényegét.

A doboz adja meg a javított vagy pontosabb állítást.

A doboz érthetően mondja el, miért szükséges a javítás.

A javítást kellő érvekkel kell alátámasztani.

Lehetőség szerint legalább egy ellenpéldát, számolási példát vagy hétköznapi példát is meg kell adni.

Szakmai állítás esetén megbízható forrást is meg kell nevezni.

A kiigazítás legyen elkülöníthető az egyszerű kiegészítéstől.

A „Kiegészítés” doboz hiányzó hátteret ad.

A „Kiigazítás” doboz hibát, elavult adatot vagy félrevezető megfogalmazást javít.

## Technikai forma

Az alkalmazás legyen statikus, többoldalas webalkalmazás.

A teljes tananyagot tartalmazó interaktív weboldal GitHub Pages-en közzétehető legyen.

Ne igényeljen szerveroldali kódot, adatbázist vagy titkos API-kulcsot.

A hivatkozások és az erőforrások relatív útvonalat használjanak.

Az oldal a `https://<felhasznalo>.github.io/<repo>/` alakú projektcímen is működjön.

A navigáció ne igényeljen szerveroldali útvonal-átírást.

Minden fejezet külön HTML-fájlja közvetlenül is megnyitható legyen.

A kiadás tartalmazzon minden szükséges statikus fájlt.

A közzététel lépéseit magyar nyelven dokumentálni kell.

Minden fejezet külön HTML-oldalt kapjon.

A közös részeket megosztott CSS- és JavaScript-modulok adják.

A megoldás ne igényeljen szervert az olvasáshoz.

Egy egyszerű helyi fejlesztői szerver használata legyen lehetséges.

A tervezett szerkezet:

```text
/ai-alapok
  index.html
  fejezetek/
    01-mi-es-intelligencia.html
    02-tudasbazisok.html
    03-tudasreprezentacio.html
    04-formalis-logika.html
    05-prolog-es-fuzzy.html
    06-neuralis-halozatok.html
    07-szamitasi-problemak.html
    08-genetikus-algoritmusok.html
    09-neminformalt-kereses.html
    10-informalt-kereses.html
  assets/
    css/
    js/
    img/
  tesztek/
  tervek/
```

A megvalósítás közben a tervfájlok maradjanak Markdown-formátumban.

## Vizuális irány

A felület egy „digitális egyetemi jegyzetfüzet” hangulatát használja.

A terv legyen világos, barátságos és szakmai.

A fejezetek kapjanak saját kiemelőszínt.

A szövegtípus legyen jól olvasható hosszabb tanulás közben is.

A képletek, algoritmusok és kódok kapjanak külön vizuális rendszert.

A fejezet ne legyen hosszú, egyforma bekezdések sora.

A forrás teljes magyarázata maradjon meg, de a szöveget a tartalomhoz illő vizuális olvasási elemek tagolják.

Időrendi anyaghoz idővonalat kell használni.

Összevethető fogalmakhoz párhuzamos összehasonlítást kell használni.

Egy folyamatot számozott lépések, folyamatábra vagy egymásra épülő sorok mutassanak be.

Egy párbeszéd kapjon beszélgetést segítő vizuális formát.

Egy fontos forrásmondat idézetként is kiemelhető.

Egy fontos következtetés kapjon rövid, jól látható kiemelést.

A vizuális elemnek tanulási feladata legyen.

A vizuális elem ne legyen puszta dísz.

A forma tegye könnyebbé az összehasonlítást, az időrend, a kapcsolat vagy a fő gondolat felismerését.

Ugyanazt a vizuális mintát nem kell minden részben ismételni.

A fejezet használjon több, a tartalomhoz illő tagolási módot.

Az idézet csak szó szerinti vagy egyértelműen idézetként közölt forrásszöveget tartalmazhat.

Az átfogalmazott magyarázat nem jelenhet meg idézetként.

Az idézet mellett fel kell tüntetni a forrást vagy a PDF-oldalt.

A vizuális tagolás nem rövidítheti felsorolássá a magyarázatot.

A teljes mondatokból álló, összefüggő magyarázatot meg kell tartani.

A felület ne használjon sablonos lila színátmenetet.

A felület működjön telefonon, táblagépen és asztali gépen.

## Minden fejezet kötelező részei

1. Rövid nyitó kérdés vagy hétköznapi helyzet.
2. Tanulási célok.
3. A fogalmak fokozatos, önállóan olvasható magyarázata.
4. A szöveget tagoló, tartalmi célú vizuális elemek, például idővonal, összehasonlítás, idézet, folyamatábra vagy lépéssor.
5. „Egyszerűen mondva” doboz a nehéz részeknél.
6. Fogalomkártyák az új szavakhoz.
7. Legalább egy interaktív elem, ha a témához értelmesen illik.
8. Legalább egy végigvezetett példa.
9. Opcionális kvíz.
10. Rövid összefoglaló.
11. Kapcsolat az előző és a következő fejezettel.
12. Forrás- és pontosítási megjegyzések.

A fejezet kidolgozása előtt át kell tekinteni a `resources/code/` mappában található, a fejezet témájához kapcsolódó kódokat.

A kapcsolódó kódokat fel kell használni a tananyag megértésének segítésére.

A kódpéldák szervesen illeszkedjenek a magyarázatba, közvetlenül annál a fogalomnál, példánál vagy algoritmusnál, amelyről szólnak.

Nem elegendő a kódokat külön gyűjteményként vagy a fejezet végén elhelyezett hivatkozásként megadni.

A releváns kódrészletek mellett rövid, magyar magyarázat mutassa be a bemenetet, a fontos lépéseket és az eredményt.

A magyarázat kapcsolja össze a kód működését az éppen tárgyalt elmélettel.

A felhasznált kód forrásfájlját meg kell nevezni a `resources/code/` mappán belüli pontos útvonalával.

A kód szükség esetén egyszerűsíthető vagy a statikus bemutatóhoz igazítható, de az eltérést jelezni kell.

## Nyelv és hang

Minden felhasználói szöveg magyar legyen.

A hang legyen közvetlen és nyugodt.

A fejezet önmagában legyen érthető.

Az olvasónak ne kelljen mellette megnyitnia a forrás PDF-et.

A PDF érdemi állításait, példáit és szükséges hátterét szervesen kell beépíteni a magyarázatba.

A magyarázat használjon rövid mondatokat.

Az első előfordulásnál minden nehéz szót meg kell magyarázni.

Az angol szakszó a magyar név után zárójelben szerepeljen.

A humor segítheti a figyelmet.

A humor ne tegye nevetségessé a tanulót vagy egy embercsoportot.

A forrás elavult vagy elfogult mondatait történeti vagy kritikai keretben kell bemutatni.

## Interaktív elemek

Az interaktív elemek segítsék a megértést.

Ne legyen öncélú animáció.

Minden interaktív elem működjön billentyűzettel is.

Minden grafika kapjon szöveges magyarázatot.

A vizuális olvasási elemek JavaScript nélkül is adják át a teljes tartalmat.

Telefonon nem okozhatnak vízszintes oldalmozgatást.

Világos és sötét témában is olvashatók legyenek.

Nyomtatáskor se rejtsenek el szükséges magyarázatot.

A mozgás kikapcsolható legyen a rendszer „kevesebb mozgás” beállításával.

A kvízek legyenek kihagyhatók.

A kvíz eredménye ne akadályozza a továbblépést.

A haladás helyben, `localStorage` használatával tárolható.

A `localStorage` a böngésző helyi, kis adattára.

Ne legyen szükség fiókra.

## Minőség és ellenőrzés

Minden mérföldkő végén ellenőrizni kell:

- a hozzá tartozó PDF-oldalak teljes lefedését;
- a `resources/code/` kapcsolódó kódjainak felhasználását és beillesztését a megfelelő magyarázatokhoz;
- a magyar ékezeteket;
- a belső hivatkozásokat;
- a telefonos elrendezést;
- a világos és sötét téma olvashatóságát;
- a szöveg vizuális tagolását;
- azt, hogy az idővonalak, összehasonlítások, idézetek és folyamatábrák valódi tartalmi kapcsolatot mutatnak;
- azt, hogy az idézetek forrása látható, és az átfogalmazás nem idézetként jelenik meg;
- azt, hogy a teljes anyag a PDF párhuzamos megnyitása nélkül is érthető;
- a billentyűzetes használatot;
- a képletek helyességét;
- a kvíz válaszait;
- a böngésző hibajelzéseit.

A kész fejezet ne tartalmazzon „hamarosan” vagy más üres helykitöltő részt.

## A `/implement` parancs szabálya

A `/implement #N` csak az N. mérföldkövet valósítsa meg.

Az 1. mérföldkő hozza létre a közös alkalmazásvázat és a kezdőlapot.

A későbbi mérföldkövek használják újra a közös elemeket.

Egy későbbi mérföldkő módosíthat közös kódot, ha az új fejezethez ez szükséges.

Az ügynök ne valósítsa meg előre a későbbi fejezetek tananyagát.

A navigáció jelezheti a későbbi fejezeteket.

A még el nem készült fejezetek linkje legyen letiltva.

Minden megvalósítás után az ügynök jelölje késznek a mérföldkövet a `README.md` fájlban.
