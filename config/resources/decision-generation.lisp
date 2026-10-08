(in-package :mu-cl-resources)

(define-resource decision-document ()
  :class (s-prefix "lpdcExt:decisionDocument")
  :properties `((:extracted-html :string
                                 ,(s-prefix "lpdcExt:extractedHtml")))
  :has-one `((file
              :via ,(s-prefix "nie:dataSource")
              :as "file"))
  :has-many `((attachment
               :via ,(s-prefix "lpdcExt:attachment")
               :as "attachments"))
  :resource-base (s-url "http://data.lblod.info/id/decision-documents/")
  :features '(include-uri)
  :on-path "decision-documents")

(define-resource field-generation ()
  :class (s-prefix "lpdcExt:fieldGeneration")
  :properties `((:related-field :string
                                ,(s-prefix "lpdcExt:relatedField"))) ; predicate of the field (for example Procedure - Titel, Aanvullende beschrijving, etc.)
  :has-many `((generation-attempt
               :via ,(s-prefix "lpdcExt:generationAttempt")
               :inverse t
               :as "generation-attempts"))
  :resource-base (s-url "http://data.lblod.info/id/generations/")
  :features '(include-uri)
  :on-path "field-generations")

(define-resource generation-attempt ()
  :class (s-prefix "lpdcExt:generationAttempt")
  :properties `((:attempt-number :integer
                                 ,(s-prefix "lpdcExt:attemptNumber"))
                (:original-text :string
                                 ,(s-prefix "lpdcExt:originalText"))
                (:generated-text :string
                                 ,(s-prefix "lpdcExt:generatedText"))
                (:final-text :string
                             ,(s-prefix "lpdcExt:finalText")))
  :resource-base (s-url "http://data.lblod.info/id/generation-attempts/")
  :features '(include-uri)
  :on-path "generation-attempts")