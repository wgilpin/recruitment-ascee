# [START app]
# [START imports]
import os
os.environ['CURRENT_ENV'] = 'localhost'
from e2e_data import initDbForE2e
import main
from flask_app import app
from models import db


def run_app():
    basedir = os.path.abspath(os.path.dirname(__file__))
    sqlite_location = os.path.join(basedir, 'data.sqlite')
    if os.path.exists(sqlite_location):
        os.remove(sqlite_location)
    print('Sqlite:', sqlite_location)
    app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + sqlite_location
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        initDbForE2e(wipe=True)
        app.run(host='localhost', port='8080')


if __name__ == '__main__':
    run_app()
