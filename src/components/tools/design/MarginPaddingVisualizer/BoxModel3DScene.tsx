import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box, Edges } from "@react-three/drei";
import { useSpacing } from "./SpacingContext";

// Component for rendering the box model layers
const BoxModelLayers: React.FC<{ spacing: ReturnType<typeof useSpacing> }> = ({
  spacing,
}) => {
  // Scale down the values for better visualization
  const scale = 0.01;
  const scaleValue = (value: number) => Math.max(value * scale, 0.05);

  // Calculate dimensions
  const contentWidth = scaleValue(200);
  const contentHeight = scaleValue(100);
  const contentDepth = scaleValue(100);

  const paddingTop = scaleValue(spacing.paddingTop);
  const paddingRight = scaleValue(spacing.paddingRight);
  const paddingBottom = scaleValue(spacing.paddingBottom);
  const paddingLeft = scaleValue(spacing.paddingLeft);

  const borderWidth = scaleValue(spacing.borderWidth);

  const marginTop = scaleValue(spacing.marginTop);
  const marginRight = scaleValue(spacing.marginRight);
  const marginBottom = scaleValue(spacing.marginBottom);
  const marginLeft = scaleValue(spacing.marginLeft);

  // Calculate the width/height of each layer
  const paddingWidth = contentWidth + paddingLeft + paddingRight;
  const paddingHeight = contentHeight + paddingTop + paddingBottom;
  const paddingDepth = contentDepth;

  const borderWidth3D = paddingWidth + borderWidth * 2;
  const borderHeight = paddingHeight + borderWidth * 2;
  const borderDepth = paddingDepth + borderWidth * 2;

  const marginWidth = borderWidth3D + marginLeft + marginRight;
  const marginHeight = borderHeight + marginTop + marginBottom;
  const marginDepth = borderDepth;

  // Colors based on preview mode
  const themeMode = spacing.previewMode;
  const themeColors = {
    margin: themeMode === "dark" ? "#164e63" : "#e0f2fe",
    border: themeMode === "dark" ? "#083344" : "#f0f9ff",
    padding: themeMode === "dark" ? "#0e7490" : "#bae6fd",
    content: themeMode === "dark" ? "#0369a1" : "#0ea5e9",
  };

  return (
    <>
      {/* Margin Layer */}
      <Box args={[marginWidth, marginHeight, marginDepth]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={themeColors.margin}
          transparent={true}
          opacity={0.4}
        />
        <Edges color="#ffffff" threshold={15} />
      </Box>

      {/* Border Layer */}
      <Box
        args={[borderWidth3D, borderHeight, borderDepth]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={themeColors.border}
          transparent={true}
          opacity={0.6}
        />
        <Edges color="#ffffff" threshold={15} />
      </Box>

      {/* Padding Layer */}
      <Box
        args={[paddingWidth, paddingHeight, paddingDepth]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={themeColors.padding}
          transparent={true}
          opacity={0.8}
        />
        <Edges color="#ffffff" threshold={15} />
      </Box>

      {/* Content Layer */}
      <Box
        args={[contentWidth, contentHeight, contentDepth]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color={themeColors.content} />
        <Edges color="#ffffff" threshold={15} />
      </Box>

      <Text
        position={[0, 0, contentDepth / 2 + 0.1]}
        fontSize={0.2}
        color="#000000"
        anchorX="center"
        anchorY="middle"
      >
        Content
      </Text>
    </>
  );
};

// 3D Scene component that contains all Three.js logic
const BoxModel3DScene: React.FC<{
  spacing: ReturnType<typeof useSpacing>;
  autoRotate: boolean;
}> = ({ spacing, autoRotate }) => {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <BoxModelLayers spacing={spacing} />

      <gridHelper args={[10, 20, "#909090", "#404040"]} position={[0, -1, 0]} />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
};

export default BoxModel3DScene;
