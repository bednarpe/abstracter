import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(0.75, 32, 32),
  new THREE.ConeGeometry(0.75, 1.5, 32),
  new THREE.CylinderGeometry(0.75, 0.75, 1.5, 32),
  new THREE.TorusGeometry(0.5, 0.2, 16, 100),
];

const Shapes = () => {
  return (
    <>
      {Geometries.map((geometry, i) => (
        <InstancedShape key={i} geometry={geometry} count={20} />
      ))}
    </>
  );
};

const InstancedShape = ({ geometry, count }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -10 + Math.random() * 20;
      const yFactor = -10 + Math.random() * 20;
      const zFactor = -10 + Math.random() * 20;
      const color = new THREE.Color(Math.random() * 0xffffff);
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, color });
    }
    return temp;
  }, [count]);

  useEffect(() => {
    particles.forEach((particle, i) => {
        if(meshRef.current) {
            meshRef.current.setColorAt(i, particle.color);
        }
    });
    if (meshRef.current) {
        meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particles]);

  useFrame(() => {
    if(!meshRef.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      dummy.position.set(
        xFactor + a * (factor / 10),
        yFactor + b * (factor / 10),
        zFactor + b * (factor / 10)
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]}>
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
};

export default Shapes;
