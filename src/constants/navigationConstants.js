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

// APP FLOW
export const APP_FLOW = 'APP_FLOW';
export const TAB_NAVIGATION = 'TAB_NAVIGATION';
export const ASSETS = 'ASSETS';
export const SERVICES = 'SERVICES';
export const SERVICES_TAB = 'SERVICES_TAB';
export const ME_TAB = 'ME_TAB';
export const ASSET = 'ASSET';
export const MARKET = 'MARKET';
export const CONTACT_INFO = 'CONTACT_INFO';
export const REVEAL_BACKUP_PHRASE = 'REVEAL_BACKUP_PHRASE';
export const CHAT_LIST = 'CHAT_LIST';
export const NEW_CHAT = 'NEW_CHAT';
export const CHAT = 'CHAT';
export const ICO = 'ICO';
export const BACKUP_WALLET_IN_SETTINGS_FLOW = 'BACKUP_WALLET_IN_SETTINGS_FLOW';
export const COLLECTIBLE = 'COLLECTIBLE';
export const BADGE = 'BADGE';
export const CONFIRM_CLAIM = 'CONFIRM_CLAIM';
export const MENU = 'MENU';
export const LOGOUT_PENDING = 'LOGOUT_PENDING';
export const STORYBOOK = 'STORYBOOK';
export const CONNECT_TAB = 'CONNECT_TAB';
export const PIN_CODE = 'PIN_CODE';
export const SPLASH_SCREEN = 'SPLASH_SCREEN';

// ASSETS FLOW
export const ACCOUNTS = 'ACCOUNTS';
export const UNSETTLED_ASSETS = 'UNSETTLED_ASSETS';
export const ASSET_SEARCH = 'ASSET_SEARCH';

// CHANGE PIN FLOW
export const CHANGE_PIN_FLOW = 'CHANGE_PIN_FLOW';
export const CHANGE_PIN_CURRENT_PIN = 'CHANGE_PIN_CURRENT_PIN';
export const CHANGE_PIN_NEW_PIN = 'CHANGE_PIN_NEW_PIN';
export const CHANGE_PIN_CONFIRM_NEW_PIN = 'CHANGE_PIN_CONFIRM_NEW_PIN';

// ONBOARDING FLOW
export const ONBOARDING_FLOW = 'ONBOARDING_FLOW';
export const NEW_WALLET = 'NEW_WALLET';
export const NEW_PROFILE = 'NEW_PROFILE';
export const IMPORT_WALLET = 'IMPORT_WALLET';
export const IMPORT_WALLET_LEGALS = 'IMPORT_WALLET_LEGALS';
export const BACKUP_PHRASE = 'BACKUP_PHRASE';
export const BACKUP_PHRASE_VALIDATE = 'BACKUP_PHRASE_VALIDATE';
export const SET_WALLET_PIN_CODE = 'SET_WALLET_PIN_CODE';
export const PIN_CODE_CONFIRMATION = 'PIN_CODE_CONFIRMATION';
export const PERMISSIONS = 'PERMISSIONS';
export const BIOMETRICS_PROMPT = 'BIOMETRICS_PROMPT';
export const WALLET_RECOVERY_OPTIONS = 'WALLET_RECOVERY_OPTIONS';

// PINCODE FLOW
export const AUTH_FLOW = 'AUTH_FLOW';
export const PIN_CODE_UNLOCK = 'PIN_CODE_UNLOCK';
export const FORGOT_PIN = 'FORGOT_PIN';

// SIGNUP/OTP FLOW
export const SIGN_UP_FLOW = 'SIGN_UP_FLOW';
export const WELCOME = 'WELCOME';
export const SIGN_IN = 'SIGN_IN';
export const OTP = 'OTP';
export const OTP_STATUS = 'OTP_STATUS';
export const SIGN_UP = 'SIGN_UP';

// SEND TOKEN FLOW
export const SEND_TOKEN_FROM_ASSET_FLOW = 'SEND_TOKEN_FROM_ASSET_FLOW';
export const SEND_TOKEN_FROM_CONTACT_FLOW = 'SEND_TOKEN_FROM_CONTACT_FLOW';
export const SEND_TOKEN_AMOUNT = 'SEND_TOKEN_AMOUNT';
export const SEND_TOKEN_ASSETS = 'SEND_TOKEN_ASSETS';
export const SEND_TOKEN_CONFIRM = 'SEND_TOKEN_CONFIRM';
export const SEND_TOKEN_TRANSACTION = 'SEND_TOKEN_TRANSACTION';
export const SEND_TOKEN_PIN_CONFIRM = 'SEND_TOKEN_PIN_CONFIRM'; // TODO: consider to extract to a common screen
export const SEND_TOKEN_FROM_HOME_FLOW = 'SEND_TOKEN_FROM_HOME_FLOW';

// PPN SEND TOKEN FLOW
export const PPN_SEND_TOKEN_FROM_ASSET_FLOW = 'PPN_SEND_TOKEN_FROM_ASSET_FLOW';
export const PPN_SEND_TOKEN_AMOUNT = 'PPN_SEND_TOKEN_AMOUNT';

