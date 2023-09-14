import {expect, test} from '@playwright/test';
import {Page, request, APIRequestContext} from "@playwright/test";
import {v4 as uuid} from 'uuid';

test('Generate and view lpdcConceptsReport', async ({page}) => {
    //TODO LPDC-671: 1/ navigate to pepingen, and use a concept (create instance) 2/ manually trigger report generation for this report 3/ navigate to dashboard, and download latest report for this type 4/ validate contents
    
    
});

test('Generate and view lpdcBestuurseenheidReport', async ({page}) => {
    //TODO LPDC-671: 1/ navigate to pepingen, and use a concept (create instance) 2/ manually trigger report generation for this report 3/ navigate to dashboard, and download latest report for this type 4/ validate contents
    
});

test('Generate and view instancesStuckinPublishingForLPDCReport', async ({page}) => {
    //TODO LPDC-671: 1/ navigate to pepingen, and use a concept (create instance) 2/ mimic the ipdc publish to fail for this instance 3/ manually trigger report generation for this report 4/ navigate to dashboard, and download latest report for this type 5/ validate contents
    
});