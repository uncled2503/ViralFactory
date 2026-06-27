/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUIStore } from './store/uiStore';
import EditorLayout from './layouts/EditorLayout';
import TemplateLibrary from './modules/templates/TemplateLibrary';
import UploadManager from './modules/uploads/UploadManager';

export default function App() {
  const { activeView } = useUIStore();

  if (activeView === 'library') {
    return <TemplateLibrary />;
  }

  if (activeView === 'uploads') {
    return <UploadManager />;
  }

  return <EditorLayout />;
}
