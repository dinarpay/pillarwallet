// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
/* eslint-disable no-continue, no-await-in-loop */
import { BigNumber as EthersBigNumber, utils, constants as ethersConstants } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { encodeContractMethod, getContract, buildERC20ApproveTransactionData } from 'services/assets';
import { get0xSwapOrders } from 'services/0x.js';
import { getEnv, getRariPoolsEnv } from 'configs/envConfig';
import { DAI, USDC, USDT, TUSD, mUSD, ETH, WETH, USD } from 'constants/assetsConstants';
import { RARI_POOLS, RARI_TOKENS } from 'constants/rariConstants';
import { getAccountDepositInUSDBN } from 'services/rari';
import { reportErrorLog, parseTokenBigNumberAmount, scaleBN } from 'utils/common';
import RARI_FUND_MANAGER_CONTRACT_ABI from 'abi/rariFundManager.json';
import RARI_FUND_PROXY_CONTRACT_ABI from 'abi/rariFundProxy.json';
import ERC20_CONTRACT_ABI from 'abi/erc20.json';
import MSTABLE_CONTRACT_ABI from 'abi/mAsset.json';
import MSTABLE_VALIDATION_HELPER_CONTRACT_ABI from 'abi/mAssetValidationHelper.json';
import RARI_RGT_DISTRIBUTOR_CONTRACT_ABI from 'abi/rariGovernanceTokenDistributor.json';
import type { Asset, Rates } from 'models/Asset';
import type { RariPool } from 'models/RariPool';


const getRariAcceptedCurrencies = (rariPool: RariPool) => {
  if (rariPool === RARI_POOLS.ETH_POOL) {
    return [ETH];
  }
  const rariContract = getContract(
    getRariPoolsEnv(rariPool).RARI_FUND_MANAGER_CONTRACT_ADDRESS,
    RARI_FUND_MANAGER_CONTRACT_ABI,
  );
  if (!rariContract) return null;
  return rariContract.callStatic.getAcceptedCurrencies()
    .catch((error => {
      reportErrorLog("Rari service failed: Can't get accepted currencies", { error });
      return null;
    }));
};

const getMStableSwapOutput = (
  inputTokenAddress: string, outputTokenAddress: string, amountBN: EthersBigNumber,
) => {
  const mstableContract = getContract(
    getEnv().MSTABLE_CONTRACT_ADDRESS,
    MSTABLE_CONTRACT_ABI,
  );
  if (!mstableContract) return null;
  return mstableContract.getSwapOutput(
    inputTokenAddress,
    outputTokenAddress,
    amountBN,
  ).catch((error) => {
    reportErrorLog("Rari service failed: Can't get mStable swap output", { error });
    return null;
  });
};

const getMStableFee = () => {
  const mstableContract = getContract(
    getEnv().MSTABLE_CONTRACT_ADDRESS,
    MSTABLE_CONTRACT_ABI,
  );
  if (!mstableContract) return null;
  return mstableContract.swapFee().catch((error) => {
    reportErrorLog("Rari service failed: Can't get mStable fee", { error });
    return null;
  });
};

const getMStableRedeemValidity = (inputAmountBN: EthersBigNumber, outputTokenAddress: string) => {
  const mstableContract = getContract(
    getEnv().MSTABLE_VALIDATION_HELPER_CONTRACT_ADDRESS,
    MSTABLE_VALIDATION_HELPER_CONTRACT_ABI,
  );
  if (!mstableContract) return null;
  return mstableContract.getRedeemValidity(
    RARI_TOKENS[mUSD].address,
    inputAmountBN,
    outputTokenAddress,
  ).catch((error) => {
    reportErrorLog("Rari service failed: Can't check redeem validity", { error });
    return null;
  });
};

