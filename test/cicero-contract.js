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
        this.state = {
            $class: 'org.accordproject.helloworldstate.HelloWorldState',
            counter: 0,
            stateId: 'org.accordproject.helloworldstate.HelloWorldState#0.0'
        };
        this.data = {
            $class: 'org.accordproject.helloworldstate.HelloWorldClause',
            clauseId: 'CLAUSE_001',
            name: 'Dan Selman'
        };

        this.markdown = null;
        this.stub.getState.withArgs('Data-CLAUSE_001').resolves(Buffer.from(JSON.stringify(this.data)));
        this.stub.getState.withArgs('State-CLAUSE_001').resolves(Buffer.from(JSON.stringify(this.state)));

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

    beforeEach(async () => {});

    describe('#initialize', () => {
        it('initialize', async () => {
            contract = new CiceroContract();
            ctx = new TestContext();
            ctx.stub.getState.withArgs('Markdown').resolves(null);
            await contract.initialize(ctx, contractText);
        });

        it('initialize twice', async () => {
            contract = new CiceroContract();
            ctx = new TestContext();
            ctx.stub.getState.withArgs('Markdown').resolves(null);
            await contract.initialize(ctx, contractText);

            ctx.stub.getState.withArgs('Markdown').resolves(Buffer.from('yes'));
            contract.initialize(ctx, contractText).should.be.rejected;
        });
    });

    describe('#execute', () => {

        it('execute without initialize', async () => {
            contract = new CiceroContract();
            ctx = new TestContext();
            ctx.stub.getState.withArgs('Markdown').resolves(null);

            const request = {
                $class: 'org.accordproject.helloworldstate.MyRequest',
                input: 'Accord Project',
                transactionId: '607db610-42fa-11ea-8b78-dde257dbceb0',
                timestamp: '2020-01-29T19:49:31.633-05:00'
            };
            contract.trigger(ctx, 'CLAUSE_001', JSON.stringify(request)).should.be.rejected;
        });
    });

    it('execute after initialize', async () => {
        contract = new CiceroContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('Markdown').resolves(null);
        await contract.initialize(ctx, contractText);
        ctx.stub.getState.withArgs('Markdown').resolves(Buffer.from('yes'));

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
