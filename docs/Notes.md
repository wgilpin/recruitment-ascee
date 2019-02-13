# Notes API

API for the recruiters notes, and pasted chat logs.

The application has two note streams, notes and logs. They are conceptually the same: a list of timestamp text messages, but they are seperate.
The difference is that logs have a title for context.

## GET Request Params

`applicant_id` {int}

## Sample Output

GET returns all the notes and logs for the current application of the specified applicant

```json
{
  "info":
    "notes": [
    {
      "timestamp": "ISO Date string",
      "author_id": 61097499,
      "note_id": 101052109,
      "text": "kiugoiugnboyiug ouiguy gkuyf jtf kuf kuyf kutf ikufk uyfku fkj iy gkuyg iuy guy kuy uky kuyg kuy iuy",
    },
  ],
  "logs": [
    {
      "timestamp": "ISO Date string",
      "author_id": 61097499,
      "note_id": 101052109,
      "title": "Chat log from friday",
      "text": "kiugoiugnboyiug ouiguy gkuyf jtf kuf kuyf kutf ikufk uyfku fkj iy gkuyg iuy guy kuy uky kuyg kuy iuy",
    },
  ]
}
```

## PUT Request Params

`applicant_id` {int}

`kind`: {string} 'note' | 'log'

`note`: {

      `timestamp`: (string) ISO date

      `author_id`: (int),

      `note_id`: (int),

      `title`: (string),

      `text`: (string),

    }
