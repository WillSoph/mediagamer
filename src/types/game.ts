export type Game = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  release_date: string | null;
  developer_id?: string | null;
  game_publisher_id?: string | null;
  review_count: number;
  score_average: number | null;
  score_weighted: number | null;
  created_at: string;
  updated_at: string;
};