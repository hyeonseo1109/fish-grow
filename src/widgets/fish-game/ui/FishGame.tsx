import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useArrowControls } from "@features/move-player-fish";
import {
  SEA_HEIGHT,
  SEA_WIDTH,
  type Fish,
  type PlayerFish,
} from "@entities/fish";
import playerFishImage from "@shared/assets/player-fish.png";
import predatorFish1 from "@shared/assets/predator-fish-1.png";
import predatorFish2 from "@shared/assets/predator-fish-2.png";
import predatorFish3 from "@shared/assets/predator-fish-3.png";
import predatorFish4 from "@shared/assets/predator-fish-4.png";
import predatorFish5 from "@shared/assets/predator-fish-5.png";
import predatorFish6 from "@shared/assets/predator-fish-6.png";

import {
  advanceGame,
  createInitialGameState,
  WIN_RADIUS,
  type GameState,
} from "../model/game";

const predatorImages = [
  predatorFish1,
  predatorFish2,
  predatorFish3,
  predatorFish4,
  predatorFish5,
  predatorFish6,
];

export function FishGame() {
  const movement = useArrowControls();
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const tick = (time: number) => {
      const deltaSeconds = Math.min(0.032, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      setGame((current) =>
        advanceGame(current, movement.current, deltaSeconds),
      );
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
  const isPlayerIdle = movement.current.x === 0 && movement.current.y === 0;
  const playerBob = isPlayerIdle
    ? Math.sin((performance.now() - game.startedAt) / 520) * 3
    : 0;

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
        <button
          className="icon-button"
          type="button"
          aria-label="다시 시작"
          onClick={restart}
        >
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
              <stop offset="0%" stopColor="#49c6ff" />
              <stop offset="55%" stopColor="#62d1c8" />
              <stop offset="100%" stopColor="#07a5d5" />
            </linearGradient>
            <radialGradient id="shine" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          <rect
            width={SEA_WIDTH}
            height={SEA_HEIGHT}
            fill="url(#seaGradient)"
          />
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
              <FishSprite
                key={food.id}
                fish={food}
                imageSrc={predatorImages[food.imageIndex - 1]}
              />
            ))}
          </g>
          <FishSprite
            fish={game.player}
            imageSrc={playerFishImage}
            isPlayer
            swimOffsetY={playerBob}
          />
        </svg>

        {game.status !== "playing" && (
          <div className="win-panel" role="status">
            <strong>{game.status === "won" ? "성공!" : "게임 오버"}</strong>
            <span>
              {game.status === "won"
                ? "충분히 커졌어요. 다시 시작해서 더 빠르게 성장해 보세요."
                : "나보다 큰 상대와 부딪혔어요. 다시 도전해 보세요."}
            </span>
            <button type="button" onClick={restart}>
              다시 시작
            </button>
          </div>
        )}
      </section>

      <footer className="game-footer">
        <span>방향키로 이동</span>
        <span>나보다 작은 상대만 먹을 수 있어요</span>
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

type FishSpriteProps = {
  fish: Fish | PlayerFish;
  imageSrc: string;
  isPlayer?: boolean;
  swimOffsetY?: number;
};

function FishSprite({
  fish,
  imageSrc,
  isPlayer = false,
  swimOffsetY = 0,
}: FishSpriteProps) {
  const facingLeft = fish.direction.x < 0;
  const width = fish.radius * (isPlayer ? 3.2 : 3);
  const height = fish.radius * (isPlayer ? 2.25 : 2.1);
  const scaleX = facingLeft ? 1 : -1;

  return (
    <g
      transform={`translate(${fish.position.x} ${fish.position.y + swimOffsetY}) scale(${scaleX} 1)`}
      className={isPlayer ? "player-fish" : "food-fish"}
    >
      <image
        href={imageSrc}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}
