import { expect } from '@playwright/test';
import { IpdcStub } from '../components/ipdc-stub';

export interface Field {
    nl?: string;
    en?: string;
};

export interface NestedFieldGroup {
    titel?: Field,
    beschrijving?: Field,
    url?: string,
    order?: number,
    nestedGroup?: NestedFieldGroup[],
}

export interface PublishedInstanceFields {
    titel?: Field,
    beschrijving?: Field,
    aanvullendeBeschrijving?: Field,
    uitzonderingen?: Field,
    procedures?: NestedFieldGroup[],
    kosten?: NestedFieldGroup[],
    financieleVoordelen?: NestedFieldGroup[],
}

export function verifyInstancePublishedOnIPDC(instance: any[], instanceFields: PublishedInstanceFields, gekozenUOfJeVorm: string) {

    // PUBLIC SERVICE
    const publicService = IpdcStub.getObjectByType(instance, 'http://purl.org/vocab/cpsv#PublicService');

    validateData(publicService, 'http://purl.org/dc/terms/title', arrayContainingText(instanceFields.titel, gekozenUOfJeVorm));
    validateData(publicService, 'http://purl.org/dc/terms/description', arrayContainingText(instanceFields.beschrijving, gekozenUOfJeVorm, true));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#additionalDescription', arrayContainingText(instanceFields.aanvullendeBeschrijving, gekozenUOfJeVorm, true));
    validateData(publicService, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#exception', arrayContainingText(instanceFields.uitzonderingen, gekozenUOfJeVorm, true));
    validateNestedFieldGroup(publicService, instance, 'http://purl.org/vocab/cpsv#follows', 'http://purl.org/vocab/cpsv#Rule', instanceFields.procedures, gekozenUOfJeVorm, 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#hasWebsites', 'http://schema.org/WebSite');
    validateNestedFieldGroup(publicService, instance, 'http://data.europa.eu/m8g/hasCost', 'http://data.europa.eu/m8g/Cost', instanceFields.kosten, gekozenUOfJeVorm);
    validateNestedFieldGroup(publicService, instance, 'http://purl.org/vocab/cpsv#produces', 'https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#FinancialAdvantage', instanceFields.financieleVoordelen, gekozenUOfJeVorm);
};

function validateNestedFieldGroup(publicService: any, instance: any, predikaat: string, nestedType: string, fieldGroup: NestedFieldGroup[] | undefined, gekozenUOfJeVorm: string, nestedPredikaat?: string, nestedNestedType?: string) {
    if (fieldGroup === undefined) {
        return;
    }

    expect(publicService[predikaat]).toHaveLength(fieldGroup.length);

    const actualDatas: any[] = [];

    for (let index = 0; index < fieldGroup.length; index++) {
        const field = fieldGroup[index];

        const fieldUri = publicService[predikaat][index]['@id'];
        actualDatas.push(IpdcStub.getObjectById(instance, fieldUri));
    }

    for (let index = 0; index < fieldGroup.length; index++) {
        const field = fieldGroup[index];

        const actualData = actualDatas.find(c => c['http://www.w3.org/ns/shacl#order'][0]['@value'] === index.toString());
        expect(actualData).toBeDefined();
        expect(actualData['@type'], expect.arrayContaining[nestedType]);
        validateData(actualData, 'http://purl.org/dc/terms/title', arrayContainingText(field.titel, gekozenUOfJeVorm));
        validateData(actualData, 'http://purl.org/dc/terms/description', arrayContainingText(field.beschrijving, gekozenUOfJeVorm, true));
        validateData(actualData, 'http://www.w3.org/ns/shacl#order', arrayContainingNumber(field.order));
        validateData(actualData, 'http://schema.org/url', arrayContainingString(field.url));

        if (nestedPredikaat !== undefined
            && nestedNestedType !== undefined) {
            validateNestedFieldGroup(actualData, instance, nestedPredikaat, nestedNestedType, field.nestedGroup, gekozenUOfJeVorm);
        }
    }
}

function validateData(data: any, predikaat: string, arrayContainingContent: any | undefined) {
    if (arrayContainingContent) {
        expect(data[predikaat]).toHaveLength(arrayContainingContent.length);
        expect(data[predikaat]).toEqual(expect.arrayContaining(arrayContainingContent));
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
