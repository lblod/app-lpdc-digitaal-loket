export default [
  {
    match: {
      predicate: {
        type: "uri",
        value:
          "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#feedbackAvailable",
      },
      object: {
        type: "literal",
        value: "true",
      },
    },
    callback: {
      url: "http://lpdc-email-notification-service/delta-feedback",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 1000,
      ignoreFromSelf: false,
    },
  },
  {
    match: {
      predicate: {
        type: "uri",
        value:
          "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#needsConversionFromFormalToInformal",
      },
      object: {
        type: "literal",
        value: "true",
      },
    },
    callback: {
      url: "http://lpdc-email-notification-service/delta-formal-informal",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 1000,
      ignoreFromSelf: false,
    },
  },
  {
    match: {
      predicate: {
        type: "uri",
        value: "http://mu.semte.ch/vocabularies/ext/reviewStatus",
      },
      object: {
        type: "uri",
        value:
          "http://lblod.data.gift/concepts/review-status/concept-gewijzigd",
      },
    },
    callback: {
      url: "http://lpdc-email-notification-service/delta-review-status",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 1000,
      ignoreFromSelf: false,
    },
  },
  {
    match: {
      predicate: {
        type: "uri",
        value: "http://mu.semte.ch/vocabularies/ext/reviewStatus",
      },
      object: {
        type: "uri",
        value:
          "http://lblod.data.gift/concepts/review-status/concept-gearchiveerd",
      },
    },
    callback: {
      url: "http://lpdc-email-notification-service/delta-review-status",
      method: "POST",
    },
    options: {
      resourceFormat: "v0.0.1",
      gracePeriod: 1000,
      ignoreFromSelf: false,
    },
  },
];
