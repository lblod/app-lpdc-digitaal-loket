# Lpdc Feedback Management Service

Microservice used to ingest feedback data from IPDC LDES feed, flag instances based on available feedback, and publish feedback answers back to IPDC.

Designed for the [semantic.works](https://semantic.works/) microservices stack.
This microservice is made for [LPDC](https://github.com/lblod/app-lpdc-digitaal-loket) but can be configured via
environment variables to be used in other applications that use the same feedback resource.

**Git Repository:** https://github.com/lblod/lpdc-feedback-management-service

## Overview

The service manages three primary workflows:

1. **LDES Ingestion** - Consumes feedback snapshots from IPDC LDES feed and enriches them
2. **Instance Flagging** - Flags public service instances when linked to active feedback
3. **Answer Publishing** - Publishes feedback answers back to IPDC with retry logic

### Feedback Statuses

Feedback comes with 3 statuses:

- **ipdc-status** (via `adms:status`) - Status of the feedback from IPDC perspective
- **lpdc-status** (via `schema:actionStatus`) - Status within LPDC system
- **processing-status** (via `schema:result`) - Processing state of the feedback

## How It Works

### Delta Processing

The service listens for delta notifications from [delta-notifier](https://github.com/mu-semtech/delta-notifier) through three endpoints:

1. **`/delta-ingest`** - Processes new feedback snapshots arriving from IPDC LDES feed
   - Extracts feedback data from the LDES graph
   - Enriches feedback with additional metadata
   - Moves feedback to the appropriate organization graph

2. **`/delta-status-start`** - Flags instances when feedback is created
   - Triggered when feedback gets ipdc-status `AANGEMAAKT`
   - Finds the linked instance
   - Sets `lpdcExt:feedbackAvailable` flag to `true` on the instance
   - Sets the configured lpdc-status on the feedback

3. **`/delta-status-end`** - Unflags instances when feedback is processed
   - Triggered when feedback gets lpdc-status `Verwerkt`
   - Checks if the linked instance has other open feedback
   - Unflags the instance if no other feedback with ipdc-status `AANGEMAAKT` exists

### Scheduled Jobs

The service runs three cronjobs:

1. **LDES Ingest Job** (default: every minute `*/1 * * * *`)
   - Processes any pending feedback snapshots
   - Complements delta-based ingestion to handle missed updates

2. **Publish Job** (default: every minute `*/1 * * * *`)
   - Finds feedback answers ready to publish
   - Sends them to IPDC via HTTP endpoint
   - Implements retry logic (default: 5 attempts)
   - Records publication errors for debugging

3. **Healing Job** (default: daily at 3 AM `0 3 * * *`)
   - Recovers from missed delta notifications
   - Sets missing lpdc-status on feedbacks with ipdc-status `AANGEMAAKT`
   - Corrects incorrectly flagged instances
   - Flags instances that should be flagged but aren't

### Publishing Flow

When a feedback answer is ready to be published:

1. Service checks if the feedback has the correct status for publishing
2. Validates and enriches the payload (converts bestuurseenheid to OVO concept if needed)
3. Sends HTTP POST request to IPDC endpoint with authentication
4. On success: Updates feedback to published status
5. On failure: Increments retry counter, will retry on next publish job
6. After max retries: Records error for manual investigation

## Configuration

The service is configured through environment variables. Key configuration includes:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `IPDC_JSON_ENDPOINT` | **Yes** | - | IPDC publish endpoint URL |
| `IPDC_X_API_KEY` | **Yes** | - | API key for IPDC endpoint |
| `HEALING_CRON` | No | `0 3 * * *` | Schedule for healing job (daily at 3 AM) |
| `INGEST_CRON` | No | `*/1 * * * *` | Schedule for LDES ingest job (every minute) |
| `PUBLISH_CRON` | No | `*/1 * * * *` | Schedule for publish job (every minute) |
| `RETRY_COUNTER_LIMIT` | No | `5` | Max publish retry attempts |
| `ERROR_EXPIRATION_MONTHS` | No | `1` | Months to keep publication errors |
| `DEBUG` | No | `false` | Enable debug logging |


## Delta Configuration

The service requires delta rules in `config/delta/feedbackManagementService.js`:

```javascript
export default [
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://www.w3.org/ns/adms#status'
      },
      object: {
        type: 'uri',
        value: 'https://ipdc.vlaanderen.be/ns/FeedbackStatus#AANGEMAAKT'
      }
    },
    callback: {
      url: 'http://lpdc-feedback-management-service/delta-status-start',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: false
    }
  },
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      },
      object: {
        type: 'uri',
        value: 'https://schema.org/Conversation'
      },
      graph: {
        type: 'uri',
        value: 'http://mu.semte.ch/graphs/lpdc/feedbacksnapshot-ldes-data'
      }
    },
    callback: {
      url: 'http://lpdc-feedback-management-service/delta-ingest',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  },
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'https://schema.org/actionStatus'
      },
      object: {
        type: 'uri',
        value: 'http://lblod.data.gift/concepts/2e4a6c8d-9f1b-4d3e-5a7c-9e1f3b5d7a9c'
      }
    },
    callback: {
      url: 'http://lpdc-feedback-management-service/delta-status-end',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: false
    }
  }
];
```

## Related Services

- [delta-notifier](https://github.com/mu-semtech/delta-notifier) - Triggers this service on data changes
- [ldes-consumer-feedbacksnapshot-ipdc](https://github.com/lblod/ldes-consumer-service) - Consumes IPDC LDES feed