import { useEffect } from 'react';
import { Sidebar } from './features/sidebar/components/Sidebar';
import { EditorArea } from './features/editor/components/EditorArea';
import { MainMenu } from './features/menu/components/MainMenu';
import { AutoGenerator } from './features/auto-gen/components/AutoGenerator';
import { ImageStandardizer } from './features/standardizer/components/ImageStandardizer';
import { useEditorStore } from './store/useEditorStore';

function App() {
  const view = useEditorStore((state) => state.view);
  const isDarkMode = useEditorStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (view === 'menu') {
    return <MainMenu />;
  }

  if (view === 'auto-gen') {
    return <AutoGenerator />;
  }

  if (view === 'standardizer') {
    return <ImageStandardizer />;
  }

  // view === 'editor'
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <EditorArea />
    </div>
  );
}

export default App;