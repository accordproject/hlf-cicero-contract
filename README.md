# hlf-cicero-contract

This project is a Smart Contract for Hyperledger Fabric (aka chaincode) that can be used to install, instantiate and trigger clauses within a smart legal agreement, defined using the Accord Project technology. The logic for the clause runs on-chain, and responses from the logic are returned to the caller. Any emitted events are passed to the Fabric event bus, and the state for the clause is stored on-chain.

# Install

Install the package onto the peer (using the IBM Blockchain VSCode extension or using the `./scripts/package.json` to build a CDS file).

# Instantiate

When you instantiate the smart contract you **must** call the `initialize` method, passing in the
markdown text for your smart legal contract. A sample of the payload to pass is included in
`initialize-input.txt`.

A source markdown contract is included as `contract.md`.

# Trigger

Once instantiated clauses within the smart contract can be triggered. You must pass the `ID` and the `JSON` payload to the `trigger` method.

A sample input payload is included in `trigger.input.txt`.


# Upgrade

If you upgrade the smart contract, you should call the `upgrade` method (no arguments), which will re-download the template archives used by the smart legal contract and cache the templates.