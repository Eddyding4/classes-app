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

def get_db_connection():
    return MySQLdb.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        passwd=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB']
    )

@app.route('/api/addClass', methods=['POST'])
def add_class():
    connection = None
    try:
        data = request.json
        name = data['name']
        department = data['department']
        level = data['level']
        credits = data['credits']
        student_id = data['student_id']

        connection = get_db_connection()
        cursor = connection.cursor()
        connection.autocommit(False)

        cursor.execute("SELECT id, student_count FROM classes WHERE name = %s", (name,))
        class_data = cursor.fetchone()

        if class_data:
            class_id, student_count = class_data
            new_student_count = student_count + 1
            cursor.execute("UPDATE classes SET student_count = %s WHERE id = %s", (new_student_count, class_id))
        else:
            cursor.execute("INSERT INTO classes (name, department, level, credits, student_id, student_count) VALUES (%s, %s, %s, %s, %s, 1)",
                           (name, department, level, credits, student_id))
        
        connection.commit()
        return jsonify({'success': True, 'message': 'Class added or updated'})

    except Exception as e:
        if connection:
            connection.rollback()
        print(e)
        return jsonify({'success': False, 'message': 'Something went wrong'})
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/api/addStudent', methods=['POST'])
def add_student():
    connection = None
    try:
        data = request.json
        student_id = data['studentID']
        name = data['name']
        major = data['major']
        grade = data['grade']
        gpa = data['gpa']

        connection = get_db_connection()
        cursor = connection.cursor()
        connection.autocommit(False)

        cursor.execute("INSERT INTO students (student_id, name, major, grade, gpa) VALUES (%s, %s, %s, %s, %s)",
                       (student_id, name, major, grade, gpa))
        connection.commit()

        return jsonify({'success': True, 'message': 'Student added'})

    except Exception as e:
        if connection:
            connection.rollback()
        print(e)
        return jsonify({'success': False, 'message': 'Something went wrong'})
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route('/api/getReports', methods=['GET'])
def get_reports():
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        connection.autocommit(False)

        cursor.execute("""
        PREPARE class_info_statement FROM
            'SELECT
                classes.name,
                classes.department,
                classes.level,
                classes.credits,
                COUNT(students.student_id) AS number_of_students,
                AVG(students.gpa) AS average_gpa,
                (SELECT grade
                 FROM students as s
                 WHERE s.student_id = students.student_id
                 GROUP BY grade
                 ORDER BY COUNT(*) DESC
                 LIMIT 1) AS most_common_grade
             FROM
                 classes
             JOIN
                 students ON classes.student_id = students.student_id
             GROUP BY
                 classes.id, classes.name, classes.department, classes.level, classes.credits'
        """)

        cursor.execute("EXECUTE class_info_statement")
        rows = cursor.fetchall()
        cursor.execute("DEALLOCATE PREPARE class_info_statement")
        connection.commit()

        report_data = []
        for row in rows:
            report_data.append({
                'name': row[0],
                'department': row[1],
                'level': row[2],
                'credits': row[3],
                'number_of_students': row[4],
                'average_gpa': float(row[5]),
                'most_common_grade': row[6]
            })

        cursor.execute("DELETE FROM class_reports")

        insert_statement = """
        INSERT INTO class_reports (name, department, level, credits, number_of_students, average_gpa, most_common_grade)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        for data in report_data:
            cursor.execute(insert_statement, (data['name'], data['department'], data['level'], data['credits'], data['number_of_students'], data['average_gpa'], data['most_common_grade']))
        return jsonify(report_data)
    except Exception as e:
        if connection:
            connection.rollback()
        print(e)
        return jsonify({'success': False, 'message': 'Something went wrong'})
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
    

@app.route('/api/filter', methods=['GET'])
def filter_data():
    column_names = ['name', 'department', 'level', 'credits', 'number_of_students', 'average_gpa', 'most_common_grade']
    filter_type = request.args.get('filter_type')
    parameter = request.args.get('parameter')
    try:
        cur = mysql.cursor()

        if filter_type == 'department':
            cur.callproc('FilterByDepartment', [parameter])
        elif filter_type == 'level_desc':
            cur.callproc('FilterByLevelDesc')
        elif filter_type == 'students_desc':
            cur.callproc('FilterByNumberOfStudentsDesc')
        elif filter_type == 'gpa_desc':
            cur.callproc('FilterByAverageGPADesc')
        elif filter_type == 'common_grade_level':
            cur.callproc('FilterByMostCommonGradeLevel', [parameter])
        else:
            return jsonify({'success': False, 'message': 'Invalid filter type'})
        rows = cur.fetchall()
        cur.close()
        result = [dict(zip(column_names, row)) for row in rows]
        return jsonify(result)

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Something went wrong'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)