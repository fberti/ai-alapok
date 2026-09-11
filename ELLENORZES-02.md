# 2. mérföldkő ellenőrzése

A fejezet: `fejezetek/02-tudasbazisok.html`.

## Átdolgozás az első fejezet olvasási mintája szerint

A PDF 36–64. oldalát újra összevetettük a fejezettel. A 41., 60. és 62. oldal ábráját renderelt képen is ellenőriztük. Az alábbi eredmények a mostani átdolgozásra vonatkoznak; a későbbi szakaszok az eredeti mérföldkő ellenőrzési nyomát őrzik.

- A nyolc reprezentációs elv teljes, közös hibakeresési példára épülő magyarázatot kapott.
- A fejlesztés öt lépése, a tudásgyűjtés négy szakasza, az elemzés négy lépése és a következtetés háromrészes ciklusa számozott, összekötött lépéssort használ. A fejlesztés visszautai is láthatók.
- A kézikönyv kilenc eleme és a részletes tudás tizenhárom összetevője nem összecsukható részben, hanem folyamatosan látható magyarázatban szerepel.
- A szakértőtípusok és a K1–K6 kérdések keskeny képernyőn is teljes szélességben olvashatók. Nem kell táblázatot oldalra görgetni.
- A villámlásos párbeszéd beszélgetési formát kapott. A képaláírás átfogalmazásként jelöli, ezért nem `blockquote` elem.
- Az egyetlen kiemelt idézet a PDF 40. oldalának szó szerinti mondata. Mellette látható az oldalszám.
- Az előre- és hátraláncoláshoz külön, kattintás nélkül olvasható levezetés tartozik. Mindkettő kitér a hiányzó d tényre. A hátraláncolás nem fordítja meg az implikációt.
- Mind a 46 eredeti HTML-azonosító és mind a kilenc kiigazítás szövege megmaradt. Az öt labor és a kilenckérdéses kvíz vezérlőkódját nem módosítottuk.
- A `resources/code/` fájljai közül áttekintettük a `12_Logika.py` szabályláncolását és a `11_Fuzzy.py` szabályozási példáját. A közvetlenül ide tartozó három pyDatalog-szabály változatlanul bekerült a láncolás magyarázatához. A fuzzy szabályok részletes tárgyalása az ötödik fejezet témája marad.
- A kódhoz megadott saját bemenet eltérését jelezzük. A két apai tényből levezetett szülőkapcsolatokat és az `Andras`–`Csaba` nagyszülőkapcsolatot pyDataloggal is ellenőriztük. A kódrészlet sorai egyeznek az oktatói fájl soraival. Az oldal nem futtat Pythont.

Ellenőrzések:

- `npm test`: 19 sikeres teszt.
- `npm run typecheck`: sikeres.
- Playwright: 72 sikeres böngészőteszt, asztali és telefonos beállításokkal. Az új `tesztek/bongeszo/chapter-two-layout.spec.cjs` hat tesztje mindkét beállítással lefutott.
- A böngészőtesztek a munkafát kiszolgáló ideiglenes `/ai-alapok/` útvonalon futottak: `npx playwright test --config /tmp/featherstar-ch01/playwright.config.cjs`. Ez a meglévő konfiguráció kiszolgálási gyökerét igazítja a `featherstar` munkafanévhez. A tároló alapkonfigurációját nem változtattuk meg.
- Az új elrendezéseket 320, 390, 768, 1024 és 1365 px szélességen, világos és sötét témában ellenőriztük. Nincs vízszintes túllógás.
- A teljes új olvasási tartalom JavaScript nélkül is látható. A nyomtatási stílus világos és sötét oldalból is olvasható papírt készít, a kézikönyv és a levezetések nem tűnnek el.
- Két A4-es próba-PDF készült, háttérnyomtatás és JavaScript nélkül. A szövegkinyerés ellenőrizte a kézikönyv, a részletes tudás, a párbeszéd, a kód, a hátraláncolás és az összegzés jelenlétét. A kézikönyvet, a kódot és a hátraláncolást nyomtatott oldalképen is megvizsgáltuk.
- Asztali világos folyamat- és szabályábra, valamint telefonos sötét párbeszéd-, kód- és kézikönyvnézet képi ellenőrzése megtörtént.
- Axe-core WCAG A/AA: mindkét témában 0 biztos hiba. A nyilak kontrasztját az automata kézi vizsgálatra hagyta; a nyilak olvashatók, és jelentésüket szöveg is megadja. Ez nem teljes akadálymentességi tanúsítás.
- Szigorú HTML5-feldolgozás: sikeres. A helyi hivatkozásokat és az egyedi azonosítókat az egységtesztek is ellenőrzik.
- `git diff --check`: sikeres.

A képernyőképek, próba-PDF-ek és futási naplók helyi ellenőrzési anyagai a `/tmp/featherstar-ch02/` könyvtárban vannak. Nem részei a kiadásnak.

## Forráslefedés

A PDF 36–64. oldalának szövegét a `pdftotext -layout` eszközzel olvastuk ki. A 60. és 62. oldal nem szöveges ábráját renderelt képen is ellenőriztük. Az ábrák HTML-változata mellett szöveges magyarázat áll.

