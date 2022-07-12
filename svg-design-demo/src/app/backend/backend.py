from flask import Flask, jsonify, request
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
import psycopg2
@app.route('/login')
def login():
    global conn
    email = request.args.get('email', default=None, type=str)
    password = request.args.get('password', default=None, type=str)
    try:
        conn=psycopg2.connect("dbname='lightscreendb' user='admin' password='koprEs-fyfvuc-kapga4' host='localhost'")
        cur = conn.cursor()
        if email != None and password != None:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = MD5(" + password + ");")
            rows = cur.fetchall()
            return jsonify(rows)
        else:
            rows = tuple()
            return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/signup')
def signup():
    global conn
    firstname = request.args.get('firstname', default=None, type=str)
    lastname = request.args.get('lastname', default=None, type=str)
    email = request.args.get('email', default=None, type=str)
    password = request.args.get('password', default=None, type=str)
    try:
        conn=psycopg2.connect("dbname='lightscreendb' user='admin' password='koprEs-fyfvuc-kapga4' host='localhost'")
        cur = conn.cursor()
        if firstname != None and lastname != None and email != None and password != None:
            cur.execute("SELECT * FROM users WHERE email = " + email + ";")
            rows = cur.fetchall()
            # User already has an account with that email
            if len(rows) > 0:
                rows = (-1,)
                return jsonify(rows)
            else:
                cur.execute("INSERT INTO users(firstname, lastname, email, password, permissions) VALUES(" + firstname + ", " + lastname + ", " + email + ", MD5(" + password + "), 'basic');")
                cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = MD5(" + password + ");")
                rows = cur.fetchall()
                conn.commit()
            return jsonify(rows)
        else:
            rows = tuple()
            return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/users')
def getUsers():
    global conn
    try:
        conn=psycopg2.connect("dbname='lightscreendb' user='admin' password='koprEs-fyfvuc-kapga4' host='localhost'")
        cur = conn.cursor()
        cur.execute("SELECT * FROM users;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/orders')
def getOrders():
    global conn
    try:
        conn=psycopg2.connect("dbname='lightscreendb' user='admin' password='koprEs-fyfvuc-kapga4' host='localhost'")
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/makeorder')
def makeOrder():
    global conn
    email = request.args.get('email', default=None, type=str) 
    selectedDividerType = request.args.get('selectedDividerType', default=None, type=str) 
    unitChoice = request.args.get('unitChoice', default=None, type=str) 

    # Top sash data 
    windowWidth = request.args.get('windowWidth', default=None, type=float) 
    windowHeight = request.args.get('windowHeight', default=None, type=float) 
    horzDividers = request.args.get('horzDividers', default=None, type=int) 
    vertDividers = request.args.get('vertDividers', default=None, type=int) 
    dividerWidth = request.args.get('dividerWidth', default=None, type=float) 

    # Bottom sash data (all null if not a double hung)
    bottomWindowWidth = request.args.get('bottomWindowWidth', default=None, type=float)
    bottomWindowHeight = request.args.get('bottomWindowHeight', default=None, type=float) 
    bottomHorzDividers = request.args.get('bottomHorzDividers', default=None, type=int) 
    bottomVertDividers = request.args.get('bottomVertDividers', default=None, type=int) 
    bottomDividerWidth = request.args.get('bottomDividerWidth', default=None, type=float) 

    templateID = request.args.get('templateID', default=None, type=int) 
    panelColoringString = request.args.get('panelColoringString', default=None, type=str)
    streetAddress = request.args.get('streetAddress', default=None, type=str)
    city = request.args.get('city', default=None, type=str)
    state = request.args.get('state', default=None, type=str) 
    zipcode = request.args.get('zipcode', default=None, type=str) 
    country = request.args.get('country', default=None, type=str) 

    try:
        conn=psycopg2.connect("dbname='lightscreendb' user='admin' password='koprEs-fyfvuc-kapga4' host='localhost'")
        cur = conn.cursor()
        if email != "NULL" or (streetAddress != "NULL" and city != "NULL" and state != "NULL" and country != "NULL"):
            cur.execute("""
            INSERT INTO orders(useremail, selecteddividertype, unitchoice, windowwidth, 
            windowheight, horizontaldividers, verticaldividers, dividerwidth, templateid, 
            panelcoloringstring, streetaddress, city, state, zipcode, country) 
            VALUES(%s, %s, %s, '{%s, %s}', '{%s, %s}', '{%s, %s}', '{%s, %s}', '{%s, %s}', %s, %s, %s, %s, %s, %s, %s)""", 
            (email, selectedDividerType, unitChoice, windowWidth, bottomWindowWidth, windowHeight, 
            bottomWindowHeight, horzDividers, bottomHorzDividers, vertDividers, bottomVertDividers, 
            dividerWidth, bottomDividerWidth, templateID, panelColoringString, streetAddress, city, state, zipcode, country))
            rows = (1,)
            conn.commit()
        else:
            rows = (-1,)
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)