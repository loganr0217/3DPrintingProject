from flask import Flask, jsonify, request
from flask_cors import CORS
import os
app = Flask(__name__)
CORS(app)
import psycopg2

db_user = os.environ.get('CLOUD_SQL_USERNAME')
db_password = os.environ.get('CLOUD_SQL_PASSWORD')
db_name = os.environ.get('CLOUD_SQL_DATABASE_NAME')
db_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME')

@app.route('/login')
def login():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = MD5(" + password + ");")
            rows = cur.fetchall()
        else:
            rows = tuple()
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/signup')
def signup():
    global conn
    firstname = request.args.get('firstname', default='null', type=str)
    lastname = request.args.get('lastname', default='null', type=str)
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if firstname != 'null' and lastname != 'null' and email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + ";")
            rows = cur.fetchall()
            # User already has an account with that email
            if len(rows) > 0:
                rows = (-1,)
            else:
                cur.execute("INSERT INTO users(first_name, last_name, email, password, permissions) VALUES(" + firstname + ", " + lastname + ", " + email + ", MD5(" + password + "), 'basic');")
                cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = MD5(" + password + ");")
                rows = cur.fetchall()
                conn.commit()
        else:
            rows = tuple()
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/addpanel')
def addPanel():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    panelSetId = request.args.get('panelSetId', default='null', type=int)
    panelNumber = request.args.get('panelNumber', default='null', type=int)
    panelName = request.args.get('panelName', default='null', type=str)
    dAttribute = request.args.get('dAttribute', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions = 'admin' or permissions = 'designer');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    rows = (-2,)
                else:
                    cur.execute("INSERT INTO panels(panelset_id, panel_number, panel_name, d_attribute) VALUES({}, {}, {}, {});".format(panelSetId, panelNumber, panelName, dAttribute))
                    conn.commit()
                    rows = (1,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/panels')
def getPanels():
    global conn
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        cur.execute("SELECT * FROM panels;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/addtemplate')
def addtemplate():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    numberPanelsX = request.args.get('numberPanelsX', default='null', type=int)
    numberPanelsY = request.args.get('numberPanelsY', default='null', type=int)
    templateString = request.args.get('templateString', default='null', type=str)
    access = request.args.get('access', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and numberPanelsX != 'null' and numberPanelsY != 'null' and templateString != 'null' and access != 'null':
            if numberPanelsX * numberPanelsY == len(templateString.split(";")):
                cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions = 'admin' or permissions = 'designer');")
                rows = cur.fetchall()
                # User has been authenticated as an admin or designer
                if len(rows) > 0:
                    cur.execute("INSERT INTO templates(number_panels_x, number_panels_y, template_string, access) VALUES({}, {}, {}, {});".format(numberPanelsX, numberPanelsY, templateString, access))
                    conn.commit()
                    rows = (1,)
                else:
                    rows = (-1,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Endpoint to get the full list of templates
@app.route('/templates')
def getTemplates():
    global conn
    numberPanelsX = request.args.get('numberPanelsX', default='null', type=int)
    numberPanelsY = request.args.get('numberPanelsY', default='null', type=int)
    try:
        if (numberPanelsX == -1 and numberPanelsY == -1) or (numberPanelsX == 'null' and numberPanelsY == 'null'):
            conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
            cur = conn.cursor()
            cur.execute("SELECT * FROM templates;")
            rows = cur.fetchall()
        else:
            conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
            cur = conn.cursor()
            cur.execute("SELECT * FROM templates WHERE number_panels_x = " + numberPanelsX + "AND number_panels_y = " + numberPanelsY + ";")
            rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/users')
def getUsers():
    global conn
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
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
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/saveorder')
def saveOrder():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    selectedDividerType = request.args.get('selectedDividerType', default='null', type=str) 
    unitChoice = request.args.get('unitChoice', default='null', type=str) 

    # Top sash data 
    windowWidth = request.args.get('windowWidth', default='null', type=float) 
    windowHeight = request.args.get('windowHeight', default='null', type=float) 
    horzDividers = request.args.get('horzDividers', default='null', type=int) 
    vertDividers = request.args.get('vertDividers', default='null', type=int) 
    dividerWidth = request.args.get('dividerWidth', default='null', type=float) 

    # Bottom sash data (all null if not a double hung)
    bottomWindowWidth = request.args.get('bottomWindowWidth', default='null', type=float)
    bottomWindowHeight = request.args.get('bottomWindowHeight', default='null', type=float) 
    bottomHorzDividers = request.args.get('bottomHorzDividers', default='null', type=int) 
    bottomVertDividers = request.args.get('bottomVertDividers', default='null', type=int) 
    bottomDividerWidth = request.args.get('bottomDividerWidth', default='null', type=float) 

    templateID = request.args.get('templateID', default='null', type=int) 
    panelColoringString = request.args.get('panelColoringString', default='null', type=str)
    streetAddress = request.args.get('streetAddress', default='null', type=str)
    city = request.args.get('city', default='null', type=str)
    state = request.args.get('state', default='null', type=str) 
    zipcode = request.args.get('zipcode', default='null', type=str) 
    country = request.args.get('country', default='null', type=str) 

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' or (streetAddress != 'null' and city != 'null' and state != 'null' and country != 'null'):
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions = 'admin' or permissions = 'designer');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or designer
            if len(rows) > 0:
                cur.execute("""
                INSERT INTO orders(user_email, selected_divider_type, unit_choice, window_width, 
                window_height, horizontal_dividers, vertical_dividers, divider_width, template_id, 
                panel_coloring_string, street_address, city, state, zipcode, country, bottom_sash_width, bottom_sash_height, status) 
                VALUES({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 'saved')""".format(
                email, selectedDividerType, unitChoice, windowWidth, windowHeight,
                horzDividers, vertDividers, dividerWidth, templateID, panelColoringString, 
                streetAddress, city, state, zipcode, country, bottomWindowWidth, bottomWindowHeight))
                rows = (1,)
                conn.commit()
            else:
                rows = (-1,)
            
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/makeorder')
def makeOrder():
    global conn
    email = request.args.get('email', default='null', type=str) 
    selectedDividerType = request.args.get('selectedDividerType', default='null', type=str) 
    unitChoice = request.args.get('unitChoice', default='null', type=str) 

    # Top sash data 
    windowWidth = request.args.get('windowWidth', default='null', type=float) 
    windowHeight = request.args.get('windowHeight', default='null', type=float) 
    horzDividers = request.args.get('horzDividers', default='null', type=int) 
    vertDividers = request.args.get('vertDividers', default='null', type=int) 
    dividerWidth = request.args.get('dividerWidth', default='null', type=float) 

    # Bottom sash data (all null if not a double hung)
    bottomWindowWidth = request.args.get('bottomWindowWidth', default='null', type=float)
    bottomWindowHeight = request.args.get('bottomWindowHeight', default='null', type=float) 
    bottomHorzDividers = request.args.get('bottomHorzDividers', default='null', type=int) 
    bottomVertDividers = request.args.get('bottomVertDividers', default='null', type=int) 
    bottomDividerWidth = request.args.get('bottomDividerWidth', default='null', type=float) 

    templateID = request.args.get('templateID', default='null', type=int) 
    panelColoringString = request.args.get('panelColoringString', default='null', type=str)
    streetAddress = request.args.get('streetAddress', default='null', type=str)
    city = request.args.get('city', default='null', type=str)
    state = request.args.get('state', default='null', type=str) 
    zipcode = request.args.get('zipcode', default='null', type=str) 
    country = request.args.get('country', default='null', type=str) 

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' or (streetAddress != 'null' and city != 'null' and state != 'null' and country != 'null'):
            cur.execute("""
            INSERT INTO orders(user_email, selected_divider_type, unit_choice, window_width, 
            window_height, horizontal_dividers, vertical_dividers, divider_width, template_id, 
            panel_coloring_string, street_address, city, state, zipcode, country, bottom_sash_width, bottom_sash_height, status) 
            VALUES({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 'placed')""".format(
            email, selectedDividerType, unitChoice, windowWidth, windowHeight,
            horzDividers, vertDividers, dividerWidth, templateID, panelColoringString, 
            streetAddress, city, state, zipcode, country, bottomWindowWidth, bottomWindowHeight))
            rows = (1,)
            conn.commit()
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

if __name__ == '__main__':
    from waitress import serve
    serve(app)