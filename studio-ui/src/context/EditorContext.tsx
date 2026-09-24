import { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { useEditorCommands } from '../hooks/useEditorCommands';

interface EditorContextValue {
  scene: THREE.Scene | null;
  setScene: (scene: THREE.Scene) => void;
  commands: ReturnType<typeof useEditorCommands>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

/**
 * Provider that manages the Three.js scene reference and command system
 */
export function EditorProvider({ children }: EditorProviderProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const commands = useEditorCommands();

  const setScene = (scene: THREE.Scene) => {
    sceneRef.current = scene;
  };

  const value: EditorContextValue = {
    scene: sceneRef.current,
    setScene,
    commands
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

/**
 * Hook to access the editor context
 */
export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
}

/**
 * Hook to access just the commands with scene context
 */
export function useEditorContextCommands() {
  const { scene, commands } = useEditorContext();
  
  return {
    ...commands,
    // Override commands to automatically pass scene
    addObject: (sceneObj: Parameters<typeof commands.addObject>[0]) => {
      // addObject no longer needs scene since SceneObjects.tsx handles rendering
      commands.addObject(sceneObj);
    },
    deleteObject: (id: string) => {
      // deleteObject no longer needs scene since SceneObjects.tsx handles rendering
      commands.deleteObject(id);
    },
    transformObject: (
      id: string,
      newPosition?: Parameters<typeof commands.transformObject>[1],
      newRotation?: Parameters<typeof commands.transformObject>[2],
      newScale?: Parameters<typeof commands.transformObject>[3],
      transformType?: string
    ) => {
      commands.transformObject(id, newPosition, newRotation, newScale, scene || undefined, transformType);
    },
    transformObjectFromThreeJS: (
      id: string,
      threeJSObject: THREE.Object3D,
      oldStoreValues: Parameters<typeof commands.transformObjectFromThreeJS>[2],
      transformType?: string
    ) => {
      commands.transformObjectFromThreeJS(id, threeJSObject, oldStoreValues, transformType);
    },
    changeObjectColor: (id: string, newColor: string) => {
      commands.changeObjectColor(id, newColor, scene || undefined);
    },
    moveObject: (id: string, newPosition: Parameters<typeof commands.moveObject>[1]) => {
      commands.moveObject(id, newPosition, scene || undefined);
    },
    rotateObject: (id: string, newRotation: Parameters<typeof commands.rotateObject>[1]) => {
      commands.rotateObject(id, newRotation, scene || undefined);
    },
    scaleObject: (id: string, newScale: Parameters<typeof commands.scaleObject>[1]) => {
      commands.scaleObject(id, newScale, scene || undefined);
    },
    clearScene: () => {
      commands.clearScene(scene || undefined);
    }
  };
}