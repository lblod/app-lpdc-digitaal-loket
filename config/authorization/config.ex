alias Acl.Accessibility.Always, as: AlwaysAccessible
alias Acl.Accessibility.ByQuery, as: AccessByQuery
alias Acl.GraphSpec.Constraint.Resource.NoPredicates, as: NoPredicates
alias Acl.GraphSpec.Constraint.ResourceFormat, as: ResourceFormatConstraint
alias Acl.GraphSpec.Constraint.Resource, as: ResourceConstraint
alias Acl.GraphSpec, as: GraphSpec
alias Acl.GroupSpec, as: GroupSpec
alias Acl.GroupSpec.GraphCleanup, as: GraphCleanup

defmodule Acl.UserGroups.Config do
  defp access_by_role( group_string ) do
    %AccessByQuery{
      vars: ["session_group","session_role"],
      query: sparql_query_for_access_role( group_string ) }
  end

  defp access_by_role_for_single_graph( group_string ) do
    %AccessByQuery{
      vars: [],
      query: sparql_query_for_access_role( group_string ) }
  end

  defp sparql_query_for_access_role( group_string ) do
    "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    SELECT DISTINCT ?session_group ?session_role WHERE {
      <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                   ext:sessionRole ?session_role.
      FILTER( ?session_role = \"#{group_string}\" )
    }"
  end

  defp is_admin() do
    %AccessByQuery{
      vars: [],
      query: "
        PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
        SELECT DISTINCT ?session_role WHERE {
          VALUES ?session_role {
            \"LoketLB-admin\"
          }
          VALUES ?session_id {
            <SESSION_ID>
          }
          {
            ?session_id ext:sessionRole ?session_role .
          } UNION {
            ?session_id ext:originalSessionRole ?session_role .
          }
        }
        LIMIT 1"
      }
  end

  def user_groups do
    # These elements are walked from top to bottom.  Each of them may
    # alter the quads to which the current query applies.  Quads are
    # represented in three sections: current_source_quads,
    # removed_source_quads, new_quads.  The quads may be calculated in
    # many ways.  The useage of a GroupSpec and GraphCleanup are
    # common.
    [
      # // PUBLIC
      %GroupSpec{
        name: "public",
        useage: [:read],
        access: %AlwaysAccessible{}, # TODO: Should be only for logged in users
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/public",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://mu.semte.ch/vocabularies/validation/Execution",
                        "http://mu.semte.ch/vocabularies/validation/Validation",
                        "http://mu.semte.ch/vocabularies/validation/Error",
                        "http://mu.semte.ch/vocabularies/ext/FormNode",
                        "http://mu.semte.ch/vocabularies/ext/FormInput",
                        "http://mu.semte.ch/vocabularies/ext/DynamicSubform",
                        "http://mu.semte.ch/vocabularies/ext/DocumentStatus",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://mu.semte.ch/vocabularies/ext/supervision/DecisionType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/TaxType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/Nomenclature",
                        "http://mu.semte.ch/vocabularies/ext/supervision/FiscalPeriod",
                        "http://mu.semte.ch/vocabularies/ext/supervision/DeliveryReportType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/AccountAcceptanceStatus",
                        "http://mu.semte.ch/vocabularies/ext/supervision/DocumentAuthenticityType",
                        "http://mu.semte.ch/vocabularies/ext/supervision/RegulationType",
                        "http://www.w3.org/ns/prov#Location",
                        "http://mu.semte.ch/vocabularies/ext/BestuurseenheidClassificatieCode",
                        "http://data.vlaanderen.be/ns/besluit#Bestuursorgaan",
                        "http://mu.semte.ch/vocabularies/ext/BestuursorgaanClassificatieCode",
                        "http://mu.semte.ch/vocabularies/ext/Fractietype",
                        "http://mu.semte.ch/vocabularies/ext/BestuursfunctieCode",
                        "http://mu.semte.ch/vocabularies/ext/BeleidsdomeinCode",
                        "http://mu.semte.ch/vocabularies/ext/GeslachtCode",
                        "http://publications.europa.eu/ontology/euvoc#Country",
                        "http://data.europa.eu/eli/ontology#LegalResource",
                        "http://www.w3.org/ns/org#Role",
                        "http://data.vlaanderen.be/ns/besluit#Bestuurseenheid",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#Entry",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#Level",
                        "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#StatusCode",
                        "http://mu.semte.ch/vocabularies/ext/LogSource",
                        "http://lblod.data.gift/vocabularies/employee/EmployeeTimePeriod",
                        "http://lblod.data.gift/vocabularies/employee/UnitMeasure",
                        "http://lblod.data.gift/vocabularies/employee/EducationalLevel",
                        "http://lblod.data.gift/vocabularies/employee/WorkingTimeCategory",
                        "http://lblod.data.gift/vocabularies/employee/LegalStatus",
                        "http://mu.semte.ch/vocabularies/ext/ChartOfAccount",
                        "http://mu.semte.ch/vocabularies/ext/AuthenticityType",
                        "http://mu.semte.ch/vocabularies/ext/TaxType",
                        "http://www.w3.org/2004/02/skos/core#ConceptScheme",
                        "http://www.w3.org/2004/02/skos/core#Concept",
                        "http://data.europa.eu/m8g/Criterion",
                        "http://data.europa.eu/m8g/RequirementGroup",
                        "http://data.europa.eu/m8g/CriterionRequirement",
                        "http://data.europa.eu/m8g/Requirement",
                        "http://www.w3.org/ns/org#Organization",
                        "http://lblod.data.gift/vocabularies/organisatie/TypeVestiging",
                        "http://lblod.data.gift/vocabularies/organisatie/OrganisatieStatusCode"
                      ]
                    } },
                  %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/sessions",
                    constraint: %ResourceFormatConstraint{
                      resource_prefix: "http://mu.semte.ch/sessions/"
                    } } ] },


      # // PUBLIC - accounts
      %GroupSpec{
        name: "public",
        useage: [:read, :read_for_write],
        access: %AlwaysAccessible{},
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/public",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://xmlns.com/foaf/0.1/OnlineAccount",
                      ]
                    }
                  }
                ]
      },

      # // LPDC-IPDC
      %GroupSpec{
        name: "o-ipdc-lpdc-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-LPDCGebruiker" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#AbstractPublicService",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService",
                        "https://www.w3.org/ns/activitystreams#Tombstone",
                        "http://data.europa.eu/m8g/PublicOrganisation",
                        "http://data.europa.eu/m8g/Requirement",
                        "http://data.europa.eu/m8g/Evidence",
                        "http://purl.org/vocab/cpsv#Rule",
                        "http://data.europa.eu/m8g/Cost",
                        "http://data.europa.eu/m8g/Output",
                        "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage",
                        "http://data.europa.eu/eli/ontology#LegalResource",
                        "http://schema.org/ContactPoint",
                        "http://www.w3.org/ns/dcat#Distribution",
                        "http://purl.org/dc/terms/Location",
                        "http://schema.org/WebSite",
                        "http://www.w3.org/ns/locn#Address",
                        "http://data.lblod.info/vocabularies/lpdc/ConceptDisplayConfiguration",
                        "http://data.lblod.info/vocabularies/lpdc/FormalInformalChoice",
                        "https://schema.org/Conversation",
                        "https://schema.org/AskAction",
                        "https://schema.org/ReplyAction",
                        "https://schema.org/DataFeedItem",
                        ] } } ] },

      # // ORGANIZATION HAS POSSIBLY DUPLICATE USER DATA
      %GroupSpec{
        name: "org",
        useage: [:read],
        access: %AccessByQuery{
          vars: ["session_group"],
          query: "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
                  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
                  SELECT DISTINCT ?session_group WHERE {
                    {
                      <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
                    } UNION {
                      <SESSION_ID> ext:originalSessionGroup/mu:uuid ?session_group.
                    }
                  }" },
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://xmlns.com/foaf/0.1/Person",
                        "http://xmlns.com/foaf/0.1/OnlineAccount",
                        "http://www.w3.org/ns/adms#Identifier",
                      ] } } ] },

      # // LPDC Admin
      %GroupSpec{
        name: "o-admin-sessions-rwf",
        useage: [:read, :write, :read_for_write],
        access: is_admin(),
        graphs: [
          %GraphSpec{
            graph: "http://mu.semte.ch/graphs/sessions",
            constraint: %ResourceFormatConstraint{
              resource_prefix: "http://mu.semte.ch/sessions/"
            }
          },
        ]
      },

      # // Dashboard admin
      %GroupSpec{
        name: "o-admin-rwf",
        useage: [:read, :write, :read_for_write],
        access: access_by_role( "LoketLB-AdminDashboardLPDC" ),
        graphs: [ %GraphSpec{
                    graph: "http://mu.semte.ch/graphs/organizations/",
                    constraint: %ResourceConstraint{
                      resource_types: [
                        "http://lblod.data.gift/vocabularies/reporting/Report",
                        "http://vocab.deri.ie/cogs#Job",
                        "http://open-services.net/ns/core#Error",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#FileDataObject",
                        "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#DataContainer"
                      ] } } ] },

      # // USER HAS NO DATA
      # this was moved to org instead.
      # perhaps move some elements to public when needed for demo
      # purposes.


      # // CLEANUP
      #
      %GraphCleanup{
        originating_graph: "http://mu.semte.ch/application",
        useage: [:write],
        name: "clean"
      }
    ]
  end
end
