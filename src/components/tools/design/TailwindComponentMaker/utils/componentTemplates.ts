// Component template definitions
import { ComponentCategory } from '../hooks/useComponentState';

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  defaultContent: string;
}

// Define button templates
const buttonTemplates: ComponentTemplate[] = [
  {
    id: 'button-primary',
    name: 'Primary Button',
    description: 'A standard primary action button',
    category: 'button',
    defaultContent: 'Button Text',
  },
  {
    id: 'button-secondary',
    name: 'Secondary Button',
    description: 'A secondary action button',
    category: 'button',
    defaultContent: 'Button Text',
  },
  {
    id: 'button-outline',
    name: 'Outline Button',
    description: 'A button with an outline style',
    category: 'button',
    defaultContent: 'Button Text',
  },
  {
    id: 'button-ghost',
    name: 'Ghost Button',
    description: 'A button with minimal styling',
    category: 'button',
    defaultContent: 'Button Text',
  },
  {
    id: 'button-icon',
    name: 'Icon Button',
    description: 'A button with an icon',
    category: 'button',
    defaultContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
  },
];

// Define card templates
const cardTemplates: ComponentTemplate[] = [
  {
    id: 'card-basic',
    name: 'Basic Card',
    description: 'A simple card with content',
    category: 'card',
    defaultContent: '<div class="p-4"><h3 class="text-lg font-medium">Card Title</h3><p class="mt-2">Card content goes here...</p></div>',
  },
  {
    id: 'card-image',
    name: 'Image Card',
    description: 'A card with an image, title, and content',
    category: 'card',
    defaultContent: '<img src="https://via.placeholder.com/400x200" alt="Card image" class="w-full h-48 object-cover" /><div class="p-4"><h3 class="text-lg font-medium">Card Title</h3><p class="mt-2">Card content goes here...</p></div>',
  },
  {
    id: 'card-actions',
    name: 'Action Card',
    description: 'A card with actions at the bottom',
    category: 'card',
    defaultContent: '<div class="p-4"><h3 class="text-lg font-medium">Card Title</h3><p class="mt-2">Card content goes here...</p></div><div class="border-t p-4 flex justify-end gap-2"><button class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button><button class="px-4 py-2 bg-blue-500 text-white rounded-md">Action</button></div>',
  },
  {
    id: 'card-pricing',
    name: 'Pricing Card',
    description: 'A card for displaying pricing information',
    category: 'card',
    defaultContent: '<div class="p-6 text-center"><h3 class="text-lg font-bold">Basic Plan</h3><div class="mt-4 text-3xl font-bold">$19<span class="text-sm font-normal text-gray-500">/month</span></div><ul class="mt-4 space-y-2 text-sm"><li>Feature One</li><li>Feature Two</li><li>Feature Three</li></ul><button class="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-md">Get Started</button></div>',
  },
];

// Define form templates
const formTemplates: ComponentTemplate[] = [
  {
    id: 'form-input',
    name: 'Input Field',
    description: 'A basic text input field with label',
    category: 'form',
    defaultContent: '<div><label class="block text-sm font-medium mb-1" for="input">Label</label><input id="input" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Placeholder" /></div>',
  },
  {
    id: 'form-checkbox',
    name: 'Checkbox',
    description: 'A checkbox with label',
    category: 'form',
    defaultContent: '<div class="flex items-center"><input id="checkbox" type="checkbox" class="h-4 w-4 text-blue-500 rounded focus:ring-blue-500" /><label for="checkbox" class="ml-2 text-sm">Checkbox label</label></div>',
  },
  {
    id: 'form-radio',
    name: 'Radio Button',
    description: 'A radio button with label',
    category: 'form',
    defaultContent: '<div class="flex items-center"><input id="radio" type="radio" class="h-4 w-4 text-blue-500 focus:ring-blue-500" /><label for="radio" class="ml-2 text-sm">Radio label</label></div>',
  },
  {
    id: 'form-select',
    name: 'Select Dropdown',
    description: 'A select dropdown with options',
    category: 'form',
    defaultContent: '<div><label class="block text-sm font-medium mb-1" for="select">Label</label><select id="select" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="" disabled selected>Select an option</option><option value="option1">Option 1</option><option value="option2">Option 2</option><option value="option3">Option 3</option></select></div>',
  },
  {
    id: 'form-textarea',
    name: 'Text Area',
    description: 'A multi-line text input',
    category: 'form',
    defaultContent: '<div><label class="block text-sm font-medium mb-1" for="textarea">Label</label><textarea id="textarea" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Placeholder"></textarea></div>',
  },
];

