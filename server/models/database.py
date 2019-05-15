from flask_sqlalchemy import SQLAlchemy
from flask_app import app
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate(app, db)


