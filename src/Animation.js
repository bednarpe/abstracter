import React from 'react';
import { Canvas } from '@react-three/fiber';
import Shapes from './Shapes';
import Lines from './Lines';

function Animation() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Shapes />
      <Lines />
    </Canvas>
  );
}

export default Animation;
