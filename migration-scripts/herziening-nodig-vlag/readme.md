# Herziening nodig migratie vlag

This migration script will fetch all instanties that don't have a review status, and for which the linked conceptsnapshot is different than the latest from the concept, then run a functional comparison to see if contents changed, it this is the case, generate a review status output in the form of a ttl.

The resulting ttl file must be imported manually in virtuoso conductor. 
Linked data > quad store upload > choose file (leave 'Named Graph IRI' as is)

Configure SPARQL_URL and LPDC_MANAGEMENT_URL in an .env file.
