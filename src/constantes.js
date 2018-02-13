export const KEY_ROOT = '__FNR__'
export const KEY_EVENT_WRAPPER = 'events'
export const KEY_RECONCILIATE_RULES = 'reconciliateRules'

var SEQUENCE = 0
export const getNextSequence = () => {
  SEQUENCE++
  return SEQUENCE
}
