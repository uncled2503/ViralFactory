/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUIStore } from '../../../store/uiStore';
import TemplatesPanel from './panels/TemplatesPanel';
import ElementsPanel from './panels/ElementsPanel';
import TextPanel from './panels/TextPanel';
import AssetsPanel from './panels/AssetsPanel';
import BulkPanel from './panels/BulkPanel';
import SettingsPanel from './panels/SettingsPanel';

export default function SidebarPanels() {
  const { activeTab, sidebarWidth } = useUIStore();

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'templates':
        return <TemplatesPanel />;
      case 'elements':
        return <ElementsPanel />;
      case 'text':
        return <TextPanel />;
      case 'assets':
        return <AssetsPanel />;
      case 'bulk':
        return <BulkPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <TemplatesPanel />;
    }
  };

  return (
    <div 
      className="bg-zinc-950/95 border-r border-zinc-800 flex flex-col h-full overflow-hidden select-none"
      style={{ width: sidebarWidth }}
      id="editor-sidebar-panel"
    >
      <div className="flex-1 overflow-hidden">
        {renderActivePanel()}
      </div>
    </div>
  );
}
