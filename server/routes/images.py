from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from images import get_user_images, get_application_images, upload_image, delete_s3


@app.route('/api/user/images/', methods=['GET'])
@app.route('/api/user/images/<int:user_id>', methods=['GET'])
@login_required
def api_get_user_images(user_id=None):
    """
    Get uploaded images for a given applicant.

    Args:
        user_id (int)

    Returns:
        response

    Example:
        {"info": [
            {"id": id_1, "url": url_1},
            {"id": id_2, "url": url_2},
            ...
            ]
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter with access
            to the applicant, a senior recruiter, an admin, or the applicant
            if they have an unsubmitted application.
    """
    return jsonify(get_user_images(user_id, current_user=current_user))


@app.route('/api/application/images/<int:application_id>', methods=['GET'])
@login_required
def api_get_application_images(application_id):
    """
    Get uploaded images for a given applicant.

    Args:
        user_id (int)

    Returns:
        response

    Example:
        {"info": [url_1, url_2, ...]}

    Error codes:
        Forbidden (403): If logged in user is not a recruiter with access
            to the applicant, a senior recruiter, an admin, or the applicant
            if they have an unsubmitted application.
    """
    return jsonify(get_application_images(application_id, current_user=current_user))


@app.route('/api/user/upload_image', methods=['POST'])
@login_required
def api_upload_image():
    """
    Recieve images in a form and submit to s3.

    Args:
        form data including files object, as per
            https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/FileGuide/FileUpDown

    Returns:
        response

    Example:
        {'status': 'ok'}

    Error codes:
        Bad Request (400): If the form data contains no files.
        Forbidden (403): If logged in user is not an applicant
            with an unsubmitted application, or if file is not an allowed type.
    """
    return jsonify(upload_image(current_user=current_user))


@app.route('/api/user/image/<int:image_id>/delete', methods=['GET'])
@login_required
def api_delete_image(image_id):
    """
    Delete an image from s3.

    Args:
        image_id (int)

    Returns:
        response

    Example:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an applicant
            with an unsubmitted application that has the corresponding
            image_id attached. Includes case where the image_id is invalid.
    """
    return jsonify(delete_s3(image_id, current_user=current_user))