| PDF-oldal | Tartalom | Fejezetrész |
|---|---|---|
| 36–40 | Tudás, kódolás, gépidő és tárhely, statikus/dinamikus modell, önszervezés, szimbolikus fogalom, nyolc reprezentációs elv | `#tudas` |
| 41–42 | Vízesésmodell, öt lépés, köztes eredmények és visszautak; szakértő és tudásmérnök | `#folyamat` |
| 43–45 | Tudáskinyerés négy szakasza; előzetes feltárás céljai és eszközei; a kézikönyv kilenc része | `#folyamat` |
| 46–47 | Források, hitelesség négy szereplő előtt, heurisztika; három történeti szakértőtípus, helyi/kozmopolita kötődés, motiváció | `#szakerto` |
| 48–49 | Előzetes tudás négy csoportja; részletes tudás mind a tizenhárom összetevője | `#szakerto` |
| 50–51 | Interjúk, K1–K6 sablon és hatás; villámlás, port, billentyűk, kontaktus, sebesség és paritás példája | `#kinyeres` |
| 52–53 | Protokollelemzés, online/offline, ön-/árnyékbeszámoló, végigvezetés, két kérdőív és két beszámolóforma | `#kinyeres` |
| 54–55 | Átírás, indexelés, kódolás négy szempontja, leíró/eljárási tudás; 75%-os példa, dokumentálás négy része | `#kodolas` |
| 56 | Automatikus tudáskinyerés forrásai és minden felsorolt lehetséges előnye | `#kodolas` |
| 57–59 | Előállító szabály, implikáció, modus ponens, hűtési példa, láncolás és következtetési fa; a,b,c,d → e,f → g | `#szabalyok` |
| 60–61 | Előre-/hátraláncolás iránya és alkalmazási helyzete, hipotézis, dedukció | `#szabalyok` |
| 62–64 | Rendszerábra négy eleme és kapcsolatai, illesztés/választás/alkalmazás, konfliktushalmaz, előnyök és korlátok | `#rendszer` |

A kiigazítások külön dobozban tartalmazzák a forrás állítását, a pontosítást, az indokot és példát. A szakmai pontosítások Poole–Mackworth, CLIPS, NIST, USB-IF és GOV.UK forrásokat neveznek meg. A történeti szakértőtípusoknál külön jelezzük a PDF általánosító bizonyítékának hiányát. A Winston-lista pontos bibliográfiai eredetét a PDF nem adja meg; ezt a fejezet nem állítja ellenőrzött adatnak.

## Működés és tesztek

A felhasználó előre jóváhagyta a két tesztpontot: a szabálymotor nyilvános függvényeit és a böngészőben elérhető vezérlőket. A szabálymotor, a rendező, az interjú, a láncolás, a konfliktusjáték és a külön haladásjelölés tesztje előbb hibát jelzett, majd a megvalósítás után átment.

- `npm run typecheck`: sikeres.
- `npm test`: 13 sikeres teszt.
- `npm run test:browser`: 38 sikeres teszt asztali és telefonos nézetben. Ebből 20 a második fejezetet ellenőrzi.
- `git diff --check`: sikeres.
- A két fejezet és a kezdőlap helyi linkjei és azonosítói érvényesek.
- Az öt bemutató működik és újrakezdhető. A rendező billentyűzettel is használható.
- Az animált láncolás léptethető, indítható és megállítható. A hiányzó d tény miatt g nem igazolható. A csökkentett mozgás beállítása letiltja az átmenetet.
- A konfliktusjáték lista- és prioritásalapú választást ellenőriz. Rossz választás nem módosít tényt.
- Mind a kilenc kvízválasz helyes értékelést és magyarázatot kap. Üres és hibás válasz, válaszmódosítás, újrakezdés és kihagyás is tesztelt.
- Az első és második fejezet kész jelölése külön kulcsot használ. A tiltott helyi tároló nem állítja le a tananyagot.
- A GitHub Pages jellegű `/ai-alapok/` út, az újratöltés és a közvetlen `file://` megnyitás működik.
- JavaScript nélkül a tananyag és a megoldott példák olvashatók. Nincs külső futási erőforrásigény.
- A böngészőtesztek minden JavaScript-hibát teszthibának tekintenek. Nem találtak hibát.
- A 390 px-es telefonos nézet nem lóg túl. Asztali világos és telefonos sötét képernyőképet is megvizsgáltunk.
- Az axe-core WCAG A/AA vizsgálat a javítás után mindkét témánál 0 biztos hibát jelzett. Az automata a dekoratív nyilak és a részben kitakart táblacellák kontrasztját kézi ellenőrzésre hagyta. Ez nem teljes akadálymentességi tanúsítás.

## Kódellenőrzés

A viszonyítási pont a külön témakommit: `81f7614`. Két párhuzamos, csak olvasó ügynök vizsgálta a fejezet előkészített változásait.

**Szabályok:** két dokumentált hibát találtak: az interjú pontosításának doboztípusa és a szakmai szavak korai magyarázata. Mindkettőt javítottuk. A két kódminőségi észrevételt is kezeltük: a kérdésgomb stabil adatkulccsal választ megnevezett válaszmezőket; az előreláncolás a szabálymotorba került.

**Terv:** három hibát találtak: a hiányzó ellenőrzési fájlt, a doboztípust és az első előfordulásnál hiányzó magyarázatokat. Ez a fájl pótolja az ellenőrzési nyomot; a másik kettőt a fejezet szövegében javítottuk. A teljes tesztfutás a kódjavítások után történt. Későbbi fejezet tananyagát nem készítettük el.
