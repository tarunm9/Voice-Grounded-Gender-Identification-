from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import time
import pygal

graph = pygal.Line()
graph.title = 'Train and Test result of our Models from the given Dataset.'

def knn(X_train,X_test,y_train,y_test,iterations):
    train_accuracy = np.empty(len(iterations)) 
    test_accuracy = np.empty(len(iterations))
    print("Calculating KNN Accuracy score")

    knn = KNeighborsClassifier(n_neighbors=4)
    knn.fit(X_train, y_train)

    for i, k in enumerate(iterations):  
        # Compute traning and test data accuracy 
        train_accuracy[i] = round((accuracy_score(y_train,knn.predict(X_train))*100), 4)        
        test_accuracy[i] =round((accuracy_score(y_test,knn.predict(X_test))*100),4)
    
    print("Calculated KNN score")
    plt.figure()
    plt.xlabel('ierations')
    plt.ylabel('Accuracy')
    plt.title("KNN")
    plt.plot(iterations, test_accuracy, label = 'Testing dataset Accuracy')
    plt.plot(iterations, train_accuracy, label = 'Training dataset Accuracy')
    plt.legend()

    graph.add('Model_1_train_accuracy',train_accuracy.tolist())
    graph.add('Model_1_test_accuracy',test_accuracy.tolist())

    url = 'static/images/new_plot_knn_'+str(time.time())+'.png'
    plt.savefig(url)
    print("Returning knn-img")
    print("URL:"+url)

def randomforest(X_train,X_test,y_train,y_test,iterations):
    train_accuracy = np.empty(len(iterations)) 
    test_accuracy = np.empty(len(iterations))

    print("Calculating RFC Accuracy score")
    rfc = RandomForestClassifier(n_estimators=90)
    rfc.fit(X_train,y_train)
    for i, k in enumerate(iterations):
        # Compute traning and test data accuracy 
        train_accuracy[i] = round((accuracy_score(y_train, rfc.predict(X_train))*100), 4)        
        test_accuracy[i] =round((accuracy_score(y_test, rfc.predict(X_test))*100), 4)

    print("Calculated RFC score")
    plt.figure()
    plt.xlabel('iterations')
    plt.ylabel('Accuracy')
    plt.title("RFC")
    plt.plot(iterations, test_accuracy, label = 'Testing dataset Accuracy')
    plt.plot(iterations, train_accuracy, label = 'Training dataset Accuracy')
    plt.legend()

    graph.add('Model_3_train_accuracy',train_accuracy.tolist())
    graph.add('Model_3_test_accuracy',test_accuracy.tolist())

    url = 'static/images/new_plot_rfc_'+str(time.time())+'.png'
    print("Returning rfc-img")
    plt.savefig(url)
    print("URL:"+url)

def naiveBayes(X_train,X_test,y_train,y_test,iterations):
    train_accuracy = np.empty(len(iterations)) 
    test_accuracy = np.empty(len(iterations))

    print("Calculating NB Accuracy score")
    nb = GaussianNB().fit(X_train,y_train)
    for i, k in enumerate(iterations):        
        # Compute traning and test data accuracy 
        train_accuracy[i] = round((accuracy_score(y_train,nb.predict(X_train))*100), 4)        
        test_accuracy[i] =round((accuracy_score(y_test,nb.predict(X_test))*100),4)

    print("Calculated NB score")
    plt.figure()
    plt.xlabel('iterations')
    plt.ylabel('Accuracy')
    plt.title("NB")
    plt.plot(iterations, test_accuracy, label = 'Testing dataset Accuracy')
    plt.plot(iterations, train_accuracy, label = 'Training dataset Accuracy')
    plt.legend()
    
    graph.add('Model_2_train_accuracy',train_accuracy.tolist())
    graph.add('Model_2_test_accuracy',test_accuracy.tolist())

    url = 'static/images/new_plot_nb_'+str(time.time())+'.png'
    print("Returning nb-img")
    plt.savefig(url)
    print("URL:"+url)

def svm(X_train,X_test,y_train,y_test, iterations):
    train_accuracy = np.empty(len(iterations)) 
    test_accuracy = np.empty(len(iterations))

    print("Calculating SVM Accuracy score")
    svm = LinearSVC()
    svm.fit(X_train, y_train)
    
    for i, k in enumerate(iterations):
        # Compute traning and test data accuracy 
        train_accuracy[i] = round((accuracy_score(y_train,svm.predict(X_train))*100), 4)        
        test_accuracy[i] = round((accuracy_score(y_test,svm.predict(X_test))*100), 4)

    print("Calculated SVM score")
    plt.figure()
    plt.xlabel('iterations')
    plt.ylabel('Accuracy')
    plt.title("SVM")
    plt.plot(iterations, test_accuracy, label = 'Testing dataset Accuracy')
    plt.plot(iterations, train_accuracy, label = 'Training dataset Accuracy')
    plt.legend()

    graph.add('Model_4_train_accuracy',train_accuracy.tolist())
    graph.add('Model_4_test_accuracy',test_accuracy.tolist())

    url = 'static/images/new_plot_svm_'+str(time.time())+'.png'
    print("Returning svm-img")
    plt.savefig(url)
    print("URL:"+url)

def Calculate(csvfile):
    file = pd.read_csv(csvfile)

    male_freq = file[((file['meanfun'] < 0.085) | (file['meanfun'] > 0.180)) & (file['label'] == "male")].index
    female_freq = file[((file['meanfun'] < 0.165) | (file['meanfun'] > 0.255)) & (file['label'] == "female")].index

    rmv_index = list(male_freq)+list(female_freq)
    len(rmv_index)
    
    new_x = file[file.columns[0:20]].copy()

    column = ['kurt', 'centroid', 'dfrange']

    lst = new_x.drop(column, axis=1).copy()
    lst.head(3)
    
    lst = lst.drop(rmv_index,axis=0)
    new_y = pd.Series(file[file.columns[-1]].values).drop(rmv_index,axis=0)

    test_size = 0.10                                                                                                    #Test_Size
    train_size = 1.0 - test_size
    X_train, X_test, y_train, y_test = train_test_split(lst, new_y, train_size = train_size, test_size = test_size)
    iterations = np.arange(1,10)
    graph.x_labels = iterations.tolist()

    print("Calling KNN")
    knn(X_train, X_test, y_train, y_test, iterations)

    print("Calling NB")
    naiveBayes(X_train, X_test, y_train, y_test, iterations)

    print("Calling RFC")
    randomforest(X_train, X_test, y_train, y_test, iterations)

    print("Calling SVM")
    svm(X_train ,X_test, y_train, y_test, iterations)

    names = ['K-NearestNeighbor','NaiveBayes','RandomForest','SupportVectorMachine']
    packages = ['sklearn.neighbors','sklearn.naive_bayes','sklearn.ensemble','sklearn.svm']
    models = ['KNeighborsClassifier','GaussianNB','RandomForestClassifier','LinearSVC']
    graph_data = graph.render_data_uri()

    return names, packages, models, train_size, test_size, graph_data