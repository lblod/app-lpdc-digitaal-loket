(in-package :mu-cl-resources)

(define-resource source-document ()
  :class (s-prefix "lpdc:SourceDocument")
  :properties `((:title          :string ,(s-prefix "dct:title"))
                (:extracted-html :html   ,(s-prefix "lpdc:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "dct:source")
              :as "file"))
  :has-many `((public-service :via ,(s-prefix "lpdc:sourceDocumentInstance")
                              :as "instances"))
  :resource-base (s-url "http://data.lblod.info/id/source-documents/")
  :features '(include-uri)
  :on-path "source-documents")

(define-resource attachment ()
  :class (s-prefix "lpdc:Attachment")
  :properties `((:title          :string ,(s-prefix "dct:title"))
                (:extracted-html :string ,(s-prefix "lpdc:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "dct:source")
              :as "file"))
  :has-many `((attachment
               :via ,(s-prefix "lpdc:subAttachment")
               :as "sub-attachments"))
  :resource-base (s-url "http://data.lblod.info/id/attachments/")
  :features '(include-uri)
  :on-path "attachments")

(define-resource field-generation ()
  :class (s-prefix "lpdc:FieldGeneration")
  :properties `((:related-field   :url
                                  ,(s-prefix "lpdc:relatedField"))
                (:related-subject :url
                                  ,(s-prefix "lpdc:relatedSubject")))
  :has-many `((generation-activity
               :via ,(s-prefix "lpdc:hasGenerationActivity")
               :inverse t
               :as "generation-activities"))
  :resource-base (s-url "http://data.lblod.info/id/generations/")
  :features '(include-uri)
  :on-path "field-generations")

(define-resource generation-activity ()
  :class (s-prefix "prov:Activity")
  :properties `((:type :url
                       ,(s-prefix "dct:type"))
                (:attempt-number :integer
                                 ,(s-prefix "lpdc:attemptNumber"))
                (:original-text :string
                                ,(s-prefix "lpdc:originalText"))
                (:generated-text :string
                                 ,(s-prefix "lpdc:generatedText"))
                (:final-text :string
                             ,(s-prefix "lpdc:finalText"))
                (:status :string
                         ,(s-prefix "lpdc:status")))
  :resource-base (s-url "http://data.lblod.info/id/generation-activities/")
  :features '(include-uri)
  :on-path "generation-activities")
