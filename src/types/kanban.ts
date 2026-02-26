export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  tags: string[];
  createdAt: string;
  color?: string;
  storyPoints?: number; // Optional story points / effort estimate
  checklist?: {
    id: string;
    text: string;
    checked: boolean;
  }[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  cardIds: string[];
  limit?: number; // Optional WIP limit
  color?: string; // Optional column color
  isCollapsed?: boolean; // Whether the column is collapsed
  sortOrder?: 'none' | 'priority-asc' | 'priority-desc' | 'due-date-asc' | 'due-date-desc' | 'created-asc' | 'created-desc';
}

export interface KanbanBoard {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  columnOrder: string[];
  name?: string; // Optional board name
}

export type CardDragStart = {
  cardId: string;
  fromColumnId: string;
  index: number;
};

export type PriorityColor = {
  [key in KanbanCard['priority']]: string;
};

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
  cardData: Omit<KanbanCard, 'id' | 'createdAt'>;
}

// Define categories for better template organization
export const TEMPLATE_CATEGORIES = [
  'Task',
  'Bug',
  'Feature',
  'Documentation',
  'Meeting',
  'Other'
]; 