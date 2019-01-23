# Questions APIs

## Route `/api/questions`

Gets the list of default questions as configured

```json
{
  "info": {
    "180980981": "How long have you been playing Eve?",
    "987698766": "PVP or PVE? Why"
  }
}
```

## Route `/api/questions/:userId`

`userId` {int} id of the applicant main

Gets the questions and answers for the given applicant.
If not a main, find the main first. The data is stored denormalised with the full
question in case the question was changed since it was answered.

```json
{
  "info": [
    {
      "answer_text": "5 years plus",
      "user_id": 2114725334,
      "question_text": "How long have you been playing Eve?"
    },
    {
      "answer_text": "",
      "user_id": 2114725334,
      "question_text": "PVP or PVE? Why"
    }
  ]
}
```