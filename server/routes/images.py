from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from images import get_user_images, get_application_images, sign_s3, confirm_s3, upload_image


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
        {"info": [url_1, url_2, ...]}

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
    recieve images in a form and submit to s3

    Args:
        form data

    Returns:
        response


    Error codes:
        Forbidden (403): If logged in user is not an applicant
            with an unsubmitted application.
    """
    return jsonify(upload_image(current_user=current_user))


@app.route('/api/user/sign_s3', methods=['PUT'])
@login_required
def api_sign_s3():
    """
    Get s3 data for an image upload.

    Args:
        user_id (int)

    Returns:
        response

    Example:
        {
            'info': {
                'data': presigned_post,
                'url': 'https://%s.s3.amazonaws.com/%s' % (S3_BUCKET, file_name)
                'image_id': 132101,
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not an applicant
            with an unsubmitted application.
    """
    return jsonify(sign_s3(current_user=current_user))


@app.route('/api/user/confirm_s3/<int:image_id>', methods=['PUT'])
@login_required
def api_confirm_s3(image_id):
    """
    Confirm upload of image data to s3.

    Args:
        image_id (int)

    Returns:
        response

    Example:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an applicant
            with an unsubmitted application.
        Bad Request (400): If the image id is invalid, already confirmed, or
            does not belong to the logged-in applicant.
    """
    return jsonify(confirm_s3(image_id, current_user=current_user))
