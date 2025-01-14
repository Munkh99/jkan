import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createDatasetFilters, collapseListGroup} from '../util'

export default class {
    constructor(opts) {
        const dataTypes = this._dataTypesWithCount(opts.datasets, opts.params)
        const dataTypesMarkup = dataTypes.map(TmplListGroupItem)
        setContent(opts.el, dataTypesMarkup)
        collapseListGroup(opts.el)
    }

    _dataTypesWithCount(datasets, params) {
        return chain(datasets)
            .groupBy('data_type_facet') // Group by the 'data_type_facet' column
            .map(function (datasetsInType, dataType) {
                const filters = createDatasetFilters(pick(params, [['category', 'collection_name', 'location', 'location_continent_facet', 'year', 'data_type_facet','duration']])) // Include other filters if needed
                const filteredDatasets = filter(datasetsInType, filters)
                const typeSlug = slugify(dataType)
                const selected = params.data_type_facet && params.data_type_facet === typeSlug
                const itemParams = selected ? omit(params, 'data_type_facet') : defaults({data_type_facet: typeSlug}, params)
                return {
                    title: dataType,
                    url: '?' + $.param(itemParams),
                    count: filteredDatasets.length,
                    unfilteredCount: datasetsInType.length,
                    selected: selected
                }
            })
            .orderBy('title', 'asc') // Order by title alphabetically
            .value()
    }
}
