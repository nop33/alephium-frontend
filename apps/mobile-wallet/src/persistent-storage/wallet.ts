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

import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  keyring,
  mnemonicJsonStringifiedObjectToUint8Array
} from '@alephium/keyring'
import { AddressHash, resetArray } from '@alephium/shared'
import * as SecureStore from 'expo-secure-store'
import { nanoid } from 'nanoid'

import { sendAnalytics } from '~/analytics'
import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { defaultBiometricsConfig } from '~/persistent-storage/config'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import {
  deleteSecurelyWithReportableError,
  deleteWithReportableError,
  getSecurelyWithReportableError,
  getWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'
import { AddressMetadataWithHash } from '~/types/addresses'
import {
  DeprecatedWalletMetadata,
  DeprecatedWalletState,
  GeneratedWallet,
  WalletMetadata,
  WalletStoredState,
  WalletType
} from '~/types/wallet'
import { getRandomLabelColor } from '~/utils/colors'
import { storeContacts } from './contacts'

const PIN_WALLET_STORAGE_KEY = 'wallet-pin'
const BIOMETRICS_WALLET_STORAGE_KEY = 'wallet-biometrics'
const WALLET_METADATA_STORAGE_KEY_LEGACY = 'wallet-metadata'
const WALLETS_METADATA_STORAGE_KEY = 'wallets-metadata'
const SELECTED_WALLET_ID_STORAGE_KEY = 'selected-wallet-id'
const IS_NEW_WALLET = 'is-new-wallet'
const MNEMONIC_V2_LEGACY = 'wallet-mnemonic-v2'
const ADDRESS_PUB_KEY_PREFIX = 'address-pub-key-'
const ADDRESS_PRIV_KEY_PREFIX = 'address-priv-key-'

const getMnemonicStorageKey = (walletId: string) => `wallet-mnemonic-${walletId}`

const migrateToMultiWallet = async () => {
  const walletsMetadataRaw = await getWithReportableError(WALLETS_METADATA_STORAGE_KEY)
  if (walletsMetadataRaw) return // Already migrated

  const legacyMetadataStr = await getWithReportableError(WALLET_METADATA_STORAGE_KEY_LEGACY)
  if (!legacyMetadataStr) return // No legacy wallet

  const legacyMetadata = JSON.parse(legacyMetadataStr)

  // Extract contacts
  if (legacyMetadata.contacts && legacyMetadata.contacts.length > 0) {
    await storeContacts(legacyMetadata.contacts)
  }

  // Create new metadata
  const newMetadata: WalletMetadata = {
    id: legacyMetadata.id,
    name: legacyMetadata.name,
    type: 'mnemonic',
    isMnemonicBackedUp: legacyMetadata.isMnemonicBackedUp,
    addresses: legacyMetadata.addresses
  }

  // Store new metadata list
  await storeWithReportableError(WALLETS_METADATA_STORAGE_KEY, JSON.stringify([newMetadata]))

  // Store selected wallet ID
  await storeWithReportableError(SELECTED_WALLET_ID_STORAGE_KEY, newMetadata.id)

  // Migrate mnemonic
  const legacyMnemonic = await getSecurelyWithReportableError(MNEMONIC_V2_LEGACY, false, '')
  if (legacyMnemonic) {
     await storeSecurelyWithReportableError(getMnemonicStorageKey(newMetadata.id), legacyMnemonic, true, '')
     await deleteSecurelyWithReportableError(MNEMONIC_V2_LEGACY, false, '')
  }

  // Delete legacy metadata
  await deleteWithReportableError(WALLET_METADATA_STORAGE_KEY_LEGACY)
}

const storeWalletsMetadata = async (wallets: WalletMetadata[]) => {
  await storeWithReportableError(WALLETS_METADATA_STORAGE_KEY, JSON.stringify(wallets))
}

const storeWalletMnemonic = async (walletId: string, mnemonic: Uint8Array) =>
  storeSecurelyWithReportableError(getMnemonicStorageKey(walletId), JSON.stringify(mnemonic), true, '')

export const getWalletsMetadata = async (): Promise<WalletMetadata[]> => {
  await migrateToMultiWallet()
  const rawMetadata = await getWithReportableError(WALLETS_METADATA_STORAGE_KEY)
  return rawMetadata ? JSON.parse(rawMetadata) : []
}

export const selectWallet = async (walletId: string) => {
  await storeWithReportableError(SELECTED_WALLET_ID_STORAGE_KEY, walletId)
  keyring.clear()
}

export const addWalletMetadata = async (metadata: WalletMetadata) => {
  const wallets = await getWalletsMetadata()
  wallets.push(metadata)
  await storeWalletsMetadata(wallets)
}

const generateWalletMetadata = (name: string, firstAddressHash: string, isMnemonicBackedUp = false, type: WalletType = 'mnemonic'): WalletMetadata => ({
  id: nanoid(),
  name,
  type,
  isMnemonicBackedUp,
  addresses: [
    {
      index: 0,
      hash: firstAddressHash,
      isDefault: true,
      color: getRandomLabelColor()
    }
  ]
})

export const generateAndStoreWallet = async (
  name: WalletStoredState['name'],
  mnemonicToImport?: string,
  type: WalletType = 'mnemonic'
): Promise<GeneratedWallet> => {
  const isMnemonicBackedUp = !!mnemonicToImport

  try {
    const mnemonicUint8Array = mnemonicToImport
      ? keyring.importMnemonicString(mnemonicToImport)
      : keyring.generateRandomMnemonic()

    // Generate an ID for the wallet by creating metadata
    // We need a dummy address hash first, but to generate address we need seed.
    // Wait, generateAndStoreAddressKeypairForIndex uses keyring.
    // If keyring is initialized with NEW mnemonic, it works.

    // Initialize keyring with the NEW mnemonic temporarily
    // Warning: this clears previous keyring state.
    keyring.clear()
    keyring.initFromDecryptedMnemonic(mnemonicUint8Array, '')

    const firstAddressHash = await generateAndStoreAddressKeypairForIndex(0)
    const walletMetadata = generateWalletMetadata(name, firstAddressHash, isMnemonicBackedUp, type)

    await storeWalletMnemonic(walletMetadata.id, mnemonicUint8Array)
    await addWalletMetadata(walletMetadata)
    await selectWallet(walletMetadata.id)

    return {
      id: walletMetadata.id,
      name,
      type,
      isMnemonicBackedUp,
      firstAddress: {
        index: 0,
        hash: firstAddressHash
      }
    }
  } finally {
    keyring.clear()
  }
}

export const getWalletMetadata = async (): Promise<WalletMetadata | null> => {
  await migrateToMultiWallet()
  const selectedId = await getWithReportableError(SELECTED_WALLET_ID_STORAGE_KEY)
  if (!selectedId) return null

  const wallets = await getWalletsMetadata()
  const wallet = wallets.find(w => w.id === selectedId)

  if (!wallet && wallets.length > 0) {
    // Fallback if selected ID is invalid but wallets exist
    await selectWallet(wallets[0].id)
    return wallets[0]
  }

  return wallet || null
}

export const getStoredWallet = async (error?: string): Promise<WalletMetadata> => {
  const walletMetadata = await getWalletMetadata()

  if (!walletMetadata) throw new Error(error || 'Could not get stored wallet: metadata not found')

  return walletMetadata
}

export const updateStoredWalletMetadata = async (partialMetadata: Partial<WalletMetadata>) => {
  const currentWallet = await getStoredWallet('Could not persist wallet metadata, no entry found in storage')
  const updatedWallet = { ...currentWallet, ...partialMetadata }

  const wallets = await getWalletsMetadata()
  const index = wallets.findIndex(w => w.id === updatedWallet.id)

  if (index !== -1) {
    wallets[index] = updatedWallet
    await storeWalletsMetadata(wallets)
  }
}

export interface GetDeprecatedStoredWalletProps {
  forcePinUsage?: boolean
  authenticationPrompt?: SecureStore.SecureStoreOptions['authenticationPrompt']
}

export const getDeprecatedStoredWallet = async (
  props?: GetDeprecatedStoredWalletProps
): Promise<DeprecatedWalletState | null> => {
  // Check legacy metadata directly without migration loop
  const rawMetadata = await getWithReportableError(WALLET_METADATA_STORAGE_KEY_LEGACY)
  if (!rawMetadata) {
    return null
  }
  const metadata = JSON.parse(rawMetadata)

  const { id, name, isMnemonicBackedUp } = metadata
  const usesBiometrics = await loadBiometricsSettings()

  let mnemonic: string | null = null

  if (!props?.forcePinUsage && usesBiometrics) {
    mnemonic = await SecureStore.getItemAsync(
      BIOMETRICS_WALLET_STORAGE_KEY,
      props?.authenticationPrompt
        ? {
            ...defaultBiometricsConfig,
            authenticationPrompt: props.authenticationPrompt
          }
        : defaultBiometricsConfig
    )
  }

  if (!mnemonic) {
    mnemonic = await getSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, '')
  }

  return mnemonic
    ? ({
        id,
        name,
        type: 'mnemonic',
        mnemonic,
        isMnemonicBackedUp
      } as DeprecatedWalletState)
    : null
}

