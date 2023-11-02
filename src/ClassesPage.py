from flask import Flask, request, jsonify
from flask_cors import CORS 
import MySQLdb

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Ruz71873!'
app.config['MYSQL_DB'] = 'classes'

mysql = MySQLdb.connect(
    host=app.config['MYSQL_HOST'],
    user=app.config['MYSQL_USER'],
    passwd=app.config['MYSQL_PASSWORD'],
    db=app.config['MYSQL_DB']
)

@app.route('/api/addClass', methods=['POST'])
def add_class():
    try:
        data = request.json
        name = data['name']
        department = data['department']
        level = data['level']
        credits = data['credits']

        cur = mysql.cursor()
        cur.execute("INSERT INTO classes (name, department, level, credits) VALUES (%s, %s, %s, %s)",
                    (name, department, level, credits))
        mysql.commit()
        cur.close()

        return jsonify({'success': True, 'message': 'Class added'})

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Something went wrong'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)