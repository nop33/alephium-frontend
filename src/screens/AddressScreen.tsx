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

import { StackScreenProps } from '@react-navigation/stack'
import { Clipboard as ClipboardIcon, QrCode as QrCodeIcon, Star as StarIcon } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import AppText from '../components/AppText'
import Badge from '../components/Badge'
import Button from '../components/buttons/Button'
import HighlightRow from '../components/HighlightRow'
import Screen, { ScreenSection } from '../components/layout/Screen'
import QRCodeModal from '../components/QRCodeModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { updateAddressSettings, selectAddressByHash, selectDefaultAddress } from '../store/addressesSlice'
import { copyAddressToClipboard, getAddressDisplayName } from '../utils/addresses'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddressScreen'>

const AddressScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false)

  if (!address) return null

  const makeAddressMain = async () => {
    if (address.settings.isMain) return

    await dispatch(updateAddressSettings({ address, settings: { ...address.settings, isMain: true } }))
  }

  const isCurrentAddressMain = addressHash === defaultAddress?.hash

  return (
    <Screen>
      <ScrollView>
        <Header>
          <BadgeStyled rounded border color={address.settings.color}>
            <BadgeText>{getAddressDisplayName(address)}</BadgeText>
          </BadgeStyled>
          <Actions>
            <ButtonStyled
              variant="contrast"
              onPress={makeAddressMain}
              disabled={isCurrentAddressMain}
              icon={<StarIcon fill={isCurrentAddressMain ? theme.global.star : theme.bg.tertiary} size={22} />}
            />
            <ButtonStyled
              variant="contrast"
              onPress={() => copyAddressToClipboard(address.hash)}
              icon={<ClipboardIcon color={theme.font.primary} size={20} />}
            />
            <ButtonStyled
              variant="contrast"
              onPress={() => setIsQrCodeModalOpen(true)}
              icon={<QrCodeIcon color={theme.font.primary} size={20} />}
            />
          </Actions>
        </Header>
        <ScreenSection>
          <View>
            <HighlightRow isTopRounded hasBottomBorder>
              <Label>Address</Label>
              <View>
                <AppText>{address.hash.substring(0, 20)}...</AppText>
              </View>
            </HighlightRow>
            <HighlightRow hasBottomBorder>
              <Label>Number of transactions</Label>
              <View>
                <NumberOfTxs>{address.networkData.details.txNumber}</NumberOfTxs>
              </View>
            </HighlightRow>
            <HighlightRow hasBottomBorder>
              <Label>Locked ALPH balance</Label>
              <View>
                <Badge border light>
                  <Amount value={BigInt(address.networkData.details.lockedBalance)} fadeDecimals />
                </Badge>
              </View>
            </HighlightRow>
            <HighlightRow isBottomRounded>
              <Label>Total ALPH balance</Label>
              <View>
                <Badge light>
                  <Amount value={BigInt(address.networkData.details.balance)} fadeDecimals />
                </Badge>
              </View>
            </HighlightRow>
          </View>
        </ScreenSection>
      </ScrollView>
      <QRCodeModal addressHash={address.hash} isOpen={isQrCodeModalOpen} onClose={() => setIsQrCodeModalOpen(false)} />
    </Screen>
  )
}

export default AddressScreen

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin: 40px 20px;
  max-width: 100%;
`

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
`

const ButtonStyled = styled(Button)`
  margin-left: 20px;
`

const Label = styled(AppText)`
  color: ${({ theme }) => theme.font.secondary};
`

const BadgeText = styled(AppText)`
  font-weight: 700;
  font-size: 18px;
`

const NumberOfTxs = styled(AppText)`
  font-weight: 700;
`

const BadgeStyled = styled(Badge)`
  flex-shrink: 1;
`
