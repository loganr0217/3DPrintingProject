from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from flask_mail import Mail, Message
import os
import secrets
import requests
import stripe

app = Flask(__name__)

mail= Mail(app)
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
emailPassword = os.environ.get('CONTACT_FORM_PASSWORD')
app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'info@lightscreenart.com'
app.config['MAIL_PASSWORD'] = "{}".format(emailPassword)
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

CORS(app)
import psycopg2

db_user = os.environ.get('CLOUD_SQL_USERNAME')
db_password = os.environ.get('CLOUD_SQL_PASSWORD')
db_name = os.environ.get('CLOUD_SQL_DATABASE_NAME')
db_connection_name = os.environ.get('CLOUD_SQL_CONNECTION_NAME')

@app.route('/login')
def login():
    global conn
    email = request.args.get('email', default='null', type=str).lower()
    password = request.args.get('password', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = MD5(" + password + ");")
            rows = cur.fetchall()
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/loginWithExternal')
def loginWithExternal():
    global conn
    idToken = request.args.get('idtoken', default='null', type=str)
    provider = request.args.get('provider', default='null', type=str)
    userID = request.args.get('userid', default='null', type=str)

    tokenURL = ""
    if provider == "GOOGLE":
        tokenURL = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={}".format(idToken)
    if provider == "FACEBOOK":
        tokenURL = "https://graph.facebook.com/{}?fields=email,name&access_token={}".format(userID, idToken)
    
    r = requests.get(tokenURL)
    rJson = r.json()
    email = rJson['email'].lower()

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != None:
            cur.execute("SELECT * FROM users WHERE email = '" + email + "';")
            rows = cur.fetchall()
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/signup')
def signup():
    global conn
    firstname = request.args.get('firstname', default='null', type=str)
    lastname = request.args.get('lastname', default='null', type=str)
    email = request.args.get('email', default='null', type=str).lower()
    password = request.args.get('password', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if firstname != 'null' and lastname != 'null' and email != 'null' and len(password) >= 8 and password != "'undefined'" and email != '':
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
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/signupWithExternal')
def signupWithExternal():
    global conn
    idToken = request.args.get('idtoken', default='null', type=str)
    provider = request.args.get('provider', default='null', type=str)
    userID = request.args.get('userid', default='null', type=str)

    # Generating random password 15 characters
    password = secrets.token_urlsafe(15)

    tokenURL = ""
    if provider == "GOOGLE":
        tokenURL = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={}".format(idToken)
    if provider == "FACEBOOK":
        tokenURL = "https://graph.facebook.com/{}?fields=email,name&access_token={}".format(userID, idToken)

    r = requests.get(tokenURL)
    rJson = r.json()
    firstName = rJson['name'].split()[0]
    lastName = rJson['name'].split()[1]
    email = rJson['email'].lower()

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if firstName != None and lastName != None and email != None and len(password) >= 8 and password != None and email != '':
            cur.execute("SELECT * FROM users WHERE email = '" + email + "';")
            rows = cur.fetchall()
            # User already has an account with that email
            if len(rows) > 0:
                rows = (-1,)
            else:
                cur.execute("INSERT INTO users(first_name, last_name, email, password, permissions) VALUES('" + firstName + "', '" + lastName + "', '" + email + "', MD5('" + password + "'), 'basic');")
                cur.execute("SELECT * FROM users WHERE email = '" + email + "' AND password = MD5('" + password + "');")
                rows = cur.fetchall()
                conn.commit()
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Endpoint for a user to start the forgot password process
@app.route('/forgotpassword')
def forgotPassword():
    global conn
    email = request.args.get('email', default='null', type=str)

    # Generating random reset token 15 characters
    resetToken = secrets.token_urlsafe(15)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != None and email != '' and email != 'null':
            # Making sure user exists
            cur.execute("SELECT * FROM users WHERE email = '" + email + "';")
            rows = cur.fetchall()

            # User has account
            if len(rows) > 0:
                cur.execute("UPDATE users SET reset_token = '" + resetToken + "', token_expire_time = (now() + interval '5 minutes') where email = '" + email + "';")
                rows = (1,)
                conn.commit()

                # Sending email with reset link to use
                try:
                    resetLink = "https://www.lightscreenart.com/reset-pass?email="+email+"&resettoken="+resetToken
                    msg = Message('LightScreen Reset Password', sender = 'info@lightscreenart.com', recipients = [email])
                    msg.body = "Follow the link below to update your password. This link will expire in 5 minutes for your security.\n\nLink: {}".format(resetLink)
                    mail.send(msg)
                    # Returning the final result
                    return jsonify(rows)
                except Exception as e:
                    return ("Error sending the message " + str(e), )
            else:
                rows = (-1,)
        else:
            rows = (-2,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/resetpassword')
def resetPassword():
    global conn
    email = request.args.get('email', default='null', type=str)
    resetToken = request.args.get('resettoken', default='null', type=str)
    password = request.args.get('password', default='null', type=str)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != None and email != '' and email != 'null' and len(password) >= 8 and password != None:
            # Making sure user exists and token is not expired
            cur.execute("SELECT * FROM users WHERE email = '" + email + "' and reset_token = '" + resetToken + "' and now() < token_expire_time;")
            rows = cur.fetchall()

            # Reset link is valid
            if len(rows) > 0:
                cur.execute("UPDATE users SET password = MD5('" + password + "') where email = '" + email + "' and reset_token = '" + resetToken + "';")
                rows = (1,)
                conn.commit()

                # Sending email letting user know the password has been successfully reset
                try:
                    msg = Message('LightScreen Password Change', sender = 'info@lightscreenart.com', recipients = [email])
                    msg.body = "Your LightScreen password has been successfully reset."
                    mail.send(msg)
                    # Returning the final result
                    return jsonify(rows)
                except Exception as e:
                    return ("Error sending the message " + str(e), )
            else:
                rows = (-1)
        else:
            rows = (-2,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/addpanel', methods = ['POST'])
def addPanel():
    global conn
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    panelSetId = data.get('panelSetId')
    panelNumber = data.get('panelNumber')
    panelName = data.get('panelName')
    dAttribute = data.get('dAttribute')
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "' AND (permissions LIKE '%admin%' OR permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    rows = (-2,)
                else:
                    cur.execute("INSERT INTO panels(panelset_id, panel_number, panel_name, d_attribute) VALUES({}, {}, '{}', '{}');".format(panelSetId, panelNumber, panelName, dAttribute))
                    conn.commit()
                    rows = (1,)
            else:
                rows = (-3,)
        else:
            rows = (-1)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/updatepanel', methods = ['POST'])
def updatePanel():
    global conn
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    panelSetId = data.get('panelSetId')
    panelNumber = data.get('panelNumber')
    panelName = data.get('panelName')
    dAttribute = data.get('dAttribute')
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "' AND (permissions LIKE '%admin%' OR permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE panels SET panel_name = '{}', d_attribute = '{}' WHERE panelset_id = {} AND panel_number = {};".format(panelName, dAttribute, panelSetId, panelNumber))
                    conn.commit()
                    rows = (1,)
                # Panel doesn't exist yet
                else:
                    rows = (-2,)
            else:
                rows = (-3,)
        else:
            rows = (-1)
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
        cur.execute("SELECT * FROM panels order by panelset_id, panel_number;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/addpanelautofillstring')
def addPanelAutofillString():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    panelSetId = request.args.get('panelSetId', default='null', type=int)
    panelNumber = request.args.get('panelNumber', default='null', type=int)
    panelAutofillString = request.args.get('panelAutofillString', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' or permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE panels set panel_autofill_string = {} where panelset_id = {} and panel_number = {}".format(panelAutofillString, panelSetId, panelNumber))
                    conn.commit()
                    row = (1,)
                # No panel to add string to
                else:
                    rows = (-2,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/addpanelsymmetricpanes')
def addPanelSymmetricPanes():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    panelSetId = request.args.get('panelSetId', default='null', type=int)
    panelNumber = request.args.get('panelNumber', default='null', type=int)
    symmetricPanesString = request.args.get('symmetricPanesString', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' OR permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE panels set symmetric_panes_string = {} where panelset_id = {} and panel_number = {}".format(symmetricPanesString, panelSetId, panelNumber))
                    conn.commit()
                    row = (1,)
                # No panel to add string to
                else:
                    rows = (-2,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/addpanelfilamentpercentage')
def addPanelFilamentPercentage():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    panelSetId = request.args.get('panelSetId', default='null', type=int)
    panelNumber = request.args.get('panelNumber', default='null', type=int)
    filamentPercentage = request.args.get('filamentPercentage', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' or permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE panels set filament_percentage = {} where panelset_id = {} and panel_number = {}".format(filamentPercentage, panelSetId, panelNumber))
                    conn.commit()
                    row = (1,)
                # No panel to add string to
                else:
                    rows = (-2,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/deletepanel')
def deletePanel():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    panelSetId = request.args.get('panelSetId', default='null', type=int)
    panelNumber = request.args.get('panelNumber', default='null', type=int)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("SELECT * FROM panels WHERE panelset_id = {} AND panel_number = {};".format(panelSetId, panelNumber))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("DELETE FROM panels WHERE panelset_id = {} and panel_number = {}".format(panelSetId, panelNumber))
                    conn.commit()
                    row = (1,)
                # No panel to delete
                else:
                    rows = (-2,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


@app.route('/panecolors')
def getPaneColors():
    global conn
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        cur.execute("SELECT * FROM pane_colors order by placement_id;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)
        
@app.route('/addpanecolor')
def addPaneColor():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    colorName = request.args.get('name', default='null', type=str)
    colorHex = request.args.get('hex', default='null', type=str)
    isAvailable = request.args.get('isAvailable', default=False, type=bool)
    placementID = request.args.get('placementID', default=-1, type=int)
    colorOpacity = request.args.get('opacity', default=1, type=int)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and colorHex != 'null' and len(str(colorHex).replace("'", "")) == 6:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("INSERT INTO pane_colors(name, hex, is_available, placement_id, opacity) VALUES({}, {}, {}, {}, {});".format(colorName, colorHex, isAvailable, placementID, colorOpacity))
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

@app.route('/updatepanecolor')
def updatePaneColor():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    colorName = request.args.get('name', default='null', type=str)
    colorHex = request.args.get('hex', default='null', type=str)
    isAvailable = request.args.get('isAvailable', default=False, type=bool)
    realID = request.args.get('id', default=-1, type=int)
    placementID = request.args.get('placementID', default=-1, type=int)
    colorOpacity = request.args.get('opacity', default=1, type=float)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and colorHex != 'null' and len(str(colorHex).replace("'", "")) == 6:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("SELECT * FROM pane_colors WHERE id = {};".format(realID))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE pane_colors set name = {}, hex = {}, is_available = {}, placement_id = {}, opacity = {} where id = {};".format(colorName, colorHex, isAvailable, placementID, colorOpacity, realID))
                    conn.commit()
                    rows = (1,)
                # No pane color to update
                else:
                    rows = (-3,)
                
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/deletepanecolor')
def deletePaneColor():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    colorId = request.args.get('colorId', default=-1, type=int)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and colorId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("SELECT * FROM pane_colors WHERE id = {};".format(colorId))
                rows = cur.fetchall()
                # Color exists
                if len(rows) > 0:
                    cur.execute("DELETE FROM pane_colors WHERE id = {};".format(colorId))
                    conn.commit()
                    row = (1,)
                # No color to delete
                else:
                    rows = (-2,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/changepanecoloravailability')
def changePaneColorAvailability():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    colorId = request.args.get('colorId', default='null', type=int)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and panelNumber != -1 and panelSetId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("SELECT * FROM pane_colors WHERE id = {};".format(colorId))
                rows = cur.fetchall()
                # Color exists
                if len(rows) > 0:
                    cur.execute("UPDATE pane_colors SET is_available = NOT is_available WHERE id = {}".format(colorId))
                    conn.commit()
                    row = (1,)
                # No color to delete
                else:
                    rows = (-2,)
            else:
                rows = (-1,)
        else:
            rows = (-1,)
        # Returning the final result
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
            if (numberPanelsX * numberPanelsY == len(templateString.split(";"))) and len(templateString) != 2:
                cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' OR permissions LIKE '%designer%');")
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

# Endpoint to add template categories to existing template
@app.route('/addtemplatecategories')
def addTemplateCategories():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    templateId = request.args.get('templateId', default='null', type=int)
    templateCategories = request.args.get('templateCategories', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and templateId != -1 and templateCategories != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' OR permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM templates WHERE id = {};".format(templateId))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE templates set category = {} where id = {};".format(templateCategories, templateId))
                    conn.commit()
                    row = (1,)
                # No panel to add string to
                else:
                    rows = (-3,)
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


# Endpoint to delete template 
@app.route('/deletetemplate')
def deleteTemplate():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    templateId = request.args.get('templateId', default='null', type=int)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and templateId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM templates WHERE id = {}".format(templateId))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("DELETE FROM templates where id = {}".format(templateId))
                    conn.commit()
                    row = (1,)
                # No panel to delete
                else:
                    rows = (-3,)
            else:
                rows = (-2,)
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
            cur.execute("SELECT * FROM templates order by id;")
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
        cur.execute("SELECT id,first_name,last_name,email,permissions,created_at FROM users;")
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
        cur.execute("SELECT * FROM orders order by order_datetime, id;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/userorders')
def getUserOrders():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + ";")
            rows = cur.fetchall()
            if len(rows) > 0:
                if "admin" in rows[0][5] or "production" in rows[0][5]:
                    cur.execute("SELECT * FROM orders order by order_datetime, id;")
                else:
                    cur.execute("SELECT * FROM orders WHERE user_email = " + email + " order by order_datetime, id;")
                rows = cur.fetchall()
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
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
    frameColor = request.args.get('frameColor', default='666666', type=str)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' or (streetAddress != 'null' and city != 'null' and state != 'null' and country != 'null'):
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + ";")
            rows = cur.fetchall()
            # User has been authenticated as a registered user
            if len(rows) > 0:
                cur.execute("""
                INSERT INTO orders(user_email, selected_divider_type, unit_choice, window_width, 
                window_height, horizontal_dividers, vertical_dividers, divider_width, template_id, 
                panel_coloring_string, street_address, city, state, zipcode, country, bottom_sash_width, bottom_sash_height, status, frame_color) 
                VALUES({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 'Saved', {})""".format(
                email, selectedDividerType, unitChoice, windowWidth, windowHeight,
                horzDividers, vertDividers, dividerWidth, templateID, panelColoringString, 
                streetAddress, city, state, zipcode, country, bottomWindowWidth, bottomWindowHeight, frameColor))
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

def isCouponCodeValid(couponCode, totalArea, numAvailable):
    if numAvailable > 0:
        if "coasters_" in couponCode and totalArea == 1:
            return True
        if "lightcatcher_" in couponCode and totalArea == 2:
            return True
        if "coasters_" not in couponCode and "lightcatcher_" not in couponCode and couponCode.find("sq") != -1:
            startNum = int(couponCode[0:couponCode.find("sq")])
            maxSize = (startNum*12*25.4)*(startNum*12*25.4)
            if totalArea <= maxSize:
                return True
        return False
    return False

def getLightScreenPrice(totalArea):
    finalArea = totalArea
    # Coaster
    if totalArea == 1:
        finalArea = 41290.2
    # Lightcatcher
    elif totalArea == 2:
        finalArea = 92903
    costPerSqMM = 30 / 92903
    finalPrice = costPerSqMM * finalArea * 100
    if finalPrice < 3000:
        finalPrice = 3000
    return round(finalPrice)


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
    frameColor = request.args.get('frameColor', default='666666', type=str)
    couponCode = request.args.get('couponCode', default='null', type=str)
    totalArea = request.args.get('totalArea', default='null', type=float)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' or (streetAddress != 'null' and city != 'null' and state != 'null' and country != 'null'):
            # Checking if couponCode is valid and works with this order
            cur.execute("SELECT * from coupon_codes where order_id is null and code = '{}';".format(couponCode))
            rows = cur.fetchall()
            numAvailable = len(rows)
            # User has a kickstarter code to use
            if isCouponCodeValid(couponCode, totalArea, numAvailable):
                cur.execute("""
                INSERT INTO orders(user_email, selected_divider_type, unit_choice, window_width, 
                window_height, horizontal_dividers, vertical_dividers, divider_width, template_id, 
                panel_coloring_string, street_address, city, state, zipcode, country, bottom_sash_width, bottom_sash_height, status, frame_color) 
                VALUES({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 'Purchased', {}) RETURNING id;""".format(
                email, selectedDividerType, unitChoice, windowWidth, windowHeight,
                horzDividers, vertDividers, dividerWidth, templateID, panelColoringString, 
                streetAddress, city, state, zipcode, country, bottomWindowWidth, bottomWindowHeight, frameColor))
                rows = cur.fetchall()
                conn.commit()
                cur.execute("UPDATE coupon_codes set order_id = {} where code = '{}';".format(int(rows[0][0]), couponCode))
                cur.execute("SELECT * from coupon_codes where order_id = {} and code = '{}';".format(int(rows[0][0]), couponCode))
                rows = cur.fetchall()
                conn.commit()
                if len(rows) > 0:
                    return redirect("https://lightscreenart.com/orderSuccess", code=302)
                else:
                    return redirect("https://lightscreenart.com/orderFailure", code=302)
            # User is checking out using stripe
            elif couponCode == "stripe":
                cur.execute("""
                INSERT INTO orders(user_email, selected_divider_type, unit_choice, window_width, 
                window_height, horizontal_dividers, vertical_dividers, divider_width, template_id, 
                panel_coloring_string, street_address, city, state, zipcode, country, bottom_sash_width, bottom_sash_height, status, frame_color) 
                VALUES({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, 'Saved', {}) RETURNING id;""".format(
                email, selectedDividerType, unitChoice, windowWidth, windowHeight,
                horzDividers, vertDividers, dividerWidth, templateID, panelColoringString, 
                streetAddress, city, state, zipcode, country, bottomWindowWidth, bottomWindowHeight, frameColor))
                rows = cur.fetchall()
                conn.commit()

                # Creating checkout session and adding order id to metadata
                checkout_session = stripe.checkout.Session.create(
                    shipping_address_collection={"allowed_countries": ["US"]},
                    shipping_options=[{"shipping_rate": "shr_1NBr3dJm14hg4HLn2eNPaz5J"}],
                    line_items=[{
                        "price_data": {
                            "currency":"usd",
                            "product_data":{"name":"Custom LightScreen"},
                            "unit_amount":getLightScreenPrice(totalArea),
                        },
                        "quantity":1,
                    },],
                    automatic_tax= {
                        'enabled': True,
                    },
                    payment_intent_data={"metadata":{"orderID":int(rows[0][0]),},},
                    mode='payment',
                    success_url="https://backend-dot-lightscreendotart.uk.r.appspot.com/stripeordercomplete?orderId={}&orderStatus=1".format(int(rows[0][0])),
                    cancel_url="https://backend-dot-lightscreendotart.uk.r.appspot.com/stripeordercomplete?orderId={}&orderStatus=0".format(int(rows[0][0])),
                )
                return redirect(checkout_session.url, code=302)
            else:
                return redirect("https://lightscreenart.com/orderSuccess", code=302)
        else:
            return redirect("https://lightscreenart.com/orderSuccess", code=302)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return redirect("https://lightscreenart.com/orderSuccess", code=302)

# Return endpoint for stripe order checkout
@app.route('/stripeordercomplete')
def stripeOrderComplete():
    global conn
    # 0 -> cancelled , 1 -> success
    orderId = request.args.get('orderId', default=0, type=int)
    orderStatus = request.args.get('orderStatus', default=0, type=int)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if orderId != 0 and orderStatus == 1:
            cur.execute("SELECT * FROM orders WHERE id = {};".format(orderId))
            rows = cur.fetchall()
            # Order is in the database and payment worked so updating to Purchased
            if len(rows) > 0:
                cur.execute("UPDATE orders set status = 'Purchased' where id = {};".format(orderId))
                conn.commit()
                return redirect("https://lightscreenart.com/orderSuccess", code=302)
            else:
                return redirect("https://lightscreenart.com/orderFailure", code=302)
        else:
            return redirect("https://lightscreenart.com/orderFailure", code=302)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return redirect("https://lightscreenart.com/orderFailure", code=302)

# Endpoint to update order status
@app.route('/updateorderstatus')
def updateOrderStatus():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    orderId = request.args.get('orderId', default=-1, type=int)
    status = request.args.get('status', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and orderId != -1 and (status == "Saved" or status == "Purchased" or status == "Production" or status == "Shipped"):
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' OR permissions LIKE '%production%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or production
            if len(rows) > 0:
                cur.execute("SELECT * FROM orders WHERE id = {}".format(orderId))
                rows = cur.fetchall()
                # Order exists
                if len(rows) > 0:
                    cur.execute("UPDATE orders set status = '{}' WHERE id = {}".format(status, orderId))
                    conn.commit()
                    row = (1,)
                # No order to update
                else:
                    rows = (-3,)
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Endpoint to delete order 
@app.route('/deleteorder')
def deleteOrder():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    orderId = request.args.get('orderId', default=-1, type=int)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and orderId != -1:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM orders WHERE id = {}".format(orderId))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("DELETE FROM orders WHERE id = {}".format(orderId))
                    conn.commit()
                    row = (1,)
                # No panel to delete
                else:
                    rows = (-3,)
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Adds a new user with a temporary password and sends a confirmation email
def addTempUser(email):
    global conn

    # Generating random password 15 characters
    randPassword = secrets.token_urlsafe(15)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()

        cur.execute("INSERT INTO users(first_name, last_name, email, password, permissions) VALUES('Temporary', 'User', '" + email + "', MD5('" + randPassword + "'), 'basic');")
        cur.execute("SELECT * FROM users WHERE email = '" + email + "' AND password = MD5('" + randPassword + "');")
        rows = cur.fetchall()
        conn.commit()
        try:
            msg = Message('New LightScreen User', sender = 'info@lightscreenart.com', recipients = [email])
            msg.body = "Congratulations! You're now a registered user with lightscreenart.com. Your temporary password is below.\n\nTemporary Password: {}".format(randPassword)
            mail.send(msg)
            # Returning the final result
            return rows
        except Exception as e:
            return ("Error sending the message " + str(e), )
    except Exception as e:
        return ("Error connecting to the database " + str(e), )


# Endpoint to send an email through contact form
@app.route("/submitcontactform", methods = ['POST'])
def index():
    global conn
    data = request.get_json()
    email = data.get('email')
    name = data.get('name')
    message = data.get('message')
    
    try:
        msg = Message('Contact Form Submission', sender = 'info@lightscreenart.com', recipients = ['logan.richards@lightscreenart.com', 'willow.mattison@lightscreenart.com', 'ron.seide@lightscreenart.com', 'info@lightscreenart.com'])
        msg.body = "Name: {}\nEmail: {}\nMessage: {}".format(name, email, message)
        mail.send(msg)

        # Checking to see if we need to create a new user account
        try:
            conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
            cur = conn.cursor()
            if email != 'null':
                cur.execute("SELECT * FROM users WHERE email = '" + email + "';")
                rows = cur.fetchall()
                # User has been authenticated as already having an account
                if len(rows) > 0:
                    rows = (-1, )
                else:
                    rows = addTempUser(email)
            else:
                rows = (-2,)
            # Returning the final result
            return jsonify(rows)
        except Exception as e:
            return "Error connecting to the database " + str(e)
    except Exception as e:
        return "Error sending the message " + str(e)

# Generates a new coupon code with a certain codePrefix
@app.route('/generatecouponcode')
def generateCouponCode():
    global conn

    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    codePrefix = request.args.get('codePrefix', default='null', type=str)

    # Generating coupon code with '_' and 15 random characters after prefix
    fullCouponCode = codePrefix + "_" + secrets.token_urlsafe(15)
    uniqueCode = False

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                if codePrefix != 'null':
                    while not uniqueCode:
                        cur.execute("SELECT * FROM coupon_codes WHERE code = '" + fullCouponCode + "';")
                        rows = cur.fetchall()
                        # Code already exists in db so generating new one until unique
                        if len(rows) > 0:
                            fullCouponCode = codePrefix + "_" + secrets.token_urlsafe(15)
                        # Code is unique and will work
                        else:
                            cur.execute("INSERT INTO coupon_codes(code) VALUES('" + fullCouponCode + "');")
                            cur.execute("SELECT * FROM coupon_codes WHERE code = '{}'".format(fullCouponCode))
                            rows = cur.fetchall()
                            conn.commit()
                            uniqueCode = True
                else:
                    rows = (-3,)
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)
    

# Gets all user coupon codes
@app.route('/getusercouponcodes')
def getUserCouponCodes():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + ";")
            rows = cur.fetchall()
            # User has been authenticated
            if len(rows) > 0:
                cur.execute("SELECT * FROM coupon_codes WHERE email = " + email + ";")
                rows = cur.fetchall()
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Adds user coupon code
@app.route('/addusercouponcode')
def addUserCouponCode():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    couponCode = request.args.get('couponCode', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and couponCode != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + ";")
            rows = cur.fetchall()
            # User has been authenticated
            if len(rows) > 0:
                cur.execute("SELECT * FROM coupon_codes WHERE email is null and code = '{}';".format(couponCode))
                rows = cur.fetchall()
                # Coupon code exists and hasn't been used
                if len(rows) > 0:
                    cur.execute("UPDATE coupon_codes SET email = " + email + " WHERE code = '{}';".format(couponCode))
                    conn.commit()
                    cur.execute("SELECT * FROM coupon_codes WHERE email = " + email + " and code = '{}';".format(couponCode))
                    rows = cur.fetchall()
                # Either doesn't exist or was already used
                else:
                    rows = (-3,)
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


if __name__ == '__main__':
    from waitress import serve
    serve(app)
