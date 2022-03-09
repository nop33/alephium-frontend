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

import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import logoDarkSrc from '../images/explorer-logo-dark.svg'
import logoLightSrc from '../images/explorer-logo-light.svg'
import { deviceBreakPoints } from '../style/globalStyles'
import NetworkSwitch from './NetworkSwitch'
import SearchBar from './SearchBar'

interface AppHeaderProps {
  className?: string
}

const AppHeader = ({ className }: AppHeaderProps) => {
  const theme = useTheme()

  return (
    <header className={className}>
      <StyledLogoLink to="/">
        <Logo alt="alephium" src={theme.name === 'light' ? logoLightSrc : logoDarkSrc} />
      </StyledLogoLink>
      <SearchBar />
      <StyledNetworkSwitch direction="down" />
    </header>
  )
}

export default styled(AppHeader)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px min(5vw, 50px);
  gap: 5vw;
  border-bottom: 1px solid ${({ theme }) => theme.borderSecondary};
  box-shadow: ${({ theme }) => theme.shadowTertiary};
`

const StyledLogoLink = styled(Link)`
  @media ${deviceBreakPoints.mobile} {
    width: 30px;
    overflow: hidden;
  }
`

const Logo = styled.img`
  width: 130px;

  @media ${deviceBreakPoints.mobile} {
    width: 100px;
  }
`

const StyledNetworkSwitch = styled(NetworkSwitch)`
  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`
