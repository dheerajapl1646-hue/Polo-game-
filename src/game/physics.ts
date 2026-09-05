import { LineOfTheBall, MatchState, PoloBall, PoloPlayer, ShotType } from '../types/polo';
import { poloAudio } from '../utils/audio';

export const FIELD_WIDTH = 1800;
export const FIELD_HEIGHT = 1000;
export const GOAL_POST_HALF_SPAN = 85; // 170px wide goal
export const GOAL_LEFT_X = 120;
export const GOAL_RIGHT_X = 1680;
export const GOAL_CENTER_Y = 500;

export interface PhysicsUpdateResult {
  goalScored: 'home' | 'away' | null;
  foulMessage: string | null;
  hitOccurred: boolean;
}

export function createInitialBall(): PoloBall {
  return {
    x: FIELD_WIDTH / 2,
    y: FIELD_HEIGHT / 2,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: 7,
    lastHitterId: null,
    lastHitTeam: null,
    trail: []
  };
}

// Check which shot type should be executed based on relative position of ball to horse
export function determineShotType(player: PoloPlayer, ball: PoloBall): { shotType: ShotType; distance: number } {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Angle from player to ball
  const angleToBall = Math.atan2(dy, dx);
  // Relative angle to player's heading
  let relAngle = angleToBall - player.angle;
  while (relAngle > Math.PI) relAngle -= Math.PI * 2;
  while (relAngle < -Math.PI) relAngle += Math.PI * 2;

  // In polo, players always hold mallet in right hand (offside).
  // relAngle > 0 means ball is to the right (offside)
  // relAngle < 0 means ball is to the left (nearside)
  if (Math.abs(relAngle) < 0.35 && dist < 55) {
    return { shotType: 'neck_shot', distance: dist };
  } else if (Math.abs(relAngle) > 2.5 && dist < 55) {
    return { shotType: 'tail_shot', distance: dist };
  } else if (relAngle >= 0) {
    // Offside (right side)
    if (relAngle > 1.8) {
      return { shotType: 'offside_backhand', distance: dist };
    } else {
      return { shotType: 'offside_forehand', distance: dist };
    }
  } else {
    // Nearside (left side)
    if (relAngle < -1.8) {
      return { shotType: 'nearside_backhand', distance: dist };
    } else {
      return { shotType: 'nearside_forehand', distance: dist };
    }
  }
}

