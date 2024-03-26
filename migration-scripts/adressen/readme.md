
# Adres migration script

This migration script will fetch all adressen from configured sparql endpoint.
For each adres a match is found in the adressenregister, so we can save its id in our database. 
A ttl file is created that contains all the triple where a match is found. 
A json file is created for all the adressen where not match could be found.

The resulting ttl file must be imported manually in virtuoso conductor. 
Linked data > quad store upload > choose file (leave 'Named Graph IRI' as is)

sparql endpoint & adressenregister api key are configured in .env file.
