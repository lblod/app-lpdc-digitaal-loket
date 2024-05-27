export type BestuursEenheidConfig = {
    uri: string,
    name: string;
    classificatie: string;
    spatialNisCode?: string;
    spatialNisLabel?: string;
}

export const pepingen: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589",
    name: "Pepingen",
    classificatie: "Gemeente",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24123064",
    spatialNisLabel: "Pepingen"
}

export const aarschot: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/ba4d960fe3e01984e15fd0b141028bab8f2b9b240bf1e5ab639ba0d7fe4dc522",
    name: "Aarschot",
    classificatie: "Gemeente",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24224001",
    spatialNisLabel: "Aarschot"
}

export const leuven: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/c648ea5d12626ee3364a02debb223908a71e68f53d69a7a7136585b58a083e77",
    name: "Leuven",
    classificatie: "Gemeente",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24224062",
    spatialNisLabel: "Leuven"
}

export const provincieVlaamsBrabant: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8b7e7bf05ace5bb1a68f5bc0d870e20c20f147b00bd9a3dcce3a01733d4da744",
    name: "Vlaams-Brabant",
    classificatie: "Provincie",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24",
    spatialNisLabel: "Provincie Vlaams-Brabant"
}

export const ocmwLeuven: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/8a162fa437a54cb657b57514e4e0135ec106fce3206c29cd2f90b1859ed90dab",
    name: "Leuven",
    classificatie: "OCMW",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24224062",
    spatialNisLabel: "Leuven"
}

export const districtWilrijk: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/73e8904d83f7324e39abc0adf639b0e48bc52533c4c243b6419cac8fb70784cf",
    name: "Wilrijk",
    classificatie: "District",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
}

export const autonoomGemeentebedrijf: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/5b6b1771d90a683e65f3473ea76c0d37d80d08a8647fd96783eda9af179a8115",
    name: "AGB Pepingen",
    classificatie: "Autonoom gemeentebedrijf",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24123064",
    spatialNisLabel: "Pepingen"
}

export const autonoomProvinciebedrijf: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/ebc8589470b92ac994448573f072f7a0408e4ab893364ed118fd65537c3b9ed0",
    name: "APB Provinciaal Onderwijs Antwerpen",
    classificatie: "Autonoom provinciebedrijf",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE21",
    spatialNisLabel: "Provincie Antwerpen"
}

export const dienstverlenendeVereniging: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/11410c82b479306316ccaa6d18f695bf276b71e3dcdb95af5df9530b3125aecd",
    name: "Intergemeentelijk samenwerkingsverband Scheldelandschapspark",
    classificatie: "Dienstverlenende vereniging",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
}

export const hulpverleningszone: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/0e951dd15341d38413bf809f16ef5f1bd163092001ac04ce78a4de5b5e9cdd37",
    name: "HULPVERLENINGSZONE MEETJESLAND",
    classificatie: "Hulpverleningszone",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
}

export const opdrachthoudendeVereniging: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/09ba2fe670a607d3351a0e60cbd79f9e1a04992d576ccf33e842c80e669da996",
    name: "Intergemeentelijke Maatschappij voor Openbare Gezondheid in Zuid-West-Vlaanderen",
    classificatie: "Opdrachthoudende vereniging",
    spatialNisCode: undefined,
    spatialNisLabel: undefined
};

export const politieZone: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/04e7a09c988feed3cf8df1c51aafe0f0a50811e325f5f5ab8e1b9750f48630fd",
    name: "Politiezone van Middelkerke",
    classificatie: "Politiezone",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE25535011",
    spatialNisLabel: "Middelkerke"
}

export const projectvereniging: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/efe77fae-7ba7-4a62-873f-1f291b5a911f",
    name: "Brabantse Kouters Oost",
    classificatie: "Projectvereniging",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE24123088",
    spatialNisLabel: "Vilvoorde"
}

export const ocmwVereniging: BestuursEenheidConfig = {
    uri: "http://data.lblod.info/id/bestuurseenheden/cce1926b-51ff-4b66-a702-ea985f1d250b",
    name: "A.S.Z. Autonome Verzorgingsinstelling",
    classificatie: "OCMW vereniging",
    spatialNisCode: "http://data.europa.eu/nuts/code/BE23141002",
    spatialNisLabel: "Aalst"
}