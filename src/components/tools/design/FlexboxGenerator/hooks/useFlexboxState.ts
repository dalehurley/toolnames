import { useState, useCallback } from 'react';
import { FlexContainerProps, FlexItemProps, FlexboxTemplate, ExportFormat } from '../types';
import { getRandomPastelColor } from '../utils';
import { v4 as uuidv4 } from 'uuid';

// Default values
const defaultContainerProps: FlexContainerProps = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'normal',
  gap: '0px',
  backgroundColor: '#f5f5f5',
  width: '100%',
  height: '300px',
};

const generateDefaultItem = (): FlexItemProps => ({
  id: uuidv4(),
  order: 0,
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'auto',
  backgroundColor: getRandomPastelColor(),
  width: '100px',
  height: '100px',
  content: '',
});

export const useFlexboxState = () => {
  const [container, setContainer] = useState<FlexContainerProps>(defaultContainerProps);
  const [items, setItems] = useState<FlexItemProps[]>([generateDefaultItem()]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<FlexboxTemplate[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');

  // Methods for manipulating the state
  const addItem = useCallback(() => {
    setItems(prev => [...prev, generateDefaultItem()]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  const updateItem = useCallback((id: string, props: Partial<FlexItemProps>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...props } : item
    ));
  }, []);

  const updateContainer = useCallback((props: Partial<FlexContainerProps>) => {
    setContainer(prev => ({ ...prev, ...props }));
  }, []);

  // Methods for template management
  const saveTemplate = useCallback((name: string) => {
    const newTemplate: FlexboxTemplate = {
      id: uuidv4(),
      name,
      container,
      items,
      created: new Date(),
      lastModified: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate.id;
  }, [container, items]);

  const loadTemplate = useCallback((id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setContainer(template.container);
      setItems(template.items);
    }
  }, [templates]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  // Return all state and methods
  return {
    container,
    items,
    selectedItemId,
    templates,
    exportFormat,
    setSelectedItemId,
    setExportFormat,
    addItem,
    removeItem,
    updateItem,
    updateContainer,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  };
}; 