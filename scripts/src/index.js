/* global settings */
import 'core-js/actual'
import $ from 'jquery'
import 'bootstrap/js/dist/collapse'

import DatasetsList from './components/datasets-list'
import CategoriesFilter from './components/categories-filter'
import OrganizationsFilter from './components/organizations-filter'
import CollectionsFilter from './components/collections-filter'
import LocationFilter from './components/location-filter'
import YearFilter from './components/year-filter'
import LocationContinentFilter from './components/location-continent-filter'
import DurationFilter from './components/durations-filter'
import DataTypeFilter from './components/data-type-filter'
import DatasetDisplay from './components/dataset-display'
import {queryByComponent} from './util'

const urlSearchParams = new URLSearchParams(window.location.search)
const params = {}
urlSearchParams.forEach((value, key) => {
  params[key] = value
})

// Helper function to ensure datasets.json is only fetched once per page
let datasetsCache
function getDatasets () {
  datasetsCache = datasetsCache || $.getJSON(`${settings.BASE_URL}/datasets.json`)
  return datasetsCache
}

// Check for these components on the page and initialize them
const components = [
  {tag: 'dataset-display', class: DatasetDisplay},
  {tag: 'datasets-list', class: DatasetsList, usesDatasets: true},
  {tag: 'categories-filter', class: CategoriesFilter, usesDatasets: true},
  {tag: 'organizations-filter', class: OrganizationsFilter, usesDatasets: true},
  {tag: 'collections-filter', class: CollectionsFilter, usesDatasets: true},
  {tag: 'location-filter', class: LocationFilter, usesDatasets: true},
  {tag: 'year-filter', class: YearFilter, usesDatasets: true},
  {tag: 'location-continent-filter', class: LocationContinentFilter, usesDatasets: true},
  {tag: 'duration-filter', class: DurationFilter, usesDatasets: true},
  {tag: 'data-type-filter', class: DataTypeFilter, usesDatasets: true}
]
for (let component of components) {
  const els = queryByComponent(component.tag)
  if (els.length) {
    // If the component depends on datasets.json, fetch it first (once per page) and pass it
    if (component.usesDatasets) {
      getDatasets().then((datasets) => {
        els.each((index, el) => new component.class({el: $(el), params, datasets})) // eslint-disable-line
      })
    // Otherwise simply initialize the component
    } else {
      els.each((index, el) => new component.class({el: $(el), params})) // eslint-disable-line
    }
  }
}
