import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class CollectionFilter {
  constructor(opts) {
    const collections = this._collectionsWithCount(opts.datasets, opts.params)
    const collectionsMarkup = collections.map(TmplListGroupItem)
    setContent(opts.el, collectionsMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datasets, returns an array of their collection names with counts
  _collectionsWithCount(datasets, params) {
    return chain(datasets)
      .filter('collection_name')
      .flatMap((value) => {
        // Explode objects where collection_name is an array into one object per collection_name
        if (typeof value.collection_name === 'string') return value
        const duplicates = []
        value.collection_name.forEach((name) => {
          duplicates.push(defaults({ collection_name: name }, value))
        })
        return duplicates
      })
      .groupBy('collection_name')
      .map((datasetsInCollection, collectionName) => {
        const filters = createDatasetFilters(pick(params, ['organization']))
        const filteredDatasets = filter(datasetsInCollection, filters)
        const collectionSlug = slugify(collectionName)
        const selected = params.collection_name && params.collection_name === collectionSlug
        const itemParams = selected
          ? omit(params, 'collection_name')
          : defaults({ collection_name: collectionSlug }, params)

        return {
          title: collectionName,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInCollection.length,
          selected: selected
        }
      })
      .orderBy('title', 'asc')
      .value()
  }
}
