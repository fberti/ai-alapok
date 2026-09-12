const CourseLogic = (() => {
  /** @typedef {{op:'atom', name:string} | {op:'not', child:Formula} | {op:'and'|'or'|'implies'|'iff', left:Formula, right:Formula}} Formula */
  /** @param {string} source @returns {Formula} */
  function parse(source) {
    if (source.length > 160) throw Error('Legfeljebb 160 karaktert adj meg.');
    const text = source.replace(/<->|↔|≡/g,'=').replace(/->|→/g,'>').replace(/¬|~/g,'!').replace(/∧/g,'&').replace(/∨/g,'|');
    const tokens = text.match(/[a-zA-Z]+|[!&|>=()]|[^\s]/g) || [];
    if (tokens.length > 80) throw Error('Legfeljebb 80 jelből álló képletet adj meg.');
    let index = 0;
    /** @returns {Formula} */
    function primary() {
      const token = tokens[index++];
      if (token === '!') return {op:'not', child:primary()};
      if (token === '(') {
        const result = expression(0);
        if (tokens[index++] !== ')') throw Error('Hiányzik egy záró zárójel.');
        return result;
      }
      if (token && /^[a-zTF]$/.test(token)) return {op:'atom', name:token};
      throw Error('Változó (a–z), T, F vagy nyitó zárójel kell.');
    }
    const operators = ['=', '>', '|', '&'];
    const names = /** @type {const} */ (['iff','implies','or','and']);
    /** @param {number} level @returns {Formula} */
    function expression(level) {
      if (level === operators.length) return primary();
      let left = expression(level+1);
      while (tokens[index] === operators[level]) {
        index++;
        const right = expression(level === 1 ? level : level+1);
        left = {op:names[level],left,right};
      }
      return left;
    }
    const result = expression(0);
    if (index !== tokens.length) throw Error('Felesleges jel vagy hiányzó művelet a képletben.');
    return result;
  }
  /** @param {Formula} formula @returns {string[]} */
  function variables(formula) {
    if (formula.op === 'atom') return ['T','F'].includes(formula.name) ? [] : [formula.name];
    if (formula.op === 'not') return variables(formula.child);
    return [...new Set([...variables(formula.left),...variables(formula.right)])].sort();
  }
  /** @param {Formula} formula @param {Record<string,boolean>} values @returns {boolean} */
  function evaluate(formula, values) {
    if (formula.op === 'atom') return formula.name === 'T' || (formula.name !== 'F' && values[formula.name]);
    if (formula.op === 'not') return !evaluate(formula.child, values);
    const a = evaluate(formula.left,values), b = evaluate(formula.right,values);
    switch (formula.op) {
      case 'and': return a && b;
      case 'or': return a || b;
      case 'implies': return !a || b;
      case 'iff': return a === b;
    }
  }
  /** @param {string} source */
  function truthTable(source) {
    const formula = parse(source), names = variables(formula);
    if (names.length > 4) throw Error('Legfeljebb négy különböző változót használj.');
    const rows = Array.from({length:2**names.length}, (_,i) => {
      const values = Object.fromEntries(names.map((name,j) => [name,!(i & (1 << (names.length-j-1)))]));
      return {values, result:evaluate(formula,values)};
    });
    return {variables:names, rows, kind:rows.every(r => r.result) ? 'tautológia' : rows.some(r => r.result) ? 'esetleges' : 'ellentmondás'};
  }
  /** @param {string} source */
  function normalForm(source) {
    const formula = parse(source);
    // Bound traversal and displayed output too: equivalences share duplicated subtrees.
    let work = 0;
    function tick() {if (++work > 4096) throw Error('Ez a normálforma túl nagy. Válassz rövidebb képletet.');}
    /** @param {Formula} node @returns {string} */
    function format(node) {
      tick();
      if (node.op === 'atom') return node.name;
      if (node.op === 'not') return `¬${format(node.child)}`;
      const symbols = {and:'∧',or:'∨',implies:'→',iff:'↔'};
      return `(${format(node.left)} ${symbols[node.op]} ${format(node.right)})`;
    }
    /** @param {Formula} n @param {number} stage @param {boolean} negated @returns {Formula} */
    function transform(n, stage, negated = false) {
      tick();
      if (stage === 3) {
        if (n.op === 'not') return transform(n.child,stage,!negated);
        if (n.op === 'atom') return negated ? {op:'not',child:n} : n;
        if (n.op !== 'and' && n.op !== 'or') throw Error('Előbb töröld a nyilakat.');
        return {op:negated ? (n.op === 'and' ? 'or' : 'and') : n.op,left:transform(n.left,stage,negated),right:transform(n.right,stage,negated)};
      }
      if (n.op === 'atom') return n;
      if (n.op === 'not') return {op:'not',child:transform(n.child,stage)};
      const left = transform(n.left,stage), right = transform(n.right,stage);
      if (stage === 1 && n.op === 'iff') return {op:'and',left:{op:'implies',left,right},right:{op:'implies',left:right,right:left}};
      if (stage === 2 && n.op === 'implies') return {op:'or',left:{op:'not',child:left},right};
      if (stage === 4 && n.op === 'or') return distribute(left,right);
      return {op:n.op,left,right};
    }
    /** @param {Formula} left @param {Formula} right @returns {Formula} */
    function distribute(left,right) {
      tick();
      if (left.op === 'and') return {op:'and',left:distribute(left.left,right),right:distribute(left.right,right)};
      if (right.op === 'and') return {op:'and',left:distribute(left,right.left),right:distribute(left,right.right)};
      return {op:'or',left,right};
    }
    /** @param {Formula} n @param {'and'|'or'} op @returns {Formula[]} */
    function flatten(n,op) {return n.op === op ? [...flatten(n.left,op),...flatten(n.right,op)] : [n];}
    const steps = []; let current = formula;
    for (let stage = 1; stage <= 4; stage++) {
      work = 0; current = transform(current,stage); steps.push(format(current));
    }
    const clauses = flatten(current,'and').map(n => [...new Set(flatten(n,'or').map(format))])
      .filter(clause => !clause.some(l => l === 'T' || l === '¬F' || clause.includes(l.startsWith('¬') ? l.slice(1) : `¬${l}`)))
      .map(clause => clause.filter(l => l !== 'F' && l !== '¬T'));
    return {steps,clauses:clauses.some(clause => !clause.length) ? [[]] : clauses};
  }
  /** @param {string[]} left @param {string[]} right @param {string} pivot */
  function resolve(left,right,pivot) {
    if (!/^[a-z]$/.test(pivot) || [...left,...right].some(literal => !/^¬?[a-z]$/.test(literal))) throw Error('A klóz csak változót vagy negált változót tartalmazhat.');
    let a = pivot, b = `¬${pivot}`;
    if (!(left.includes(a) && right.includes(b))) [a,b] = [b,a];
    if (!(left.includes(a) && right.includes(b))) throw Error('A választott változóhoz nincs ellentett literálpár.');
    return [...new Set([...left.filter(l => l !== a),...right.filter(l => l !== b)])];
  }
  return {truthTable, normalForm, resolve};
})();
if (typeof module !== 'undefined') module.exports = CourseLogic;
