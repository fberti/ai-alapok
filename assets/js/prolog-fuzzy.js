const CoursePrologFuzzy = (() => {
  /** A bounded trace of the chapter's two-fact program, not a Prolog interpreter.
   * @param {boolean} reversed @param {boolean} cut */
  function prologTrace(reversed, cut) {
    const facts = [['kleopatra','gina'], ['gina','ursula']];
    if (reversed) facts.reverse();
    /** @type {{kind:string, goal:string, text:string}[]} */
    const steps = [];
    /** @type {string[]} */
    const answers = [];
    steps.push({kind:'goal', goal:'sokkal_szebb(Valaki,ursula)', text:'A cél illeszkedik a szabály fejére: A = Valaki, C = ursula.'});
    steps.push({kind:'rule', goal:`szebb(Valaki,B), ${cut ? '!, ' : ''}szebb(B,ursula)`, text:'Balról az első részcélt oldjuk meg. A és B még nincs lekötve.'});
    for (const [a,b] of facts) {
      steps.push({kind:'match', goal:`szebb(${a},${b})`, text:`Az első részcél sikerül: Valaki = ${a}, B = ${b}.`});
      if (cut) steps.push({kind:'cut', goal:'!', text:'A vágás rögzíti az eddigi választást. Az első részcél másik ténye már nem próbálható.'});
      const goal = `szebb(${b},ursula)`;
      steps.push({kind:'call', goal, text:'A második részcél ugyanazt a B értéket használja.'});
      if (facts.some(([x,y]) => x === b && y === 'ursula')) {
        answers.push(a);
        steps.push({kind:'answer', goal:'true', text:`Megoldás: Valaki = ${a}. Új választ kérve folytatjuk a keresést.`});
      } else steps.push({kind:'failure', goal, text:'Zsákutca: nincs ilyen tény, és nincs hozzá szabály.'});
      if (cut) break;
      steps.push({kind:'backtrack', goal:'szebb(Valaki,B)', text:'Visszalépés: Valaki és B kötését feloldjuk. A következő tényt keressük.'});
    }
    steps.push({kind:'done', goal:'false', text:`Nincs több válasz. Összesen ${answers.length} megoldás. A végső false nem törli a korábbi választ.`});
    return {facts, steps, answers};
  }
  /** @param {number} x @param {number} a @param {number} b @param {number} c */
  function triangle(x,a,b,c) {
    if (x < a || x > c) return 0;
    if (x === b) return 1;
    return x < b ? (x-a)/(b-a) : (c-x)/(c-b);
  }
  /** @param {number} x @param {number} a @param {number} b @param {number} c @param {number} d */
  function trapezoid(x,a,b,c,d) {
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    return x < b ? (x-a)/(b-a) : (d-x)/(d-c);
  }
  /** @param {string} shape @param {number} x @param {number} center @param {number} width */
  function curve(shape,x,center,width) {
    if (![x,center,width].every(Number.isFinite) || width <= 0) throw Error('Véges értékek és pozitív szélesség kell.');
    if (shape === 'triangle') return triangle(x,center-width,center,center+width);
    if (shape === 'trapezoid') return trapezoid(x,center-width,center-width/2,center+width/2,center+width);
    if (shape === 'gaussian') return Math.exp(-.5*((x-center)/width)**2);
    throw Error('Ismeretlen görbe.');
  }
  /** The two PDF rules with explicitly chosen teaching scales.
   * @param {number} score @param {number} attendance */
  function exam(score,attendance) {
    if (!Number.isFinite(score) || score < 0 || score > 100 || !Number.isFinite(attendance) || attendance < 0 || attendance > 12) throw Error('A pontszám 0–100, az óraszám 0–12 közötti szám legyen.');
    const memberships = {medium:triangle(score,30,50,70),good:triangle(score,50,70,90),excellent:trapezoid(score,70,90,100,100),rare:trapezoid(attendance,0,0,3,9),frequent:trapezoid(attendance,3,9,12,12)};
    const strengths = [Math.min(memberships.good,memberships.rare),Math.min(memberships.medium,memberships.frequent)];
    const [jeles,jo] = strengths;
    // Corners: 3,4,5. Clip edges: 3+jo,5-jo,4+jeles.
    // Crossings: 4.5 between slopes; 4+jo and 5-jeles against plateaus.
    // Integrate the piecewise-linear aggregate exactly, not screen pixels.
    const xs = [...new Set([1,3,3+jo,4,4+jo,4+jeles,4.5,5-jo,5-jeles,5])].sort((a,b) => a-b);
    const points = xs.map(x => ({x, y:Math.max(Math.min(jeles,triangle(x,4,5,5)),Math.min(jo,triangle(x,3,4,5)))}));
    let area = 0, moment = 0, maxLength = 0, maxMoment = 0;
    const peak = Math.max(jeles,jo);
    for (let i = 1; i < points.length; i++) {
      const a = points[i-1], b = points[i], width = b.x-a.x;
      area += width*(a.y+b.y)/2;
      moment += width*(a.x*(2*a.y+b.y)+b.x*(a.y+2*b.y))/6;
      if (peak > 0 && Math.abs(a.y-peak) < 1e-12 && Math.abs(b.y-peak) < 1e-12) {
        maxLength += width; maxMoment += width*(a.x+b.x)/2;
      }
    }
    const peaks = points.filter(p => Math.abs(p.y-peak) < 1e-12);
    const maximum = peak === 0 ? null : maxLength > 0 ? maxMoment/maxLength : peaks.reduce((sum,p) => sum+p.x,0)/peaks.length;
    return {memberships, strengths, points, centroid:area > 0 ? moment/area : null, weighted:peak > 0 ? (5*jeles+4*jo)/(jeles+jo) : null, maximum};
  }
  return {prologTrace, triangle, trapezoid, curve, exam};
})();
if (typeof module !== 'undefined') module.exports = CoursePrologFuzzy;