const getRariDepositTransactionData = async (
  rariPool: RariPool, amountBN: EthersBigNumber, token: Asset, supportedAssets: Asset[], rates: Rates,
) => {
  const acceptedCurrencies = await getRariAcceptedCurrencies(rariPool);
  if (!acceptedCurrencies) return null;

  let txValue = EthersBigNumber.from(0);
  if (token.symbol === ETH) {
    txValue = txValue.add(amountBN);
  }

  // token can be directly deposited, no exchange fee
  if (acceptedCurrencies.includes(token.symbol)) {
    return {
      depositTransactionData: encodeContractMethod(RARI_FUND_MANAGER_CONTRACT_ABI, 'deposit', [
        token.symbol,
        amountBN,
      ]),
      txValue,
      exchangeFeeBN: EthersBigNumber.from(0),
      slippage: 0,
      rariContractAddress: getRariPoolsEnv(rariPool).RARI_FUND_MANAGER_CONTRACT_ADDRESS,
    };
  }

  let acceptedCurrency = acceptedCurrencies[0];
  let acceptedAsset = supportedAssets.find(asset => asset.symbol === acceptedCurrency);

  if (!acceptedAsset) {
    reportErrorLog("Rari service failed: can't find asset", { asset: acceptedCurrency });
    return null;
  }

  // try mStable
  // TODO: if user wants to deposit mUSD the flow is a bit different
  // you need to use MassetValidationHelper.getRedeemValidity to get swap output data
  // but since mUSD is not yet supported we don't need to implement it right now
  if ([DAI, USDC, USDT, TUSD].includes(token.symbol)) {
    for (let i = 0; i < acceptedCurrencies.length; ++i) {
      acceptedCurrency = acceptedCurrencies[i];
      acceptedAsset = supportedAssets.find(asset => asset.symbol === acceptedCurrencies[i]);

      if (![DAI, USDC, USDT, TUSD, mUSD].includes(acceptedCurrency) || !acceptedAsset) {
        continue;
      }

      const mStableSwapOutput = await getMStableSwapOutput(token.address, acceptedAsset.address, amountBN);
      if (mStableSwapOutput && mStableSwapOutput['0']) {
        const ethRates = rates[ETH];
        if (!ethRates) {
          reportErrorLog('Rari service failed: no ETH exchange rate');
        }
        const formattedInput = utils.formatUnits(amountBN, token.decimals);
        const formattedOutput = utils.formatUnits(mStableSwapOutput.output, acceptedAsset.decimals);
        const mStableFeeUSD = formattedInput - formattedOutput; // we assume that stablecoins price is 1$
        return {
          depositTransactionData: encodeContractMethod(
            RARI_FUND_PROXY_CONTRACT_ABI,
            'exchangeAndDeposit(string,uint256,string)',
            [
              token.symbol,
              amountBN,
              acceptedCurrency,
            ]),
          txValue,
          exchangeFeeBN: utils.parseEther((mStableFeeUSD / ethRates[USD]).toFixed(18)),
          slippage: 0, // mStable has no slippage
          rariContractAddress: getRariPoolsEnv(rariPool).RARI_FUND_PROXY_CONTRACT_ADDRESS,
        };
      }
    }
  }

  // try 0x
  const _0xdata = await get0xSwapOrders(
    token.symbol === ETH
      ? WETH
      : token.address,
    acceptedAsset.address,
    amountBN,
  );
  if (!_0xdata) {
    return null;
  }
  const signatures = [];
  const [
    orders,
    inputFilledAmountBN,
    protocolFee,
    takerAssetFilledAmountBN,
    price,
    guaranteedPrice,
  ] = _0xdata;

  if (inputFilledAmountBN.lt(amountBN)) {
    reportErrorLog(
      `Rari service failed: Unable to find enough liquidity to exchange ${token.symbol} before depositing.`,
    );
    return null;
  }

  for (let j = 0; j < orders.length; j++) {
    const { signature, ...order } = orders[j];
    signatures[j] = signature;
    orders[j] = order;
  }

  const slippage = (Math.abs(price - guaranteedPrice) / price) * 100;

  return {
    depositTransactionData: encodeContractMethod(
      RARI_FUND_PROXY_CONTRACT_ABI,
      'exchangeAndDeposit(address,uint256,string,(address,address,address,address,uint256,uint256,' +
        'uint256,uint256,uint256,uint256,bytes,bytes,bytes,bytes)[],bytes[],uint256)',
      [
        token.symbol === ETH
          ? ethersConstants.AddressZero
          : token.address,
        amountBN,
        acceptedCurrency,
        orders,
        signatures,
        takerAssetFilledAmountBN,
      ]),
    txValue: txValue.add(protocolFee),
    exchangeFeeBN: EthersBigNumber.from(protocolFee),
    slippage,
    rariContractAddress: getRariPoolsEnv(rariPool).RARI_FUND_PROXY_CONTRACT_ADDRESS,
  };
};

