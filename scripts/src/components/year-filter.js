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
      .groupBy((dataset) => {
          const titleYearMatch = dataset.title.match(/^\d{4}/); // Extract year from title
          const year = titleYearMatch ? titleYearMatch[0] : '2000'; // Default to 'Unknown' if no match
          return year;

      })
      .map((datasetsByYear, year) => {
        const filters = createDatasetFilters(pick(params, ['category']))
        const filteredDatasets = filter(datasetsByYear, filters)
        const yearSlug = slugify(year.toString()) // Ensure the year is a string
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
      .orderBy(
        [(item) => parseInt(item.title, 10)], // Parse year as a number for proper sorting
        ['desc'] // Sort in ascending order
      )
      .value()
  }
}
