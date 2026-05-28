import { Review } from './review.model';

/** Paginated review list — matches server list responses. */
export interface ReviewListPage {
  reviews: Review[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
