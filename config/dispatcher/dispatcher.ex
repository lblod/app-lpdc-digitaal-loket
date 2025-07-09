defmodule Dispatcher do
  use Matcher

  define_accept_types [
    html: ["text/html", "application/xhtml+html"],
    json: ["application/json", "application/vnd.api+json"],
    upload: ["multipart/form-data"],
    any: [ "*/*" ],
  ]

  @html %{ accept: %{ html: true } }
  @json %{ accept: %{ json: true } }
  @upload %{ accept: %{ upload: true } }
  @any %{ accept: %{ any: true } }

  #################################################################
  # Concepts and Concept Schemes
  #################################################################

  get "/concept-schemes/*path", @json do
    forward conn, path, "http://cache/concept-schemes/"
  end

  get "/concepts/*path", @json do
    forward conn, path, "http://cache/concepts/"
  end

  #################################################################
  # Public Services - LPDC-IPDC: custom API endpoints
  #################################################################

  get "/formal-informal-choices/*path" do
    forward conn, path, "http://lpdc-management/formal-informal-choices/"
  end

  post "/formal-informal-choices/*path" do
    forward conn, path, "http://lpdc-management/formal-informal-choices/"
  end

  #################################################################
  # Public Services - LPDC-IPDC: custom API endpoints
  #################################################################

  get "/lpdc-management/conceptual-public-services/*path" do
    forward conn, path, "http://lpdc-management/conceptual-public-services/"
  end

  get "/lpdc-management/contact-info-options/*path" do
    forward conn, path, "http://lpdc-management/contact-info-options/"
  end

  match "/lpdc-management/address/*path" do
    forward conn, path, "http://lpdc-management/address/"
  end

  get "/lpdc-management/concept-snapshot/*path" do
    forward conn, path, "http://lpdc-management/concept-snapshot/"
  end

  match "/lpdc-management/public-services/*path" do
    forward conn, path, "http://lpdc-management/public-services/"
  end

  match "/lpdc-management/concept-display-configuration/*path" do
    forward conn, path, "http://lpdc-management/concept-display-configuration/"
  end

  #################################################################
  # Reports
  #################################################################

  match "/reports/*path", @json do
    forward conn, path, "http://cache/reports/"
  end

  get "/files/*path", @json do
    forward conn, path, "http://cache/files/"
  end

  patch "/files/*path", @json do
    forward conn, path, "http://cache/files/"
  end

  # File service

  get "/files/:id/download", @any do
    forward conn, [], "http://file/files/" <> id <> "/download"
  end

  post "/files/*path", @any do
    forward conn, path, "http://file/files/"
  end

  # TODO: find all usage of this endpoint and replace it with `POST /files`
  # This is kept to maintain compatibility with code that uses the "old" endpoint.
  post "/file-service/files/*path", @any do
    forward conn, path, "http://file/files/"
  end

  delete "/files/*path", @any do
    forward conn, path, "http://file/files/"
  end

  #################################################################
  # Public Services - LPDC-IPDC
  #################################################################

  # NOTE (11/03/2025): Do *not* use cache in the following rule. When a user
  # creates a new product instance from a concept, the management service can
  # update the `conceptIsNew` and `conceptIsInstantiated` properties for the
  # corresponding concept display configurations. These updates are not picked
  # up by the cache, resulting in the frontend showing outdated information
  # afterwards. (See LPDC-1370)
  match "/conceptual-public-services/*path", @json do
    forward conn, path, "http://resource/conceptual-public-services/"
  end

  match "/bestuurseenheden/*path", @json do
    forward conn, path, "http://cache/bestuurseenheden/"
  end

  match "/werkingsgebieden/*path", @json do
    forward conn, path, "http://cache/werkingsgebieden/"
  end

  match "/bestuurseenheid-classificatie-codes/*path", @json do
    forward conn, path, "http://cache/bestuurseenheid-classificatie-codes/"
  end

  match "/identifiers/*path", @json do
    forward conn, path, "http://cache/identifiers/"
  end

  # Don't use cache in the following rules.
  # See https://github.com/lblod/app-lpdc-digitaal-loket/blob/master/docs/adr/0005-do-not-cache-instantie-overview.md
  get "/public-services/*path", @json do
    forward conn, path, "http://resource/public-services/"
  end

  match "/public-services/*path", @json do
    forward conn, path, "http://resource/public-services/"
  end

  match "/concept-display-configurations/*path", @json do
    forward conn, path, "http://resource/concept-display-configurations/"
  end

  # Services

  post "/public-services/*path" do
    forward conn, path, "http://lpdc-management/public-services/"
  end

  delete "/public-services/*path" do
    forward conn, path, "http://lpdc-management/public-services/"
  end

  #################################################################
  # Account control
  #################################################################

  match "/gebruikers/*path", @json do
    forward conn, path, "http://cache/gebruikers/"
  end

  match "/accounts/*path", @json do
    forward conn, path, "http://cache/accounts/"
  end

  match "/impersonations/*path", @json do
    forward conn, path, "http://impersonation/impersonations/"
  end

  #################################################################
  # Dashboard
  #################################################################

  # Login

  match "/sessions/*path", %{ reverse_host: ["dashboard" | _rest] } do
    forward conn, path, "http://login-dashboard/sessions/"
  end

  match "/sessions/*path", %{ reverse_host: ["test", "dashboard" | _rest] } do
    forward conn, path, "http://login-dashboard/sessions/"
  end

  match "/sessions/*path", %{ reverse_host: ["acc", "dashboard" | _rest] } do
    forward conn, path, "http://login-dashboard/sessions/"
  end

  match "/sessions/*path", %{ reverse_host: ["dev", "dashboard" | _rest] } do
    forward conn, path, "http://login-dashboard/sessions/"
  end

  # Frontend

  get "/assets/*path",  %{ reverse_host: ["dashboard" | _rest] }  do
    forward conn, path, "http://dashboard/assets/"
  end

  get "/@appuniversum/*path", %{ reverse_host: ["dashboard" | _rest] } do
    forward conn, path, "http://dashboard/@appuniversum/"
  end

  match "/*_path", %{ reverse_host: ["dashboard" | _rest] } do
    forward conn, [], "http://dashboard/index.html"
  end

  # Frontend TEST

  get "/assets/*path",  %{ reverse_host: ["test", "dashboard" | _rest] }  do
    forward conn, path, "http://dashboard/assets/"
  end

  get "/@appuniversum/*path", %{ reverse_host: ["test", "dashboard" | _rest] } do
    forward conn, path, "http://dashboard/@appuniversum/"
  end

  match "/*_path", %{ reverse_host: ["test", "dashboard" | _rest] } do
    forward conn, [], "http://dashboard/index.html"
  end

  # Frontend ACC

  get "/assets/*path",  %{ reverse_host: ["acc", "dashboard" | _rest] }  do
    forward conn, path, "http://dashboard/assets/"
  end

  get "/@appuniversum/*path", %{ reverse_host: ["acc", "dashboard" | _rest] } do
    forward conn, path, "http://dashboard/@appuniversum/"
  end

  match "/*_path", %{ reverse_host: ["acc", "dashboard" | _rest] } do
    forward conn, [], "http://dashboard/index.html"
  end

  # Frontend DEV

  get "/assets/*path",  %{ reverse_host: ["dev", "dashboard" | _rest] }  do
    forward conn, path, "http://dashboard/assets/"
  end

  get "/@appuniversum/*path", %{ reverse_host: ["dev", "dashboard" | _rest] } do
    forward conn, path, "http://dashboard/@appuniversum/"
  end

  match "/*_path", %{ reverse_host: ["dev", "dashboard" | _rest] } do
    forward conn, [], "http://dashboard/index.html"
  end

  #################################################################
  # LPDC
  #################################################################

  # NOTE: keep this as the last frontend. There is no host/reverse_host
  # matching. This catches all attempts to access a frontend and should,
  # because of the order sensitivity of mu-auth, come last.
  # Some loket instances are hosted like "dev.lpdc.[...]" which make matching
  # difficult.

  # Login

  match "/sessions/*path" do
    forward conn, path, "http://login-lpdc/sessions/"
  end

  # Frontend

  get "/assets/*path", @any do
    forward conn, path, "http://lpdc/assets/"
  end

  get "/@appuniversum/*path", @any do
    forward conn, path, "http://lpdc/@appuniversum/"
  end

  match "/*_path", @html do
    forward conn, [], "http://lpdc/index.html"
  end

  #################################################################
  # Other
  #################################################################

  match "/*_" do
    send_resp( conn, 404, "Route not found. See config/dispatcher.ex" )
  end

end
