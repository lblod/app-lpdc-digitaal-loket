# Republish all instances

```
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX cpsv: <http://purl.org/vocab/cpsv#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX m8g: <http://data.europa.eu/m8g/>
  PREFIX lblodLpdc: <http://data.lblod.info/id/public-services/>
  PREFIX lblodIpdcLpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/>
  PREFIX lpdc: <http://data.lblod.info/vocabularies/lpdc/>
  PREFIX dcat: <http://www.w3.org/ns/dcat#>
  PREFIX lblodOrg: <http://data.lblod.info/id/concept/organisatie/>
  PREFIX lblodIpdcThema: <http://data.lblod.info/id/concept/ipdc-thema/>
  PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX schema: <http://schema.org/>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
  PREFIX locn: <http://www.w3.org/ns/locn>
  PREFIX adres: <https://data.vlaanderen.be/ns/adres#>
  PREFIX as:  <https://www.w3.org/ns/activitystreams#>
  PREFIX sh: <http://www.w3.org/ns/shacl#>
  PREFIX http: <http://www.w3.org/2011/http#>
  PREFIX eli: <http://data.europa.eu/eli/ontology#>
  PREFIX prov: <http://www.w3.org/ns/prov#>

  DELETE {
    GRAPH ?graph {
        ?publishedPublicService schema:datePublished ?datePublished.
    }
  } 
  WHERE {
    {
        SELECT ?publicservice (MAX(?generatedAt) AS ?maxGeneratedAt) ?graph
        WHERE {
            GRAPH ?graph {
                ?publishedPublicService a lpdcExt:PublishedInstancePublicServiceSnapshot;
                    lpdcExt:isPublishedVersionOf ?publicservice;
                    prov:generatedAtTime ?generatedAt.
            }
        } GROUP BY ?publicservice ?graph
    }
    
    GRAPH ?graph {
        ?publishedPublicService a ?type;
            prov:generatedAtTime ?generatedAt;
            schema:datePublished ?datePublished.
        FILTER(?generatedAt = ?maxGeneratedAt)
    }
  }
```

# Republish a single instance

```
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX cpsv: <http://purl.org/vocab/cpsv#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX m8g: <http://data.europa.eu/m8g/>
  PREFIX lblodLpdc: <http://data.lblod.info/id/public-services/>
  PREFIX lblodIpdcLpdc: <http://lblod.data.gift/vocabularies/lpdc-ipdc/>
  PREFIX lpdc: <http://data.lblod.info/vocabularies/lpdc/>
  PREFIX dcat: <http://www.w3.org/ns/dcat#>
  PREFIX lblodOrg: <http://data.lblod.info/id/concept/organisatie/>
  PREFIX lblodIpdcThema: <http://data.lblod.info/id/concept/ipdc-thema/>
  PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX schema: <http://schema.org/>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX ps: <http://vocab.belgif.be/ns/publicservice#>
  PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
  PREFIX locn: <http://www.w3.org/ns/locn>
  PREFIX adres: <https://data.vlaanderen.be/ns/adres#>
  PREFIX as:  <https://www.w3.org/ns/activitystreams#>
  PREFIX sh: <http://www.w3.org/ns/shacl#>
  PREFIX http: <http://www.w3.org/2011/http#>
  PREFIX eli: <http://data.europa.eu/eli/ontology#>
  PREFIX prov: <http://www.w3.org/ns/prov#>
    DELETE {
      GRAPH <my-bestuurseenheidGraph> {
        ?publishedPublicService schema:datePublished ?datePublished.
      }
    }
     WHERE {
      {
        SELECT (MAX(?generatedAt) AS ?maxGeneratedAt)
        WHERE {
            GRAPH <my-bestuurseenheidGraph> {
                ?publishedPublicService a lpdcExt:PublishedInstancePublicServiceSnapshot;
                    lpdcExt:isPublishedVersionOf <my-instance-id>;
                    prov:generatedAtTime ?generatedAt.
            }
        }
    }
    
    GRAPH <my-bestuurseenheidGraph> {
        ?publishedPublicService a lpdcExt:PublishedInstancePublicServiceSnapshot;
            prov:generatedAtTime ?maxGeneratedAt;
            schema:datePublished ?datePublished.
    }
    }
```