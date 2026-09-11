import math
import random

INPUTS = [[0, 0], [0, 1], [1, 0], [1, 1]]
OUTPUTS = [0, 1, 1, 0]
# 2 bemeneti neuron, 1 rejtett rétegben 3 neuron, 1 kimeneti neuron (4-es azonosíto), teljesen kapcsolt neurális hálo
VARIANCE_W = 0.8

w11 = random.uniform(-VARIANCE_W, VARIANCE_W)
w21 = random.uniform(-VARIANCE_W, VARIANCE_W)
b1 = 0

w12 = random.uniform(-VARIANCE_W, VARIANCE_W)
w22 = random.uniform(-VARIANCE_W, VARIANCE_W)
b2 = 0

w13 = random.uniform(-VARIANCE_W, VARIANCE_W)
w23 = random.uniform(-VARIANCE_W, VARIANCE_W)
b3 = 0

w14 = random.uniform(-VARIANCE_W, VARIANCE_W)
w24 = random.uniform(-VARIANCE_W, VARIANCE_W)
w34 = random.uniform(-VARIANCE_W, VARIANCE_W)
b4 = 0


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def linear(x, alpha=1):
    return alpha * x


def threshold(x, threshold=0):
    if x < threshold:
        return 0
    else:
        return 1


def relu(x):
    if x < 0:
        return 0
    else:
        return x


def predict(x1, x2, activation):
    a1 = b1 + x1 * w11 + x2 * w21
    o1 = activation(a1)

    a2 = b2 + x1 * w12 + x2 * w22
    o2 = activation(a2)

    a3 = b3 + x1 * w13 + x2 * w23
    o3 = activation(a3)

    a4 = b4 + o1 * w14 + o2 * w24 + o3 * w34
    o4 = activation(a4)

    return o4


def learn_delta(x1, x2, activation, target, alpha=0.2):
    global w11, w21, b1, w12, w22, b2, w13, w23, b3
    global w14, w24, w34, b4

    a1 = b1 + x1 * w11 + x2 * w21
    o1 = activation(a1)

    a2 = b2 + x1 * w12 + x2 * w22
    o2 = activation(a2)

    a3 = b3 + x1 * w13 + x2 * w23
    o3 = activation(a3)

    a4 = b4 + o1 * w14 + o2 * w24 + o3 * w34
    o4 = activation(a4)

    error = target - o4

    w11 += error * x1 * alpha
    w21 += error * x2 * alpha
    b1 += error * 1 * alpha

    w12 += error * x1 * alpha
    w22 += error * x2 * alpha
    b2 += error * 1 * alpha

    w13 += error * x1 * alpha
    w23 += error * x2 * alpha
    b3 += error * 1 * alpha

    w14 += error * o1 * alpha
    w24 += error* o2 * alpha
    w34 += error * o3 * alpha
    b4 += error * 1 * alpha

def test(activation):
    for i in range(len(INPUTS)):
        result = predict(INPUTS[i][0], INPUTS[i][1], activation)
        print("For inputs", INPUTS[i], "expected", OUTPUTS[i], "predicted", result,
              "which is", "correct" if round(result) == OUTPUTS[i] else "incorrect")


def print_weights():
    print("W11", w11, "W12", w12, "W13", w13, "\nW21", w21, "W22", w22, "W23", w23, "\nW14", w14, "W24", w24, "W34",
          w34)


print_weights()
print("Sigmoid aktivácios függvénnyel")
test(sigmoid)
print("\nLineáris aktivácios függvénnyel:")
test(linear)

print("\nKüszöb aktivácios függvénnyel:")
test(threshold)

print("\nRelu aktivácios függvénnyel:")
test(threshold)

def train(activation):
    for epoch in range(1,10001):
        indexes = [0,1,2,3]
        random.shuffle(indexes)
        for j in indexes:
            learn_delta(INPUTS[j][0], INPUTS[j][1],activation, OUTPUTS[j])
        if epoch % 100 == 0:
            for j in range(4):
                result = predict(INPUTS[j][0], INPUTS[j][1], activation)
                print("In epoch ",epoch,"For inputs", INPUTS[j], "expected", OUTPUTS[j], "predicted", result,
                      "which is", "correct" if round(result) == OUTPUTS[j] else "incorrect")


train(sigmoid)
print_weights()
print("Sigmoid aktivácios függvénnyel delta után")
test(sigmoid)