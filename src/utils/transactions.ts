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

import { DUST_AMOUNT, isConsolidationTx, MIN_UTXO_SET_AMOUNT, removeConsolidationChangeAmount } from '@alephium/sdk'
import { Output, Transaction, UnconfirmedTransaction } from '@alephium/sdk/api/explorer'

import { Address, AddressHash } from '@/types/addresses'
import { AssetAmount } from '@/types/tokens'
import { AddressPendingTransaction, AddressTransaction, PendingTransaction } from '@/types/transactions'
import { getAvailableBalance } from '@/utils/addresses'
import { ALPH } from '@/utils/constants'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

export const hasOnlyOutputsWith = (outputs: Output[], addresses: Address[]): boolean =>
  outputs.every((o) => o?.address && addresses.map((a) => a.hash).indexOf(o.address) >= 0)

export const calculateUnconfirmedTxSentAmount = (tx: UnconfirmedTransaction, address: AddressHash): bigint => {
  if (!tx.inputs || !tx.outputs) throw 'Missing transaction details'

  const totalOutputAmount = tx.outputs.reduce((acc, output) => acc + BigInt(output.attoAlphAmount), BigInt(0))

  if (isConsolidationTx(tx)) return removeConsolidationChangeAmount(totalOutputAmount, tx.outputs)

  const totalOutputAmountOfAddress = tx.outputs.reduce(
    (acc, output) => (output.address === address ? acc + BigInt(output.attoAlphAmount) : acc),
    BigInt(0)
  )

  return totalOutputAmount - totalOutputAmountOfAddress
}

// It can currently only take care of sending transactions.
// See: https://github.com/alephium/explorer-backend/issues/360
export const convertUnconfirmedTxToPendingTx = (
  tx: UnconfirmedTransaction,
  fromAddress: AddressHash
): PendingTransaction => {
  if (!tx.outputs) throw 'Missing transaction details'

  const amount = calculateUnconfirmedTxSentAmount(tx, fromAddress).toString()
  const toAddress = tx.outputs[0].address

  if (!fromAddress) throw new Error('fromAddress is not defined')
  if (!toAddress) throw new Error('toAddress is not defined')

  return {
    hash: tx.hash,
    fromAddress,
    toAddress,
    // No other reasonable way to know when it was sent, so using the lastSeen is the best approximation
    timestamp: tx.lastSeen,
    type: 'transfer',
    amount,
    status: 'pending'
  }
}

export const expectedAmount = (data: { fromAddress: Address; alphAmount?: string }, fees: bigint): bigint => {
  const amountInPhi = BigInt(data.alphAmount ?? 0)
  const amountIncludingFees = amountInPhi + fees
  const exceededBy = amountIncludingFees - getAvailableBalance(data.fromAddress)
  const expectedAmount = exceededBy > 0 ? getAvailableBalance(data.fromAddress) - exceededBy : amountInPhi

  return expectedAmount
}

export const extractNewTransactionHashes = (
  incomingTransactions: Transaction[],
  existingTransactions: Transaction['hash'][]
): Transaction['hash'][] =>
  incomingTransactions
    .filter((newTx) => !existingTransactions.some((existingTx) => existingTx === newTx.hash))
    .map((tx) => tx.hash)

export const getTransactionsOfAddress = (transactions: Transaction[], address: Address) =>
  transactions.filter(
    (tx) =>
      tx.inputs?.some((input) => input.address === address.hash) ||
      tx.outputs?.some((output) => output.address === address.hash)
  )

export const getAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is { id: string; amount: bigint } => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const dustAmount = DUST_AMOUNT * BigInt(tokens.length)
  const attoAlphAmount = (alphAmount + dustAmount).toString()

  return {
    attoAlphAmount,
    tokens
  }
}
