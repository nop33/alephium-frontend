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

import { AddressBalance } from '@alephium/sdk/api/explorer'

import { Currency } from './settings'

export interface TokenWorth {
  price?: number
  currency: Currency
}

export const ALEPHIUM_TOKEN_ID = '0'

export type AddressToken = {
  id: string
  balances: AddressBalance
  worth?: TokenWorth
}

export type TokenMetadata = {
  name: string
  description: string
  image: string
  symbol: string
  decimals: number
}

export type TokensMetadataMap = {
  [key: string]: TokenMetadata
}
