# Feedback Available Flag Service

This [microservice](https://github.com/lblod/feedback-available-flag-service) is used to flag instances based on available feedback.
Feedback comes with two status:
 - status (via `adms:status`) used to signal the status of the feedback resource.
 - processing-status (via `schema2:actionStatus`) used to signal the status of the processing of the feedback.

The microservice flags instances based on if they have any linked feedbacks with the status `feedbackstatus:AANGEMAAKT `.

## How It Works

1. The service listens for delta notifications from [delta-notifier](https://github.com/mu-semtech/delta-notifier)
2. When a feedbacks's status changes to or from the configured 'available' status, it gets the instance linked to the
   feedback.
3. The service updates the `schema:flagged` flag on the instance resource

There is also a cronjob that runs daily to make sure missed deltas are handled.