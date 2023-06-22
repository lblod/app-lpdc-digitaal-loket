defmodule Dispatcher do
  use Matcher
  define_accept_types []

  # In order to forward the 'themes' resource to the
  # resource service, use the following forward rule:
  #
  # match "/themes/*path", @json do
  #   Proxy.forward conn, path, "http://resource/themes/"
  # end
  #
  # Run `docker-compose restart dispatcher` after updating
  # this file.

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
  # Public Services - LPDC-IPDC: custom API endpoints
  #################################################################
  get "/lpdc-management/*path" do
    forward conn, path, "http://lpdc-management/semantic-forms/"
  end

  put "/lpdc-management/*path" do
    forward conn, path, "http://lpdc-management/semantic-forms/"
  end

  post "/lpdc-management/*path" do
    forward conn, path, "http://lpdc-management/semantic-forms/"
  end

  #################################################################
  # Public Services - LPDC-IPDC
  #################################################################
  match "/conceptual-public-services/*path" do
    forward conn, path, "http://cache/conceptual-public-services/"
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

  get "/public-services/*path" do
    forward conn, path, "http://resource/public-services/"  ## TODO: solve cache issue in frontend
  end

  match "/public-services/*path" do
    forward conn, path, "http://cache/public-services/"
  end

  match "/concept-display-configurations/*path" do
    forward conn, path, "http://cache/concept-display-configurations/"
  end

  match "/*_" do
    send_resp( conn, 404, "Route not found.  See config/dispatcher.ex" )
  end
end