export const deleteWallet = async () => {
  const currentWallet = await getStoredWallet()

  await deleteSecurelyWithReportableError(getMnemonicStorageKey(currentWallet.id), true, '')

  for (const address of currentWallet.addresses) {
    await deleteAddressPublicKey(address.hash)
    await deleteAddressPrivateKey(address.hash)
  }

  const wallets = await getWalletsMetadata()
  const remainingWallets = wallets.filter(w => w.id !== currentWallet.id)

  if (remainingWallets.length === 0) {
    await deleteFundPassword()
    await deleteWithReportableError(IS_NEW_WALLET)
    await deleteWithReportableError(SELECTED_WALLET_ID_STORAGE_KEY)
    await deleteWithReportableError(WALLETS_METADATA_STORAGE_KEY)
  } else {
    await storeWalletsMetadata(remainingWallets)
    await selectWallet(remainingWallets[0].id)
  }
}

export const persistAddressesMetadata = async (walletId: string, addressesMetadata: AddressMetadataWithHash[]) => {
  const walletMetadata = await getStoredWallet('Could not persist addresses metadata, wallet metadata not found')

  for (const metadata of addressesMetadata) {
    const addressIndex = walletMetadata.addresses.findIndex((data) => data.index === metadata.index)

    if (addressIndex >= 0) {
      walletMetadata.addresses.splice(addressIndex, 1, metadata)
    } else {
      walletMetadata.addresses.push(metadata)
    }

    console.log(`💽 Storing address index ${metadata.index} metadata in persistent storage`)
  }

  await updateStoredWalletMetadata(walletMetadata)
}

