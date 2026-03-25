import { StackHeaderProps } from '@react-navigation/stack'
import { useEffect } from 'react'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

type SceneProgress = NonNullable<StackHeaderProps['progress']>

const useSceneProgressSharedValues = (progress?: SceneProgress) => {
  const currentProgress = useSharedValue(0)
  const nextProgress = useSharedValue(0)

  const updateSharedValue = (sharedValue: SharedValue<number>, animatedValue?: SceneProgress['current']) =>
    animatedValue?.addListener(({ value }) => {
      sharedValue.set(value)
    })

  useEffect(() => {
    const animatedCurrentProgress = progress?.current
    const animatedNextProgress = progress?.next

    // Link the Animated interpolations to reanimated shared values
    const currentProgressId = updateSharedValue(currentProgress, animatedCurrentProgress)
    const nextProgressId = updateSharedValue(nextProgress, animatedNextProgress)

    // Clean up listeners on unmount
    return () => {
      if (currentProgressId) animatedCurrentProgress?.removeListener(currentProgressId)
      if (nextProgressId) animatedNextProgress?.removeListener(nextProgressId)
    }
  }, [currentProgress, nextProgress, progress])

  return { currentProgress, nextProgress }
}

export default useSceneProgressSharedValues
