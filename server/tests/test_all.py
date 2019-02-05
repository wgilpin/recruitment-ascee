import sys
import os
from config import server_dir
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from flask_app import app
from models import db
from test_recruitment import *
from test_character_mail import *
from test_security import *
from test_status import *
from test_character_calendar import *


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()