// Main physics update step
export function updateGamePhysics(
  players: PoloPlayer[],
  ball: PoloBall,
  lob: LineOfTheBall | null,
  matchState: MatchState,
  keys: Set<string>,
  p2Keys: Set<string>,
  touchInput: { moveX: number; moveY: number; swing: boolean; sprint: boolean; hook: boolean } | null,
  isTwoPlayer: boolean,
  delta: number, // in seconds, ~0.016
  fieldFriction: number = 0.985
): PhysicsUpdateResult {
  let goalScored: 'home' | 'away' | null = null;
  let foulMessage: string | null = null;
  let hitOccurred = false;

  const now = performance.now();

  // 1. Process player inputs (User Player 1, Player 2 if 2-player mode, AI bots)
  players.forEach((player) => {
    // Update cooldowns & animations
    if (player.hookCooldown > 0) player.hookCooldown -= delta;
    if (player.isSwinging) {
      player.swingProgress += delta * 7;
      if (player.swingProgress >= 1) {
        player.isSwinging = false;
        player.swingProgress = 0;
      }
    }

    if (player.isUser) {
      handleUserControls(player, keys, touchInput, delta);
    } else if (player.isPlayer2 && isTwoPlayer) {
      handlePlayer2Controls(player, p2Keys, delta);
    } else {
      handleAiPlayer(player, players, ball, lob, matchState, delta);
    }

    // Horse movement physics
    const accelRate = (player.horse.acceleration / 10) * 280;
    const baseTopSpeed = 160 + (player.horse.speed / 10) * 110;
    const topSpeed = player.isSprinting && player.stamina > 10 ? baseTopSpeed * 1.35 : baseTopSpeed;

    // Stamina drain and recovery
    if (player.isSprinting && player.speed > 30) {
      player.stamina = Math.max(0, player.stamina - delta * 18);
      if (player.stamina <= 0) player.isSprinting = false;
    } else {
      const staminaRecovery = (player.horse.stamina / 10) * 12;
      player.stamina = Math.min(100, player.stamina + delta * staminaRecovery);
    }

    // Turn rate
    const agilityTurn = (player.horse.agility / 10) * 3.8;
    let angleDiff = player.targetAngle - player.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    player.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), agilityTurn * delta);

    // Velocity update
    const targetVx = Math.cos(player.angle) * player.speed;
    const targetVy = Math.sin(player.angle) * player.speed;

    player.vx += (targetVx - player.vx) * (accelRate * delta * 0.05);
    player.vy += (targetVy - player.vy) * (accelRate * delta * 0.05);

    player.x += player.vx * delta;
    player.y += player.vy * delta;

    // Boundary constraints (safety boards)
    const margin = 50;
    if (player.x < margin) { player.x = margin; player.vx *= -0.3; }
    if (player.x > FIELD_WIDTH - margin) { player.x = FIELD_WIDTH - margin; player.vx *= -0.3; }
    if (player.y < margin) { player.y = margin; player.vy *= -0.3; }
    if (player.y > FIELD_HEIGHT - margin) { player.y = FIELD_HEIGHT - margin; player.vy *= -0.3; }

    // Gallop animation frame
    if (player.speed > 10) {
      player.animFrame += delta * (player.speed / 18);
      if (player.isUser && Math.random() < 0.15) {
        poloAudio.playHoofStep(player.speed / baseTopSpeed);
      }
    }
  });

  // 2. Horse-to-Horse Collisions (Ride-Offs & Bumps)
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 42; // Horse width radius

      if (dist < minDistance && dist > 0.001) {
        // In polo, ride-offs occur between opposite teams
        const isOpponent = p1.team !== p2.team;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDistance - dist;

        // Angle between their headings
        let headingDiff = Math.abs(p1.angle - p2.angle);
        while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
        headingDiff = Math.abs(headingDiff);

        // Ride-off check (legal if <= 35 degrees / 0.6 rad)
        if (isOpponent) {
          const isLegalAngle = headingDiff < 0.65 || headingDiff > Math.PI - 0.65;
          if (isLegalAngle) {
            // Legal bump
            const p1Power = p1.horse.bumpWeight * (p1.speed / 100);
            const p2Power = p2.horse.bumpWeight * (p2.speed / 100);
            const ratio = (p1Power + 0.1) / (p1Power + p2Power + 0.2);

            p1.x -= nx * overlap * (1 - ratio);
            p1.y -= ny * overlap * (1 - ratio);
            p2.x += nx * overlap * ratio;
            p2.y += ny * overlap * ratio;

            if (p1.isUser || p2.isUser) {
              poloAudio.playHorseBump();
            }
            if (p1Power > p2Power) p1.stats.rideOffsWon++;
            else p2.stats.rideOffsWon++;
          } else if (p1.speed > 120 || p2.speed > 120) {
            // Dangerous riding foul! T-bone angle
            if (Math.abs(headingDiff - Math.PI / 2) < 0.4) {
              const offender = p1.speed > p2.speed ? p1 : p2;
              offender.stats.fouls++;
              foulMessage = `Dangerous Riding Foul! Excessive angle by ${offender.name}`;
              poloAudio.playWhistle();
            }
          }
        } else {
          // Teammate soft collision
          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;
        }
      }
    }
  }

  // 3. Mallet Swings & Striking the Ball
  players.forEach((player) => {
    if (!player.isSwinging) return;

    // Reach of mallet
    const malletReach = 58;
    const { shotType, distance } = determineShotType(player, ball);

    if (distance <= malletReach) {
      // Check if an opponent is hooking this player's mallet
      const hooker = players.find(
        (opp) =>
          opp.team !== player.team &&
          Math.hypot(opp.x - player.x, opp.y - player.y) < 48 &&
          opp.hookCooldown > 0.4
      );

      if (hooker) {
        // Swing hooked!
        hooker.stats.hooks++;
        player.isSwinging = false;
        player.swingCharge = 0;
        poloAudio.playMalletHook();
        return;
      }

      // Successful shot execution!
      const power = Math.max(0.35, player.swingCharge || 0.6);
      const hitStrength = 320 + power * 480;

      // Base shot direction: depends on shot type and player angle
      let shotAngle = player.angle;
      if (shotType === 'offside_forehand') {
        shotAngle = player.angle + 0.05;
      } else if (shotType === 'nearside_forehand') {
        shotAngle = player.angle - 0.15;
      } else if (shotType === 'offside_backhand') {
        shotAngle = player.angle + Math.PI - 0.1;
      } else if (shotType === 'nearside_backhand') {
        shotAngle = player.angle + Math.PI + 0.1;
      } else if (shotType === 'neck_shot') {
        shotAngle = player.angle + 0.65; // Cut across pony's neck
      } else if (shotType === 'tail_shot') {
        shotAngle = player.angle - Math.PI + 0.5;
      }

      // Add loft (z-axis velocity) if high power
      const loft = power > 0.7 ? (power - 0.7) * 220 : 0;

      ball.vx = Math.cos(shotAngle) * hitStrength;
      ball.vy = Math.sin(shotAngle) * hitStrength;
      ball.vz = loft;
      ball.lastHitterId = player.id;
      ball.lastHitTeam = player.team;
      player.lastHitTime = now;
      player.stats.shots++;

      // Sound
      poloAudio.playMalletHit(power);
      hitOccurred = true;

      // Reset swing charge
      player.swingCharge = 0;
    }
  });

  // 4. Ball Physics (Ground Roll, Loft, Bounce, Goal Checks)
  // Z-axis physics (loft & bounce)
  if (ball.z > 0 || ball.vz > 0) {
    ball.vz -= 380 * delta; // Gravity
    ball.z += ball.vz * delta;
    if (ball.z <= 0) {
      ball.z = 0;
      ball.vz = -ball.vz * 0.45; // Bounce damping
      if (Math.abs(ball.vz) < 15) ball.vz = 0;
    }
  }

  // Ground friction
  const effectiveFriction = ball.z > 5 ? 0.995 : fieldFriction;
  ball.vx *= Math.pow(effectiveFriction, delta * 60);
  ball.vy *= Math.pow(effectiveFriction, delta * 60);

  ball.x += ball.vx * delta;
  ball.y += ball.vy * delta;

  // Trail
  if (Math.hypot(ball.vx, ball.vy) > 60) {
    ball.trail.push({ x: ball.x, y: ball.y, time: now });
    if (ball.trail.length > 25) ball.trail.shift();
  } else if (ball.trail.length > 0) {
    ball.trail.shift();
  }

  // 5. Goal Line Detection
  // Check if ball crossed into left or right goal
  const isBetweenGoalPosts =
    ball.y >= GOAL_CENTER_Y - GOAL_POST_HALF_SPAN &&
    ball.y <= GOAL_CENTER_Y + GOAL_POST_HALF_SPAN;

  if (isBetweenGoalPosts) {
    // Left Goal
    if (ball.x <= GOAL_LEFT_X) {
      // In polo: if field sides swapped, check which team scores
      const scoringTeam = matchState.fieldSideSwapped ? 'home' : 'away';
      goalScored = scoringTeam;
      poloAudio.playCrowdCheer();
      poloAudio.playBugleFanfare();
    }
    // Right Goal
    else if (ball.x >= GOAL_RIGHT_X) {
      const scoringTeam = matchState.fieldSideSwapped ? 'away' : 'home';
      goalScored = scoringTeam;
      poloAudio.playCrowdCheer();
      poloAudio.playBugleFanfare();
    }
  }

  // Field boundary bounce (Sideboards)
  const topBoardY = 70;
  const botBoardY = FIELD_HEIGHT - 70;
  if (ball.y < topBoardY) {
    ball.y = topBoardY;
    ball.vy = Math.abs(ball.vy) * 0.7;
    poloAudio.playMalletHit(0.3);
  } else if (ball.y > botBoardY) {
    ball.y = botBoardY;
    ball.vy = -Math.abs(ball.vy) * 0.7;
    poloAudio.playMalletHit(0.3);
  }

  // End boards (outside goal area)
  if (!isBetweenGoalPosts) {
    if (ball.x < 80) {
      ball.x = 80;
      ball.vx = Math.abs(ball.vx) * 0.65;
    } else if (ball.x > FIELD_WIDTH - 80) {
      ball.x = FIELD_WIDTH - 80;
      ball.vx = -Math.abs(ball.vx) * 0.65;
    }
  }

  // 6. Line of the Ball (LOB) Rule Enforcement
  // When a hard shot is hit, create/update LOB
  if (hitOccurred && Math.hypot(ball.vx, ball.vy) > 180) {
    const hitter = players.find((p) => p.id === ball.lastHitterId);
    if (hitter) {
      // Check if any opponent is already crossing dangerously
      const speed = Math.hypot(ball.vx, ball.vy);
      const dirX = ball.vx / speed;
      const dirY = ball.vy / speed;

      players.forEach((opp) => {
        if (opp.team !== hitter.team && opp.speed > 50) {
          // Vector from ball to opp
          const tox = opp.x - ball.x;
          const toy = opp.y - ball.y;
          const proj = tox * dirX + toy * dirY;
          // If opponent is ahead of the ball along the line (proj > 20 && proj < 160)
          if (proj > 30 && proj < 180) {
            // Perpendicular distance to line
            const perpDist = Math.abs(tox * -dirY + toy * dirX);
            if (perpDist < 36) {
              // Crossed right of way corridor!
              foulMessage = `Line of the Ball Foul! Crossed path of ${hitter.name}`;
              opp.stats.fouls++;
              poloAudio.playWhistle();
            }
          }
        }
      });
    }
  }

  return {
    goalScored,
    foulMessage,
    hitOccurred
  };
}

