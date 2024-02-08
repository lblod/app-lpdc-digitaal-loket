# 16. Data Integrity Tests

Date: 2024-02-08

## Status

Accepted

## Context

To ensure the quality and integrity of data within our application, we have created data integrity tests as explained in our [testing approach](0006-testing-approach.md).
These tests are designed to identifying data inconsistencies, such as additional or missing data.
The virtuoso database only supports a transactions in a single insert(delete) query. You cannot insert update multiple aggregates in one transaction. This might lead to data inconsistencies between different aggregates. 
The goal is to obtain insight into the quality of our data, enabling us to maintain a high standard of data accuracy and reliability.

## Decision

- We wrote tests that generate a rapport detailing all the data inconsistencies. 
- We also want to create a batch job to address and rectify inconsistencies between aggregates. 
- This proactive approach not only highlights issues but also ensures they are corrected, thus enhancing the overall integrity of our data.

## Consequences

- **Improved Data Quality**: With the implementation of these tests and corrective batch job, we can improve the reliability of our data.
- **Increased Trust in Data**: We are now aware of the inconsistencies in our data and know the quality of our data.
- **Proactive Problem Resolution**: The batch job created to fix data inconsistencies acts proactively, preventing minor issues from escalating into larger problems.
