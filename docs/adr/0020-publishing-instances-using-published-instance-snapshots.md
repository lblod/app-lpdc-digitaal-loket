# 20. Publishing Instances Using PublishedInstanceSnapshots

Date: 2024-07-12

## Status

Accepted

## Context
In the process of publishing instances, multiple race conditions and potential issues were identified.
Previously, two services were updating the same aggregate, leading to race conditions.

For example, when a user made additional changes to the instance quickly after pressing the publish button. The instance send to IPDC could already include these additional changes.
Additionally, the instance could become a tombstone during the sending process, causing the publishedDate to be set on the tombstone. This prevented the tombstone from being sent to IPDC, leading to inconsistencies.

## Decision
To mitigate these issues, the decision was made to create a PublishedInstanceSnapshot, which is essentially a copy of the instance at the moment of deletion. The publishing process will query these PublishedInstanceSnapshots and send them to IPDC.

### Key Decisions:
**1. Creation of PublishedInstanceSnapshot:**

When an instance is published, a snapshot of the data is created and saved as a PublishedInstanceSnapshot.
This snapshot ensures that the state of the instance at the moment of publishing is preserved and used for the publishing process.

**2. Order of Processing Snapshots:**

Multiple PublishedInstanceSnapshots for the same instance can exist.
These snapshots need to be processed in the order of their creation to maintain consistency.

If a PublishedInstanceSnapshot is not valid for IPDC, it could cause the instance to be stuck in publishing indefinitely.
To address this, only the latest PublishedInstanceSnapshot will be published. This allows the user to correct any errors and republish the instance.

## Consequences

### Positive Consequences:
- **Improved Consistency:** By using PublishedInstanceSnapshots, the state of the instance at the time of publishing is preserved, reducing the likelihood of race conditions and inconsistencies.
- **User Correction Capability:** Allowing only the latest PublishedInstanceSnapshot to be published enables users to correct errors and republish without manual intervention.

### Negative Consequences:
- **Manual Intervention for Tombstones:** If an instance is deleted immediately after being published, it is possible that only the tombstone will be sent to IPDC.
  This scenario will result in an error from IPDC, as the instance is not known in their system. Consequently, this tombstone will be continuously retried for publishing.
  Manual intervention will be required to resolve this issue.
