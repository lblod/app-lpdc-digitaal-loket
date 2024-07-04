import { expect } from '@playwright/test';
import { IpdcStub } from '../components/ipdc-stub';

export type Presence = 'PRESENT';

export interface Field {
    nl?: string;
    notRich?: boolean;
};

export interface OrderedFieldGroup {
    order?: number,
}

export interface NestedFieldGroup extends OrderedFieldGroup {
    titel?: Field,
    beschrijving?: Field,
    url?: string,
    nestedGroup?: NestedFieldGroup[],
}

export interface ContactPointFields extends OrderedFieldGroup {
    email?: string,
    telephone?: string,
    url?: string,
    openingHours?: string,
    address?: AddressFields,
}

export interface AddressFields {
    land?: string,
    gemeentenaam?: string,
    postcode?: string,
    straatnaam?: string,
    huisnummer?: string,
    busnummer?: string,
}

export interface PublishedInstanceFields {
    titel?: Field,
    beschrijving?: Field,
    aanvullendeBeschrijving?: Field,
    uitzonderingen?: Field,
    voorwaarden?: NestedFieldGroup[],
    procedures?: NestedFieldGroup[],
    kosten?: NestedFieldGroup[],
    financieleVoordelen?: NestedFieldGroup[],
    regelgevingTekst?: Field,
    regelgeving?: NestedFieldGroup[],
    contactPunten?: ContactPointFields[],
    meerInfos?: NestedFieldGroup[],
    uuid?: string | Presence,
    createdBy?: string,
    productId?: string,
    conceptSource?: string,
    //TODO LPDC-709 This should not be send to IPDC
    conceptStatus?: string;
    type?: string,
    aangemaaktOp?: string | Presence,
    bewerktOp?: string | Presence,
    geldigVanaf?: string,
    geldigTot?: string,
    doelgroepen?: string[],
    themas?: string[],
    talen?: string[],
    bevoegdeBestuursniveaus?: string[],
    bevoegdeOverheden?: string[],
    uitvoerendeBestuursniveaus?: string[],
    uitvoerendeOverheden?: string[],
    geografischeToepassingsgebieden?: string[],
    zoektermen?: string[],
    publicatieKanalen?: string[],
    yourEuropeCategorieen?: string[],
}

