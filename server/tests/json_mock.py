import os
import json
import functools
import copy


def serialize_dict(d):
    d = d.copy()
    for key, value in d.items():
        if isinstance(value, list):
            d[key] = tuple(value)
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
        self._data[func_key] = {}
        @functools.wraps(wrapped_func)
        def mock_function(*args, **kwargs):
            arg_key = str((tuple(args), serialize_dict(kwargs)))
            if arg_key not in self._data[func_key]:
                self._data[func_key][arg_key] = wrapped_func(*args, **kwargs)
            return copy.deepcopy(self._data[func_key][arg_key])
        return mock_function

    def save(self):
        if any(len(v) > 0 for v in self._data.values()):
            with open(self._filename, 'w') as f:
                json.dump(self._data, f, indent=4)