// Define navigation templates
const navigationTemplates: ComponentTemplate[] = [
  {
    id: 'navigation-navbar',
    name: 'Navbar',
    description: 'A responsive navigation bar',
    category: 'navigation',
    defaultContent: '<nav class="bg-white px-4 py-3 flex items-center justify-between"><div class="flex items-center"><span class="text-xl font-bold">Logo</span><div class="hidden md:flex ml-10 space-x-4"><a href="#" class="text-gray-700 hover:text-gray-900">Home</a><a href="#" class="text-gray-700 hover:text-gray-900">Features</a><a href="#" class="text-gray-700 hover:text-gray-900">Pricing</a><a href="#" class="text-gray-700 hover:text-gray-900">About</a></div></div><div><button class="md:hidden p-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button><div class="hidden md:block"><button class="px-4 py-2 bg-blue-500 text-white rounded-md">Sign Up</button></div></div></nav>',
  },
  {
    id: 'navigation-tabs',
    name: 'Tabs',
    description: 'A tabbed navigation component',
    category: 'navigation',
    defaultContent: '<div><div class="border-b"><ul class="flex -mb-px" role="tablist"><li class="mr-1"><button class="py-2 px-4 text-center border-b-2 border-blue-500 text-blue-500" role="tab" aria-selected="true">Tab 1</button></li><li class="mr-1"><button class="py-2 px-4 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700" role="tab">Tab 2</button></li><li class="mr-1"><button class="py-2 px-4 text-center border-b-2 border-transparent text-gray-500 hover:text-gray-700" role="tab">Tab 3</button></li></ul></div><div class="py-4"><div role="tabpanel">Tab 1 content here...</div></div></div>',
  },
  {
    id: 'navigation-pagination',
    name: 'Pagination',
    description: 'A pagination component',
    category: 'navigation',
    defaultContent: '<div class="flex justify-center"><nav class="inline-flex rounded-md shadow"><a href="#" class="py-2 px-4 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-l-md">Previous</a><a href="#" class="py-2 px-4 bg-white border-t border-b border-gray-300 text-blue-500 border-blue-500">1</a><a href="#" class="py-2 px-4 bg-white border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">2</a><a href="#" class="py-2 px-4 bg-white border-t border-b border-gray-300 text-gray-500 hover:bg-gray-50">3</a><a href="#" class="py-2 px-4 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-r-md">Next</a></nav></div>',
  },
];

// Define layout templates
const layoutTemplates: ComponentTemplate[] = [
  {
    id: 'layout-container',
    name: 'Container',
    description: 'A centered container with responsive padding',
    category: 'layout',
    defaultContent: '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Container content goes here...</div>',
  },
  {
    id: 'layout-grid',
    name: 'Grid Layout',
    description: 'A responsive grid layout',
    category: 'layout',
    defaultContent: '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"><div class="bg-gray-100 p-4 rounded-md">Item 1</div><div class="bg-gray-100 p-4 rounded-md">Item 2</div><div class="bg-gray-100 p-4 rounded-md">Item 3</div><div class="bg-gray-100 p-4 rounded-md">Item 4</div></div>',
  },
  {
    id: 'layout-two-column',
    name: 'Two Column Layout',
    description: 'A two-column layout that stacks on mobile',
    category: 'layout',
    defaultContent: '<div class="flex flex-col md:flex-row md:space-x-4"><div class="w-full md:w-1/3 bg-gray-100 p-4 rounded-md mb-4 md:mb-0">Sidebar content</div><div class="w-full md:w-2/3 bg-gray-100 p-4 rounded-md">Main content</div></div>',
  },
];

// Define data display templates
const dataTemplates: ComponentTemplate[] = [
  {
    id: 'data-table',
    name: 'Table',
    description: 'A basic data table',
    category: 'data',
    defaultContent: '<table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th><th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><tr><td class="px-6 py-4 whitespace-nowrap">John Doe</td><td class="px-6 py-4 whitespace-nowrap">Software Engineer</td><td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span></td></tr><tr><td class="px-6 py-4 whitespace-nowrap">Jane Smith</td><td class="px-6 py-4 whitespace-nowrap">Designer</td><td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span></td></tr></tbody></table>',
  },
  {
    id: 'data-badge',
    name: 'Badge',
    description: 'A status badge component',
    category: 'data',
    defaultContent: '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Badge</span>',
  },
  {
    id: 'data-alert',
    name: 'Alert',
    description: 'An alert message component',
    category: 'data',
    defaultContent: '<div class="p-4 rounded-md bg-blue-50 border border-blue-300"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></div><div class="ml-3"><h3 class="text-sm font-medium text-blue-800">Information</h3><div class="mt-2 text-sm text-blue-700"><p>This is an informational alert message.</p></div></div></div></div>',
  },
  {
    id: 'data-stat',
    name: 'Stat Card',
    description: 'A statistical data display card',
    category: 'data',
    defaultContent: '<div class="p-5 bg-white rounded-lg shadow"><dt class="text-sm font-medium text-gray-500 truncate">Total Subscribers</dt><dd class="mt-1 text-3xl font-semibold text-gray-900">71,897</dd><dd class="mt-3 text-sm font-medium text-green-500 flex items-center"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>12% increase</dd></div>',
  },
];

// Combine all templates
export const componentTemplates: ComponentTemplate[] = [
  ...buttonTemplates,
  ...cardTemplates,
  ...formTemplates,
  ...navigationTemplates,
  ...layoutTemplates,
  ...dataTemplates,
];

// Get templates by category
export const getTemplatesByCategory = (
  category: ComponentCategory
): ComponentTemplate[] => {
  return componentTemplates.filter((template) => template.category === category);
};

// Get template by ID
export const getTemplateById = (id: string): ComponentTemplate | undefined => {
  return componentTemplates.find((template) => template.id === id);
}; 