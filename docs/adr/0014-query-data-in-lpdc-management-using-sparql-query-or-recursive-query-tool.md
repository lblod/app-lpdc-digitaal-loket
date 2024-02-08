# 14. Query data in lpdc management using SPARQL query or recursive query tool

Date: 2024-02-07

## Status

Accepted

## Context

[SPARQL](https://www.w3.org/TR/sparql11-overview/) provides many [Query Forms](https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#QueryForms), you can SELECT, CONSTRUCT, ASK.

SELECT reflects the semantic model being used the best: the predicates queried are explicit, the use of OPTIONAL blocks is intentional. A disadvantage of using SELECT with many OPTIONAL blocks is its slow processing by Virtuoso, and possible confusion by its query optimizer (refuses to query if deemed to costly). 

CONSTRUCT can be used to construct a new graph. 

ASK can be used to verify a condition, to see if a certain condition holds in the dataset.

We need to find a balance between meaningful code and consider the performance implications of that meaningful code. The most meaningful code will be written using SELECT queries, however this might not be feasible for complex objects. 

## Decision

- We will not use CONSTRUCT queries in lpdc management.
- We will use SELECT queries for 'simple' objects. To give a rough guideline: 5 or 6 fields, 1 or max 2 optional blocks. We will map this select result in the sparqlrepository directly in a domain object.
- For querying a more complex aggregate / entity, we will write a `DatastoreToQuadsRecursiveSparqlFetcher`
  - As a starting point, filters on an iri (id) and a graph
  - Next, query recursively all triples found, and its relations
  - Provide stopping conditions in the form of `predicatesToNotQuery`, `predicatesToStopRecursion`, `illegalTypesToRecurseInto`
  - And never query outside the assigned graph.
  - Assigning meaning to this set of quads can be done through: `DomainToQuadsMapper` (which transforms an array of quads into a domain object, providing extra validation of the input).
- For simple true / false questions, provide a ASK query (thereby also filtering on graph)
- To provide query result, and or semantics verification on the queries, use `SparqlQuerying` class
  - Following methods are provided: `insert`, `delete`, `deleteInsert`, `singleRow`, `list`, `ask` 
  - Don't query a virtuoso store directly using a http call.
- Only send one query at a time; don't send multiple queries separated by ';'

## Consequences
- Flexibility of querying is restricted. We believe all logic can be implemented using the above concepts.
