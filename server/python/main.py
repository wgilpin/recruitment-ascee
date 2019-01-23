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
import logging

# [START imports]
from flask import Flask, render_template, request, jsonify
from character_data import (
    get_character_assets, get_character_bookmarks, get_character_calendar,
    get_character_contacts, get_character_mail, get_character_market_contracts,
    get_character_market_history, get_character_skills,
    get_character_wallet, get_mail_body
)
from recruitment import get_questions, get_answers
from admin import get_users

# [START create_app]
app = Flask(__name__)
# [END create_app]

@app.route('/api/character/<int:character_id>/assets', methods=['GET'])
def character_assets(character_id):
    return jsonify(get_character_assets(character_id))


@app.route('/api/character/<int:character_id>/bookmarks', methods=['GET'])
def character_bookmarks(character_id):
    return jsonify(get_character_bookmarks(character_id))


@app.route('/api/character/<int:character_id>/calendar', methods=['GET'])
def character_calendar(character_id):
    return jsonify(get_character_calendar(character_id))


@app.route('/api/character/<int:character_id>/contacts', methods=['GET'])
def character_contacts(character_id):
    return jsonify(get_character_contacts(character_id))


@app.route('/api/character/<int:character_id>/mail', methods=['GET'])
def character_mail(character_id):
    return jsonify(get_character_mail(character_id))


@app.route('/api/character/<int:character_id>/market_contracts', methods=['GET'])
def character_market_contracts(character_id):
    return jsonify(get_character_market_contracts(character_id))


@app.route('/api/character/<int:character_id>/market_history', methods=['GET'])
def character_market_history(character_id):
    return jsonify(get_character_market_history(character_id))


@app.route('/api/character/<int:character_id>/skills', methods=['GET'])
def character_skills(character_id):
    return jsonify(get_character_skills(character_id))


@app.route('/api/character/<int:character_id>/wallet', methods=['GET'])
def character_wallet(character_id):
    return jsonify(get_character_wallet(character_id))


@app.route('/api/mail/<int:mail_id>', methods=['GET'])
def mail_body(mail_id):
    return jsonify(get_mail_body(mail_id))


@app.route('/api/questions', methods=['GET'])
def questions():
    return jsonify(get_questions())


@app.route('/api/answers/<int:user_id>')
def answers(user_id):
    return jsonify(get_answers(user_id))


@app.route('/api/admin/users')
def users():
    return jsonify(get_users())


@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]