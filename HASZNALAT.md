# Használat és közzététel

## Megnyitás

Nyisd meg az `index.html` fájlt a böngészőben.

Az első fejezet külön fájlból is megnyitható:

`fejezetek/01-mi-es-intelligencia.html`

A második fejezet: `fejezetek/02-tudasbazisok.html`.

A harmadik fejezet: `fejezetek/03-tudasreprezentacio.html`.

A negyedik fejezet: `fejezetek/04-formalis-logika.html`.

Az ötödik fejezet: `fejezetek/05-prolog-es-fuzzy.html`.

A hatodik fejezet: `fejezetek/06-neuralis-halozatok.html`.

A hetedik fejezet: `fejezetek/07-szamitasi-problemak.html`.

A nyolcadik fejezet: `fejezetek/08-genetikus-algoritmusok.html`.

A kilencedik fejezet: `fejezetek/09-neminformalt-kereses.html`.

A tizedik fejezet: `fejezetek/10-informalt-kereses.html`.

A fogalomtár és kereső: `fogalomtar.html`. A kezdőlap keresőmezője is ide visz (`fogalomtar.html?q=…`).

A kvízválaszokat minden fejezet külön tárolja.

A tananyag, a bemutatók és a kvíz nem igényelnek internetet.

A külső szakmai források megnyitásához internet kell.

A saját haladás tárolását a böngésző korlátozhatja, különösen közvetlen fájlmegnyitásnál.

Ha a mentés nem sikerül, az oldal ezt jelzi.

## Helyi szerver

A projekt könyvtárában:

```bash
python3 -m http.server 48174 --bind 127.0.0.1
```

Ezután nyisd meg: `http://127.0.0.1:48174`.

## Generált oldalak

A 9. és a 10. fejezet statikus ábráit (gráfok, keresőfák, fronttáblázatok, a felszín és a hűtés ábrái) és a fogalomtárat script állítja elő. A forrásuk:

- `eszkozok/09-sablon.html` és `eszkozok/09-abrak.cjs` → `fejezetek/09-neminformalt-kereses.html`;
- `eszkozok/10-sablon.html` és `eszkozok/10-abrak.cjs` → `fejezetek/10-informalt-kereses.html`;
- `eszkozok/11-sablon.html` és `eszkozok/11-abrak.cjs` → `fejezetek/11-zh-gyakorlo.html` (a minta-zh gráfja és hálója, a gyakorló gráf keresőfái és táblázatai);
- `eszkozok/fogalomtar.cjs` → `fogalomtar.html` (a fejezetek fogalomkártyáiból és tartalomjegyzékéből).
- `eszkozok/kodtippek.cjs` → a kódrészletek magyarázó tippjei (`eszkozok/kodtippek/*.json`).

A két fejezet szövegét a sablonban kell szerkeszteni, nem a kész HTML-ben. A sablon `<!--@név-->` jelölői helyére a script a tesztelt `assets/js/search.js` modellből rajzolt SVG-ket és táblázatokat illeszti. Szerkesztés után a projekt gyökeréből:

```bash
node eszkozok/09-abrak.cjs
node eszkozok/10-abrak.cjs
node eszkozok/11-abrak.cjs
node eszkozok/kodtippek.cjs
node eszkozok/fogalomtar.cjs
```

A `kodtippek.cjs` a kódrészletek magyarázó tippjeit csomagolja be az `eszkozok/kodtippek/` JSON-fájljaiból (közös szótár és fejezetenkénti tippek). Kódrészlet módosítása után ezt is futtatni kell.

A fogalomtárat minden fejezetmódosítás után újra kell generálni. Az `npm test` ellenőrzi, hogy a három kimenet megegyezik a script friss eredményével.

## Fejlesztői ellenőrzés

Node.js 24 és Python 3 szükséges.

```bash
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm run test:browser
```

A böngészőtesztek a 48173-as portot használják. A `tesztek/bongeszo/kurzus.spec.cjs` a teljes kurzust ellenőrzi: minden oldal közvetlen megnyitását és újratöltését, a JavaScript-hibákat és az összes belső hivatkozást, horgonyokkal együtt.

A tesztkiszolgáló a projektet `/ai-alapok/` alkönyvtárból szolgálja ki.

Ez a GitHub Pages projektoldalak útvonalait is ellenőrzi.

A JavaScript klasszikus, elkülönített modulokat használ.

Ezért a közvetlen fájlmegnyitás nem igényel ES-modulokat kiszolgáló HTTP-szervert.

A típusellenőrzést a TypeScript végzi a JavaScript és a JSDoc leírásai alapján.

## GitHub Pages

A közzététel nincs automatikusan elindítva.

A következő lépésekhez saját GitHub-tár szükséges.

1. Töltsd fel a projektet a saját GitHub-táradba.
2. Nyisd meg a tár `Settings → Pages` lapját.
3. A forrásnál válaszd a `Deploy from a branch` lehetőséget.
4. Válaszd a feltöltött ágat és a `/(root)` mappát.
5. Mentsd a beállítást.
6. A GitHub által megadott címen nyisd meg a kezdőlapot.
7. Nyisd meg közvetlenül egy fejezet címét is (például `…/fejezetek/10-informalt-kereses.html`), és töltsd újra az oldalt.

A közzétett cím `https://<felhasznalo>.github.io/<repo>/` alakú. Minden hivatkozás relatív, ezért az alkönyvtárban is működik; a helyi böngészőtesztek pontosan ezt az `/ai-alapok/` alkönyvtárat utánozzák.

A szükséges kiadási fájlok: `index.html`, `eloadasfelvetelek.html`, `fogalomtar.html`, `fejezetek/`, `assets/` és `resources/`. Az `eszkozok/`, `tesztek/` és a Markdown-fájlok fejlesztői anyagok; közzétételük nem árt, de nem szükséges.

A `resources/` mappa a helyben hivatkozott oktatói PDF-et és kódokat is tartalmazza.

Nincs fordítási lépés, háttérszerver, adatbázis vagy API-kulcs.

A `node_modules/` könyvtár nem kell a közzétett oldalhoz.

## Jelenlegi hatókör

Mind a tíz fejezet elkészült, a fogalomtárral és keresővel együtt.

A kurzus közzétételre kész. A tényleges közzététel külön döntés: a fenti lépéseket a tár tulajdonosa végzi el.
