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

import React, { useMemo, useRef } from 'react';
import type { AbstractComponent } from 'react';
import { SafeAreaView, withNavigation } from 'react-navigation';
import styled from 'styled-components/native';
import t from 'translations/translate';

// components
import SlideModal from 'components/Modals/SlideModal';
import Button from 'components/Button';
import { MediumText, BaseText } from 'components/Typography';
import { Spacing } from 'components/Layout';

// constants
import { ACCOUNTS } from 'constants/navigationConstants';

// utils
import { noop } from 'utils/common';

// types
import type { NavigationScreenProp } from 'react-navigation';

export const ACCOUNT_MSG = {
  NO_SW_ACCOUNT: 'NO_SW_ACCOUNT',
  SW_ACCOUNT_NOT_ACTIVE: 'SW_ACCOUNT_NOT_ACTIVE',
};

export type ModalMessage = $Keys<typeof ACCOUNT_MSG>;

type OwnProps = {|
  message: ModalMessage,
|};

type Props = {|
  ...OwnProps,
  navigation: NavigationScreenProp<*>,
|};

type ModalContent = {|
  title: string,
  text: string,
  buttonTitle: string,
  buttonAction: () => void,
|};

const ModalContainer = styled.View`
  padding: 20px 0 40px;
`;

const BuyCryptoAccountWarnModal = ({ message, navigation }: Props) => {
  const modalRef = useRef();
  const {
    title,
    text,
    buttonTitle,
    buttonAction,
  }: ModalContent = useMemo(() => {
    switch (message) {
      case ACCOUNT_MSG.NO_SW_ACCOUNT:
        return {
          title: t('exchangeContent.modal.smartWalletMissing.title'),
          text: t('exchangeContent.modal.smartWalletMissing.paragraph'),
          buttonTitle: t('exchangeContent.modal.smartWalletMissing.button.enable'),
          buttonAction: () => {
            if (modalRef.current) modalRef.current.close();
            // intro screen deprecated, show message only, let user activate manually from home screen
            // navigation.navigate(SMART_WALLET_INTRO);
          },
        };

      case ACCOUNT_MSG.SW_ACCOUNT_NOT_ACTIVE:
        return {
          title: t('exchangeContent.modal.smartWalletIsNotActive.title'),
          text: t('exchangeContent.modal.smartWalletIsNotActive.paragraph'),
          buttonTitle: t('exchangeContent.modal.smartWalletIsNotActive.button.selectAccount'),
          buttonAction: () => {
            if (modalRef.current) modalRef.current.close();
            navigation.navigate(ACCOUNTS);
          },
        };

      default:
        return {
          title: '',
          text: '',
          buttonTitle: '',
          buttonAction: noop,
        };
    }
  }, [message, navigation]);

  return (
    <SlideModal
      ref={modalRef}
      hideHeader
    >
      <SafeAreaView>
        <ModalContainer>
          <React.Fragment>
            <MediumText center medium>{title}</MediumText>
            <Spacing h={20} />
            <BaseText center medium>{text}</BaseText>
            <Spacing h={34} />
            <Button
              secondary
              title={buttonTitle}
              onPress={buttonAction}
            />
          </React.Fragment>
        </ModalContainer>
      </SafeAreaView>
    </SlideModal>
  );
};

export default (withNavigation(BuyCryptoAccountWarnModal): AbstractComponent<OwnProps>);
