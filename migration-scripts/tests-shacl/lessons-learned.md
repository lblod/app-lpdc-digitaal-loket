### because of closed world assumption of shacl, you need to load all 'dependencies' in the validation context 

[SHACL](https://www.w3.org/TR/shacl/) [validates](https://www.w3.org/TR/shacl/#validation) a set of rules (**[shapes graph](https://www.w3.org/TR/shacl/#shapes-graph)**) against a set of data (**[data graph](https://www.w3.org/TR/shacl/#data-graph)**).

The set of data (the input, the data graph) needs to include **all data related to the validation process**. Because of the flexible nature of linked data, the boundary between meta data and data can be blurred and seem confusing. The following information is typically needed when wanting to validate some input:
- the actual instantiated data of the type you want to validate
- the data of its dependencies (or at least that part that you want to validate)
- the schema / ontologies explaining the types, its relations, subtypes, etc.

A schematic overview of a shacl validation context 


![shacl-validation-context.png](img%2Fshacl-validation-context.png)

You can find code examples where we load all of this to validate a published instance [here](instances.ts).

This also means that it is good practice to define for each a schema / ontology. 

### language in constraint vs language equals constraint

The default SHACL validation for languages is [Language In Constraint](https://www.w3.org/TR/shacl/#LanguageInConstraintComponent), and not _Language Equals Constraint_.

This means that the comparison algorithm is 'starts with', instead of 'equals'.  

As an example:

```rdf

    shacl:languageIn ("en" "nl" "nl-be-x-formal" "nl-be-x-informal");
```
gives that specifying a triple with language 'en', 'en-gb', 'en-us', are all ok. But when you for instance want an extension and for 'nl', 'nl-be-x-formal', 'nl-be-x-informal' (either you say nl, or a nl-formal, or nl-informal), you are out of luck to exactly validate, any nl-xxx is ok for shacl.

### inter-field comparisons can be limiting or become verbose

The [Core Constraint Components](https://www.w3.org/TR/shacl/#core-components) supports inter field comparisons, the use cases where you can use this feature, are limiting and it at all if possible, the resulting shapes can become very verbose. 

### not all shacl validation engines support sparql queries

The [SPARQL-based Constraints](https://www.w3.org/TR/shacl/#sparql-constraints) and [SPARQL-based Constraint Components](https://www.w3.org/TR/shacl/#sparql-constraint-components) explained in the spec are not (fully) supported by a lot of standalone shacl validation engines.

This limits the flexibility for complex contextual or non-declarative shapes.  

### virtuoso opensource database does not support shacl validation for data at rest

The virtuoso opensource database does not support shacl validation for data at rest. So, the validation needs to happen on each path where data is manipulated when saving. A further complication is that applications need to be aware of possible conflicting updates that in combined update create an inconsistent state ... So this requires careful application design. 

### shacl is a specification, its implementation can vary
### declaring extensions in shacl is easy, implementing and distributing them not

SHACL is a spec designed to be extensible. The implementation of the spec and any extensions however is not standard. Each technology and library needs its own implementation. 

This limits defining a shacl shape for a shared contract, and using it actively for input data validation. 
Choosing a constraint not specified in [Core Constraint Components](https://www.w3.org/TR/shacl/#core-components) would need even more coordination and ambiguity resolving.

We find that implementations for the standard spec are not [always fully compliant](https://w3c.github.io/data-shapes/data-shapes-test-suite/).
