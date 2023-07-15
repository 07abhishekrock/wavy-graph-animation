import { useEffect, useMemo, useState } from 'react'
import { bisector } from 'd3-array'
import { newData, oldData, uncompressedNewData } from './data'

const FRAME_COUNT = 15;

const findClosestElementAndInterpolate = (
  elementToFindPositionFor,
  arrayToFindPositionIn,
  bisect
) => {
  const closestMatchingIndex = bisect(
    arrayToFindPositionIn,
    elementToFindPositionFor,
    0,
    arrayToFindPositionIn.length - 1
  ) // can fit a different max value from usage

  const rightClosest = arrayToFindPositionIn[closestMatchingIndex]

  const leftClosest =
    closestMatchingIndex === 0
      ? // very rare this condition is satisfied -> must be user error (mostly)
        arrayToFindPositionIn[0]
      : arrayToFindPositionIn[closestMatchingIndex - 1]

  if (
    leftClosest[0] === elementToFindPositionFor ||
    rightClosest[0] === elementToFindPositionFor
  ) {
    return null
  }

  const slope =
    (rightClosest[1] - leftClosest[1]) / (rightClosest[0] - leftClosest[0])

  const constantInEq = slope * leftClosest[0] - leftClosest[1]
  const yElement = slope * elementToFindPositionFor - constantInEq

  return {
    indexToInsertAt: closestMatchingIndex,
    coords: [elementToFindPositionFor, yElement]
  }
}

const findDiff = (dataPoints1, dataPoints2) => {
  const longerArray =
    dataPoints1.length > dataPoints2.length ? dataPoints1 : dataPoints2
  const smallerArray =
    dataPoints1.length > dataPoints2.length ? dataPoints2 : dataPoints1
  const bisect = bisector((d) => d[0]).right
  const smallArrayInsertions = []
  const longArrayInsertions = []
  const xIndexMaintainedForSmallerArr = []
  const xIndexMaintainedForLongerArr = []

  for (let i = 0; i < longerArray.length; i++) {
    const elementFromSmallerArray = smallerArray[i] ?? [undefined, undefined]
    const elementFromLongerArray = longerArray[i]

    if (elementFromSmallerArray[0] !== elementFromLongerArray[0]) {
      // timestamps are different
      // let's recreate a timestamp for both the values in their counter array
      // let's first do for the smaller array

      if ( elementFromSmallerArray[0] !== undefined ) {
        const smallInLongArray = findClosestElementAndInterpolate(
          elementFromSmallerArray[0],
          longerArray,
          bisect
        )

        if (smallInLongArray) {
          longArrayInsertions.push(smallInLongArray)
          xIndexMaintainedForSmallerArr.push(elementFromSmallerArray[0])
        }
      }

        const longInSmallArray = findClosestElementAndInterpolate(
          elementFromLongerArray[0],
          smallerArray,
          bisect
        )

        if (longInSmallArray) {
          smallArrayInsertions.push(longInSmallArray)
          xIndexMaintainedForLongerArr.push(elementFromLongerArray[0])
        }
    }
  }

  let newSmallArray = [...smallerArray]

  for (let j = 0; j < smallArrayInsertions.length; j++) {
    const finalIndexToInsertAt = smallArrayInsertions[j].indexToInsertAt + j
    newSmallArray = [
      ...newSmallArray.slice(0, finalIndexToInsertAt),
      smallArrayInsertions[j].coords,
      ...newSmallArray.slice(finalIndexToInsertAt)
    ]
  }

  let newlongArray = [...longerArray]

  for (let j = 0; j < longArrayInsertions.length; j++) {
    const finalIndexToInsertAt = longArrayInsertions[j].indexToInsertAt + j
    newlongArray = [
      ...newlongArray.slice(0, finalIndexToInsertAt),
      longArrayInsertions[j].coords,
      ...newlongArray.slice(finalIndexToInsertAt)
    ]
  }

  console.log(
    longArrayInsertions.length,
    smallArrayInsertions.length,
    dataPoints1.length,
    dataPoints2.length
  )

  const fromIsMoreThanTo = dataPoints2.length > dataPoints1.length
  return {
    from: fromIsMoreThanTo ? newlongArray : newSmallArray,
    to: fromIsMoreThanTo ? newSmallArray : newlongArray
  }
}

const convertDataPointsToPath = (array) => {
  return array.reduce((pathString, [x, y], index) => {
    if (index === 0) {
      return pathString.concat(`M${x.toFixed(3)},${y.toFixed(3)}`)
    }
    return pathString.concat(`L${x.toFixed(3)},${y.toFixed(3)}`)
  }, '')
}

const interpolatedAnimation = (from, to, callback, count) => {
  const timeout = requestAnimationFrame(() => {
    callback(
      from.map((fromVal, index) => {
        const toVal = to[index]
        const animatedYIndex =
          ((toVal[1] - fromVal[1]) / FRAME_COUNT) * count + fromVal[1]
        return [fromVal[0], animatedYIndex]
      })
    )

    return () => clearTimeout(timeout)
  })
}

const App = () => {
  console.time('start')
  const value = useMemo(() => findDiff(oldData, newData), [])
  console.timeEnd('start')
  const [count, setCount] = useState(0)
  const [path, setPath] = useState(convertDataPointsToPath(oldData))

  useEffect(() => {
    return interpolatedAnimation(
      value.to,
      value.from,
      (mypath) => {
        if (count < FRAME_COUNT) {
          setCount((count) => count + 1)
          setPath(convertDataPointsToPath(mypath))
        }

				if(count === FRAME_COUNT){
          setPath(convertDataPointsToPath(uncompressedNewData))
				}

      },
      count
    )
  }, [count, value])

  return (
    <div>
      <svg width={360} height={150} fill="transparent">
        <path stroke="red" d={path} />
      </svg>
		<button onClick={()=>setCount(0)}>Click Me To restart</button>
    </div>
  )
}

export default App
