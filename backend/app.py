

from flask import Flask, jsonify, request,Blueprint
from car.car import Director, ConcreteCarBuilder
from simulation.master_simulator import StateDefinition, TrackState, Weather, Setup
import json
from flask_cors import CORS

class InMemoryCache:
    memory = {}  #acts as a cache store
    indexer = 0 #tracks how many items are stored
    def __init__(self):
        pass

    def store(self, key, value):  #saves values under the key ,if under a key value exiists then it overwrites
        self.memory[key] = value 
        self.indexer += 1  #increment the store counter
    def get (self, key):  #retrieves a value by key
        return self.memory[key]   
    
    def get_cache (self): #returns the entire cache dictionary
        return self.memory
    
cache = InMemoryCache()  #creates a single shared cache instance


app = Flask('Simulator')
CORS(app)

@app.route("/simulate",methods=['POST'])
def emit ():
    data = request.json
    print(data)
    ts= StateDefinition(data['track_state'],"")
    w = StateDefinition(data['weather'], "")
    s = StateDefinition(data['setup'], "")
    director = Director()
    builder = ConcreteCarBuilder()
    director.builder = builder
    director.build_formula_one()
    product = builder.get_product()
    data_values = product.simulate(ts, w, s)
    cache.store(cache.indexer, data_values) #takes the index as keys and simulation results as the value

    return jsonify(product.simulate(ts, w, s)), 200

@app.route("/get", methods=["GET"])
def get_simulated_data ():
    return jsonify (cache.get_cache()), 200 #returns the whole memory dictionary which has all the simulation results basically storing and returning


app.run(debug=True, host="0.0.0.0", port=5000)
