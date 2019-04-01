import {Sequence} from 'flexio-jshelpers'

const sequence = new Sequence()
/**
 *
 * @return {string}
 */
export const getNextSequence = () => sequence.nextID()
