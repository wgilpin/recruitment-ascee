# Bookmarks API

## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

API adds

* folder (from ESI bookmark folders API)
* system


```json
{
  "info": {
    "767404088": {
      "bookmark_id": 767404088,
      "coordinates": {
        "x": 2032144832108.0835,
        "y": 8408311525.085133,
        "z": 1955929251840
      },
      "created": "2013-02-10T15:35:50Z",
      "creator_id": 92900739,
      "folder_id": 2350193,
      "label": "Gravimetric Training Site\t",
      "location_id": 30045305,
      "notes": "",
      "id": 767404088,
      "folder": "Empire",
      "system": "Clellinon"
    },
    "768429729": {
      "bookmark_id": 768429729,
      "created": "2013-02-15T11:50:12Z",
      "creator_id": 92900739,
      "folder_id": 2350193,
      "item": { "item_id": 60014719, "type_id": 57 },
      "label": "HOME - Cistuvaert V \t",
      "location_id": 30005305,
      "notes": "",
      "id": 768429729,
      "folder": "Empire",
      "system": "Cistuvaert"
    },
    "773400605": {
      "bookmark_id": 773400605,
      "coordinates": {
        "x": -41065383088.86704,
        "y": 3486461013.077479,
        "z": -51001689584.610596
      },
      "created": "2013-03-09T17:08:33Z",
      "creator_id": 92900739,
      "folder_id": 2350193,
      "label": "Vaere III Moon 1 Rep. Sec. Serv\t",
      "location_id": 30005306,
      "notes": "",
      "id": 773400605,
      "folder": "Empire",
      "system": "Vaere"
    },
    "773830966": {
      "bookmark_id": 773830966,
      "coordinates": {
        "x": -172874102150.52347,
        "y": -34441907209.10873,
        "z": 1220760613758.1692
      },
      "created": "2013-03-11T16:26:23Z",
      "creator_id": 92900739,
      "folder_id": 2350193,
      "label": "Hek VIII Moon 17 Aliastra\t",
      "location_id": 30002053,
      "notes": "",
      "id": 773830966,
      "folder": "Empire",
      "system": "Hek"
    }
  }
}
```