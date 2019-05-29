import {Sequence} from '@flexio-oss/js-helpers'

const sequence = new Sequence()
/**
 *
 * @return {string}
 */
export const getNextSequence = () => sequence.nextID()
