#Hátizsák probléma
#Vannak elemek súllyal és értékkel. Cél értéket maximalizálni súlykorláttal
import random



def calculate_fitness(candidate):
    total_weight = 0
    total_value = 0
    for i in range(len(candidate)):
        if candidate[i] == 1:
            total_weight += items[i][0]
            total_value += items[i][1]
    if total_weight > max_weight:
        return 0
    else:
        return total_value



def init_population(population_size, chromosome_size):
    population = []
    for _ in range(population_size):
        genes = [0,1]
        candidate = []
        for _ in range(chromosome_size):
            candidate.append(random.choice(genes))
        population.append(candidate)
    return population


def select_k_individual_wheel(population, k=1):
    scores = []
    for candidate in population:
        scores.append(calculate_fitness(candidate))
    selected = random.choices(population, weights=scores, k = k)
    return selected


def crossover(parent1, parent2): #Kétpontos keresztezés
    crossover_points = list((random.randint(1, len(parent1)-1),random.randint(1, len(parent1)-1) ))
    if (crossover_points[0] > crossover_points[1]):
        temp = crossover_points[0]
        crossover_points[0] = crossover_points[1]
        crossover_points[1] = temp
    child1 = parent1[0:crossover_points[0]]+ parent2[crossover_points[0]:crossover_points[1]]+ parent1[crossover_points[1]:]
    child2 = parent2[0:crossover_points[0]]+ parent1[crossover_points[0]:crossover_points[1]]+ parent2[crossover_points[1]:]
    return child1, child2


def mutate(candidate, mutation_rate):
    mutation_chance = random.random()
    if mutation_chance < mutation_rate:
        mutation_point = random.randint(0, len(candidate)-1)
        if candidate[mutation_point] == 0:
            candidate[mutation_point] = 1
        else:
            candidate[mutation_point] = 0


def get_best(population):
    scores = []
    for candidate in population:
        scores.append(calculate_fitness(candidate))
    max_value = max(scores)
    max_index = scores.index(max_value)
    return population[max_index], max_value, max_index


def selection_population_elite(population, k):
    new = []
    for i in range(k):
        cadidate, _, index = get_best(population)
        new.append(cadidate)
        del population[index]
    return new

def selection_population_relative_wheel(population, target_size):
    new = []
    fitness =[]
    for candidate in population:
        fitness.append(calculate_fitness(candidate))

    scores = [] #Relatív fitness
    sum_scores = sum(fitness)
    if(sum_scores == 0):
        return new
    for f in fitness:
        scores.append(f/sum_scores)

    new.extend(random.choices(population, weights=scores, k = target_size))
    return new



items = [
    [1,2],
    [2,3],
    [2,4],
    [4,5],
    [3,7],
    [6,9]
]  #Első a súly, a második az érték
print("Elérhető elemek:", items)

[print("Az", index, "indexű,", item[0], "súlyú elem értéke:", item[1]) for index, item in enumerate(items)]


max_weight = 10
population_size = 50
chromosome_size = len(items)
mutation_rate = 0.2 #Crossover rate nincs, mert 1
generation = 10

print(calculate_fitness([1,0,0,1,1,0]))
print(calculate_fitness([1,0,0,1,1,1]))



population = init_population(population_size, chromosome_size)

print(select_k_individual_wheel(population, 3))



for _ in range(generation):
    new_population=[]
    parents = select_k_individual_wheel(population, 2)
    parent1, parent2 = parents[0], parents[1]
    child1, child2 = crossover(parent1, parent2)
    mutate(child1, mutation_rate)
    mutate(child2, mutation_rate)
    population.append(child1)
    population.append(child2)

    new_population.extend(selection_population_elite(population, 3)) #Elitizmus 3 egyeddel
    new_population.extend(selection_population_relative_wheel(population, 5))
    population = new_population

[print(candidate, calculate_fitness(candidate)) for candidate in population]

print("A legjobb megoldás:")
print(get_best(population))