import backoff
import urllib
from esipy import EsiClient, EsiSecurity
from esipy.cache import DictCache
from pyswagger import App
from esi_config import client_id, secret_key, callback_url, client_name


@backoff.on_exception(
    backoff.expo, urllib.error.HTTPError, max_time=10,
)
def get_esi_app():
    return App.create('https://esi.evetech.net/latest/swagger.json')

esi_app = get_esi_app()

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


def get_op(op_name, refresh_token=None, **kwargs):
    esiClient = get_esi_client(refresh_token)
    response = esiClient.request(esi_app.op[op_name](**kwargs))
    if isinstance(response, dict) and 'error' in response.keys():
        raise ESIError(response['error'])
    else:
        return response.data


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
        result_list.extend(response.data)

    return return_list
