#!/bin/bash
echo "ton-machine v0.1"
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
	-api <API>
	-json <Json seed-file path>
	-deploy -- Mint NFT my_collection
	-usage -- Using an already created collection

Example:
	./ton-machine.sh -api 0000000000000000000000000000000000000000000000000000000000000000 -json my_nft.json
	./ton-machine.sh -api 0000000000000000000000000000000000000000000000000000000000000000 -json my_nft.json -start
	"

fi

if [[ $1 == -api ]]
then
	python py/info.py $2
	mv api.js ./ton-web-machine
fi

if [[ $3 == -deploy]]
then

fi

if [[ $3 == -usage]]
then

fi