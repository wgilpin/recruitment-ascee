# [START app]
# [START imports]
from e2e_data import initDbForE2e
from main import run_app
from flask_app import app
from flask import render_template, send_from_directory
from models import db
from login import login_manager
from main import CustomJSONEncoder
import os
import recruitment
import character

# [END app]


def run_app():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.json_encoder = CustomJSONEncoder
    with app.app_context():
        db.init_app(app)
        db.create_all()
        initDbForE2e()
        app.run(host='localhost', port='8080')

if __name__ == '__main__':
    run_app()
