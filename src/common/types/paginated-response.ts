export const EMPTY_PAGINATED_RESULTS = {
  results: [],
  page: 1,
  total_pages: 1,
  total_results: 0,
};

export class PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
