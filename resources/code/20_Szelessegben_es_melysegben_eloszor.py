GRAPH = {
    "S" : ["A","B"],
    "A": ["S","D"],
    "B": ["C","S"],
    "C": ["B","D","E","F"],
    "D": ["A","C","G"],
    "E": ["C","G"],
    "F": ["C","G"]
}


def bfs(graph, start, goal):
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
    return None

def dfs(graph, start, goal):
    queue = []
    queue.append([start])
    while queue:
        path = queue.pop(0)
        end_node = path[-1]

        if end_node == goal:
            return path
        new_paths = []
        for adjacent in graph.get(end_node, []):
            if adjacent not in path:
                new_path = list(path) + [adjacent]
                new_paths.append(new_path)
        queue[0:0] = new_paths
    return None

print(bfs(GRAPH, "S", "G"))
print(dfs(GRAPH, "S", "G"))