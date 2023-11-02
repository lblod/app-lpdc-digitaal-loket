import {APIRequestContext, expect, test} from "@playwright/test";
import {dispatcherUrl} from "../test-helpers/test-options";
import {
    ConceptCost,
    ConceptEvidence,
    ConceptFinancialAdvantage,
    ConceptProcedure,
    ConceptRequirement,
    ConceptSnapshotTestBuilder,
    ConceptWebsite
} from "../test-helpers/concept-snapshot.test-builder";
import {Language} from "../test-helpers/language";
import {
    CompetentAuthorityLevel,
    ConceptTag,
    ExecutingAuthorityLevel,
    ProductType,
    PublicationMedium,
    TargetAudience,
    Theme,
    YourEuropeCategory
} from "../test-helpers/codelists";
import {TripleArray, Uri} from "../test-helpers/triple-array";
import {bilzenId, pepingenId} from "../test-helpers/login";

test.describe('Compare snapshots', () => {

    test('When no content change then isChanged should be false', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
    });

    for (const language of [Language.NL, Language.EN]) {
        test(`When title ${language} changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withTitles([{value: 'title', language: language}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withTitles([{value: 'title CHANGED', language: language}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    }

    for (const language of [Language.GENERATED_INFORMAL, Language.GENERATED_FORMAL, Language.FORMAL, Language.INFORMAL]) {
        test(`When title ${language} changed then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withTitles([{value: 'title', language: language}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withTitles([{value: 'title CHANGED', language: language}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });
    }

    test('When title formal added then isChanged should be false', async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([
                {value: 'title nl', language: Language.NL},
                {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'title generated formal', language: Language.GENERATED_FORMAL},
                {value: 'title en', language: Language.EN},
            ])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTitles([
                {value: 'title nl', language: Language.NL},
                {value: 'title formal', language: Language.FORMAL},
                {value: 'title generated informal', language: Language.GENERATED_INFORMAL},
                {value: 'title generated formal', language: Language.GENERATED_FORMAL},
                {value: 'title en', language: Language.EN},
            ])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
    });

    for (const language of [Language.NL, Language.EN]) {
        test(`When description ${language} changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withDescriptions([{value: 'description', language: language}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withDescriptions([{value: 'description changed', language: language}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    }

    for (const language of [Language.NL, Language.EN]) {
        test(`When additional description ${language} changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withAdditionalDescriptions([{value: 'additional description', language: language}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withAdditionalDescriptions([{value: 'additional description changed', language: language}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    }

    for (const language of [Language.NL, Language.EN]) {
        test(`When exceptions ${language} changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withExceptions([{value: 'additional description', language: language}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withExceptions([{value: 'additional description changed', language: language}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    }

    for (const language of [Language.NL, Language.EN]) {
        test(`When regulations ${language} changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRegulations([{value: 'regulations', language: language}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRegulations([{value: 'regulations changed', language: language}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    }

    test(`When startDate changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withStartDate(new Date('10-10-2023'))
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withStartDate(new Date('11-11-2023'))
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When endDate changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withEndDate(new Date('10-10-2023'))
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withEndDate(new Date('11-11-2023'))
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When productType changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withProductType(ProductType.Bewijs)
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withProductType(ProductType.AdviesBegeleiding)
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When targetAudience changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTargetAudiences([TargetAudience.Burger])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTargetAudiences([TargetAudience.Onderneming])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When targetAudience is added then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTargetAudiences([TargetAudience.Burger])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTargetAudiences([TargetAudience.Burger, TargetAudience.Onderneming])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When targetAudience is removed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTargetAudiences([TargetAudience.Burger, TargetAudience.Onderneming])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withTargetAudiences([TargetAudience.Burger])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When themes changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withThemes([Theme.BouwenWonen])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withThemes([Theme.BurgerOverheid])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When competentAuthorityLevel changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withCompetentAuthorityLevels([CompetentAuthorityLevel.Federaal])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withCompetentAuthorityLevels([CompetentAuthorityLevel.Europees])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When competentAuthority changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withCompetentAuthorities([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withCompetentAuthorities([new Uri(`http://data.lblod.info/id/bestuurseenheden/${bilzenId}`)])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When executingAuthorityLevel changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withExecutingAuthorityLevels([ExecutingAuthorityLevel.Europees])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withExecutingAuthorityLevels([ExecutingAuthorityLevel.Lokaal])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When executingAuthority changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withExecutingAuthorities([new Uri(`http://data.lblod.info/id/bestuurseenheden/${pepingenId}`)])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withExecutingAuthorities([new Uri(`http://data.lblod.info/id/bestuurseenheden/${bilzenId}`)])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When conceptTag changed then isChanged should be false`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withConceptTags([ConceptTag.YourEuropeAanbevolen])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withConceptTags([ConceptTag.YourEuropeVerplicht])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
    });

    test.describe('Keywords', () => {
        test(`When keywords changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withKeywords([{value: 'test', language: Language.NL}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withKeywords([{value: 'test CHANGED', language: Language.NL}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When keyword added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withKeywords([])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withKeywords([{value: 'test', language: Language.NL}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When keyword with english language changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withKeywords([{value: 'test', language: Language.EN}])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withKeywords([{value: 'test CHANGED', language: Language.EN}])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    });

    test(`When publicationMedium changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withPublicationMedium([PublicationMedium.YourEurope])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withPublicationMedium([PublicationMedium.Rechtenverkenner])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test(`When yourEuropeCategory changed then isChanged should be true`, async ({request}) => {
        const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withYourEuropeCategory([YourEuropeCategory.Bedrijf])
            .buildAndPersist(request);

        const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
            .withYourEuropeCategory([YourEuropeCategory.BedrijfPersoonsgegevens])
            .buildAndPersist(request);

        expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
    });

    test.describe('Requirement', () => {
        test(`When requirement title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title CHANGED', language: Language.NL}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When other requirement title language version is  added then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}, {value: 'title', language: Language.FORMAL}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });

        test(`When requirement title language english is added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}, {value: 'title', language: Language.EN}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}],
                        [{value: 'description', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title', language: Language.NL}],
                        [{value: 'description CHANGED', language: Language.NL}]
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement order has not changed then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title 1', language: Language.NL}],
                        [{value: 'description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptRequirement(
                        [{value: 'title 2', language: Language.NL}],
                        [{value: 'description 2', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title 1', language: Language.NL}],
                        [{value: 'description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptRequirement(
                        [{value: 'title 2', language: Language.NL}],
                        [{value: 'description 2', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });

        test(`When requirement order changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title 1', language: Language.NL}],
                        [{value: 'description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptRequirement(
                        [{value: 'title 2', language: Language.NL}],
                        [{value: 'description 2', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title 1', language: Language.NL}],
                        [{value: 'description 1', language: Language.NL}],
                        '1'
                    ),
                    new ConceptRequirement(
                        [{value: 'title 2', language: Language.NL}],
                        [{value: 'description 2', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement is added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title 1', language: Language.NL}],
                        [{value: 'description 1', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'title 1', language: Language.NL}],
                        [{value: 'description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptRequirement(
                        [{value: 'title 2', language: Language.NL}],
                        [{value: 'description 2', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement evidence title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title CHANGED', language: Language.NL}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement evidence description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}],
                            [{value: 'evidence description CHANGED', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement evidence title language formal is added  then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}, {value: 'evidence title', language: Language.FORMAL}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });

        test(`When requirement evidence title language english is added  then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL}, {value: 'evidence title', language: Language.EN}],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When requirement evidence is added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withRequirements([
                    new ConceptRequirement(
                        [{value: 'requirement title', language: Language.NL}],
                        [{value: 'requirement description', language: Language.NL}],
                        '0',
                        new ConceptEvidence(
                            [{value: 'evidence title', language: Language.NL},],
                            [{value: 'evidence description', language: Language.NL}],
                        )
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    });

    test.describe('Procedure', () => {
        test(`When procedure title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title CHANGED', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description CHANGED', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure title language other than nl or english is added then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}, {value: 'procedure title', language: Language.FORMAL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });

        test(`When procedure order changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title 1', language: Language.NL}],
                        [{value: 'procedure description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptProcedure(
                        [{value: 'procedure title 2', language: Language.NL}],
                        [{value: 'procedure description 2', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title 2', language: Language.NL}],
                        [{value: 'procedure description 2', language: Language.NL}],
                        '0'
                    ),
                    new ConceptProcedure(
                        [{value: 'procedure title 1', language: Language.NL}],
                        [{value: 'procedure description 1', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure website title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title', language: Language.NL}],
                                [{value: 'website description', language: Language.NL}],
                                new Uri('https://www.example.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title CHANGED', language: Language.NL}],
                                [{value: 'website description', language: Language.NL}],
                                new Uri('https://www.example.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure website description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title', language: Language.NL}],
                                [{value: 'website description', language: Language.NL}],
                                new Uri('https://www.example.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title', language: Language.NL}],
                                [{value: 'website description CHANGED', language: Language.NL}],
                                new Uri('https://www.example.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure website url changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title', language: Language.NL}],
                                [{value: 'website description', language: Language.NL}],
                                new Uri('https://www.example.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title', language: Language.NL}],
                                [{value: 'website description', language: Language.NL}],
                                new Uri('https://www.changed-url.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure website added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title', language: Language.NL}],
                                [{value: 'website description', language: Language.NL}],
                                new Uri('https://www.example.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When procedure website order changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title 1', language: Language.NL}],
                                [{value: 'website description 1', language: Language.NL}],
                                new Uri('https://www.example-1.com'),
                                '0'
                            ),
                            new ConceptWebsite(
                                [{value: 'website title 2', language: Language.NL}],
                                [{value: 'website description 2', language: Language.NL}],
                                new Uri('https://www.example-2.com'),
                                '1'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withProcedures([
                    new ConceptProcedure(
                        [{value: 'procedure title', language: Language.NL}],
                        [{value: 'procedure description', language: Language.NL}],
                        '0',
                        [
                            new ConceptWebsite(
                                [{value: 'website title 1', language: Language.NL}],
                                [{value: 'website description 1', language: Language.NL}],
                                new Uri('https://www.example-1.com'),
                                '1'
                            ),
                            new ConceptWebsite(
                                [{value: 'website title 2', language: Language.NL}],
                                [{value: 'website description 2', language: Language.NL}],
                                new Uri('https://www.example-2.com'),
                                '0'
                            )
                        ]
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    });

    test.describe('Cost', () => {
        test(`When cost title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title', language: Language.NL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title CHANGED', language: Language.NL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When cost title language other than nl or english is added then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title nl', language: Language.NL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title nl', language: Language.NL}, {value: 'cost title formal', language: Language.FORMAL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });

        test(`When cost title language english is added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title nl', language: Language.NL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title nl', language: Language.NL}, {value: 'cost title en', language: Language.EN}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When cost description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title', language: Language.NL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title', language: Language.NL}],
                        [{value: 'cost description CHANGED', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When cost added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title', language: Language.NL}],
                        [{value: 'cost description', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When cost order changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title 1', language: Language.NL}],
                        [{value: 'cost description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptCost(
                        [{value: 'cost title 2', language: Language.NL}],
                        [{value: 'cost description 2', language: Language.NL}],
                        '1'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withCosts([
                    new ConceptCost(
                        [{value: 'cost title 1', language: Language.NL}],
                        [{value: 'cost description 1', language: Language.NL}],
                        '1'
                    ),
                    new ConceptCost(
                        [{value: 'cost title 2', language: Language.NL}],
                        [{value: 'cost description 2', language: Language.NL}],
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    });

    test.describe('FinancialAdvantage', () => {
        test(`When financialAdvantage title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title', language: Language.NL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title CHANGED', language: Language.NL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '1'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When financialAdvantage title language other than nl or en is added then isChanged should be false`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title nl', language: Language.NL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title nl', language: Language.NL}, {value: 'financialAdvantage title formal', language: Language.FORMAL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '1'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: false});
        });

        test(`When financialAdvantage title language english added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title nl', language: Language.NL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title nl', language: Language.NL}, {value: 'financialAdvantage title en', language: Language.EN}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '1'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When financialAdvantage description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title', language: Language.NL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title', language: Language.NL}],
                        [{value: 'financialAdvantage description CHANGED', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When financialAdvantage description added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title', language: Language.NL}],
                        [],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title', language: Language.NL}],
                        [{value: 'financialAdvantage description', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When financialAdvantage added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 1', language: Language.NL}],
                        [{value: 'financialAdvantage description 1', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 1', language: Language.NL}],
                        [{value: 'financialAdvantage description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 2', language: Language.NL}],
                        [{value: 'financialAdvantage description 2', language: Language.NL}],
                        '1'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When financialAdvantage order changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 1', language: Language.NL}],
                        [{value: 'financialAdvantage description 1', language: Language.NL}],
                        '0'
                    ),
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 2', language: Language.NL}],
                        [{value: 'financialAdvantage description 2', language: Language.NL}],
                        '1'
                    ),
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withFinancialAdvantages([
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 1', language: Language.NL}],
                        [{value: 'financialAdvantage description 1', language: Language.NL}],
                        '1'
                    ),
                    new ConceptFinancialAdvantage(
                        [{value: 'financialAdvantage title 2', language: Language.NL}],
                        [{value: 'financialAdvantage description 2', language: Language.NL}],
                        '0'
                    ),
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    });

    test.describe('MoreInfo website', () => {
        test(`When moreInfo website title changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title CHANGED', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When moreInfo title language english added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title nl', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title nl', language: Language.NL}, {value: 'website title en', language: Language.EN}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When moreInfo website description changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description CHANGED', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When moreInfo website url changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.url-changed.com'),
                        '0')
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When moreInfo website url added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        undefined,
                        '0')
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When moreInfo website added then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title', language: Language.NL}],
                        [{value: 'website description', language: Language.NL}],
                        new Uri('http://www.example.com'),
                        '0')
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });

        test(`When moreInfo website order changed then isChanged should be true`, async ({request}) => {
            const currentSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title 1', language: Language.NL}],
                        [{value: 'website description 1', language: Language.NL}],
                        new Uri('http://www.example-1.com'),
                        '0'
                    ),
                    new ConceptWebsite(
                        [{value: 'website title 2', language: Language.NL}],
                        [{value: 'website description 2', language: Language.NL}],
                        new Uri('http://www.example-2.com'),
                        '1'
                    )
                ])
                .buildAndPersist(request);

            const newSnapshot = await ConceptSnapshotTestBuilder.aConceptSnapshot()
                .withMoreInfo([
                    new ConceptWebsite(
                        [{value: 'website title 1', language: Language.NL}],
                        [{value: 'website description 1', language: Language.NL}],
                        new Uri('http://www.example-1.com'),
                        '1'
                    ),
                    new ConceptWebsite(
                        [{value: 'website title 2', language: Language.NL}],
                        [{value: 'website description 2', language: Language.NL}],
                        new Uri('http://www.example-2.com'),
                        '0'
                    )
                ])
                .buildAndPersist(request);

            expect(await compareSnapshots(currentSnapshot, newSnapshot, request)).toEqual({isChanged: true});
        });
    });

});


async function compareSnapshots(currentSnapshot: TripleArray, newSnapshot: TripleArray, request: APIRequestContext): Promise<boolean> {
    const params = {
        currentSnapshotUri: currentSnapshot.getSubject().getValue(),
        newSnapshotUri: newSnapshot.getSubject().getValue()
    };
    const actual = await request.get(`${dispatcherUrl}/lpdc-management/concept-snapshot-compare`, {params});
    expect(actual.ok(), `${await actual.text()}`).toBeTruthy();
    return actual.json();
}