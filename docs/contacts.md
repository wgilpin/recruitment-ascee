# Contacts API

## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

ESI only supplies

```json
  [
    {
      "contact_id": 2112625428,
      "contact_type": "character",
      "standing": 9.9
    }
  ]
```

API adds

* name
* `corporation_id`
* `corp`
* `alliance_id`
* `alliance`

```json
{
  "info": [
    {
      "contact_id": 2114725334,
      "contact_type": "character",
      "standing": 10,
      "name": "Servant of Entropics",
      "corporation_id": 98409330,
      "alliance_id": 1354830081,
      "corp": "Ascendance",
      "alliance": "Goonswarm Federation"
    },
    {
      "contact_id": 3009430,
      "contact_type": "character",
      "standing": 0,
      "name": "Wifrerante Vaydaerer",
      "corporation_id": 1000104
    },
    {
      "contact_id": 3009802,
      "contact_type": "character",
      "standing": 0,
      "name": "Rirvelan Cyrynier",
      "corporation_id": 1000115
    },
    {
      "contact_id": 3009907,
      "contact_type": "character",
      "standing": 0,
      "name": "Setiges Hustiquier",
      "corporation_id": 1000121
    },
    {
      "contact_id": 3009973,
      "contact_type": "character",
      "standing": 0,
      "name": "Alene Guirmeranes",
      "corporation_id": 1000122
    },
  ],
}
```