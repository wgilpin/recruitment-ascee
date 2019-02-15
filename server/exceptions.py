from flask_app import app
from flask import jsonify


class AppException(Exception):
    status_code = 500

    def __init__(self, message, status_code=None, payload=None):
        super(AppException, self).__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@app.errorhandler(AppException)
def handle_unauthorized(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


class ESIException(AppException):
    pass


class BadRequestException(AppException):
    status_code = 400


class ForbiddenException(AppException):
    status_code = 403


class UnauthorizedException(AppException):
    status_code = 401


class NotFoundException(AppException):
    status_code = 404


class GatewayTimeoutException(AppException):
    status_code = 504
