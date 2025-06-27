import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
  cronPattern: '0 0 6 * * *',
  name: 'lpdcBestuurseenheidCompleteReport',
  execute: async () => {
    const reportData = {
      title: 'Overview of LPDC instances - all fields',
      description: 'Overview of LPDC services with all fields included',
      filePrefix: 'lpdcBestuurseenheidComplete'
    };

    // Helper functies
    function constructValuesBlock(varName, values) {
      const blocks = [];
      const chunkSize = 50;
      for (let i = 0; i < values.length; i += chunkSize) {
        const chunk = values.slice(i, i + chunkSize);
        blocks.push(`VALUES ?${varName} { ${chunk.map(uri => `<${uri}>`).join(' ')} }`);
      }
      return blocks;
    }

    function stripHtml(html) {
      return html
        .replace(/<(\/?(p|div|br|h[1-6]|li|ul|ol|table|tr|td|th))[^>]*>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function groupByuriPubliekeDienstverlening(array) {
      return array.reduce((acc, item) => {
        const id = item.uriPubliekeDienstverlening;
        if (!acc[id]) acc[id] = [];
        acc[id].push(item);
        return acc;
      }, {});
    }

    // 0. Uri's ophalen
    const getUrisQuery = `
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      SELECT DISTINCT ?uriPubliekeDienstverlening WHERE {
        ?uriPubliekeDienstverlening a lpdcExt:InstancePublicService .
      }
    `;
    const urisResponse = await query(getUrisQuery);
    const allUris = urisResponse.results.bindings.map(r => r.uriPubliekeDienstverlening.value);

    // 1. Basisinformatie
      const baseInfoData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const baseQuery = `
        PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
        PREFIX adms:    <http://www.w3.org/ns/adms#>
        PREFIX dct:     <http://purl.org/dc/terms/>
        PREFIX pav:     <http://purl.org/pav/>
        PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
        PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
        PREFIX schema:  <http://schema.org/>
        PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>

        SELECT DISTINCT ?naamBestuurseenheid ?aangemaaktDoor ?aangemaaktOp ?typeBestuurseenheid ?uriPubliekeDienstverlening ?titel ?beschrijving ?aanvullendeBeschrijving 
                        ?uitzondering ?aangepastOp ?aangepastDoor ?IPDCConceptID ?statusLabel ?versie WHERE {
                        ${valuesBlock}
          ?uriPubliekeDienstverlening a lpdcExt:InstancePublicService ;
            dct:title ?titel ;
            schema:dateModified ?aangepastOp ;
            schema:dateCreated ?aangemaaktOp ;
            adms:status ?status ;
            lpdcExt:dutchLanguageVariant ?versie ;
            schema:productID ?IPDCConceptID ;
            pav:createdBy ?uriBestuurseenheid ;
            dct:creator ?creator ;
            dct:description ?beschrijving .

          ?uriBestuurseenheid a besluit:Bestuurseenheid ;
            skos:prefLabel ?naamBestuurseenheid ;
            besluit:classificatie ?typeUri .
          ?typeUri skos:prefLabel ?typeBestuurseenheid .
          ?status skos:prefLabel ?statusLabel 

          OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:additionalDescription ?aanvullendeBeschrijving }
          OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:exception ?uitzondering }

          OPTIONAL {
            ?uriPubliekeDienstverlening ext:lastModifiedBy ?modifiedByUri.
            ?modifiedByUri foaf:firstName ?firstName ;
                          foaf:familyName ?familyName .
          }

          OPTIONAL {
            ?creator foaf:firstName ?creatorFirstName ;
                            foaf:familyName ?creatorFamilyName .
          }
          BIND(CONCAT(COALESCE(?firstName, ""), " ", COALESCE(?familyName, "")) AS ?aangepastDoor)
          BIND(CONCAT(COALESCE(?creatorFirstName, ""), " ", COALESCE(?creatorFamilyName, "")) AS ?aangemaaktDoor)
        }
      `;
      const baseResponse = await query(baseQuery);
      const baseData = baseResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        naamBestuurseenheid: r.naamBestuurseenheid.value,
        typeBestuurseenheid: r.typeBestuurseenheid.value,
        aangemaaktOp: r.aangemaaktOp.value,
        aangemaaktDoor: r.aangemaaktDoor.value,
        aangepastOp: r.aangepastOp.value,
        aangepastDoor: r.aangepastDoor.value,
        IPDCConceptID: r.IPDCConceptID.value,
        statusLabel: r.statusLabel.value,
        versie: r.versie.value,
        titel: r.titel.value,
        beschrijving: stripHtml(r.beschrijving.value),
        aanvullendeBeschrijving: r.aanvullendeBeschrijving ? stripHtml(r.aanvullendeBeschrijving.value) : '',
        uitzondering: r.uitzondering ? stripHtml(r.uitzondering.value) : '',
      }));
      baseInfoData.push(...baseData);
    }

    // 2. Voorwaarden + bewijsstukken
    const requirementsData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const requirementsQuery = `
        PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX m8g: <http://data.europa.eu/m8g/>

        SELECT DISTINCT ?uriPubliekeDienstverlening ?titelVoorwaarde ?beschrijvingVoorwaarde ?titelBewijsstuk ?beschrijvingBewijsstuk WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening belgif:hasRequirement ?voorwaarde .
          ?voorwaarde dct:title ?titelVoorwaarde ;
                      dct:description ?beschrijvingVoorwaarde .
          OPTIONAL {
            ?voorwaarde m8g:hasSupportingEvidence ?voorwaardeBewijsstuk .
            ?voorwaardeBewijsstuk dct:title       ?titelBewijsstuk ;
                                    dct:description ?beschrijvingBewijsstuk .
          }
        }`;
      const reqResponse = await query(requirementsQuery);
      const reqData = reqResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        titelVoorwaarde: r.titelVoorwaarde.value,
        beschrijvingVoorwaarde: stripHtml(r.beschrijvingVoorwaarde.value),
        titelBewijsstuk: r.titelBewijsstuk ? r.titelBewijsstuk.value : '',
        beschrijvingBewijsstuk: r.beschrijvingBewijsstuk ? stripHtml(r.beschrijvingBewijsstuk.value) : ''
      }));
      requirementsData.push(...reqData);
    }
    const groupedRequirements = groupByuriPubliekeDienstverlening(requirementsData)


    // 3. Procedures + procedure websites
    const proceduresData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const proceduresQuery = `
        PREFIX cpsv: <http://purl.org/vocab/cpsv#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
        PREFIX schema: <http://schema.org/>

        SELECT DISTINCT ?uriPubliekeDienstverlening ?titelProcedure ?beschrijvingProcedure ?titelProcedureWebsite ?beschrijvingProcedureWebsite ?urlProcedureWebsite WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening cpsv:follows ?procedure .
          ?procedure dct:title ?titelProcedure ;
                    dct:description ?beschrijvingProcedure .
          OPTIONAL {
            ?procedure lpdcExt:hasWebsite ?procedureWebsite .
            ?procedureWebsite dct:title ?titelProcedureWebsite ;
                              schema:url ?urlProcedureWebsite .
            OPTIONAL { ?procedureWebsite dct:description ?beschrijvingProcedureWebsite }
          }
        }`;
      const procResponse = await query(proceduresQuery);
      const procData = procResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        titelProcedure: r.titelProcedure.value,
        beschrijvingProcedure: stripHtml(r.beschrijvingProcedure.value),
        titelProcedureWebsite: r.titelProcedureWebsite ? r.titelProcedureWebsite.value : '',
        beschrijvingProcedureWebsite: r.beschrijvingProcedureWebsite ? stripHtml(r.beschrijvingProcedureWebsite.value) : '',
        urlProcedureWebsite: r.urlProcedureWebsite ? r.urlProcedureWebsite.value : ''
      }));
      proceduresData.push(...procData);
    }
    const groupedProcedures = groupByuriPubliekeDienstverlening(proceduresData)

    // 4. Kosten
    const costData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const costsQuery = `
        PREFIX m8g: <http://data.europa.eu/m8g/>
        PREFIX dct: <http://purl.org/dc/terms/>

        SELECT DISTINCT ?uriPubliekeDienstverlening ?titelKosten ?beschrijvingKosten WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening m8g:hasCost ?kosten .
          ?kosten dct:title ?titelKosten ;
                  dct:description ?beschrijvingKosten .
        }`;
      const costsResponse = await query(costsQuery);
      const costsData = costsResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        titelKosten: r.titelKosten.value,
        beschrijvingKosten: stripHtml(r.beschrijvingKosten.value)
      }));
      costData.push(...costsData);
    }
    const groupedCosts = groupByuriPubliekeDienstverlening(costData)

    // 5. Financiële voordelen
    const financialBenefitsData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const financialBenefitsQuery = `
        PREFIX cpsv: <http://purl.org/vocab/cpsv#>
        PREFIX dct: <http://purl.org/dc/terms/>

        SELECT DISTINCT ?uriPubliekeDienstverlening ?titelFinancieelVoordeel ?beschrijvingFinancieelVoordeel WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening cpsv:produces ?financieleVoordeel .
          ?financieleVoordeel dct:title ?titelFinancieelVoordeel ;
                            dct:description ?beschrijvingFinancieelVoordeel .
        }`;
      const finResponse = await query(financialBenefitsQuery);
      const finData = finResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        titelFinancieelVoordeel: r.titelFinancieelVoordeel.value,
        beschrijvingFinancieelVoordeel: stripHtml(r.beschrijvingFinancieelVoordeel.value)
      }));
      financialBenefitsData.push(...finData);
    }
    const groupedFinancialBenefits = groupByuriPubliekeDienstverlening(financialBenefitsData)

    // 6. Regelgevende bronnen
    const legalResourcesData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const legalResourcesQuery = `
        PREFIX m8g: <http://data.europa.eu/m8g/>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX schema: <http://schema.org/>
        PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>

        SELECT DISTINCT ?uriPubliekeDienstverlening ?regelgeving ?titelRegelgevendeBron ?beschrijvingRegelgevendeBron ?urlRegelgevendeBron WHERE {
          ${valuesBlock}
          OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:regulation ?regelgeving }
          OPTIONAL {
            ?uriPubliekeDienstverlening m8g:hasLegalResource ?legalResource .
            ?legalResource schema:url ?urlRegelgevendeBron .
            OPTIONAL { ?legalResource dct:title ?titelRegelgevendeBron }
            OPTIONAL { ?legalResource dct:description ?beschrijvingRegelgevendeBron }
          }
        }`;
      const legalResponse = await query(legalResourcesQuery);
      const legalData = legalResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        regelgeving: r.regelgeving ? stripHtml(r.regelgeving.value) : '',
        titelRegelgevendeBron: r.titelRegelgevendeBron ? r.titelRegelgevendeBron.value : '',
        beschrijvingRegelgevendeBron: r.beschrijvingRegelgevendeBron ? stripHtml(r.beschrijvingRegelgevendeBron.value) : '',
        urlRegelgevendeBron: r.urlRegelgevendeBron ? r.urlRegelgevendeBron.value : ''
      }));
      legalResourcesData.push(...legalData);
    }
    const groupedLegalResources = groupByuriPubliekeDienstverlening(legalResourcesData)
      
    // 7. Contactpunten
    const contactPointData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const contactPointsQuery = `
        PREFIX m8g: <http://data.europa.eu/m8g/>
        PREFIX schema: <http://schema.org/>
        PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
        PREFIX adres: <https://data.vlaanderen.be/ns/adres#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

        SELECT DISTINCT 
          ?uriPubliekeDienstverlening ?contactpuntEmail ?contactpuntTelefoon ?contactpuntWebsiteUrl ?contactpuntOpeningsuren 
          ?gemeente ?adres WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening m8g:hasContactPoint ?contactpunt .

          OPTIONAL { ?contactpunt schema:email ?contactpuntEmail }
          OPTIONAL { ?contactpunt schema:telephone ?contactpuntTelefoon }
          OPTIONAL { ?contactpunt schema:url ?contactpuntWebsiteUrl }
          OPTIONAL { ?contactpunt schema:openingHours ?contactpuntOpeningsuren }

          OPTIONAL {
            ?contactpunt lpdcExt:address ?contactpuntAdres .
            OPTIONAL { ?contactpuntAdres adres:gemeentenaam ?gemeente }
            OPTIONAL { ?contactpuntAdres adres:Straatnaam ?straatnaam }
            OPTIONAL { ?contactpuntAdres adres:Adresvoorstelling.huisnummer ?huisnummer }
            OPTIONAL { ?contactpuntAdres adres:Adresvoorstelling.busnummer ?busnummer }
          }
          BIND(CONCAT(COALESCE(?straatnaam, ""), " ", COALESCE(?huisnummer, ""), " ", COALESCE(?busnummer, "")) AS ?adres)
        }
      `;

      const contactResponse = await query(contactPointsQuery);
      const contactData = contactResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        contactpuntEmail: r.contactpuntEmail ? r.contactpuntEmail.value : '',
        contactpuntTelefoon: r.contactpuntTelefoon ? r.contactpuntTelefoon.value : '',
        contactpuntWebsiteUrl: r.contactpuntWebsiteUrl ? r.contactpuntWebsiteUrl.value : '',
        contactpuntOpeningsuren: r.contactpuntOpeningsuren ? r.contactpuntOpeningsuren.value : '',
        gemeente: r.gemeente ? r.gemeente.value : '',
        adres: r.adres ? r.adres.value : ''
      }));
      contactPointData.push(...contactData);
    }
    const groupedContactPoints = groupByuriPubliekeDienstverlening(contactPointData)

    // 8. Meer info / websites
    const moreInfoWebsitesData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const moreInfoQuery = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX schema: <http://schema.org/>

        SELECT DISTINCT ?uriPubliekeDienstverlening ?titelWebsite ?beschrijvingWebsite ?urlWebsite WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening rdfs:seeAlso ?meerInfo .
          ?meerInfo dct:title ?titelWebsite ;
                    schema:url ?urlWebsite .
          OPTIONAL { ?meerInfo dct:description ?beschrijvingWebsite }
        }
      `;

      const moreInfoResponse = await query(moreInfoQuery);
      const moreInfoData = moreInfoResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
        titelWebsite: r.titelWebsite.value,
        urlWebsite: r.urlWebsite.value,
        beschrijvingWebsite: r.beschrijvingWebsite ? r.beschrijvingWebsite.value : ''
      }));
      moreInfoWebsitesData.push(...moreInfoData);
    }
    const groupedMoreInfo = groupByuriPubliekeDienstverlening(moreInfoWebsitesData)

    // 9. Detailinformatie
    const detailFeaturesData = [];
    for (const valuesBlock of constructValuesBlock('uriPubliekeDienstverlening', allUris)) {
      const detailQuery = `
        PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
        PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
        PREFIX ext:     <http://mu.semte.ch/vocabularies/ext/>
        PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
        PREFIX adms:    <http://www.w3.org/ns/adms#>
        PREFIX dct:     <http://purl.org/dc/terms/>
        PREFIX schema:  <http://schema.org/>
        PREFIX pav:     <http://purl.org/pav/>
        PREFIX foaf:    <http://xmlns.com/foaf/0.1/>
        PREFIX m8g:     <http://data.europa.eu/m8g/>

        SELECT DISTINCT
          ?uriPubliekeDienstverlening ?startDatum ?eindDatum ?productTypeLabel
          (GROUP_CONCAT(DISTINCT ?targetAudienceLabel; SEPARATOR="; ") AS ?doelgroep)
          (GROUP_CONCAT(DISTINCT ?thematicAreaLabel; SEPARATOR="; ") AS ?themas)
          (GROUP_CONCAT(DISTINCT ?languageLabel; SEPARATOR="; ") AS ?talen)
          (GROUP_CONCAT(DISTINCT ?competentAuthorityLevelLabel; SEPARATOR="; ") AS ?bevoegdBestuursniveau)
          (GROUP_CONCAT(DISTINCT ?competentAuthorityLabel; SEPARATOR="; ") AS ?bevoegdeOverheid)
          (GROUP_CONCAT(DISTINCT ?executingAuthorityLevelLabel; SEPARATOR="; ") AS ?uitvoerendBestuursniveau)
          (GROUP_CONCAT(DISTINCT ?executingAuthorityLabel; SEPARATOR="; ") AS ?uitvoerendeOverheid)
          (GROUP_CONCAT(DISTINCT ?spatialLabel; SEPARATOR="; ") AS ?geografischToepassingsgebied)
          (GROUP_CONCAT(DISTINCT ?tag; SEPARATOR="; ") AS ?tags)
          (GROUP_CONCAT(DISTINCT ?publicationMediumLabel; SEPARATOR="; ") AS ?publicatieKanalen)
          (GROUP_CONCAT(DISTINCT ?yourEuropeCategoryLabel; SEPARATOR="; ") AS ?categorieenYourEurope)
        WHERE {
          ${valuesBlock}
          ?uriPubliekeDienstverlening a lpdcExt:InstancePublicService .

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
          ?uriPubliekeDienstverlening ?startDatum ?eindDatum ?productTypeLabel
      
      `;

      const detailResponse = await query(detailQuery);
      const detailData = detailResponse.results.bindings.map(r => ({
        uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
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
      detailFeaturesData.push(...detailData);
    }
    const groupedDetail = groupByuriPubliekeDienstverlening(detailFeaturesData)

    // Combineer alles per uriPubliekeDienstverlening
    const finalData = baseInfoData.map(base => {
      const id = base.uriPubliekeDienstverlening;

      // Merge helper for new grouped arrays
      const merge = (grouped, keys) => {
        const items = grouped[id] || [];
        // Combine each key’s values from all items with newline separation
        const combined = {};
        keys.forEach(k => {
          combined[k] = items.map(item => item[k] || '').filter(Boolean).join('\n');
        });
        return combined;
      };

      return {
        ...base,
        ...merge(groupedRequirements, [
          'titelVoorwaarde', 'beschrijvingVoorwaarde',
          'titelBewijsstuk', 'beschrijvingBewijsstuk'
        ]),
        ...merge(groupedProcedures, [
          'titelProcedure', 'beschrijvingProcedure',
          'titelProcedureWebsite', 'beschrijvingProcedureWebsite',
          'urlProcedureWebsite'
        ]),
        ...merge(groupedCosts, [
          'titelKosten', 'beschrijvingKosten'
        ]),
        ...merge(groupedFinancialBenefits, [
          'titelFinancieelVoordeel', 'beschrijvingFinancieelVoordeel'
        ]),
        ...merge(groupedLegalResources, [
          'regelgeving', 'titelRegelgevendeBron',
          'beschrijvingRegelgevendeBron', 'urlRegelgevendeBron'
        ]),
        ...merge(groupedContactPoints, [
          'contactpuntEmail', 'contactpuntTelefoon', 'contactpuntWebsiteUrl',
          'contactpuntOpeningsuren', 'gemeente', 'adres'
        ]),
        ...merge(groupedMoreInfo, [
          'titelWebsite', 'beschrijvingWebsite', 'urlWebsite'
        ]),
        ...merge(groupedDetail, [
          'startDatum', 'eindDatum', 'productTypeLabel',
          'doelgroep', 'themas', 'talen',
          'bevoegdBestuursniveau', 'bevoegdeOverheid',
          'uitvoerendBestuursniveau', 'uitvoerendeOverheid',
          'geografischToepassingsgebied', 'tags', 'publicatieKanalen',
          'categorieenYourEurope'
        ])
      };
    });

    // Headers van CSV zijn alle keys van één record (als ze bestaan)
    const csvHeaders = finalData.length > 0 ? Object.keys(finalData[0]) : [];

    await generateReportFromData(finalData, csvHeaders, reportData);

  }
};
