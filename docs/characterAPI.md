# Character APIs

## Route `/api/character/alts`

```json
{
  "info": {
    "94399527": {
      "main": 2114725334,
      "name": "Semirhage Boan",
      "isSnrRecruiter": false,
      "isAdmin": false,
      "isRecruiter": false,
      "corporation": "Ascendance",
      "corporation_id": 98409330,
      "birthday": "2014-02-16T15:07:36Z",
    },
  }
}
```

## Route `/api/character/all`

Returns a list of all users (not alts)

```json
{
  "info":[
    {
      "id": 093898938,
      "isAdmin": true,
      "isRecruiter": false,
      "isSnrRecruiter": false,
      "name": "Bill McGruff",
    },
    {
      "id": 98743987,
      "isAdmin": false,
      "isRecruiter": false,
      "isSnrRecruiter": false,
      "name": "Green McHorn",
    },
  ]
}
```
