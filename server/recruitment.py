from models import Corporation, Question, Answer, User, Character, db, Application
from flask import jsonify, request
from flask_login import login_required, current_user
from security import ensure_has_access
import cachetools
import asyncio
from flask_app import app


@app.route(
    '/api/recruits/edit_notes/<int:applicant_id>', methods=['PUT'])
@login_required
def api_edit_applicant_notes(applicant_id):
    """
    Update the notes for an applicant

    Args:
        applicant_id (int): User key of applicant
        text (in body): The note

    Returns:
        {'status': 'ok'} if note is successfully updated

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
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


@app.route('/api/user/characters')
@app.route('/api/user/characters/<int:user_id>')
@login_required
def api_get_user_character_list(user_id=None):
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
    current_user_id = current_user.get_id()
    if not user_id:
        user_id = current_user_id
    ensure_has_access(current_user_id, user_id, self_access=True)
    return jsonify(get_character_data_list(user_id))



@app.route('/api/questions')
def api_questions():
    """
    Get questions asked to applicants.

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are question text.
    """
    return jsonify(get_questions())


@app.route('/api/answers')
@app.route('/api/answers/<int:user_id>')
@login_required
def api_user_answers(user_id=None):
    """
    Get question answers for a given user.

    Args:
        user_id (int)
            if missing/None uses the logged in user

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are answer text, question text & user id.

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter,
            a recruiter who has claimed the given user, or the user themself
    """
    if not user_id:
        user_id = current_user.get_id()
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



async def get_users():
    return_list = []
    for user in db.session.Query(User).all():
        return_list.append({
            'id': user.get_id(),
            'is_admin': user.is_admin,
            'is_recruiter': user.is_recruiter,
            'is_senior_recruiter': user.is_senior_recruiter,
            'name': Character.get(user.get_id()).name,
        })
    return {'info': return_list}


def get_questions():
    question_dict = {}
    for question in db.session.query(Question.is_enabled).all():
        question_dict[question.get_id()] = question.text
    return question_dict


def get_answers(user_id):
    # get a dict keyed by question id of questions & answers
    response = {}
    questions = get_questions()
    answer_query = db.session.query(Answer.user_id == user_id)
    answers = {a.question_id: a for a in answer_query.all()}
    for question_id in questions:
        answer = answers[question_id].text if question_id in answers else ""
        response[question_id] = {
            "question": questions[question_id],
            "user_id": user_id,
            "answer": answer,
        }
    return response


def edit_applicant_notes(applicant_user_id, text):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.notes = text
        db.session.commit()
        return {'status': 'ok'}

def get_character_search_list(search_text):
    # list of all chars with name beggining with search_text
    result = {}
    for character in Character.query().\
            where(Character.name >= search_text).\
            and_where(Character.name < search_text + u'\ufffd').\
            run():
        id = character.get_id()
        result[id] = {
            'user_id': id,
            'name': character.name,
        }
    return result

def get_applicant_list(current_user):
    current_user_id = current_user.get_id()
    return_list = []
    for applicant in db.session.Query(Application).filter(not Application.is_concluded).all():
        recruiter_name = \
            Character.get(applicant.recruiter_id).name if applicant.recruiter_id else None
        applicant_name = \
            Character.get(applicant_id).name if applicant_id else None

        # everyone sees new applicants
        applicant_visible = applicant.status == 'new'
        
        # recruiters see their own
        if applicant.recruiter_id == current_user_id:
            applicant_visible = True

        # senior recruiters see all
        if current_user.is_senior_recruiter:
            applicant_visible = True

        # admins see all
        if current_user.is_admin:
            applicant_visible = True

        if applicant_visible:
            return_list.append({
                'user_id': applicant_id,
                'recruiter_id': applicant.recruiter_id,
                'recruiter_name': recruiter_name,
                'status': applicant.status,
                'name': applicant_name,
            })
    return {'info': return_list}


def get_applicant_notes(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        return {'info': applicant.notes}


def get_character_list(user_id):
    query = Character.query().where(Character.user_id == user_id)
    return list(query.run())


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_character_data_list(user_id):
    character_dict = {}
    for character in get_character_list(user_id):
        character_dict[character.get_id()] = {
            'name': character.name,
            'corporation_id': character.corporation_id,
            'corporation_name': Corporation.get(character.corporation_id).name,
        }
    return {'info': character_dict}
