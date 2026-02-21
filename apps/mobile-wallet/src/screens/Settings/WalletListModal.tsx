/*
Copyright 2018 - 2024 The Alephium Authors
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

import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getStoredWallet, initializeKeyringWithStoredWallet, selectWallet } from '~/persistent-storage/wallet'
import { walletUnlocked } from '~/store/wallet/walletActions'
import { methodSelected } from '~/store/walletGenerationSlice'
import { WalletMetadata } from '~/types/wallet'
import { showExceptionToast } from '~/utils/layout'

interface WalletListModalProps {
  onClose: () => void
}

const WalletListModal = ({ onClose }: WalletListModalProps) => {
  const wallets = useAppSelector((s) => s.wallet.wallets)
  const selectedWalletId = useAppSelector((s) => s.wallet.id)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const handleWalletPress = async (wallet: WalletMetadata) => {
    if (wallet.id === selectedWalletId) return

    try {
      await selectWallet(wallet.id)
      await initializeKeyringWithStoredWallet()
      const newWallet = await getStoredWallet()
      dispatch(walletUnlocked(newWallet))
      onClose()
    } catch (e) {
      console.error(e)
      showExceptionToast(e, 'Could not switch wallet')
    }
  }

  const handleAddWallet = () => {
    onClose()
    dispatch(methodSelected('create'))
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleImportWallet = () => {
    onClose()
    dispatch(methodSelected('import'))
    navigation.navigate('NewWalletIntroScreen')
  }

  return (
    <ModalContent verticalGap>
      <ScreenSection>
        <BottomModalScreenTitle>Wallets</BottomModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        {wallets.map((wallet) => (
          <WalletRow key={wallet.id} onPress={() => handleWalletPress(wallet)}>
            <WalletInfo>
              <AppText bold>{wallet.name}</AppText>
              <AppText size={12} color="secondary">
                {wallet.type}
              </AppText>
            </WalletInfo>
            {wallet.id === selectedWalletId && (
              <Ionicons name="checkmark-circle" size={24} color={theme.global.accent} />
            )}
          </WalletRow>
        ))}
      </ScreenSection>
      <ScreenSection>
        <Button
          title="Create new wallet"
          onPress={handleAddWallet}
          variant="highlight"
          iconProps={{ name: 'add-circle-outline' }}
        />
        <Button title="Import wallet" onPress={handleImportWallet} iconProps={{ name: 'download-outline' }} />
      </ScreenSection>
    </ModalContent>
  )
}

export default WalletListModal

const WalletRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 12px;
  margin-bottom: 8px;
`

const WalletInfo = styled.View`
  flex-direction: column;
`
