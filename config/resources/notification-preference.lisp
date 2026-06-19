(define-resource notification-rule ()
  :class (s-prefix "skos:Concept")
  :properties `((:label :string ,(s-prefix "skos:prefLabel"))
                (:description :string ,(s-prefix "skos:definition")))
  :resource-base (s-url "http://data.lblod.info/id/notification-rules/")
  :features '(include-uri)
  :on-path "notification-rules"
)

(define-resource notification-rule-config ()
  :class (s-prefix "lpdcExt:NotificationRuleConfig")
  :properties `((:frequency :string ,(s-prefix "lpdcExt:notificationFrequency")))
  :has-one `((notification-rule :via ,(s-prefix "lpdcExt:hasEnabledRule")
                                :as "notification-rule"))
  :resource-base (s-url "http://data.lblod.info/id/notification-rule-config/")
  :features '(include-uri)
  :on-path "notification-rule-configs"
)

(define-resource notification-preference ()
  :class (s-prefix "lpdcExt:NotificationPreference")
  :properties `((:notifications-enabled :boolean ,(s-prefix "lpdcExt:notificationsEnabled"))
                (:email-address :string ,(s-prefix "schema:email")))
  :has-many `((notification-rule-config :via ,(s-prefix "lpdcExt:hasNotificationRuleConfig")
                                        :as "notification-rule-configs")
              (public-service :via ,(s-prefix "lpdcExt:notificationInstance")
                              :as "instances"))
  :has-one `((gebruiker :via ,(s-prefix "lpdcExt:hasNotificationPreference")
                        :inverse t
                        :as "gebruiker"))
  :resource-base (s-url "http://data.lblod.info/id/notification-preferences/")
  :features '(include-uri)
  :on-path "notification-preferences"
)