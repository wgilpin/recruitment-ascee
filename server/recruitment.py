from models import Corporation, Note, Question, Answer, User, Character, db, Application, Admin, Recruiter
from security import has_applicant_access, is_admin, is_senior_recruiter, is_recruiter,\
    is_applicant_user_id, user_admin_access_check, user_application_access_check
import cachetools
from exceptions import BadRequestException, ForbiddenException
from models import Question


def set_questions(data, current_user=None):
    user_admin_access_check(current_user)

    for question_data in data:
        id = question_data.get('question_id', None)
        text = question_data['text']
        if id is None:
            db.session.add(Question(text=text))
        else:
            question = db.session.query(Question).filter_by(id=id).one_or_none()
            if question is None:
                raise BadRequestException('No question with id {}'.format(id))
            question.text = text
    db.session.commit()
    return {'status': 'ok'}


def remove_question(question_id, current_user=None):
    user_admin_access_check(current_user)
    question = db.session.query(Question).filter_by(id=question_id).one_or_none()
    if question is None:
        raise BadRequestException('No question with id {}'.format(id))
    else:
        db.session.delete(question)
        db.session.commit()
    return {'status': 'ok'}


def submit_application(current_user=None):
    application = Application.get_for_user(current_user.id)
    if not application:
        raise BadRequestException(f'User {current_user.id} is not an applicant.')
    application.is_submitted = True
    db.session.commit()
    return {'status': 'ok'}


def get_users(current_user=None):
    if not is_admin(current_user):
        raise ForbiddenException('Only admin have access to user list.')
    return_list = []
    admins = set(admin.user for admin in db.session.query(Admin).all())
    recruiters = set(recruiter.user for recruiter in db.session.query(Recruiter).all())
    users_with_roles = admins.union(recruiters)

    for user in users_with_roles:
        return_list.append({
            'id': user.id,
            'is_admin': user.admin is not None,
            'is_recruiter': user.recruiter is not None,
            'is_senior_recruiter': user.recruiter is not None and user.recruiter.is_senior,
            'name': user.name,
        })
    return {'info': return_list}


def get_questions(current_user=None):
    question_dict = {}
    for question in db.session.query(Question).all():
        question_dict[question.id] = question.text
    return question_dict


def set_answers(user_id, answers=None, current_user=None):
    if not user_id:
        user_id = current_user.id if current_user else None
    if not current_user.id == user_id:
        raise ForbiddenException(f'User {current_user.id} is not permitted to answer for {user_id}')
    application = Application.get_for_user(user_id)
    if not application:
        raise ForbiddenException(f'User {user_id} is not an applicant')
    for answer in answers:
        answer_record = Answer.query\
            .filter_by(question_id=answer['question_id'], application_id=application.id)\
            .one_or_none()
        if not answer_record:
            answer_record = Answer(
                question_id=answer['question_id'], text=answer.get('text', ''), application_id=application.id)
            db.session.add(answer_record)
        answer_record.text = answer['text']
        db.session.commit()
    db.session.commit()


def get_answers(user_id, current_user=None):
    if not db.session.query(db.exists().where(User.id==user_id)).scalar():
        raise BadRequestException('User with id={} does not exist.'.format(user_id))
    user = User.get(user_id)
    current_user = current_user or user
    if not has_applicant_access(current_user, user, self_access=True):
        raise ForbiddenException('User {} does not have access to user {}'.format(current_user, user_id))

    application = Application.get_for_user(user_id)
    if not application:
        raise BadRequestException('User with id={} has no application.'.format(user_id))
    questions = get_questions()
    response = {'questions': {}, 'has_application': False}
    if application:
        response['has_application'] = True
        # get a dict keyed by question id of questions & answers
        answers = {a.question_id: a.text for a in application.answers}
        for question_id in questions:
            answer = answers[question_id] if question_id in answers else ""
            response['questions'][question_id] = {
                'question': questions[question_id],
                'user_id': user_id,
                'answer': answer,
            }
    else:
        # no application yet, create empty answers
        for question_id in questions:
            response['questions'][question_id] = {
                'question': questions[question_id],
                'user_id': user_id,
                'answer': '',
            }
    return response


