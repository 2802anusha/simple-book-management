from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = '12345'

# ===============================
# ✅ DB CONFIG
# ===============================
db_config = {
    'host': 'localhost',
    'user': 'book_user',
    'password': 'yourpassword',
    'dbname': 'book_db'
}

def get_db_connection():
    return psycopg2.connect(**db_config)

# ===============================
# ✅ TOKEN GENERATOR
# ===============================
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# ===============================
# ✅ TOKEN DECORATOR
# ===============================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(*args, **kwargs)

    return decorated

# ===============================
# ✅ REGISTER
# ===============================
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    hashed_password = generate_password_hash(data['password'])

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO users (username, password) VALUES (%s, %s)",
        (data['username'], hashed_password)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# ===============================
# ✅ LOGIN
# ===============================
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(
        "SELECT * FROM users WHERE username=%s",
        (data['username'],)
    )

    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return jsonify({'message': 'User not found'}), 401

    if not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Wrong password'}), 401

    token = generate_token(user['id'])

    return jsonify({'token': token})

# ===============================
# ✅ CREATE BOOK (FIXED)
# ===============================
@app.route('/books', methods=['POST'])
@token_required
def create_book():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Request body must be JSON'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # 🔥 FIX: use 'name' not 'book'
    cur.execute(
        """
        INSERT INTO book (publisher, name, date, cost, edition)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            data.get('publisher'),
            data.get('name'),   # ✅ FIXED
            data.get('date'),
            data.get('cost'),
            data.get('edition')
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Book created successfully'}), 201

# ===============================
# ✅ UPDATE BOOK
# ===============================
@app.route('/update/<int:id>', methods=['PUT'])
@token_required
def update_book(id):
    data = request.get_json()

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        UPDATE book
        SET publisher=%s,
            name=%s,
            edition=%s,
            date=%s,
            cost=%s
        WHERE id=%s
        """,
        (
            data.get('publisher'),
            data.get('name'),
            data.get('edition'),
            data.get('date'),
            data.get('cost'),
            id
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Book updated successfully'})

# ===============================
# ✅ DELETE BOOK
# ===============================
@app.route('/delete/<int:id>', methods=['DELETE'])
@token_required
def delete_book(id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM book WHERE id=%s", (id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'Book deleted successfully'})

# ===============================
# ✅ GET BOOKS
# ===============================
@app.route('/', methods=['GET'])
@token_required
def get_books():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT * FROM book ORDER BY id DESC")  # nice improvement
    books = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(books)

# ===============================
# ✅ RUN
# ===============================
if __name__ == '__main__':
    app.run(debug=True)