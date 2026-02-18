# Feedback Available Flag Service

This [microservice](https://github.com/lblod/feedback-available-flag-service) is used to flag instances based on available feedback.
Feedback comes with 3 statuses:
 - ipdc-status (via `adms:status`) used to signal the status of the feedback resource from ipdc.
 - status (via `schema2:actionStatus`) used to signal the status of the feedback resource within lpdc.
 - processing-status (via `schema2:result`) used to signal the status of the processing of the feedback.

The microservice flags instances + adds the status based on if they have any linked feedbacks with the ipdc-status `feedbackstatus:AANGEMAAKT`.
When a feedback gets the status `Verwerkt`, the microservice unflags the linked instance if there are
no other linked feedbacks with ipdc-status `feedbackstatus:AANGEMAAKT`.

## How It Works

1. The service listens for delta notifications from [delta-notifier](https://github.com/mu-semtech/delta-notifier)
2. When a feedbacks's ipdc-status changes to the configured 'start' ipdc-status, it gets the instance linked to the
   feedback.
3. The service updates the `lpdcExt:feedbackAvailable` flag on the instance resource and sets the configured 'start'
   status on the feedback.
4. When a feedback's status is changed to the configured 'end' status, it unflags the instance if there are no other linked feedbacks in the 'start' ipdc-status.

There is also a cronjob that runs daily to make sure missed deltas are handled.