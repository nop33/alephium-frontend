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

import { useState } from 'react'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { NavigationProp, useNavigation } from '@react-navigation/native'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deleteWallet, getStoredWallet, getWalletsMetadata, storedWalletExists } from '~/persistent-storage/wallet'
import { walletDeleted, walletUnlocked, walletsListUpdated } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface WalletDeleteModalProps extends ModalContentProps {
  onDelete: () => void
}

const WalletDeleteModal = ({ onDelete, ...props }: WalletDeleteModalProps) => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const walletName = useAppSelector((s) => s.wallet.name)
  const { resetWalletConnectStorage } = useWalletConnectContext()

  const [inputWalletName, setInputWalletName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteConfirmPress = async () => {
    props.onClose && props.onClose()

    setIsLoading(true)

    try {
      await deleteWallet()

      if (await storedWalletExists()) {
        const newWallet = await getStoredWallet()
        dispatch(walletUnlocked(newWallet))
        dispatch(walletsListUpdated(await getWalletsMetadata()))
        resetNavigation(navigation, 'InWalletTabsNavigation')
      } else {
        onDelete()
        dispatch(walletDeleted())
        resetWalletConnectStorage()
      }

      sendAnalytics({ event: 'Deleted wallet' })
    } catch (error) {
      showExceptionToast(error, 'Error while deleting wallet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ModalContent verticalGap {...props}>
        <ScreenSection>
          <BottomModalScreenTitle>⚠️ Delete &quot;{walletName}&quot;?</BottomModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            Do you really want to delete this wallet from your device?
          </AppText>
          <AppText color="secondary" size={18}>
            You can always restore it later using your secret recovery phrase.
          </AppText>
          <AppText color="secondary" size={18}>
            If so, please enter the wallet name below, and hit the delete button.
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Input label="Wallet name" value={inputWalletName} onChangeText={setInputWalletName} />
        </ScreenSection>
        <ScreenSection>
          <Button
            title="Delete"
            variant="alert"
            onPress={handleDeleteConfirmPress}
            disabled={inputWalletName !== walletName}
            iconProps={{ name: 'trash-outline' }}
          />
        </ScreenSection>
      </ModalContent>
      <SpinnerModal isActive={isLoading} />
    </>
  )
}

export default WalletDeleteModal
