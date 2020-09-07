
#
# Run this script from the root of the hlf-cicero-contract directory
# 
# This script uploads the markdown text for a contract to the chaincode

# set these three values based on your HLF install location
export HLF_INSTALL_DIR=/Users/dselman/dev/fabric-samples
export HLF_TEST_NETWORK=${HLF_INSTALL_DIR}/test-network
# end set

export PATH=${HLF_INSTALL_DIR}/bin:$PATH
export FABRIC_CFG_PATH=${HLF_INSTALL_DIR}/config/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${HLF_TEST_NETWORK}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${HLF_TEST_NETWORK}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${HLF_TEST_NETWORK}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n cicero --peerAddresses localhost:7051 --tlsRootCertFiles ${HLF_TEST_NETWORK}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${HLF_TEST_NETWORK}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c \
'{"function":"initialize","Args":["Heading\r\n====\r\n\r\n{{#clause CLAUSE_001 src=\"ap:\/\/helloworldstate@0.14.0#6c506f481cf1b3debe347c72d97beacadb85ea8344b33e2e4950bdabb2580f11\"}}\r\nName of the person to greet: \"Fred Blogs\".\r\nThank you!\r\n{{\/clause}}\r\n\r\nMore text."]}'