# [START app]
# [START imports]
from e2e_data import initDbForE2e
import main
from flask_app import app
from models import db
import os


def run_app():
    basedir = os.path.abspath(os.path.dirname(__file__))
    sqlite_location = os.path.join(basedir, 'data.sqlite')
    if os.path.exists(sqlite_location):
        os.remove(sqlite_location)
    print('Sqlite:', sqlite_location)
    app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + sqlite_location
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    with app.app_context():
        db.init_app(app)
        db.create_all()
        initDbForE2e(wipe=True)
        app.run(host='localhost', port='8080')


if __name__ == '__main__':
    run_app()
