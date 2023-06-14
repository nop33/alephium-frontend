/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
import { Asset } from '@alephium/sdk'
import { StyleProp, ViewStyle } from 'react-native'

import Amount from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'

interface TokenInfoProps {
  asset: Asset
  isLast?: boolean
  style?: StyleProp<ViewStyle>
}

const TokenInfo = ({ asset, isLast, style }: TokenInfoProps) => (
  <ListItem
    style={style}
    isLast={isLast}
    title={asset.name || asset.id}
    subtitle={<Amount value={BigInt(asset.balance)} medium color="secondary" suffix={asset.symbol} />}
    icon={<AssetLogo assetId={asset.id} size={38} />}
    rightSideContent={<Amount value={BigInt(asset.balance)} fadeDecimals suffix={asset.symbol} bold />}
  />
)

export default TokenInfo
