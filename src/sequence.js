import {
  Sequence
} from 'flexio-jshelpers'

var sequence = new Sequence()
export const getNextSequence = () => {
  return sequence.nextID()
}
