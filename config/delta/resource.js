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
        value: 'http://www.w3.org/ns/adms#status'
      },
      object: {
        type: 'uri',
        value: 'https://ipdc.vlaanderen.be/ns/FeedbackStatus#AANGEMAAKT'
      }
    },
    callback: {
      url: 'http://feedback-available-flag-service/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  }
  ];
  