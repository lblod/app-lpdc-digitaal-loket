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
        value: 'https://schema.org/actionStatus'
      },
      object: {
        type: 'uri',
        value: 'http://lblod.data.gift/concepts/1b3c5e7f-2a4d-4c6e-9f1b-3d5a7c9e2f4b'
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
  