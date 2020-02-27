/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { Clause, Template } = require('@accordproject/cicero-core');
const { Engine } = require('@accordproject/cicero-engine');
const { CiceroMarkTransformer } = require('@accordproject/markdown-cicero');
const bent = require('bent');
const getJSON = bent('json');

class CiceroContract extends Contract {

    constructor() {
        super();
        this.templates = [];
    }

    async initialize(ctx, contractText) {

        const markdown = await ctx.stub.getState('Markdown');

        if(markdown) {
            throw new Error('ERROR: contract has already been initialized');
        }

        if(!contractText) {
            throw new Error('ERROR: Must be initialized with markdown text');
        }

        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const dom = ciceroMarkTransformer.fromMarkdown( contractText, 'json' );
        console.log(`CiceroMark DOM ${JSON.stringify(dom, null, 4)}`);

        // ensure all the embedded clauses parse, and save the clause data
        const clauses = dom.nodes.filter( node => node.$class === 'org.accordproject.ciceromark.Clause' );
        console.log(`Found ${clauses.length} clauses.`);

        if(clauses.length > 0) {
            console.log('Loading template index...');
            const index = await getJSON('https://templates.accordproject.org/template-library.json');

            for( let n=0; n < clauses.length; n++ ) {
                const clauseNode = clauses[n];
                const hashIndex = clauseNode.src.indexOf('#');
                if(hashIndex <= 0) {
                    throw new Error(`Invalid clause src: ${clauseNode.src}`);
                }

                const clauseId = clauseNode.src.substring( 5, hashIndex);
                console.log(`Loading ${clauseId}...`);
                const url = index[clauseId].url;

                if(!url) {
                    throw new Error(`Failed to find URL for ${clauseId} in index.`);
                }
                const template = await Template.fromUrl( url );
                this.templates[clauseNode.clauseid] = template;
                console.log(`Loaded template: ${template.getIdentifier()}` );

                // parse the text for the clause
                const clauseText = ciceroMarkTransformer.getClauseText(clauseNode, { wrapVariables: false });

                // @ts-ignore
                const clause = new Clause(template);
                clause.parse(clauseText);
                const clauseData = clause.getData();
                console.log(`Clause data: ${JSON.stringify(clauseData, null, 4)}`);
                await ctx.stub.putState(`Data-${clauseNode.clauseid}`, Buffer.from(JSON.stringify(clauseData)));

                // Initiate the template
                const engine = new Engine();
                const result = await engine.init(clause, null);
                console.info(`Response from init: ${JSON.stringify(result)}`);

                // save the state
                await ctx.stub.putState(`State-${clauseNode.clauseid}`, Buffer.from(JSON.stringify(result.state)));

                // emit any events
                if (result.emit.length > 0) {
                    await ctx.stub.setEvent('Init-Events', Buffer.from(JSON.stringify(result.emit)));
                }
            }
        }

        // save the markdown text
        await ctx.stub.putState('Markdown', Buffer.from(contractText));
        return `Initialized ${clauses.length} clauses.`;
    }

    async trigger(ctx, clauseId, requestText) {

        if(!clauseId) {
            throw new Error('ERROR: Clause ID not specified.');
        }

        console.log(`Triggering clause ${clauseId}...`);

        if(!requestText) {
            throw new Error('ERROR: Request JSON missing.');
        }

        // load state
        const stateAsBytes = await ctx.stub.getState(`State-${clauseId}`);
        if (!stateAsBytes) {
            throw new Error(`ERROR: No state found for clause ${clauseId}`);
        }
        console.log('Loaded state: ' + stateAsBytes);
        const state = JSON.parse(stateAsBytes.toString());

        // load the clause data
        const clauseDataAsBytes = await ctx.stub.getState(`Data-${clauseId}`);
        if (!clauseDataAsBytes) {
            throw new Error(`ERROR: No data found for clause ${clauseId}`);
        }
        console.log('Loaded clause data: ' + clauseDataAsBytes);
        const clauseData = JSON.parse(clauseDataAsBytes.toString());

        // parse the request
        console.log('Got request: ' + requestText);
        const request = JSON.parse(requestText);

        // set the clause data
        // @ts-ignore
        const clause = new Clause(this.templates[clauseId]);
        // @ts-ignore
        clause.setData(clauseData);

        // execute the engine
        const engine = new Engine();
        const result = await engine.trigger(clause, request, state, null);
        console.info(`Response from engine execute: ${JSON.stringify(result)}`);

        // save the state
        await ctx.stub.putState(`State-${clauseId}`, Buffer.from(JSON.stringify(result.state)));

        // emit any events
        if (result.emit.length > 0) {
            await ctx.stub.setEvent(`${request.transactionId}-Events`, Buffer.from(JSON.stringify(result.emit)));
        }

        // return the response
        return result.response;
    }
}

module.exports = CiceroContract;