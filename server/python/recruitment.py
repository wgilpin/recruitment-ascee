from database import Question, Answer


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
