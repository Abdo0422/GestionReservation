from flask import Flask, jsonify, request, session
from flask_cors import CORS
import json
import bcrypt
import os
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string


app = Flask(__name__)
CORS(app)
app.secret_key = 'Tribunal-de-Commerce-de-Casablanca'

with open('data/users.json') as f:
    users = json.load(f)

with open('data/reservations.json') as f:
    reservations = json.load(f)

def save_users():
    """Save updated user list to the JSON file."""
    with open('data/users.json', 'w') as f:
        json.dump(users, f, indent=2)


def send_email(sender_email, sender_password, receiver_email, subject, body):
    """Sends an email and returns success status."""
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False



def save_reservations():
    """Save updated reservations list to the JSON file."""
    with open('data/reservations.json', 'w') as f:
        json.dump(reservations, f, indent=2)


def get_user_by_credentials(email, password):
    """Authenticate user by email and password."""
    for user in users:
        if user["email"] == email and bcrypt.checkpw(password.encode(), user["password"].encode()):
            return user
    return None

def is_valid_time(time, date):
    try:
        reservation_time = datetime.strptime(time, '%H:%M')
        start_time = datetime.strptime('09:00', '%H:%M')
        end_time = datetime.strptime('16:00', '%H:%M')
        
        reservation_date = datetime.strptime(date, '%Y-%m-%d')
        if reservation_date.weekday() >= 5: 
            return False
        
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
    email = data.get('email')
    password = data.get('password')

    user = get_user_by_credentials(email, password)
    if user:
        session['user'] = user
        return jsonify({"message": "Connexion réussie", "role": user["role"], "name": user["name"], "numdep": user["numdep"]}), 200
    else:
        return jsonify({"error": "Email ou mot de passe incorrect"}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"message": "Déconnexion réussie"}), 200


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'citoyen')
    numdep = data.get('numdep', 99)

    if any(user["email"] == email for user in users):
        return jsonify({"error": "Email déjà utilisé"}), 400

    verification_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    sender_email = "mylifeasabdo@gmail.com"
    sender_password = "ymhn xdwu cdbb yveo"
    subject = "Vérification d'email"
    body = f"""
    <html>
    <body>
        <h2>Bonjour {username},</h2>
        <p>Merci de vous être inscrit. Votre code de vérification est :</p>
        <h3>{verification_code}</h3>
        <p>Veuillez saisir ce code pour activer votre compte.</p>
    </body>
    </html>
    """

    if not send_email(sender_email, sender_password, email, subject, body):
        return jsonify({"error": "Échec de l'envoi de l'email de vérification."}), 500

    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    new_user = {
        "id": len(users) + 1,
        "name": username,
        "email": email,
        "password": hashed_password,
        "role": role,
        "numdep": numdep,
        "verified": False,
        "verification_code": verification_code
    }

    users.append(new_user)
    save_users()
    return jsonify({"message": "Inscription réussie"}), 201

