# hlf-cicero-contract

This project is a Smart Contract for **Hyperledger Fabric v2 (HLF v2)** (aka chaincode) that can be used to install, instantiate and trigger clauses within a smart legal agreement, defined using the Accord Project technology. The logic for the clause runs on-chain, and responses from the logic are returned to the caller. Any emitted events are passed to the Fabric event bus, and the state for the clause is stored on-chain.

# Install

> Please customize the environment variables in the scripts based on your HLF v2 install location and the location of the HLF Test-Net.

Refer to the [HLF documentation](https://hyperledger-fabric.readthedocs.io/en/master/install.html) for how to install the HLF v2 Test-Net and how to start it.

Install the package onto Hyperledger Fabric v2 Test-Net peers using the `./install.sh` script.

Here are the logs from a successful installation.

```
Dan-MacBook-Pro-2:hlf-cicero-contract dselman$ ./install.sh && ./initialize.sh 
npm WARN acorn-jsx@5.2.0 requires a peer of acorn@^6.0.0 || ^7.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN cicero-contract@0.58.0 No repository field.

audited 840 packages in 3.923s

5 packages are looking for funding
  run `npm fund` for details

found 47 low severity vulnerabilities
  run `npm audit fix` to fix them, or `npm audit` for details
peer:
 Version: 2.2.0
 Commit SHA: 5ea85bc54
 Go version: go1.14.4
 OS/Arch: darwin/amd64
 Chaincode:
  Base Docker Label: org.hyperledger.fabric
  Docker Namespace: hyperledger

Packaging chaincode 0.58.0
Error: chaincode install failed with status: 500 - failed to invoke backing implementation of 'InstallChaincode': chaincode already successfully installed
Installed on org1
Error: chaincode install failed with status: 500 - failed to invoke backing implementation of 'InstallChaincode': chaincode already successfully installed
Installed on org2
Installed chaincodes on peer:
Package ID: cicero_0.58.0:f39715156261e6766a9d03dd91e6473c77fb12ac9a045b6362f1a0b98ebd2c36, Label: cicero_0.58.0
Chaincode package id:  cicero_0.58.0:f39715156261e6766a9d03dd91e6473c77fb12ac9a045b6362f1a0b98ebd2c36
Sequence number 1
2020-07-21 15:56:38.368 CEST [chaincodeCmd] ClientWait -> INFO 001 txid [963bfb10ec19e556bd4347cda2ff75873808ab428f117e9381294fbb02a617a0] committed with status (VALID) at 
Approved for org2
2020-07-21 15:56:40.467 CEST [chaincodeCmd] ClientWait -> INFO 001 txid [c307db94b43db3e424a232f8d33effb8bfffe4aca58ad2f838c6d78f3542ee4b] committed with status (VALID) at 
Approved for org1
{
	"approvals": {
		"Org1MSP": true,
		"Org2MSP": true
	}
}
checkcommitreadiness
2020-07-21 15:56:42.629 CEST [chaincodeCmd] ClientWait -> INFO 001 txid [f2b0d3f1fbbafd043679b6a47298d0ace31b28fae0f80610d5bd9a162fd390b4] committed with status (VALID) at localhost:7051
2020-07-21 15:56:42.633 CEST [chaincodeCmd] ClientWait -> INFO 002 txid [f2b0d3f1fbbafd043679b6a47298d0ace31b28fae0f80610d5bd9a162fd390b4] committed with status (VALID) at localhost:9051
chaincode committed
```

# Initialize

> Please customize the environment variables in the scripts based on your HLF v2 install location and the location of the HLF Test-Net.

After installing the chaincode on the peers you **must** call the `initialize` method by running the `./initialize.sh` script.
The script includes the transaction payload (markdown text for the contract) from `initialize-input.txt`.

A source markdown contract is included as `contract.md`.

> Note that you can only call `initialize` once on the smart contract - ensuring that once the markdown text of the contract
has been set, it is immutable.

# Trigger

> Please customize the environment variables in the scripts based on your HLF v2 install location and the location of the HLF Test-Net.

Once instantiated clauses within the smart contract can be triggered. You must pass the `ID` and the `JSON` payload to the `trigger` method by running the `./trigger.sh` script.

A sample input payload is included in `trigger.input.txt`.

Here are the logs from 2 calls to trigger a stateful clause. Note the integer value `Hello Dan Selman Hello(1.0)` gets incremented each time the clause is triggered, with state stored on the HLF ledger.

```
Dan-MacBook-Pro-2:hlf-cicero-contract dselman$ ./trigger.sh 
2020-07-21 15:58:44.102 CEST [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 payload:"{\"$class\":\"org.accordproject.helloworldstate.MyResponse\",\"output\":\"Hello Dan Selman Hello(1.0)\",\"transactionId\":\"6024ab90ed857e394893ca02e7cc714aed35495cf33e1446244d5da4510602e9\",\"timestamp\":{\"seconds\":{\"low\":1595339924,\"high\":0,\"unsigned\":false},\"nanos\":58479000}}" 
Dan-MacBook-Pro-2:hlf-cicero-contract dselman$ ./trigger.sh 
2020-07-21 15:58:54.896 CEST [chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200 payload:"{\"$class\":\"org.accordproject.helloworldstate.MyResponse\",\"output\":\"Hello Dan Selman Hello(2.0)\",\"transactionId\":\"97b57cf5a0385b827c39a1e8d2adf04b1906b4b1f9b6c307783b37a3510def5a\",\"timestamp\":{\"seconds\":{\"low\":1595339934,\"high\":0,\"unsigned\":false},\"nanos\":870996000}}" 
```

# Rebuild and Redeploy

To modify the smart contract you must increment the version number in `package.json` and re-run the `./install.sh` script. Because you can only initialize the contract once you will have to tear-down the network (or comment our the body of the `ensureNotInitialized` smart contract method).

To restart the Test-Net run `./network.sh down && ./network.sh up && ./network.sh createChannel` from within the Test-Net directory.