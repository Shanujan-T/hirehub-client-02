export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  message?: string;
  link_href?: string | null;
  read_at?: string | null;
  is_read?: boolean;
  created_at: string;
}
