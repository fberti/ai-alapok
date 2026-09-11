import keras
import tensorflow
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from keras.models import Sequential
from keras.layers import Dense

df = pd.read_csv("iris.data")
#sklearn.datasets.load_iris()


X = df.iloc[:, :-1].values
Y = df.iloc[:,-1].values

encoder = OneHotEncoder(sparse_output=False)
Y = encoder.fit_transform(Y.reshape(-1,1))

def build_model(activation):
    if(activation == "threshold"):

        model = Sequential()
        model.add(Dense(20, input_dim=4, activation=lambda x: keras.activations.threshold(x,0,0)))
        # model.add(Dense(20, activation="relu"))
        model.add(Dense(3, activation="sigmoid"))

        model.compile(loss=keras.losses.CategoricalCrossentropy(), optimizer=keras.optimizers.Adam(learning_rate=1e-3),
                      metrics=["accuracy"])

        model.fit(X, Y, epochs=200, verbose=0)
        _, accuracy = model.evaluate(X, Y)
        print("Activation: ", activation, "Accuracy: %.2f" % (accuracy * 100))
    else:

        model = Sequential()
        model.add(Dense(20, input_dim=4, activation=activation))
        #model.add(Dense(20, activation="relu"))
        model.add(Dense(3, activation="sigmoid"))

        model.compile(loss=keras.losses.CategoricalCrossentropy(), optimizer=keras.optimizers.Adam(learning_rate=1e-3), metrics=["accuracy"])

        model.fit(X,Y, epochs=200, verbose=0)
        _, accuracy = model.evaluate(X,Y)

        y_pred = model.predict(X)
        print("Activation: ", activation,"Accuracy: %.2f" % (accuracy*100))

print()

activations = ["threshold","relu","exponential","sigmoid","linear","tanh"]

for func in activations:
    build_model(func)

