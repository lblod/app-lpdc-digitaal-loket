import { expect } from '@playwright/test';
import { IpdcStub } from '../components/ipdc-stub';

export interface Field {
    nl?: string;
    en?: string;
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
    regelgeving?: Field,
    juridischeInfoUrls?: string[],
    contactPunten?: ContactPointFields[],
    meerInfos?: NestedFieldGroup[],
}

export function verifyInstancePublishedOnIPDC(instance: any[], instanceFields: PublishedInstanceFields, gekozenUOfJeVorm: string) {

    // PUBLIC SERVICE
    const publicService = IpdcStub.getObjectByType(instance, 'http://purl.org/vocab/cpsv#PublicService');

    validateData(publicService, 'http://purl.org/dc/terms/title', arrayContainingText(instanceFields.titel, gekozenUOfJeVorm));
    validateData(publicService, 'http://purl.org/dc/terms/description', arrayContainingText(instanceFields.beschrijving, gekozenUOfJeVorm, true));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription', arrayContainingText(instanceFields.aanvullendeBeschrijving, gekozenUOfJeVorm, true));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception', arrayContainingText(instanceFields.uitzonderingen, gekozenUOfJeVorm, true));
    validateNestedFieldGroup(publicService, instance, 'http://vocab.belgif.be/ns/publicservice#hasRequirement', 'http://data.europa.eu/m8g/Requirement', instanceFields.voorwaarden, gekozenUOfJeVorm, 'http://data.europa.eu/m8g/hasSupportingEvidence', 'http://data.europa.eu/m8g/Evidence');
    validateNestedFieldGroup(publicService, instance, 'http://purl.org/vocab/cpsv#follows', 'http://purl.org/vocab/cpsv#Rule', instanceFields.procedures, gekozenUOfJeVorm, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites', 'http://schema.org/WebSite');
    validateNestedFieldGroup(publicService, instance, 'http://data.europa.eu/m8g/hasCost', 'http://data.europa.eu/m8g/Cost', instanceFields.kosten, gekozenUOfJeVorm);
    validateNestedFieldGroup(publicService, instance, 'http://purl.org/vocab/cpsv#produces', 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage', instanceFields.financieleVoordelen, gekozenUOfJeVorm);
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#regulation', arrayContainingText(instanceFields.regelgeving, gekozenUOfJeVorm, true));
    validateData(publicService, 'http://data.europa.eu/m8g/hasLegalResource', arrayContainingStringIds(instanceFields.juridischeInfoUrls));
    validateNestedFieldGroup(publicService, instance, 'http://www.w3.org/2000/01/rdf-schema#seeAlso', 'http://schema.org/WebSite', instanceFields.meerInfos, gekozenUOfJeVorm);
    validateContactPointFields(publicService, instance, instanceFields.contactPunten);
};

function validateNestedFieldGroup(publicService: any, instance: any, predikaat: string, nestedType: string, fieldGroup: NestedFieldGroup[] | undefined, gekozenUOfJeVorm: string, nestedPredikaat?: string, nestedNestedType?: string) {
    if (fieldGroup === undefined) {
        return;
    }

    const actualDatas: any[] = extractActualDatas(publicService, instance, predikaat, fieldGroup);

    fieldGroup.forEach((field, index) => {
        const actualData = extractActualData(actualDatas, index);
        const msg = JSON.stringify({ field: field, index: index, actualData: actualData, predikaat: predikaat });
        expect(actualData, msg).toBeDefined();
        expect(actualData['@type'], msg).toEqual(expect.arrayContaining([nestedType]));
        validateData(actualData, 'http://purl.org/dc/terms/title', arrayContainingText(field.titel, gekozenUOfJeVorm));
        validateData(actualData, 'http://purl.org/dc/terms/description', arrayContainingText(field.beschrijving, gekozenUOfJeVorm, true));
        validateData(actualData, 'http://www.w3.org/ns/shacl#order', arrayContainingNumber(field.order));
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
        const actualData = extractActualData(actualDatas, index);
        const msg = JSON.stringify({ actualData: actualData });
        expect(actualData, msg).toBeDefined();
        expect(actualData['@type'], msg).toEqual(expect.arrayContaining(['http://schema.org/ContactPoint']));
        validateData(actualData, 'http://schema.org/email', arrayContainingString(field.email));
        validateData(actualData, 'http://schema.org/telephone', arrayContainingString(field.telephone));
        validateData(actualData, 'http://schema.org/url', arrayContainingString(field.url));
        validateData(actualData, 'http://schema.org/openingHours', arrayContainingString(field.openingHours));
        validateData(actualData, 'http://www.w3.org/ns/shacl#order', arrayContainingNumber(field.order));

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

function validateData(data: any, predikaat: string, arrayContainingContent: any | undefined) {
    if (arrayContainingContent) {
        const msg = JSON.stringify({ data: data, predikaat: predikaat });
        expect(data[predikaat], msg).toBeDefined();
        expect(data[predikaat], msg).toHaveLength(arrayContainingContent.length);
        expect(data[predikaat], msg).toEqual(expect.arrayContaining(arrayContainingContent));
    }
}

function arrayContainingText(field: Field | undefined, gekozenUOfJeVorm: string, contentEmbedded: boolean = false) {
    if (field === undefined ||
        (field?.nl === undefined && field?.nl === undefined)) {
        return undefined;
    }
    const embedPrefix = contentEmbedded ? '<p data-indentation-level="0">' : '';
    const embedSuffix = contentEmbedded ? '</p>' : '';

    if (field.en !== undefined) {
        return [{ "@language": gekozenUOfJeVorm, "@value": `${embedPrefix}${field.nl}${embedSuffix}` }, { "@language": "en", "@value": `${embedPrefix}${field.en}${embedSuffix}` }];
    } else {
        return [{ "@language": gekozenUOfJeVorm, "@value": `${embedPrefix}${field.nl}${embedSuffix}` }];
    }
}

function arrayContainingNumber(aNumber: number | undefined) {
    if (aNumber === undefined) {
        return undefined;
    }

    return [{ "@value": `${aNumber.toString()}`, "@type": "http://www.w3.org/2001/XMLSchema#integer" }];
}

function arrayContainingString(aString: string | undefined) {
    if (aString === undefined) {
        return undefined;
    }

    return [{ "@value": aString }];
}

function arrayContainingLanguageString(aString: string | undefined, language: string) {
    if (aString === undefined) {
        return undefined;
    }

    return [{ "@language": language, "@value": aString }];
}

function arrayContainingStringIds(strings: string[] | undefined) {
    return strings?.map(str => { return {"@id": str};});
}

function extractActualDatas(publicService: any, instance: any, predikaat: string, fieldGroup: any[]) {
    expect(publicService[predikaat]).toHaveLength(fieldGroup.length);

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
