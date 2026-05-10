import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useArrowControls } from "@features/move-player-fish";
import { SEA_HEIGHT, SEA_WIDTH, type Fish, type PlayerFish } from "@entities/fish";

import { advanceGame, createInitialGameState, WIN_RADIUS, type GameState } from "../model/game";

export function FishGame() {
  const movement = useArrowControls();
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const tick = (time: number) => {
      const deltaSeconds = Math.min(0.032, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      setGame((current) => advanceGame(current, movement.current, deltaSeconds));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [movement]);

  const progress = Math.round((game.player.radius / WIN_RADIUS) * 100);

  const restart = () => {
    lastTimeRef.current = performance.now();
    setGame(createInitialGameState());
  };

  return (
    <main className="game-shell">
      <section className="game-topbar" aria-label="게임 상태">
        <div>
          <p className="eyebrow">Fish Grow</p>
          <h1>큰 물고기가 될 시간</h1>
        </div>
        <div className="stats" aria-label="점수와 성장 상태">
          <Stat label="점수" value={game.player.score.toString()} />
          <Stat label="먹은 물고기" value={game.player.eaten.toString()} />
          <Stat label="성장" value={`${progress}%`} />
        </div>
        <button className="icon-button" type="button" aria-label="다시 시작" onClick={restart}>
          <RotateCcw size={20} aria-hidden="true" />
        </button>
      </section>

      <section className="sea-wrap" aria-label="물고기 게임">
        <svg
          className="sea"
          viewBox={`0 0 ${SEA_WIDTH} ${SEA_HEIGHT}`}
          role="img"
          aria-label="방향키로 조작하는 물고기 게임 화면"
        >
          <defs>
            <linearGradient id="seaGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="55%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#155e75" />
            </linearGradient>
            <radialGradient id="shine" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          <rect width={SEA_WIDTH} height={SEA_HEIGHT} fill="url(#seaGradient)" />
          <g opacity="0.3">
            {Array.from({ length: 9 }, (_, index) => (
              <circle
                key={index}
                cx={90 + index * 100}
                cy={70 + (index % 4) * 116}
                r={12 + (index % 3) * 6}
                fill="url(#shine)"
              />
            ))}
          </g>
          <g>
            {game.foods.map((food) => (
              <FishShape key={food.id} fish={food} />
            ))}
          </g>
          <FishShape fish={game.player} isPlayer />
        </svg>

        {game.status === "won" && (
          <div className="win-panel" role="status">
            <strong>성공!</strong>
            <span>충분히 커졌어요. 다시 시작해서 더 빠르게 성장해 보세요.</span>
            <button type="button" onClick={restart}>
              다시 시작
            </button>
          </div>
        )}
      </section>

      <footer className="game-footer">
        <span>방향키로 이동</span>
        <span>나보다 작은 물고기만 먹을 수 있어요</span>
      </footer>
    </main>
  );
}

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type FishShapeProps = {
  fish: Fish | PlayerFish;
  isPlayer?: boolean;
};

function FishShape({ fish, isPlayer = false }: FishShapeProps) {
  const facingLeft = fish.direction.x < 0;
  const scaleX = facingLeft ? -1 : 1;
  const eyeX = fish.radius * 0.28;
  const eyeY = -fish.radius * 0.22;

  return (
    <g
      transform={`translate(${fish.position.x} ${fish.position.y}) scale(${scaleX} 1)`}
      className={isPlayer ? "player-fish" : "food-fish"}
    >
      <path
        d={`M ${-fish.radius * 1.05} 0 L ${-fish.radius * 1.75} ${-fish.radius * 0.65} L ${-fish.radius * 1.55} 0 L ${-fish.radius * 1.75} ${fish.radius * 0.65} Z`}
        fill={isPlayer ? "#14b8a6" : fish.color}
      />
      <ellipse
        cx="0"
        cy="0"
        rx={fish.radius * 1.18}
        ry={fish.radius * 0.78}
        fill={fish.color}
      />
      <ellipse
        cx={fish.radius * 0.25}
        cy={-fish.radius * 0.12}
        rx={fish.radius * 0.55}
        ry={fish.radius * 0.3}
        fill="rgba(255,255,255,0.18)"
      />
      <circle cx={eyeX} cy={eyeY} r={Math.max(2.2, fish.radius * 0.11)} fill="#082f49" />
      <circle
        cx={eyeX + fish.radius * 0.04}
        cy={eyeY - fish.radius * 0.04}
        r={Math.max(0.8, fish.radius * 0.035)}
        fill="#ffffff"
      />
    </g>
  );
}
