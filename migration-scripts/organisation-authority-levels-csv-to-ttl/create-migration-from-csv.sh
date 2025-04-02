#!/bin/bash

# Create ttl file
filename="$(date +%Y%m%d%H%M%S)-insert-organisation-authority-levels"
ttlFile="$filename.ttl"
graphFile="$filename.graph"

touch "$ttlFile"
touch "$graphFile"

echo "http://mu.semte.ch/graphs/public" >> "$graphFile"

# Add prefix header
echo -e "@prefix lpdc:  <http://data.lblod.info/vocabularies/lpdc/> .\n" >> "$ttlFile"

while IFS=";" read -r ovo_nr naam bestuursniveau lpdcName class uri
do
  level=""

  # if no uri found, skip the org since it's not yet known in OP
  if [ -z $uri ]; then
    continue;
  fi

  case "$bestuursniveau" in
    "Lokale overheid")
      level="Lokaal"
      ;;
    "Vlaamse overheid")
      level="Vlaams"
      ;;
    "Europese overheid")
      level="Europees"
      ;;
    "Provinciale overheid")
      level="Provinciaal"
      ;;
    "Federale overheid")
      level="Federaal"
      ;;
  esac

  echo "<$uri> lpdc:organizationCompetencyLevel <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/$level>. #$lpdcName" >> "$ttlFile"
  echo -e "<$uri> lpdc:organizationExecutingLevel <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/$level>. \n" >> "$ttlFile"
done < <(tail -n +3 lpdc.csv)

echo "TTL file generation completed"
