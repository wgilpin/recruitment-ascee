from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
import esi_config
from flask_app import app
import models

manager = Manager(app)
manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = esi_config.database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    manager.run()