export const getRariDepositTransactionsAndExchangeFee = async (
  rariPool: RariPool, senderAddress: string, amount: number, token: Asset, supportedAssets: Asset[], rates: Rates,
) => {
  const amountBN = parseTokenBigNumberAmount(amount, token.decimals);
  const data = await getRariDepositTransactionData(rariPool, amountBN, token, supportedAssets, rates);
  if (!data) return null;

  const {
    depositTransactionData, txValue, exchangeFeeBN, slippage, rariContractAddress,
  } = data;

  let depositTransactions = [{
    from: senderAddress,
    to: rariContractAddress,
    data: depositTransactionData,
    amount: parseFloat(utils.formatEther(txValue)),
    symbol: ETH,
  }];

  if (token.symbol !== ETH) {
    const erc20Contract = getContract(token.address, ERC20_CONTRACT_ABI);
    const approvedAmountBN = erc20Contract
      ? await erc20Contract.allowance(senderAddress, rariContractAddress)
      : null;

    if (!approvedAmountBN || amountBN.gt(approvedAmountBN)) {
      const approveTransactionData = buildERC20ApproveTransactionData(rariContractAddress, amount, token.decimals);
      depositTransactions = [
        {
          from: senderAddress,
          to: token.address,
          data: approveTransactionData,
          amount: 0,
          symbol: ETH,
        },
        ...depositTransactions,
      ];
    }
  }
  return { depositTransactions, exchangeFeeBN, slippage };
};

const getRariFundBalancesAndPrices = (rariPool: RariPool) => {
  const rariContract = getContract(
    getRariPoolsEnv(rariPool).RARI_FUND_PROXY_CONTRACT_ADDRESS,
    RARI_FUND_PROXY_CONTRACT_ABI,
  );

  if (!rariContract) return null;

  return rariContract.callStatic.getRawFundBalancesAndPrices()
    .catch((error) => {
      reportErrorLog("Rari service failed: Can't get fund balances and prices", { error });
      return null;
    });
};

const getInputCandidates = (balancesAndPrices) => {
  const [currencies, balances, poolsIndexes, poolsBalances] = balancesAndPrices;
  const inputCandidates = [];

  for (let currencyIndex = 0; currencyIndex < currencies.length; ++currencyIndex) {
    let rawFundBalanceBN = EthersBigNumber.from(balances[currencyIndex]);

    poolsIndexes[currencyIndex].forEach((_, poolIndex) => {
      rawFundBalanceBN = rawFundBalanceBN.add(poolsBalances[currencyIndex][poolIndex]);
    });
    if (rawFundBalanceBN.gt(0)) {
      inputCandidates.push({
        currencyCode: currencies[currencyIndex],
        rawFundBalanceBN,
      });
    }
  }
  return inputCandidates;
};

const compareInputCandidatesByUsdBurned = (a, b) => {
  const bOutput = b.makerAssetFillAmountBN.mul(scaleBN(18)).div(b.takerAssetFillAmountUsdBN);
  const aOutput = a.makerAssetFillAmountBN.mul(scaleBN(18)).div(a.takerAssetFillAmountUsdBN);
  return bOutput.gt(aOutput) ? 1 : -1;
};

