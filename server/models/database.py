from flask_sqlalchemy import SQLAlchemy
from flask_app import app
from flask_migrate import Migrate, MigrateCommand

db = SQLAlchemy()
migrate = Migrate(app, db)


def init_db():
    db.create_all()
