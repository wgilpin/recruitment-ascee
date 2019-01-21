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
```
  "is_blueprint_copy": true,
  "is_singleton": true,
  "item_id": 1000000016835,
  "location_flag": "Hangar",
  "location_id": 60002959,
  "location_type": "station",
  "quantity": 1,
  "type_id": 3516
```
API builds a tree based on locattion id. Note the top level items are all systems, and subsequent nodes of the tree arranged such that if item X has location_d=Y, then location=Y has items containing X.

API also adds to each item:
* `name` Location name {string}
* `type` {string name}

```
{
  "info": [
    {
      "is_blueprint_copy": true,
      "is_singleton": true,
      "item_id": 1010521097499,
      "location_flag": "AutoFit",
      "location_id": 1011931641399,
      "location_type": "other",
      "quantity": 1,
      "type_id": 22878,
      "system_id": 60005140,
      "type": "'Natura' Warp Core Stabilizer I Blueprint",
      "location": "Korama VI - Republic Security Services Assembly Plant",
      "location_full": ""
    },
    {
      "is_blueprint_copy": true,
      "is_singleton": true,
      "item_id": 1010521278508,
      "location_flag": "AutoFit",
      "location_id": 1011931641399,
      "location_type": "other",
      "quantity": 1,
      "type_id": 22946,
      "system_id": 60005140,
      "type": "'Executive' Remote Sensor Dampener Blueprint",
      "location": "Korama VI - Republic Security Services Assembly Plant",
      "location_full": ""
    },
    {
      "is_blueprint_copy": true,
      "is_singleton": true,
      "item_id": 1010521459700,
      "location_flag": "AutoFit",
      "location_id": 1011931641399,
      "location_type": "other",
      "quantity": 1,
      "type_id": 22950,
      "system_id": 60005140,
      "type": "'Love' Medium Remote Armor Repairer Blueprint",
      "location": "Korama VI - Republic Security Services Assembly Plant",
      "location_full": ""
    }
  ]
}
````