// User 1 Controls (WASD / Arrows + Space to swing + Shift to sprint + E to hook)
function handleUserControls(
  player: PoloPlayer,
  keys: Set<string>,
  touchInput: { moveX: number; moveY: number; swing: boolean; sprint: boolean; hook: boolean } | null,
  delta: number
) {
  let moveX = 0;
  let moveY = 0;
  let sprint = keys.has('ShiftLeft') || keys.has('ShiftRight');
  let swingKey = keys.has('Space') || keys.has('KeyJ');
  let hookKey = keys.has('KeyE') || keys.has('KeyK');

  if (keys.has('KeyW') || keys.has('ArrowUp')) moveY -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) moveY += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) moveX -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) moveX += 1;

  if (touchInput) {
    if (Math.abs(touchInput.moveX) > 0.1 || Math.abs(touchInput.moveY) > 0.1) {
      moveX = touchInput.moveX;
      moveY = touchInput.moveY;
    }
    if (touchInput.sprint) sprint = true;
    if (touchInput.swing) swingKey = true;
    if (touchInput.hook) hookKey = true;
  }

  player.isSprinting = sprint;

  // Steering
  const inputMagnitude = Math.hypot(moveX, moveY);
  if (inputMagnitude > 0.15) {
    player.targetAngle = Math.atan2(moveY, moveX);
    const targetSpeed = Math.min(1.0, inputMagnitude) * (player.isSprinting ? player.maxSpeed * 1.3 : player.maxSpeed);
    player.speed += (targetSpeed - player.speed) * (delta * 4.5);
  } else {
    // Decelerate pony naturally
    player.speed *= Math.pow(0.85, delta * 60);
  }

  // Mallet Swing charging
  if (swingKey) {
    player.swingCharge = Math.min(1.0, (player.swingCharge || 0) + delta * 1.6);
  } else if (player.swingCharge > 0) {
    // Release swing!
    player.isSwinging = true;
    player.swingProgress = 0;
  }

  // Defensive Mallet Hook
  if (hookKey && player.hookCooldown <= 0) {
    player.hookCooldown = 1.2;
    poloAudio.playMalletHook();
  }
}

