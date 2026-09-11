#pip install scikit-fuzzy
import matplotlib as matplotlib
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import numpy as np
import scipy
import packaging
import networkx
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt

temperature = ctrl.Antecedent(np.arange(0,41,1), 'temperature')
target = ctrl.Antecedent(np.arange(0,41,1),"target")
#action = ctrl.Consequent(np.arange(0,4,1), "action", defuzzify_method="mom")
action = ctrl.Consequent(np.arange(0,4,1), "action") # centroid on default

#temperature.automf(4, names=["kicsi","közepes","nagy","extra nagy"])
# temperature["kicsi"] = fuzz.trimf(temperature.universe, [0,0,40])
# temperature["közepes"] = fuzz.gaussmf(temperature.universe, 14, 2)
# temperature["nagy"] = fuzz.piecemf(temperature.universe, [1,3,26])
# temperature["extra nagy"] = fuzz.trapmf(temperature.universe, [4,8,16,18])

tempnames = ["very cold", "cold", "warm", "hot", "very hot"]

temperature.automf(5, names= tempnames)
target.automf(5, names=tempnames)

temperature.view()
target.view()


action.automf(3, names=["Cool", "No change","Heat"])
action.view()

rule1 = ctrl.Rule((temperature["cold"] | temperature["very cold"]) & target["warm"], action["Heat"])

rule2 = ctrl.Rule((temperature["hot"] | temperature["very hot"]) & target["warm"], action["Cool"])

rule3 = ctrl.Rule(temperature["warm"] & target["warm"], action["No change"])

temperature_control = ctrl.ControlSystem([rule1, rule2, rule3])

temp = ctrl.ControlSystemSimulation(temperature_control)

temp.input["temperature"] = 16
temp.input["target"] = 22

temp.compute()
print(temp.output["action"])
print(action.defuzzify_method)

temperature.view(sim=temp)
target.view(sim=temp)

action.view(sim=temp)

plt.show()