// SEND COLLECTIBLE FLOW
export const SEND_COLLECTIBLE_FROM_ASSET_FLOW = 'SEND_COLLECTIBLE_FROM_ASSET_FLOW';
export const SEND_COLLECTIBLE_CONFIRM = 'SEND_COLLECTIBLE_CONFIRM';

// PEOPLE FLOW
export const CONTACT = 'CONTACT';

// HOME FLOW
export const HOME = 'HOME';
export const HOME_TAB = 'HOME_TAB';

// EXCHANGE FLOW
export const EXCHANGE_FLOW = 'EXCHANGE_FLOW';
export const EXCHANGE = 'EXCHANGE';
export const EXCHANGE_CONFIRM = 'EXCHANGE_CONFIRM';
export const EXCHANGE_INFO = 'EXCHANGE_INFO';

// MANAGE WALLETS FLOW
export const MANAGE_WALLETS_FLOW = 'MANAGE_WALLETS_FLOW';

// MANAGE TANK FLOW
export const TANK_SETTLE_FLOW = 'TANK_SETTLE_FLOW';
export const TANK_FUND_FLOW = 'TANK_FUND_FLOW';
export const TANK_DETAILS = 'TANK_DETAILS';
export const FUND_TANK = 'FUND_TANK';
export const FUND_CONFIRM = 'FUND_CONFIRM';
export const SETTLE_BALANCE = 'SETTLE_BALANCE';
export const SETTLE_BALANCE_CONFIRM = 'SETTLE_BALANCE_CONFIRM';
export const TANK_WITHDRAWAL_FLOW = 'TANK_WITHDRAWAL_FLOW';
export const TANK_WITHDRAWAL = 'TANK_WITHDRAWAL';
export const TANK_WITHDRAWAL_CONFIRM = 'TANK_WITHDRAWAL_CONFIRM';
export const UNSETTLED_ASSETS_FLOW = 'UNSETTLED_ASSETS_FLOW';

// WALLETCONNECT FLOW
export const WALLETCONNECT = 'WALLETCONNECT';
export const WALLETCONNECT_FLOW = 'WALLETCONNECT_FLOW';
export const WALLETCONNECT_SESSION_REQUEST_SCREEN = 'WALLETCONNECT_SESSION_REQUEST_SCREEN';
export const WALLETCONNECT_CALL_REQUEST_SCREEN = 'WALLETCONNECT_CALL_REQUEST_SCREEN';
export const WALLETCONNECT_PIN_CONFIRM_SCREEN = 'WALLETCONNECT_PIN_CONFIRM_SCREEN';
export const EXPLORE_APPS = 'EXPLORE_APPS';

// ME FLOW
export const ME = 'ME';
export const MANAGE_DETAILS_SESSIONS = 'MANAGE_DETAILS_SESSIONS';

// USERS FLOW
export const MANAGE_USERS_FLOW = 'MANAGE_USERS_FLOW';
export const ADD_EDIT_USER = 'ADD_EDIT_USER';

// PPN SEND SYNTHETICS FLOW
export const PPN_SEND_SYNTHETIC_ASSET_FLOW = 'PPN_SEND_SYNTHETIC_ASSET_FLOW';
export const SEND_SYNTHETIC_AMOUNT = 'SEND_SYNTHETIC_AMOUNT';
export const SEND_SYNTHETIC_CONFIRM = 'SEND_SYNTHETIC_CONFIRM';

// RECOVERY PORTAL SETUP FLOW
export const RECOVERY_PORTAL_SETUP_FLOW = 'RECOVERY_PORTAL_SETUP_FLOW';
export const RECOVERY_PORTAL_SETUP_INTRO = 'RECOVERY_PORTAL_SETUP_INTRO';
export const RECOVERY_PORTAL_SETUP_SIGN_UP = 'RECOVERY_PORTAL_SETUP_SIGN_UP';
export const RECOVERY_PORTAL_SETUP_CONNECT_DEVICE = 'RECOVERY_PORTAL_SETUP_CONNECT_DEVICE';
export const RECOVERY_PORTAL_SETUP_COMPLETE = 'RECOVERY_PORTAL_SETUP_COMPLETE';

// RECOVERY PORTAL RECOVERY FLOW
export const RECOVERY_PORTAL_RECOVERY_FLOW = 'RECOVERY_PORTAL_RECOVERY_FLOW';
export const RECOVERY_PORTAL_WALLET_RECOVERY = 'RECOVERY_PORTAL_WALLET_RECOVERY';
export const RECOVERY_PORTAL_WALLET_RECOVERY_INTRO = 'RECOVERY_PORTAL_WALLET_RECOVERY_INTRO';
export const RECOVERY_PORTAL_WALLET_RECOVERY_PENDING = 'RECOVERY_PORTAL_WALLET_RECOVERY_PENDING';
export const RECOVERY_PORTAL_WALLET_RECOVERY_STARTED = 'RECOVERY_PORTAL_WALLET_RECOVERY_STARTED';

