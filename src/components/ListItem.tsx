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

import { ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'

interface ListItemProps extends PressableProps {
  title: string
  subtitle: string | ReactNode
  icon: ReactNode
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  innerStyle?: StyleProp<ViewStyle>
  hideSeparator?: boolean
  rightSideContent?: ReactNode
  children?: ReactNode
}

const ListItem = ({
  title,
  subtitle,
  icon,
  style,
  innerStyle,
  isLast,
  hideSeparator,
  rightSideContent,
  children,
  ...props
}: ListItemProps) => (
  <Pressable {...props}>
    <ListItemStyled style={style}>
      <Row style={innerStyle}>
        <Icon>{icon}</Icon>
        <ContentRow showSeparator={!isLast && !hideSeparator}>
          <LeftSideContent>
            <Title semiBold size={16} numberOfLines={1}>
              {title}
            </Title>
            {typeof subtitle === 'string' ? <AppText color="secondary">{subtitle}</AppText> : subtitle}
          </LeftSideContent>
          {rightSideContent}
        </ContentRow>
      </Row>
      {children}
    </ListItemStyled>
  </Pressable>
)

export default ListItem

const ListItemStyled = styled(Animated.View)`
  border-radius: 9px;
  border-color: ${({ theme }) => theme.border.primary};
  overflow: hidden;
`

const ContentRow = styled.View<{ showSeparator: boolean }>`
  flex-direction: row;
  gap: 10px;
  flex: 1;
  padding-bottom: 16px;

  ${({ showSeparator }) =>
    showSeparator &&
    css`
      border-bottom-width: 1px;
      border-bottom-color: ${({ theme }) => theme.border.secondary};
    `}
`

const Title = styled(AppText)`
  max-width: 80%;
  flex-shrink: 1;
  margin-bottom: 2px;
`

const Icon = styled.View`
  margin-bottom: 16px;
  margin-top: 2px;
`

const Row = styled(Animated.View)`
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  padding-top: 16px;
`

const LeftSideContent = styled.View`
  flex: 1;
`
