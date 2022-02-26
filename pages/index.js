import Head from "next/head";
import { useMoralis } from "react-moralis";
import styles from "../styles/Home.module.css";
import React, { useState, useEffect, useMemo } from "react";

import * as Web3 from 'web3'
import { OpenSeaPort, Network } from 'opensea-js'
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider';


export default function Home() {






  const {
		Moralis,
		user,
		logout,
		authenticate,
		enableWeb3,
		isInitialized,
		isAuthenticated,
		isWeb3Enabled,
	} = useMoralis();



  const [values, setValues] = useState({ tokenAddress: "", tokenId: "", ethAmount: "" });
  const web3Account = useMemo(
		() => isAuthenticated && user.get("accounts")[0],
		[user, isAuthenticated],
	);

	const getAsset = async () => {
		const res = await Moralis.Plugins.opensea.getAsset({
			network: "testnet",
			tokenAddress: values.tokenAddress,
			tokenId: values.tokenId,
		});
		console.log(res);
	};

	const getOrder = async () => {
		const res = await Moralis.Plugins.opensea.getOrders({
			network: "testnet",
			tokenAddress: values.tokenAddress,
			tokenId: values.tokenId,
			orderSide: 1,
			page: 1, // pagination shows 20 orders each page
		});
		console.log(res.orders[0]);
	};

	const createSellOrder = async () => {
		const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);
		const startAmount = 1;
		const endAmount = 1;

		await Moralis.Plugins.opensea.createSellOrder({
			network: "testnet",
			tokenAddress: values.tokenAddress,
			tokenId: values.tokenId,
			tokenType: "ERC1155",
			userAddress: web3Account,
			startAmount,
			endAmount,
			expirationTime: startAmount > endAmount && expirationTime, // Only set if you startAmount > endAmount
		});

		console.log("Create Sell Order Successful");
	};

	const createBuyOrder = async () => {
		await Moralis.Plugins.opensea.createBuyOrder({
			network: "testnet",
			tokenAddress: values.tokenAddress,
			tokenId: values.tokenId,
			tokenType: "ERC721",
			amount: 0.0001,
			userAddress: web3Account,
      // WETH (Wrapped ETH) is a currency that allows users to make pre-authorized bids that can be fulfilled at a later date without any further action from the bidder. 
      // WETH is used to buy and sell with auctions on OpenSea. 
			// paymentTokenAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
			paymentTokenAddress: "0xc778417e063141139fce010982780140aa0cd5ab", // testnet address
			
		});
	};

  const fulfillOrder = async () => {
    await Moralis.Plugins.opensea.fulfillOrder({
      network: 'testnet',
      userAddress: web3Account,
      order: res,
    });
  }

  	const getAssetOpensea = async () => {
		const provider =  await detectEthereumProvider();

		if (provider) {
			// From now on, this should always be true:
			// provider === window.ethereum

			const seaport = new OpenSeaPort(provider, {
				// 	networkName: Network.Main,
				//   apiKey: '2d3ddf54946e4569b7cd1df8daca6e4a'
				networkName: Network.Rinkeby,
				apiKey: '5bec8ae0372044cab1bef0d866c98618' //testnet
			})

		const asset = await seaport.api.getAsset({
			tokenAddress: values.tokenAddress,
			tokenId: values.tokenId,
		})
		console.log(asset);

		} else {
			console.log('Please install MetaMask!');
		}
	
		

	};

	const getOrderOpensea = async () => {
		// Get page 2 of all auctions, a.k.a. orders where `side == 1`
		const { orders, count } = await seaport.api.getOrders({
			asset_contract_address: values.tokenAddress,
			token_id: values.tokenId,
			side: 1,// 1: sell order,
			sale_kind: 0 // 0: fixed price
		})
		console.log(orders[0])
		console.log(count)
	};

	const createSellOrderOpensea = async () => {
		
	};

	const createBuyOrderOpensea = async () => {

		const offer = await seaport.createBuyOrder({
			asset: {
			  tokenId: values.tokenId,
			  tokenAddress: values.tokenAddress,
			  schemaName:  "ERC721" // WyvernSchemaName. If omitted, defaults to 'ERC721'. Other options include 'ERC20' and 'ERC1155'
			},
			accountAddress: web3Account,
			// Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
			startAmount: 0.001,
		  })

		console.log(offer);
	
	};

	const fulfillOrderOpensea = async () => {

		const provider = await detectEthereumProvider();

		if (provider) {
		// From now on, this should always be true:
		// provider === window.ethereum
		const seaport = new OpenSeaPort(provider, {
			// 	networkName: Network.Main,
			//   apiKey: '2d3ddf54946e4569b7cd1df8daca6e4a'
			networkName: Network.Rinkeby,
			apiKey: '5bec8ae0372044cab1bef0d866c98618' //testnet
		})

		const { orders, count } = await seaport.api.getOrders({
			asset_contract_address: values.tokenAddress,
			token_id: values.tokenId,
			side: 1,// 1: sell order,
			sale_kind: 0 // 0: fixed price
		}).catch(err => console.log(err));

		const transactionHash = await seaport.fulfillOrder({ 
			order:  orders[0], accountAddress: web3Account 
		}).catch(err => console.log(err));
		console.log(transactionHash)
		} else {
		console.log('Please install MetaMask!');
		}


		// const { orders, count } = await seaport.api.getOrders({
		// 	asset_contract_address: values.tokenAddress,
		// 	token_id: values.tokenId,
		// 	side: 1,// 1: sell order,
		// 	sale_kind: 0 // 0: fixed price
		// }).catch(err => console.log(err));

		// const transactionHash = await seaport.fulfillOrder({ 
		// 	order:  orders[0], accountAddress: web3Account 
		// }).catch(err => console.log(err));
		// console.log(transactionHash)
	}


  useEffect(() => {
		if (isInitialized) {
			Moralis.initPlugins();
		}
		// eslint-disable-next-line
	}, []);

  useEffect(() => {
		if (isAuthenticated && !isWeb3Enabled) {
			enableWeb3();
		}
		// eslint-disable-next-line
	}, [isAuthenticated]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isAuthenticated ? (
        <>
          <button onClick={logout}>Logout</button>
          <h2>Welcome {user.get("username")}</h2>
          <h2>Your wallet address is {user.get("ethAddress")}</h2>
          <div>{web3Account}</div>
          <div>{values.tokenAddress} </div>
          <div>{values.tokenId} </div>
		  <div>{values.ethAmount} </div>
          <label>
            NFT Token Address:
            <input type="text" onChange={(e) =>
							setValues({ ...values, tokenAddress: e.target.value })
						} />
          </label> <br></br>
          <label>
            NFT Token ID:
            <input type="text" onChange={(e) =>
							setValues({ ...values, tokenId: e.target.value })
						} />
          </label> <br></br>
		  <label>
            ETH amount (for creating an order):
            <input type="text" onChange={(e) =>
							setValues({ ...values, ethAmount: parseFloat(e.target.value) })
						} />
          </label> <br></br>
          <button onClick={getAsset}>
            getAsset
          </button>
          <button onClick={getOrder}>
            getOrder
          </button>
          <button onClick={createBuyOrder}>
            createBuyOrder
          </button>
          <button onClick={fulfillOrder}>
            fulfillOrder
          </button>
						<br></br>
		  <button onClick={getAssetOpensea}>
            getAssetOpensea
          </button>
          <button onClick={getOrderOpensea}>
            getOrderOpensea
          </button>
          <button onClick={createBuyOrderOpensea}>
            createBuyOrderOpensea
          </button>
          <button onClick={fulfillOrderOpensea}>
            fulfillOrderOpensea
          </button>
          
        </>
      ) : (
        <button
          onClick={() => {
            authenticate({ provider: "metamask" });
          }}
        >
          Sign in with MetaMask
        </button>
      )}
    </div>
  );
}
