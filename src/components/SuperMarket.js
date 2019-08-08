import React from 'react';
import SuperMarketTemplate from './SuperMarketTemplate';
import ShopItemList from './ShopItemList';


const SuperMarket = () => {
  return <SuperMarketTemplate items={<ShopItemList />} basket={null} />;
};

export default SuperMarket;