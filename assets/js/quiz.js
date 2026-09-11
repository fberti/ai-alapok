const CourseQuiz = (() => {
  const questions = [
    {prompt:'Egy teszt ismételve hasonló eredményt ad. Mit jelez ez?', options:['Biztosan azt méri, amit szeretnénk.','Megbízható, de az érvényességét külön kell vizsgálni.','Minden kultúrában azonosan működik.'], answer:1, explanation:'A megbízhatóság következetes mérést jelent. Ettől még lehet, hogy a teszt logika helyett főleg szókincset mér.'},
    {prompt:'Mit mutat közvetlenül egy Turing-teszt eredménye?', options:['A gép tudatának fokát.','A gép teljes emberi tudását.','A válaszadó megkülönböztethetőségét az adott helyzetben.'], answer:2, explanation:'A bíráló ítéletét mérjük egy adott protokollban. Az emberi stílus nem közvetlen bizonyíték tudatra.'},
    {prompt:'Egy termosztát rögzített küszöbnél kapcsol. Mire következtethetünk?', options:['Automatikusan működik; tanulás nem következik ebből.','Mindenképpen tanul.','Mindenképpen emberien gondolkodik.'], answer:0, explanation:'Az érzékelés és a kapcsolás automatizálás. Tanuláshoz a tapasztalatnak módosítania kellene a működését.'},
    {prompt:'Ismeretlen rejtvényben új szabályt fedezel fel. Melyik fogalom illik jobban ide?', options:['Kristályos intelligencia: kizárólag felidézés.','Folyékony intelligencia: új összefüggés felismerése.','A kettő egyáltalán nem különíthető el.'], answer:1, explanation:'A folyékony intelligencia új feladatok megoldásához kapcsolódik. A tanult ismeretek alkalmazása a kristályos oldal.'},
    {prompt:'Mit kérdez a beszélőfelismerés?', options:['Mit mondott?','Milyen nyelvtani szerkezetet használt?','Ki mondta?'], answer:2, explanation:'A beszélőfelismerés a személy jellemzőit keresi. A beszédfelismerés célja a hangból szöveg.'},
    {prompt:'Mit jelent a korlátkielégítés?', options:['Minden feltételnek megfelelő értékeket keresünk.','Csak a legfontosabb feltételt tartjuk be.','Mindig a leggyorsabb algoritmust választjuk.'], answer:0, explanation:'A megoldásnak az összes korlátot teljesítenie kell. A nyolc vezérnél a sor, oszlop és átló egyszerre számít.'},
    {prompt:'Mi a DENDRAL szakértői szabályainak egyik haszna?', options:['Mérések nélkül biztos diagnózist adnak.','Kizárhatnak lehetetlen szerkezetjelölteket.','Minden vegyületből ugyanazt készítik.'], answer:1, explanation:'A szakmai tudás csökkenti a keresési teret. A spektrum alapján jelölteket szűrünk, nem varázslattal bizonyítunk.'},
    {prompt:'Miért nehéz a „feldobta a bocskorát” fordítása?', options:['Mert nincs benne ige.','Mert mindig cipődobást jelent.','Mert a szókapcsolat átvitt jelentése és a helyzet is számít.'], answer:2, explanation:'A szó szerinti fordítás elveszítheti a halálra utaló értelmet és a párbeszédben rejlő figyelmeztetést.'},
    {prompt:'Egy felismerőre 99,9%-ot mondanak. Mit érdemes először kérdezni?', options:['Milyen adatokon, milyen hibát és milyen feltételekkel mértek?','Milyen színű a felület?','Ez akkor biztosan soha nem hibázik?'], answer:0, explanation:'A százalék csak a mérés feltételeivel együtt értelmezhető. A ritka hiba is jelentős lehet sok esetnél.'},
    {prompt:'A gép jól ír le beszédet. Következik ebből minden emberi munka megszűnése?', options:['Igen, minden feladat ugyanaz.','Nem. Egy részfeladat sikere nem a teljes munkakör átvétele.','Igen, ha elég gyors.'], answer:1, explanation:'Egy munkakör több feladatból, felelősségből és emberi kapcsolatból áll. A technikai képesség és a munkapiaci hatás külön kérdés.'}
  ];
  /** @param {number} index @param {number | null} choice */
  function grade(index, choice, bank = questions) {
    const q = bank[index];
    if (!q || choice === null || !Number.isInteger(choice) || choice < 0 || choice >= q.options.length) {
      return {correct:false, text:'Válassz egy választ, vagy hagyd ki ezt a kérdést.'};
    }
    const correct = choice === q.answer;
    return {correct, text:`${correct ? 'Így van!' : 'Még nem egészen.'} ${q.explanation}`};
  }
  function mount(bank = questions) {
    const container = document.getElementById('quiz-questions');
    const score = document.getElementById('quiz-score');
    if (!container || !score) return;
    /** @type {Map<number, boolean>} */
    const results = new Map();
    const showScore = () => {score.textContent = `${results.size}/${bank.length} kérdés ellenőrizve. ${[...results.values()].filter(Boolean).length} helyes válasz. Bármikor továbbléphetsz.`;};
    bank.forEach((q,index) => {
      const fieldset = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = `${index + 1}. ${q.prompt}`; fieldset.append(legend);
      q.options.forEach((option, choice) => {
        const label = document.createElement('label'), input = document.createElement('input');
        input.type = 'radio'; input.name = `quiz-${index}`; input.value = String(choice);
        input.addEventListener('change', () => {
          results.delete(index); feedback.hidden = true; feedback.textContent = ''; showScore();
        });
        label.append(input, ` ${option}`); fieldset.append(label);
      });
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Válasz ellenőrzése';
      const feedback = document.createElement('p'); feedback.className = 'feedback'; feedback.setAttribute('aria-live','polite'); feedback.hidden = true;
      button.addEventListener('click', () => {
        const selected = fieldset.querySelector('input:checked');
        const choice = selected instanceof HTMLInputElement ? Number(selected.value) : null;
        const result = grade(index,choice,bank);
        feedback.hidden = false; feedback.textContent = result.text;
        if (choice !== null) results.set(index,result.correct);
        showScore();
      });
      fieldset.append(button,feedback); container.append(fieldset);
    });
    document.getElementById('quiz-reset')?.addEventListener('click', () => {
      container.querySelectorAll('input').forEach(input => input.checked = false);
      container.querySelectorAll('.feedback').forEach(el => {if (el instanceof HTMLElement) {el.hidden = true; el.textContent = '';}});
      results.clear(); showScore(); container.querySelector('input')?.focus();
    });
    showScore();
  }
  return {questions, grade, mount};
})();
if (typeof module !== 'undefined') module.exports = CourseQuiz;
if (typeof document !== 'undefined' && document.body.dataset.quiz !== 'manual') CourseQuiz.mount();