def start_application(current_user=None):
    if is_admin(current_user) or is_recruiter(current_user) or is_senior_recruiter(current_user):
        raise BadRequestException('Recruiters cannot apply')
    character = Character.get(current_user.id)
    if character.blocked_from_applying:
        raise ForbiddenException('User is blocked')
    application = Application.get_for_user(current_user.id)
    if application:
        raise BadRequestException('An application is already open')
    # no application, start one
    application = Application(user_id=current_user.id, is_concluded=False)
    db.session.add(application)
    db.session.commit()
    return {'status': 'ok'}


def add_applicant_note(applicant_user_id, text, title=None, is_chat_log=False, current_user=None):
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
            title=title,
            application_id=application.id,
            is_chat_log=is_chat_log,
            author_id=current_user.id,
        )
        db.session.add(note)
        db.session.commit()
        return {'status': 'ok'}


def get_character_search_list(search_text, current_user=None):
    # list of all chars with name beginning with search_text
    if not (is_recruiter(current_user) or is_admin(current_user)):
        raise ForbiddenException('User must be recruiter or admin.')
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
    for user in User.query.join(
            Application, Application.user_id == User.id
        ).filter(
            db.and_(
                Application.is_submitted,
                db.or_(
                    db.not_(Application.is_concluded),
                    db.and_(Application.is_accepted, db.not_(Application.is_invited))
                )
            )
        ):
        recruiter_name = None
        application = Application.query.filter_by(user_id=user.id, is_concluded=False).one_or_none()
        if application is None:
            application = Application.query.filter_by(user_id=user.id, is_accepted=True, is_invited=False).one_or_none()
        application_status = 'new'
        if application:
            recruiter_id = application.recruiter_id
            if recruiter_id:
                recruiter = User.get(recruiter_id)
                recruiter_name = recruiter.name
                application_status = 'claimed'
            if application.is_accepted:
                application_status = 'accepted'

            applicant_visible = False
            # senior recruiters see all
            if is_senior_recruiter(current_user) or is_admin(current_user):
                applicant_visible = True
            elif is_recruiter(current_user):
                if application and application.recruiter_id == current_user.id:
                    applicant_visible = True
                else:
                    applicant_visible = application_status == 'new'

            if applicant_visible:
                result[user.id] = {
                    'user_id': user.id,
                    'recruiter_id': application.recruiter_id if application else None,
                    'recruiter_name': recruiter_name,
                    'status': application_status,
                    'name': user.name,
                }

    return {'info': result}


def get_applicant_notes(applicant_user_id, current_user=None):
    applicant = User.get(applicant_user_id)
    user_application_access_check(current_user, applicant)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        application = Application.get_for_user(applicant_user_id)
        result = []
        authors = {}
        for note in application.notes:
            if note.author_id in authors:
                author = authors[note.author_id]
            else:
                author = Character.get(note.author_id).name
                authors[note.author_id] = author
            result.append({
                'id': note.id,
                'text': note.text,
                'title': note.title,
                'author': author,
                'is_chat_log': note.is_chat_log,
                'timestamp': note.timestamp,
            })
        return {'info': result}


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_user_characters(user_id, current_user=None):
    user = User.get(user_id)
    if not has_applicant_access(current_user, user, self_access=True):
        raise ForbiddenException('User {} does not have access.'.format(current_user))
    if not db.session.query(db.exists().where(User.id==user_id)).scalar():
        raise BadRequestException('User with id={} does not exist.'.format(user_id))
    character_dict = {}
    for character in db.session.query(Character).filter(Character.user_id==user_id):
        character_dict[character.id] = {
            'name': character.name,
            'corporation_id': character.corporation_id,
            'corporation_name': character.corporation.name,
        }
    return {'info': character_dict}
