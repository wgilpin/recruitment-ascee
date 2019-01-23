# Questions APIs

## Route `/api/questions`

Gets the list of default questions as configured

```json
{
  "info": [
      "How long have you been playing Eve?",
      "PVP or PVE? Why"
  ]
}
```

## Route `/api/questions/:userId`

`userId` {int} id of the applicant main

Gets the questions and answers for the given applicant 
If not a main, find the main first

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