import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class LocationFilter {
  constructor(opts) {
    const locations = this._continentsWithCount(opts.datasets, opts.params)
    const locationsMarkup = locations.map(TmplListGroupItem)
    setContent(opts.el, locationsMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datasets, returns an array of their locations with counts
  _continentsWithCount(datasets, params) {
    return chain(datasets)
      .filter('location_continent_facet')  // Change to location_continent_facet
      .flatMap((value) => {
        // Explode objects where location_continent_facet is an array into one object per location
        if (typeof value.location_continent_facet === 'string') return value
        const duplicates = []
        value.location_continent_facet.forEach((loc) => {
          duplicates.push(defaults({ location_continent_facet: loc }, value))  // Change here to location_continent_facet
        })
        return duplicates
      }) 
      .groupBy('location_continent_facet')  // Change to location_continent_facet
      .map((datasetsInLoc, location) => {
        const filters = createDatasetFilters(pick(params, ['location_continent_facet']))  // Change to location_continent_facet
        const filteredDatasets = filter(datasetsInLoc, filters)
        const locationSlug = slugify(location)
        const selected = params.location_continent_facet && params.location_continent_facet === locationSlug  // Change to location_continent_facet
        const itemParams = selected
          ? omit(params, 'location_continent_facet')  // Change to location_continent_facet
          : defaults({ location_continent_facet: locationSlug }, params)  // Change to location_continent_facet

        return {
          title: location,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInLoc.length,
          selected: selected
        }
      })
      .orderBy('title', 'asc')
      .value()
  }
}
