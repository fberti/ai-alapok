# A 3. mérföldkő ellenőrzése

Oldal: `fejezetek/03-tudasreprezentacio.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 65–88. fájloldal.

## A fejezet átdolgozásának ellenőrzése

Az átdolgozás a PDF 65–88. fájloldalát ismét végigvette. A 74. és 76. oldal képi tartalmát külön is ellenőriztük. A fejezet mind a 12 kiigazítást megtartja. A négy labor és a nyolc kvízkérdés működése nem változott.

- A nyitó térkép elválasztja a hálót, a keretet és az esetet.
- A történeti idővonal mellett a kanári három kérdése bejárható útvonalat kapott. A 0, 1 és 2 lépés modellbeli távolság, nem mért válaszidő.
- Mindhárom Quillian-szópár teljes magyarázatot kapott. Az élnevek külön jelentésjegyzékben szerepelnek.
- A célháló keresőmintája és megoldása egymás mellett látszik. Csipike öröklési útja három lépésben követhető.
- Pityuka adatlapja minden forrásbeli kapcsolatot tartalmaz. A kaszkadőrautó két szülőága a taxit és a kaszkadőrmotort is mutatja.
- A típus–példány, az intenzió–extenzió és a kvantorok különbsége párhuzamos magyarázatot kapott.
- A bárszék öröklési útja, a négy démonesemény és a két előadáskeret összes mezője kattintás nélkül olvasható. A 16:50-es végidőt levezetjük.
- Az esetfolyamat külön igen és nem ágat mutat. A 2. és 3. művelet nem kötelező egymás utáni lépés.
- A 95 cm-es, 7 ülőhelyes kéréshez mindhárom eset pontszámát levezetjük: Bárpult 87,5%, Közös asztal 85%, Olvasósarok 50%. A sikertelen eset minősítése a magas pontszám mellett is látszik.
- A képletben a nulla alsó korlát is szerepel, a működő laborral azonos módon.
- A két kapcsolódó Python-forrás magyarázata az illesztés mellett maradt. Nincs új külső függőség vagy hálózati kérés.

Ellenőrzött fájlok: `fejezetek/03-tudasreprezentacio.html`, `assets/css/chapter-three.css`, `tesztek/bongeszo/chapter-three-layout.spec.cjs`.

Próbák az átdolgozás után:

- `npm test`: 19 sikeres teszt; helyi hivatkozások, egyedi azonosítók és modellek is ellenőrizve.
- `npm run typecheck`: sikeres.
- Teljes böngészős tesztkészlet: 82 sikeres futás. Ebből a harmadik fejezet 24 futás, köztük 10 új tartalmi és elrendezési próba.
- Képernyőszélességek: 320, 390, 768, 1024 és 1365 pixel. Mindkét témában elférnek az olvasási elemek. A kód és a képlet sem igényel oldalsó görgetést.
- JavaScript nélküli olvasás, közvetlen fájlmegnyitás, billentyűzetes laborhasználat és mind a nyolc kvízválasz: sikeres.
- Világos asztali nyitókép és előadáskeretek, sötét telefonos esetfolyamat: képernyőképen ellenőrizve.
- Axe WCAG 2 A/AA: világos asztali és sötét telefonos nézetben 0 hiba, 0 nyitott kézi ellenőrzés. Az első próbában jelzett két megnevezett elem érvényes csoportszerepet kapott.
- Nyomtatási nézet mindkét témából: minden olvasási elem látható, a szöveg változatlan. Sötét módból készített PDF-ben az előadáskeretet és az esetfolyamatot képen is ellenőriztük. A lap háttere nyomtatásban fehér.
- `git diff --check`: sikeres.

A munkakönyvtár neve itt `featherstar`, nem `ai-alapok`. A meglévő tesztbeállítás a szülőből kiszolgált `/ai-alapok/` címet várja. A futtatáshoz ideiglenes `/tmp/ch3-webroot/ai-alapok` hivatkozás mutatott erre a munkakönyvtárra. Az ideiglenes `/tmp/ch3-playwright.config.cjs` csak a kiszolgáló gyökérkönyvtárát és a tesztkönyvtár abszolút útját állította át. A projekt tesztbeállítása nem változott.

Futtatási parancs: `npm run test:browser -- --config=/tmp/ch3-playwright.config.cjs --workers=2`.

## Lefedettség

| PDF-oldal | Tartalom | Hely az oldalon |
|---|---|---|
| 65–68 | Quillian, történeti cél, reakcióidő, szótári keresés; sírás–kényelem, növény–élő, növény–ember | `#halok` |
| 69–70 | Teljes állatháló, jellemzők, kapcsolattípusok, célhálóillesztés | `#halok`, `#illesztes` |
| 71–72 | Egyed, osztály, öröklés, taxonómia, tárolás, hivatkozások, hash tábla, előnyök | `#illesztes` |
| 73 | A jelentés és a hálókezelő szerepe | `#jelentes` |
| 74–75 | Pityuka és Mirmur; kaszkadőrautó, taxi, kaszkadőrmotor; kivétel, alapérték, elsőbbség | `#orokles` |
| 76–77 | Piros, szín, fizikai jellemző; típus–példány; intenzió–extenzió; kvantorok | `#jelentes` |
| 78–79 | Keret, prototípus; bútor, szék, asztal, bárszék összes mezője | `#keretek` |
| 80–82 | Örökölt adatok és eljárások, egységbe zárás, beágyazás, tartomány, alapérték, négy esemény, teljes nyelv- és rendszerlista | `#keretek` |
| 83–84 | Általános előadás és MI-előadás: termek, időadatok, eszközök, örökölt végidőszámítás | `#keretek` |
| 85–88 | Eset három része, eltérő adattípusok közelsége, négy lépés, folyamatábra ágai, előnyök és hátrányok | `#esetek` |

