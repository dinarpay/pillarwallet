// @flow
import { UPDATE_COLLECTIBLES } from 'constants/collectiblesConstants';
import { saveDbAction } from './dbActions';

export const fetchCollectiblesAction = () => {
  return async (dispatch: Function, getState: Function, api: Object) => {
    const { wallet: { data: wallet } } = getState();

    const collectibles = await api.fetchCollectibles(wallet.address);

    collectibles.assets.forEach((collectible) => {
      if (collectible.name === null) collectible.name = `${collectible.assetContract} ${collectible.id}`;
    });

    console.log('collectibles ---->', collectibles);

    if (collectibles && collectibles.assets && collectibles.categories) {
      dispatch(saveDbAction('collectibles', { collectibles }, true));
      dispatch({ type: UPDATE_COLLECTIBLES, payload: collectibles });
    }
  };
};
