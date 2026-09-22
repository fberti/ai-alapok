# A 6. mérföldkő ellenőrzése

Oldal: `fejezetek/06-neuralis-halozatok.html`.

Forrás: `resources/presentation/Mesterseges_intelligencia_alapjai_levelezo_01-10.pdf`, 142–221. fájloldal.

A hatodik mérföldkő készült el. A kezdőlap és az ötödik fejezet a hatodikra vezet, a hetedik még nem elérhető. Nincs új projektfüggőség, szerveroldali kód vagy külső tanulási szolgáltatás.

| PDF-oldal | Feldolgozott témák | Fejezet |
|---|---|---|
| 142–148 | Motiváció, szimbolikus és szubszimbolikus módszerek, feladatok, összes történeti alkalmazási példa | `#motivacio` |
| 149–166 | Neuron, súly, eltolás és a tizenegy aktivációs függvény, közös tengely, Rosenblatt történeti pontosítása | `#neuron` |
| 167–181 | Topológia, rétegek, visszacsatolásfajták, stabilitás, biológiai megfeleltetések, közelítés, metszés és növesztés | `#topologia` |
| 182–195 | McCulloch–Pitts, perceptron, elválasztó hipersík, Adaline, XOR és az oktatói kézi kód | `#perceptron` |
| 196–207 | Felügyelt, megerősítéses, sztochasztikus és felügyelet nélküli tanulás, veszteség, általánosítás, információelmélet, Keras-kód | `#tanulas` |
| 208–212 | Helyes deriváltelőjel, gradiensvölgy, kimeneti és rejtett hibajel, két réteg teljes frissítése | `#gradiens` |
| 213–221 | Adaptivitás, tervezési és tanítási szempontok, teljesítménymérés, versenyzés, együttműködés, normalizálás | `#tervezes` |

Nyolc állítható labor és tizenkét opcionális kvízkérdés készült. A két oktatói kód (`resources/code/13_Neuralis_halo_kezzel.py` és `resources/code/14_Neuralis_halo_keras.py`) részletei, működése és hibái a hozzájuk tartozó tanulási részekben olvashatók. A tananyagot és a megoldott példákat JavaScript nélkül, nyomtatásban és közvetlen fájlmegnyitással is ellenőriztük. A mobil-, asztali-, világos és sötét nézeteket a böngészőteszt járja végig.

Ellenőrzés: `npm run typecheck`, `npm test` (33 sikeres), `npm run test:browser` (128 sikeres). A teljes böngészőteszt tartalmazza a hatodik fejezetet asztali és telefonos projektben.
