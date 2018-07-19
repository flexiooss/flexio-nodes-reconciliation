import {select as $} from './ListenerAttributeHandler'

export class ReconcileNodeProperties {
  /**
   *
   * @param {Node} current
   * @param {Node} candidate
   */
  constructor(current, candidate) {
    /**
     *
     * @type {Node}
     * @private
     */
    this.__current = current
    /**
     *
     * @type {ListenerAttributeHandler}
     * @private
     */
    this.__$current = $(current)

    /**
     *
     * @type {Array<string>}
     * @private
     */
    this.__currentReconcileProperties = null

    /**
     *
     * @type {Node}
     * @private
     */
    this.__candidate = candidate

    /**
     *
     * @type {ListenerAttributeHandler}
     * @private
     */
    this.__$candidate = $(candidate)

    /**
     *
     * @type {Array<string>}
     * @private
     */
    this.__candidateReconcileProperties = null
  }

  /**
   *
   * @return {Array<string>}
   * @private
   */
  get __currentReconcileProperties() {
    if (this.__currentReconcileProperties === null) {
      this.__currentReconcileProperties = this.__$current.reconcileProperties()
    }
    return this.__currentReconcileProperties
  }

  /**
   *
   * @return {Array<string>}
   * @private
   */
  get __candidateReconcileProperties() {
    if (this.__candidateReconcileProperties === null) {
      this.__candidateReconcileProperties = this.__$candidate.reconcileProperties()
    }
    return this.__candidateReconcileProperties
  }

  process() {
    if (!this.__$candidate.hasReconciliationProperties() && !this.__$current.hasReconciliationProperties()) {
      return false
    }

    this.__updateCurrent()
    this.__deleteUnusedProperties()
  }

  /**
   *
   * @private
   */
  __updateCurrent() {
    for (const property of this.__candidateReconcileProperties) {
      this.__current[property] = this.__candidate[property]
    }
  }

  /**
   *
   * @private
   */
  __deleteUnusedProperties() {
    for (const property of this.__currentReconcileProperties) {
      if (!this.__candidate.hasReconciliationProperty(property) && !(property in this.__candidate)) {
        delete this.__current[property]
      }
    }
  }
}
