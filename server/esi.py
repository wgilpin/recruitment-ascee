import backoff
import urllib
from esipy import EsiClient, EsiSecurity
from esipy.cache import DictCache
from pyswagger import App
from esi_config import client_id, secret_key, callback_url, client_name
import pickle
import os


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


class ESIError(Exception):
    pass


def sort_ids_by_category(ids):
    ids = tuple(ids)
    data = []
    for i in range(0, len(ids), 1000):
        data.extend(get_op(
            'post_universe_names', ids=ids[i:i+1000]
        ))
    return_dict = {}
    for item in data:
        category = item['category']
        if category not in return_dict:
            return_dict[category] = []
        return_dict[category].append(item['id'])
    return return_dict


def get_op(op_name, refresh_token=None, **kwargs):
    esi_client = get_esi_client(refresh_token)
    multi_kwarg = None
    for name, value in kwargs.items():
        if isinstance(value, (list, tuple)):
            if multi_kwarg is not None:
                raise RuntimeError('Tried to call with multiple kwargs for both {} and {}'.format(name, multi_kwarg))
            else:
                multi_kwarg = name
    if multi_kwarg is None or op_name[:4] == 'post':
        response = esi_client.request(esi_app.op[op_name](**kwargs))
        if isinstance(response.data, dict) and 'error' in response.data.keys():
            raise ESIError(response.data['error'])
        else:
            return response.data
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
                raise ESIError(str(request._p['path']) + response.data['error'])
            else:
                current_kwarg = request._p['path'][multi_kwarg]
                if current_kwarg.isdigit():
                    current_kwarg = int(current_kwarg)
                result_dict[current_kwarg] = response.data
        return result_dict


def get_paged_op(op_name, refresh_token=None, **kwargs):
    esi_client = get_esi_client(refresh_token)
    response = esi_client.request(esi_app.op[op_name](page=1, **kwargs))
    return_list = []
    return_list.extend(response.data)
    try:
        assert len(response.header['X-Pages']) == 1
        pages = int(response.header['X-Pages'][0])
    except KeyError:
        print('No page numbers given in getPagedOp, request {}, {}'.format(op_name, kwargs))
        print('Response: {}'.format(response))
        return []

    operations = [
        esi_app.op[op_name](page=page, **kwargs) for page in range(2, pages+1)
    ]

    result_list = []
    for request, response in esi_client.multi_request(operations):
        if isinstance(response.data, dict) and 'error' in response.data.keys():
            raise ESIError(response.data['error'])
        else:
            result_list.extend(response.data)

    return return_list
