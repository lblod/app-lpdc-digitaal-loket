;;;;;;;;;;;;;;;;;;;
;;; delta messenger
(in-package :delta-messenger)

(add-delta-logger)
(add-delta-messenger "http://deltanotifier/")

;;;;;;;;;;;;;;;;;
;;; configuration
(in-package :client)
(setf *log-sparql-query-roundtrip* t)
(setf *backend* "http://virtuoso:8890/sparql")

(in-package :server)
(setf *log-incoming-requests-p* t)

;;;;;;;;;;;;;;;;;
;;; access rights
(in-package :acl)

(defparameter *access-specifications* nil)
(defparameter *graphs* nil)
(defparameter *rights* nil)

;; Prefixes used in the constraints below (not in the SPARQL queries)
(define-prefixes
  :validation "http://mu.semte.ch/vocabularies/validation/"
  :ext "http://mu.semte.ch/vocabularies/ext/"
  :nfo "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#"
  :supervision "http://mu.semte.ch/vocabularies/ext/supervision/"
  :prov "http://www.w3.org/ns/prov#"
  :besluit "http://data.vlaanderen.be/ns/besluit#"
  :euvoc "http://publications.europa.eu/ontology/euvoc#"
  :ontology "http://data.europa.eu/eli/ontology#"
  :org "http://www.w3.org/ns/org#"
  :rlog "http://persistence.uni-leipzig.org/nlp2rdf/ontologies/rlog#"
  :employee "http://lblod.data.gift/vocabularies/employee/"
  :skos "http://www.w3.org/2004/02/skos/core#"
  :m8g "http://data.europa.eu/m8g/"
  :organisatie "http://lblod.data.gift/vocabularies/organisatie/"
  :foaf "http://xmlns.com/foaf/0.1/"
  :ipdc-lpdc "https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#"
  :activitystreams "https://www.w3.org/ns/activitystreams#"
  :cpsv "http://purl.org/vocab/cpsv#"
  :schema "http://schema.org/"
  :schema2 "https://schema.org/"
  :dcat "http://www.w3.org/ns/dcat#"
  :terms "http://purl.org/dc/terms/"
  :locn "http://www.w3.org/ns/locn#"
  :lpdc "http://data.lblod.info/vocabularies/lpdc/"
  :adms "http://www.w3.org/ns/adms#"
  :reporting "http://lblod.data.gift/vocabularies/reporting/"
  :cogs "http://vocab.deri.ie/cogs#"
  :core "http://open-services.net/ns/core#")

(type-cache::add-type-for-prefix "http://mu.semte.ch/sessions/" "http://mu.semte.ch/vocabularies/session/Session")

(define-graph public ("http://mu.semte.ch/graphs/public")
  ("validation:Execution" -> _)
  ("validation:Validation" -> _)
  ("validation:Error" -> _)
  ("ext:FormNode" -> _)
  ("ext:FormInput" -> _)
  ("ext:DynamicSubform" -> _)
  ("ext:DocumentStatus" -> _)
  ("nfo:FileDataObject" -> _)
  ("supervision:DecisionType" -> _)
  ("supervision:TaxType" -> _)
  ("supervision:Nomenclature" -> _)
  ("supervision:FiscalPeriod" -> _)
  ("supervision:DeliveryReportType" -> _)
  ("supervision:AccountAcceptanceStatus" -> _)
  ("supervision:DocumentAuthenticityType" -> _)
  ("supervision:RegulationType" -> _)
  ("prov:Location" -> _)
  ("ext:BestuurseenheidClassificatieCode" -> _)
  ("besluit:Bestuursorgaan" -> _)
  ("ext:BestuursorgaanClassificatieCode" -> _)
  ("ext:Fractietype" -> _)
  ("ext:BestuursfunctieCode" -> _)
  ("ext:BeleidsdomeinCode" -> _)
  ("ext:GeslachtCode" -> _)
  ("euvoc:Country" -> _)
  ("ontology:LegalResource" -> _)
  ("org:Role" -> _)
  ("besluit:Bestuurseenheid" -> _)
  ("rlog:Entry" -> _)
  ("rlog:Level" -> _)
  ("rlog:StatusCode" -> _)
  ("ext:LogSource" -> _)
  ("employee:EmployeeTimePeriod" -> _)
  ("employee:UnitMeasure" -> _)
  ("employee:EducationalLevel" -> _)
  ("employee:WorkingTimeCategory" -> _)
  ("employee:LegalStatus" -> _)
  ("ext:ChartOfAccount" -> _)
  ("ext:AuthenticityType" -> _)
  ("ext:TaxType" -> _)
  ("skos:ConceptScheme" -> _)
  ("skos:Concept" -> _)
  ("m8g:Criterion" -> _)
  ("m8g:RequirementGroup" -> _)
  ("m8g:CriterionRequirement" -> _)
  ("m8g:Requirement" -> _)
  ("org:Organization" -> _)
  ("organisatie:TypeVestiging" -> _)
  ("organisatie:OrganisatieStatusCode" -> _)
  ("foaf:OnlineAccount" -> _)) ;; only this is needed for login

