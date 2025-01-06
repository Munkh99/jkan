export default class {
  constructor(opts) {
    const years = this._yearsWithCount(opts.datasets, opts.params);
    const yearsMarkup = years.map(TmplListGroupItem);
    setContent(opts.el, yearsMarkup);
    collapseListGroup(opts.el);
    console.log('init year2 filter');
    console.log(years);
  }

  _yearsWithCount(datasets, params) {
    return chain(datasets)
      .groupBy('start_date') // Group datasets by full start_date
      .map((datasetsInYear, startDate) => {
        const filters = createDatasetFilters(pick(params, ['category']));
        const filteredDatasets = filter(datasetsInYear, filters);
        const startDateSlug = slugify(startDate); // Use full date as slug
        const selected = params.start_date && params.start_date === startDateSlug;
        const itemParams = selected
          ? omit(params, 'start_date')
          : defaults({ start_date: startDateSlug }, params);
        return {
          title: startDate, // Display full date
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInYear.length,
          selected: selected,
        };
      })
      .orderBy('unfilteredCount', 'desc') // Order by count
      .value();
  }
}
