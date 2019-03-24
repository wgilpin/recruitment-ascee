from flask_login import current_user
from security import login_required, user_admin_access_check
from flask_app import app
from flask import request, jsonify
from mail import set_mail_template, send_mail
from exceptions import BadRequestException
from login import login_helper


@app.route('/api/mail/send', methods=['GET'])
@login_required
def api_send_mail():
    """
    Sends mail to a character using the given template.

    Args:
        to_character_id (int)
        template_name (str)
        **kwargs
            Parameters required by the template.

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.
        Bad request (400): If any arguments are missing.
    """
    to_character_id = request.args.get('to_character_id', type=int)
    template_name = request.args.get('template_name', type=str)
    if to_character_id is None:
        raise BadRequestException('name argument is missing.')
    elif template_name is None:
        raise BadRequestException('template argument is missing.')
    kwargs = {}
    kwargs.update(request.args)
    kwargs.pop('to_character_id')
    kwargs.pop('template_name')
    return jsonify(send_mail(to_character_id, template_name, current_user=current_user, **kwargs))


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

    Template can include parts like 'Congratulations {character_name}', which
    will be filled using parameters passed to the send-mail API later.
    If those parameters are not passed to the send-mail API later,
    that API will complain.

    Args:
        name (str)
        template (str)

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.
        Bad request (400): If any arguments are missing.
    """
    name = request.get_json().get('name')
    template = request.get_json().get('template')
    if name is None:
        raise BadRequestException('name argument is missing.')
    elif template is None:
        raise BadRequestException('template argument is missing.')
    else:
        return jsonify(set_mail_template(name, template, current_user=current_user))
