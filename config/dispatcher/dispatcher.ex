defmodule Dispatcher do
  use Matcher

  define_accept_types [
    html: ["text/html", "application/xhtml+html"],
    json: ["application/json", "application/vnd.api+json"],
    upload: ["multipart/form-data"],
    any: [ "*/*" ],
  ]

  # In order to forward the 'themes' resource to the
  # resource service, use the following forward rule:
  #
  # match "/themes/*path", @json do
  #   Proxy.forward conn, path, "http://resource/themes/"
  # end
  #
  # Run `docker-compose restart dispatcher` after updating
  # this file.

  get "/formal-informal-choices/*path" do
      forward conn, path, "http://lpdc-management/formal-informal-choices/"
  end

  post "/formal-informal-choices/*path" do
      forward conn, path, "http://lpdc-management/formal-informal-choices/"
  end

  match "/bestuurseenheden/*path" do
    forward conn, path, "http://cache/bestuurseenheden/"
  end
  match "/werkingsgebieden/*path" do
    forward conn, path, "http://cache/werkingsgebieden/"
  end
  match "/bestuurseenheid-classificatie-codes/*path" do
    forward conn, path, "http://cache/bestuurseenheid-classificatie-codes/"
  end

  match "/mock/sessions/*path" do
    forward conn, path, "http://mocklogin/sessions/"
  end
  match "/sessions/*path", %{ reverse_host: ["dashboard" | _rest] } do
    forward conn, path, "http://dashboard-login/sessions/"
  end
  match "/sessions/*path" do
    forward conn, path, "http://login/sessions/"
  end
  match "/gebruikers/*path" do
    forward conn, path, "http://cache/gebruikers/"
  end
  match "/accounts/*path" do
    forward conn, path, "http://cache/accounts/"
  end

  #################################################################
  # Concepts and Concept Schemes
  #################################################################
  get "/concept-schemes/*path" do
    forward conn, path, "http://cache/concept-schemes/"
  end

  get "/concepts/*path" do
    forward conn, path, "http://cache/concepts/"
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
  match "/reports/*path",  %{ accept: [:json] } do
    forward conn, path, "http://cache/reports/"
  end

  get "/files/:id/download" do
    forward conn, [], "http://file/files/" <> id <> "/download"
  end

  get "/files/*path" do
    forward conn, path, "http://cache/files/"
  end

  patch "/files/*path" do
    forward conn, path, "http://cache/files/"
  end

  post "/files/*path" do
    forward conn, path, "http://file/files/"
  end

  # TODO: find all usage of this endpoint and replace it with `POST /files`
  # This is kept to maintain compatibility with code that uses the "old" endpoint.
  post "/file-service/files/*path" do
    forward conn, path, "http://file/files/"
  end

  delete "/files/*path" do
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
  match "/conceptual-public-services/*path" do
    forward conn, path, "http://resource/conceptual-public-services/"
  end

  match "/identifiers/*path" do
    forward conn, path, "http://cache/identifiers/"
  end

  post "/public-services/*path" do
    forward conn, path, "http://lpdc-management/public-services/"
  end

  delete "/public-services/*path" do
    forward conn, path, "http://lpdc-management/public-services/"
  end

  # Don't use cache in the following rules.
  # See https://github.com/lblod/app-lpdc-digitaal-loket/blob/master/docs/adr/0005-do-not-cache-instantie-overview.md

  get "/public-services/*path" do
    forward conn, path, "http://resource/public-services/"
  end

  match "/public-services/*path" do
    forward conn, path, "http://resource/public-services/"
  end

  match "/concept-display-configurations/*path" do
    forward conn, path, "http://resource/concept-display-configurations/"
  end

  #################################################################
  # Frontend
  #################################################################
  get "/assets/*path",  %{ reverse_host: ["dashboard" | _rest] }  do
    forward conn, path, "http://dashboard/assets/"
  end

  get "/@appuniversum/*path", %{ reverse_host: ["dashboard" | _rest] } do
    forward conn, path, "http://dashboard/@appuniversum/"
  end

  match "/*_path", %{ reverse_host: ["dashboard" | _rest] } do
    # *_path allows a path to be supplied, but will not yield
    # an error that we don't use the path variable.
    forward conn, [], "http://dashboard/index.html"
  end

  #################################################################
  # Other
  #################################################################
  match "/*_" do
    send_resp( conn, 404, "Route not found.  See config/dispatcher.ex" )
  end
end
