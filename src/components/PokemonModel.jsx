import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Canvas } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";
import { clone as cloneWithSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

const getModelUrl = (id) =>
  `https://raw.githubusercontent.com/Pokemon-3D-api/assets/main/models/opt/regular/${id}.glb`;


// A lista da API é baixada uma única vez e reaproveitada em todas as trocas
// de Pokémon (antes era um fetch da lista inteira a cada troca).
let apiListPromise = null;

function loadApiList() {
  if (!apiListPromise) {
    apiListPromise = fetch("https://pokemon-3d-api.onrender.com/v1/pokemon")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        apiListPromise = null; // deixa tentar de novo na próxima troca
        throw error;
      });
  }

  return apiListPromise;
}

function usePokemonModelUrl(id) {
  const [modelUrl, setModelUrl] = useState(() => getModelUrl(id));

  useEffect(() => {
    let cancelled = false;

    async function findModel() {
      setModelUrl(getModelUrl(id));

      try {
        const data = await loadApiList();

        const pokemonList = Array.isArray(data)
          ? data
          : data.pokemon ?? [];

        const entry = pokemonList.find(
          (item) => Number(item.id) === Number(id)
        );

        const regularForm = entry?.forms?.find(
          (form) =>
            form.formName?.toLowerCase() === "regular" ||
            form.name?.toLowerCase() === entry?.name?.toLowerCase()
        );

        if (!cancelled && regularForm?.model) {
          setModelUrl(regularForm.model);
        }
      } catch (error) {

        console.warn(
          `Não foi possível consultar a API para o Pokémon ${id}.`,
          error
        );
      }
    }

    findModel();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return modelUrl;
}

function PokemonMesh({ url }) {
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    // SkeletonUtils.clone recria também o esqueleto. O scene.clone() comum
    // deixa os meshes "skinned" presos aos ossos do modelo original em cache.
    const clone = cloneWithSkeleton(scene);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    // Atualiza os ossos para a medição considerar a pose real do modelo.
    clone.traverse((child) => {
      if (child.isSkinnedMesh) child.skeleton.update();
    });

    // precise = true usa os vértices (com skinning), não só a caixa do geometry.
    const bounds = new THREE.Box3().setFromObject(clone, true);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    // Escala pelo raio (meia diagonal da caixa): o modelo cabe no círculo
    // em qualquer ângulo de rotação, sem cortar asas, caudas etc.
    const radius = size.length() / 2 || 1;
    const TARGET_RADIUS = 0.95;

    // O grupo externo aplica escala e centralização sem misturar as duas.
    const wrapper = new THREE.Group();
    clone.position.sub(center);
    wrapper.add(clone);
    wrapper.scale.setScalar(TARGET_RADIUS / radius);
    wrapper.position.set(0, 0, 0);
    wrapper.updateMatrixWorld(true);

    return wrapper;
  }, [scene]);

  return <primitive object={model} />;
}

function LoadingMessage() {
  return (
    <Html center>
      <div className="omni-model-loading">
        CARREGANDO HOLOGRAMA...
      </div>
    </Html>
  );
}
function SpriteFallback({ src, name }) {
  if (!src) {
    return (
      <div className="omni-sprite-fallback">
        <span>MODELO 3D INDISPONÍVEL</span>
      </div>
    );
  }

  return (
    <div className="omni-sprite-fallback">
      <img src={src} alt={name || "Pokémon selecionado"} />
      <span>VISUALIZAÇÃO ALTERNATIVA</span>
    </div>
  );
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previousProps) {
    if (
      previousProps.modelKey !== this.props.modelKey &&
      this.state.failed
    ) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Cena 3D.
function ThreeDViewer({ url }) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 4.5],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
      }}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
      }}
    >
      <ambientLight intensity={1.8} />

      <directionalLight
        position={[4, 5, 5]}
        intensity={2.2}
      />

      <directionalLight
        position={[-4, 2, -3]}
        intensity={1.4}
        color="#64dfff"
      />

      <Suspense fallback={<LoadingMessage />}>
        <PokemonMesh url={url} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={(Math.PI * 1.7) / 2.8}
        autoRotate
        autoRotateSpeed={1}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

export function PokemonModel({ pokemon, fallbackImage }) {
  const id = pokemon?.id;

  const modelUrl = usePokemonModelUrl(id);

  const sprite =
    fallbackImage ||
    pokemon?.sprites?.front_default ||
    pokemon?.sprite ||
    pokemon?.image ||
    "";

  if (!pokemon || !id) {
    return (
      <div className="omni-sprite-fallback">
        <span>NENHUM POKÉMON SELECIONADO</span>
      </div>
    );
  }

  return (
    <div className="omni-model-stage">
      <ModelErrorBoundary
        key={`${id}-${modelUrl}`}
        modelKey={`${id}-${modelUrl}`}
        fallback={
          <SpriteFallback
            src={sprite}
            name={pokemon.name}
          />
        }
      >
        <ThreeDViewer
          key={`${id}-${modelUrl}`}
          url={modelUrl}
        />
      </ModelErrorBoundary>
    </div>
  );
}

export default PokemonModel;