import { responseInterceptor, type Plugin } from "http-proxy-middleware";
import { Request, Response } from "express";
import { env } from "process";

const plugins: Plugin<Request, Response>[] = [
    (proxyServer, options) => {
        options.pathRewrite = {
            '^/': '', // remove slash
        };
        options.headers = {
            ...options.headers,
            'Accept': 'application/ld+json'
        };
        options.selfHandleResponse = true;
        proxyServer.on('proxyRes', responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            // Remove incorrect cache-control headers
            res.removeHeader('expires');
            res.removeHeader('cache-control');
            res.removeHeader('pragma');


            const response = JSON.parse(responseBuffer.toString('utf8'));
            const relations = response.view?.relation;

            // Determine if the current page is the last page in the feed
            const hasNextPage = relations && Array.isArray(relations) && relations.find((rel) => rel['@type'] === "GreaterThanOrEqualToRelation");
            if (hasNextPage) {
                res.setHeader('cache-control', 'max-age=604800,immutable') // max-age is a year
            } else {
                res.setHeader('cache-control', 'max-age=0')
            }

            // Filter out all relationships except `GreaterThanOrEqualToRelation`, as these are usually not well handled by ldes-client implementations
            if (relations && Array.isArray(relations)) {
                const relationsFiltered = relations.filter(rel => rel['@type'] === "GreaterThanOrEqualToRelation");
                response.view.relation = relationsFiltered;
            }

            const upstreamURL = env.API_URL;
            const requestURL = `${req.protocol}://${req.get('host')}`;
            // Replace all upstream URL links by the request URL to ensure links are correctly resolved
            return JSON.stringify(response).replaceAll(upstreamURL!, requestURL);
        }))
    }
];

export default plugins;