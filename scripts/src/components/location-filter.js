import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class LocationFilter {
  constructor(opts) {
    const locations = this._locationsWithCount(opts.datasets, opts.params)
    const locationsMarkup = locations.map(TmplListGroupItem)
    setContent(opts.el, locationsMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datasets, returns an array of their locations with counts
  _locationsWithCount(datasets, params) {
    return chain(datasets)
      .filter('location')
      .flatMap((value) => {
        // Explode objects where location is an array into one object per location
        if (typeof value.location === 'string') return value
        const duplicates = []
        value.location.forEach((loc) => {
          duplicates.push(defaults({ location: loc }, value))
        })
        return duplicates
      }) 
      .groupBy('location')
      .map((datasetsInLoc, location) => {
        const filters = createDatasetFilters(pick(params, ['location']))
        const filteredDatasets = filter(datasetsInLoc, filters)
        const locationSlug = slugify(location)
        const selected = params.location && params.location === locationSlug
        const itemParams = selected
          ? omit(params, 'location')
          : defaults({ location: locationSlug }, params)

        return {
          title: location,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInLoc.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
