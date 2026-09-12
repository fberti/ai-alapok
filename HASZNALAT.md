# Használat és közzététel

## Megnyitás

Nyisd meg az `index.html` fájlt a böngészőben.

Az első fejezet külön fájlból is megnyitható:

`fejezetek/01-mi-es-intelligencia.html`

A második fejezet: `fejezetek/02-tudasbazisok.html`.

Az ötödik fejezet: `fejezetek/05-prolog-es-fuzzy.html`.

A kész jelölést minden fejezet külön tárolja.

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

## Fejlesztői ellenőrzés

Node.js 24 és Python 3 szükséges.

```bash
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm run test:browser
```

A böngészőtesztek a 48173-as portot használják.

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
7. Nyisd meg közvetlenül az első fejezet címét is.

A szükséges kiadási fájlok: `index.html`, `eloadasfelvetelek.html`, `fejezetek/`, `assets/` és `resources/`.

A `resources/` mappa a helyben hivatkozott oktatói PDF-et és kódokat is tartalmazza.

Nincs fordítási lépés, háttérszerver, adatbázis vagy API-kulcs.

A `node_modules/` könyvtár nem kell a közzétett oldalhoz.

## Jelenlegi hatókör

Az 1–5. fejezet készült el.

A 6–10. fejezet címe szerepel a tanulási úton, de nem kattintható.

A következő fejezethez: `/implement #6`.
