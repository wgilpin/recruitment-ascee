from models import Question, Answer, User, Character, db


def get_questions():
    question_dict = {}
    for question in Question.query().run():
        question_dict[question.get_id()] = question.text
    return question_dict


def get_answers(user_id):
    # get a dict keyed by question id of questions & answers
    response = {}
    questions = get_questions()
    answer_query = Answer.query().where(Answer.user_id == user_id)
    answers = {a.question_id: a for a in answer_query.run()}
    for question_id in questions:
        answer = answers[question_id].text if question_id in answers else ""
        response[question_id] = {
            "question": questions[question_id],
            "user_id": user_id,
            "answer": answer,
        }
    return response


def recruiter_claim_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    if not recruiter.is_recruiter:
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    applicant.recruiter_id = recruiter_user_id
    db.session.commit()
    return {'status': 'ok'}

def submit_application(applicant_user_id):
    applicant = User.get(applicant_user_id)
    applicant.is_submitted = True
    applicant.put()
    return {'status': 'ok'}


def recruiter_release_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    applicant = User.get(applicant_user_id)
    if not recruiter.is_recruiter:
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    elif applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    elif applicant.recruiter_id != recruiter_user_id:
        applicant_name = Character.get(applicant_user_id).name
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'Recruiter {} is not recruiter for applicant {}'.format(
            recruiter_name, applicant_name)}
    else:
        applicant.recruiter_id = None
        db.session.commit()
        return {'status': 'ok'}


def escalate_applicant(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.status = 'escalated'
        db.session.commit()
        return {'new_applicant_status': applicant.status}


def reject_applicant(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.status = 'rejected'
        db.session.commit()
        return {'status': 'ok'}


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
    for applicant in User.query().\
            where(User.is_recruiter.is_false).\
            and_where(User.is_senior_recruiter.is_false).\
            and_where(User.is_admin.is_false).\
            run():
        applicant_id = applicant.get_id()
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
