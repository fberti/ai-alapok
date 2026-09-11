from pyDatalog import pyDatalog

def igaz_e(kifejezes):
    return len(kifejezes) > 0

pyDatalog.clear()

pyDatalog.create_terms('Apa, Anya, Szulo, Nagyszulo, X,Y,Z')

#Tények
+Apa("Szokratesz","Platon")
+Apa("Platon", "Arisztotelesz")
+Anya("Diado","Platon")

#Szabályok
Szulo(X,Y) <= Apa(X,Y)
Szulo(X,Y) <= Anya(X,Y)


Nagyszulo(X,Z) <= Szulo(X,Y) & Szulo(Y,Z)

print("Ki Platon szuloje")
print(Szulo(X,"Platon"))

print("\n")
print("Ki Arisztotelesz nagyszülője")
print(Nagyszulo(X,"Arisztotelesz"))


print("\n")
print("Szokratesz Arisztotelesz nagyszülője?")
print(igaz_e(Nagyszulo("Szokratesz","Arisztotelesz")))