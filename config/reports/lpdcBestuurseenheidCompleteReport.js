import { generateReportFromData } from '../helpers.js';
import { batchedQuery } from '../helpers.js';

export default {
  cronPattern: '0 0 4 * * *',
  name: 'lpdcBestuurseenheidCompleteReport',
  execute: async () => {
    const reportData = {
      title: 'Overview of LPDC services - all fields',
      description: 'Overview of LPDC services with all fields included',
      filePrefix: 'lpdcBestuurseenheidComplete'
    };

    // Helper functies
    function stripHtml(html) {
      return html
        .replace(/<(\/?(p|div|br|h[1-6]|li|ul|ol|table|tr|td|th))[^>]*>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function stripOrder(text) {
      return String(text)
        .replace(/(\b\d+\s*)?\|\|\s*/g, '')
        .replace(/^[^a-zA-Z0-9]*$/, '');    
    }

    // Query
    // Construction of the GROUP_CONCAT was made to use shacl:order since without it, the order of the entries wasn't according to the form. shacl:order makes it a consistent way of ordering.
    console.log('Generating LPDC Bestuurseenheid Complete Report');
    const lpdcQuery = `
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      PREFIX adms:    <http://www.w3.org/ns/adms#>
      PREFIX dct:     <http://purl.org/dc/terms/>
      PREFIX pav:     <http://purl.org/pav/>
      PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
      PREFIX schema:  <http://schema.org/>
      PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
      PREFIX belgif:  <http://vocab.belgif.be/ns/publicservice#>
      PREFIX m8g:     <http://data.europa.eu/m8g/>
      PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
      PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX adres:   <https://data.vlaanderen.be/ns/adres#>
      PREFIX shacl: <http://www.w3.org/ns/shacl#>


      SELECT DISTINCT
        ?uriPubliekeDienstverlening ?naamBestuurseenheid ?aangemaaktDoor ?aangemaaktOp
        ?typeBestuurseenheid ?titel ?beschrijving ?aanvullendeBeschrijving ?uitzondering
        ?aangepastOp ?aangepastDoor ?IPDCConceptID ?statusLabel ?versie 
        ?vergtOmzettingNaarInformeel ?reviewStatus ?voorGemeentelijkeFusie ?verstuurdOp
        ?regelgeving ?startDatum ?eindDatum ?productTypeLabel
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderVoorwaarde), "||", ?titelVoorwaarde); separator=" | ") AS ?titelVoorwaarde)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderVoorwaarde), "||", ?beschrijvingVoorwaarde); separator=" | ") AS ?beschrijvingVoorwaarde)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderBewijsstuk), "||", ?titelBewijsstuk); separator=" | ") AS ?titelBewijsstuk)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderBewijsstuk), "||", ?beschrijvingBewijsstuk); separator=" | ") AS ?beschrijvingBewijsstuk)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedure), "||", ?titelProcedure); separator=" | ") AS ?titelProcedure)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedure), "||", ?beschrijvingProcedure); separator=" | ") AS ?beschrijvingProcedure)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedureWebsite), "||", ?titelProcedureWebsite); separator=" | ") AS ?titelProcedureWebsite)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedureWebsite), "||", ?beschrijvingProcedureWebsite); separator=" | ") AS ?beschrijvingProcedureWebsite)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedureWebsite), "||", ?urlProcedureWebsite); separator=" | ") AS ?urlProcedureWebsite)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderKosten), "||", ?titelKosten); separator=" | ") AS ?titelKosten)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderKosten), "||", ?beschrijvingKosten); separator=" | ") AS ?beschrijvingKosten)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderFinancieelVoordeel), "||", ?titelFinancieelVoordeel); separator=" | ") AS ?titelFinancieelVoordeel)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderFinancieelVoordeel), "||", ?beschrijvingFinancieelVoordeel); separator=" | ") AS ?beschrijvingFinancieelVoordeel)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderRegelgevendeBron), "||", ?titelRegelgevendeBron); separator=" | ") AS ?titelRegelgevendeBron)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderRegelgevendeBron), "||", ?beschrijvingRegelgevendeBron); separator=" | ") AS ?beschrijvingRegelgevendeBron)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderRegelgevendeBron), "||", ?urlRegelgevendeBron); separator=" | ") AS ?urlRegelgevendeBron)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntEmail); separator=" | ") AS ?contactpuntEmail)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntTelefoon); separator=" | ") AS ?contactpuntTelefoon)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntWebsiteUrl); separator=" | ") AS ?contactpuntWebsiteUrl)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntOpeningsuren); separator=" | ") AS ?contactpuntOpeningsuren)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?gemeente); separator=" | ") AS ?gemeente)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?adres); separator=" | ") AS ?adres)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderWebsite), "||", ?titelWebsite); separator=" | ") AS ?titelWebsite)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderWebsite), "||", ?beschrijvingWebsite); separator=" | ") AS ?beschrijvingWebsite)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderWebsite), "||", ?urlWebsite); separator=" | ") AS ?urlWebsite) 
        (GROUP_CONCAT(DISTINCT ?targetAudienceLabel; separator=" | ") AS ?doelgroep)
        (GROUP_CONCAT(DISTINCT ?thematicAreaLabel; separator=" | ") AS ?themas)
        (GROUP_CONCAT(DISTINCT ?languageLabel; separator=" | ") AS ?talen)
        (GROUP_CONCAT(DISTINCT ?competentAuthorityLevelLabel; separator=" | ") AS ?bevoegdBestuursniveau)
        (GROUP_CONCAT(DISTINCT ?competentAuthorityLabel; separator=" | ") AS ?bevoegdeOverheid)
        (GROUP_CONCAT(DISTINCT ?executingAuthorityLevelLabel; separator=" | ") AS ?uitvoerendBestuursniveau)
        (GROUP_CONCAT(DISTINCT ?executingAuthorityLabel; separator=" | ") AS ?uitvoerendeOverheid)
        (GROUP_CONCAT(DISTINCT ?spatialLabel; separator=" | ") AS ?geografischToepassingsgebied)
        (GROUP_CONCAT(DISTINCT ?tag; separator=" | ") AS ?tags)
        (GROUP_CONCAT(DISTINCT ?publicationMediumLabel; separator=" | ") AS ?publicatieKanalen)
        (GROUP_CONCAT(DISTINCT ?yourEuropeCategoryLabel; separator=" | ") AS ?categorieenYourEurope)

      WHERE {
        ?uriPubliekeDienstverlening a lpdcExt:InstancePublicService ;
                                      schema:dateModified ?aangepastOp .

        OPTIONAL {
          ?uriPubliekeDienstverlening pav:createdBy ?uriBestuurseenheid .
          ?uriBestuurseenheid a besluit:Bestuurseenheid ;
                            skos:prefLabel ?naamBestuurseenheid ;
                            besluit:classificatie/skos:prefLabel ?typeBestuurseenheid .
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening adms:status ?status .
          ?status skos:prefLabel ?statusLabel .
        }

        OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:additionalDescription ?aanvullendeBeschrijving }
        OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:exception ?uitzondering }
        OPTIONAL { ?uriPubliekeDienstverlening schema:productID ?IPDCConceptID }
        OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:needsConversionFromFormalToInformal ?vergtOmzettingNaarInformeel }
        OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:forMunicipalityMerger ?voorGemeentelijkeFusie }
        OPTIONAL { ?uriPubliekeDienstverlening schema:dateSent ?verstuurdOp }
        OPTIONAL { ?uriPubliekeDienstverlening dct:title ?titel }
        OPTIONAL { ?uriPubliekeDienstverlening schema:dateCreated ?aangemaaktOp }
        OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:dutchLanguageVariant ?versie }
        OPTIONAL { ?uriPubliekeDienstverlening dct:description ?beschrijving }

        OPTIONAL {
          ?uriPubliekeDienstverlening ext:reviewStatus ?reviewStatusLink.
          ?reviewStatusLink skos:prefLabel ?reviewStatus .
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening ext:lastModifiedBy [ foaf:firstName ?firstName ; foaf:familyName ?familyName ] .
          BIND(CONCAT(COALESCE(?firstName, ""), " ", COALESCE(?familyName, "")) AS ?aangepastDoor)
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening dct:creator ?creator .
          OPTIONAL {
            ?creator foaf:firstName ?creatorFirstName ; foaf:familyName ?creatorFamilyName .
            BIND(CONCAT(COALESCE(?creatorFirstName, ""), " ", COALESCE(?creatorFamilyName, "")) AS ?aangemaaktDoor)
          }
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening belgif:hasRequirement ?voorwaarde .
          OPTIONAL { ?voorwaarde dct:title ?titelVoorwaarde ; dct:description ?beschrijvingVoorwaarde ; shacl:order ?orderVoorwaarde }
          OPTIONAL {
            ?voorwaarde m8g:hasSupportingEvidence ?bewijs .
            OPTIONAL { ?bewijs dct:title ?titelBewijsstuk ; dct:description ?beschrijvingBewijsstuk ; shacl:order ?orderBewijsstuk }
          }
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening cpsv:follows ?procedure .
          ?procedure dct:title ?titelProcedure ; dct:description ?beschrijvingProcedure ; shacl:order ?orderProcedure .
          OPTIONAL {
            ?procedure lpdcExt:hasWebsite ?website .
            OPTIONAL { ?website dct:title ?titelProcedureWebsite ; dct:description ?beschrijvingProcedureWebsite ; schema:url ?urlProcedureWebsite ; shacl:order ?orderProcedureWebsite }
          }
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasCost ?kosten .
          OPTIONAL { ?kosten dct:title ?titelKosten ; dct:description ?beschrijvingKosten; shacl:order ?orderKosten }
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening cpsv:produces ?voordeel .
          OPTIONAL { ?voordeel dct:title ?titelFinancieelVoordeel ; dct:description ?beschrijvingFinancieelVoordeel ; shacl:order ?orderFinancieelVoordeel}
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:regulation ?regelgeving .
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasLegalResource ?bron .
          OPTIONAL { ?bron dct:title ?titelRegelgevendeBron ; dct:description ?beschrijvingRegelgevendeBron ; schema:url ?urlRegelgevendeBron ; shacl:order ?orderRegelgevendeBron }
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasContactPoint ?contact .
          OPTIONAL { ?contact schema:email ?contactpuntEmail ; schema:telephone ?contactpuntTelefoon ;
                            schema:url ?contactpuntWebsiteUrl ; schema:openingHours ?contactpuntOpeningsuren ;shacl:order ?orderContact}
          OPTIONAL {
            ?contact lpdcExt:address ?adresUri .
            OPTIONAL {
              ?adresUri adres:Straatnaam ?straatnaam ; adres:Adresvoorstelling.huisnummer ?huisnummer ; 
                        adres:Adresvoorstelling.busnummer ?busnummer .
              BIND(CONCAT(COALESCE(?straatnaam, ""), " ", COALESCE(?huisnummer, ""), " ", COALESCE(?busnummer, "")) AS ?adres)
            }
            OPTIONAL {?adresUri adres:gemeentenaam ?gemeente}
          }
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening rdfs:seeAlso ?meerInfo .
          OPTIONAL { ?meerInfo dct:title ?titelWebsite ; dct:description ?beschrijvingWebsite ; schema:url ?urlWebsite ; shacl:order ?orderWebsite }
        }
        
        OPTIONAL { ?uriPubliekeDienstverlening schema:startDate ?startDatum }
        OPTIONAL { ?uriPubliekeDienstverlening schema:endDate ?eindDatum }
        OPTIONAL {
          ?uriPubliekeDienstverlening dct:type ?productType .
          ?productType skos:prefLabel ?productTypeLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:targetAudience ?targetAudience .
          ?targetAudience skos:prefLabel ?targetAudienceLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:thematicArea ?thematicArea .
          ?thematicArea skos:prefLabel ?thematicAreaLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening dct:language ?language .
          ?language skos:prefLabel ?languageLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:competentAuthorityLevel ?competentAuthorityLevel .
          ?competentAuthorityLevel skos:prefLabel ?competentAuthorityLevelLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasCompetentAuthority ?competentAuthority .
          ?competentAuthority skos:prefLabel ?competentAuthorityLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:executingAuthorityLevel ?executingAuthorityLevel .
          ?executingAuthorityLevel skos:prefLabel ?executingAuthorityLevelLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:hasExecutingAuthority ?executingAuthority .
          ?executingAuthority skos:prefLabel ?executingAuthorityLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening dct:spatial ?spatial .
          ?spatial skos:prefLabel ?spatialLabel .
        }
        OPTIONAL { ?uriPubliekeDienstverlening <http://www.w3.org/ns/dcat#keyword> ?tag }
        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:publicationMedium ?publicationMedium .
          ?publicationMedium skos:prefLabel ?publicationMediumLabel .
        }
        OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:yourEuropeCategory ?yourEuropeCategory .
          ?yourEuropeCategory skos:prefLabel ?yourEuropeCategoryLabel .
        }
      }
      GROUP BY
        ?uriPubliekeDienstverlening ?naamBestuurseenheid ?aangemaaktDoor ?aangemaaktOp
        ?typeBestuurseenheid ?titel ?beschrijving ?aanvullendeBeschrijving ?uitzondering
        ?aangepastOp ?aangepastDoor ?IPDCConceptID ?statusLabel ?versie 
        ?vergtOmzettingNaarInformeel ?reviewStatus ?voorGemeentelijkeFusie ?verstuurdOp
        ?regelgeving ?startDatum ?eindDatum ?productTypeLabel

    `;
    const queryResponse = await batchedQuery(lpdcQuery, 1000);
    const data = queryResponse.results.bindings;

    const postProcessedData = data.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      naamBestuurseenheid: r.naamBestuurseenheid?.value  || '',
      typeBestuurseenheid: r.typeBestuurseenheid?.value  || '',
      aangemaaktOp: r.aangemaaktOp?.value || '',
      aangemaaktDoor: r.aangemaaktDoor?.value || '',
      aangepastOp: r.aangepastOp.value,
      aangepastDoor: r.aangepastDoor?.value || '',
      verstuurdDoor: r.verstuurdDoor?.value || '',
      IPDCConceptID: r.IPDCConceptID?.value || '',
      reviewStatus: r.reviewStatus?.value || '',
      statusLabel: r.statusLabel?.value || '',
      versie: r.versie?.value || '',
      vergtOmzettingNaarInformeel: r.vergtOmzettingNaarInformeel?.value || '',
      voorGemeentelijkeFusie: r.voorGemeentelijkeFusie?.value || '',
      titel: r.titel?.value || '',
      beschrijving: r.beschrijving ? stripHtml(r.beschrijving.value): '',
      aanvullendeBeschrijving: r.aanvullendeBeschrijving ? stripHtml(r.aanvullendeBeschrijving.value) : '',
      uitzondering: r.uitzondering ? stripHtml(r.uitzondering.value) : '',
      titelVoorwaarde: r.titelVoorwaarde?.value ? stripOrder(r.titelVoorwaarde.value) : '',
      beschrijvingVoorwaarde: r.beschrijvingVoorwaarde?.value ? stripOrder(stripHtml(r.beschrijvingVoorwaarde.value)) : '',
      titelBewijsstuk: r.titelBewijsstuk?.value ? stripOrder(r.titelBewijsstuk.value) : '',
      beschrijvingBewijsstuk: r.beschrijvingBewijsstuk?.value ? stripOrder(stripHtml(r.beschrijvingBewijsstuk.value)) : '',
      titelProcedure: r.titelProcedure?.value ? stripOrder(r.titelProcedure.value) : '',
      beschrijvingProcedure: r.beschrijvingProcedure?.value ? stripOrder(stripHtml(r.beschrijvingProcedure.value)) : '',
      titelProcedureWebsite: r.titelProcedureWebsite?.value ? stripOrder(r.titelProcedureWebsite.value) : '',
      beschrijvingProcedureWebsite: r.beschrijvingProcedureWebsite?.value ? stripOrder(stripHtml(r.beschrijvingProcedureWebsite.value)) : '',
      urlProcedureWebsite: r.urlProcedureWebsite?.value ? stripOrder(r.urlProcedureWebsite.value) : '',
      titelKosten: r.titelKosten?.value ? stripOrder(r.titelKosten.value) : '',
      beschrijvingKosten: r.beschrijvingKosten?.value ? stripOrder(stripHtml(r.beschrijvingKosten.value)) : '',
      titelFinancieelVoordeel: r.titelFinancieelVoordeel?.value ? stripOrder(r.titelFinancieelVoordeel.value) : '',
      beschrijvingFinancieelVoordeel: r.beschrijvingFinancieelVoordeel?.value ? stripOrder(stripHtml(r.beschrijvingFinancieelVoordeel.value)) : '',
      regelgeving: r.regelgeving ? stripHtml(r.regelgeving.value) : '',
      titelRegelgevendeBron: r.titelRegelgevendeBron?.value ? stripOrder(r.titelRegelgevendeBron.value) : '',
      beschrijvingRegelgevendeBron: r.beschrijvingRegelgevendeBron?.value ? stripOrder(stripHtml(r.beschrijvingRegelgevendeBron.value)) : '',
      urlRegelgevendeBron: r.urlRegelgevendeBron?.value ? stripOrder(r.urlRegelgevendeBron.value) : '',
      contactpuntEmail: r.contactpuntEmail?.value ? stripOrder(r.contactpuntEmail.value) : '',
      contactpuntTelefoon: r.contactpuntTelefoon?.value ? stripOrder(r.contactpuntTelefoon.value) : '',
      contactpuntWebsiteUrl: r.contactpuntWebsiteUrl?.value ? stripOrder(r.contactpuntWebsiteUrl.value) : '',
      contactpuntOpeningsuren: r.contactpuntOpeningsuren?.value ? stripOrder(r.contactpuntOpeningsuren.value) : '',
      gemeente: r.gemeente?.value ? stripOrder(r.gemeente.value) : '',
      adres: r.adres?.value ? stripOrder(r.adres.value) : '',
      titelWebsite: r.titelWebsite?.value ? stripOrder(r.titelWebsite.value) : '',
      beschrijvingWebsite: r.beschrijvingWebsite?.value ? stripOrder(stripHtml(r.beschrijvingWebsite.value)) : '',
      urlWebsite: r.urlWebsite?.value ? stripOrder(r.urlWebsite.value) : '',
      startDatum: r.startDatum?.value || '',
      eindDatum: r.eindDatum?.value || '',
      productTypeLabel: r.productTypeLabel?.value || '',
      doelgroep: r.doelgroep?.value || '',
      themas: r.themas?.value || '',
      talen: r.talen?.value || '',
      bevoegdBestuursniveau: r.bevoegdBestuursniveau?.value || '',
      bevoegdeOverheid: r.bevoegdeOverheid?.value || '',
      uitvoerendBestuursniveau: r.uitvoerendBestuursniveau?.value || '',
      uitvoerendeOverheid: r.uitvoerendeOverheid?.value || '',
      geografischToepassingsgebied: r.geografischToepassingsgebied?.value || '',
      tags: r.tags?.value || '',
      publicatieKanalen: r.publicatieKanalen?.value || '',
      categorieenYourEurope: r.categorieenYourEurope?.value || ''
    }));

      
    const csvHeaders = Object.keys(postProcessedData[0]);

    await generateReportFromData(postProcessedData, csvHeaders, reportData);

  }
};
