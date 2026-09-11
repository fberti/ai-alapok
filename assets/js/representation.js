const CourseRepresentation = (() => {
  /** @typedef {{from:string, relation:string, to:string}} Edge */
  /** @typedef {{nodes:Record<string,string>, edges:Edge[], traits:Record<string,string[]>}} Network */
  /** @returns {Network} */
  function network() {
    return {nodes: Object.fromEntries(['Állat','Madár','Hal','Veréb','Gólya','Cápa','Angolna'].map(name => [name,'class'])),
      edges: [['Madár','Állat'],['Hal','Állat'],['Veréb','Madár'],['Gólya','Madár'],['Cápa','Hal'],['Angolna','Hal']].map(([from,to]) => ({from,relation:'is_a',to})),
      traits: {'Állat':['mozog','táplálkozik','lélegzik'], 'Madár':['szárnya van','általában tud repülni','csőre van'], 'Hal':['uszonya van','tud úszni','vízben él'], 'Veréb':['szürke','ugrál'], 'Gólya':['hosszúlábú','kéményen fészkel','fehér'], 'Cápa':['erős fogú','veszélyes'], 'Angolna':['kígyószerű','fürge']}};
  }
  /** @param {Network} graph @param {string} from @param {string} goal @returns {string[] | null} */
  function path(graph, from, goal) {
    const queue = [[from]], seen = new Set([from]);
    for (let i = 0; i < queue.length; i++) {
      const route = queue[i], end = route[route.length-1];
      if (end === goal && Object.hasOwn(graph.nodes, end)) return route;
      for (const edge of graph.edges.filter(e => e.from === end && e.relation !== 'featured_by')) {
        if (!seen.has(edge.to)) {seen.add(edge.to); queue.push([...route,edge.to]);}
      }
    }
    return null;
  }
  /** @param {Network} graph @param {string} from @param {string} relation @param {string} to */
  function addEdge(graph, from, relation, to) {
    from = from.trim(); to = to.trim();
    if (!from || !to || from.length > 40 || to.length > 40) throw Error('Adj meg 1–40 betűs nevet.');
    if (!['is_a','instance_of','featured_by'].includes(relation)) throw Error('Ismeretlen kapcsolat.');
    if (graph.edges.some(e => e.from === from && e.to === to && e.relation === relation)) throw Error('Ez az él már létezik.');
    if (relation !== 'featured_by') {
      if (!Object.hasOwn(graph.nodes,to) || graph.nodes[to] !== 'class') throw Error('A cél legyen osztály.');
      const kind = relation === 'is_a' ? 'class' : 'instance';
      if (Object.hasOwn(graph.nodes,from) && graph.nodes[from] !== kind) throw Error('A típus és a példány nem cserélhető fel.');
      if (from === to || path(graph,to,from)) throw Error('Ez kör lenne a hierarchiában.');
      Object.defineProperty(graph.nodes, from, {value:kind, enumerable:true, writable:true, configurable:true});
    } else if (!Object.hasOwn(graph.nodes,from)) throw Error('A tulajdonság forrása legyen meglévő csomópont.');
    graph.edges.push({from,relation,to});
  }
  /** @param {Network} graph @param {number} index */
  function removeEdge(graph, index) {if (Number.isInteger(index) && index >= 0 && index < graph.edges.length) graph.edges.splice(index,1);}
  /** @param {Network} graph @param {string} name */
  function properties(graph, name) {
    const ancestors = Object.keys(graph.nodes).filter(node => path(graph,name,node));
    return [...new Set(ancestors.flatMap(node => [
      ...(Object.hasOwn(graph.traits,node) ? graph.traits[node] : []),
      ...graph.edges.filter(e => e.from === node && e.relation === 'featured_by').map(e => e.to)
    ]))];
  }
  /** @param {boolean} exception */
  function flight(exception) {return exception ? 'nem' : 'igen';}
  /** @param {string} policy */
  function insurance(policy) {
    if (policy === 'default' || policy === 'stunt') return 'nem';
    if (policy === 'car') return 'igen';
    return 'ellentmondás';
  }
  /** @param {string} kind @param {string} override */
  function frame(kind, override) {
    const table = kind === 'Asztal', stool = kind === 'Bárszék';
    if (!['Asztal','Szék','Bárszék'].includes(kind)) throw Error('Ismeretlen keret.');
    const own = override.trim() !== '', height = own ? Number(override) : table ? 1 : stool ? 1.2 : null;
    const min = table ? 0.4 : 0.2, max = table ? 1.4 : 4;
    if (height !== null && (!Number.isFinite(height) || height <= min || height >= max)) throw Error(`A magasság legyen ${min} m felett és ${max} m alatt.`);
    return {height, material:stool ? 'alumínium' : 'fa', legs:stool ? 3 : 4, color:table ? 'nincs megadva' : 'barna', purpose:table ? 'étkezés' : 'ülőhely', source:own ? 'saját érték' : table ? 'Asztal alapértéke' : stool ? 'Bárszék' : 'nincs megadva'};
  }
  const cases = [
    {name:'Olvasósarok', successful:true, values:[45,2], solution:'Támlás szék, két ülőhellyel.', quality:'Bevált; kényelmes olvasáshoz.'},
    {name:'Bárpult', successful:true, values:[110,6], solution:'Magas bárszékek, hat ülőhellyel.', quality:'Bevált; a lábtámaszt külön ellenőriztük.'},
    {name:'Közös asztal', successful:false, values:[75,8], solution:'Nyolc szék az asztal körül.', quality:'Nem vált be: kevés hely maradt az átjáráshoz.'}
  ];
  /** @param {number[]} query @param {number[]} example @param {number[]} weights */
  function similarity(query, example, weights) {
    if ([query,example,weights].some(a => a.length !== 2 || a.some(n => !Number.isFinite(n))) || weights.some(w => w < 0)) throw Error('Két véges érték és nem negatív súly kell.');
    const total = weights[0] + weights[1];
    if (!total) return null;
    return weights.reduce((score,w,i) => score + w * Math.max(0,1-Math.abs(query[i]-example[i])/[100,10][i]),0)/total;
  }
  /** @param {number[]} query @param {number[]} weights */
  function rankCases(query, weights) {
    return cases.map(item => ({...item, score:similarity(query,item.values,weights)})).sort((a,b) => (b.score ?? -1)-(a.score ?? -1));
  }
  return {network, path, addEdge, removeEdge, properties, flight, insurance, frame, similarity, rankCases};
})();
if (typeof module !== 'undefined') module.exports = CourseRepresentation;
