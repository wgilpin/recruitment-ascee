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
from flask import render_template, send_from_directory, json
from models import db
import os
import sys
import pyswagger
from datetime import datetime, date
import routes
from esi_config import database_url

app.url_map.strict_slashes = False

# Serve React App


@app.route('/')
def serve():
    return send_from_directory('public', 'index.html')


@app.route('/app', defaults={'path': ''})
@app.route('/app/<path:path>')
def serve_root(path):
    if path != "" and os.path.exists("public/" + path):
        return send_from_directory('public', path)
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
    print(e)
    print(sys.exc_info())
    sys.stdout.flush()
    return 'An internal error occurred.', 500
# [END app]


def init_app():
    print('Initializing app for  WSGI')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', database_url)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    with app.app_context():
        db.init_app(app)
        db.create_all()
        # if os.environ.get('CURRENT_ENV', '') != 'heroku':
        #     app.run(host='localhost', port='8080')


if __name__ == '__main__':
    init_app()
