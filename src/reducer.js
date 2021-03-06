import { combineReducers } from "redux";
import { createSelector } from "reselect";
import * as d3 from "d3";

const defaultDataState = {
    medals: null,
    population: null,
    gdp: null
};

// data reducer
const dataReducer = function(state = defaultDataState, action) {
    switch (action.type) {
        case "GOT_MEDALS":
            return { ...state, medals: action.data };
        case "GOT_POPULATION":
            return { ...state, population: action.data };
        case "GOT_GDP":
            return { ...state, gdp: action.data };
        default:
            return state;
    }
};

const defaultMetaState = {
    loading: false,
    error: null,
    currentYear: null,
    years: null
};

// meta reducer
const metaReducer = function(state = defaultMetaState, action) {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true };
        case "ERROR":
            return { ...state, error: action.error };
        case "GOT_MEDALS":
            return {
                ...state,
                years: [...new Set(action.data.map(d => d.year))].sort(
                    (a, b) => a - b
                )
            };
        default:
            return state;
    }
};

// all medals selector
export const allMedalsSelector = createSelector(
    state => state.data.medals,
    medals => medals || []
);

export const medalsSelector = createSelector(state => {
    const { data: { medals }, meta: { currentYear } } = state;
    return currentYear ? medals.filter(d => d.year === currentYear) : medals;
}, medals => medals || []);

export const medalsPerCountrySelector = createSelector(
    medalsSelector,
    medals => {
        let medalsPerCountry = {};
        medals.forEach(medal => {
            medalsPerCountry[medal.country] = [
                ...(medalsPerCountry[medal.country] || []),
                medal
            ];
        });
        return medalsPerCountry;
    }
);

// gdp selector
export const gdpSelector = state => state.data.gdp;
// max gdp

// population
export const populationSelector = state => state.data.population;
// max population

// all data loaded selector
export const allDataLoadedSelector = createSelector(
    allMedalsSelector,
    gdpSelector,
    populationSelector,
    (medals, gdp, population) => medals && gdp && population
);

export const yearsSelector = state => state.meta.years || [];

// min year
export const minYearSelector = createSelector(yearsSelector, years =>
    d3.min(years)
);
// max year
export const maxYearSelector = createSelector(yearsSelector, years =>
    d3.max(years)
);

// medals per country

export const countryGdp = (state, needle) => {
    let val = gdpSelector(state).find(({ country }) => country === needle);
    if (!val) {
        val = gdpSelector(state).find(({ noc }) => noc === needle);
    }

    return val ? val.gdp : 0;
};

export const countryPopulation = (state, needle) => {
    let val = populationSelector(state).find(
        ({ country }) => country === needle
    );
    if (!val) {
        val = populationSelector(state).find(({ noc }) => noc === needle);
    }

    return val ? val.population : 0;
};

const rootReducer = combineReducers({
    data: dataReducer,
    meta: metaReducer
});

export default rootReducer;
