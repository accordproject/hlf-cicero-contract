/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {
    ChaincodeStub,
    ClientIdentity
} = require('fabric-shim');
const {
    CiceroContract
} = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

const contractText = `
Heading
====

\`\`\` <clause src="ap://helloworldstate@0.13.0#bb863fb0a3ccd796eb3c6e9e244758201cc12673d53b74ec2f859d8abebc5e11" clauseid="CLAUSE_001"/>
Name of the person to greet: "Dan Selman".
Thank you!
\`\`\`

More text.
`;

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        const state = {
            $class: 'org.accordproject.helloworldstate.HelloWorldState',
            counter: 0,
            stateId: 'org.accordproject.helloworldstate.HelloWorldState#0.0'
        };
        const data = {
            $class: 'org.accordproject.helloworldstate.HelloWorldClause',
            clauseId: 'CLAUSE_001',
            name: 'Dan Selman'
        };

        this.stub.getState.withArgs('Data-CLAUSE_001').resolves(Buffer.from(JSON.stringify(data)));
        this.stub.getState.withArgs('State-CLAUSE_001').resolves(Buffer.from(JSON.stringify(state)));

        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('CiceroContract', () => {

    let contract;
    let ctx;

    beforeEach(async () => {
        contract = new CiceroContract();
        ctx = new TestContext();
        await contract.initialize(ctx, contractText);
    });

    describe('#execute', () => {

        it('execute', async () => {
            const request = {
                $class: 'org.accordproject.helloworldstate.MyRequest',
                input: 'Accord Project',
                transactionId: '607db610-42fa-11ea-8b78-dde257dbceb0',
                timestamp: '2020-01-29T19:49:31.633-05:00'
            };
            const result = await contract.trigger(ctx, 'CLAUSE_001', JSON.stringify(request));
            result.output.should.equal('Hello Dan Selman Accord Project(1.0)');
        });
    });
});