(define-graph organizations-ipdc-lpdc ("http://mu.semte.ch/graphs/organizations/")
  ("ipdc-lpdc:ConceptualPublicService" -> _)
  ("ipdc-lpdc:AbstractPublicService" -> _)
  ("ipdc-lpdc:InstancePublicService" -> _)
  ("activitystreams:Tombstone" -> _)
  ("m8g:PublicOrganisation" -> _)
  ("m8g:Requirement" -> _)
  ("m8g:Evidence" -> _)
  ("cpsv:Rule" -> _)
  ("m8g:Cost" -> _)
  ("m8g:Output" -> _)
  ("ipdc-lpdc:FinancialAdvantage" -> _)
  ("ontology:LegalResource" -> _)
  ("schema:ContactPoint" -> _)
  ("dcat:Distribution" -> _)
  ("terms:Location" -> _)
  ("schema:WebSite" -> _)
  ("locn:Address" -> _)
  ("lpdc:ConceptDisplayConfiguration" -> _)
  ("lpdc:FormalInformalChoice" -> _)
  ("schema2:Conversation" -> _)
  ("schema2:AskAction" -> _)
  ("schema2:ReplyAction" -> _)
  ("schema2:DataFeedItem" -> _))

(define-graph org ("http://mu.semte.ch/graphs/organizations/")
  ("foaf:Person" -> _)
  ("foaf:OnlineAccount" -> _)
  ("adms:Identifier" -> _))

(define-graph sessions ("http://mu.semte.ch/graphs/sessions")
  ("http://mu.semte.ch/vocabularies/session/Session" -> _))

(define-graph organizations-admin ("http://mu.semte.ch/graphs/organizations/")
  ("reporting:Report" -> _)
  ("cogs:Job" -> _)
  ("core:Error" -> _)
  ("nfo:DataContainer" -> _)
  ("nfo:FileDataObject" -> _))

(supply-allowed-group "public")

(supply-allowed-group "LoketLB-LPDCGebruiker"
  :parameters ("session_group" "session_role")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                        ext:sessionRole ?session_role.
            FILTER( ?session_role = \"LoketLB-LPDCGebruiker\" )
          }")

(supply-allowed-group "logged-in-or-impersonating"
  :parameters ("session_group")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group WHERE {
            {
              <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group.
            } UNION {
              <SESSION_ID> ext:originalSessionGroup/mu:uuid ?session_group.
            }
          }")

(supply-allowed-group "admin"
  :parameters ()
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
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
          LIMIT 1")

(supply-allowed-group "LoketLB-AdminDashboardLPDC"
  :parameters ("session_group" "session_role")
  :query "PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
          PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
          SELECT DISTINCT ?session_group ?session_role WHERE {
            <SESSION_ID> ext:sessionGroup/mu:uuid ?session_group;
                        ext:sessionRole ?session_role.
            FILTER( ?session_role = \"LoketLB-AdminDashboardLPDC\" )
          }")

(grant (read)
  :to-graph (public)
  :for-allowed-group "public")

(grant (read write)
  :to-graph (organizations-ipdc-lpdc)
  :for-allowed-group "LoketLB-LPDCGebruiker")

(grant (read)
  :to-graph (org)
  :for-allowed-group "logged-in-or-impersonating")

(grant (read write)
  :to-graph (sessions)
  :for-allowed-group "admin")

(grant (read write)
  :to-graph (organizations-admin)
  :for-allowed-group "LoketLB-AdminDashboardLPDC")