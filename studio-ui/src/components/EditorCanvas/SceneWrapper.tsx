import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useEditorContext } from '../../context/EditorContext';
import PrintBed from './PrintBed';
import BuildVolume from './BuildVolume';
import OrientationCube from './OrientationCube';
import SceneObjects from './SceneObjects';
import TransformWrapper from './TransformWrapper';
import { useStore } from '../../store/useStore';

/**
 * Component that registers the Three.js scene with the editor context
 * and renders all scene objects
 */
export default function SceneWrapper() {
  const { scene } = useThree();
  const { setScene } = useEditorContext();
  const showBuildVolume = useStore((s) => s.showBuildVolume);
  const getSelectedPrinter = useStore((s) => s.getSelectedPrinter);
  const { bed, volume } = getSelectedPrinter();

  // Register the scene with the editor context
  useEffect(() => {
    setScene(scene);
  }, [scene, setScene]);

  return (
    <>
      {/* Lights */}
      <hemisphereLight intensity={0.5} groundColor="white" />
      <directionalLight position={[200, 300, 200]} intensity={1} castShadow />

      {/* Scene elements */}
      <PrintBed />
      {showBuildVolume && (
        <BuildVolume width={bed.width} depth={bed.depth} height={volume.height} />
      )}
      <SceneObjects />
      <TransformWrapper />

      {/* Orientation cube in top-right corner */}
      <OrientationCube />
    </>
  );
}