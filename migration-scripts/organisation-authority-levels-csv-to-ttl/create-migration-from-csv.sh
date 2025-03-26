#!/bin/bash

# Create ttl file
filename="$(date +%Y%m%d%H%M%S)-insert-organisation-authority-levels.ttl"
touch "$filename"

# Add prefix header
echo -e "@prefix lpdc:  <http://data.lblod.info/vocabularies/lpdc/> .\n" >> "$filename"

while IFS=";" read -r ovo_nr naam bestuursniveau lpdcName class uri
do
  level=""

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

  echo "<$uri> lpdc:competencyLevel <https://productencatalogus.data.vlaanderen.be/id/concept/BevoegdBestuursniveau/$level>. #$lpdcName" >> "$filename"
  echo -e "<$uri> lpdc:executionLevel <https://productencatalogus.data.vlaanderen.be/id/concept/UitvoerendBestuursniveau/$level>. \n" >> "$filename"
done < <(tail -n +3 lpdc.csv)

echo "TTL file generation completed"
