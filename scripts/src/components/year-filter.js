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
    console.log('init year filter');
  }

  _yearsWithCount (datasets, params) {
    return chain(datasets)
      .groupBy('year') // Group datasets by year
      .map((datasetsInYear, organization) => {
        const filters = createDatasetFilters(pick(params, ['category', 'organization']))
        const filteredDatasets = filter(datasetsInYear, filters)
        const yearSlug = slugify(year)
        const selected = params.year && params.year === yearSlug
        const itemParams = selected ? omit(params, 'year') : defaults({year: yearSlug}, params)
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

