import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
  cronPattern: '0 0 4 * * *',
  name: 'lpdcBestuurseenheidCompleteReport',
  execute: async () => {
    const reportData = {
      title: 'Overview of LPDC services - all fields',
      description: 'Overview of LPDC services with all fields included',
      filePrefix: 'lpdcBestuurseenheidComplete'
    };


    console.log('Generating LPDC Bestuurseenheid Complete Report');
    console.log('Getting all instances first');

    const instancesQuery = `
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      SELECT DISTINCT ?uriPubliekeDienstverlening WHERE {
        ?uriPubliekeDienstverlening a lpdcExt:InstancePublicService.
      }
    `;
    let instancesQueryResult = await query(instancesQuery);
    const instances = instancesQueryResult.results.bindings.map(r => r.uriPubliekeDienstverlening.value);

    let allData = [];
    for (const uri of instances) {
      const data = await fetchAllDataForUri(uri);
      allData.push(data);
      console.log(`Processed ${allData.length} of ${instances.length}`);
    }

    const csvHeaders = Object.keys(allData[0]);
    await generateReportFromData(allData, csvHeaders, reportData);
  }
};

function generateDetailsUri(uri) {
    return `
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      PREFIX adms:    <http://www.w3.org/ns/adms#>
      PREFIX dct:     <http://purl.org/dc/terms/>
      PREFIX pav:     <http://purl.org/pav/>
      PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
      PREFIX schema:  <http://schema.org/>
      PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>

      SELECT DISTINCT
        ?uriPubliekeDienstverlening ?naamBestuurseenheid ?aangemaaktDoor ?aangemaaktOp
        ?typeBestuurseenheid ?titel ?beschrijving ?aanvullendeBeschrijving ?uitzondering
        ?aangepastOp ?aangepastDoor ?IPDCConceptID ?statusLabel ?versie
        ?vergtOmzettingNaarInformeel ?reviewStatus ?voorGemeentelijkeFusie ?verstuurdOp

      WHERE {
        VALUES ?uriPubliekeDienstverlening {<${uri}>}
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
          ?uriPubliekeDienstverlening dct:creator [ foaf:firstName ?creatorFirstName ; foaf:familyName ?creatorFamilyName ] .
          BIND(CONCAT(COALESCE(?creatorFirstName, ""), " ", COALESCE(?creatorFamilyName, "")) AS ?aangemaaktDoor)
        }
      }
    `;
  }

function generateVoorwaardeQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>
    PREFIX belgif:  <http://vocab.belgif.be/ns/publicservice#>
    PREFIX m8g:     <http://data.europa.eu/m8g/>

    SELECT
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderVoorwaarde), "||", ?titelVoorwaarde); separator=" | ") AS ?titelVoorwaarde)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderVoorwaarde), "||", ?beschrijvingVoorwaarde); separator=" | ") AS ?beschrijvingVoorwaarde)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderBewijsstuk), "||", ?titelBewijsstuk); separator=" | ") AS ?titelBewijsstuk)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderBewijsstuk), "||", ?beschrijvingBewijsstuk); separator=" | ") AS ?beschrijvingBewijsstuk)
    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening belgif:hasRequirement ?voorwaarde .
          ?voorwaarde dct:title ?titelVoorwaarde ; dct:description ?beschrijvingVoorwaarde ; shacl:order ?orderVoorwaarde .
          OPTIONAL {
            ?voorwaarde m8g:hasSupportingEvidence ?bewijs .
            ?bewijs dct:title ?titelBewijsstuk ; dct:description ?beschrijvingBewijsstuk ; shacl:order ?orderBewijsstuk .
          }
        }
    }
  `;
}

function generateProcedureQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
    PREFIX dct:     <http://purl.org/dc/terms/>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>

    SELECT
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedure), "||", ?titelProcedure); separator=" | ") AS ?titelProcedure)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedure), "||", ?beschrijvingProcedure); separator=" | ") AS ?beschrijvingProcedure)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedureWebsite), "||", ?titelProcedureWebsite); separator=" | ") AS ?titelProcedureWebsite)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedureWebsite), "||", ?beschrijvingProcedureWebsite); separator=" | ") AS ?beschrijvingProcedureWebsite)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderProcedureWebsite), "||", ?urlProcedureWebsite); separator=" | ") AS ?urlProcedureWebsite)
    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening cpsv:follows ?procedure .
          ?procedure dct:title ?titelProcedure ; dct:description ?beschrijvingProcedure ; shacl:order ?orderProcedure .
          OPTIONAL {
            ?procedure lpdcExt:hasWebsite ?website .
             ?website dct:title ?titelProcedureWebsite ; schema:url ?urlProcedureWebsite ; shacl:order ?orderProcedureWebsite .
            OPTIONAL { ?website dct:description ?beschrijvingProcedureWebsite }
          }
        }
    }
  `;
}

function generateKostenQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>
    PREFIX m8g:     <http://data.europa.eu/m8g/>
    PREFIX dct:     <http://purl.org/dc/terms/>

    SELECT
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderKosten), "||", ?titelKosten); separator=" | ") AS ?titelKosten)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderKosten), "||", ?beschrijvingKosten); separator=" | ") AS ?beschrijvingKosten)
    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasCost ?kosten .
          ?kosten dct:title ?titelKosten ; dct:description ?beschrijvingKosten; shacl:order ?orderKosten .
        }
    }
  `;
}

function generateFinancieelVoordeel(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>
    PREFIX cpsv:    <http://purl.org/vocab/cpsv#>
    PREFIX dct:     <http://purl.org/dc/terms/>
    
    SELECT
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderFinancieelVoordeel), "||", ?titelFinancieelVoordeel); separator=" | ") AS ?titelFinancieelVoordeel)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderFinancieelVoordeel), "||", ?beschrijvingFinancieelVoordeel); separator=" | ") AS ?beschrijvingFinancieelVoordeel)
    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening cpsv:produces ?voordeel .
          ?voordeel dct:title ?titelFinancieelVoordeel ; dct:description ?beschrijvingFinancieelVoordeel ; shacl:order ?orderFinancieelVoordeel .
        }
    }
  `;
}

function generateRegelgevingQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>
    PREFIX m8g:     <http://data.europa.eu/m8g/>
    PREFIX dct:     <http://purl.org/dc/terms/>
   
    SELECT ?regelgeving
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderRegelgevendeBron), "||", ?titelRegelgevendeBron); separator=" | ") AS ?titelRegelgevendeBron)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderRegelgevendeBron), "||", ?beschrijvingRegelgevendeBron); separator=" | ") AS ?beschrijvingRegelgevendeBron)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderRegelgevendeBron), "||", ?urlRegelgevendeBron); separator=" | ") AS ?urlRegelgevendeBron)
   
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening lpdcExt:regulation ?regelgeving .
        }

        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasLegalResource ?bron .
          ?bron schema:url ?urlRegelgevendeBron ; shacl:order ?orderRegelgevendeBron .
          OPTIONAL { ?bron dct:title ?titelRegelgevendeBron }
          OPTIONAL { ?bron dct:description ?beschrijvingRegelgevendeBron }
        }
    }
  `;
}

function generateContactQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>
    PREFIX m8g:     <http://data.europa.eu/m8g/>
    PREFIX adres:   <https://data.vlaanderen.be/ns/adres#>
    SELECT
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntEmail); separator=" | ") AS ?contactpuntEmail)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntTelefoon); separator=" | ") AS ?contactpuntTelefoon)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntWebsiteUrl); separator=" | ") AS ?contactpuntWebsiteUrl)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?contactpuntOpeningsuren); separator=" | ") AS ?contactpuntOpeningsuren)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?gemeente); separator=" | ") AS ?gemeente)
        (GROUP_CONCAT(DISTINCT CONCAT(str(?orderContact), "||", ?adres); separator=" | ") AS ?adres)

    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasContactPoint ?contact .
          ?contact shacl:order ?orderContact .
          OPTIONAL { ?contact schema:email ?contactpuntEmail }
          OPTIONAL { ?contact schema:telephone ?contactpuntTelefoon }
          OPTIONAL { ?contact schema:url ?contactpuntWebsiteUrl }
          OPTIONAL { ?contact schema:openingHours ?contactpuntOpeningsuren }

          OPTIONAL {
            ?contact lpdcExt:address ?adresUri .
            OPTIONAL { ?adresUri adres:Straatnaam ?straatnaam }
            OPTIONAL { ?adresUri adres:Adresvoorstelling.huisnummer ?huisnummer }
            OPTIONAL { ?adresUri adres:Adresvoorstelling.busnummer ?busnummer }
            BIND(CONCAT(COALESCE(?straatnaam, ""), " ", COALESCE(?huisnummer, ""), " ", COALESCE(?busnummer, "")) AS ?adres)
            OPTIONAL {?adresUri adres:gemeentenaam ?gemeente}
          }
        }
    }
  `;
}

function generateWebsiteQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX shacl: <http://www.w3.org/ns/shacl#>
    PREFIX dct:     <http://purl.org/dc/terms/>
    
    SELECT 
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderWebsite), "||", ?titelWebsite); separator=" | ") AS ?titelWebsite)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderWebsite), "||", ?beschrijvingWebsite); separator=" | ") AS ?beschrijvingWebsite)
      (GROUP_CONCAT(DISTINCT CONCAT(str(?orderWebsite), "||", ?urlWebsite); separator=" | ") AS ?urlWebsite)
    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
      OPTIONAL {
          ?uriPubliekeDienstverlening rdfs:seeAlso ?meerInfo .
          ?meerInfo dct:title ?titelWebsite ; schema:url ?urlWebsite ; shacl:order ?orderWebsite .
          OPTIONAL { ?meerInfo dct:description ?beschrijvingWebsite }
        }
    }
  `;
}

function generateEigenschappenFirstQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX dct:     <http://purl.org/dc/terms/>
    PREFIX m8g:     <http://data.europa.eu/m8g/>
    
    SELECT ?startDatum ?eindDatum ?productTypeLabel
      (GROUP_CONCAT(DISTINCT ?targetAudienceLabel; separator=" | ") AS ?doelgroep)
      (GROUP_CONCAT(DISTINCT ?thematicAreaLabel; separator=" | ") AS ?themas)
      (GROUP_CONCAT(DISTINCT ?languageLabel; separator=" | ") AS ?talen)
      (GROUP_CONCAT(DISTINCT ?competentAuthorityLevelLabel; separator=" | ") AS ?bevoegdBestuursniveau)
      (GROUP_CONCAT(DISTINCT ?competentAuthorityLabel; separator=" | ") AS ?bevoegdeOverheid)
      (GROUP_CONCAT(DISTINCT ?executingAuthorityLevelLabel; separator=" | ") AS ?uitvoerendBestuursniveau)
      (GROUP_CONCAT(DISTINCT ?executingAuthorityLabel; separator=" | ") AS ?uitvoerendeOverheid)
   
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
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
    }
  `;
}

function generateEigenschappenSecondQuery(uri) {
  return `
    PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
    PREFIX dct:     <http://purl.org/dc/terms/>
    
    SELECT 
      (GROUP_CONCAT(DISTINCT ?spatialLabel; separator=" | ") AS ?geografischToepassingsgebied)
      (GROUP_CONCAT(DISTINCT ?tag; separator=" | ") AS ?tags)
      (GROUP_CONCAT(DISTINCT ?publicationMediumLabel; separator=" | ") AS ?publicatieKanalen)
      (GROUP_CONCAT(DISTINCT ?yourEuropeCategoryLabel; separator=" | ") AS ?categorieenYourEurope)
    
    WHERE {
      VALUES ?uriPubliekeDienstverlening { <${uri}> }
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
  `;
}

