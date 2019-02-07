from models import Corporation, Note, Question, Answer, User, Character, db, Application, Admin, Recruiter
from flask import jsonify, request
from flask_login import login_required, current_user
from security import has_applicant_access, is_admin, is_senior_recruiter, is_recruiter
import cachetools
from flask_app import app
from exceptions import BadRequestException, ForbiddenException


@app.route(
    '/api/recruits/add_note/<int:applicant_id>', methods=['PUT'])
@login_required
def api_add_applicant_note(applicant_id):
    """
    Add a note for an applicant

    Args:
        applicant_id (int): User key of applicant
        text (in body): The note

    Returns:
        {'status': 'ok'} if note is successfully added

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    return jsonify(add_applicant_note(applicant_id, text=request.form['text'], current_user=current_user))

@app.route(
    '/api/recruits/add_chat_log/<int:applicant_id>', methods=['PUT'])
@login_required
def api_add_applicant_chat(applicant_id):
    """
    Add a partial chat log for an applicant

    Args:
        applicant_id (int): User key of applicant
        text (in body): The chat log

    Returns:
        {'status': 'ok'} if log is successfully added

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    return jsonify(add_applicant_note(applicant_id, text=request.form['text'], is_chat_log=True, current_user=current_user))


@app.route('/api/applicant_list/')
@login_required
def api_get_applicant_list():
    """
    Gets the list of all applicants, including accepted and rejected applicants.

    Returns:
        response (dict)

    Example:
        response = {
            'info': {
                '1937622137': {
                    'user_id': 1937622137,  # int character ID of user's main
                    'recruiter_id': 201837771,  # int character ID of recruiter's main
                    'recruiter_name': 'Recruiter Ralph',  # string name of recruiter
                    'is_escalated': False,
                    'is_submitted': False,
                    'is_concluded': False,
                    'is_accepted': False,
                    'is_invited': False,
                },
                '876876876': {
                    [...]
                }
            ]
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter or senior recruiter
    """
    return jsonify(get_applicant_list(current_user=current_user))



@app.route('/api/user/characters/')
@app.route('/api/user/characters/<int:user_id>')
@login_required
def api_get_user_characters(user_id=None):
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
    if not user_id:
        user_id = current_user.get_id()
    return jsonify(get_user_characters(user_id, current_user=current_user))


@app.route('/api/questions/')
def api_questions():
    """
    Get questions asked to applicants.

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are question text.
    """
    return jsonify(get_questions(current_user=current_user))


@app.route('/api/answers/')
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
    user_id = user_id or current_user.id
    return jsonify(get_answers(user_id, current_user=current_user))


