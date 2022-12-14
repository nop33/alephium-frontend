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

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  changeActiveWallet,
  deleteWalletById,
  disableBiometrics,
  enableBiometrics,
  storePartialWalletMetadata
} from '../storage/wallets'
import { ActiveWalletState, GeneratedWallet } from '../types/wallet'
import { appBecameInactive, appReset } from './actions'
import { RootState } from './store'
import { loadingFinished, loadingStarted } from './walletGenerationSlice'

const sliceName = 'activeWallet'

const initialState: ActiveWalletState = {
  name: '',
  mnemonic: '',
  isMnemonicBackedUp: false, // TODO: Change to undefined
  metadataId: '',
  authType: undefined
}

export const biometricsToggled = createAsyncThunk(
  `${sliceName}/biometricsEnabled`,
  async (
    payload: {
      enable: boolean
      metadataId?: ActiveWalletState['metadataId']
    },
    { getState, dispatch }
  ) => {
    const { enable, metadataId } = payload

    dispatch(loadingStarted())

    const state = getState() as RootState
    const id = metadataId || state.activeWallet.metadataId

    if (!id) throw 'Could not enable biometrics, active wallet metadata ID not found'

    if (enable) {
      await enableBiometrics(id, state.activeWallet.mnemonic)
    } else {
      await disableBiometrics(id)
    }

    dispatch(loadingFinished())

    return enable
  }
)

export const mnemonicBackedUp = createAsyncThunk(
  `${sliceName}/mnemonicBackedUp`,
  async (payload: ActiveWalletState['isMnemonicBackedUp'], { getState, dispatch }) => {
    const isMnemonicBackedUp = payload

    const state = getState() as RootState
    const metadataId = state.activeWallet.metadataId

    if (!metadataId) throw 'Could not store isMnemonicBackedUp, metadataId is not set'

    dispatch(loadingStarted())

    await storePartialWalletMetadata(metadataId, { isMnemonicBackedUp })

    dispatch(loadingFinished())

    return payload
  }
)

export const activeWalletChanged = createAsyncThunk(
  `${sliceName}/activeWalletChanged`,
  async (payload: ActiveWalletState, { dispatch }) => {
    const { metadataId } = payload
    if (!metadataId) throw 'Could not change active wallet, metadataId is not set'

    dispatch(loadingStarted())

    await changeActiveWallet(metadataId)

    dispatch(loadingFinished())

    return payload
  }
)

export const deleteActiveWallet = createAsyncThunk(
  `${sliceName}/deleteActiveWallet`,
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState
    const metadataId = state.activeWallet.metadataId

    if (!metadataId) throw 'Could not change active wallet, metadataId is not set'

    dispatch(loadingStarted())

    await deleteWalletById(metadataId)

    dispatch(loadingFinished())
  }
)

const resetState = () => initialState

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletFlushed: () => initialState,
    newWalletGenerated: (_, action: PayloadAction<GeneratedWallet>) => {
      const { name, mnemonic, metadataId, isMnemonicBackedUp } = action.payload

      return {
        name,
        mnemonic,
        authType: 'pin',
        metadataId,
        isMnemonicBackedUp
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(activeWalletChanged.fulfilled, (_, action) => action.payload)
      .addCase(mnemonicBackedUp.fulfilled, (state, action) => {
        state.isMnemonicBackedUp = action.payload
      })
      .addCase(biometricsToggled.fulfilled, (state, action) => {
        const biometricsEnabled = action.payload
        state.authType = biometricsEnabled ? 'biometrics' : 'pin'
      })
      .addCase(appBecameInactive, resetState)
      .addCase(deleteActiveWallet.fulfilled, resetState)
      .addCase(appReset, resetState)
  }
})

export const { walletFlushed, newWalletGenerated } = activeWalletSlice.actions

export default activeWalletSlice
