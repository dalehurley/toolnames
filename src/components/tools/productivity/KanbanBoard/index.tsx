import { useState, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  KanbanBoard as KanbanBoardType,
  KanbanCard,
  KanbanColumn,
  CardTemplate,
} from "@/types/kanban";
import Column from "./Column";
import Card from "./Card";
import NewCardForm from "./NewCardForm";
import BoardHeader, { FilterOptions } from "./BoardHeader";
import { BoardStats } from "./BoardStats";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import { TemplateManager } from "./TemplateManager";

// Initial data for an empty Kanban board
const initialData: KanbanBoardType = {
  columns: [
    { id: "todo", title: "To Do", cardIds: [] },
    { id: "in-progress", title: "In Progress", cardIds: [], limit: 3 },
    { id: "done", title: "Done", cardIds: [] },
  ],
  cards: {},
  columnOrder: ["todo", "in-progress", "done"],
};

// Sample data for a populated board (for demo purposes)
const sampleData: KanbanBoardType = {
  columns: [
    {
      id: "todo",
      title: "To Do",
      cardIds: ["card-1", "card-2", "card-3"],
    },
    {
      id: "in-progress",
      title: "In Progress",
      cardIds: ["card-4", "card-5"],
      limit: 3,
    },
    {
      id: "done",
      title: "Done",
      cardIds: ["card-6"],
    },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Create project plan",
      description: "Define project scope, objectives, and timeline",
      priority: "high",
      tags: ["planning", "important"],
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    "card-2": {
      id: "card-2",
      title: "Design user interface",
      description: "Create wireframes and mockups for the application",
      priority: "medium",
      tags: ["design", "ui"],
      createdAt: new Date().toISOString(),
    },
    "card-3": {
      id: "card-3",
      title: "Set up database schema",
      description: "Design and implement the database structure",
      priority: "medium",
      tags: ["database", "backend"],
      createdAt: new Date().toISOString(),
    },
    "card-4": {
      id: "card-4",
      title: "Implement authentication",
      description: "Add user login and registration functionality",
      priority: "high",
      tags: ["security", "backend"],
      createdAt: new Date().toISOString(),
      assignee: "Jane Doe",
    },
    "card-5": {
      id: "card-5",
      title: "Create navigation component",
      description: "Build responsive navigation bar with dropdown menus",
      priority: "low",
      tags: ["frontend", "ui"],
      createdAt: new Date().toISOString(),
      assignee: "John Smith",
      checklist: [
        { id: "check-1", text: "Desktop layout", checked: true },
        { id: "check-2", text: "Mobile menu", checked: false },
        { id: "check-3", text: "Dropdown animations", checked: false },
      ],
    },
    "card-6": {
      id: "card-6",
      title: "Set up CI/CD pipeline",
      description: "Configure automated testing and deployment workflows",
      priority: "medium",
      tags: ["devops", "automation"],
      createdAt: new Date().toISOString(),
      assignee: "Alex Johnson",
    },
  },
  columnOrder: ["todo", "in-progress", "done"],
};

// Add sample templates for initial usage
const sampleTemplates: CardTemplate[] = [
  {
    id: "template-bug",
    name: "Bug Report",
    description: "Template for reporting bugs",
    category: "Bug",
    cardData: {
      title: "Fix Bug: [Issue]",
      description:
        "## Description\nA clear description of the bug\n\n## Steps to Reproduce\n1. Step 1\n2. Step 2\n\n## Expected Behavior\nWhat should happen\n\n## Current Behavior\nWhat actually happens",
      priority: "high",
      tags: ["bug", "fix"],
    },
  },
  {
    id: "template-feature",
    name: "Feature Request",
    description: "Template for new feature development",
    category: "Feature",
    cardData: {
      title: "Implement: [Feature]",
      description:
        "## Feature Description\nA clear description of the new feature\n\n## Acceptance Criteria\n- [ ] Criteria 1\n- [ ] Criteria 2\n\n## Additional Notes\nAny other relevant information",
      priority: "medium",
      tags: ["feature", "enhancement"],
    },
  },
  {
    id: "template-task",
    name: "General Task",
    description: "Template for regular tasks",
    category: "Task",
    cardData: {
      title: "Task: [Description]",
      description:
        "## Objective\nWhat needs to be done\n\n## Details\nMore information about the task\n\n## Resources\nLinks or references",
      priority: "medium",
      tags: ["task"],
    },
  },
  {
    id: "template-meeting",
    name: "Meeting Notes",
    description: "Template for meeting action items",
    category: "Meeting",
    cardData: {
      title: "Meeting: [Topic]",
      description:
        "## Action Items\n- [ ] Action 1\n- [ ] Action 2\n\n## Attendees\n- Person 1\n- Person 2\n\n## Date\n[Meeting Date]",
      priority: "low",
      tags: ["meeting", "action-item"],
    },
  },
];