export function verifyInstancePublishedOnIPDC(instance: any[], instanceFields: PublishedInstanceFields, gekozenUOfJeVorm: string) {

    // PUBLIC SERVICE
    const publicService = IpdcStub.getObjectByType(instance, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#InstancePublicService');

    validateData(publicService, 'http://purl.org/dc/terms/title', arrayContainingText(instanceFields.titel, gekozenUOfJeVorm));
    validateData(publicService, 'http://purl.org/dc/terms/description', arrayContainingText(instanceFields.beschrijving, gekozenUOfJeVorm, true));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription', arrayContainingText(instanceFields.aanvullendeBeschrijving, gekozenUOfJeVorm, true));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception', arrayContainingText(instanceFields.uitzonderingen, gekozenUOfJeVorm, true));
    validateNestedFieldGroup(publicService, instance, 'http://vocab.belgif.be/ns/publicservice#hasRequirement', 'http://data.europa.eu/m8g/Requirement', instanceFields.voorwaarden, gekozenUOfJeVorm, 'http://data.europa.eu/m8g/hasSupportingEvidence', 'http://data.europa.eu/m8g/Evidence');
    validateNestedFieldGroup(publicService, instance, 'http://purl.org/vocab/cpsv#follows', 'http://purl.org/vocab/cpsv#Rule', instanceFields.procedures, gekozenUOfJeVorm, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsite', 'http://schema.org/WebSite');
    validateNestedFieldGroup(publicService, instance, 'http://data.europa.eu/m8g/hasCost', 'http://data.europa.eu/m8g/Cost', instanceFields.kosten, gekozenUOfJeVorm);
    validateNestedFieldGroup(publicService, instance, 'http://purl.org/vocab/cpsv#produces', 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage', instanceFields.financieleVoordelen, gekozenUOfJeVorm);
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation', arrayContainingText(instanceFields.regelgevingTekst, gekozenUOfJeVorm, true));
    validateNestedFieldGroup(publicService, instance, 'http://data.europa.eu/m8g/hasLegalResource', 'http://data.europa.eu/eli/ontology#LegalResource', instanceFields.regelgeving, gekozenUOfJeVorm);
    validateNestedFieldGroup(publicService, instance, 'http://www.w3.org/2000/01/rdf-schema#seeAlso', 'http://schema.org/WebSite', instanceFields.meerInfos, gekozenUOfJeVorm);
    validateContactPointFields(publicService, instance, instanceFields.contactPunten);
    validatePresentOrData(publicService, 'http://mu.semte.ch/vocabularies/core/uuid', instanceFields.uuid)
    validateData(publicService, 'http://purl.org/pav/createdBy', arrayContainingStringIds(instanceFields.createdBy));
    //TODO LPDC-709 product id should not be send to IPDC
    validateData(publicService, 'http://schema.org/productID', arrayContainingString(instanceFields.productId));
    validateData(publicService, 'http://purl.org/dc/terms/source', arrayContainingStringIds(instanceFields.conceptSource));
    validateData(publicService, 'http://www.w3.org/ns/adms#status', arrayContainingStringIds(instanceFields.conceptStatus));
    validateData(publicService, 'http://purl.org/dc/terms/type', arrayContainingStringIds(instanceFields.type));
    validatePresentOrData(publicService, 'http://schema.org/dateCreated', instanceFields.aangemaaktOp, 'dateTime');
    validatePresentOrData(publicService, 'http://schema.org/dateModified', instanceFields.bewerktOp, 'dateTime');
    validateData(publicService, 'http://schema.org/startDate', arrayContainingString(instanceFields.geldigVanaf, 'dateTime'));
    validateData(publicService, 'http://schema.org/endDate', arrayContainingString(instanceFields.geldigTot, 'dateTime'));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#targetAudience', arrayContainingStringIds(instanceFields.doelgroepen));
    validateData(publicService, 'http://data.europa.eu/m8g/thematicArea', arrayContainingStringIds(instanceFields.themas));
    validateData(publicService, 'http://purl.org/dc/terms/language', arrayContainingStringIds(instanceFields.talen));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#competentAuthorityLevel', arrayContainingStringIds(instanceFields.bevoegdeBestuursniveaus));
    validateData(publicService, 'http://data.europa.eu/m8g/hasCompetentAuthority', arrayContainingStringIds(instanceFields.bevoegdeOverheden));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#executingAuthorityLevel', arrayContainingStringIds(instanceFields.uitvoerendeBestuursniveaus));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasExecutingAuthority', arrayContainingStringIds(instanceFields.uitvoerendeOverheden));
    validateData(publicService, 'http://purl.org/dc/terms/spatial', arrayContainingStringIds(instanceFields.geografischeToepassingsgebieden));
    validateData(publicService, 'http://www.w3.org/ns/dcat#keyword', arrayContainingLanguageString(instanceFields.zoektermen, 'nl'));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#publicationMedium', arrayContainingStringIds(instanceFields.publicatieKanalen));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#yourEuropeCategory', arrayContainingStringIds(instanceFields.yourEuropeCategorieen));
};

function validateNestedFieldGroup(publicService: any, instance: any, predikaat: string, nestedType: string, fieldGroup: NestedFieldGroup[] | undefined, gekozenUOfJeVorm: string, nestedPredikaat?: string, nestedNestedType?: string) {
    if (fieldGroup === undefined) {
        return;
    }

    const actualDatas: any[] = extractActualDatas(publicService, instance, predikaat, fieldGroup);

    fieldGroup.forEach((field, index) => {
        const actualData = extractActualData(actualDatas, field.order ?? 0);
        const msg = JSON.stringify({ field: field, index: index, actualDatas: actualDatas, actualData: actualData, predikaat: predikaat });
        expect(actualData, msg).toBeDefined();
        expect(actualData['@type'], msg).toEqual(expect.arrayContaining([nestedType]));
        validateData(actualData, 'http://purl.org/dc/terms/title', arrayContainingText(field.titel, gekozenUOfJeVorm));
        validateData(actualData, 'http://purl.org/dc/terms/description', arrayContainingText(field.beschrijving, gekozenUOfJeVorm, true));
        validateData(actualData, 'http://www.w3.org/ns/shacl#order', arrayContainingString(field.order?.toString(), 'integer'));
        validateData(actualData, 'http://schema.org/url', arrayContainingString(field.url));

        if (nestedPredikaat !== undefined
            && nestedNestedType !== undefined) {
            validateNestedFieldGroup(actualData, instance, nestedPredikaat, nestedNestedType, field.nestedGroup, gekozenUOfJeVorm);
        }
    });
}

function validateContactPointFields(publicService: any, instance: any, contactPointFieldsGroup: ContactPointFields[] | undefined) {
    if (contactPointFieldsGroup === undefined) {
        return;
    }

    const actualDatas: any[] = extractActualDatas(publicService, instance, 'http://data.europa.eu/m8g/hasContactPoint', contactPointFieldsGroup);
    contactPointFieldsGroup.forEach((field, index) => {
        const actualData = extractActualData(actualDatas, field.order ?? 0);
        const msg = JSON.stringify({ actualData: actualData });
        expect(actualData, msg).toBeDefined();
        expect(actualData['@type'], msg).toEqual(expect.arrayContaining(['http://schema.org/ContactPoint']));
        validateData(actualData, 'http://schema.org/email', arrayContainingString(field.email));
        validateData(actualData, 'http://schema.org/telephone', arrayContainingString(field.telephone));
        validateData(actualData, 'http://schema.org/url', arrayContainingString(field.url));
        validateData(actualData, 'http://schema.org/openingHours', arrayContainingString(field.openingHours));
        validateData(actualData, 'http://www.w3.org/ns/shacl#order', arrayContainingString(field.order?.toString(), 'integer'));

        validateAddress(actualData, instance, field.address);
    });
}

function validateAddress(publicService: any, instance: any, field: AddressFields | undefined) {
    if (field === undefined) {
        return;
    }

    const actualDatas: any[] = extractActualDatas(publicService, instance, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#address', [field]);
    const actualData = extractActualData(actualDatas, 0);
    const msg = JSON.stringify({ actualData: actualData });
    expect(actualData, msg).toBeDefined();
    expect(actualData['@type'], msg).toEqual(expect.arrayContaining(['http://www.w3.org/ns/locn#Address']));
    validateData(actualData, 'https://data.vlaanderen.be/ns/adres#land', arrayContainingLanguageString(field.land, 'nl'));
    validateData(actualData, 'https://data.vlaanderen.be/ns/adres#gemeentenaam', arrayContainingLanguageString(field.gemeentenaam, 'nl'));
    validateData(actualData, 'https://data.vlaanderen.be/ns/adres#postcode', arrayContainingString(field.postcode));
    validateData(actualData, 'https://data.vlaanderen.be/ns/adres#Straatnaam', arrayContainingLanguageString(field.straatnaam, 'nl'));
    validateData(actualData, 'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.huisnummer', arrayContainingString(field.huisnummer));
    validateData(actualData, 'https://data.vlaanderen.be/ns/adres#Adresvoorstelling.busnummer', arrayContainingString(field.busnummer));
}

function validatePresentOrData(data: any, predicate: string, presentOrString: Presence | string | undefined, type?: string, times: number = 1) {
    if ('PRESENT' === presentOrString) {
        validatePredicatePresent(data, predicate, true, times);
    } else {
        validateData(data, predicate, arrayContainingString(presentOrString, type));
    }
}

function validateData(data: any, predikaat: string, arrayContainingContent: any | undefined) {
    if (arrayContainingContent) {
        const msg = JSON.stringify({ data: data, predikaat: predikaat });
        expect(data[predikaat], msg).toBeDefined();
        expect(data[predikaat], msg).toHaveLength(arrayContainingContent.length);
        expect(data[predikaat], msg).toEqual(expect.arrayContaining(arrayContainingContent));
    }
}

function validatePredicatePresent(publicService: any, predicate: string, present: boolean = true, times: number = 1) {
    if (present) {
        expect(publicService[predicate]).toHaveLength(times);
    }
}

function arrayContainingText(field: Field | undefined, gekozenUOfJeVorm: string, contentEmbedded: boolean = false) {
    if (field === undefined ||
        (field?.nl === undefined && field?.nl === undefined)) {
        return undefined;
    }

    const embedPrefix = (contentEmbedded && !field.notRich) ? '<p data-indentation-level="0">' : '';
    const embedSuffix = (contentEmbedded && !field.notRich) ? '</p>' : '';

    return [{ "@language": gekozenUOfJeVorm, "@value": `${embedPrefix}${field.nl}${embedSuffix}` }];
}

function arrayContainingString(aString: string | undefined, type?: string) {
    if (aString === undefined) {
        return undefined;
    }
    if (type === undefined) {
        return [{ "@value": aString }];
    }

    return [{ "@value": aString, "@type": `http://www.w3.org/2001/XMLSchema#${type}` }];
}

function arrayContainingLanguageString(strings: string[] | string | undefined, language: string) {
    if (typeof (strings) === 'string') {
        strings = [strings];
    }

    return strings?.map(str => { return { "@language": language, "@value": str } });
}

function arrayContainingStringIds(strings: string[] | string | undefined) {
    if (typeof (strings) === 'string') {
        strings = [strings];
    }
    return strings?.map(str => { return { "@id": str }; });
}

function extractActualDatas(publicService: any, instance: any, predikaat: string, fieldGroup: any[]) {
    const msg = JSON.stringify({ publicService: publicService, predikaat: predikaat, fieldGroup: fieldGroup });
    expect(publicService[predikaat], msg).toHaveLength(fieldGroup.length);

    const actualDatas: any[] = [];

    for (let index = 0; index < fieldGroup.length; index++) {
        const fieldUri = publicService[predikaat][index]['@id'];
        actualDatas.push(IpdcStub.getObjectById(instance, fieldUri));
    }

    expect(actualDatas.length).toBeGreaterThanOrEqual(fieldGroup.length);

    return actualDatas;
}

function extractActualData(actualDatas: any[], index: number) {
    let actualData = undefined;
    if (actualDatas.length > 1) {
        actualData = actualDatas.find(c => c['http://www.w3.org/ns/shacl#order'][0]['@value'] === index.toString());
    } else {
        actualData = actualDatas[0];
    }
    return actualData;
};