// Helper functies
function stripHtml(html) {
  if (html.replace(/<[^>]+>/g, '') === '') return '';
  return html
    .replace(/<\/?(p|div|br|h[1-6]|li|ul|ol|table|tr|td|th)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
}

function stripOrder(text) {
  return String(text)
    .replace(/(\d*)\|\|/g, '')
}


async function fetchAllDataForUri(uri) {
  const [detailsRes, websiteRes, contactRes, regelgevingRes, financieelVoordeelRes, kostenRes, procedureRes, voorwaardeRes, eigenschappen1Res, eigenschappen2Res
  ] = await Promise.all([
    query(generateDetailsUri(uri)),
    query(generateWebsiteQuery(uri)),
    query(generateContactQuery(uri)),
    query(generateRegelgevingQuery(uri)),
    query(generateFinancieelVoordeel(uri)),
    query(generateKostenQuery(uri)),
    query(generateProcedureQuery(uri)),
    query(generateVoorwaardeQuery(uri)),
    query(generateEigenschappenFirstQuery(uri)),
    query(generateEigenschappenSecondQuery(uri))
  ]);

  const details = detailsRes.results.bindings[0] || {};
  const website = websiteRes.results.bindings[0] || {};
  const contact = contactRes.results.bindings[0] || {};
  const regelgeving = regelgevingRes.results.bindings[0] || {};
  const financieelVoordeel = financieelVoordeelRes.results.bindings[0] || {};
  const kosten = kostenRes.results.bindings[0] || {};
  const procedure = procedureRes.results.bindings[0] || {};
  const voorwaarde = voorwaardeRes.results.bindings[0] || {};
  const eigenschappen1 = eigenschappen1Res.results.bindings[0] || {};
  const eigenschappen2 = eigenschappen2Res.results.bindings[0] || {};

  return {
      uriPubliekeDienstverlening: details.uriPubliekeDienstverlening.value,
      naamBestuurseenheid: details.naamBestuurseenheid?.value  || '',
      typeBestuurseenheid: details.typeBestuurseenheid?.value  || '',
      aangemaaktOp: details.aangemaaktOp?.value || '',
      aangemaaktDoor: details.aangemaaktDoor?.value || '',
      aangepastOp: details.aangepastOp.value,
      aangepastDoor: details.aangepastDoor?.value || '',
      IPDCConceptID: details.IPDCConceptID?.value || '',
      reviewStatus: details.reviewStatus?.value || '',
      statusLabel: details.statusLabel?.value || '',
      versie: details.versie?.value || '',
      vergtOmzettingNaarInformeel: details.vergtOmzettingNaarInformeel?.value || '',
      voorGemeentelijkeFusie: details.voorGemeentelijkeFusie?.value || '',
      titel: details.titel?.value || '',
      beschrijving: details.beschrijving ? stripHtml(details.beschrijving.value): '',
      aanvullendeBeschrijving: details.aanvullendeBeschrijving ? stripHtml(details.aanvullendeBeschrijving.value) : '',
      uitzondering: details.uitzondering ? stripHtml(details.uitzondering.value) : '',
      titelVoorwaarde: voorwaarde.titelVoorwaarde?.value ? stripOrder(voorwaarde.titelVoorwaarde.value) : '',
      beschrijvingVoorwaarde: voorwaarde.beschrijvingVoorwaarde?.value ? stripHtml(stripOrder(voorwaarde.beschrijvingVoorwaarde.value)) : '',
      titelBewijsstuk: voorwaarde.titelBewijsstuk?.value ? stripOrder(voorwaarde.titelBewijsstuk.value) : '',
      beschrijvingBewijsstuk: voorwaarde.beschrijvingBewijsstuk?.value ? stripHtml(stripOrder(voorwaarde.beschrijvingBewijsstuk.value)) : '',
      titelProcedure: procedure.titelProcedure?.value ? stripOrder(procedure.titelProcedure.value) : '',
      beschrijvingProcedure: procedure.beschrijvingProcedure?.value ? stripHtml(stripOrder(procedure.beschrijvingProcedure.value)) : '',
      titelProcedureWebsite: procedure.titelProcedureWebsite?.value ? stripOrder(procedure.titelProcedureWebsite.value) : '',
      beschrijvingProcedureWebsite: procedure.beschrijvingProcedureWebsite?.value ? stripHtml(stripOrder(procedure.beschrijvingProcedureWebsite.value)) : '',
      urlProcedureWebsite: procedure.urlProcedureWebsite?.value ? stripOrder(procedure.urlProcedureWebsite.value) : '',
      titelKosten: kosten.titelKosten?.value ? stripOrder(kosten.titelKosten.value) : '',
      beschrijvingKosten: kosten.beschrijvingKosten?.value ? stripHtml(stripOrder(kosten.beschrijvingKosten.value)) : '',
      titelFinancieelVoordeel: financieelVoordeel.titelFinancieelVoordeel?.value ? stripOrder(financieelVoordeel.titelFinancieelVoordeel.value) : '',
      beschrijvingFinancieelVoordeel: financieelVoordeel.beschrijvingFinancieelVoordeel?.value ? stripHtml(stripOrder(financieelVoordeel.beschrijvingFinancieelVoordeel.value)) : '',
      regelgeving: regelgeving.regelgeving ? stripHtml(regelgeving.regelgeving.value) : '',
      titelRegelgevendeBron: regelgeving.titelRegelgevendeBron?.value ? stripOrder(regelgeving.titelRegelgevendeBron.value) : '',
      beschrijvingRegelgevendeBron: regelgeving.beschrijvingRegelgevendeBron?.value ? stripHtml(stripOrder(regelgeving.beschrijvingRegelgevendeBron.value)) : '',
      urlRegelgevendeBron: regelgeving.urlRegelgevendeBron?.value ? stripOrder(regelgeving.urlRegelgevendeBron.value) : '',
      contactpuntEmail: contact.contactpuntEmail?.value ? stripOrder(contact.contactpuntEmail.value) : '',
      contactpuntTelefoon: contact.contactpuntTelefoon?.value ? stripOrder(contact.contactpuntTelefoon.value) : '',
      contactpuntWebsiteUrl: contact.contactpuntWebsiteUrl?.value ? stripOrder(contact.contactpuntWebsiteUrl.value) : '',
      contactpuntOpeningsuren: contact.contactpuntOpeningsuren?.value ? stripOrder(contact.contactpuntOpeningsuren.value) : '',
      gemeente: contact.gemeente?.value ? stripOrder(contact.gemeente.value) : '',
      adres: contact.adres?.value ? stripOrder(contact.adres.value) : '',
      titelWebsite: website.titelWebsite?.value ? stripOrder(website.titelWebsite.value) : '',
      beschrijvingWebsite: website.beschrijvingWebsite?.value ? stripHtml(stripOrder(website.beschrijvingWebsite.value)) : '',
      urlWebsite: website.urlWebsite?.value ? stripOrder(website.urlWebsite.value) : '',
      startDatum: eigenschappen1.startDatum?.value || '',
      eindDatum: eigenschappen1.eindDatum?.value || '',
      productTypeLabel: eigenschappen1.productTypeLabel?.value || '',
      doelgroep: eigenschappen1.doelgroep?.value || '',
      themas: eigenschappen1.themas?.value || '',
      talen: eigenschappen1.talen?.value || '',
      bevoegdBestuursniveau: eigenschappen1.bevoegdBestuursniveau?.value || '',
      bevoegdeOverheid: eigenschappen1.bevoegdeOverheid?.value || '',
      uitvoerendBestuursniveau: eigenschappen1.uitvoerendBestuursniveau?.value || '',
      uitvoerendeOverheid: eigenschappen1.uitvoerendeOverheid?.value || '',
      geografischToepassingsgebied: eigenschappen2.geografischToepassingsgebied?.value || '',
      tags: eigenschappen2.tags?.value || '',
      publicatieKanalen: eigenschappen2.publicatieKanalen?.value || '',
      categorieenYourEurope: eigenschappen2.categorieenYourEurope?.value || ''
    };
}
