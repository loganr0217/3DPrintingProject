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
    colorHexDark = request.args.get('hexDark', default='null', type=str)
    colorOpacityDark = request.args.get('opacityDark', default=1, type=float)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and colorHex != 'null' and len(str(colorHex).replace("'", "")) == 6:
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0 and not (colorHex == 'null' and colorHexDark == 'null'):
                if colorHex != 'null' and colorHexDark != 'null':
                    cur.execute("INSERT INTO pane_colors(name, hex, hex_dark, is_available, placement_id, opacity, opacity_dark) VALUES({}, {}, {}, {}, {});".format(colorName, colorHex, colorHexDark, isAvailable, placementID, colorOpacity, colorOpacityDark))
                elif colorHex != 'null':
                    cur.execute("INSERT INTO pane_colors(name, hex, is_available, placement_id, opacity) VALUES({}, {}, {}, {}, {});".format(colorName, colorHex, isAvailable, placementID, colorOpacity))
                else:
                    cur.execute("INSERT INTO pane_colors(name, hex_dark, is_available, placement_id, opacity_dark) VALUES({}, {}, {}, {}, {});".format(colorName, colorHexDark, isAvailable, placementID, colorOpacityDark))

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
    colorHexDark = request.args.get('hexDark', default='null', type=str)
    colorOpacityDark = request.args.get('opacityDark', default=1, type=float)

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
                if len(rows) > 0 and not (colorHex == 'null' and colorHexDark == 'null'):
                    if colorHex != 'null' and colorHexDark != 'null':
                        cur.execute("UPDATE pane_colors set name = {}, hex = {}, hex_dark = {} ,is_available = {}, placement_id = {}, opacity = {}, opacity_dark = {} where id = {};".format(colorName, colorHex, colorHexDark, isAvailable, placementID, colorOpacity, colorOpacityDark, realID))
                    elif colorHex != 'null':
                        cur.execute("UPDATE pane_colors set name = {}, hex = {}, is_available = {}, placement_id = {}, opacity = {} where id = {};".format(colorName, colorHex, isAvailable, placementID, colorOpacity, realID))
                    else:
                        cur.execute("UPDATE pane_colors set name = {}, hex_dark = {}, is_available = {}, placement_id = {}, opacity_dark = {} where id = {};".format(colorName, colorHexDark, isAvailable, placementID, colorOpacityDark, realID))
                    
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

