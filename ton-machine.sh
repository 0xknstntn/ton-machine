#!/bin/bash
echo "ton-machine v1.0"
if [ -z "${1}"  ]
then

	echo
	echo "Use the 'help' option for information"
	echo
	cmd /k
fi
 
if [ $1 == -help ] 
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
		./ton-machine.sh -net testnet -api 0000000000000000000000000000000000000000000000000000000000000000 -key ./key.json -collection ./jsonCollection.json -deploy_NFT
		./ton-machine.sh -net mainnet -api 0000000000000000000000000000000000000000000000000000000000000000 -key ./key.json -collection ./jsonCollection.json -usage_NFT
		./ton-machine.sh -net testnet -api 0000000000000000000000000000000000000000000000000000000000000000 -key ./key.json -collection ./jsonCollection.json -deploy_jetton
		"
	cmd /k
fi

if [[ $9 == -deploy_NFT ]]
then
	node lib/deploy_collection.js $2 $4 $6 $8
fi

if [[ $9 == -usage_NFT ]]
then
	node lib/usage_collection.js $2 $4 $6 $8
fi

if [[ $9 == -deploy_jetton ]]
then
	node lib/deploy_jetton.js $2 $4 $6 $8
fi