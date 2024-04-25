import {APIRequestContext, APIResponse, expect, test} from "@playwright/test";
import {loginAsPepingen, loginAsPepingenButRemoveLPDCRightsFromSession, pepingenId} from "../test-helpers/login";
import {ConceptTestBuilder} from "../test-helpers/concept.test-builder";
import {deleteAll, fetchType} from "../test-helpers/sparql";
import {PublicServiceType} from "../test-helpers/public-service.test-builder";
import {Language} from "../test-helpers/language";
import {Literal, Predicates, Uri} from "../test-helpers/triple-array";
import {RequirementTestBuilder, RequirementType} from "../test-helpers/requirement.test-builder";
import EvidenceTestBuilder, {EvidenceType} from "../test-helpers/evidence.test-builder";
import ProcedureTestBuilder, {ProcedureType} from "../test-helpers/procedure.test-builder";
import {WebsiteTestBuilder, WebsiteType} from "../test-helpers/website.test-builder";
import {CostTestBuilder, CostType} from "../test-helpers/cost.test-builder";
import {FinancialAdvantageTestBuilder, FinancialAdvantageType} from "../test-helpers/financial-advantage.test-builder";
import {
    ConceptDisplayConfigurationTestBuilder,
    ConceptDisplayConfigurationType
} from "../test-helpers/concept-display-configuration.test-builder";
import {ChosenForm, FormalInformalChoiceTestBuilder} from "../test-helpers/formal-informal-choice.test-builder";
import {dispatcherUrl} from "../test-helpers/test-options";

test.beforeEach(async ({request}) => {
    await deleteAll(request);
});

