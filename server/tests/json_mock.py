import os
import json
import functools


def serialize_dict(d):
    return tuple(sorted(d.items(), key=lambda x:x[0]))


class JsonFunctionMocker(object):

    def __init__(self, filename):
        self._filename = filename
        if os.path.isfile(self._filename):
            self._data = json.load(open(self._filename, 'r'))
        else:
            self._data = {}

    def mock_function(self, wrapped_func):
        func_key = wrapped_func.__name__
        @functools.wraps(wrapped_func)
        def mock_function(*args, **kwargs):
            arg_key = (tuple(args), serialize_dict(kwargs))
            if arg_key not in self._data[func_key]:
                self._data[func_key][arg_key] = wrapped_func(*args, **kwargs)
            return self._data[func_key][arg_key]
        return mock_function

    def save(self):
        with open(self._filename, 'w') as f:
            json.dump(self._data, f)
