const CourseRules = (() => {
  // Finite, positive, propositional rules: no deletion or real-world actions.
  const rules = [
    {id:'R1', when:['a','b'], then:'e'},
    {id:'R2', when:['c','d'], then:'f'},
    {id:'R3', when:['e','f'], then:'g'}
  ];
  /** @param {string[]} facts */
  function applicable(facts) {
    return rules.filter(rule => !facts.includes(rule.then) && rule.when.every(fact => facts.includes(fact)));
  }
  /** @param {string[]} facts @param {string} id */
  function apply(facts, id) {
    const rule = applicable(facts).find(rule => rule.id === id);
    return rule ? [...facts, rule.then] : [...facts];
  }
  /** @param {string[]} facts */
  function forward(facts) {
    let current = [...facts];
    const steps = [`Kiinduló tények: ${current.join(', ')}.`];
    while (applicable(current).length) {
      const available = applicable(current);
      steps.push(`Mintaillesztés: ${available.map(rule => rule.id).join(', ')} alkalmazható.`);
      current = apply(current,available[0].id);
      steps.push(`${available[0].id} alkalmazása: ${available[0].then} új tény.`);
    }
    steps.push('Nincs további új tényt adó szabály.');
    return {facts:current, steps};
  }
  /** @param {string[]} facts @param {string} goal */
  function backward(facts, goal) {
    /** @type {{kind:string, fact:string, text:string}[]} */
    const steps = [];
    /** @param {string} fact @param {string[]} path @returns {boolean} */
    function prove(fact, path) {
      steps.push({kind:'goal', fact, text:`Cél ellenőrzése: ${fact}.`});
      if (facts.includes(fact)) {
        steps.push({kind:'known', fact, text:`${fact}: ismert tény.`}); return true;
      }
      if (path.includes(fact)) return false;
      for (const rule of rules.filter(rule => rule.then === fact)) {
        steps.push({kind:'rule', fact, text:`${rule.id}: ${fact} igazolásához ${rule.when.join(' és ')} kell.`});
        if (rule.when.every(condition => prove(condition, [...path, fact]))) {
          steps.push({kind:'proven', fact, text:`${fact}: igazolva (${rule.id}).`}); return true;
        }
      }
      steps.push({kind:'missing', fact, text:`${fact}: nem igazolható a megadott tényekből. Ez nem bizonyítja a tagadását.`});
      return false;
    }
    const proven = prove(goal, []);
    return {proven, steps};
  }
  return {rules, applicable, apply, forward, backward};
})();
if (typeof module !== 'undefined') module.exports = CourseRules;
