;; The chat domain for frontend-report-assistant and the
;; natural-language-report-service. The chat's data lives in a graph per
;; account (see the chat graph in config/authorization/config.lisp); the
;; messages and their bijlagen are written by the natural-language-report
;; service. The bijlagen are nfo:FileDataObject (master-files-domain.lisp).

(define-resource chat-conversation ()
  :class (s-prefix "sioc:Thread")
  :properties `((:title :string ,(s-prefix "dct:title"))
                (:created :datetime ,(s-prefix "dct:created"))
                (:last-activity :datetime ,(s-prefix "sioc:last_activity_date")))
  :has-one `((gebruiker :via ,(s-prefix "foaf:maker")
                        :as "creator"))
  :has-many `((chat-message :via ,(s-prefix "sioc:has_container")
                            :inverse t
                            :as "messages"))
  :resource-base (s-url "http://data.lblod.info/id/chat-conversations/")
  :features '(include-uri)
  :on-path "chat-conversations")

(define-resource chat-message ()
  :class (s-prefix "sioc:Post")
  :properties `((:content :string ,(s-prefix "sioc:content"))
               (:created :datetime ,(s-prefix "dct:created"))
               (:maker :url ,(s-prefix "foaf:maker")))
  :has-one `((chat-conversation :via ,(s-prefix "sioc:has_container")
                               :as "conversation"))
  :has-many `((file :via ,(s-prefix "as:attachment")
                    :as "attachments"))
  :resource-base (s-url "http://data.lblod.info/id/chat-messages/")
  :features '(include-uri)
  :on-path "chat-messages")

(define-resource chat-instant-message (chat-message)
  :class (s-prefix "sioct:InstantMessage")
  :resource-base (s-url "http://data.lblod.info/id/chat-messages/")
  :features '(include-uri)
  :on-path "chat-instant-messages")

(define-resource chat-agent ()
  :class (s-prefix "prov:SoftwareAgent")
  :properties `((:name :string ,(s-prefix "foaf:name"))
               (:description :string ,(s-prefix "dct:description")))
  :resource-base (s-url "http://data.lblod.info/id/chat-agents/")
  :features '(include-uri)
  :on-path "chat-agents")
