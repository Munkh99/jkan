import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class DataTypeFilter {
  constructor(opts) {
    const dataTypes = this._dataTypesWithCount(opts.datasets, opts.params)
    const dataTypesMarkup = dataTypes.map(TmplListGroupItem)
    setContent(opts.el, dataTypesMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datasets, returns an array of their data types with counts
  _dataTypesWithCount(datasets, params) {
    return chain(datasets)
      .filter('data_type_facet') // Filter datasets with a data_type_facet
      .flatMap((value) => {
        // Explode objects where data_type_facet is an array into one object per data type
        if (typeof value.data_type_facet === 'string') return value
        const duplicates = []
        value.data_type_facet.forEach((dataType) => {
          duplicates.push(defaults({ data_type_facet: dataType }, value)) // Adjust to data_type_facet
        })
        return duplicates
      })
      .groupBy('data_type_facet') // Group by data_type_facet
      .map((datasetsInType, dataType) => {
        const filters = createDatasetFilters(
          pick(params, [
            'data_type_facet',
            'category',
            'collection_name',
            'location',
            'year',
            'location_continent_facet',
            'data_type_facet',
          ])
        ) // Include all relevant filters
        const filteredDatasets = filter(datasetsInType, filters)
        const dataTypeSlug = slugify(dataType)
        const selected = params.data_type_facet && params.data_type_facet === dataTypeSlug // Adjust to data_type_facet
        const itemParams = selected
          ? omit(params, 'data_type_facet') // Adjust to data_type_facet
          : defaults({ data_type_facet: dataTypeSlug }, params) // Adjust to data_type_facet

        return {
          title: dataType,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInType.length,
          selected: selected
        }
      })
      .orderBy('title', 'asc')
      .value()
  }
}
