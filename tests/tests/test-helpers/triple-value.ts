export class TripleValue {

    constructor(
        public value: string,
        public predicate: string,
        public object: string
    ) {
    }

    toTriple(subject: string): string {
        if (this.predicate !== undefined && this.object !== undefined) {
            return `<${subject}> ${this.predicate} ${this.object} .`;
        } else {
            return undefined;
        }
    }
}