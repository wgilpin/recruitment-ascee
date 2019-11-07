from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
# [START create_app]
app = Flask(__name__, static_folder="public/static", template_folder="public")
# [END create_app]

if 'APP_SECRET_KEY' in os.environ:
    app.secret_key = os.environ['APP_SECRET_KEY']
else:
    app.secret_key = b'\xc1b\xe2\xfd\xa2\xd4AG}\xfep\x9c*Fq.'

