(in-package :mu-cl-resources)

(define-resource decision-document ()
  :class (s-prefix "lpdcExt:DecisionDocument")
  :properties `((:title          :string ,(s-prefix "dct:title"))
                (:extracted-html :string ,(s-prefix "lpdcExt:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "nie:dataSource")
              :as "file"))
  :has-many `((attachment
               :via ,(s-prefix "lpdcExt:attachment")
               :as "attachments"))
  :resource-base (s-url "http://data.lblod.info/id/decision-documents/")
  :features '(include-uri)
  :on-path "decision-documents")


(define-resource attachment ()
  :class (s-prefix "lpdcExt:Attachment")
  :properties `((:title          :string ,(s-prefix "dct:title"))
                (:extracted-html :string ,(s-prefix "lpdcExt:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "nie:dataSource")
              :as "file")
             (decision-document
              :via ,(s-prefix "lpdcExt:attachment")
              :inverse t
              :as "decision-document"))
  :has-many `((attachment
               :via ,(s-prefix "lpdcExt:subAttachment")
               :as "sub-attachments"))
  :resource-base (s-url "http://data.lblod.info/id/attachments/")
  :features '(include-uri)
  :on-path "attachments")

(define-resource field-generation ()
  :class (s-prefix "lpdcExt:FieldGeneration")
  :properties `((:related-field   :string
                                  ,(s-prefix "lpdcExt:relatedField")) ; predicate of the field
  :properties `((:related-field   :url
                                  ,(s-prefix "lpdcExt:relatedField"))
                (:related-subject :url
                                  ,(s-prefix "lpdcExt:relatedSubject"))) ; subject of the field, to tell nested properties with the same predicate apart (for example the title of a Procedure vs. the title of the service)
  :has-many `((generation-attempt
               :via ,(s-prefix "lpdcExt:generationAttempt")
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
                                 ,(s-prefix "lpdcExt:attemptNumber"))
                (:original-text :string
                                ,(s-prefix "lpdcExt:originalText"))
                (:generated-text :string
                                 ,(s-prefix "lpdcExt:generatedText"))
                (:final-text :string
                             ,(s-prefix "lpdcExt:finalText"))
                (:status :string
                         ,(s-prefix "lpdcExt:status")))
  :resource-base (s-url "http://data.lblod.info/id/generation-activities/")
  :features '(include-uri)
  :on-path "generation-activities")