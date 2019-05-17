# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START app]
# [START imports]
import logging
from flask_app import app
from flask import send_from_directory
from login import route_to_app_home
from models import db, init_db
import os
import routes
from esi_config import database_url
from flask_login import current_user

app.url_map.strict_slashes = False

# Serve React App
@app.route('/')
def serve():
    if current_user.is_authenticated:
        return route_to_app_home()  # will redirect a logged-in user
    else:
        return send_from_directory('public', 'index.html')


@app.route('/app', defaults={'path': ''})
@app.route('/app/<path:path>')
def serve_root(path):
    if path != "" and os.path.exists("public/" + path):
        return send_from_directory('public', path)
    elif path == '' and current_user.is_authenticated:
        return route_to_app_home()  # will redirect a logged-in user
    else:
        return send_from_directory('public', 'index.html')


@app.route('/static/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    return send_from_directory(os.path.join(root_dir, 'static', 'js'), filename)


@app.errorhandler(500)
def api_server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]


def run_app():
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', database_url)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    with app.app_context():
        db.init_app(app)
        db.create_all()
        app.run(host='0.0.0.0', port='80')


if __name__ == '__main__':
    run_app()
