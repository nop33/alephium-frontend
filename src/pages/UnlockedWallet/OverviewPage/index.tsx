/*
Copyright 2018 - 2023 The Alephium Authors
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

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import Box from '@/components/Box'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import { TableHeader } from '@/components/Table'
import TransactionList from '@/components/TransactionList'
import { useAppSelector } from '@/hooks/redux'
import AddressesContactsList from '@/pages/UnlockedWallet/OverviewPage/AddressesContactsList'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import AssetsList from '@/pages/UnlockedWallet/OverviewPage/AssetsList'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'

const OverviewPage = () => {
  const { t } = useTranslation()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  const [showChart, setShowChart] = useState(false)

  return (
    <motion.div {...fadeIn} onAnimationComplete={() => setShowChart(true)} onAnimationStart={() => setShowChart(false)}>
      <UnlockedWalletPanel top>
        <WalletNameRow>
          <Tagline>{t('Current wallet')}</Tagline>
          <WalletName>{activeWalletName}</WalletName>
        </WalletNameRow>
      </UnlockedWalletPanel>
      <AmountsOverviewPanel showChart={showChart}>
        <Shortcuts>
          <ShortcutsHeader title={t('Shortcuts')} />
          <ButtonsGrid>
            <ShortcutButtons send receive lock walletSettings analyticsOrigin="overview_page" />
          </ButtonsGrid>
        </Shortcuts>
      </AmountsOverviewPanel>
      <UnlockedWalletPanel bottom>
        <AssetAndAddressesRow>
          <AssetsListStyled />
          <AddressesContactsListStyled limit={5} />
        </AssetAndAddressesRow>
        <TransactionList title={t('Latest transactions')} limit={5} />
      </UnlockedWalletPanel>
    </motion.div>
  )
}

export default OverviewPage

const AssetAndAddressesRow = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 100px;
`

const AssetsListStyled = styled(AssetsList)`
  flex: 2;
`

const AddressesContactsListStyled = styled(AddressesContactsList)`
  flex: 1;
`

const WalletNameRow = styled.div``

const WalletName = styled.div`
  font-size: 32px;
  font-weight: var(--fontWeight-semiBold);
`

const Tagline = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.font.tertiary};
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  z-index: 1;
  background-color: ${({ theme }) => theme.border.primary};
`

const ShortcutsHeader = styled(TableHeader)`
  height: 50px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background-color: ${({ theme }) => theme.bg.primary};
`
