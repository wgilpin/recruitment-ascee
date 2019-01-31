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
    """
    Assigns recruiter as the recruiter for a given unclaimed applicant.

    Args:
        recruiter_id (int): User key of recruiter
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully claimed

    Error codes:
        Forbidden (403): If recruiter_id is not a recruiter, or logged in user
            is not an admin, senior recruiter, or this particular recruiter
        Bad Request (400): If applicant_id is not an unclaimed applicant
    """
    # TODO: be sure to check that the applicant is in fact an unclaimed applicant
    return jsonify(recruiter_claim_applicant(recruiter_id, applicant_id))


@app.route(
    '/api/recruiter/<int:recruiter_id>/<int:applicant_id>/release', methods=['GET'])
@login_required
def api_release_applicant(recruiter_id, applicant_id):
    """
    Releases the claimed applicant from being claimed by a given recruiter.

    Args:
        recruiter_id (int): User key of recruiter
        applicant_id (int): User key of applicant claimed by recruiter

    Returns:
        {'status': 'ok'} if applicant is successfully released

    Error codes:
        Forbidden (403): If recruiter_id is not a recruiter, or logged in user
            is not an admin, senior recruiter, or this particular recruiter
        Bad Request (400): If applicant_id
            is not an applicant claimed by the recruiter
    """
    ensure_has_access(current_user.get_id(), applicant_id)
    return recruiter_release_applicant(recruiter_id, applicant_id)


@app.route(
    '/api/applicant/<int:applicant_id>/escalate', methods=['GET'])
@login_required
def api_escalate_applicant(applicant_id):
    """
    Sets a new applicant's status to "escalated".

    Args:
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully escalated

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant with "new" status
    """
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(escalate_applicant(applicant_id))


@app.route('/api/applicant/<int:applicant_id>/reject', methods=['GET'])
def api_reject_applicant(applicant_id):
    """
    Sets an applicant's status to "rejected".

    Args:
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully rejected

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(reject_applicant(applicant_id))


@app.route(
    '/api/applicant/<int:applicant_id>/edit_notes', methods=['PUT'])
def api_edit_applicant_notes(applicant_id):
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(edit_applicant_notes(applicant_id, text=request.form['text']))

@app.route('/api/applicant_list')
@login_required
def api_get_applicant_list():
    """
    Gets the list of all applicants, including accepted and rejected applicants.

    Returns:
        response (dict)

    Example:
        response = {
            'info': [
                {
                    'user_id': 1937622137,  # int character ID of user's main
                    'recruiter_id': 201837771,  # int character ID of recruiter's main
                    'recruiter_name': 'Recruiter Ralph',  # string name of recruiter
                    'status': 'new',  # one of 'new', 'escalated', 'accepted', 'rejected'
                },
                {
                    [...]
                }
            ]
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter or senior recruiter
    """
    return jsonify(get_applicant_list())


@app.route('/api/user/<int:user_id>/characters')
@login_required
def api_get_user_character_list(user_id):
    """
    Gets a list of all characters for a given user.

    Characters are redlisted if they are directly redlisted, or if they are
    in a corporation or alliance that is redlisted.

    Args:
        user_id: User key of a user

    Returns:
        response (dict)

    Example:
        response = {
            'info': {
                1937622137: {  # Character ID
                    'name': 'Applicant Abigail',  # character name
                    'corporation_name': 'Corporation Calico',  # corporation name
                    'redlisted': True,  # might only be present if redlisted.
                },
                [...]
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter,
            a recruiter who has claimed the given user, or the user themself
    """
    ensure_has_access(current_user.get_id(), user_id)
    return jsonify(get_character_data_list(user_id))


@app.route('/api/character/<int:character_id>/assets', methods=['GET'])
@login_required
def api_character_assets(character_id):
    """
    Gets assets for a given character.

    Assets are returned as nested dictionaries encoding location information.
    The first three levels are region, system, and station/structure. After
    that, additional levels are containers.

    Items will have attributes as returned by ESI. They will additionally have
    keys `type_name` and `price`.

    Locations will have the attributes `name` and, if redlisted, a key `redlisted`
    whose value is True.

    Items within regions and containers are stored in a key `items` whose
    value is a list.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Examples:
        # an attribute of an item:
        response[region_id]['items'][system_id]['items'][structure_id]['items'][item_id][attribute_name]

        # an attribute of an item in a container (e.g. Hangar)
        response[region_id]['items'][system_id]['items'][structure_id]['items'][container_name]['items'][item_id][attribute_name]

        # whether a region is redlisted:
        response[region_id]['redlisted']  # True/False

        # name of a region:
        response[region_id]['name']

        # name of a structure:
        response[region_id]['items'][system_id]['items'][structure_id]['name']

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_assets(character_id))


@app.route('/api/character/<int:character_id>/bookmarks', methods=['GET'])
@login_required
def api_character_bookmarks(character_id):
    """
    Get bookmarks for a given character.

    Returned dictionary is of the form
    {'info': [bookmark_1, bookmark_2, ...]}. Each bookmark is as returned by
    ESI, with the additional keys `folder_name` (if `folder_id` is present),
    `system_id`, and `system_name`.

    Bookmarks in redlisted locations will also have the key `redlisted`
    whose value is True.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_bookmarks(character_id))


@app.route('/api/character/<int:character_id>/calendar', methods=['GET'])
@login_required
def api_character_calendar(character_id):
    """
    Get calendar entries for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by
    ESI, with the additional key `redlisted` whose value is True if the entry
    is owned by a redlisted entity.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_calendar(character_id))


@app.route('/api/character/<int:character_id>/contacts', methods=['GET'])
@login_required
def api_character_contacts(character_id):
    """
    Get contacts for a given character.

    Returned dictionary is of the form
    {'info': [contact_1, contact_2, ...]}. Each contact is as returned by
    ESI, with the additional keys `name`, `corporation_id`, `corporation_name`,
    if in an alliance then `alliance_id` and `alliance_name`, and if
    redlisted then `redlisted` whose value is True.

    A contact is redlisted if they are redlisted directly or part of a
    redlisted corporation or alliance.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_contacts(character_id))


@app.route('/api/character/<int:character_id>/mail', methods=['GET'])
@login_required
def api_character_mail(character_id):
    """
    Get mail headers for a given character.

    Returned dictionary is of the form
    {'info': [mail_1, mail_2, ...]}. Each mail is as returned by
    ESI, with the additional key `from_name`, and if
    redlisted then `redlisted` whose value is True. Recipients have the
    additional key `recipient_name`.

    A mail is redlisted if any of the participants in the mail are redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_mail(character_id))