@app.route('/api/verify', methods=['POST'])
def verify():
    data = request.json
    email = data.get('email')
    code = data.get('code')

    user = next((user for user in users if user["email"] == email), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["verified"]: 
        return jsonify({"message": "User already verified"}), 200

    if user["verification_code"] == code:
        user["verified"] = True
        user["verification_code"] = None 
        save_users()
        return jsonify({"message": "Email verified successfully!"}), 200
    else:
        return jsonify({"error": "Invalid verification code"}), 400


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
        user['email'] = data.get('email', user['email'])
        user['numdep'] = data.get('numdep', user['numdep']) 
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
        
        if not is_valid_time(new_reservation['time'], new_reservation['date']):
            return jsonify({"error": "L'heure de la réservation doit être entre 09:00 et 16:00 et ne peut pas être un weekend"}), 400
        
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

@app.route('/api/departments/<int:numdep>', methods=['GET'])
def get_department_by_numdep(numdep):
    with open('data/departements.json') as f:
        departments = json.load(f)

    department = next((dept for dept in departments if dept['id'] == numdep), None)

    if department:
        return jsonify(department), 200
    else:
        return jsonify({"error": "Department not found"}), 404


@app.route('/api/chef/reservations', methods=['GET'])
def get_chef_reservations():
    department = request.args.get('department')

    if not department:
        return jsonify({"error": "Department is required"}), 400

    chef_reservations = [reservation for reservation in reservations if reservation['department'] == department]
    return jsonify(chef_reservations), 200


@app.route('/api/chef/employees', methods=['GET', 'POST'])
def manage_employees():
    with open('data/employees.json') as f:
        employees = json.load(f)
    
    if request.method == 'GET':
        return jsonify(employees), 200

    if request.method == 'POST':
        data = request.json
        name = data.get('name')
        telephone = data.get('telephone')
        email = data.get('email')
        age = data.get('age')
        department = data.get('department')
        role = data.get('role', 'employee')

        if any(employee['name'] == name for employee in employees):
            return jsonify({"error": "Employee already exists"}), 400

        new_employee = {
            "id": len(employees) + 1,
            "name": name,
            "telephone": telephone,
            "email": email,
            "age": age,
            "department": department,
            "role": role
        }

        employees.append(new_employee)

        with open('data/employees.json', 'w') as f:
            json.dump(employees, f, indent=2)

        return jsonify(new_employee), 201


@app.route('/api/chef/employees/<int:employee_id>', methods=['PUT', 'DELETE'])
def manage_employee(employee_id):
    with open('data/employees.json') as f:
        employees = json.load(f)

    employee = next((emp for emp in employees if emp['id'] == employee_id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    if request.method == 'PUT':
        data = request.json
        employee['name'] = data.get('name', employee['name'])
        employee['role'] = data.get('role', employee['role'])
        employee['department'] = data.get('department', employee['department'])

        with open('data/employees.json', 'w') as f:
            json.dump(employees, f, indent=2)

        return jsonify(employee), 200

    if request.method == 'DELETE':
        employees.remove(employee)

        with open('data/employees.json', 'w') as f:
            json.dump(employees, f, indent=2)

        return jsonify({"message": "Employee deleted"}), 200


@app.route('/api/chef/reservation/<int:reservation_id>/assign-employee', methods=['PUT'])
def assign_employee_to_reservation(reservation_id):
    data = request.json
    employee_id = data.get('employee_id')

    reservation = next((res for res in reservations if res['id'] == reservation_id), None)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    with open('data/employees.json') as f:
        employees = json.load(f)

    employee = next((emp for emp in employees if emp['id'] == employee_id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    reservation['employee_assigned'] = employee['name']
    reservation['status'] = "En attente" 

    save_reservations()

    sender_email = "mylifeasabdo@gmail.com"  
    sender_password = "ymhn xdwu cdbb yveo" 
    receiver_email = employee['email'] 
    subject = "Nouvelle affectation de réservation"

    with open('data/departements.json') as f:
        departments = json.load(f)
    
    with open('data/users.json') as f:
        users = json.load(f)

    department_numdep = None
    department_name = None 
    for dept in departments:
      if dept['nomdepart'] == employee['department']:
        department_numdep = dept['id']
        department_name = dept['nomdepart'] 
        break

    if department_numdep is None:
        print(f"Warning: No numdep found for department: {employee['department']}")
        user_name = "Administrateur"  
        chef_dept_name = "N/A" 
    else:
      user_name = None
      for user in users:
          if user['numdep'] == department_numdep and user['role'] == 'chef':
              user_name = user['name']
              break

      if user_name is None:
          print(f"Warning: No chef user found for numdep: {department_numdep}")
          user_name = "Administrateur"  
          chef_dept_name = "N/A" 
      else:
        chef_dept_name = department_name

    body = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle affectation de réservation</title>
        <style>
            body {{
                font-family: sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #f9f9f9;
            }}
            h1 {{
                color: #0056b3; /* Example: Blue color */
            }}
            p {{
                margin-bottom: 10px;
            }}
            .details {{
                margin-top: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background-color: #fff;
            }}
            .footer {{
                margin-top: 20px;
                text-align: center;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Nouvelle affectation de réservation</h1>
            <p>Bonjour {employee['name']},</p>
            <p>Vous avez été affecté à une nouvelle réservation. Voici les détails :</p>

            <div class="details">
                <p><strong>Description:</strong> {reservation['description']}</p>
                <p><strong>Date:</strong> {reservation['date']}</p>
                <p><strong>Heure:</strong> {reservation['time']}</p>
                <p><strong>Département:</strong> {reservation['department']}</p>
                <p><strong>Citoyen:</strong> {reservation['citizen']}</p>
                <p><strong>Status:</strong> {reservation['status']}</p>
            </div>

            <p>Veuillez prendre les mesures nécessaires.</p>

            <div class="footer">
                <p>Cordialement,<br>{user_name} (Chef de: {chef_dept_name})<br>Le Tribunal de Commerce de Casablanca</p> 
            </div>
        </div>
    </body>
    </html>
    """

    send_email(sender_email, sender_password, receiver_email, subject, body)

    # --- Send email to citizen --- 
    with open('data/users.json') as f:
        users = json.load(f)

    citizen = next((user for user in users if user['name'] == reservation['citizen']), None) 
    if not citizen:
        print(f"Warning: Citizen not found for reservation: {reservation_id}")
    else:
        receiver_email = citizen['email']
        subject = "Confirmation de votre réservation"
        body = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation de réservation</title>
            <style>
                body {{
                    font-family: sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
              .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                }}
                h1 {{
                    color: #0056b3; 
                }}
                p {{
                    margin-bottom: 10px;
                }}
              .details {{
                    margin-top: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background-color: #fff;
                }}
              .footer {{
                    margin-top: 20px;
                    text-align: center;
                    color: #777;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Confirmation de réservation</h1>
                <p>Bonjour {citizen['name']},</p>
                <p>Votre réservation a été confirmée. Voici les détails:</p>

                <div class="details">
                    <p><strong>Description:</strong> {reservation['description']}</p>
                    <p><strong>Date:</strong> {reservation['date']}</p>
                    <p><strong>Heure:</strong> {reservation['time']}</p>
                    <p><strong>Département:</strong> {reservation['department']}</p>
                    <p><strong>Employé assigné:</strong> {employee['name']}</p> 
                    <p><strong>Status:</strong> {reservation['status']}</p>
                </div>

                <p>Veuillez vous présenter au tribunal à la date et l'heure indiquées.</p>

                <div class="footer">
                <p>Cordialement,<br>{user_name} (Chef de: {chef_dept_name})<br>Le Tribunal de Commerce de Casablanca</p> 
                </div>
            </div>
        </body>
        </html>
        """
        send_email(sender_email, sender_password, receiver_email, subject, body)

    return jsonify({"message": f"Employee {employee['name']} assigned to {reservation['description']}"}), 200


@app.route('/api/chef/reservation/<int:reservation_id>/status', methods=['PUT'])
def update_reservation_status(reservation_id):
    data = request.json
    status = data.get('status')

    reservation = next((res for res in reservations if res['id'] == reservation_id), None)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    reservation['status'] = status

    save_reservations()

    return jsonify({"message": f"Reservation status updated to {status}"}), 200


if __name__ == '__main__':
    app.run(port=5000, debug=True)  