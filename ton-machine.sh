#!/bin/bash
echo "ton-machine v1.0"
if [ -z "${1}"  ]
then

	echo
	echo "Use the 'help' option for information"
	exit 45
fi
 
if [ $1 == help ] 
then
echo "Usage: ton-machine [command]"
echo "
Commands:
	-net <mainnet/testnet>
	-api <API>
	-key <JSON seed-file path>
	-collection <JSON collection file>
	-deploy -- Mint NFT my_collection
	-usage -- Using an already created collection

Example:
	./ton-machine.sh -net testnet -api 0000000000000000000000000000000000000000000000000000000000000000 -key ./key.json -collection ./jsonCollection.json -deploy
	./ton-machine.sh -net mainnet -api 0000000000000000000000000000000000000000000000000000000000000000 -key ./key.json -collection ./jsonCollection.json -usage
	"

fi

if [[ $9 == -deploy ]]
then
	node lib/deploy_collection.js $2 $4 $6 $8
fi

if [[ $9 == -usage ]]
then
	node lib/usage_collection.js $2 $4 $6 $8
fi

fi

if [[ $3 == -usage]]
then

fi
