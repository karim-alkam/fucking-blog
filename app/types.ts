export interface NavLink {
  name: string;
  href: string;
}

export interface Post {
  slug: string;
  folder?: string;
  title: string;
  date: string | null;
  description: string;
  draft?: boolean;
  tags?: string[];
  content?: string;
}