@app.route('/api/admin/users/')
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
        Forbidden (403): If logged in user is not an admin.
    """
    return jsonify(get_users(current_user=current_user))


def get_users(current_user=None):
    if not is_admin(current_user):
        raise ForbiddenException('Only admin have access to user list.')
    return_list = []
    admin_ids = db.session.query(Admin.id).all()
    recruiter_ids = db.session.query(Recruiter.id).all()
    senior_recruiter_ids = db.session.query(Recruiter.id).filter(Recruiter.is_senior).all()

    for user in db.session.query(User).all():
        return_list.append({
            'id': user.get_id(),
            'is_admin': (user.id,) in admin_ids,
            'is_recruiter': (user.id,) in recruiter_ids,
            'is_senior_recruiter': (user.id,) in senior_recruiter_ids,
            'name': user.name,
        })
    return {'info': return_list}


def get_questions(current_user=None):
    question_dict = {}
    for question in db.session.query(Question).filter(Question.enabled):
        question_dict[question.id] = question.text
    return question_dict


def get_user_application(user_id):
    return Application.get_for_user(user_id)


def get_answers(user_id, current_user=None):
    if not db.session.query(db.exists().where(User.id==user_id)).scalar():
        raise BadRequestException('User with id={} does not exist.'.format(user_id))
    user = User.get(user_id)
    if not has_applicant_access(current_user, user, self_access=True):
        raise ForbiddenException('User {} does not have access to user {}'.format(current_user, user_id))

    application_id = get_user_application(user_id).id
    # get a dict keyed by question id of questions & answers
    response = {}
    questions = get_questions()
    answer_query = db.session.query(Answer.question_id, Answer.text).filter(Answer.application_id==application_id)
    answers = {item[0]: item[1] for item in answer_query}
    for question_id in questions:
        answer = answers[question_id] if question_id in answers else ""
        response[question_id] = {
            "question": questions[question_id],
            "user_id": user_id,
            "answer": answer,
        }
    return response


def add_applicant_note(applicant_user_id, text, is_chat_log=False, current_user=None):
    application = Application.query.filter_by(
        user_id=applicant_user_id, is_concluded=False).one_or_none()
    if application is None:
        raise BadRequestException('User {} is not an applicant'.format(
            User.get(applicant_user_id).name))
    else:
        if not is_recruiter(current_user):
            raise ForbiddenException(
                'Current user is not a recruiter')
        elif (application.recruiter_id != current_user.id and
              not is_senior_recruiter(current_user)):
            raise ForbiddenException(
                'Current recruiter has not claimed applicant {}'.format(applicant_user_id))
        note = Note(
            text=text,
            application_id=application.id,
            is_chat_log=is_chat_log
        )
        db.session.add(note)
        db.session.commit()
        return {'status': 'ok'}


def get_character_search_list(search_text):
    # list of all chars with name beginning with search_text
    result = {}
    if len(search_text) == 0:
        return result
    for character in Character.query.\
            filter(Character.name.ilike(f'%{search_text}%')):
        result[character.id] = {
            'user_id': character.id,
            'name': character.name,
        }
    return result


def get_applicant_list(current_user=None):
    if not (is_recruiter(current_user) or is_admin(current_user)):
        raise ForbiddenException('User must be recruiter or admin.')
    result = {}
    for application in Application.query.filter(Application.is_concluded==False).all():
        applicant_id = application.user_id
        recruiter = User.get(application.recruiter_id) if application.recruiter_id else None
        recruiter_name = \
            recruiter.name if application.recruiter_id else None
        applicant_name = \
            Character.get(applicant_id).name if applicant_id else None

        if application.is_concluded:
            continue

        application.status = 'new'
        if application.is_escalated:
            application.status = 'escalated'

        applicant_visible = False
        # senior recruiters see all
        if is_senior_recruiter(current_user) or is_admin(current_user):
            applicant_visible = True
        elif is_recruiter(current_user):
            if application.recruiter_id == current_user.id:
                applicant_visible = True
            else:
                applicant_visible = application.status == 'new'

        if applicant_visible:
            result[applicant_id] = {
                'user_id': applicant_id,
                'recruiter_id': application.recruiter_id,
                'recruiter_name': recruiter_name,
                'is_escalated': application.is_escalated,
                'is_submitted': application.is_submitted,
                'is_concluded': application.is_concluded,
                'is_accepted': application.is_accepted,
                'is_invited': application.is_invited,
                'name': applicant_name,
            }

    return {'info': result}


def get_applicant_notes(applicant_user_id, current_user=None):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        return {'info': applicant.notes}


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_user_characters(user_id, current_user=None):
    if not db.session.query(db.exists().where(User.id==user_id)).scalar():
        raise BadRequestException('User with id={} does not exist.'.format(user_id))
    user = User.get(user_id)
    if not has_applicant_access(current_user, user, self_access=True):
        raise ForbiddenException('User {} does not have access to user {}'.format(current_user, user_id))
    character_dict = {}
    for character in db.session.query(Character).filter(Character.user_id==user_id):
        character_dict[character.id] = {
            'name': character.name,
            'corporation_id': character.corporation_id,
            'corporation_name': character.corporation.name,
        }
    return {'info': character_dict}
