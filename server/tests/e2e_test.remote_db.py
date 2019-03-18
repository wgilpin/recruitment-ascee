# [START app]
# [START imports]
from e2e_data import initDbForE2e
import main
from flask_app import app
from models import db
from main import CustomJSONEncoder
import esi_config

# [END app]

def run_app():
    app.config['SQLALCHEMY_DATABASE_URI'] = esi_config.database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.json_encoder = CustomJSONEncoder
    with app.app_context():
        db.init_app(app)
        db.create_all()
        initDbForE2e(wipe=False)
        app.run(host='localhost', port='8080')


if __name__ == '__main__':
    run_app()
