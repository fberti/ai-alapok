GRAPH = {
    "S" : [("A",2),("B",12)],
    "A": [("S",2),("D",6)],
    "B": [("C",1),("S",12)],
    "C": [("B",1),("D",2),("E",10),("F",8)],
    "D": [("A",6),("C",2),("G",32)],
    "E": [("C", 10),("G", 12)],
    "F": [("C",10),("G",15)]
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


def astar(graph, heuristics, start, goal):
    queue = []
    queue.append(([start],0, heuristics.get(start)))
    while queue:
        first_element = queue.pop(0)
        path = first_element[0]
        end_node = path[-1]
        current_cost = first_element[1]

        if end_node == goal:
            return path
        for adjacent in graph.get(end_node, []):
            if adjacent[0] not in path:
                new_path = list(path) + [adjacent[0]]
                new_cost = current_cost + adjacent[1]
                queue.append((new_path, new_cost, new_cost+heuristics.get(adjacent[0])))
        queue = sorted(queue, key=lambda element: element[-1])
    return None

print(astar(GRAPH, HEURISTICS, "S","G"))

