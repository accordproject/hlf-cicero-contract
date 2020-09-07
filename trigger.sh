
#
# Run this script from the root of the hlf-cicero-contract directory
# 
# This script sends a request to the cicero chaincode *run initialize first*

cd client
npm i
node ./submitTransaction trigger request.json CLAUSE_001
cd ..