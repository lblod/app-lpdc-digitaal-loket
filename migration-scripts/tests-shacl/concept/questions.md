- prefix: @prefix oss: <https://data.vlaanderen.be/doc/implementatiemodel/ipdc-lpdc/ontwerpstandaard/2022-06-15#> .
- prefix: @prefix locn: <http://www.w3.org/ns/locn#> .
- shacl:path <https://www.w3.org/ns/locn#adminUnitL2> : ? should this not be ? shacl:path <http://www.w3.org/ns/locn#adminUnitL2>
- why shacl:closed false everywhere ? it allows any other field.
- prefix: @prefix adres: <https://data.vlaanderen.be/ns/adres#> .
- when in an example for a rdf:langString, specifying it via:

```
ex:someAddress
a locn:Address ;
adres:land "abc"@en .
```
we always get following error ... 
```
Message:
[]
Path:
NamedNode { value: 'https://data.vlaanderen.be/ns/adres#land' }
FocusNode:
NamedNode { value: 'http://example.com/ns#someAddress' }
Severity:
NamedNode { value: 'http://www.w3.org/ns/shacl#Violation' }
SourceConstraintComponent:
NamedNode {
value: 'http://www.w3.org/ns/shacl#ClassConstraintComponent'
}
SourceShape:
BlankNode { value: 'b2' }
```

when data type = xsd:string, then it rightly complains that "dd"@nl is not the correct datatype, but "data" is
- prefix: @prefix lpdcExt:  <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#> .
- prefix: @prefix cpsv:	<http://purl.org/vocab/cpsv#> .
- prefix: @prefix m8g:	<http://data.europa.eu/m8g/> .
- shacl:class <http://fixme.com#URL>; ???  => (url): xsd:string ??
- prefix: @prefix pera: <http://publications.europa.eu/resource/authority/> .

