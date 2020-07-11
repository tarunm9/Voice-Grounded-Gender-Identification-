from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import warnings
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")
def knn(X_train,y_train,X_test):
    print("Entered KNN")
    knn = KNeighborsClassifier(n_neighbors=4)
    knn.fit(X_train, y_train)
    return list(knn.predict(X_test))

def randomforest(X_train,y_train,X_test):
    print("Entered randomforest")
    rfc = RandomForestClassifier(n_estimators=90)
    rfc.fit(X_train,y_train)
    return list(rfc.predict(X_test))

def naiveBayes(X_train,y_train,X_test):
    print("Entered naiveBayes")
    nb = GaussianNB().fit(X_train,y_train)
    return list(nb.predict(X_test))

def svm(X_train,y_train,X_test):
    print("Entered svm")
    svm = LinearSVC(max_iter=5000)
    svm.fit(X_train, y_train)
    return list(svm.predict(X_test))

def calculate_voice(train_file,test_file):
    print("\n Entered Train separate")
    file = pd.read_csv(train_file)

    '''male_freq = file[((file['meanfun'] < 0.085) | (file['meanfun'] > 0.180)) & (file['label'] == "male")].index
    female_freq = file[((file['meanfun'] < 0.165) | (file['meanfun'] > 0.255)) & (file['label'] == "female")].index

    rmv_index = list(male_freq)+list(female_freq)
    len(rmv_index)
    new_x = file[file.columns[0:20]].copy()'''
    
    new_x = file[file.columns[0:20]].copy() 
    new_y = file[file.columns[-1]].copy()

    '''column = ['kurt', 'centroid', 'dfrange']

    lst = new_x.drop(column, axis=1).copy()
    lst.head(3)
    print(lst)'''
    file2 = pd.read_csv(test_file)
    X_test = file2[file2.columns[1:21]].copy()
    lst = pd.DataFrame(data=pd.read_csv(test_file),columns=['meanfun','minfun','maxfun','sp.ent'],index=[0])
    lst = lst.to_dict()
    newDict = dict()
    print("\n Calculating Values")
    print("\n Executing knn")
    newDict['knn'] = knn(new_x,new_y,X_test)[0]
    print("\n Executing rfc")
    newDict['rfc'] = randomforest(new_x,new_y,X_test)[0]
    print("\n Executing nb")
    newDict['nb'] = naiveBayes(new_x,new_y,X_test)[0]
    print("\n Executing svm")
    newDict['svm'] = svm(new_x,new_y,X_test)[0]
    print("\n Calculated Values")
    newDict['mean_fun'] = round(lst['meanfun'][0]*1000,2)
    newDict['min_fun'] = round(lst['minfun'][0]*1000,2)
    newDict['max_fun'] = round(lst['maxfun'][0]*1000,2)
    newDict['sp_ent'] = round(lst['sp.ent'][0]*1000,2)
    return (newDict)