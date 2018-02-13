import {
  AttributeHandler,
  should
} from 'flexio-jshelpers'
import {
  KEY_RECONCILIATE_RULES
} from './constantes'
import {
  RECONCILIATION_RULES
} from './rules'

class ReconciliationAttributeHandler extends AttributeHandler {
  static select(element, scope) {
    return new ReconciliationAttributeHandler(element, scope)
  }

  hasReconciliationRules() {
    return KEY_RECONCILIATE_RULES in this.privateAttribute
  }

  hasReconciliationRule(rule) {
    return this.reconcileRules().indexOf(rule) > -1
  }

  reconcileRules() {
    if (!(KEY_RECONCILIATE_RULES in this.privateAttribute)) {
      this.privateAttribute[KEY_RECONCILIATE_RULES] = this._initReconcileRule()
    }
    return this.privateAttribute[KEY_RECONCILIATE_RULES]
  }

  /**
     * @private
     *@returns {array}
     */
  _initReconcileRule() {
    return []
  }

  /**
     * @param {Array} rules
     */
  addReconcileRules(rules) {
    should(Array.isArray(rules),
      'flexio-nodes-reconciliation:ReconciliationAttributeHandler:addReconcileRules: `rules` argument should be an Array `%s` given',
      typeof element
    )

    for (let i = rules.length - 1; i >= 0; i--) {
      this._addReconcileRule(rules[i])
    }
  }

  /**
     * @private
     * @param {String} rule
     */
  _addReconcileRule(rule) {
    if (this._isAllowedRule(rule) && !this.hasReconciliationRule()) {
      this.reconcileRules().push(rule)
    }
  }
  /**
     * @param {String} rule
     */
  removeReconcileRule(rule) {
    let index = this.reconcileRules().indexOf(rule)
    if (index > -1) {
      this.reconcileRules().splice(index, 1)
    }
  }

  /**
     * @private
     * @param {String} rule
     */
  _isAllowedRule(rule) {
    return rule in RECONCILIATION_RULES
  }
}
export const select = ReconciliationAttributeHandler.select
export {
  ReconciliationAttributeHandler
}
