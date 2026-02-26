export default [
    {
      match: {
        subject: {}
      },
      callback: {
        url: 'http://resource/.mu/delta',
        method: 'POST'
      },
      options: {
        resourceFormat: 'v0.0.1',
        gracePeriod: 250,
        ignoreFromSelf: true,
        optOutMuScopeIds: [ "http://redpencil.data.gift/id/concept/muScope/deltas/initialSync" ]
      }
    },
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'https://www.w3.org/ns/adms#status'
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
  