export const getRariWithdrawTransactionData = async (
  rariPool: RariPool, amountBN: EthersBigNumber, token: Asset,
) => {
  const balancesAndPrices = await getRariFundBalancesAndPrices(rariPool);
  if (!balancesAndPrices) return null;

  const [currencies, , , , prices] = balancesAndPrices;

  const inputCandidates = getInputCandidates(balancesAndPrices);

  let withdrawnAmountBN = EthersBigNumber.from(0);

  // try to withdraw without exchange
  const rawWithdrawCandidate = inputCandidates.find(candidate => candidate.currencyCode === token.symbol);
  if (rawWithdrawCandidate) {
    // if there is enough raw token, withdraw it!
    if (rawWithdrawCandidate.rawFundBalanceBN.gte(amountBN)) {
      return {
        withdrawTransactionData: encodeContractMethod(RARI_FUND_MANAGER_CONTRACT_ABI, 'withdraw', [
          token.symbol,
          amountBN,
        ]),
        rariContractAddress: getRariPoolsEnv(rariPool).RARI_FUND_MANAGER_CONTRACT_ADDRESS,
        exchangeFeeBN: EthersBigNumber.from(0),
        slippage: 0,
      };
    }
    // there is not enough token, let's take what we have and exchange another token to obtain output token
    withdrawnAmountBN = withdrawnAmountBN.add(rawWithdrawCandidate.rawFundBalanceBN);
    rawWithdrawCandidate.rawFundBalanceBN = EthersBigNumber.from(0);
  }

  const inputCurrencyCodes = [];
  const inputAmountBNs = [];
  const allOrders = [];
  const allSignatures = [];
  const makerAssetFillAmountBNs = [];
  const protocolFeeBNs = [];
  let totalProtocolFeeBN = EthersBigNumber.from(0);

  // try to use mStable
  if (['DAI', 'USDC', 'USDT', 'TUSD'].includes(token.symbol)) {
    const mStableFee = await getMStableFee();

    for (let i = 0; i < inputCandidates.length; ++i) {
      const inputCandidate = inputCandidates[i];
      if (!['DAI', 'USDC', 'USDT', 'TUSD', 'mUSD'].includes(inputCandidate.currencyCode)) {
        continue;
      }
      if (inputCandidate.rawFundBalanceBN.isZero()) {
        continue;
      }

      // let's calculate how much input token we need to exchange
      // mStable exchanges on 1:(1-fee) rate
      // so to obtain `output` tokens we need `output/(1-feePercentage)` tokens
      let outputAmountBN = amountBN.sub(withdrawnAmountBN);

      let inputTokenBN = outputAmountBN
        .mul(scaleBN(18))
        .div(scaleBN(18).sub(mStableFee))
        .mul(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals))
        .div(scaleBN(token.decimals));

      const getOutputAmountBN = () => {
        const outputAmountBeforeFeesBN = inputTokenBN
          .mul(scaleBN(token.decimals))
          .div(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals));

        return outputAmountBeforeFeesBN.sub(
          outputAmountBeforeFeesBN
            .mul(mStableFee)
            .div(scaleBN(18)),
        );
      };

      outputAmountBN = getOutputAmountBN();

      let tries = 0;
      while (outputAmountBN.lt(amountBN.sub(withdrawnAmountBN))) {
        if (tries >= 1000) {
          reportErrorLog('Rari service failed: Failed to get increment order ' +
            'input amount to achieve desired output amount.');
          return null;
        }
        inputTokenBN = inputTokenBN.add(1);
        outputAmountBN = getOutputAmountBN();
        tries++;
      }

      // we may not have inputTokenBN input tokens in rari, so in that case just take everything we can
      if (inputTokenBN.gt(inputCandidate.rawFundBalanceBN)) {
        inputTokenBN = inputCandidate.rawFundBalanceBN;
        outputAmountBN = getOutputAmountBN();
      }

      // let's ask mStable if it can do the exchange for us
      let mStableSwapOutput = null;
      if (inputCandidate.currencyCode === 'mUSD') {
        mStableSwapOutput = await getMStableRedeemValidity(inputTokenBN, token.address);
      } else {
        mStableSwapOutput = await getMStableSwapOutput(
          RARI_TOKENS[inputCandidate.currencyCode].address, token.address, inputTokenBN,
        );
      }
      if (!mStableSwapOutput || !mStableSwapOutput['0']) {
        continue;
      }

      if (!EthersBigNumber.from(mStableSwapOutput['2']).eq(outputAmountBN)) {
        reportErrorLog('Rari service failed: Predicted output amount not valid', {
          mstableOutput: mStableSwapOutput['2'].toString(),
          predictedOutput: outputAmountBN.toString(),
        });
        continue;
      }

      // all good, add the exchange to the list
      inputCurrencyCodes.push(inputCandidate.currencyCode);
      inputAmountBNs.push(inputTokenBN);
      allOrders.push([]);
      allSignatures.push([]);
      makerAssetFillAmountBNs.push(EthersBigNumber.from(0));
      protocolFeeBNs.push(EthersBigNumber.from(0));

      withdrawnAmountBN = withdrawnAmountBN.add(outputAmountBN);
      inputCandidate.rawFundBalanceBN = inputCandidate.rawFundBalanceBN.sub(inputTokenBN);

      // we have withdrawn everything we need, so we break out of the loop
      if (withdrawnAmountBN.gte(amountBN)) {
        break;
      }
    }
  }

  let slippage = 0;

  const _0xInputCandidates = [];

  // oh no, we still haven't withdrawn enough, let's try 0x then!
  if (withdrawnAmountBN.lt(amountBN)) {
    // firstly for every input candidate get the orders from 0x
    for (let i = 0; i < inputCandidates.length; i++) {
      const inputCandidate = inputCandidates[i];
      if (inputCandidate.rawFundBalanceBN.isZero()) {
        continue;
      }
      // get me the orders to sell inputCandidate to obtain amountBN.sub(withdrawnAmountBN) of user's token
      const _0xdata = await get0xSwapOrders(
        RARI_TOKENS[inputCandidate.currencyCode].address,
        token.symbol === ETH
          ? WETH
          : token.address,
        inputCandidate.rawFundBalanceBN,
        amountBN.sub(withdrawnAmountBN),
      ).catch(error => {
        reportErrorLog("Rari service failed: Can't get 0x swap orders", { error });
        return null;
      });

      if (!_0xdata) {
        continue;
      }

      const [
        orders,
        inputFilledAmountBN,
        protocolFee,
        takerAssetFilledAmountBN,
        price,
        guaranteedPrice,
        makerAssetFilledAmountBN,
      ] = _0xdata;

      const signatures = [];
      for (let j = 0; j < orders.length; j++) {
        const { signature, ...order } = orders[j];
        signatures[j] = signature;
        orders[j] = order;
      }

      _0xInputCandidates.push({
        ...inputCandidate,
        orders,
        signatures,
        inputFillAmountBN: inputFilledAmountBN,
        protocolFee,
        makerAssetFillAmountBN: makerAssetFilledAmountBN,
        takerAssetFillAmountUsdBN: takerAssetFilledAmountBN
          .mul(prices[currencies.indexOf(inputCandidate.currencyCode)])
          .div(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals)),
        slippage: (Math.abs(price - guaranteedPrice) / price) * 100,
      });
    }

    // sort candidates from highest to lowest output per USD burned
    _0xInputCandidates.sort(compareInputCandidatesByUsdBurned);

    // Loop through input currency candidates until we fill the withdrawal
    for (let i = 0; i < _0xInputCandidates.length; i++) {
      const inputCandidate = _0xInputCandidates[i];
      // Is this order enough to cover the rest of the withdrawal?
      if (inputCandidate.makerAssetFillAmountBN.gte(amountBN.sub(withdrawnAmountBN))) {
        // If order is enough to cover the rest of the withdrawal, cover it and stop looping through input candidates
        const thisOutputAmountBN = amountBN.sub(withdrawnAmountBN);
        let thisInputAmountBN = inputCandidate.inputFillAmountBN
          .mul(thisOutputAmountBN)
          .div(inputCandidate.makerAssetFillAmountBN);

        let tries = 0;
        while (
          inputCandidate.makerAssetFillAmountBN
            .mul(thisInputAmountBN)
            .div(inputCandidate.inputFillAmountBN)
            .lt(thisOutputAmountBN)
        ) {
          if (tries >= 1000) { return null; }
          // Make sure we have enough input fill amount to achieve this maker asset fill amount
          thisInputAmountBN = thisInputAmountBN.add(1);
          tries++;
        }

        inputCurrencyCodes.push(inputCandidate.currencyCode);
        inputAmountBNs.push(thisInputAmountBN);
        allOrders.push(inputCandidate.orders);
        allSignatures.push(inputCandidate.signatures);
        makerAssetFillAmountBNs.push(thisOutputAmountBN);
        protocolFeeBNs.push(EthersBigNumber.from(inputCandidate.protocolFee));

        withdrawnAmountBN = withdrawnAmountBN.add(thisOutputAmountBN);
        totalProtocolFeeBN = totalProtocolFeeBN.add(inputCandidate.protocolFee);
        slippage += utils.formatUnits(thisOutputAmountBN.mul(scaleBN(18)).div(amountBN), 18) * inputCandidate.slippage;
        break;
      } else {
        // Otherwise, add the whole order and keep looping through input candidates
        inputCurrencyCodes.push(inputCandidate.currencyCode);
        inputAmountBNs.push(inputCandidate.inputFillAmountBN);
        allOrders.push(inputCandidate.orders);
        allSignatures.push(inputCandidate.signatures);
        makerAssetFillAmountBNs.push(inputCandidate.makerAssetFillAmountBN);
        protocolFeeBNs.push(EthersBigNumber.from(inputCandidate.protocolFee));

        withdrawnAmountBN = withdrawnAmountBN.add(inputCandidate.makerAssetFillAmountBN);
        totalProtocolFeeBN = totalProtocolFeeBN.add(inputCandidate.protocolFee);
        slippage += utils.formatUnits(inputCandidate.makerAssetFillAmountBN.mul(scaleBN(18)).div(amountBN), 18) *
          inputCandidate.slippage;
      }

      // Stop if we have filled the withdrawal
      if (withdrawnAmountBN.gte(amountBN)) break;
    }

    // Make sure input amount is completely filled
    if (withdrawnAmountBN.lt(amountBN)) {
      reportErrorLog('Rari service failed: Unable to find enough liquidity to exchange ' +
        `withdrawn tokens to ${token.symbol}.`);
      return null;
    }
  }

  // finally, let's exchange and withdraw!
  return {
    withdrawTransactionData: encodeContractMethod(RARI_FUND_PROXY_CONTRACT_ABI, 'withdrawAndExchange', [
      inputCurrencyCodes,
      inputAmountBNs,
      token.address,
      allOrders,
      allSignatures,
      makerAssetFillAmountBNs,
      protocolFeeBNs,
    ]),
    rariContractAddress: getRariPoolsEnv(rariPool).RARI_FUND_PROXY_CONTRACT_ADDRESS,
    exchangeFeeBN: EthersBigNumber.from(totalProtocolFeeBN),
    slippage,
  };
};

