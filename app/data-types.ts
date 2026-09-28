export interface DashboardLists {
  budgetCategories: { label: string; amount: number; color: string }[];
  priorityTasks: {
    date: string;
    title: string;
    detail: string;
    type: string;
    priority: string;
  }[];
  vendors: {
    name: string;
    category: string;
    status: string;
    total: string;
    next: string;
    date: string;
  }[];
  studioExtras: {
    kind: string;
    item: string;
    price: string;
    status: string;
    note: string;
  }[];
  studioPrep: {
    audience: string;
    item: string;
    status: string;
    note: string;
  }[];
  timeline: { date: string; title: string; state: string }[];
  honeymoonBookings: {
    kind: string;
    date: string;
    title: string;
    details: { label: string; value: string }[];
  }[];
  honeymoonRoute: { date: string; city: string; plan: string; state: string }[];
}
