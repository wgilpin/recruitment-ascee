from flask_sqlalchemy import SQLAlchemy
from flask_app import app


db = SQLAlchemy()

def init_db():
    db.create_all()
