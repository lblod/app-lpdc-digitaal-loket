# QA data dump for decisions

This folder loads 902 decisions from the six pilot municipalities into
`http://mu.semte.ch/graphs/public`. It is for QA only. Remove this folder
before merging to production.

## Contents

- 902 `.ttl` files with the besluit, behandeling, agendapunt and zitting.
- 902 `.graph` files that point to `http://mu.semte.ch/graphs/public`.
- 479 decisions come from agenda items with `besluit:openbaar false`.

The dump has no bestuursorganen or bestuurseenheden. The OP consumer mapping
and the `sync-bestuursorganen-from-op` migration copy the bestuursorganen from
`http://mu.semte.ch/graphs/landing-zone/op-public` to
`http://mu.semte.ch/graphs/public`.

## Closed agenda items

479 of the 902 agenda item handlings have `besluit:openbaar false`. Their
decisions are in the public graph. Clients that only want open decisions
should query `/agenda-item-handlings?filter[public]=true` and include the
resolutions, or filter on the `generated-by` relationship of a resolution.
