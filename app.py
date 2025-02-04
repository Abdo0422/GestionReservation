from flask import Flask, jsonify, request, session
from flask_cors import CORS
import json
import bcrypt
import os
from datetime import datetime, timedelta


app = Flask(__name__)
CORS(app)
app.secret_key = 'Tribunal-de-Commerce-de-Casablanca'

with open('data/users.json') as f:
    users = json.load(f)

with open('data/reservations.json') as f:
    reservations = json.load(f)


def save_users():
    """Save updated users list to the JSON file."""
    with open('data/users.json', 'w') as f:
        json.dump(users, f, indent=2)


def save_reservations():
    """Save updated reservations list to the JSON file."""
    with open('data/reservations.json', 'w') as f:
        json.dump(reservations, f, indent=2)


def get_user_by_credentials(username, password):
    """Authenticate user by username and password."""
    for user in users:
        if user["name"] == username and bcrypt.checkpw(password.encode(), user["password"].encode()):
            return user
    return None

def is_valid_time(time):
    try:
        reservation_time = datetime.strptime(time, '%H:%M')
        start_time = datetime.strptime('09:00', '%H:%M')
        end_time = datetime.strptime('16:00', '%H:%M')
        
        return start_time <= reservation_time <= end_time
    except ValueError:
        return False

def is_reservation_gap_valid(new_reservation):
    new_datetime = datetime.strptime(f"{new_reservation['date']} {new_reservation['time']}", '%Y-%m-%d %H:%M')
    
    for reservation in reservations:
        existing_datetime = datetime.strptime(f"{reservation['date']} {reservation['time']}", '%Y-%m-%d %H:%M')
        
        if abs(new_datetime - existing_datetime) < timedelta(minutes=30):
            return False
    return True

def is_reservation_conflicting(new_reservation):
    for reservation in reservations:
        if reservation['department'] == new_reservation['department']:
            if reservation['date'] == new_reservation['date'] and reservation['time'] == new_reservation['time']:
                return True
    return False


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = get_user_by_credentials(username, password)
    if user:
        session['user'] = user
        return jsonify({"message": "Connexion réussie", "role": user["role"], "name": user["name"]}), 200
    else:
        return jsonify({"error": "Nom d'utilisateur ou mot de passe incorrect"}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Déconnexion réussie"}), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'citoyen')
    numdep = data.get('numdep', 0) 

    if any(user["name"] == username for user in users):
        return jsonify({"error": "Nom d'utilisateur déjà utilisé"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = {
        "id": len(users) + 1,
        "name": username,
        "password": hashed_password,
        "role": role,
        "numdep": numdep, 
    }

    users.append(new_user)
    save_users()
    return jsonify({"message": "Inscription réussie"}), 201


@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)


@app.route('/api/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_user(user_id):
    user = next((user for user in users if user['id'] == user_id), None)
    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    if request.method == 'GET':
        return jsonify(user), 200

    elif request.method == 'PUT':
        data = request.json
        user['name'] = data.get('username', user['name'])
        if 'password' in data:  
            hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
            user['password'] = hashed_password
        user['role'] = data.get('role', user['role'])
        save_users()
        return jsonify({"message": "Utilisateur mis à jour"}), 200

    elif request.method == 'DELETE':
        users.remove(user)
        save_users()
        return jsonify({"message": "Utilisateur supprimé"}), 200


@app.route('/api/reservations', methods=['GET', 'POST'])
def manage_reservations():
    if request.method == 'POST':
        new_reservation = request.json
        
        if not is_valid_time(new_reservation['time']):
            return jsonify({"error": "L'heure de la réservation doit être entre 09:00 et 16:00"}), 400
        
        if is_reservation_conflicting(new_reservation):
            return jsonify({"error": "Il y a déjà une réservation à cette date et heure pour ce département."}), 400
        
        if not is_reservation_gap_valid(new_reservation):
            return jsonify({"error": "La réservation doit être espacée d'au moins 30 minutes d'une autre réservation."}), 400
        
        new_reservation['id'] = len(reservations) + 1
        reservations.append(new_reservation)
        save_reservations()
        return jsonify(new_reservation), 201
    
    return jsonify(reservations)

@app.route('/api/reservations/<int:reservation_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_reservation(reservation_id):
    reservation = next((res for res in reservations if res['id'] == reservation_id), None)
    if not reservation:
        return jsonify({"error": "Réservation non trouvée"}), 404

    if request.method == 'GET':
        return jsonify(reservation), 200

    elif request.method == 'PUT':
        data = request.json
        reservation.update(data)  
        save_reservations()
        return jsonify({"message": "Réservation mise à jour"}), 200

    elif request.method == 'DELETE':
        reservations.remove(reservation)
        save_reservations()
        return jsonify({"message": "Réservation supprimée"}), 200


@app.route('/api/reservations/user', methods=['GET'])
def get_user_reservations():
    username = request.args.get('username')

    user = next((user for user in users if user["name"] == username), None)
    if user:
        user_name = user['name']
        user_reservations = [reservation for reservation in reservations if reservation['citizen'] == user_name]
        return jsonify(user_reservations), 200
    else:
        return jsonify({"error": "Nom d'utilisateur non trouvé"}), 404  


@app.route('/api/departments', methods=['GET']) 
def get_departments():
    with open('data/departements.json') as f:
        departments = json.load(f)
    return jsonify(departments)


if __name__ == '__main__':
    app.run(port=5000, debug=True)  