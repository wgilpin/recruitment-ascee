from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# [START create_app]
app = Flask(__name__, static_folder="public/static", template_folder="public")
# [END create_app]
app.secret_key = os.environ['APP_SECRET_KEY']

