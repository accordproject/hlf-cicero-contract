# hlf-cicero-contract

This project is a generic Smart Contract for **Hyperledger Fabric v2.2 (HLF v2.2)** (aka chaincode) that can be used to install, instantiate and trigger clauses within a smart legal agreement, defined using the [Accord Project](https://accordproject.org) technology. The logic for the clause runs on-chain, and responses from the logic are returned to the caller. Any emitted events are passed to the Fabric event bus, and the state for the clause is stored on-chain.

The smart contract is initialized using an Accord Project *CiceroMark* document. CiceroMark is an extended markdown format, allowing inline instantiation of [Accord Project templates](https://docs.accordproject.org/docs/accordproject.html).

# Install

## Fabric Install
Refer to the [HLF documentation](https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html) for how to install the HLF v2 Test-Net and how to start it.

## Set HLF_INSTALL_DIR

```
export HLF_INSTALL_DIR=/Users/dselman/dev/fabric-samples
```

## jq Install
Install [jq](https://stedolan.github.io/jq/) for your platform.

## Set PATH

Ensure your path is set correctly so that the `peer` command works. E.g.

```
export PATH=/Users/dselman/dev/fabric-samples/bin/:$PATH
peer version
```

## Start Network **with CA**

Start the network by running the `./network.sh down && ./network.sh up -ca` inside the `fabric-samples/test-network` directory.

## Create the Channel

Don't forget to create the channel (see the Fabric install guide and check you did not miss this step)!

```
./network.sh createChannel
```

## Install Cicero Chaincode

Install the package onto Hyperledger Fabric v2 Test-Net peers using the `./install.sh` script.

Here are the logs from a successful installation.

```
peer:
 Version: 2.2.0
 Commit SHA: 5ea85bc54
 Go version: go1.14.4
 OS/Arch: darwin/amd64
 Chaincode:
  Base Docker Label: org.hyperledger.fabric
  Docker Namespace: hyperledger

Packaging chaincode 0.61.5
2020-09-09 20:39:07.428 BST [cli.lifecycle.chaincode] submitInstallProposal -> INFO 001 Installed remotely: response:<status:200 payload:"\nNcicero_0.61.5:fc37752977426eb466560db8d695a13bed0b2e155b0dbc7aa1e471607dc12abc\022\rcicero_0.61.5" > 
2020-09-09 20:39:07.431 BST [cli.lifecycle.chaincode] submitInstallProposal -> INFO 002 Chaincode code package identifier: cicero_0.61.5:fc37752977426eb466560db8d695a13bed0b2e155b0dbc7aa1e471607dc12abc
Installed on org1
2020-09-09 20:39:24.191 BST [cli.lifecycle.chaincode] submitInstallProposal -> INFO 001 Installed remotely: response:<status:200 payload:"\nNcicero_0.61.5:fc37752977426eb466560db8d695a13bed0b2e155b0dbc7aa1e471607dc12abc\022\rcicero_0.61.5" > 
2020-09-09 20:39:24.191 BST [cli.lifecycle.chaincode] submitInstallProposal -> INFO 002 Chaincode code package identifier: cicero_0.61.5:fc37752977426eb466560db8d695a13bed0b2e155b0dbc7aa1e471607dc12abc
Installed on org2
Installed chaincodes on peer:
Package ID: cicero_0.61.5:fc37752977426eb466560db8d695a13bed0b2e155b0dbc7aa1e471607dc12abc, Label: cicero_0.61.5
Chaincode package id:  cicero_0.61.5:fc37752977426eb466560db8d695a13bed0b2e155b0dbc7aa1e471607dc12abc
Sequence number 1
2020-09-09 20:39:26.515 BST [chaincodeCmd] ClientWait -> INFO 001 txid [81fc8745d8bdb2b1eda4ac69a80a36f7966166613bd5b83255dab8649250c27c] committed with status (VALID) at 
Approved for org2
2020-09-09 20:39:28.634 BST [chaincodeCmd] ClientWait -> INFO 001 txid [7390de92fa87f06231373c928edc561bb773b8532c4a3ab77c117ae35b49ba2f] committed with status (VALID) at 
Approved for org1
{
	"approvals": {
		"Org1MSP": true,
		"Org2MSP": true
	}
}
checkcommitreadiness
2020-09-09 20:39:30.821 BST [chaincodeCmd] ClientWait -> INFO 001 txid [13ca86569dbe0f155381975d3c960b337f6a77b9ef9f291c2e98ac17d9ef6f4a] committed with status (VALID) at localhost:7051
2020-09-09 20:39:30.823 BST [chaincodeCmd] ClientWait -> INFO 002 txid [13ca86569dbe0f155381975d3c960b337f6a77b9ef9f291c2e98ac17d9ef6f4a] committed with status (VALID) at localhost:9051
chaincode committed
```

# Deploy a Smart Legal Contract

After installing the chaincode on the peers you **must** call the `initialize` method by running the `./initialize.sh` script.
The script deploys `contract.md` to Fabric, which contains a simple `HelloWorld` clause.

> During the initialize transaction the CiceroMark text is parsed to extract the template references and templates are downloaded from https://templates.accordproject.org. This logic will have to be customized to load templates from elsewhere.

# Trigger

Once instantiated clauses within the smart contract can be triggered by running the `./trigger.sh` script to submit `request.json` to trigger CLAUSE_001.

Here are the logs from 2 calls to trigger a stateful clause. Note the integer value `Hello Dan Selman Hello(1.0)` gets incremented each time the clause is triggered, with state stored on the HLF ledger.

First run:

```
*** Result: {"$class":"org.accordproject.helloworldstate.MyResponse","output":"Hello Fred Blogs Dan(1.0)","transactionId":"2aed5ebdc2378ee9907a6d4ed888cc6f6ff6967d2e41c630a5ead32681bbdcf7","timestamp":{"seconds":{"low":1599680419,"high":0,"unsigned":false},"nanos":543000000}}
```

Second run:

```
*** Result: {"$class":"org.accordproject.helloworldstate.MyResponse","output":"Hello Fred Blogs Dan(2.0)","transactionId":"bfcd66b77c24329017e6bb500637cede10d22f42f7e4942809261caf813b0def","timestamp":{"seconds":{"low":1599680425,"high":0,"unsigned":false},"nanos":768000000}}
```

# Deploying Another Contract

To deploy a different contract and trigger it (rental-deposit) use the following commands:

```
cd client
node submitTransaction.js initialize rental-contract.md
node submitTransaction.js trigger rental-request.json RENTAL_001
```

You can experiment with different contracts by simply adding a smart legal contract markdown file and the request JSON file to use and then re-running `node submitTransaction.js initialize` and `node submitTransaction.js trigger` with the appropriate arguments.

# Rebuild and Redeploy

To modify the smart contract you must increment the version number in `package.json` and re-run the `./install.sh` script. Because you can only initialize the contract once you will have to tear-down the network (or comment out the body of the `ensureNotInitialized` smart contract method).

To restart the Test-Net run `./network.sh down && ./network.sh up -ca && ./network.sh createChannel` from within the Test-Net directory.