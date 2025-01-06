import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createDatasetFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const years = this._yearsWithCount(opts.datasets, opts.params)
    const yearsMarkup = years.map(TmplListGroupItem)
    setContent(opts.el, yearsMarkup)
    collapseListGroup(opts.el)
    console.log('init year2 filter');
    console.log(years)
  }

  _yearsWithCount (datasets, params) {
    return chain(datasets)
      .groupBy('start_date') // Group datasets by year
      .map((datasetsInYear, year) => {
        const filters = createDatasetFilters(pick(params, ['category']))
        const filteredDatasets = filter(datasetsInYear, filters)
        const yearSlug = slugify(year)
        const selected = params.year && params.year === yearSlug
        const itemParams = selected ? omit(params, 'start_date') : defaults({year: yearSlug}, params)
        return {
          title: year, // display the year
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInYear.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}