test('Create new empty instance', async ({request}) => {
    const response = await createForm(undefined, request);

    const triples = await fetchType(request, response.data.uri, PublicServiceType);
    expect(triples.findObject(Predicates.type).getValue()).toEqual(PublicServiceType);
    expect(triples.findObject(Predicates.uuid)).toBeDefined();
    expect(triples.findObject(Predicates.dateCreated)).toBeDefined();
    expect(triples.findObject(Predicates.dateModified)).toBeDefined();
    expect(triples.findTriple(Predicates.createdBy).getObjectValue()).toEqual(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`);
    expect(triples.findTriple(Predicates.hasCompetentAuthority).getObjectValue()).toEqual(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`);
    expect(triples.findTriple(Predicates.hasExecutingAuthority).getObjectValue()).toEqual(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`);
    expect(triples.findTriple(Predicates.status).getObjectValue()).toEqual('http://lblod.data.gift/concepts/instance-status/ontwerp');
    expect(triples.findTriple(Predicates.spatial).getObjectValue()).toEqual('http://data.europa.eu/nuts/code/BE24123064');
});


test('Creating a new instance without login returns http 401 Unauthorized ', async ({request}) => {
    const response = await createFormWithoutLoggingIn(undefined, request);

    expect(response.status()).toEqual(401);
});

test('Creating a new instance with a user that has no access rights on lpdc returns http 403 Forbidden ', async ({request}) => {
    const response = await createFormWithUserWithoutLPDCRights(undefined, request);

    expect(response.status()).toEqual(403);
});

test('Create instance from concept includes base fields', async ({request}) => {
    const concept = await ConceptTestBuilder.aConcept()
        .withTitle('The title', Language.NL)
        .withDescription('The description', Language.NL)
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const triples = await fetchType(request, response.data.uri, PublicServiceType);
    expect(triples.findObject(Predicates.type).getValue()).toEqual(PublicServiceType);
    expect(triples.findObject(Predicates.uuid)).not.toEqual(concept.findObject(Predicates.uuid));
    expect(triples.findObject(Predicates.title).getValue()).toEqual(concept.findObject(Predicates.title).getValue());
    expect(triples.findObject(Predicates.description).getValue()).toEqual(concept.findObject(Predicates.description).getValue());
    expect(triples.findObject(Predicates.startDate)).toEqual(concept.findObject(Predicates.startDate));
    expect(triples.findObject(Predicates.endDate)).toEqual(concept.findObject(Predicates.endDate));
    expect(triples.findObject(Predicates.dateCreated)).toBeDefined();
    expect(triples.findObject(Predicates.dateModified)).toBeDefined();
    expect(triples.findTriple(Predicates.source).getObjectValue()).toEqual(concept.findTriple(Predicates.type).getSubjectValue());
    expect(triples.findTriple(Predicates.createdBy).getObjectValue()).toEqual(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`);
    expect(triples.findTriple(Predicates.hasExecutingAuthority).getObjectValue()).toEqual(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`);
    expect(triples.findTriple(Predicates.status).getObjectValue()).toEqual('http://lblod.data.gift/concepts/instance-status/ontwerp');
    expect(triples.findObject(Predicates.hasVersionedSource)).toEqual(concept.findObject(Predicates.hasVersionedSource));
});

test('Create instance from concept: When concept has requirement than instance has it too', async ({request}) => {
    const requirement = await RequirementTestBuilder.aRequirementForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withRequirement(requirement.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const requirementUri = publicServiceTriples.findObject(Predicates.hasRequirement).getValue();
    const requirementTriples = await fetchType(request, requirementUri, RequirementType);

    expect(requirementTriples.getSubject()).not.toEqual(requirement.getSubject());
    expect(requirementTriples.findObject(Predicates.type).getValue()).toEqual(RequirementType);
    expect(requirementTriples.findObject(Predicates.uuid)).not.toEqual(requirement.findObject(Predicates.uuid));
    expect(requirementTriples.findObject(Predicates.title)).toBeDefined();
    expect(requirementTriples.findObject(Predicates.description)).toBeDefined();
});

test('Create instance from concept: When concept has requirement with evidence then instance has it too', async ({request}) => {
    const evidence = await EvidenceTestBuilder.anEvidenceForConcept()
        .buildAndPersist(request);

    const requirement = await RequirementTestBuilder.aRequirementForConcept()
        .withSupportingEvidence(evidence.getSubject())
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withRequirement(requirement.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const requirementUri = publicServiceTriples.findObject(Predicates.hasRequirement).getValue();
    const requirementTriples = await fetchType(request, requirementUri, RequirementType);
    const evidenceUri = requirementTriples.findObject(Predicates.hasSupportingEvidence).getValue();
    const evidenceTriples = await fetchType(request, evidenceUri, EvidenceType);

    expect(evidenceTriples.getSubject()).not.toEqual(evidence.getSubject());
    expect(evidenceTriples.findObject(Predicates.type).getValue()).toEqual(EvidenceType);
    expect(evidenceTriples.findObject(Predicates.uuid)).not.toEqual(evidence.findObject(Predicates.uuid));
    expect(evidenceTriples.findObject(Predicates.title)).toBeDefined();
    expect(evidenceTriples.findObject(Predicates.description)).toBeDefined();
});

test('Create instance from concept: When concept has procedure then instance has it too', async ({request}) => {
    const procedure = await ProcedureTestBuilder.aProcedureForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withProcedure(procedure.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getSubject(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const procedureUri = publicServiceTriples.findObject(Predicates.hasProcedure).getValue();
    const procedureTriples = await fetchType(request, procedureUri, ProcedureType);

    expect(procedureTriples.getSubject()).not.toEqual(procedure.getSubject());
    expect(procedureTriples.findObject(Predicates.type).getValue()).toEqual(ProcedureType);
    expect(procedureTriples.findObject(Predicates.uuid)).not.toEqual(procedure.findObject(Predicates.uuid));
    expect(procedureTriples.findObject(Predicates.title)).toBeDefined();
    expect(procedureTriples.findObject(Predicates.description)).toBeDefined();
});

test('Create instance from concept: When concept has procedure with website then instance has it too', async ({request}) => {
    const website = await WebsiteTestBuilder.aWebsiteForConcept()
        .buildAndPersist(request);

    const procedure = await ProcedureTestBuilder.aProcedureForConcept()
        .withWebsite(website.getSubject())
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withProcedure(procedure.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const procedureUri = publicServiceTriples.findObject(Predicates.hasProcedure).getValue();
    const procedureTriples = await fetchType(request, procedureUri, ProcedureType);
    const websiteUri = procedureTriples.findObject(Predicates.hasWebsite).getValue();
    const websiteTriples = await fetchType(request, websiteUri, WebsiteType);

    expect(websiteTriples.getSubject()).not.toEqual(website.getSubject());
    expect(websiteTriples.findObject(Predicates.type).getValue()).toEqual(WebsiteType);
    expect(websiteTriples.findObject(Predicates.uuid)).not.toEqual(website.findObject(Predicates.uuid));
    expect(websiteTriples.findObject(Predicates.title)).toBeDefined();
    expect(websiteTriples.findObject(Predicates.description)).toBeDefined();
    expect(websiteTriples.findObject(Predicates.url)).toEqual(website.findObject(Predicates.url));
});

test('Create instance from concept: When concept has website than instance has it too', async ({request}) => {
    const website = await WebsiteTestBuilder.aWebsiteForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withMoreInfo(website.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const websiteUri = publicServiceTriples.findObject(Predicates.hasMoreInfo).getValue();
    const websiteTriples = await fetchType(request, websiteUri, WebsiteType);

    expect(websiteTriples.getSubject()).not.toEqual(website.getSubject());
    expect(websiteTriples.findObject(Predicates.type).getValue()).toEqual(WebsiteType);
    expect(websiteTriples.findObject(Predicates.uuid)).not.toEqual(website.findObject(Predicates.uuid));
    expect(websiteTriples.findObject(Predicates.title)).toBeDefined();
    expect(websiteTriples.findObject(Predicates.description)).toBeDefined();
    expect(websiteTriples.findObject(Predicates.url)).toEqual(website.findObject(Predicates.url));
});

test('Create instance from concept: When concept has cost then instance has it too', async ({request}) => {
    const cost = await CostTestBuilder.aCostForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withCost(cost.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const costUri = publicServiceTriples.findObject(Predicates.hasCost).getValue();
    const costTriples = await fetchType(request, costUri, CostType);

    expect(costTriples.getSubject()).not.toEqual(cost.getSubject());
    expect(costTriples.findObject(Predicates.type).getValue()).toEqual(CostType);
    expect(costTriples.findObject(Predicates.uuid)).not.toEqual(cost.findObject(Predicates.uuid));
    expect(costTriples.findObject(Predicates.title)).toBeDefined();
    expect(costTriples.findObject(Predicates.description)).toBeDefined();
});

test('Create instance from concept: When concept has financialAdvantage then concept has it too', async ({request}) => {
    const financialAdvantage = await FinancialAdvantageTestBuilder.aFinancialAdvantageForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withFinancialAdvantage(financialAdvantage.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicServiceTriples = await fetchType(request, response.data.uri, PublicServiceType);
    const financialAdvantageUri = publicServiceTriples.findObject(Predicates.hasFinancialAdvantage).getValue();
    const financialAdvantageTriples = await fetchType(request, financialAdvantageUri, FinancialAdvantageType);

    expect(financialAdvantageTriples.getSubject()).not.toEqual(financialAdvantage.getSubject());
    expect(financialAdvantageTriples.findObject(Predicates.type).getValue()).toEqual(FinancialAdvantageType);
    expect(financialAdvantageTriples.findObject(Predicates.uuid)).not.toEqual(financialAdvantage.findObject(Predicates.uuid));
    expect(financialAdvantageTriples.findObjects(Predicates.title)).toBeDefined();
    expect(financialAdvantageTriples.findObjects(Predicates.description)).toBeDefined();
});

test('Create instance from concept: ConceptInstantiated flag of ConceptDisplayConfiguration should be true', async ({request}) => {
    const concept = await ConceptTestBuilder.aConcept().buildAndPersist(request);

    const conceptDisplayConfiguration = await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .withConceptInstantiated(false)
        .withConceptIsNew(true)
        .buildAndPersist(request);

    await createForm(concept.getId(), request);

    const displayConfiguration = await fetchType(request, conceptDisplayConfiguration.getSubject().getValue(), ConceptDisplayConfigurationType);
    expect(displayConfiguration.findObject(Predicates.conceptIsNew).getValue()).toEqual('false');
    expect(displayConfiguration.findObject(Predicates.conceptInstantiated).getValue()).toEqual('true');
});

test('Create instance from concept: Instance should contain only one language version', async ({request}) => {

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'title', language: Language.NL},
            {value: 'title', language: Language.GENERATED_INFORMAL},
            {value: 'title', language: Language.GENERATED_FORMAL},
        ])
        .withDescriptions([
            {value: 'description', language: Language.NL},
            {value: 'description', language: Language.GENERATED_INFORMAL},
            {value: 'description', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect(publicService.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(publicService.findAllTriples(Predicates.description)).toHaveLength(1);
});

test('Create instance from concept: When no chosenForm then instance language version should be formal', async ({request}) => {
    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'title nl', language: Language.NL},
            {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'title generated formal', language: Language.GENERATED_FORMAL},
        ])
        .withDescriptions([
            {value: 'description nl', language: Language.NL},
            {value: 'description generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'description generated formal', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect((publicService.findObject(Predicates.title) as Literal).getLanguage()).toEqual(Language.FORMAL);
    expect((publicService.findObject(Predicates.description) as Literal).getLanguage()).toEqual(Language.FORMAL);
});

test('Create instance from concept: When chosenForm is formal then instance language version should be formal', async ({request}) => {
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'title nl', language: Language.NL},
            {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'title generated formal', language: Language.GENERATED_FORMAL},
        ])
        .withDescriptions([
            {value: 'description nl', language: Language.NL},
            {value: 'description generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'description generated formal', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect((publicService.findObject(Predicates.title) as Literal).getLanguage()).toEqual(Language.FORMAL);
    expect((publicService.findObject(Predicates.description) as Literal).getLanguage()).toEqual(Language.FORMAL);
});

test('Create instance from concept: When chosenForm is informal then instance language version should be informal', async ({request}) => {
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'title nl', language: Language.NL},
            {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'title generated formal', language: Language.GENERATED_FORMAL},
        ])
        .withDescriptions([
            {value: 'description nl', language: Language.NL},
            {value: 'description generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'description generated formal', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect((publicService.findObject(Predicates.title) as Literal).getLanguage()).toEqual(Language.INFORMAL);
    expect((publicService.findObject(Predicates.description) as Literal).getLanguage()).toEqual(Language.INFORMAL);
});

test('Create instance from concept: When chosenForm is formal then language fields of instance should contain generated formal text', async ({request}) => {
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.FORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'title nl', language: Language.NL},
            {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'title generated formal', language: Language.GENERATED_FORMAL},
        ])
        .withDescriptions([
            {value: 'description nl', language: Language.NL},
            {value: 'description generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'description generated formal', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect(publicService.findObject(Predicates.title).getValue()).toEqual('title nl');
    expect(publicService.findObject(Predicates.description).getValue()).toEqual('description nl');
});

test('Create instance from concept: When chosenForm is informal then language fields of instance should contain generated informal text', async ({request}) => {
    await FormalInformalChoiceTestBuilder.aChoice()
        .withChosenForm(ChosenForm.INFORMAL)
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withTitles([
            {value: 'title nl', language: Language.NL},
            {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'title generated formal', language: Language.GENERATED_FORMAL},
        ])
        .withDescriptions([
            {value: 'description nl', language: Language.NL},
            {value: 'description generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'description generated formal', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect(publicService.findObject(Predicates.title).getValue()).toEqual('title generated informal');
    expect(publicService.findObject(Predicates.description).getValue()).toEqual('description generated informal');
});

test('Create instance from concept: When concept with requirement then instance has requirement with correct text and language version', async ({request}) => {
    const requirementConcept = await RequirementTestBuilder.aRequirementForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withRequirement(requirementConcept.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const requirementUri = publicService.findObject(Predicates.hasRequirement).getValue();
    const requirement = await fetchType(request, requirementUri, RequirementType);
    expect(requirement.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(requirement.findObject(Predicates.title)).toEqual(new Literal('requirement title nl', Language.FORMAL));
    expect(requirement.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(requirement.findObject(Predicates.description)).toEqual(new Literal('requirement description nl', Language.FORMAL));
});

test('Create instance from concept: When concept with requirement with evidence then instance has requirement with evidence with correct text and language version', async ({request}) => {
    const evidenceConcept = await EvidenceTestBuilder.anEvidenceForConcept()
        .buildAndPersist(request);

    const requirementConcept = await RequirementTestBuilder.aRequirementForConcept()
        .withSupportingEvidence(evidenceConcept.getSubject())
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withRequirement(requirementConcept.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const requirementUri = publicService.findObject(Predicates.hasRequirement).getValue();
    const requirement = await fetchType(request, requirementUri, RequirementType);
    const evidenceUri = requirement.findObject(Predicates.hasSupportingEvidence).getValue();
    const evidence = await fetchType(request, evidenceUri, EvidenceType);
    expect(evidence.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(evidence.findObject(Predicates.title)).toEqual(new Literal('evidence title nl', Language.FORMAL));
    expect(evidence.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(evidence.findObject(Predicates.description)).toEqual(new Literal('evidence description nl', Language.FORMAL));
});

test('Create instance from concept: When concept with procedure then instance has procedure with correct text and language version', async ({request}) => {
    const procedureConcept = await ProcedureTestBuilder.aProcedureForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withProcedure(procedureConcept.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const procedureUri = publicService.findObject(Predicates.hasProcedure).getValue();
    const procedure = await fetchType(request, procedureUri, ProcedureType);
    expect(procedure.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(procedure.findObject(Predicates.title)).toEqual(new Literal('procedure title nl', Language.FORMAL));
    expect(procedure.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(procedure.findObject(Predicates.description)).toEqual(new Literal('procedure description nl', Language.FORMAL));
});

test('Create instance from concept: When concept with procedure with website then instance has procedure with website with correct text and language version', async ({request}) => {
    const websiteConcept = await WebsiteTestBuilder.aWebsiteForConcept()
        .buildAndPersist(request);

    const procedureConcept = await ProcedureTestBuilder.aProcedureForConcept()
        .withWebsite(websiteConcept.getSubject())
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withProcedure(procedureConcept.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const procedureUri = publicService.findObject(Predicates.hasProcedure).getValue();
    const procedure = await fetchType(request, procedureUri, ProcedureType);
    const websiteUri = procedure.findObject(Predicates.hasWebsite).getValue();
    const website = await fetchType(request, websiteUri, WebsiteType);
    expect(website.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(website.findObject(Predicates.title)).toEqual(new Literal('website title nl', Language.FORMAL));
    expect(website.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(website.findObject(Predicates.description)).toEqual(new Literal('website description nl', Language.FORMAL));
});

test('Create instance from concept: When concept with website then instance has website with correct text and language version', async ({request}) => {
    const moreInfoWebsite = await WebsiteTestBuilder.aWebsiteForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withMoreInfo(moreInfoWebsite.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const moreInfoUri = publicService.findObject(Predicates.hasMoreInfo).getValue();
    const moreInfo = await fetchType(request, moreInfoUri, WebsiteType);
    expect(moreInfo.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(moreInfo.findObject(Predicates.title)).toEqual(new Literal('website title nl', Language.FORMAL));
    expect(moreInfo.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(moreInfo.findObject(Predicates.description)).toEqual(new Literal('website description nl', Language.FORMAL));
});

test('Create instance from concept: When concept with cost then instance has cost with correct text and language version', async ({request}) => {
    const costConcept = await CostTestBuilder.aCostForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withCost(costConcept.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const costUri = publicService.findObject(Predicates.hasCost).getValue();
    const cost = await fetchType(request, costUri, CostType);
    expect(cost.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(cost.findObject(Predicates.title)).toEqual(new Literal('cost title nl', Language.FORMAL));
    expect(cost.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(cost.findObject(Predicates.description)).toEqual(new Literal('cost description nl', Language.FORMAL));
});

test('Create instance from concept: When concept with financial advantage then instance has financial advantage with correct text and language version', async ({request}) => {
    const financialAdvantageConcept = await FinancialAdvantageTestBuilder.aFinancialAdvantageForConcept()
        .buildAndPersist(request);

    const concept = await ConceptTestBuilder.aConcept()
        .withFinancialAdvantage(financialAdvantageConcept.getSubject())
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);
    const publicService = await fetchType(request, response.data.uri, PublicServiceType);

    const financialAdvantageUri = publicService.findObject(Predicates.hasFinancialAdvantage).getValue();
    const financialAdvantage = await fetchType(request, financialAdvantageUri, FinancialAdvantageType);
    expect(financialAdvantage.findAllTriples(Predicates.title)).toHaveLength(1);
    expect(financialAdvantage.findObject(Predicates.title)).toEqual(new Literal('financial advantage title nl', Language.FORMAL));
    expect(financialAdvantage.findAllTriples(Predicates.description)).toHaveLength(1);
    expect(financialAdvantage.findObject(Predicates.description)).toEqual(new Literal('financial advantage description nl', Language.FORMAL));
});

test('Create instance from concept: all instance fields with language should have correct text and languageVersion', async ({request}) => {
    const concept = await ConceptTestBuilder.aConcept()
        .withAdditionalDescriptions([
            {value: 'additional description nl', language: Language.NL},
            {value: 'additional description generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'additional description generated formal', language: Language.GENERATED_FORMAL}
        ])
        .withException([
            {value: 'exception nl', language: Language.NL},
            {value: 'exception generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'exception generated formal', language: Language.GENERATED_FORMAL}
        ])
        .withRegulations([
            {value: 'regulation nl', language: Language.NL},
            {value: 'regulation generated informal', language: Language.GENERATED_INFORMAL},
            {value: 'regulation generated formal', language: Language.GENERATED_FORMAL}
        ])
        .buildAndPersist(request);

    await ConceptDisplayConfigurationTestBuilder.aConceptDisplayConfiguration()
        .withConcept(concept.getId())
        .buildAndPersist(request);

    const response = await createForm(concept.getId(), request);

    const publicService = await fetchType(request, response.data.uri, PublicServiceType);
    expect(publicService.findAllTriples(Predicates.additionalDescription)).toHaveLength(1);
    expect(publicService.findObject(Predicates.additionalDescription)).toEqual(new Literal('additional description nl', Language.FORMAL));
    expect(publicService.findAllTriples(Predicates.exception)).toHaveLength(1);
    expect(publicService.findObject(Predicates.exception)).toEqual(new Literal('exception nl', Language.FORMAL));
    expect(publicService.findAllTriples(Predicates.regulation)).toHaveLength(1);
    expect(publicService.findObject(Predicates.regulation)).toEqual(new Literal('regulation nl', Language.FORMAL));
});

test('Create instance from un-existing concept, returns notFoundError', async ({request}) => {
    const loginResponse = await loginAsPepingen(request);
    const headers = {cookie: loginResponse.cookie};
    const response = await request.post(`${dispatcherUrl}/public-services`, {
        data: {conceptId: "http://unexisting_concept.be"},
        headers: headers,
    });
    expect(response.ok(), await response.text()).toBeFalsy();
    expect(response.status()).toEqual(404);
    expect(await response.json()).toEqual(expect.objectContaining({
        message: "Kan <http://unexisting_concept.be> niet vinden voor type <https://productencatalogus.data.vlaanderen.be/ns/ipdc-lpdc#ConceptualPublicService> in graph <http://mu.semte.ch/graphs/public>",
        correlationId: expect.anything()
    }))

})

async function createForm(conceptUri: Uri | undefined, request: APIRequestContext) {
    const loginResponse = await loginAsPepingen(request);
    const headers = {cookie: loginResponse.cookie};
    const response = await request.post(`${dispatcherUrl}/public-services`, {
        data: conceptUri ? {conceptId: conceptUri.getValue()} : {},
        headers: headers,
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    return response.json();
}

async function createFormWithoutLoggingIn(conceptUri: Uri | undefined, request: APIRequestContext): Promise<APIResponse> {
    return await request.post(`${dispatcherUrl}/public-services`, {
        data: conceptUri ? {conceptId: conceptUri.getValue()} : {},
        headers: {cookie: undefined},
    });
}

async function createFormWithUserWithoutLPDCRights(conceptUri: Uri | undefined, request: APIRequestContext): Promise<APIResponse> {
    const loginResponse = await loginAsPepingenButRemoveLPDCRightsFromSession(request);
    const headers = {cookie: loginResponse.cookie};
    return await request.post(`${dispatcherUrl}/public-services`, {
        data: conceptUri ? {conceptId: conceptUri.getValue()} : {},
        headers: headers,
    });
}
