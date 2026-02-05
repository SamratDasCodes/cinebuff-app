import { FilterParams, Mood } from "./constants";

export function parseSearchParams(searchParams: { [key: string]: string | string[] | undefined }): FilterParams {
    const params: FilterParams = {
        moods: [],
        languages: [],
        userKeywords: [],
        year: undefined,
        includeAdult: false,
        runtime: 'all',
        minRating: 0,
        watchProviders: [],
        sortBy: 'primary_release_date.desc',
        mediaMode: 'movie', // Default, but usually overridden by route
        page: 1,
        query: ''
    };

    if (!searchParams) return params;

    // Helper to get string
    const get = (key: string) => {
        const val = searchParams[key];
        return Array.isArray(val) ? val[0] : val;
    };

    // Arrays (comma separated)
    const moods = get('moods');
    if (moods) params.moods = moods.split(',') as Mood[];

    const langs = get('languages');
    if (langs) params.languages = langs.split(',');

    const keywords = get('keywords');
    if (keywords) params.userKeywords = keywords.split(',');

    const providers = get('providers');
    if (providers) params.watchProviders = providers.split(',');

    // Accessibility / Toggles
    const adult = get('include_adult');
    if (adult === 'true') params.includeAdult = true;

    // Numbers
    const year = get('year');
    if (year && !isNaN(parseInt(year))) params.year = parseInt(year);

    const rating = get('min_rating');
    if (rating && !isNaN(parseFloat(rating))) params.minRating = parseFloat(rating);

    const page = get('page');
    if (page && !isNaN(parseInt(page))) params.page = parseInt(page);

    // Strings
    const runtime = get('runtime');
    if (runtime && ['all', 'short', 'medium', 'long'].includes(runtime)) {
        params.runtime = runtime as any;
    }

    const sort = get('sort_by');
    if (sort) params.sortBy = sort;

    const query = get('q');
    if (query) params.query = query;

    return params;
}

export function createUrlString(pathname: string, params: Partial<FilterParams>): string {
    const searchParams = new URLSearchParams();

    if (params.moods && params.moods.length > 0) searchParams.set('moods', params.moods.join(','));
    if (params.languages && params.languages.length > 0) searchParams.set('languages', params.languages.join(','));
    if (params.userKeywords && params.userKeywords.length > 0) searchParams.set('keywords', params.userKeywords.join(','));
    if (params.watchProviders && params.watchProviders.length > 0) searchParams.set('providers', params.watchProviders.join(','));

    if (params.includeAdult) searchParams.set('include_adult', 'true');
    if (params.year) searchParams.set('year', params.year.toString());
    if (params.minRating && params.minRating > 0) searchParams.set('min_rating', params.minRating.toString());

    if (params.runtime && params.runtime !== 'all') searchParams.set('runtime', params.runtime);
    if (params.sortBy && params.sortBy !== 'primary_release_date.desc') searchParams.set('sort_by', params.sortBy);

    if (params.query) searchParams.set('q', params.query);
    if (params.page && params.page > 1) searchParams.set('page', params.page.toString());

    const str = searchParams.toString();
    return str ? `${pathname}?${str}` : pathname;
}
