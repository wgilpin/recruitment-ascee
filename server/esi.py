import backoff
import urllib
from esipy import EsiClient, EsiSecurity
from esipy.exceptions import APIException
from esipy.cache import DictCache
from pyswagger import App
from esi_config import client_id, secret_key, callback_url, client_name
import pickle
import os
from exceptions import ESIException
import pyswagger.primitives
from datetime import datetime


@backoff.on_exception(
    backoff.expo, urllib.error.HTTPError, max_time=10,
)
def get_esi_app():
    return App.create('https://esi.evetech.net/latest/swagger.json')

dir_path = os.path.dirname(os.path.realpath(__file__))

esi_app_filename = os.path.join(dir_path, 'esi_app.pkl')
if os.path.isfile(esi_app_filename):
    esi_app = pickle.load(open(esi_app_filename, 'rb'))
else:
    esi_app = get_esi_app()
    pickle.dump(esi_app, open(esi_app_filename, 'wb'))

client_dict = {}


def get_esi_client(refresh_token=None):
    if refresh_token not in client_dict:
        client_dict[refresh_token] = initialize_esi_client(refresh_token)
    return client_dict[refresh_token]


def initialize_esi_client(refresh_token=None):
    """
    Retrieves a public or authorized ESI client.

    Args:
        auth_id (optional): refresh_token of the user whose client we want to
            retrieve. By default, a public ESI client is returned.

    Returns:
        esi_client (EsiClient): Client object from esipy.
    """
    auth = EsiSecurity(
        headers={'User-Agent': client_name},
        redirect_uri='https://localhost/callback',
        client_id=client_id,
        secret_key=secret_key,
    )
    if refresh_token is not None:
        auth.refresh_token = refresh_token
    esi_client = EsiClient(
        auth,
        retry_requests=True,
        cache=DictCache(),
        headers={'User-Agent': client_name},
    )
    return esi_client


def get_op(op_name, refresh_token=None, disable_multi=False, **kwargs):
    esi_client = get_esi_client(refresh_token)
    multi_kwarg = None
    for name, value in kwargs.items():
        if isinstance(value, (list, tuple)):
            if multi_kwarg is not None:
                raise RuntimeError('Tried to call with multiple kwargs for both {} and {}'.format(name, multi_kwarg))
            else:
                multi_kwarg = name
    if disable_multi or multi_kwarg is None or op_name[:4] == 'post':
        try:
            response = esi_client.request(esi_app.op[op_name](**kwargs), raise_on_error=True)
        except APIException as err:
            raise ESIException(err)
        if isinstance(response.data, dict) and 'error' in response.data.keys():
            raise ESIException(response.data['error'])
        else:
            return jsonify_dates(response.data)
    else:
        operations = []
        value_list = kwargs.pop(multi_kwarg)
        for value in value_list:
            current_kwargs = {multi_kwarg: value}
            current_kwargs.update(kwargs)
            operations.append(esi_app.op[op_name](**current_kwargs))
        result_dict = {}
        for request, response in esi_client.multi_request(operations):
            if isinstance(response.data, dict) and 'error' in response.data.keys():
                raise ESIException(str(request._p['path']) + response.data['error'])
            else:
                current_kwarg = request._p['path'][multi_kwarg]
                if current_kwarg.isdigit():
                    current_kwarg = int(current_kwarg)
                result_dict[current_kwarg] = response.data
        return jsonify_dates(result_dict)


def get_paged_op(op_name, refresh_token=None, **kwargs):
    esi_client = get_esi_client(refresh_token)
    try:
        response = esi_client.request(esi_app.op[op_name](page=1, **kwargs))
    except APIException as err:
        raise ESIException(err)
    if isinstance(response.data, dict) and 'error' in response.data.keys():
        raise ESIException(response.data['error'])
    return_list = []
    return_list.extend(response.data)
    try:
        assert len(response.header['X-Pages']) == 1
        pages = int(response.header['X-Pages'][0])
    except KeyError:
        print('No page numbers given in get_paged_op, request {}, {}'.format(op_name, kwargs))
        print('Response: {}'.format(response))
        print('Probably due to downtime.')
        raise ESIException('No page numbers given in get_paged_op')

    operations = [
        esi_app.op[op_name](page=page, **kwargs) for page in range(2, pages+1)
    ]

    for request, response in esi_client.multi_request(operations):
        if isinstance(response.data, dict) and 'error' in response.data.keys():
            raise ESIException(response.data['error'])
        else:
            return_list.extend(response.data)

    return jsonify_dates(return_list)


def jsonify_dates(obj):
    if isinstance(obj, list):
        return [jsonify_dates(item) for item in obj]
    if isinstance(obj, tuple):
        return tuple(jsonify_dates(item) for item in obj)
    elif isinstance(obj, dict):
        return {key: jsonify_dates(value) for key, value in obj.items()}
    elif isinstance(obj, pyswagger.primitives.Datetime):
        return obj.v.isoformat()
    elif isinstance(obj, pyswagger.primitives.Date):
        return obj.v.isoformat()
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, (str, float, int)):
        return obj
    else:
        raise TypeError(obj, type(obj))