@app.route('/api/character/<int:character_id>/market_contracts', methods=['GET'])
@login_required
def api_character_market_contracts(character_id):
    """
    Get contracts for a given character.

    Returned dictionary is of the form
    {'info': [contract_1, contract_2, ...]}. Each contract is as returned by
    ESI, with the additional keys `items` (containing a list of item data, as
    returned by the contracts items endpoint with the additional key `type_name`),
    `issuer_corporation_name`, `issuer_name`, and `acceptor_name`. If
    `start_location_id` and `end_location_id` are present, will also include
    `start_location_name` and `end_location_name`. If redlisted then will
    include `redlisted` whose value is True.

    A contract is redlisted if it includes participants or items that are
    redlisted, or if it starts or ends at a redlisted location.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_market_contracts(character_id))


@app.route('/api/character/<int:character_id>/market_history', methods=['GET'])
@login_required
def api_character_market_history(character_id):
    """
    Get open and historical market orders for a given character.

    Returned dictionary is of the form
    {'info': [order_1, order_2, ...]}. Each order is as returned by
    ESI, with the additional keys `location_name`, `region_name`, `value`, and
    `type_name`. If redlisted then will include `redlisted` whose value is True.
    If the order is a buy order, `price` and `value` will be negative.

    An order is redlisted if it includes items that are redlisted, or is
    at a redlisted location.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_market_history(character_id))


@app.route('/api/character/<int:character_id>/skills', methods=['GET'])
@login_required
def api_character_skills(character_id):
    """
    Get current and queued skills for a given character.

    Returned dictionary is of the form
    {'skills': skill_list, 'queue': queue_list}. skill_list is a list of
    skill dictionaries as returned by ESI, and queue_list is a list of
    queued skill dictionaries as returned by ESI. All skill dictionaries
    have the additional keys `skill_name` and `group_name`.

    Skills will not be redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_skills(character_id))


@app.route('/api/character/<int:character_id>/wallet', methods=['GET'])
@login_required
def api_character_wallet(character_id):
    """
    Get wallet journal for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by ESI. If
    `first_party_id` and/or `second_party_id` are present, the entry will also
    have the key `first_party` and/or `second_party` whose value is a dict with
    keys `id`, `name`, `party_type` ('corporation' or 'character'),
    `corporation_name`, and `corporation_ticker`. If an entry is redlisted, it
    will have the key `redlisted` with value True.

    Entries are redlisted if first_party or second_party is redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_character_wallet(character_id))


@app.route('/api/character/<int:character_id>/mail/<int:mail_id>', methods=['GET'])
@login_required
def api_mail_body(character_id, mail_id):
    """
    Get body for a given mail.

    Returned data is as returned by ESI.

    Args:
        character_id (int): A character who sent or received the mail.
        mail_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    ensure_has_access(current_user.get_id(), character_id)
    return jsonify(get_mail_body(character_id, mail_id))


@app.route('/api/questions')
def api_questions():
    """
    Get questions asked to applicants.

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are question text.
    """
    return jsonify(get_questions())


@app.route('/api/answers/<int:user_id>')
@login_required
def api_user_answers(user_id):
    """
    Get question answers for a given user.

    Args:
        user_id (int)

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are answer text.

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter,
            a recruiter who has claimed the given user, or the user themself
    """
    ensure_has_access(current_user.get_id(), user_id, self_access=True)
    return jsonify(get_answers(user_id))


@app.route('/api/admin/users')
@login_required
def api_users():
    """
    Get information on all registered users.

    Returned data is of the form {'info': [user_1, user_2, ...]}. Each user
    dictionary has the keys `id`, `name`, `is_admin`, `is_senior_recruiter`,
    and `is_recruiter`.

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or admin.
    """
    return jsonify(asyncio.run(get_users()))


@app.errorhandler(500)
def api_server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500
# [END app]