// CONNECTED DEVICES
export const CONNECTED_DEVICES_FLOW = 'CONNECTED_DEVICES_FLOW';
export const MANAGE_CONNECTED_DEVICES = 'MANAGE_CONNECTED_DEVICES';
export const REMOVE_SMART_WALLET_CONNECTED_DEVICE = 'REMOVE_SMART_WALLET_CONNECTED_DEVICE';

// MENU FLOW
export const MENU_FLOW = 'MENU_FLOW';
export const WALLET_SETTINGS = 'WALLET_SETTINGS';
export const COMMUNITY_SETTINGS = 'COMMUNITY_SETTINGS';
export const APP_SETTINGS = 'APP_SETTINGS';

// REFER FLOW
export const REFER_FLOW = 'REFER_FLOW';
export const REFERRAL_SENT = 'REFERRAL_SENT';
export const REFERRAL_CONTACT_INFO_MISSING = 'REFERRAL_CONTACT_INFO_MISSING';
export const REFERRAL_INCOMING_REWARD = 'REFERRAL_INCOMING_REWARD';

// LENDING
export const LENDING_ADD_DEPOSIT_FLOW = 'LENDING_ADD_DEPOSIT_FLOW';
export const LENDING_WITHDRAW_DEPOSIT_FLOW = 'LENDING_WITHDRAW_DEPOSIT_FLOW';
export const LENDING_CHOOSE_DEPOSIT = 'LENDING_CHOOSE_DEPOSIT';
export const LENDING_DEPOSITED_ASSETS_LIST = 'LENDING_DEPOSITED_ASSETS_LIST';
export const LENDING_VIEW_DEPOSITED_ASSET = 'LENDING_VIEW_DEPOSITED_ASSET';
export const LENDING_ENTER_DEPOSIT_AMOUNT = 'LENDING_ENTER_DEPOSIT_AMOUNT';
export const LENDING_ENTER_WITHDRAW_AMOUNT = 'LENDING_ENTER_WITHDRAW_AMOUNT';
export const LENDING_DEPOSIT_TRANSACTION_CONFIRM = 'LENDING_DEPOSIT_TRANSACTION_CONFIRM';
export const LENDING_WITHDRAW_TRANSACTION_CONFIRM = 'LENDING_WITHDRAW_TRANSACTION_CONFIRM';

// POOLTOGETHER FLOW
export const POOLTOGETHER_FLOW = 'POOLTOGETHER_FLOW';
export const POOLTOGETHER_DASHBOARD = 'POOLTOGETHER_DASHBOARD';
export const POOLTOGETHER_PURCHASE = 'POOLTOGETHER_PURCHASE';
export const POOLTOGETHER_PURCHASE_CONFIRM = 'POOLTOGETHER_PURCHASE_CONFIRM';
export const POOLTOGETHER_WITHDRAW = 'POOLTOGETHER_WITHDRAW';
export const POOLTOGETHER_WITHDRAW_CONFIRM = 'POOLTOGETHER_WITHDRAW_CONFIRM';

// KEY BASED WALLET ASSET MIGRATION FLOW
export const KEY_BASED_ASSET_TRANSFER_FLOW = 'KEY_BASED_ASSET_TRANSFER_FLOW';
export const KEY_BASED_ASSET_TRANSFER_CHOOSE = 'KEY_BASED_ASSET_TRANSFER_CHOOSE';
export const KEY_BASED_ASSET_TRANSFER_EDIT_AMOUNT = 'KEY_BASED_ASSET_TRANSFER_EDIT_AMOUNT';
export const KEY_BASED_ASSET_TRANSFER_CONFIRM = 'KEY_BASED_ASSET_TRANSFER_CONFIRM';
export const KEY_BASED_ASSET_TRANSFER_UNLOCK = 'KEY_BASED_ASSET_TRANSFER_UNLOCK';
export const KEY_BASED_ASSET_TRANSFER_STATUS = 'KEY_BASED_ASSET_TRANSFER_STATUS';

// CONTACTS
export const CONTACTS_FLOW = 'CONTACTS_FLOW';
export const CONTACTS_LIST = 'CONTACTS_LIST';

// SABLIER_FLOW
export const SABLIER_FLOW = 'SABLIER_FLOW';
export const SABLIER_STREAMS = 'SABLIER_STREAMS';
export const SABLIER_NEW_STREAM = 'SABLIER_NEW_STREAM';
export const SABLIER_NEW_STREAM_REVIEW = 'SABLIER_NEW_STREAM_REVIEW';
export const SABLIER_WITHDRAW = 'SABLIER_WITHDRAW';
export const SABLIER_WITHDRAW_REVIEW = 'SABLIER_WITHDRAW_REVIEW';
export const SABLIER_INCOMING_STREAM = 'SABLIER_INCOMING_STREAM';
export const SABLIER_OUTGOING_STREAM = 'SABLIER_OUTGOING_STREAM';

// SENDWYRE FLOW
export const SENDWYRE_INPUT = 'SENDWYRE_INPUT';
