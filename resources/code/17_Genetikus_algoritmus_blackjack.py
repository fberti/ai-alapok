#Blackjack
import random


def calculate_fitness(candidate):
    total_value = 0
    for i in range(len(candidate)):
        if candidate[i] == 1:
            total_value+= lapok[i][1]
    if total_value > 21:
        return 0
    else:
        return total_value

lapok = [
    ["Ász kicsi", 1],
    ["Kettes",2],
    ["Hármas",3],
    ["Négyes",4],
    ["Ötös",5],
    ["Hatos",6],
    ["Hetes", 7],
    ["Nyolcas", 8],
    ["Kilences",9],
    ["Tizes",10],
    ["Bubi",10],
    ["Dáma",10],
    ["Király",10],
    ["Ász Nagy",11]
]

def init_population(population_size, chromosome_size):
    population = []
    genes=[0,1]
    for _ in range(population_size):
        candidate=[]
        for _ in range(chromosome_size):
            candidate.append(random.choice(genes))
        population.append(candidate)
    return population

def exponential_probs(n, q=0.9):
    weights = [(1-q)*q**(n-i) for i in range(1, n+1)]
    total = sum(weights)
    return [w/total for w in weights]

def select_based_on_rank(population, scores):
    ranks = sorted(range(len(population)), key= lambda i: scores[i])
    probs = exponential_probs(len(population))
    selected_index = random.choices(ranks, weights=probs, k=1)[0]
    return population[selected_index]



def calculate_fitness_on_population(population):
    scores = list(map(lambda x: calculate_fitness(x), population))
    return scores

def crossover_uniform(parent1, parent2):
    child1, child2 = [], []
    for i in range(len(parent1)):
        if random.random() < 0.5:
            #csere
            child1.append(parent2[i])
            child2.append(parent1[i])
        else:
            child1.append(parent1[i])
            child2.append(parent2[i])
    return child1, child2

def mutate(candidate, mutation_rate):
    mutation_chance = random.random()
    if mutation_chance < mutation_rate:
        mutation_point = random.randint(0, len(candidate) - 1)
        if candidate[mutation_point] == 0:
            candidate[mutation_point] = 1
        else:
            candidate[mutation_point] = 0


def selection_diversity(population):
    diversity_scores = []
    for candidate in population:
        diversity_scores.append(selection_diversity_of_candidate(candidate,population))
    return diversity_scores

def selection_diversity_of_candidate(candidate, population): #Hamming távolságok
    total_diff = 0
    for other in population:
        if other == candidate:
            continue
        diff = sum(x != y for x, y in zip(candidate, other))
        total_diff += diff
    return total_diff

def selection_wheel_of_diversity(population, diversity_scores):
    selected = random.choices(population, weights=diversity_scores, k = population_size)
    return selected


print("Elérhető lapok: ", lapok)
[print("A(z)", lap[0], "nevű lap értéke:",lap[1]) for lap in lapok]


print(calculate_fitness([0,0,0,0,0,0,0,0,0,0,0,0,0,1]))

population_size=100
chromosome_size=len(lapok)
mutation_rate=0.4
generation = 10





population = init_population(population_size, chromosome_size)
scores = calculate_fitness_on_population(population)





for _ in range(generation):
    parent1 = select_based_on_rank(population, scores)
    parent2 = select_based_on_rank(population, scores)
    child1, child2 = crossover_uniform(parent1, parent2)
    mutate(child1, mutation_rate)
    mutate(child2, mutation_rate)
    population.append(child1)
    population.append(child2)

    diversity_scores = selection_diversity(population)
    population = selection_wheel_of_diversity(population, diversity_scores)



[print(candidate, calculate_fitness(candidate)) for candidate in population]