export const getIsNewWallet = async (): Promise<boolean | undefined> =>
  (await getWithReportableError(IS_NEW_WALLET)) === 'true'

export const storeIsNewWallet = async (isNew: boolean) => storeWithReportableError(IS_NEW_WALLET, isNew.toString())

export const deleteDeprecatedWallet = async () => {
  await deleteSecurelyWithReportableError(PIN_WALLET_STORAGE_KEY, true, '')

  try {
    await SecureStore.deleteItemAsync(BIOMETRICS_WALLET_STORAGE_KEY, defaultBiometricsConfig)
  } catch (error) {
    sendAnalytics({ type: 'error', message: `Could not delete ${BIOMETRICS_WALLET_STORAGE_KEY} from secure storage` })
    throw error
  }
}

export const migrateDeprecatedMnemonic = async (deprecatedMnemonic: string) => {
  // Step 1: Store mnemonic as Uint8Array in secure store without authentication required (as per Uniswap)
  const mnemonicUint8Array = keyring.importMnemonicString(deprecatedMnemonic)

  try {
    // We need to store it for the current wallet.
    // Ensure migration has run (so metadata exists)
    await migrateToMultiWallet()
    const currentWallet = await getStoredWallet('Could not migrate address metadata, wallet metadata not found')

    await storeWalletMnemonic(currentWallet.id, mnemonicUint8Array)

    // Step 2: Delete old mnemonic records
    await deleteDeprecatedWallet()

    // Step 3: Add hash in address metadata for faster app unlock and store public and private key in secure store
    const { addresses } = currentWallet
    const updatedAddressesMetadata: AddressMetadataWithHash[] = []

    // Temporarily init keyring to generate keys
    keyring.clear()
    keyring.initFromDecryptedMnemonic(mnemonicUint8Array, '')

    for (const address of addresses) {
      const { hash, publicKey } = keyring.generateAndCacheAddress({ addressIndex: address.index })
      let privateKey = keyring.exportPrivateKeyOfAddress(hash)

      await storeAddressPublicKey(hash, publicKey)
      await storeAddressPrivateKey(hash, privateKey)

      privateKey = ''

      updatedAddressesMetadata.push({
        ...address,
        hash
      })
    }

    await updateStoredWalletMetadata({ addresses: updatedAddressesMetadata })
  } finally {
    keyring.clear()
  }
}

