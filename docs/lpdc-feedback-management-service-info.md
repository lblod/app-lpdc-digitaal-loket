# Lpdc Feedback Management Service

Microservice used to ingest feedback data from ipdc ldes feed + flag instances based on available feedback.
It handles publishing answers on feedbacks to ipdc when a feedback is in the correct state.
Designed for the [semantic.works](https://semantic.works/) microservices stack.
This microservice is made for [LPDC](https://github.com/lblod/app-lpdc-digitaal-loket) but can be configured via
environment variables to be used in other applications that use the same feedback resource.

Feedback comes with 3 statuses:

- ipdc-status (via `adms:status`) used to signal the status of the feedback resource from ipdc.
- status (via `schema2:actionStatus`) used to signal the status of the feedback resource within lpdc.
- processing-status (via `schema2:result`) used to signal the status of the processing of the feedback.

The microservice flags instances + adds the status based on if they have any linked feedback with the ipdc-status `feedbackstatus:AANGEMAAKT`.
When a feedback gets the status `Verwerkt`, the microservice unflags the linked instance if there are
no other linked feedback with ipdc-status `feedbackstatus:AANGEMAAKT`.

## How It Works

1. The service listens for delta notifications from [delta-notifier](https://github.com/mu-semtech/delta-notifier)
2. When a feedback's ipdc-status changes to the configured 'start' ipdc-status, it gets the instance linked to the
   feedback.
3. The service updates the `lpdcExt:feedbackAvailable` flag on the instance resource and sets the configured 'start'
   status on the feedback.
4. When a feedback's status is changed to the configured 'end' status, it unflags the instance if there are no other linked feedback in the 'start' ipdc-status.

There is also a cronjob that runs daily to make sure missed deltas are handled.

The microservice handles ingesting feedback ldes data from ipdc + enriches this data.
It does this via a cronjob + delta's that
moves incoming feedback snapshots to it's correct organization graph with some added enrichments.

Finally, this service publishes answers on feedback to the ipdc answer endpoint. It uses retry logic
to handle failed publish calls and records errors in the ipdc-feedback-publication-errors graph.