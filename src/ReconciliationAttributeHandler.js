import {AttributeHandler} from 'flexio-hyperflex'
import {assert} from 'flexio-jshelpers'
import {
  KEY_RECONCILIATE_RULES
} from './constantes'
import {
  RECONCILIATION_RULES
} from './rules'

class ReconciliationAttributeHandler extends AttributeHandler {
  /**
   * @static
   * @param {Node} element
   * @return {ReconciliationAttributeHandler}
   */
  static select(element) {
    return new ReconciliationAttributeHandler(element)
  }

  /**
   *
   * @return {boolean}
   */
  hasReconciliationRules() {
    return KEY_RECONCILIATE_RULES in this.privateAttribute
  }

  /**
   *
   * @param rule
   * @return {boolean}
   */
  hasReconciliationRule(rule) {
    return this.reconcileRules().indexOf(rule) > -1
  }

  /**
   *
   * @return {string[] | array}
   */
  reconcileRules() {
    if (!(KEY_RECONCILIATE_RULES in this.privateAttribute)) {
      this.privateAttribute[KEY_RECONCILIATE_RULES] = this._initReconcileRule()
    }
    return this.privateAttribute[KEY_RECONCILIATE_RULES]
  }

  /**
   * @private
   * @return {array}
   */
  _initReconcileRule() {
    return []
  }

  /**
   * @param {string[]} rules
   */
  addReconcileRules(rules) {
    assert(Array.isArray(rules),
      'flexio-nodes-reconciliation:ReconciliationAttributeHandler:addReconcileRules: `rules` argument assert be an Array `%s` given',
      typeof element
    )

    for (let i = rules.length - 1; i >= 0; i--) {
      this._addReconcileRule(rules[i])
    }
  }

  /**
   * @private
   * @param {string} rule
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
   * @return {boolean}
   */
  _isAllowedRule(rule) {
    return rule in RECONCILIATION_RULES
  }
}

export const select = ReconciliationAttributeHandler.select
export {
  ReconciliationAttributeHandler
}
