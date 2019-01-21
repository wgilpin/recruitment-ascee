from esipy import EsiClient, EsiSecurity
from esipy.cache import DictCache
from pyswagger import App
import pickle
import os
from concurrent.futures import ThreadPoolExecutor


app_data_filename = 'esi_app.pkl'

if os.path.isfile(app_data_filename):
    esi_app = App.create('https://esi.evetech.net/latest/swagger.json')
    pickle.dump(esi_app, open(app_data_filename, 'wb'))
else:
    esi_app = pickle.load(open(app_data_filename, 'rb'))


def get_esi_client(auth_id=None):
    """
    Retrieves a public or authorized ESI client.

    Args:
        auth_id (optional): character_id of the user whose client we want to
            retrieve. By default, a public ESI client is returned.

    Returns:
        esi_client (EsiClient): Client object from esipy.
    """
    auth = EsiSecurity(
        headers={'User-Agent': ''},
        redirect_uri='https://localhost/callback',
        client_id='',
        secret_key='',
    )
    if auth_id is not None:
        auth.refresh_token = ''
    esi_client = EsiClient(
        auth,
        retry_requests=True,
        cache=DictCache(),
        headers={'User-Agent': ''},
    )
    return esi_client


class ESIError(Exception):
    pass


def get_op(op_name, user_id=None, **kwargs):
    esiClient = get_esi_client(user_id)
    response = esiClient.request(esi_app.op[op_name](**kwargs))
    if isinstance(response, dict) and 'error' in response.keys():
        raise ESIError(response['error'])
    else:
        return response.data


def get_paged_op(op_name, user_id, **kwargs):
    esi_client = get_esi_client(user_id)
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
    result_list = []
    with ThreadPoolExecutor(max_workers=20) as pool:
        for page in range(2, pages+1):
            result_list.append(
                pool.submit(
                    lambda *args, **kw: esi_client.request(esi_app.op[op_name](**kw)),
                    page=page,
                    **kwargs,
                )
            )
        for result in result_list:
            return_list.extend(result.result().data)
    return return_list
