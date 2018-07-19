export const KEY_ROOT = Symbol('__FNR__')
export const KEY_EVENT_WRAPPER = Symbol('__F__events')
export const KEY_RECONCILIATE_RULES = Symbol('__F__reconciliation_rules')
export const KEY_RECONCILIATE_PROPERTIES = Symbol('__F__reconciliation_properties')

var SEQUENCE = 0
/**
 *
 * @return {number}
 */
export const getNextSequence = () => {
  SEQUENCE++
  return SEQUENCE
}
