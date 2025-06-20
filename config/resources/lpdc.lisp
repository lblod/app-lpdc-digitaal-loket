(define-resource abstract-public-service ()
  :class (s-prefix "lpdcExt:AbstractPublicService")
  :properties `((:name :language-string-set ,(s-prefix "dct:title"))
                (:description :language-string-set ,(s-prefix "dct:description"))
                (:additional-description :language-string-set ,(s-prefix "lpdcExt:additionalDescription"))
                (:keyword :language-string-set ,(s-prefix "dcat:keyword"))
                (:regulations :language-string-set ,(s-prefix "lpdcExt:regulation"))
                (:exceptions :language-string-set ,(s-prefix "lpdcExt:exception"))
                (:start-date :datetime ,(s-prefix "schema:startDate"))
                (:end-date :datetime ,(s-prefix "schema:endDate"))
                (:date-created :datetime ,(s-prefix "schema:dateCreated"))
                (:date-modified :datetime ,(s-prefix "schema:dateModified"))
                (:product-id :string ,(s-prefix "schema:productID"))
                (:versioned-source :string ,(s-prefix "ext:hasVersionedSource")))
  :has-one `((concept :via ,(s-prefix "dct:type")
                      :as "type")
             (concept :via ,(s-prefix "adms:status")
                      :as "status"))
  :has-many `((concept :via ,(s-prefix "pera:language")
                             :as "language")
              (concept :via ,(s-prefix "lpdcExt:targetAudience")
                       :as "target-audiences")
              (concept :via ,(s-prefix "m8g:thematicArea")
                       :as "thematic-areas")
              (concept :via ,(s-prefix "lpdcExt:publicationMedium")
                           :as "publication-media"))
  :resource-base (s-url "http://data.lblod.info/id/conceptual-public-service/")
  :features '(include-uri)
  :on-path "abstract-public-services"
)

(define-resource conceptual-public-service (abstract-public-service)
  :class (s-prefix "lpdcExt:ConceptualPublicService")
  :properties `((:has-latest-functional-change :string ,(s-prefix "lpdc:hasLatestFunctionalChange")))
  :has-one `((concept-display-configuration :via ,(s-prefix "lpdc:hasConceptDisplayConfiguration")
                                            :as "display-configuration"))
  :has-many `((public-service :via ,(s-prefix "dct:source")
                              :inverse t
                              :as "instances"))
  :resource-base (s-url "http://data.lblod.info/id/conceptual-public-service/")
  :features '(include-uri)
  :on-path "conceptual-public-services"
)

(define-resource public-service (abstract-public-service)
  :class (s-prefix "lpdcExt:InstancePublicService")
  :properties `((:dutch-language-variant :string ,(s-prefix "lpdcExt:dutchLanguageVariant"))
                (:needs-conversion-from-formal-to-informal :boolean ,(s-prefix "lpdcExt:needsConversionFromFormalToInformal"))
                (:for-municipality-merger :boolean ,(s-prefix "lpdcExt:forMunicipalityMerger"))
                (:date-sent :datetime ,(s-prefix "schema:dateSent")))
  :has-one `((concept :via ,(s-prefix "ext:reviewStatus")
                      :as "review-status")
             (conceptual-public-service :via ,(s-prefix "dct:source")
                                        :as "concept")
             (bestuurseenheid :via ,(s-prefix "pav:createdBy")
                              :as "created-by")
             (gebruiker :via ,(s-prefix "ext:lastModifiedBy")
                        :as "last-modifier")
             (gebruiker :via ,(s-prefix "dct:creator")
                     :as "creator"))
  :resource-base (s-url "http://data.lblod.info/id/public-service/")
  :features '(include-uri)
  :on-path "public-services"
)

(define-resource concept-display-configuration ()
  :class (s-prefix "lpdc:ConceptDisplayConfiguration")
  :properties `((:is-new-concept :boolean ,(s-prefix "lpdc:conceptIsNew"))
                (:is-instantiated :boolean ,(s-prefix "lpdc:conceptInstantiated")))
  :resource-base (s-url "http://data.lblod.info/id/conceptual-display-configuration/")
  :features '(include-uri)
  :on-path "concept-display-configurations"
)