export const getRariWithdrawTransaction = async (
  rariPool: RariPool, senderAddress: string, amount: number, token: Asset,
) => {
  const amountBN = parseTokenBigNumberAmount(amount, token.decimals);
  const data = await getRariWithdrawTransactionData(rariPool, amountBN, token);
  if (!data) return null;

  const {
    withdrawTransactionData, rariContractAddress, exchangeFeeBN, slippage,
  } = data;

  const withdrawTransaction = {
    from: senderAddress,
    to: rariContractAddress,
    data: withdrawTransactionData,
    amount: parseFloat(utils.formatEther(exchangeFeeBN)),
    symbol: ETH,
  };

  return { withdrawTransaction, exchangeFeeBN, slippage };
};

export const getMaxWithdrawAmount = async (rariPool: RariPool, token: Asset, senderAddress: string) => {
  const senderUsdBalance = await getAccountDepositInUSDBN(rariPool, senderAddress);
  if (!senderUsdBalance) return null;
  const balancesAndPrices = await getRariFundBalancesAndPrices(rariPool);
  if (!balancesAndPrices) return null;
  const [currencies, , , , prices] = balancesAndPrices;

  const inputCandidates = getInputCandidates(balancesAndPrices);

  let withdrawnAmountUsdBN = EthersBigNumber.from(0);
  let maxAmountOfTokenBN = EthersBigNumber.from(0);

  // try to withdraw without exchange
  const rawWithdrawCandidate = inputCandidates.find(candidate => candidate.currencyCode === token.symbol);
  if (rawWithdrawCandidate) {
    maxAmountOfTokenBN = senderUsdBalance.mul(scaleBN(token.decimals)).div(prices[currencies.indexOf(token.symbol)]);

    // if there is enough raw token, withdraw it!
    if (rawWithdrawCandidate.rawFundBalanceBN.gte(maxAmountOfTokenBN)) {
      return maxAmountOfTokenBN;
    }
    // there is not enough token, let's take what we have and exchange another token to obtain output token
    withdrawnAmountUsdBN = withdrawnAmountUsdBN.add(
      rawWithdrawCandidate.rawFundBalanceBN.mul(prices[currencies.indexOf(token.symbol)]).div(scaleBN(token.decimals)),
    );
    maxAmountOfTokenBN = rawWithdrawCandidate.rawFundBalanceBN;
    rawWithdrawCandidate.rawFundBalanceBN = EthersBigNumber.from(0);
  }

  // try to use mStable
  if (['DAI', 'USDC', 'USDT', 'TUSD'].includes(token.symbol)) {
    for (let i = 0; i < inputCandidates.length; ++i) {
      const inputCandidate = inputCandidates[i];
      if (!['DAI', 'USDC', 'USDT', 'TUSD', 'mUSD'].includes(inputCandidate.currencyCode)) {
        continue;
      }
      if (inputCandidate.rawFundBalanceBN.isZero()) {
        continue;
      }

      const usdLeftBN = senderUsdBalance.sub(withdrawnAmountUsdBN);
      let inputTokenBN = usdLeftBN
        .mul(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals))
        .div(prices[currencies.indexOf(inputCandidate.currencyCode)]);

      // we may not have inputTokenBN input tokens in rari, so in that case just take everything we can
      if (inputTokenBN.gt(inputCandidate.rawFundBalanceBN)) {
        inputTokenBN = inputCandidate.rawFundBalanceBN;
      }

      // let's ask mStable if it can do the exchange for us
      let mStableSwapOutput = null;
      if (inputCandidate.currencyCode === 'mUSD') {
        mStableSwapOutput = await getMStableRedeemValidity(inputTokenBN, token.address);
      } else {
        mStableSwapOutput = await getMStableSwapOutput(
          RARI_TOKENS[inputCandidate.currencyCode].address, token.address, inputTokenBN,
        );
      }
      if (!mStableSwapOutput || !mStableSwapOutput['0']) {
        continue;
      }

      inputCandidate.rawFundBalanceBN = inputCandidate.rawFundBalanceBN.sub(inputTokenBN);
      withdrawnAmountUsdBN = withdrawnAmountUsdBN.add(
        inputTokenBN
          .mul(prices[currencies.indexOf(inputCandidate.currencyCode)])
          .div(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals)),
      );
      maxAmountOfTokenBN = maxAmountOfTokenBN.add(mStableSwapOutput['2']);

      // we have withdrawn everything we need, so we break out of the loop
      if (withdrawnAmountUsdBN.gte(senderUsdBalance.sub(scaleBN(16)))) {
        return maxAmountOfTokenBN;
      }
    }
  }

  // oh no, we still haven't withdrawn enough, let's try 0x then!
  // firstly for every input candidate get the orders from 0x

  const _0xInputCandidates = [];

  for (let i = 0; i < inputCandidates.length; i++) {
    const inputCandidate = inputCandidates[i];
    if (inputCandidate.rawFundBalanceBN.isZero()) {
      continue;
    }
    const usdLeftBN = senderUsdBalance.sub(withdrawnAmountUsdBN);
    let inputTokenBN = usdLeftBN
      .mul(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals))
      .div(prices[currencies.indexOf(inputCandidate.currencyCode)]);

    // we may not have inputTokenBN input tokens in rari, so in that case just take everything we can
    if (inputTokenBN.gt(inputCandidate.rawFundBalanceBN)) {
      inputTokenBN = inputCandidate.rawFundBalanceBN;
    }

    // get me the orders to sell inputCandidate to obtain amountBN.sub(withdrawnAmountBN) of user's token
    const _0xdata = await get0xSwapOrders(
      RARI_TOKENS[inputCandidate.currencyCode].address,
      token.symbol === ETH
        ? WETH
        : token.address,
      inputTokenBN,
    ).catch(error => {
      reportErrorLog("Rari service failed: Can't get 0x swap orders", { error });
      return null;
    });

    if (!_0xdata) {
      continue;
    }

    const [, inputFilledAmountBN,, takerAssetFilledAmountBN,,, makerAssetFilledAmountBN] = _0xdata;

    _0xInputCandidates.push({
      ...inputCandidate,
      inputFillAmountBN: inputFilledAmountBN,
      makerAssetFillAmountBN: makerAssetFilledAmountBN,
      takerAssetFillAmountUsdBN: takerAssetFilledAmountBN
        .mul(prices[currencies.indexOf(inputCandidate.currencyCode)])
        .div(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals)),
    });
  }

  // sort candidates from highest to lowest output per USD burned
  _0xInputCandidates.sort(compareInputCandidatesByUsdBurned);

  // Loop through input currency candidates until we fill the withdrawal
  for (let i = 0; i < _0xInputCandidates.length; i++) {
    const inputCandidate = _0xInputCandidates[i];
    // Is this order enough to cover the rest of the withdrawal?
    const inputFillAmountUsdBN = inputCandidate.inputFillAmountBN
      .mul(prices[currencies.indexOf(inputCandidate.currencyCode)])
      .div(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals));

    if (inputFillAmountUsdBN.gte(senderUsdBalance.sub(withdrawnAmountUsdBN).sub(scaleBN(16)))) {
      // If order is enough to cover the rest of the withdrawal, cover it and stop looping through input candidates
      const thisOutputAmountBN = inputCandidate.makerAssetFillAmountBN
        .mul(senderUsdBalance.sub(withdrawnAmountUsdBN))
        .div(inputFillAmountUsdBN);
      maxAmountOfTokenBN = maxAmountOfTokenBN.add(thisOutputAmountBN);
      return maxAmountOfTokenBN;
    }
    // Otherwise, add the whole order and keep looping through input candidates
    maxAmountOfTokenBN = maxAmountOfTokenBN.add(inputCandidate.makerAssetFillAmountBN);
    withdrawnAmountUsdBN = withdrawnAmountUsdBN.add(
      inputCandidate.inputFillAmountBN
        .mul(prices[currencies.indexOf(inputCandidate.currencyCode)])
        .div(scaleBN(RARI_TOKENS[inputCandidate.currencyCode].decimals)),
    );
  }
  reportErrorLog('Rari service failed: Not enough liquidity to fill sender usd balance');
  return null;
};

export const getWithdrawalFeeRate = (rariPool: RariPool) => {
  const rariContract = getContract(
    getRariPoolsEnv(rariPool).RARI_FUND_MANAGER_CONTRACT_ADDRESS,
    RARI_FUND_MANAGER_CONTRACT_ABI,
  );
  if (!rariContract) return Promise.resolve(null);
  return rariContract.getWithdrawalFeeRate()
    .catch((error) => {
      reportErrorLog("Rari service failed: Can't get withdrawal fee", { error });
      return null;
    });
};

export const getRariClaimRgtTransaction = (senderAddress: string, amount: number, txFeeInWei?: BigNumber) => {
  const transactionData = encodeContractMethod(RARI_RGT_DISTRIBUTOR_CONTRACT_ABI, 'claimRgt', [
    parseTokenBigNumberAmount(amount, 18),
  ]);

  return {
    from: senderAddress,
    to: getEnv().RARI_RGT_DISTRIBUTOR_CONTRACT_ADDRESS,
    data: transactionData,
    amount: 0,
    symbol: ETH,
    txFeeInWei,
  };
};
