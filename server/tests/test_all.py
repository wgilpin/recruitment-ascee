import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from flask_app import app
from models import db
from test_admin_lists import *
from test_character_assets import *
from test_character_mail import *
from test_character_blueprints import *
from test_character_bookmarks import *
from test_character_calendar import *
from test_character_clones import *
from test_character_contacts import *
from test_character_corporation_history import *
from test_character_fittings import *
from test_character_industry import *
from test_character_locations import *
from test_character_mail import *
from test_character_market import *
from test_character_wallet import *
from test_character_summary import *
from test_images import *
from test_login import *
from test_mail import *
from test_recruitment import *
from test_roles import *
from test_search import *
from test_security import *
from test_status import *


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()
