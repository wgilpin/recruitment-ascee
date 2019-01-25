from esipy import EsiClient, EsiSecurity
from esipy.cache import DictCache
from pyswagger import App
import pickle
import os
from concurrent.futures import ThreadPoolExecutor
from database import Character
from esi_config import client_id, secret_key, callback_url, client_name

#  Cache in a file because it takes a while to load
current_dir = os.path.dirname(os.path.abspath(__file__))
app_data_filename = os.path.join(current_dir, 'esi_app.pkl')

# if os.path.isfile(app_data_filename):
esi_app = App.create('https://esi.evetech.net/latest/swagger.json')
    # pickle.dump(esi_app, open(app_data_filename, 'wb'))
# else:
#     esi_app = pickle.load(open(app_data_filename, 'rb'))

client_dict = {}


def get_esi_client(auth_id=None):
    if auth_id not in client_dict:
        client_dict[auth_id] = initialize_esi_client(auth_id)
    return client_dict[auth_id]


def initialize_esi_client(auth_id=None):
    """
    Retrieves a public or authorized ESI client.

    Args:
        auth_id (optional): character_id of the user whose client we want to
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
    if auth_id is not None:
        auth.refresh_token = Character.get(auth_id).refresh_token
    esi_client = EsiClient(
        auth,
        retry_requests=True,
        cache=DictCache(),
        headers={'User-Agent': client_name},
    )
    return esi_client


class ESIError(Exception):
    pass


def get_op(op_name, auth_id=None, **kwargs):
    esiClient = get_esi_client(auth_id)
    response = esiClient.request(esi_app.op[op_name](**kwargs))
    if isinstance(response, dict) and 'error' in response.keys():
        raise ESIError(response['error'])
    else:
        return response.data


def get_paged_op(op_name, auth_id=None, **kwargs):
    esi_client = get_esi_client(auth_id)
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
        result_list.extend(response.data)

    return return_list
