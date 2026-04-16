
// @ts-expect-error
import { convertBlankNodes } from "../lib/utils";
// @ts-expect-error
import { executeDeleteInsertQuery } from "../lib/sparql-queries";

import type * as RDF from "@rdfjs/types";
import { DataFactory } from "n3";
const { quad, variable } = DataFactory;

import type { Client } from "ldes-client";
// ldes-client doesn't expose the `Member` type directly...
type Member =
  ReturnType<Client["stream"]> extends ReadableStream<infer M> ? M : never;

/**
 * Custom `processMember` function for the BCT feed.
 * Expects the INGEST_MODE to be "all".
 * This function ensures there are no relations to duplicate blank nodes (in case the client is reset)
 */
export async function processMember(member: Member) {
  member.quads = convertBlankNodes(member.quads);
  const quadsToAdd: RDF.Quad[] = member.quads;
  const quadsToRemove: RDF.Quad[] = [
    quad(member.id as RDF.Quad_Subject, variable("p"), variable("o")),
  ];
  await executeDeleteInsertQuery(quadsToRemove, quadsToAdd);
}
