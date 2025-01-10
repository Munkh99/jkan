import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class DurationFilter {
  constructor(opts) {
    const durations = this._durationsWithCount(opts.datasets, opts.params)
    const durationsMarkup = durations.map(TmplListGroupItem)
    setContent(opts.el, durationsMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datasets, returns an array of their durations with counts
  _durationsWithCount(datasets, params) {
    return chain(datasets)
      .filter('duration_facet') // Filter datasets with a duration_facet
      .flatMap((value) => {
        // Explode objects where duration_facet is an array into one object per duration
        if (typeof value.duration_facet === 'string') return value
        const duplicates = []
        value.duration_facet.forEach((duration) => {
          duplicates.push(defaults({ duration_facet: duration }, value)) // Adjust to duration_facet
        })
        return duplicates
      })
      .groupBy('duration_facet') // Group by duration_facet
      .map((datasetsInDuration, duration) => {
        const filters = createDatasetFilters(pick(params, ['duration_facet'])) // Adjust to duration_facet
        const filteredDatasets = filter(datasetsInDuration, filters)
        const durationSlug = slugify(duration)
        const selected = params.duration_facet && params.duration_facet === durationSlug // Adjust to duration_facet
        const itemParams = selected
          ? omit(params, 'duration_facet') // Adjust to duration_facet
          : defaults({ duration_facet: durationSlug }, params) // Adjust to duration_facet

        return {
          title: duration,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInDuration.length,
          selected: selected
        }
      })
      .orderBy('title', 'asc')
      .value()
  }
}
