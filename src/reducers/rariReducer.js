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
import {
  SET_RARI_FUND_BALANCE,
  SET_RARI_APY,
  SET_RARI_USER_DATA,
  SET_FETCHING_RARI_FUND_BALANCE,
  RARI_POOLS,
  SET_FETCHING_RARI_DATA,
  SET_FETCHING_RARI_DATA_ERROR,
} from 'constants/rariConstants';
import type { RariPool, Interests } from 'models/RariPool';


export type RariReducerState = {
  rariFundBalance: number,
  rariApy: {[RariPool]: number},
  userDepositInUSD: {[RariPool]: number},
  userInterests: {[RariPool]: ?Interests},
  isFetchingFundBalance: boolean,
  isFetchingRariData: boolean,
  rariDataFetchFailed: boolean,
}

export type RariReducerAction = {
  type: string,
  payload: any,
};

const initialState = {
  rariFundBalance: 0,
  rariApy: {
    [RARI_POOLS.STABLE_POOL]: 0,
    [RARI_POOLS.YIELD_POOL]: 0,
    [RARI_POOLS.ETH_POOL]: 0,
  },
  userDepositInUSD: {
    [RARI_POOLS.STABLE_POOL]: 0,
    [RARI_POOLS.YIELD_POOL]: 0,
    [RARI_POOLS.ETH_POOL]: 0,
  },
  userInterests: {
    [RARI_POOLS.STABLE_POOL]: {
      interests: 0,
      interestsPercentage: 0,
    },
    [RARI_POOLS.YIELD_POOL]: {
      interests: 0,
      interestsPercentage: 0,
    },
    [RARI_POOLS.ETH_POOL]: {
      interests: 0,
      interestsPercentage: 0,
    },
  },
  isFetchingFundBalance: false,
  isFetchingRariAPY: false,
  isFetchingRariData: false,
  rariDataFetchFailed: false,
};

export default function rariReducer(
  state: RariReducerState = initialState,
  action: RariReducerAction,
): RariReducerState {
  switch (action.type) {
    case SET_RARI_FUND_BALANCE:
      return {
        ...state,
        rariFundBalance: action.payload,
        isFetchingFundBalance: false,
      };
    case SET_RARI_APY:
      return {
        ...state,
        rariApy: action.payload,
      };
    case SET_RARI_USER_DATA:
      return {
        ...state,
        ...action.payload,
      };
    case SET_FETCHING_RARI_FUND_BALANCE:
      return {
        ...state,
        isFetchingFundBalance: action.payload ?? true,
      };
    case SET_FETCHING_RARI_DATA:
      return {
        ...state,
        isFetchingRariData: action.payload ?? true,
      };
    case SET_FETCHING_RARI_DATA_ERROR:
      return {
        ...state,
        rariDataFetchFailed: action.payload ?? true,
      };
    default:
      return state;
  }
}
