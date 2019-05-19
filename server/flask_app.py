from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import logging
import sys


# [START create_app]
app = Flask(__name__, static_folder="public/static", template_folder="public")
# [END create_app]
app.secret_key = b'\xc1b\xe2\xfd\xa2\xd4AG}\xfep\x9c*Fq.'

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)