A háló és a bútorhierarchia HTML-ben olvasható. Pityuka adatlapja, a biztosítási ágak, a színpélda és az esetfolyamat látható olvasási formát kapott. A 74. és 76. oldal képi tartalmát külön is megnéztük.

A kiigazítások külön dobozt kaptak. Ezek megkülönböztetik az eredeti állítást, a pontosítást és az indoklást. Külön szerepel az ellentmondásmentesség, a teljes jelentés, a típusok keverése, az OWL név bizonytalansága, a tömeg–súly különbség és a CBR eredményének ellenőrzése. A szakmai források a fejezet végén találhatók.

## Az eredeti megvalósítás kódja és próbái

A `resources/code/` fájljait témák szerint áttekintettük. Közvetlen keret- vagy CBR-megvalósítás nincs köztük. Két kapcsolódó példát olvastunk és illesztettünk a célháló magyarázatába:

- `resources/code/20_Szelessegben_es_melysegben_eloszor.py`: útkereső részlet, bemenet, útvonal és a JavaScript-változat eltérései.
- `resources/code/12_Logika.py`: két kapcsolat közös változójának illesztése. Nem valósítja meg előre a logikai fejezetet.

A felhasználó jóváhagyta a modell eredményeinek és a böngészős vezérlőknek a tesztelését. Mind a négy laborhoz hibázó teszttel indult a megvalósítás. A kvíz is előbb hibázó böngészős tesztet kapott.

- `npm run typecheck`: sikeres.
- `npm test`: 18 sikeres teszt.
- `npm run test:browser`: 52 sikeres teszt, asztali és telefonos mérettel.
- Ebből a harmadik fejezet böngészős próbái: 14 sikeres futás.
- Helyi linkek, horgonyok, erőforrások: sikeres ellenőrzés.
- Projekt-alkönyvtárból való működés, haladás elkülönítése, témaváltás: sikeres.
- JavaScript nélküli közvetlen fájlmegnyitás: sikeres.
- JavaScripttel való közvetlen fájlmegnyitás: kézi böngészős ellenőrzés.
- Asztali világos és telefonos sötét megjelenés: képernyőképen ellenőrizve.
- Axe WCAG 2 A/AA: az utolsó telefonos sötét ellenőrzésben 0 hiba és 0 kézi ellenőrzésre maradt tétel. Az asztali világos ellenőrzés is hibamentes volt.
- A kóddoboz telefonon görgethető. Az első hozzáférhetőségi próba után billentyűzetes fókuszt kapott.
- Új fejezet böngészőkonzolja: nincs észlelt hiba.
- A magyar ékezeteket, a nyolc kvízválaszt, a szigorú magassághatárokat, a 16:50-es végidőt és a hasonlósági mintaszámítást ellenőriztük.

## Az eredeti megvalósítás kódellenőrzése

Kiindulópont: `47451e0777850c5bbaaedd76dbb658cd140a4f27`.

Specifikáció: `TERV.md`, 3. mérföldkő; `LEFEDETTSEGI_TERKEP.md`, 3. mérföldkő.

Szabályok: `AGENTS.md`, `IMPLEMENTALASI_SZABALYOK.md` és a code-review skill kódszag-listája.

A két ellenőrzési szempontot kézzel, külön vizsgáltuk. Ebben a munkamenetben nem volt külön alügynököt indító eszköz, ezért nem készült párhuzamos, független alügynöki ellenőrzés.

- **Szabályok:** nincs nyitott eltérés. A közös témát, kvízt és haladást újra használjuk. A bevitt neveket szövegként jelenítjük meg. A háló nem enged típustévesztő vagy körképző osztályélt. A mobil kóddoboz fókuszhibáját javítottuk. Az ellenőrzés után az eset sikerét külön logikai mező tárolja; nem a magyar minősítés szövegéből dönt a program.
- **Specifikáció:** nincs nyitott hiány. Csak a 3. mérföldkő készült el. A 4. fejezet nem kapott aktív linket. A célháló általános illesztését megoldott példa tanítja; a labor ennek egyszerű osztályút-kereső változatát használja, és ezt jelzi.

A laborok korlátozott tanmodellek. Nem teljes hálókövetkeztető, keretkezelő vagy tanuló CBR-rendszerek. A biztosítás és a bútoreseti értékek nem valós tanácsok. A kvíz kihagyható.