// User 2 Controls for 2-Player Local (IJKL or Numpad)
function handlePlayer2Controls(player: PoloPlayer, p2Keys: Set<string>, delta: number) {
  let moveX = 0;
  let moveY = 0;
  const sprint = p2Keys.has('ControlRight') || p2Keys.has('Numpad0');
  const swingKey = p2Keys.has('Enter') || p2Keys.has('NumpadEnter');

  if (p2Keys.has('KeyI') || p2Keys.has('Numpad8')) moveY -= 1;
  if (p2Keys.has('KeyK') || p2Keys.has('Numpad5')) moveY += 1;
  if (p2Keys.has('KeyJ') || p2Keys.has('Numpad4')) moveX -= 1;
  if (p2Keys.has('KeyL') || p2Keys.has('Numpad6')) moveX += 1;

  player.isSprinting = sprint;

  const mag = Math.hypot(moveX, moveY);
  if (mag > 0.15) {
    player.targetAngle = Math.atan2(moveY, moveX);
    const targetSpeed = Math.min(1.0, mag) * (player.isSprinting ? player.maxSpeed * 1.3 : player.maxSpeed);
    player.speed += (targetSpeed - player.speed) * (delta * 4.5);
  } else {
    player.speed *= Math.pow(0.85, delta * 60);
  }

  if (swingKey) {
    player.swingCharge = Math.min(1.0, (player.swingCharge || 0) + delta * 1.6);
  } else if (player.swingCharge > 0) {
    player.isSwinging = true;
    player.swingProgress = 0;
  }
}