const KanbanBoard = () => {
  const [board, setBoard] = useState<KanbanBoardType>(initialData);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    priorities: ["low", "medium", "high"],
    tags: [],
  });
  const [showStats, setShowStats] = useState(false);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Initialize local storage or use sample data
  useEffect(() => {
    const savedBoard = localStorage.getItem("kanban-board");
    if (savedBoard) {
      setBoard(JSON.parse(savedBoard));
    }

    // Load templates from localStorage
    const savedTemplates = localStorage.getItem("kanban-templates");
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save to local storage whenever board changes
  useEffect(() => {
    if (Object.keys(board.cards).length > 0) {
      localStorage.setItem("kanban-board", JSON.stringify(board));
    }
  }, [board]);

  // Save templates to localStorage when they change
  useEffect(() => {
    localStorage.setItem("kanban-templates", JSON.stringify(templates));
  }, [templates]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle the start of a drag operation
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if we're dragging a column
    if (board.columnOrder.includes(activeId)) {
      setActiveColumn(activeId);
      return;
    }

    // Otherwise we're dragging a card
    const cardId = activeId;
    const card = board.cards[cardId];
    setActiveCard(card);
  };

  // Handle drag over event (when a card is dragged over a column)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the columns containing the active and over ids
    let activeColumn: KanbanColumn | undefined;
    for (const column of board.columns) {
      if (column.cardIds.includes(activeId)) {
        activeColumn = column;
        break;
      }
    }

    let overColumn: KanbanColumn | undefined;
    const isOverColumn = board.columnOrder.includes(overId);
    if (isOverColumn) {
      overColumn = board.columns.find((col) => col.id === overId);
    } else {
      for (const column of board.columns) {
        if (column.cardIds.includes(overId)) {
          overColumn = column;
          break;
        }
      }
    }

    if (!activeColumn || !overColumn) return;

    // Don't do anything if we're dragging over the same column
    if (activeColumn.id === overColumn.id && !isOverColumn) return;

    // Check if exceeding WIP limit for the target column
    if (
      overColumn.limit &&
      overColumn.cardIds.length >= overColumn.limit &&
      activeColumn.id !== overColumn.id
    ) {
      // Don't allow moving to this column
      return;
    }

    setBoard((prev) => {
      const activeColumnIndex = prev.columns.findIndex(
        (col) => col.id === activeColumn!.id
      );
      const overColumnIndex = prev.columns.findIndex(
        (col) => col.id === overColumn!.id
      );

      const updatedColumns = [...prev.columns];

      // Remove from original column
      updatedColumns[activeColumnIndex] = {
        ...updatedColumns[activeColumnIndex],
        cardIds: updatedColumns[activeColumnIndex].cardIds.filter(
          (id) => id !== activeId
        ),
      };

      // If dragging over a column, add to the end
      if (isOverColumn) {
        updatedColumns[overColumnIndex] = {
          ...updatedColumns[overColumnIndex],
          cardIds: [...updatedColumns[overColumnIndex].cardIds, activeId],
        };
      } else {
        // Find the index of the card being dragged over
        const overCardIndex =
          updatedColumns[overColumnIndex].cardIds.indexOf(overId);

        // Insert at the correct position
        const newCardIds = [...updatedColumns[overColumnIndex].cardIds];
        newCardIds.splice(overCardIndex + 1, 0, activeId);

        updatedColumns[overColumnIndex] = {
          ...updatedColumns[overColumnIndex],
          cardIds: newCardIds,
        };
      }

      return {
        ...prev,
        columns: updatedColumns,
      };
    });
  };

  // Handle end of drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      setActiveColumn(null);
      return;
    }

    // Check if we're handling column reordering
    if (activeColumn) {
      const activeColumnId = active.id as string;
      const overColumnId = over.id as string;

      // If the column was dropped in the same position, do nothing
      if (activeColumnId === overColumnId) {
        setActiveColumn(null);
        return;
      }

      // Reorder the columns
      setBoard((prev) => {
        const oldIndex = prev.columnOrder.indexOf(activeColumnId);
        const newIndex = prev.columnOrder.indexOf(overColumnId);

        const newColumnOrder = [...prev.columnOrder];
        newColumnOrder.splice(oldIndex, 1);
        newColumnOrder.splice(newIndex, 0, activeColumnId);

        return {
          ...prev,
          columnOrder: newColumnOrder,
        };
      });
    }

    setActiveCard(null);
    setActiveColumn(null);
  };

  // Add a new card
  const handleAddCard = (cardData: Omit<KanbanCard, "id" | "createdAt">) => {
    if (!targetColumn) return;

    const newCardId = `card-${nanoid(6)}`;
    const newCard: KanbanCard = {
      ...cardData,
      id: newCardId,
      createdAt: new Date().toISOString(),
    };

    setBoard((prev) => {
      const columnIndex = prev.columns.findIndex(
        (col) => col.id === targetColumn
      );
      if (columnIndex === -1) return prev;

      const updatedColumns = [...prev.columns];
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        cardIds: [...updatedColumns[columnIndex].cardIds, newCardId],
      };

      return {
        ...prev,
        columns: updatedColumns,
        cards: {
          ...prev.cards,
          [newCardId]: newCard,
        },
      };
    });

    setShowAddCard(false);
    setTargetColumn(null);
  };

  // Delete a card
  const handleDeleteCard = (cardId: string) => {
    setBoard((prev) => {
      const updatedColumns = prev.columns.map((column) => ({
        ...column,
        cardIds: column.cardIds.filter((id) => id !== cardId),
      }));

      // Create new cards object without the deleted card
      const remainingCards = { ...prev.cards };
      delete remainingCards[cardId];

      return {
        ...prev,
        columns: updatedColumns,
        cards: remainingCards,
      };
    });
  };

  // Edit a card
  const handleEditCard = (cardId: string, updatedCard: Partial<KanbanCard>) => {
    setBoard((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        [cardId]: {
          ...prev.cards[cardId],
          ...updatedCard,
        },
      },
    }));
  };

  // Add a new column
  const handleAddColumn = (title: string) => {
    const newColumnId = `column-${nanoid(6)}`;

    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, { id: newColumnId, title, cardIds: [] }],
      columnOrder: [...prev.columnOrder, newColumnId],
    }));
  };

  // Delete a column
  const handleDeleteColumn = (columnId: string) => {
    setBoard((prev) => {
      // Get the column to be removed
      const columnToRemove = prev.columns.find((col) => col.id === columnId);
      if (!columnToRemove) return prev;

      // Get card IDs to remove
      const cardIdsToRemove = columnToRemove.cardIds;

      // Remove the column from columns array
      const updatedColumns = prev.columns.filter((col) => col.id !== columnId);

      // Remove the column from columnOrder
      const updatedColumnOrder = prev.columnOrder.filter(
        (id) => id !== columnId
      );

      // Remove the cards from the cards object
      const updatedCards = { ...prev.cards };
      cardIdsToRemove.forEach((cardId) => {
        delete updatedCards[cardId];
      });

      return {
        columns: updatedColumns,
        columnOrder: updatedColumnOrder,
        cards: updatedCards,
      };
    });
  };

  // Edit a column
  const handleEditColumn = (
    columnId: string,
    title: string,
    limit?: number,
    color?: string
  ) => {
    setBoard((prev) => {
      const updatedColumns = prev.columns.map((column) =>
        column.id === columnId ? { ...column, title, limit, color } : column
      );

      return {
        ...prev,
        columns: updatedColumns,
      };
    });
  };

  // Load sample data
  const handleLoadSampleData = () => {
    setBoard(sampleData);
    localStorage.setItem("kanban-board", JSON.stringify(sampleData));

    // If no templates exist yet, load the sample templates
    if (templates.length === 0) {
      setTemplates(sampleTemplates);
      localStorage.setItem("kanban-templates", JSON.stringify(sampleTemplates));
    }
  };

  // Clear all data
  const handleClearBoard = () => {
    setBoard(initialData);
    localStorage.removeItem("kanban-board");
  };

  // Get all unique tags across all cards
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    Object.values(board.cards).forEach((card) => {
      card.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [board.cards]);

  // Apply filters to cards
  const filteredCards = useMemo(() => {
    if (
      !filters.searchTerm &&
      filters.priorities.length === 3 &&
      filters.tags.length === 0
    ) {
      return board.cards; // No filters applied
    }

    const result: Record<string, KanbanCard> = {};

    Object.entries(board.cards).forEach(([id, card]) => {
      // Check if card matches all filters
      const matchesSearch =
        !filters.searchTerm ||
        card.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        card.description
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase());

      const matchesPriority = filters.priorities.includes(card.priority);

      const matchesTags =
        filters.tags.length === 0 ||
        filters.tags.some((tag: string) => card.tags.includes(tag));

      if (matchesSearch && matchesPriority && matchesTags) {
        result[id] = card;
      }
    });

    return result;
  }, [board.cards, filters]);

  // Duplicate a card
  const handleDuplicateCard = (cardId: string) => {
    const cardToDuplicate = board.cards[cardId];
    if (!cardToDuplicate) return;

    const newCardId = `card-${nanoid(6)}`;
    const columnId = board.columns.find((column) =>
      column.cardIds.includes(cardId)
    )?.id;

    if (!columnId) return;

    const newCard: KanbanCard = {
      ...cardToDuplicate,
      id: newCardId,
      title: `${cardToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    setBoard((prev) => {
      const updatedColumns = prev.columns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            cardIds: [...column.cardIds, newCardId],
          };
        }
        return column;
      });

      return {
        ...prev,
        columns: updatedColumns,
        cards: {
          ...prev.cards,
          [newCardId]: newCard,
        },
      };
    });
  };

  // Handle filter changes
  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Toggle stats visibility
  const toggleStats = () => {
    setShowStats((prev) => !prev);
  };

  // Hide load sample button when data exists
  const hasData = Object.keys(board.cards).length > 0;

  // Template management
  const handleSaveTemplate = (template: CardTemplate) => {
    // Update if template with same ID exists, otherwise add new
    setTemplates((prev) => {
      const index = prev.findIndex((t) => t.id === template.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = template;
        return updated;
      }
      return [...prev, template];
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  // Modify the handleAddFromTemplate function
  const handleAddFromTemplate = (columnId: string, templateId?: string) => {
    if (templateId) {
      // If templateId is provided, create card directly from that template
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      // Create a new card from the template
      const newCardId = `card-${nanoid(6)}`;
      const newCard: KanbanCard = {
        ...template.cardData,
        id: newCardId,
        createdAt: new Date().toISOString(),
      };

      // Add the card to the specified column
      setBoard((prev) => {
        const columnIndex = prev.columns.findIndex(
          (col) => col.id === columnId
        );
        if (columnIndex === -1) return prev;

        const updatedColumns = [...prev.columns];
        updatedColumns[columnIndex] = {
          ...updatedColumns[columnIndex],
          cardIds: [...updatedColumns[columnIndex].cardIds, newCardId],
        };

        return {
          ...prev,
          columns: updatedColumns,
          cards: {
            ...prev.cards,
            [newCardId]: newCard,
          },
        };
      });

      // Open the edit modal for the newly created card
      setEditingCardId(newCardId);
    } else {
      // If no templateId, just open the template manager
      setTargetColumn(columnId);
      setShowTemplateManager(true);
    }
  };

  // Modify handleUseTemplate to use targetColumn instead of first column
  const handleUseTemplate = (template: CardTemplate) => {
    // Close template manager
    setShowTemplateManager(false);

    // If no target column is set, use the first column
    const targetColumnId = targetColumn || board.columnOrder[0];
    if (!targetColumnId) return;

    // Create a new card from the template
    const newCardId = `card-${nanoid(6)}`;
    const newCard: KanbanCard = {
      ...template.cardData,
      id: newCardId,
      createdAt: new Date().toISOString(),
    };

    // Add the card to the board
    setBoard((prev) => {
      const columnIndex = prev.columns.findIndex(
        (col) => col.id === targetColumnId
      );
      if (columnIndex === -1) return prev;

      const updatedColumns = [...prev.columns];
      updatedColumns[columnIndex] = {
        ...updatedColumns[columnIndex],
        cardIds: [...updatedColumns[columnIndex].cardIds, newCardId],
      };

      return {
        ...prev,
        columns: updatedColumns,
        cards: {
          ...prev.cards,
          [newCardId]: newCard,
        },
      };
    });

    // Reset the target column
    setTargetColumn(null);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <BoardHeader
        onAddColumn={handleAddColumn}
        onLoadSample={handleLoadSampleData}
        onClearBoard={handleClearBoard}
        onFilter={handleFilter}
        availableTags={allTags}
        hideLoadSample={hasData}
      />

      {showStats && (
        <BoardStats board={board} onClose={() => setShowStats(false)} />
      )}

      <div className="flex justify-end gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => setShowTemplateManager(true)}
        >
          <Library className="h-4 w-4 mr-1" />
          Manage Templates
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={toggleStats}
        >
          {showStats ? "Hide Stats" : "Show Stats"}
        </Button>
      </div>

      <div className="flex flex-1 overflow-x-auto pb-4 mt-4 gap-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {board.columnOrder.map((columnId) => {
            const column = board.columns.find((col) => col.id === columnId)!;

            // Filter cards for this column based on applied filters
            const columnCards = column.cardIds
              .filter((cardId) => filteredCards[cardId]) // Only show cards that pass the filter
              .map((cardId) => board.cards[cardId]);

            return (
              <Column
                key={column.id}
                column={column}
                cards={columnCards}
                onAddCard={() => {
                  setShowAddCard(true);
                  setTargetColumn(column.id);
                }}
                onDeleteCard={handleDeleteCard}
                onEditCard={handleEditCard}
                onDuplicateCard={handleDuplicateCard}
                isDragging={activeColumn === column.id}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={handleEditColumn}
                onAddFromTemplate={handleAddFromTemplate}
                templates={templates}
              >
                {columnCards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    onDelete={handleDeleteCard}
                    onEdit={handleEditCard}
                    onDuplicate={handleDuplicateCard}
                    onSaveTemplate={handleSaveTemplate}
                    isEditing={card.id === editingCardId}
                    onCloseEdit={() => setEditingCardId(null)}
                  />
                ))}
              </Column>
            );
          })}

          <DragOverlay>
            {activeCard ? (
              <div className="w-[300px]">
                <Card
                  card={activeCard}
                  isDragging
                  onDelete={handleDeleteCard}
                  onEdit={handleEditCard}
                />
              </div>
            ) : null}

            {activeColumn ? (
              <div className="opacity-80">
                {(() => {
                  const column = board.columns.find(
                    (col) => col.id === activeColumn
                  )!;
                  const cards = column.cardIds.map(
                    (cardId) => board.cards[cardId]
                  );
                  return (
                    <Column
                      column={column}
                      cards={cards}
                      onAddCard={() => {}}
                      onDeleteCard={() => {}}
                      onEditCard={() => {}}
                      isDragging={true}
                    />
                  );
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showAddCard && targetColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
            <NewCardForm
              onSubmit={handleAddCard}
              onCancel={() => {
                setShowAddCard(false);
                setTargetColumn(null);
              }}
              onSaveTemplate={handleSaveTemplate}
            />
          </div>
        </div>
      )}

      {/* Template Manager Dialog */}
      {showTemplateManager && (
        <TemplateManager
          templates={templates}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onUseTemplate={handleUseTemplate}
          onClose={() => setShowTemplateManager(false)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
