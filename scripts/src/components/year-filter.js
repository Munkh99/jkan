import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class {
  constructor(opts) {
    const startDates = this._startDatesWithCount(opts.datasets, opts.params)
    const startDatesMarkup = startDates.map(TmplListGroupItem)
    setContent(opts.el, startDatesMarkup)
    collapseListGroup(opts.el)
    console.log('Start Date Filter Initialized')
    console.log('Start Dates:', startDates)
  }

  _startDatesWithCount(datasets, params) {
    return chain(datasets)
      .groupBy('start_date') // Group datasets by start_date
      .map((datasetsByDate, startDate) => {
        console.log('Datasets for date:', startDate, datasetsByDate)

        const filters = createDatasetFilters(pick(params, ['category']))
        const filteredDatasets = filter(datasetsByDate, filters)
        console.log('Filtered datasets for date:', startDate, filteredDatasets)

        const dateSlug = slugify(startDate)
        const selected = params.start_date && params.start_date === dateSlug
        const itemParams = selected
          ? omit(params, 'start_date')
          : defaults({ start_date: dateSlug }, params)
        return {
          title: startDate, // Display the full start_date
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsByDate.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc') // Sort by dataset count
      .value()
  }
}
