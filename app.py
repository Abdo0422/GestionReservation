from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Path to the JSON file where reservations will be stored
RESERVATIONS_FILE = 'reservations.json'
USERS_FILE = 'users.json'

# Function to load reservations from the JSON file
def load_reservations():
    if os.path.exists(RESERVATIONS_FILE):
        with open(RESERVATIONS_FILE, 'r') as f:
            return json.load(f)
    return []

# Function to save reservations to the JSON file
def save_reservations(reservations):
    with open(RESERVATIONS_FILE, 'w') as f:
        json.dump(reservations, f, indent=4)

# Function to load users from the users.json file
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return []

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    users = load_users()
    
    for user in users:
        if user['username'] == username and user['password'] == password:
            return jsonify({"message": "Login successful", "username": username, "role": user['role']}), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    reservations = load_reservations()
    return jsonify(reservations)

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json()
    reservation = {
        'space': data['space'],
        'resource': data['resource'],
        'date': data['date'],
        'time': data['time']
    }
    
    reservations = load_reservations()
    reservations.append(reservation)
    save_reservations(reservations)
    
    return jsonify(reservation), 201

if __name__ == "__main__":
    app.run(debug=False)
