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
from flask_app import app
from flask import Flask, render_template, request, jsonify
from character_data import (
    get_character_assets, get_character_bookmarks, get_character_calendar,
    get_character_contacts, get_character_mail, get_character_market_contracts,
    get_character_market_history, get_character_skills,
    get_character_wallet, get_mail_body
)
from recruitment import (
    get_questions, get_answers, recruiter_claim_applicant,
    recruiter_release_applicant, escalate_applicant, reject_applicant,
    edit_applicant_notes, get_applicant_notes, get_applicant_list
)
from admin import get_users
import asyncio
from auth import login_manager, login, ensure_has_access
from flask_login import login_required, current_user
from user_data import get_character_data_list


@app.route(
    '/api/recruiter/<int:recruiter_id>/<int:applicant_id>/claim', methods=['GET'])
@login_required
def api_claim_applicant(recruiter_id, applicant_id):
    # TODO: be sure to check that the applicant is in fact an unclaimed applicant
    return jsonify(recruiter_claim_applicant(recruiter_id, applicant_id))


@app.route(
    '/api/recruiter/<int:recruiter_id>/<int:applicant_id>/release', methods=['GET'])
def api_release_applicant(recruiter_id, applicant_id):
    ensure_has_access(current_user.get_id(), applicant_id)
    return recruiter_release_applicant(recruiter_id, applicant_id)


@app.route(
    '/api/applicant/<int:applicant_id>/escalate', methods=['GET'])
def api_escalate_applicant(applicant_id):
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(escalate_applicant(applicant_id))


@app.route('/api/applicant/<int:applicant_id>/reject', methods=['GET'])
def api_reject_applicant(applicant_id):
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(reject_applicant(applicant_id))


@app.route(
    '/api/applicant/<int:applicant_id>/edit_notes', methods=['PUT'])
def api_edit_applicant_notes(applicant_id):
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(edit_applicant_notes(applicant_id, text=request.form['text']))


@app.route('/api/applicant_list')
def api_get_applicant_list():
    return jsonify(get_applicant_list())


@app.route('/api/user/<int:user_id>/characters')
def api_get_user_character_list(user_id):
    ensure_has_access(current_user.get_id(), user_id)
    return jsonify(get_character_data_list(user_id))


@app.route('/api/character/<int:character_id>/assets', methods=['GET'])
def api_character_assets(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_assets(character_id))


@app.route('/api/character/<int:character_id>/bookmarks', methods=['GET'])
def api_character_bookmarks(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_bookmarks(character_id))


@app.route('/api/character/<int:character_id>/calendar', methods=['GET'])
def api_character_calendar(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_calendar(character_id))


@app.route('/api/character/<int:character_id>/contacts', methods=['GET'])
def api_character_contacts(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_contacts(character_id))


@app.route('/api/character/<int:character_id>/mail', methods=['GET'])
def api_character_mail(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_mail(character_id))


@app.route('/api/character/<int:character_id>/market_contracts', methods=['GET'])
def api_character_market_contracts(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_market_contracts(character_id))


@app.route('/api/character/<int:character_id>/market_history', methods=['GET'])
def api_character_market_history(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_market_history(character_id))


@app.route('/api/character/<int:character_id>/skills', methods=['GET'])
def api_character_skills(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_skills(character_id))


@app.route('/api/character/<int:character_id>/wallet', methods=['GET'])
def api_character_wallet(character_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_wallet(character_id))


@app.route('/api/character/<int:character_id>/mail/<int:mail_id>', methods=['GET'])
def api_mail_body(character_id, mail_id):
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_mail_body(character_id, mail_id))


@app.route('/api/questions')
def api_questions():
    return jsonify(get_questions())


@app.route('/api/answers/<int:user_id>')
def api_user_answers(user_id):
    ensure_has_access(current_user.get_id(), user_id, self_access=True)
    return jsonify(get_answers(user_id))


@app.route('/api/admin/users')
def api_users():
    return jsonify(asyncio.run(get_users()))


@app.errorhandler(500)
def api_server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]