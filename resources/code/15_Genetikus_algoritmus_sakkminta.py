import random

import numpy as np

reference = [1, 0, 0, 0, 1, 0, 0, 0, 1]

population_size = 20
chromosome_size = len(reference)
generation = 200
mutation_rate = 0.005 #See with 0.05
crossover_rate = 0.9


def init_population(population_size, chromosome_size):
    population = np.zeros((population_size, chromosome_size))
    for i in range(population_size):
        ones = random.randint(0, chromosome_size)
        population[i, 0:ones] = 1
        random.shuffle(population[i])
    return population


def calculate_fitness_to_goal(population, reference):
    identicals = population == reference
    fitness_scores = identicals.sum(axis=1)
    return fitness_scores

def calculate_fitness_to_goal_candidate(candidate, reference):
    identicals = candidate == reference
    fitness_score = identicals.sum()
    return fitness_score

def tournament(population, scores):
    fighter1 = random.randint(0, len(population) - 1)
    fighter2 = random.randint(0, len(scores) - 1)
    fighter1_score = scores[fighter1]
    fighter2_score = scores[fighter2]
    if fighter1_score >= fighter2_score:
        winner = fighter1
    else:
        winner = fighter2
    return population[winner]


def crossover(parent1, parent2, crossover_rate=0.9):
    #Egypontos keresztés
    crossover_chance = random.random()
    if crossover_chance <= crossover_rate:
        crossover_point = random.randint(1, len(parent1)-1)
        child1 = np.hstack((parent1[0:crossover_point], parent2[crossover_point:])) #Mivel tuple kell neki, ezért kell plusz zárojel
        child2 = np.hstack((parent2[0:crossover_point], parent1[crossover_point:]))
        return child1, child2
    return None, None


def mutation(child, mutation_rate):
    mutation_chance = random.random()
    if mutation_chance <= mutation_rate:
        mutate = random.randint(0, len(child)-1)
        child[mutate] = np.logical_not(child[mutate])


def select_k_best(new_population, population_size,k, new_scores):
    population = []
    while len(population) < population_size:
        selected_ids = random.sample(range(population_size), k)
        selected_ids.sort(key = lambda i: new_scores[i], reverse=True)
        population.append(new_population[selected_ids[0]])
    return population



population = init_population(population_size, chromosome_size)
scores = calculate_fitness_to_goal(population, reference)




def survival():
    population = init_population(population_size, chromosome_size)
    scores = calculate_fitness_to_goal(population, reference)


    for gen in range(generation):
        new_population = []
        for i in range(int(population_size)):
            succesful_crossover = False
            while not succesful_crossover:
                parent1 = tournament(population, scores)
                parent2 = tournament(population, scores)
                child1, child2 = crossover(parent1, parent2, crossover_rate)
                if child1 is not None and child2 is not None:
                    succesful_crossover = True
            mutation(child1, mutation_rate)
            mutation(child2, mutation_rate)
            new_population.append(child1)
            new_population.append(child2)

        new_scores = calculate_fitness_to_goal(np.array(new_population), reference)
        population = np.array(select_k_best(new_population, population_size, 5, new_scores))
        scores = calculate_fitness_to_goal(population, reference)


    [print("Egyed", candidate, "Fitness értéke: ", calculate_fitness_to_goal_candidate(candidate, reference)) for candidate in population]


def half():
    population = init_population(population_size, chromosome_size)
    scores = calculate_fitness_to_goal(population, reference)
    for gen in range(generation):
        new_population = []
        for i in range(int(population_size / 2)):
            succesful_crossover = False
            while not succesful_crossover:
                parent1 = tournament(population, scores)
                parent2 = tournament(population, scores)
                child1, child2 = crossover(parent1, parent2, crossover_rate)
                if child1 is not None and child2 is not None:
                    succesful_crossover = True
            mutation(child1, mutation_rate)
            mutation(child2, mutation_rate)
            new_population.append(child1)
            new_population.append(child2)

            population = np.array(new_population)
            scores = calculate_fitness_to_goal(population, reference)


    [print("Egyed", candidate, "Fitness értéke: ", calculate_fitness_to_goal_candidate(candidate, reference)) for candidate in population]

survival()