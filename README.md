# TON-NFT-Machine

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Command line interface to run NFT in TON

## State

Working! (v1.0)

### Usage

	./ton-machine.sh -net <mainnet/testnet> -api <Your APi-key> -key ./key.json -collection ./jsonCollection.json -deploy/-usage
	

### Commands
	-net <mainnet/testnet>
	-api <API>
	-key <JSON seed-file path>
	-collection <JSON collection file>
	-deploy -- Mint NFT 
	-usage -- Using an already created collection
