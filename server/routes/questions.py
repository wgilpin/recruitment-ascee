from flask_login import current_user
from security import login_required
from flask_app import app
from flask import request, jsonify
from recruitment import get_questions, get_answers, set_answers, set_questions,\
    remove_question
from exceptions import BadRequestException


@app.route('/api/questions/')
def api_questions():
    """
    Get questions asked to applicants.

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are question text.
    """
    return jsonify(get_questions(current_user=current_user))


@app.route('/api/admin/set_questions', methods=['PUT'])
def api_set_questions():
    """
    Set/update questions asked to applicants.

    Args:
        questions (list)
            List of dict with keys 'question_id' and 'text'.
            question_id is None, if the question is new.

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.
        Bad Request (400): If questions are not given, or if question_id is
           invalid for any questions (doesn't already exist).
    """

    questions = request.get_json().get('questions', None)
    if questions is None:
        raise BadRequestException('questions were not given.')
    else:
        return jsonify(set_questions(questions, current_user=current_user))


@app.route('/api/admin/remove_question/<int:question_id>')
def api_remove_question(question_id):
    """
    Disable question asked to applicants.

    Args:
        question_id (int)

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.```
        Bad Request (400): If question_id is invalid.
    """
    return jsonify(remove_question(question_id, current_user=current_user))


@app.route('/api/answers/', methods=['GET', 'PUT'])
@app.route('/api/answers/<int:user_id>', methods=['GET', 'PUT'])
@login_required
def api_user_answers(user_id=None):
    """
    Get and put question answers for a given user.

    Args:
        user_id (int)
            if missing/None uses the logged in user
        answers (list)
            Given for PUT only. List of dict with keys 'question_id' and 'text'.

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are answer text, question text & user id.

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter,
            a recruiter who has claimed the given user, or the user themself,
            or if there is not an unsubmitted application for the user.
    """
    if request.method == 'GET':
        user_id = user_id or current_user.id
        return jsonify(get_answers(user_id, current_user=current_user))
    elif request.method == 'PUT':
        return jsonify(set_answers(user_id, answers=request.get_json()['answers'], current_user=current_user))
