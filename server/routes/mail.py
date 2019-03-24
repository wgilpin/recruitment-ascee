from flask_login import current_user
from security import login_required, user_admin_access_check
from flask_app import app
from flask import request, jsonify
from mail import set_mail_template, send_mail
from exceptions import BadRequestException
from login import login_helper


@app.route('/api/mail/character')
@login_required
def api_set_mail_character():
    """
    Sends user to ESI to auth a character for sending admin mails.

    Error codes:
        Forbidden (403): If logged in user is not an admin.
    """
    user_admin_access_check(current_user)
    return login_helper('mail')


@app.route('/api/mail/template', methods=['PUT'])
@login_required
def api_set_mail_template():
    """
    Sets a template.

    Template can include {name} in parts like 'Congratulations {name}', which
    will be filled using the to-character's name automatically later.

    Args:
        name (str)
        template (str)

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.
        Bad request (400): If any arguments are missing.
    """
    name = request.args.get('name', type=str)
    template = request.args.get('template', type=str)
    if name is None:
        raise BadRequestException('name argument is missing.')
    elif template is None:
        raise BadRequestException('template argument is missing.')
    else:
        return jsonify(set_mail_template(name, template, current_user=current_user))
