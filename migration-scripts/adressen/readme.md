
# Adres migration script

This migration script will fetch all addresses from sparql endpoint http://localhost:8890/sparql.
For each adres a match is found in the adressenregister, so we can save its id in our database. 
A ttl file is created that contains all the triple where a match is found. 
A json file is created for all the address where not match could be found.