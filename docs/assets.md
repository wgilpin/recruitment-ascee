# Assets API

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

API also adds to each item

* Location name {string}
* type {string name}
* price {float} from prices ESI endpoint

```json
{
  "info":
  {
    "60000085":
    {
      "name":"Egbinger",
      "location_type":"system",
      "items":
      {
        "Egbinger XI - Moon 3 - CBD Corporation Storage":
        {
          "location_type":"structure",
          "items":
          {
            "1029463346514":
            {
              "is_singleton":true,
              "item_id":1029463346514,
              "location_flag":"AssetSafety",
              "location_id":60000085,
              "location_type":"station",
              "quantity":1,
              "type_id":60,
              "type":"Asset Safety Wrap",
              "price":0
              "location":
              {
                "name":"Egbinger XI - Moon 3 - CBD Corporation Storage",
                "system_name":"Egbinger",
              },
              "items":
              {
                "1013394795085":
                {
                  "is_singleton":true,
                  "item_id":1013394795085,
                  "location_flag":"Hangar",
                  "location_id":1029463346514,
                  "location_type":"other",
                  "location":
                  {
                    "name":"Unavailable Structure"
                  },
                  "quantity":1,
                  "type_id":11563,
                  "type":"Micro Auxiliary Power Core I",
                  "price":144750.1
                  "items":
                  {
                  },
                },
                "1013768818401":
                {
                  "is_singleton":false,
                  "item_id":1013768818401,
                  "location_flag":"Hangar",
                  "location_id":1029463346514,
                  "location_type":"other",
                  "location":
                  {
                    "name":"Unavailable Structure"
                  },
                  "quantity":1254,
                  "type_id":212,
                  "type":"Mjolnir Light Missile",
                  "price":9.11
                  "items":
                  {
                  },
                }
              },
            }
          },
        }
      },
    },
    "60000145":
    {
      "name":"Haimeh",
      "location_type":"system",
      "items":
      {
        "Haimeh II - CBD Corporation Storage":
        {
          "items":
          {
            "1022756248413":
            {
              "is_singleton":true,
              "item_id":1022756248413,
              "location_flag":"Hangar",
              "location_id":60000145,
              "location_type":"station",
              "quantity":1,
              "type_id":11202,
              "type":"Ares",
              "location":
              {
                "name":"Haimeh II - CBD Corporation Storage","system_name":"Haimeh"
              },
              "items":
              {
                "1022756248457":
                {
                  "is_singleton":true,
                  "item_id":1022756248457,
                  "location_flag":"RigSlot1",
                  "location_id":1022756248413,
                  "location_type":"other",
                  "quantity":1,
                  "type_id":31153,
                  "type":"Small Low Friction Nozzle Joints I",
                  "location":
                  {
                    "name":"Unavailable Structure"},
                    "items":
                    {
                    },
                    "price":95398.65},
                    "1022756248478":
                    {
                      "is_singleton":true,
                      "item_id":1022756248478,
                      "location_flag":"LoSlot1",
                      "location_id":1022756248413,
                      "location_type":"other",
                      "quantity":1,
                      "type_id":1405,
                      "type":"Inertial Stabilizers II",
                      "location":
                      {
                        "name":"Unavailable Structure"},
                        "items":
                        {
                        },
                        "price":355050.24},
                        "1022756248431":
                        {
                          "is_singleton":true,
                          "item_id":1022756248431,
                          "location_flag":"MedSlot2",
                          "location_id":1022756248413,
                          "location_type":"other",
                          "quantity":1,
                          "type_id":2117,
                          "type":"Burst Jammer II",
                          "location":
                          {
                            "name":"Unavailable Structure"},
                            "items":
                            {
                            },
                            "price":638403.28},
                            "1022756253729":
                            {
                              "is_singleton":true,
                              "item_id":1022756253729,
                              "location_flag":"LoSlot0",
                              "location_id":1022756248413,
                              "location_type":"other",
                              "quantity":1,
                              "type_id":16303,
                              "type":"'Halcyon' Core Equalizer I",
                              "location":
                              {
                                "name":"Unavailable Structure"},
                                "items":
                                {
                                },
                                "price":104569.07
                                ...
                              },
                            },
                          }, 
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ] ,
},

````
