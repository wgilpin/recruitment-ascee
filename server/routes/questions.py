from flask_login import current_user
from security import login_required
from flask_app import app
from flask import request, jsonify
from recruitment import get_questions, get_answers, set_answers

@app.route('/api/questions/')
def api_questions():
    """
    Get questions asked to applicants.

    Returns:
        response (dict): A dictionary whose keys are integer question ids and
            values are question text.
    """
    return jsonify(get_questions(current_user=current_user))


@app.route('/api/answers/', methods=['GET', 'PUT'])
@app.route('/api/answers/<int:user_id>', methods=['GET', 'PUT'])
@login_required
def api_user_answers(user_id=None):
    """
    Get question answers for a given user.

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
            a recruiter who has claimed the given user, or the user themself
    """
    if request.method == 'GET':
        user_id = user_id or current_user.id
        return jsonify(get_answers(user_id, current_user=current_user))
    elif request.method == 'PUT':
        return jsonify(set_answers(user_id, answers=request.args.get('answers'), current_user=current_user))