// AI Polo Tactics (Role-based AI: #1 Attacker, #2 Forward, #3 Playmaker, #4 Back Defender)
function handleAiPlayer(
  player: PoloPlayer,
  allPlayers: PoloPlayer[],
  ball: PoloBall,
  _lob: LineOfTheBall | null,
  matchState: MatchState,
  delta: number
) {
  const targetGoalX = (player.team === 'home') !== matchState.fieldSideSwapped ? GOAL_RIGHT_X : GOAL_LEFT_X;
  const defendGoalX = targetGoalX === GOAL_RIGHT_X ? GOAL_LEFT_X : GOAL_RIGHT_X;

  // Ball prediction
  const leadSeconds = 0.35;
  const predictedBallX = ball.x + ball.vx * leadSeconds;
  const predictedBallY = ball.y + ball.vy * leadSeconds;

  const distToBall = Math.hypot(ball.x - player.x, ball.y - player.y);

  // Determine role based on jersey number
  let targetX = predictedBallX;
  let targetY = predictedBallY;
  let shouldSwing = false;

  // Find which teammate is closest to ball
  const teammates = allPlayers.filter((p) => p.team === player.team);
  const closestTeammate = teammates.reduce((prev, curr) => {
    const prevDist = Math.hypot(ball.x - prev.x, ball.y - prev.y);
    const currDist = Math.hypot(ball.x - curr.x, ball.y - curr.y);
    return currDist < prevDist ? curr : prev;
  }, teammates[0]);

  const isClosest = closestTeammate.id === player.id;

  if (isClosest || distToBall < 110) {
    // Attack the ball! Ride up to offside (right side) of the ball for a clean strike towards goal
    const approachOffset = 26; // offside alignment
    targetX = predictedBallX;
    targetY = predictedBallY - approachOffset;

    if (distToBall < 56) {
      shouldSwing = true;
      player.swingCharge = 0.7 + Math.random() * 0.3;
    }
  } else {
    // Tactical positioning
    switch (player.jerseyNumber) {
      case 1: // Attacker: stay high up field waiting for pass
        targetX = targetGoalX > defendGoalX ? Math.max(ball.x + 240, FIELD_WIDTH * 0.7) : Math.min(ball.x - 240, FIELD_WIDTH * 0.3);
        targetY = ball.y + (player.y > FIELD_HEIGHT / 2 ? 60 : -60);
        break;
      case 2: // Midfielder / Engine: support near ball
        targetX = ball.x + (targetGoalX > defendGoalX ? 80 : -80);
        targetY = ball.y + 70;
        break;
      case 3: // Playmaker: center support
        targetX = ball.x - (targetGoalX > defendGoalX ? 120 : -120);
        targetY = FIELD_HEIGHT / 2 + (Math.sin(performance.now() * 0.001) * 80);
        break;
      case 4: // Back / Defender: guard the goal line
        targetX = defendGoalX + (defendGoalX < FIELD_WIDTH / 2 ? 140 : -140);
        targetY = Math.max(GOAL_CENTER_Y - GOAL_POST_HALF_SPAN, Math.min(GOAL_CENTER_Y + GOAL_POST_HALF_SPAN, ball.y));
        break;
    }
  }

  // Steer towards target
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const distToTarget = Math.hypot(dx, dy);

  if (distToTarget > 25) {
    player.targetAngle = Math.atan2(dy, dx);
    const sprintChance = isClosest && distToBall > 140 && player.stamina > 35;
    player.isSprinting = sprintChance;
    const targetSpeed = player.isSprinting ? player.maxSpeed * 1.25 : player.maxSpeed * 0.85;
    player.speed += (targetSpeed - player.speed) * (delta * 3.5);
  } else {
    player.speed *= Math.pow(0.88, delta * 60);
  }

  if (shouldSwing && !player.isSwinging) {
    player.isSwinging = true;
    player.swingProgress = 0;
  }
}
