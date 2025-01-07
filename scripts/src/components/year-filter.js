import $ from 'jquery'
import { chain, pick, omit, filter, defaults } from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import { setContent, slugify, createDatasetFilters, collapseListGroup } from '../util'

export default class {
  constructor(opts) {
    const years = this._yearsWithCount(opts.datasets, opts.params)
    const yearsMarkup = years.map(TmplListGroupItem)
    setContent(opts.el, yearsMarkup)
    collapseListGroup(opts.el)
  }

  _yearsWithCount(datasets, params) {
    return chain(datasets)
      .groupBy((dataset) => new Date(dataset.start_date).getFullYear()) // Group datasets by the year of start_date
      .map((datasetsByYear, year) => {
        console.log('Datasets for year:', dataset.title)
        const yearMatch = title.match(/^\d{4}/);

        if (yearMatch) {
          console.log('Extracted year:', yearMatch[0]);
        } else {
          console.log('No year found in title');
        }

        const filters = createDatasetFilters(pick(params, ['category']))
        const filteredDatasets = filter(datasetsByYear, filters)
        console.log('Filtered datasets for year:', year, filteredDatasets)

        const yearSlug = slugify(year.toString()) // Make sure the year is a string
        const selected = params.year && params.year === yearSlug
        const itemParams = selected
          ? omit(params, 'year')
          : defaults({ year: yearSlug }, params)
        return {
          title: year, // Display just the year
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsByYear.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc') // Sort by dataset count
      .value()
  }
}