# Endpoint to get the full list of palletes
@app.route('/palletes')
def getPalletes():
    global conn
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        cur.execute("SELECT * FROM palletes;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/addpallete')
def addPallete():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    palleteColorString = request.args.get('palleteColorString', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("INSERT INTO palletes(pallete_colors) VALUES({})".format(palleteColorString))
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

# Endpoint to add pallete categories to existing pallete
@app.route('/addpalletecategories')
def addPalleteCategories():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    palleteId = request.args.get('palleteId', default='null', type=int)
    palleteCategories = request.args.get('palleteCategories', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and palleteId != -1 and palleteCategories != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' OR permissions LIKE '%designer%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or a designer
            if len(rows) > 0:
                cur.execute("SELECT * FROM palletes WHERE id = {};".format(palleteId))
                rows = cur.fetchall()
                # Panel already exists in that location
                if len(rows) > 0:
                    cur.execute("UPDATE palletes set category = {} where id = {};".format(palleteCategories, palleteId))
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

@app.route('/saveorder', methods = ['POST', 'GET'])
def saveOrder():
    global conn
    if request.method == 'POST':
        data = request.get_json()
    
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
    # Getting panelColoringString
    if request.method == 'GET':
        panelColoringString = request.args.get('panelColoringString', default='null', type=str)
    else:
        panelColoringString = data.get('panelColoringString')
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
                VALUES({}, {}, {}, {}, {}, {}, {}, {}, {}, '{}', {}, {}, {}, {}, {}, {}, {}, 'Saved', {})""".format(
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
        if "coasters_" not in couponCode and "lightcatcher_" not in couponCode and couponCode.find("sqFt") != -1:
            startNum = int(couponCode[0:couponCode.find("sqFt")])
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
    # 29 is for $29/sqft
    costPerSqMM = 29 / 92903
    finalPrice = costPerSqMM * finalArea * 100
    if finalPrice < 2900:
        finalPrice = 2900
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
                orderId = int(rows[0][0])
                cur.execute("UPDATE coupon_codes set order_id = {} where code = '{}';".format(orderId, couponCode))
                cur.execute("SELECT * from coupon_codes where order_id = {} and code = '{}';".format(orderId, couponCode))
                rows = cur.fetchall()
                conn.commit()
                # Order was successfully placed
                if len(rows) > 0:
                    cur.execute("SELECT first_name FROM users WHERE email = {}".format(email))
                    rows = cur.fetchall()
                    userFirstName = rows[0][0]
                    # Sending email letting user know the order has been placed
                    try:
                        msg = Message("We've Receieved Your Order!", sender = 'info@lightscreenart.com', recipients = [email.replace("'","")])
                        msg.body = """Dear {} -\n\nThank you for placing your order with LightScreen Art! This is to confirm that we've received your order and are now scheduling it for production. For your reference, your order number is {}.\n\nOur production team, our laser cutters and our 3D printers are working as fast as humanly (and robotically!) possible to get you your lightscreen. We'll send you an email when your order is in production and we'll send another email shortly after it ships.\n\nIf you have any questions or comments while you're waiting for your lightscreen, just email us at help@lightscreenart.com and reference your order number above. We're here to help and will get back to you within 24 hours.\n\nThank you for your support during our Kickstarter campaign!\n\nWith color and light,\n\nThe LightScreen Art Team
                        """.format(userFirstName, orderId)
                        mail.send(msg)
                        # Returning the final result
                        return redirect("https://lightscreenart.com/orderSuccess", code=302)
                    except Exception as e:
                        return redirect("https://lightscreenart.com/orderSuccess", code=302)
                    return redirect("https://lightscreenart.com/orderSuccess", code=302)
                # Error placing order
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
                orderId = int(rows[0][0])
                cur.execute("SELECT permissions FROM users WHERE email = {}".format(email))
                rows = cur.fetchall()
                userPermissions = rows[0][0]
                
                # Creating checkout session and adding order id to metadata
                checkout_session = stripe.checkout.Session.create(
                    shipping_address_collection={"allowed_countries": ["US"]},
                    shipping_options=[{"shipping_rate": "shr_1NJMLUJm14hg4HLno4Cm4jQD"}],
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
                    payment_intent_data={"metadata":{"orderID":orderId,},},
                    mode='payment',
                    discounts= [{
                        'coupon': 'uteJNO0N',
                    }] if "dealer" in userPermissions or "admin" in userPermissions else [{}],
                    success_url="https://backend-dot-lightscreendotart.uk.r.appspot.com/stripeordercomplete?orderId={}&orderStatus=1".format(orderId),
                    cancel_url="https://backend-dot-lightscreendotart.uk.r.appspot.com/stripeordercomplete?orderId={}&orderStatus=0".format(orderId),
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
            cur.execute("SELECT user_email FROM orders WHERE id = {};".format(orderId))
            rows = cur.fetchall()
            # Order is in the database and payment worked so updating to Purchased
            if len(rows) > 0:
                userEmail = rows[0][0]
                cur.execute("UPDATE orders set status = 'Purchased' where id = {};".format(orderId))
                conn.commit()
                cur.execute("SELECT first_name FROM users WHERE email = '{}'".format(userEmail))
                rows = cur.fetchall()
                userFirstName = rows[0][0]
                # Sending email letting user know the order has been placed
                try:
                    msg = Message("We've Receieved Your Order!", sender = 'info@lightscreenart.com', recipients = [userEmail])
                    msg.body = """Dear {} -\n\nThank you for placing your order with LightScreen Art! This is to confirm that we've received your order and are now scheduling it for production. For your reference, your order number is {}.\n\nOur production team, our laser cutters and our 3D printers are working as fast as humanly (and robotically!) possible to get you your lightscreen. We'll send you an email when your order is in production and we'll send another email shortly after it ships.\n\nIf you have any questions or comments while you're waiting for your lightscreen, just email us at help@lightscreenart.com and reference your order number above. We're here to help and will get back to you within 24 hours.\n\nWith color and light,\n\nThe LightScreen Art Team
                    """.format(userFirstName, int(orderId))
                    mail.send(msg)
                    # Returning the final result
                    return jsonify(rows)
                except Exception as e:
                    return redirect("https://lightscreenart.com/orderSuccess", code=302)
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
    notify = request.args.get('notify', default=0, type=int)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and orderId != -1 and (status == "Saved" or status == "Purchased" or status == "Production" or status == "Shipped"):
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%' OR permissions LIKE '%production%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin or production
            if len(rows) > 0:
                cur.execute("SELECT user_email FROM orders WHERE id = {}".format(int(orderId)))
                rows = cur.fetchall()
                userEmail = rows[0][0]
                cur.execute("SELECT first_name FROM users WHERE email = '{}'".format(userEmail))
                rows = cur.fetchall()
                userFirstName = rows[0][0]
                # Order exists
                if len(rows) > 0:
                    cur.execute("UPDATE orders set status = '{}' WHERE id = {}".format(status, int(orderId)))
                    conn.commit()
                    subject = "LightScreen Status Update"
                    body = "Your LightScreen order (id: {}) status has been updated to {}".format(int(orderId), status)
                    if status == "Production":
                        subject = "Your Order is in Production"
                        body = """Dear {} -\n\nGreat news! Your LightScreen order is now in production.\n\nAs you may be aware, lightscreens are custom produced at our facility in Akron, Ohio with laser cutters and 3D printers. We find digital manufacturing to be fascinating and think that you might too.\n\nTo get an idea of how our production process works, our TikTok page (https://www.tiktok.com/@lightscreen.art) has dozens of videos from our staff showing everything from laser cutting panes, to printing frames to our “guerrilla decorating” campaign. These videos are a snapshot into what it means to apply 21st century manufacturing to an ancient art form. If you're not a TikTok fan, we've reposted most of our production videos to our Instagram Reels (https://www.instagram.com/lightscreen.art/reels/).\n\nIf you have any questions or just want to check up on our progress, email us at help@lightscreenart.com and reference your order number, {}. We'll get back to you within 24 hours.\n\nThank you again for supporting LightScreen Art. We'll send you another email to let you know that your order shipped along with a link to some installation tips.\n\nWith color and light,\n\nThe LightScreen Art Team
                        """.format(userFirstName, int(orderId))
                    elif status == "Shipped":
                        subject = "Your LightScreen has Shipped!"
                        body = """Dear {} -\n\nThis is to confirm that your lightscreen has shipped!\n\nWe've made installing your lightscreen as easy as it was to design it. But while you're waiting for your order to arrive, you might want to see how the process works. You can check out our installation video and instructions here (https://lightscreenart.com/tutorials). If you have any questions at all about your lightscreen and how to install it, email us at help@lightscreenart.com and we'll get back to you within 24 hours.\n\nWhen you've installed your lightscreen you may find that you want to show it to the world. Social media is a great place to do that. If you send us a link to your posts we'll be sure to like them!\n\nThank you for supporting LightScreen Art. We hope you enjoy your lightscreen as much as we've enjoyed building your creation just for you.\n\nWith color and light,\n\nThe LightScreen Art Team
                        """.format(userFirstName)
                    if notify == 1:
                        # Sending email to user if notify parameter is on
                        try:
                            msg = Message(subject, sender = 'info@lightscreenart.com', recipients = [userEmail])
                            msg.body = body
                            mail.send(msg)
                            # Returning the final result
                            return jsonify(rows)
                        except Exception as e:
                            return ("Error sending the message " + str(e), )
                    rows = (1,)
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
def submitContactForm():
    global conn
    data = request.get_json()
    email = data.get('email')
    location = data.get('location')
    name = data.get('name')
    message = data.get('message')

    emailSubject = 'Contact Form Submission'
    if location == 'ContactForm':
        emailSubject = 'Contact Form Submission'
    elif location == 'landingPage':
        emailSubject = 'Landing Page'
    elif location == 'step0':
        emailSubject = 'Step 0'
    
    try:
        msg = Message(emailSubject, sender = 'info@lightscreenart.com', recipients = ['logan.richards@lightscreenart.com', 'willow.mattison@lightscreenart.com', 'ron.seide@lightscreenart.com', 'info@lightscreenart.com'])
        msg.body = "Name: {}\nEmail: {}\nMessage: {}".format(name, email, message)
        if location != 'ContactForm':
            msg.body = "Email: {}".format(email)
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

# Endpoint to change user's first or last name
@app.route('/updateUserInfo')
def updateUserInfo():
    global conn
    firstname = request.args.get('firstname', default='null', type=str)
    lastname = request.args.get('lastname', default='null', type=str)
    email = request.args.get('email', default='null', type=str).lower()
    password = request.args.get('password', default='null', type=str)

    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and email != '':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + ";")
            rows = cur.fetchall()
            # User already has an account with that email
            if len(rows) > 0:
                cur.execute("UPDATE users set first_name = {}, last_name = {} WHERE email = {}".format(firstname, lastname, email))
                cur.execute("SELECT * FROM users WHERE email = " + email + ";")
                rows = cur.fetchall()
                conn.commit()
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Endpoint to update user permissions 
@app.route('/updateuserpermissions')
def updateUserPermissions():
    global conn
    email = request.args.get('email', default='null', type=str)
    password = request.args.get('password', default='null', type=str)
    userId = request.args.get('userId', default=-1, type=int)
    newPermissions = request.args.get('permissions', default='null', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if email != 'null' and password != 'null' and userId != -1 and newPermissions != 'null':
            cur.execute("SELECT * FROM users WHERE email = " + email + " AND password = " + password + " AND (permissions LIKE '%admin%');")
            rows = cur.fetchall()
            # User has been authenticated as an admin
            if len(rows) > 0:
                cur.execute("SELECT * FROM users WHERE id = {}".format(userId))
                rows = cur.fetchall()
                # User already exists
                if len(rows) > 0:
                    cur.execute("UPDATE USERS SET permissions = {} WHERE id = {}".format(newPermissions, userId))
                    conn.commit()
                    row = (1,)
                # No user to update
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

# Endpoint to start a new session and get the id for it
@app.route('/startsession')
def startSession():
    global conn
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        
        cur.execute(" INSERT INTO sessions(last_step_id) VALUES(-1) RETURNING id;")
        rows = cur.fetchall()
        conn.commit()

        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

# Updates session info
@app.route('/updatesession')
def updateSession():
    global conn
    sessionID = request.args.get('sessionID', default=-10, type=int)
    lastStepID = request.args.get('lastStepID', default=-10, type=int)
    userEmail = request.args.get('userEmail', default='undefined', type=str)
    startingURL = request.args.get('startingURL', default='undefined', type=str)
    
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        if sessionID != -10 and lastStepID != -10:
            cur.execute("SELECT * FROM sessions WHERE id = {};".format(sessionID))
            rows = cur.fetchall()
            # Session does exist
            if len(rows) > 0:
                if userEmail != 'undefined' and 'lrichards0217@gmail.com' in userEmail:
                    pass
                elif userEmail != 'undefined':
                    cur.execute("UPDATE sessions SET last_step_id = {}, starting_url = {}, user_email = {} where id = {};".format(lastStepID, startingURL, userEmail, sessionID))
                else:
                    cur.execute("UPDATE sessions SET last_step_id = {}, starting_url = {} where id = {};".format(lastStepID, startingURL, sessionID))
                conn.commit()
                rows = (1,)
            # Session is missing from database 
            else:
                rows = (-2,)
        else:
            rows = (-1,)
        # Returning the final result
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)

@app.route('/sessions')
def getSessions():
    global conn
    try:
        conn=psycopg2.connect("dbname='{}' user='{}' password='{}' host='{}'".format(db_name, db_user, db_password, db_connection_name))
        cur = conn.cursor()
        cur.execute("SELECT * FROM sessions;")
        rows = cur.fetchall()
        return jsonify(rows)
    except Exception as e:
        return "Error connecting to the database " + str(e)


if __name__ == '__main__':
    from waitress import serve
    serve(app)
