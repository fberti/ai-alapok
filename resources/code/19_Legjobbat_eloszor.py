GRAPH = {
    "S" : ["A","B"],
    "A": ["S","D"],
    "B": ["C","S"],
    "C": ["B","D","E","F"],
    "D": ["A","C","G"],
    "E": ["C","G"],
    "F": ["C","G"]
}

HEURISTICS = {
    "S":30,
    "A":25,
    "B":20,
    "C":17,
    "D":25,
    "E":6,
    "F":5,
    "G":0
}


def bestfirst(graph, heuristics,  start, goal):
    queue = []
    queue.append([start])
    while queue:
        path = queue.pop(0)
        end_node = path[-1]

        if end_node == goal:
            return path
        for adjacent in graph.get(end_node, []):
            if adjacent not in path:
                new_path = list(path) + [adjacent]
                queue.append(new_path)
        queue = sorted(queue, key = lambda path : heuristics.get(path[-1]))
    return None

print(bestfirst(GRAPH, HEURISTICS, "S", "G"))