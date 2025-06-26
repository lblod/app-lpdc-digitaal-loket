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
    function groupByuriPubliekeDienstverlening(data, keysToKeep) {
      const grouped = {};
      data.forEach(item => {
        const id = item.uriPubliekeDienstverlening;
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push(item);
      });
      const combined = {};
      for (const [id, items] of Object.entries(grouped)) {
        combined[id] = {};
        keysToKeep.forEach(key => {
          combined[id][key] = items.map(i => i[key] || '').filter(Boolean).join(' | ');
        });
      }
      return combined;
    }

    function stripHtml(html) {
      return html
        .replace(/<(\/?(p|div|br|h[1-6]|li|ul|ol|table|tr|td|th))[^>]*>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }


    // 1. Basisinformatie
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

      SELECT DISTINCT ?uriBestuurseenheid ?aangemaaktDoor ?aangemaaktOp ?typeUri ?typeBestuurseenheid ?uriPubliekeDienstverlening ?titel ?beschrijving ?aanvullendeBeschrijving 
                      ?uitzondering ?aangepastOp ?aangepastDoor ?IPDCConceptID ?statusLabel ?versie WHERE {
        ?uriPubliekeDienstverlening a lpdcExt:InstancePublicService ;
          dct:title ?titel ;
          schema:dateModified ?aangepastOp ;
          schema:dateCreated ?aangemaaktOp ;
          adms:status ?status ;
          lpdcExt:dutchLanguageVariant ?versie ;
          schema:productID ?IPDCConceptID ;
          pav:createdBy ?uriBestuurseenheid ;
          dct:description ?beschrijving .

        ?uriBestuurseenheid a besluit:Bestuurseenheid ;
          skos:prefLabel ?aangemaaktDoor ;
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
        BIND(CONCAT(COALESCE(?firstName, ""), " ", COALESCE(?familyName, "")) AS ?aangepastDoor)
      } LIMIT 100
    `;

    const baseResponse = await query(baseQuery);
    const baseData = baseResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      titel: r.titel.value,
      aangepastOp: r.aangepastOp.value,
      statusLabel: r.statusLabel.value,
      versie: r.versie.value,
      uriBestuurseenheid: r.uriBestuurseenheid.value,
      aangemaaktDoor: r.aangemaaktDoor.value,
      aangemaaktOp: r.aangemaaktOp.value,
      beschrijving: stripHtml(r.beschrijving.value),
      aanvullendeBeschrijving: r.aanvullendeBeschrijving ? stripHtml(r.aanvullendeBeschrijving.value) : '',
      uitzondering: r.uitzondering ? stripHtml(r.uitzondering.value) : '',
      typeBestuurseenheid: r.typeBestuurseenheid.value,
      aangepastDoor: r.aangepastDoor.value
    }));

    // 2. Voorwaarden + bewijsstukken
    const requirementsQuery = `
      PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX m8g: <http://data.europa.eu/m8g/>


      SELECT DISTINCT ?uriPubliekeDienstverlening ?titelVoorwaarde ?beschrijvingVoorwaarde ?titelBewijsstuk ?beschrijvingBewijsstuk WHERE {
        ?uriPubliekeDienstverlening belgif:hasRequirement ?voorwaarde .
        ?voorwaarde dct:title ?titelVoorwaarde ;
                    dct:description ?beschrijvingVoorwaarde .
        OPTIONAL {
            ?voorwaarde m8g:hasSupportingEvidence ?voorwaardeBewijsstuk .

            ?voorwaardeBewijsstuk 
                dct:title       ?titelBewijsstuk ;
                dct:description ?beschrijvingBewijsstuk .
        }
      } LIMIT 100
    `;

    const reqResponse = await query(requirementsQuery);
    const reqData = reqResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      titelVoorwaarde: r.titelVoorwaarde.value,
      beschrijvingVoorwaarde: stripHtml(r.beschrijvingVoorwaarde.value),
      titelBewijsstuk: r.titelBewijsstuk ? r.titelBewijsstuk.value : '',
      beschrijvingBewijsstuk: r.beschrijvingBewijsstuk ? stripHtml(r.beschrijvingBewijsstuk.value) : ''
    }));
    const groupedRequirements = groupByuriPubliekeDienstverlening(reqData, ['titelVoorwaarde', 'beschrijvingVoorwaarde', 'titelBewijsstuk', 'beschrijvingBewijsstuk']);


    // 3. Procedures + procedure websites
    const proceduresQuery = `
      PREFIX cpsv: <http://purl.org/vocab/cpsv#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      PREFIX schema: <http://schema.org/>

      SELECT DISTINCT ?uriPubliekeDienstverlening ?titelProcedure ?beschrijvingProcedure ?titelProcedureWebsite ?beschrijvingProcedureWebsite ?urlProcedureWebsite WHERE {
        ?uriPubliekeDienstverlening cpsv:follows ?procedure .
        ?procedure dct:title ?titelProcedure ;
                   dct:description ?beschrijvingProcedure .
        OPTIONAL {
          ?procedure lpdcExt:hasWebsite ?procedureWebsite .
          ?procedureWebsite dct:title ?titelProcedureWebsite ;
                            schema:url ?urlProcedureWebsite .
          OPTIONAL { ?procedureWebsite dct:description ?beschrijvingProcedureWebsite }
        }
      } LIMIT 100
    `;

    const procResponse = await query(proceduresQuery);
    const procData = procResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      titelProcedure: r.titelProcedure.value,
      beschrijvingProcedure: stripHtml(r.beschrijvingProcedure.value),
      titelProcedureWebsite: r.titelProcedureWebsite ? r.titelProcedureWebsite.value : '',
      beschrijvingProcedureWebsite: r.beschrijvingProcedureWebsite ? stripHtml(r.beschrijvingProcedureWebsite.value) : '',
      urlProcedureWebsite: r.urlProcedureWebsite ? r.urlProcedureWebsite.value : ''
    }));
    const groupedProcedures = groupByuriPubliekeDienstverlening(procData, [
      'titelProcedure',
      'beschrijvingProcedure',
      'titelProcedureWebsite',
      'beschrijvingProcedureWebsite',
      'urlProcedureWebsite'
    ]);


    // 4. Kosten
    const costsQuery = `
      PREFIX m8g: <http://data.europa.eu/m8g/>
      PREFIX dct: <http://purl.org/dc/terms/>

      SELECT DISTINCT ?uriPubliekeDienstverlening ?titelKosten ?beschrijvingKosten WHERE {
        ?uriPubliekeDienstverlening m8g:hasCost ?kosten .
        ?kosten dct:title ?titelKosten ;
                dct:description ?beschrijvingKosten .
      } LIMIT 100
    `;

    const costsResponse = await query(costsQuery);
    const costsData = costsResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      titelKosten: r.titelKosten.value,
      beschrijvingKosten: stripHtml(r.beschrijvingKosten.value)
    }));
    const groupedCosts = groupByuriPubliekeDienstverlening(costsData, ['titelKosten', 'beschrijvingKosten']);


    // 5. Financiële voordelen
    const financialBenefitsQuery = `
      PREFIX cpsv: <http://purl.org/vocab/cpsv#>
      PREFIX dct: <http://purl.org/dc/terms/>

      SELECT DISTINCT ?uriPubliekeDienstverlening ?titelFinancieelVoordeel ?beschrijvingFinancieelVoordeel WHERE {
        ?uriPubliekeDienstverlening cpsv:produces ?financieleVoordeel .
        ?financieleVoordeel dct:title ?titelFinancieelVoordeel ;
                           dct:description ?beschrijvingFinancieelVoordeel .
      } LIMIT 100
    `;

    const finResponse = await query(financialBenefitsQuery);
    const finData = finResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      titelFinancieelVoordeel: r.titelFinancieelVoordeel.value,
      beschrijvingFinancieelVoordeel: stripHtml(r.beschrijvingFinancieelVoordeel.value)
    }));
    const groupedFinancialBenefits = groupByuriPubliekeDienstverlening(finData, ['titelFinancieelVoordeel', 'beschrijvingFinancieelVoordeel']);


    // 6. Regelgevende bronnen
    const legalResourcesQuery = `
      PREFIX m8g: <http://data.europa.eu/m8g/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX schema: <http://schema.org/>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>

      SELECT DISTINCT ?uriPubliekeDienstverlening ?regelgevendeBron ?titelRegelgevendeBron ?beschrijvingRegelgevendeBron ?urlRegelgevendeBron WHERE {
        OPTIONAL { ?uriPubliekeDienstverlening lpdcExt:regulation ?regelgevendeBron }
        OPTIONAL {
          ?uriPubliekeDienstverlening m8g:hasLegalResource ?legalResource .
          ?legalResource schema:url ?urlRegelgevendeBron .
          OPTIONAL { ?legalResource dct:title ?titelRegelgevendeBron }
          OPTIONAL { ?legalResource dct:description ?beschrijvingRegelgevendeBron }
        }
      } LIMIT 100
    `;

    const legalResponse = await query(legalResourcesQuery);
    const legalData = legalResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      regelgevendeBron: r.regelgevendeBron ? stripHtml(r.regelgevendeBron.value) : '',
      titelRegelgevendeBron: r.titelRegelgevendeBron ? r.titelRegelgevendeBron.value : '',
      beschrijvingRegelgevendeBron: r.beschrijvingRegelgevendeBron ? stripHtml(r.beschrijvingRegelgevendeBron.value) : '',
      urlRegelgevendeBron: r.urlRegelgevendeBron ? r.urlRegelgevendeBron.value : ''
    }));
    const groupedLegalResources = groupByuriPubliekeDienstverlening(legalData, ['regelgevendeBron', 'titelRegelgevendeBron', 'beschrijvingRegelgevendeBron', 'urlRegelgevendeBron']);


    // 7. Contactpunten
    const contactPointsQuery = `
      PREFIX m8g: <http://data.europa.eu/m8g/>
      PREFIX schema: <http://schema.org/>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      PREFIX adres: <https://data.vlaanderen.be/ns/adres#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      SELECT DISTINCT 
        ?uriPubliekeDienstverlening ?contactpuntEmail ?contactpuntTelefoon ?contactpuntWebsiteUrl ?contactpuntOpeningsuren 
        ?postcode ?gemeente ?adres WHERE {
        ?uriPubliekeDienstverlening m8g:hasContactPoint ?contactpunt .

        OPTIONAL { ?contactpunt schema:email ?contactpuntEmail }
        OPTIONAL { ?contactpunt schema:telephone ?contactpuntTelefoon }
        OPTIONAL { ?contactpunt schema:url ?contactpuntWebsiteUrl }
        OPTIONAL { ?contactpunt schema:openingHours ?contactpuntOpeningsuren }

        OPTIONAL {
          ?contactpunt lpdcExt:address ?contactpuntAdres .
          OPTIONAL { ?contactpuntAdres adres:postcode ?postcode }
          OPTIONAL { ?contactpuntAdres adres:gemeentenaam ?gemeente }
          OPTIONAL { ?contactpuntAdres adres:Straatnaam ?straatnaam }
          OPTIONAL { ?contactpuntAdres adres:Adresvoorstelling.huisnummer ?huisnummer }
          OPTIONAL { ?contactpuntAdres adres:Adresvoorstelling.busnummer ?busnummer }
        }
        BIND(CONCAT(COALESCE(?straatnaam, ""), " ", COALESCE(?huisnummer, ""), " ", COALESCE(?busnummer, "")) AS ?adres)
      } LIMIT 100
    `;

    const contactResponse = await query(contactPointsQuery);
    const contactData = contactResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      contactpuntEmail: r.contactpuntEmail ? r.contactpuntEmail.value : '',
      contactpuntTelefoon: r.contactpuntTelefoon ? r.contactpuntTelefoon.value : '',
      contactpuntWebsiteUrl: r.contactpuntWebsiteUrl ? r.contactpuntWebsiteUrl.value : '',
      contactpuntOpeningsuren: r.contactpuntOpeningsuren ? r.contactpuntOpeningsuren.value : '',
      postcode: r.postcode ? r.postcode.value : '',
      gemeente: r.gemeente ? r.gemeente.value : '',
      adres: r.adres ? r.adres.value : ''
    }));
    const groupedContactPoints = groupByuriPubliekeDienstverlening(contactData, [
      'contactpuntEmail',
      'contactpuntTelefoon',
      'contactpuntWebsiteUrl',
      'contactpuntOpeningsuren',
      'postcode',
      'gemeente',
      'adres'
    ]);


    // 8. Meer info / websites
    const moreInfoQuery = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX schema: <http://schema.org/>

      SELECT DISTINCT ?uriPubliekeDienstverlening ?titelWebsite ?beschrijvingWebsite ?urlWebsite WHERE {
        ?uriPubliekeDienstverlening rdfs:seeAlso ?meerInfo .
        ?meerInfo dct:title ?titelWebsite ;
                  schema:url ?urlWebsite .
        OPTIONAL { ?meerInfo dct:description ?beschrijvingWebsite }
      } LIMIT 100
    `;

    const moreInfoResponse = await query(moreInfoQuery);
    const moreInfoData = moreInfoResponse.results.bindings.map(r => ({
      uriPubliekeDienstverlening: r.uriPubliekeDienstverlening.value,
      titelWebsite: r.titelWebsite.value,
      urlWebsite: r.urlWebsite.value,
      beschrijvingWebsite: r.beschrijvingWebsite ? r.beschrijvingWebsite.value : ''
    }));
    const groupedMoreInfo = groupByuriPubliekeDienstverlening(moreInfoData, ['titelWebsite', 'beschrijvingWebsite', 'urlWebsite']);

    // 9. Detailinformatie
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
      LIMIT 100
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
    const groupedDetail = groupByuriPubliekeDienstverlening(detailData, [
      'startDatum',
      'eindDatum',
      'productTypeLabel',
      'doelgroep',
      'themas',
      'talen',
      'bevoegdBestuursniveau',
      'bevoegdeOverheid',
      'uitvoerendBestuursniveau',
      'uitvoerendeOverheid',
      'geografischToepassingsgebied',
      'tags',
      'publicatieKanalen',
      'categorieenYourEurope'
    ]);


    // Combineer alles per uriPubliekeDienstverlening
    const finalData = baseData.map(base => {
      const id = base.uriPubliekeDienstverlening;

      const merge = (grouped, keys) => {
        if (!grouped[id]) return keys.reduce((acc, k) => ({ ...acc, [k]: '' }), {});
        return keys.reduce((acc, k) => ({ ...acc, [k]: grouped[id][k] || '' }), {});
      };

      return {
        ...base,
        ...merge(groupedRequirements, ['titelVoorwaarde', 'beschrijvingVoorwaarde', 'titelBewijsstuk', 'beschrijvingBewijsstuk']),
        ...merge(groupedProcedures, [
          'titelProcedure',
          'beschrijvingProcedure',
          'titelProcedureWebsite',
          'beschrijvingProcedureWebsite',
          'urlProcedureWebsite'
        ]),
        ...merge(groupedCosts, ['titelKosten', 'beschrijvingKosten']),
        ...merge(groupedFinancialBenefits, ['titelFinancieelVoordeel', 'beschrijvingFinancieelVoordeel']),
        ...merge(groupedLegalResources, ['regelgevendeBron', 'titelRegelgevendeBron', 'beschrijvingRegelgevendeBron', 'urlRegelgevendeBron']),
        ...merge(groupedContactPoints, [
          'contactpuntEmail',
          'contactpuntTelefoon',
          'contactpuntWebsiteUrl',
          'contactpuntOpeningsuren',
          'postcode',
          'gemeente',
          'adres'
        ]),
        ...merge(groupedMoreInfo, ['titelWebsite', 'beschrijvingWebsite', 'urlWebsite']),
        ...merge(groupedDetail, [
        'startDatum',
        'eindDatum',
        'productTypeLabel',
        'doelgroep',
        'themas',
        'talen',
        'bevoegdBestuursniveau',
        'bevoegdeOverheid',
        'uitvoerendBestuursniveau',
        'uitvoerendeOverheid',
        'geografischToepassingsgebied',
        'tags',
        'publicatieKanalen',
        'categorieenYourEurope'
      ])

      };
    });

    // Headers van CSV zijn alle keys van één record (als ze bestaan)
    const csvHeaders = finalData.length > 0 ? Object.keys(finalData[0]) : [];

    await generateReportFromData(finalData, csvHeaders, reportData);
  }
};