export const storedWalletExists = async (): Promise<boolean> => {
    await migrateToMultiWallet()
    const wallets = await getWalletsMetadata()
    return wallets.length > 0
}

export const dangerouslyExportWalletMnemonic = async (): Promise<string> => {
  const currentWallet = await getStoredWallet()
  const decryptedMnemonic = await getSecurelyWithReportableError(getMnemonicStorageKey(currentWallet.id), true, '')

  if (!decryptedMnemonic) throw new Error('Could not export mnemonic: could not find stored wallet')

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))

  return dangerouslyConvertUint8ArrayMnemonicToString(parsedDecryptedMnemonic)
}

export const getAddressAsymetricKey = async (addressHash: AddressHash, keyType: 'public' | 'private') => {
  const storageKey = (keyType === 'public' ? ADDRESS_PUB_KEY_PREFIX : ADDRESS_PRIV_KEY_PREFIX) + addressHash
  let key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

  if (!key) {
    const { addresses } = await getStoredWallet(`Could not get address ${keyType} key, wallet metadata not found`)
    const address = addresses.find((address) => address.hash === addressHash)

    if (!address) throw new Error(`Could not get address ${keyType} key, address metadata not found`)

    await generateAndStoreAddressKeypairForIndex(address.index)
    key = await getSecurelyWithReportableError(storageKey, false, `Could not get ${keyType} from secure storage`)

    if (!key) throw new Error(`Could not generate address ${keyType} key`)
  }

  return key
}

export const storeWalletMetadataDeprecated = async (metadata: DeprecatedWalletMetadata) =>
  storeWithReportableError(WALLET_METADATA_STORAGE_KEY_LEGACY, JSON.stringify(metadata))


const storeAddressPublicKey = async (addressHash: AddressHash, publicKey: string) =>
  storeSecurelyWithReportableError(
    ADDRESS_PUB_KEY_PREFIX + addressHash,
    publicKey,
    false,
    'Could not store address public key'
  )

const storeAddressPrivateKey = async (addressHash: AddressHash, privateKey: string) => {
  storeSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    privateKey,
    false,
    'Could not store address private key'
  )

  privateKey = ''
}

const deleteAddressPublicKey = async (addressHash: AddressHash) =>
  deleteSecurelyWithReportableError(ADDRESS_PUB_KEY_PREFIX + addressHash, false, 'Could not delete address public key')

const deleteAddressPrivateKey = async (addressHash: AddressHash) =>
  deleteSecurelyWithReportableError(
    ADDRESS_PRIV_KEY_PREFIX + addressHash,
    false,
    'Could not delete address private key'
  )

const generateAndStoreAddressKeypairForIndex = async (addressIndex: number): Promise<AddressHash> => {
  try {
    if (!keyring.isInitialized()) await initializeKeyringWithStoredWallet()

    const { hash, publicKey } = keyring.generateAndCacheAddress({ addressIndex })
    let privateKey = keyring.exportPrivateKeyOfAddress(hash)

    await storeAddressPublicKey(hash, publicKey)
    await storeAddressPrivateKey(hash, privateKey)

    privateKey = ''

    return hash
  } finally {
    // keyring.clear()
  }
}

export const initializeKeyringWithStoredWallet = async () => {
  const currentWallet = await getStoredWallet()
  let decryptedMnemonic = await getSecurelyWithReportableError(getMnemonicStorageKey(currentWallet.id), true, '')
  if (!decryptedMnemonic) throw new Error('Could not initialize keyring: could not find stored wallet')

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}
