# Mail APIs

1. Mail API
2. Mail Body API

## 1. Mail List API

### Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

`last_mail_id` {int} (Optional)
  return mails with ID lower than this, as per ESI endpoint

### Sample Output

#### Enrichment

ESI returns

```json
  "from": 90000001,
  "is_read": true,
  "labels": [3],
  "mail_id": 7,
  "recipients": [
    {
      "recipient_id": 90000002,
      "recipient_type": "character"
    }
  ],
  "subject": "Title for EVE Mail",
  "timestamp": "2015-09-30T16:07:00Z"
```

API adds to each item:

* `from` {
    `id`: {int}
    `name` {string}
    `corporation_name` {string}
    `alliance_name` {string}
  }
* `recipients` array of
  {
    `id`: {int}
    `name` {string}
    `corporation_name` {string}
    `alliance_name` {string}
    `redlisted`: [list of redlisted field names]
  }

```json
{
  "info": [
    {
      "from": {
        "id": 299590276,
        "name": "Major Sniper",
        "corporation_name": "Ascendance"
        },
      "labels": [4],
      "mail_id": 374341459,
      "recipients": ["", "", ...],
      "subject": "A gentle reminder",
      "timestamp": "2019-01-21T14:11:00Z"
    },
    {
      "from": { "id": 299590276, "name": "Major Sniper" },
      "labels": [4],
      "mail_id": 374279690,
      "recipients": [""],
      "subject": "1DQ1, Hostiles and your mentality of Safe Space",
      "timestamp": "2019-01-16T19:20:00Z"
    }
  ]
}
````

## 2. Mail Item API

### Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

`mailId` {int}

    ID of a mail message

### Sample Output

#### Enrichment

ESI returns

```json
  "body": "blah blah blah",
  "from": 90000001,
  "labels": [2, 32],
  "read": true,
  "subject": "test",
  "timestamp": "2015-09-30T16:07:00Z"
```

API sample:

```json
{
  "info": "Guys and Gals of ASCEE<br><br>I just want to remind you all that although we dont micro manage topics of conversation on coms, there is a level of expectations that we all remain civil and keep topics at least above the board. I have heard on several occasions now that topics can get out of hand on the sexual side and to be honest. we are all adults and know where the line is. I expect you all to remain above that line and at least keep it do a degree clean. <br><br>Not everyone wants to hear about your body parts or how you are in bed. This is not the place nor the milk crate to stand on to shout that out. <br><br>I am going to leave this at that, but in future if i keep hearing the same names pop up, im going to have a chat with you personally about this. We are a large multi national corp with many opinions, religions and ages and although we cant keep everyone happy, we can at least remain civil on our coms.<br><br>This is the last time im going to mention this and i expect you all to act as adults. "
}
```
