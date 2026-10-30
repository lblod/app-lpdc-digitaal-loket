(in-package :mu-cl-resources)

(define-resource source-document ()
  :class (s-prefix "lpdcExt:SourceDocument")
  :properties `((:title          :string ,(s-prefix "dct:title"))
                (:extracted-html :html   ,(s-prefix "lpdcExt:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "nie:dataSource")
              :as "file"))
  :resource-base (s-url "http://data.lblod.info/id/source-documents/")
  :features '(include-uri)
  :on-path "source-documents")

(define-resource attachment ()
  :class (s-prefix "lpdcExt:Attachment")
  :properties `((:title          :string ,(s-prefix "dct:title"))
                (:extracted-html :string ,(s-prefix "lpdcExt:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "nie:dataSource")
              :as "file"))
  :has-many `((attachment
               :via ,(s-prefix "lpdcExt:subAttachment")
               :as "sub-attachments"))
  :resource-base (s-url "http://data.lblod.info/id/attachments/")
  :features '(include-uri)
  :on-path "attachments")

(define-resource field-generation ()
  :class (s-prefix "lpdcExt:FieldGeneration")
  :properties `((:related-field   :url
                                  ,(s-prefix "lpdcExt:relatedField"))
                (:related-subject :url
                                  ,(s-prefix "lpdcExt:relatedSubject")))
  :has-many `((generation-activity
               :via ,(s-prefix "lpdcExt:hasGenerationActivity")
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