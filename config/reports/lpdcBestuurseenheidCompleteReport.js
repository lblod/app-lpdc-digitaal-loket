import { generateReportFromData } from '../helpers.js';
import { querySudo as query } from '@lblod/mu-auth-sudo';

export default {
  cronPattern: '0 0 6 * * *',
  name: 'lpdcBestuurseenheidCompleteReport',
  execute: async () => {
    const reportData = {
      title: 'Complete LPDC Services Report',
      description: 'Overview of LPDC services with all detail blocks combined',
      filePrefix: 'lpdcBestuurseenheidComplete'
    };

    // Helper functies
    function groupByUriPublicService(data, keysToKeep) {
      const grouped = {};
      data.forEach(item => {
        const id = item.uriPublicService;
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
      return html.replace(/<[^>]+>/g, '').trim();
    }

    // 1. Basisinformatie (public service + bestuurseenheid + status + modifiedBy)
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

      SELECT DISTINCT ?uriBestuurseenheid ?naam ?typeUri ?type ?uriPublicService ?title ?beschrijving ?aanvullendeBeschrijving ?uitzondering ?modified ?modifiedBy ?status ?statusLabel WHERE {
  VALUES ?uriPublicService {
    <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
  }
        ?uriPublicService a lpdcExt:InstancePublicService ;
          dct:title ?title ;
          schema:dateModified ?modified ;
          adms:status ?status ;
          pav:createdBy ?uriBestuurseenheid ;
          dct:description ?beschrijving .

        ?status skos:prefLabel ?statusLabel .

        ?uriBestuurseenheid a besluit:Bestuurseenheid ;
          skos:prefLabel ?naam ;
          besluit:classificatie ?typeUri .
        ?typeUri skos:prefLabel ?type .
        ?status skos:prefLabel ?statusLabel 

        OPTIONAL { ?uriPublicService lpdcExt:additionalDescription ?aanvullendeBeschrijving }
        OPTIONAL { ?uriPublicService lpdcExt:exception ?uitzondering }

        OPTIONAL {
          ?uriPublicService ext:lastModifiedBy ?modifiedByUri.
          ?modifiedByUri foaf:firstName ?firstName ;
                         foaf:familyName ?familyName .
        }
        BIND(CONCAT(COALESCE(?firstName, ""), " ", COALESCE(?familyName, "")) AS ?modifiedBy)
      }
    `;

    const baseResponse = await query(baseQuery);
    const baseData = baseResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      title: r.title.value,
      modified: r.modified.value,
      statusLabel: r.statusLabel.value,
      uriBestuurseenheid: r.uriBestuurseenheid.value,
      naam: r.naam.value,
      type: r.type.value,
      modifiedBy: r.modifiedBy.value
    }));

    // 2. Voorwaarden (requirements)
    const requirementsQuery = `
      PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX m8g: <http://data.europa.eu/m8g/>


      SELECT DISTINCT ?uriPublicService ?titelVoorwaarde ?beschrijvingVoorwaarde ?titelVoorwaardeBewijsstuk ?beschrijvingVoorwaardeBewijsstuk WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService belgif:hasRequirement ?voorwaarde .
        ?voorwaarde dct:title ?titelVoorwaarde ;
                    dct:description ?beschrijvingVoorwaarde .
        OPTIONAL {
            ?voorwaarde m8g:hasSupportingEvidence ?voorwaardeBewijsstuk .

            ?voorwaardeBewijsstuk 
                dct:title       ?titelVoorwaardeBewijsstuk ;
                dct:description ?beschrijvingVoorwaardeBewijsstuk .
        }
      }
    `;

    const reqResponse = await query(requirementsQuery);
    const reqData = reqResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      titelVoorwaarde: r.titelVoorwaarde.value,
      beschrijvingVoorwaarde: stripHtml(r.beschrijvingVoorwaarde.value)
    }));
    const groupedRequirements = groupByUriPublicService(reqData, ['titelVoorwaarde', 'beschrijvingVoorwaarde']);


    // 3. Procedures + procedure websites
    const proceduresQuery = `
      PREFIX cpsv: <http://purl.org/vocab/cpsv#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>
      PREFIX schema: <http://schema.org/>

      SELECT DISTINCT ?uriPublicService ?titelProcedure ?beschrijvingProcedure ?titelProcedureWebsite ?beschrijvingProcedureWebsite ?urlProcedureWebsite WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService cpsv:follows ?procedure .
        ?procedure dct:title ?titelProcedure ;
                   dct:description ?beschrijvingProcedure .
        OPTIONAL {
          ?procedure lpdcExt:hasWebsite ?procedureWebsite .
          ?procedureWebsite dct:title ?titelProcedureWebsite ;
                            schema:url ?urlProcedureWebsite .
          OPTIONAL { ?procedureWebsite dct:description ?beschrijvingProcedureWebsite }
        }
      }
    `;

    const procResponse = await query(proceduresQuery);
    const procData = procResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      titelProcedure: r.titelProcedure.value,
      beschrijvingProcedure: stripHtml(r.beschrijvingProcedure.value),
      titelProcedureWebsite: r.titelProcedureWebsite ? r.titelProcedureWebsite.value : '',
      beschrijvingProcedureWebsite: r.beschrijvingProcedureWebsite ? stripHtml(r.beschrijvingProcedureWebsite.value) : '',
      urlProcedureWebsite: r.urlProcedureWebsite ? r.urlProcedureWebsite.value : ''
    }));
    const groupedProcedures = groupByUriPublicService(procData, [
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

      SELECT DISTINCT ?uriPublicService ?titelKosten ?beschrijvingKosten WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService m8g:hasCost ?kosten .
        ?kosten dct:title ?titelKosten ;
                dct:description ?beschrijvingKosten .
      }
    `;

    const costsResponse = await query(costsQuery);
    const costsData = costsResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      titelKosten: r.titelKosten.value,
      beschrijvingKosten: stripHtml(r.beschrijvingKosten.value)
    }));
    const groupedCosts = groupByUriPublicService(costsData, ['titelKosten', 'beschrijvingKosten']);


    // 5. Financiële voordelen
    const financialBenefitsQuery = `
      PREFIX cpsv: <http://purl.org/vocab/cpsv#>
      PREFIX dct: <http://purl.org/dc/terms/>

      SELECT DISTINCT ?uriPublicService ?titelFinancieelVoordeel ?beschrijvingFinancieelVoordeel WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService cpsv:produces ?financieleVoordeel .
        ?financieleVoordeel dct:title ?titelFinancieelVoordeel ;
                           dct:description ?beschrijvingFinancieelVoordeel .
      }
    `;

    const finResponse = await query(financialBenefitsQuery);
    const finData = finResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      titelFinancieelVoordeel: r.titelFinancieelVoordeel.value,
      beschrijvingFinancieelVoordeel: stripHtml(r.beschrijvingFinancieelVoordeel.value)
    }));
    const groupedFinancialBenefits = groupByUriPublicService(finData, ['titelFinancieelVoordeel', 'beschrijvingFinancieelVoordeel']);


    // 6. Regelgevende bronnen (legal resources)
    const legalResourcesQuery = `
      PREFIX m8g: <http://data.europa.eu/m8g/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX schema: <http://schema.org/>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>

      SELECT DISTINCT ?uriPublicService ?regelgeving ?titelRegelgeving ?beschrijvingRegelgeving ?urlRegelgeving WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        OPTIONAL { ?uriPublicService lpdcExt:regulation ?regelgeving }
        OPTIONAL {
          ?uriPublicService m8g:hasLegalResource ?legalResource .
          ?legalResource schema:url ?urlRegelgeving .
          OPTIONAL { ?legalResource dct:title ?titelRegelgeving }
          OPTIONAL { ?legalResource dct:description ?beschrijvingRegelgeving }
        }
      }
    `;

    const legalResponse = await query(legalResourcesQuery);
    const legalData = legalResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      regelgeving: r.regelgeving ? stripHtml(r.regelgeving.value) : '',
      titelRegelgeving: r.titelRegelgeving ? r.titelRegelgeving.value : '',
      beschrijvingRegelgeving: r.beschrijvingRegelgeving ? stripHtml(r.beschrijvingRegelgeving.value) : '',
      urlRegelgeving: r.urlRegelgeving ? r.urlRegelgeving.value : ''
    }));
    const groupedLegalResources = groupByUriPublicService(legalData, ['regelgeving', 'titelRegelgeving', 'beschrijvingRegelgeving', 'urlRegelgeving']);


    // 7. Contactpunten
    const contactPointsQuery = `
      PREFIX m8g: <http://data.europa.eu/m8g/>
      PREFIX schema: <http://schema.org/>
      PREFIX lpdcExt: <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#>

      SELECT DISTINCT ?uriPublicService ?contactpuntEmail ?contactpuntTelefoon ?contactpuntWebsiteUrl ?contactpuntOpeningsuren ?contactpuntAdres WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService m8g:hasContactPoint ?contactpunt .
        OPTIONAL { ?contactpunt schema:email ?contactpuntEmail }
        OPTIONAL { ?contactpunt schema:telephone ?contactpuntTelefoon }
        OPTIONAL { ?contactpunt schema:url ?contactpuntWebsiteUrl }
        OPTIONAL { ?contactpunt schema:openingHours ?contactpuntOpeningsuren }
        OPTIONAL { ?contactpunt lpdcExt:address ?contactpuntAdres }
      }
    `;

    const contactResponse = await query(contactPointsQuery);
    const contactData = contactResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      contactpuntEmail: r.contactpuntEmail ? r.contactpuntEmail.value : '',
      contactpuntTelefoon: r.contactpuntTelefoon ? r.contactpuntTelefoon.value : '',
      contactpuntWebsiteUrl: r.contactpuntWebsiteUrl ? r.contactpuntWebsiteUrl.value : '',
      contactpuntOpeningsuren: r.contactpuntOpeningsuren ? r.contactpuntOpeningsuren.value : '',
      contactpuntAdres: r.contactpuntAdres ? r.contactpuntAdres.value : ''
    }));
    const groupedContactPoints = groupByUriPublicService(contactData, [
      'contactpuntEmail',
      'contactpuntTelefoon',
      'contactpuntWebsiteUrl',
      'contactpuntOpeningsuren',
      'contactpuntAdres'
    ]);


    // 8. Meer info / websites
    const moreInfoQuery = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX schema: <http://schema.org/>

      SELECT DISTINCT ?uriPublicService ?titelWebsite ?beschrijvingWebsite ?urlWebsite WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService rdfs:seeAlso ?meerInfo .
        ?meerInfo dct:title ?titelWebsite ;
                  schema:url ?urlWebsite .
        OPTIONAL { ?meerInfo dct:description ?beschrijvingWebsite }
      }
    `;

    const moreInfoResponse = await query(moreInfoQuery);
    const moreInfoData = moreInfoResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      titelWebsite: r.titelWebsite.value,
      beschrijvingWebsite: r.beschrijvingWebsite ? stripHtml(r.beschrijvingWebsite.value) : '',
      urlWebsite: r.urlWebsite.value
    }));
    const groupedMoreInfo = groupByUriPublicService(moreInfoData, ['titelWebsite', 'beschrijvingWebsite', 'urlWebsite']);

    // 9. Detailinformatie (thematische & andere labels)
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
        ?uriPublicService ?startDate ?endDate
        ?productTypeLabel
        (GROUP_CONCAT(DISTINCT ?targetAudienceLabel; SEPARATOR="; ") AS ?targetAudiences)
        (GROUP_CONCAT(DISTINCT ?thematicAreaLabel; SEPARATOR="; ") AS ?themes)
        (GROUP_CONCAT(DISTINCT ?languageLabel; SEPARATOR="; ") AS ?languages)
        (GROUP_CONCAT(DISTINCT ?competentAuthorityLevelLabel; SEPARATOR="; ") AS ?competentAuthorityLevels)
        (GROUP_CONCAT(DISTINCT ?competentAuthorityLabel; SEPARATOR="; ") AS ?competentAuthorities)
        (GROUP_CONCAT(DISTINCT ?executingAuthorityLevelLabel; SEPARATOR="; ") AS ?executingAuthorityLevels)
        (GROUP_CONCAT(DISTINCT ?executingAuthorityLabel; SEPARATOR="; ") AS ?executingAuthorities)
        (GROUP_CONCAT(DISTINCT ?spatialLabel; SEPARATOR="; ") AS ?spatialScopes)
        (GROUP_CONCAT(DISTINCT ?tag; SEPARATOR="; ") AS ?tags)
        (GROUP_CONCAT(DISTINCT ?publicationMediumLabel; SEPARATOR="; ") AS ?publicationMediums)
        (GROUP_CONCAT(DISTINCT ?yourEuropeCategoryLabel; SEPARATOR="; ") AS ?categorieenYourEurope)
      WHERE {
        VALUES ?uriPublicService {
          <http://data.lblod.info/id/public-service/82c6537f-595a-4c75-9b86-43ef03bf9d73>
        }
        ?uriPublicService a lpdcExt:InstancePublicService .

        OPTIONAL { ?uriPublicService schema:startDate ?startDate }
        OPTIONAL { ?uriPublicService schema:endDate ?endDate }
        OPTIONAL {
          ?uriPublicService dct:type ?productType .
          ?productType skos:prefLabel ?productTypeLabel .
        }
        OPTIONAL {
          ?uriPublicService lpdcExt:targetAudience ?targetAudience .
          ?targetAudience skos:prefLabel ?targetAudienceLabel .
        }
        OPTIONAL {
          ?uriPublicService m8g:thematicArea ?thematicArea .
          ?thematicArea skos:prefLabel ?thematicAreaLabel .
        }
        OPTIONAL {
          ?uriPublicService dct:language ?language .
          ?language skos:prefLabel ?languageLabel .
        }
        OPTIONAL {
          ?uriPublicService lpdcExt:competentAuthorityLevel ?competentAuthorityLevel .
          ?competentAuthorityLevel skos:prefLabel ?competentAuthorityLevelLabel .
        }
        OPTIONAL {
          ?uriPublicService m8g:hasCompetentAuthority ?competentAuthority .
          ?competentAuthority skos:prefLabel ?competentAuthorityLabel .
        }
        OPTIONAL {
          ?uriPublicService lpdcExt:executingAuthorityLevel ?executingAuthorityLevel .
          ?executingAuthorityLevel skos:prefLabel ?executingAuthorityLevelLabel .
        }
        OPTIONAL {
          ?uriPublicService lpdcExt:hasExecutingAuthority ?executingAuthority .
          ?executingAuthority skos:prefLabel ?executingAuthorityLabel .
        }
        OPTIONAL {
          ?uriPublicService dct:spatial ?spatial .
          ?spatial skos:prefLabel ?spatialLabel .
        }
        OPTIONAL { ?uriPublicService <http://www.w3.org/ns/dcat#keyword> ?tag }
        OPTIONAL {
          ?uriPublicService lpdcExt:publicationMedium ?publicationMedium .
          ?publicationMedium skos:prefLabel ?publicationMediumLabel .
        }
        OPTIONAL {
          ?uriPublicService lpdcExt:yourEuropeCategory ?yourEuropeCategory .
          ?yourEuropeCategory skos:prefLabel ?yourEuropeCategoryLabel .
        }
      }
      GROUP BY
        ?uriPublicService ?startDate ?endDate ?productTypeLabel
    `;

    const detailResponse = await query(detailQuery);
    const detailData = detailResponse.results.bindings.map(r => ({
      uriPublicService: r.uriPublicService.value,
      startDate: r.startDate?.value || '',
      endDate: r.endDate?.value || '',
      productTypeLabel: r.productTypeLabel?.value || '',
      targetAudiences: r.targetAudiences?.value || '',
      themes: r.themes?.value || '',
      languages: r.languages?.value || '',
      competentAuthorityLevels: r.competentAuthorityLevels?.value || '',
      competentAuthorities: r.competentAuthorities?.value || '',
      executingAuthorityLevels: r.executingAuthorityLevels?.value || '',
      executingAuthorities: r.executingAuthorities?.value || '',
      spatialScopes: r.spatialScopes?.value || '',
      tags: r.tags?.value || '',
      publicationMediums: r.publicationMediums?.value || '',
      categorieenYourEurope: r.categorieenYourEurope?.value || ''
    }));
    const groupedDetail = groupByUriPublicService(detailData, [
      'startDate',
      'endDate',
      'productTypeLabel',
      'targetAudiences',
      'themes',
      'languages',
      'competentAuthorityLevels',
      'competentAuthorities',
      'executingAuthorityLevels',
      'executingAuthorities',
      'spatialScopes',
      'tags',
      'publicationMediums',
      'categorieenYourEurope'
    ]);


    // Combineer alles per uriPublicService
    const finalData = baseData.map(base => {
      const id = base.uriPublicService;

      const merge = (grouped, keys) => {
        if (!grouped[id]) return keys.reduce((acc, k) => ({ ...acc, [k]: '' }), {});
        return keys.reduce((acc, k) => ({ ...acc, [k]: grouped[id][k] || '' }), {});
      };

      return {
        ...base,
        ...merge(groupedRequirements, ['titelVoorwaarde', 'beschrijvingVoorwaarde']),
        ...merge(groupedProcedures, [
          'titelProcedure',
          'beschrijvingProcedure',
          'titelProcedureWebsite',
          'beschrijvingProcedureWebsite',
          'urlProcedureWebsite'
        ]),
        ...merge(groupedCosts, ['titelKosten', 'beschrijvingKosten']),
        ...merge(groupedFinancialBenefits, ['titelFinancieelVoordeel', 'beschrijvingFinancieelVoordeel']),
        ...merge(groupedLegalResources, ['regelgeving', 'titelRegelgeving', 'beschrijvingRegelgeving', 'urlRegelgeving']),
        ...merge(groupedContactPoints, [
          'contactpuntEmail',
          'contactpuntTelefoon',
          'contactpuntWebsiteUrl',
          'contactpuntOpeningsuren',
          'contactpuntAdres'
        ]),
        ...merge(groupedMoreInfo, ['titelWebsite', 'beschrijvingWebsite', 'urlWebsite']),
        ...merge(groupedDetail, [
        'startDate',
        'endDate',
        'productTypeLabel',
        'targetAudiences',
        'themes',
        'languages',
        'competentAuthorityLevels',
        'competentAuthorities',
        'executingAuthorityLevels',
        'executingAuthorities',
        'spatialScopes',
        'tags',
        'publicationMediums',
        'categorieenYourEurope'
      ])

      };
    });

    // Headers van CSV zijn alle keys van één record (als ze bestaan)
    const csvHeaders = finalData.length > 0 ? Object.keys(finalData[0]) : [];

    await generateReportFromData(finalData, csvHeaders, reportData);
  }
};
