from database import Question, Answer, Recruit, User, Character


def get_questions():
    question_list = []
    for question in Question.query():
        question_list.append(question.text)
    return {'info': question_list}


def get_answers(user_id):
    question_dict = {}
    for question in Question.query():
        question_dict[question.id] = question.text
    return_list = []
    for answer in Answer.query(user_id=user_id):
        return_list.append({
            'question_text': question_dict[answer.question_id],
            'user_id': user_id,
            'answer_text': answer.text,
        })
    return {'info': return_list}


def recruiter_claim_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    if not recruiter.is_recruiter:
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    applicant = Recruit.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    applicant.recruiter_id = recruiter_user_id
    applicant.put()
    return {'status': 'ok'}


def recruiter_release_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    applicant = Recruit.get(applicant_user_id)
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
        applicant.put()
        return {'status': 'ok'}


def escalate_applicant(applicant_user_id):
    applicant = Recruit.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.status += 1
        applicant.put()
        return {'new_applicant_status': applicant.status}


def reject_applicant(applicant_user_id):
    pass


def edit_applicant_notes(applicant_user_id, text):
    applicant = Recruit.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.notes = text
        return {'status': 'ok'}


def get_applicant_list():
    return_list = []
    for applicant in Recruit.query().run():
        return_list.append({
            'user_id': applicant.user_id,
            'recruiter_id': applicant.recruiter_id,
            'recruiter_name': Character.get(applicant.recruiter_id).name,
            'status': applicant.status,
        })
    return {'info': return_list}


def get_applicant_notes(applicant_user_id):
    applicant = Recruit.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        return {'info': applicant.notes}
