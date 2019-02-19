# Blueprints API

This is a filtered view of the assets tree, with blueprints and locations included

## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

ESI returns
```json
  "is_blueprint_copy": true,
  "is_singleton": true,
  "item_id": 1000000016835,
  "location_flag": "Hangar",
  "location_id": 60002959,
  "location_type": "station",
  "quantity": 1,
  "type_id": 3516
```
API builds a tree based on location id. Note the top level items are all systems, and subsequent nodes of the tree arranged such that if item X has location_d=Y, then location=Y has items containing X.

API also adds to each item:

* `location_name`  {string}
* `system_name`  {string}
* `type_name` {string name}

```json
{
  "info": [
    {
      "is_blueprint_copy": true,
      "system_name": "Korama",
      "quantity": 1,
      "type_name": "'Natura' Warp Core Stabilizer I Blueprint",
      "location_name": "Korama VI - Republic Security Services Assembly Plant",
    },
  ]
}
```
