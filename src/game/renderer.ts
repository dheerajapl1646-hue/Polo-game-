import {
  FieldType,
  LineOfTheBall,
  MatchState,
  PoloBall,
  PoloPlayer,
  TeamConfig,
  TurfDivot
} from '../types/polo';
import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  GOAL_CENTER_Y,
  GOAL_LEFT_X,
  GOAL_POST_HALF_SPAN,
  GOAL_RIGHT_X,
  determineShotType
} from './physics';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class PoloRenderer {
  private particles: Particle[] = [];

  public addDivotParticle(x: number, y: number, fieldType: FieldType) {
    const count = 3 + Math.floor(Math.random() * 3);
    const colors =
      fieldType === 'turf'
        ? ['#14532d', '#15803d', '#451a03', '#713f12']
        : fieldType === 'snow'
        ? ['#f8fafc', '#e2e8f0', '#cbd5e1']
        : ['#ca8a04', '#a16207', '#78350f'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3.5,
        alpha: 0.9,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.4
      });
    }
  }

  public addHitSparkles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#fef08a',
        size: 2 + Math.random() * 2,
        alpha: 1.0,
        life: 0,
        maxLife: 0.3
      });
    }
  }

  public updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    camera: { x: number; y: number; zoom: number },
    players: PoloPlayer[],
    ball: PoloBall,
    lob: LineOfTheBall | null,
    divots: TurfDivot[],
    matchState: MatchState,
    homeTeam: TeamConfig,
    awayTeam: TeamConfig,
    fieldType: FieldType = 'turf'
  ) {
    ctx.save();
    // Clear background
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Apply Camera transform (follow user or ball)
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw Field Turf and Markings
    this.drawField(ctx, fieldType);

    // 2. Draw Divots on grass
    this.drawDivots(ctx, divots);

    // 3. Draw Line of the Ball (Right of Way corridor)
    if (lob && lob.active) {
      this.drawLineOfTheBall(ctx, lob);
    }

    // 4. Draw Particles (kicked grass & dust)
    this.drawParticles(ctx);

    // 5. Draw Horses and Players sorted by Y position for proper isometric depth
    const sortedEntities = [...players].sort((a, b) => a.y - b.y);

    sortedEntities.forEach((player) => {
      this.drawPoloRiderAndPony(ctx, player, homeTeam, awayTeam);
    });

    // 6. Draw Polo Ball & Shadow
    this.drawPoloBall(ctx, ball, fieldType);

    // 7. Draw Goal Posts & Wicker Padded uprights
    this.drawGoalPosts(ctx);

    // 8. Aim Arrow & Shot Gauge for User
    const userPlayer = players.find((p) => p.isUser);
    if (userPlayer) {
      this.drawAimGuide(ctx, userPlayer, ball);
    }

    ctx.restore();

    // 9. Screen space: Minimap / Radar
    this.drawRadar(ctx, canvasWidth, canvasHeight, players, ball, homeTeam, awayTeam);
  }

  private drawField(ctx: CanvasRenderingContext2D, fieldType: FieldType) {
    // Outer runoff / safety border
    ctx.fillStyle = fieldType === 'turf' ? '#0f381e' : fieldType === 'snow' ? '#e2e8f0' : '#854d0e';
    ctx.fillRect(-80, -80, FIELD_WIDTH + 160, FIELD_HEIGHT + 160);

    // Main Field
    if (fieldType === 'turf') {
      // Mowed lawn bands (alternating emerald and spring grass stripes)
      const stripeWidth = 90;
      const numStripes = Math.ceil(FIELD_WIDTH / stripeWidth);
      for (let i = 0; i < numStripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1b4d2e' : '#1e5633';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, FIELD_HEIGHT);
      }
    } else if (fieldType === 'snow') {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
      // Subtle ice sheen
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
    } else {
      // Arena compacted sand
      ctx.fillStyle = '#a16207';
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
    }

    // Sideboards (wooden boards running along the sides of the pitch)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 56, FIELD_WIDTH, 8); // Top board
    ctx.fillRect(0, FIELD_HEIGHT - 64, FIELD_WIDTH, 8); // Bottom board

    // Board highlights
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 56, FIELD_WIDTH, 2);
    ctx.fillRect(0, FIELD_HEIGHT - 64, FIELD_WIDTH, 2);

    // White Chalk Markings
    ctx.strokeStyle = fieldType === 'snow' ? '#0284c7' : 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2.5;

    // Outer Boundary lines
    ctx.strokeRect(60, 60, FIELD_WIDTH - 120, FIELD_HEIGHT - 120);

    // Center Line
    ctx.beginPath();
    ctx.moveTo(FIELD_WIDTH / 2, 60);
    ctx.lineTo(FIELD_WIDTH / 2, FIELD_HEIGHT - 60);
    ctx.stroke();

    // Center Circle (throw-in line)
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    // 30-yard, 40-yard, and 60-yard penalty marker lines
    const penaltyDistances = [
      { x: 300, label: '30Y' },
      { x: 420, label: '40Y' },
      { x: 600, label: '60Y' },
      { x: FIELD_WIDTH - 300, label: '30Y' },
      { x: FIELD_WIDTH - 420, label: '40Y' },
      { x: FIELD_WIDTH - 600, label: '60Y' }
    ];

    ctx.setLineDash([8, 8]);
    penaltyDistances.forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(p.x, 60);
      ctx.lineTo(p.x, FIELD_HEIGHT - 60);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Penalty spots
    [300, 420, 600, FIELD_WIDTH - 300, FIELD_WIDTH - 420, FIELD_WIDTH - 600].forEach((px) => {
      ctx.beginPath();
      ctx.arc(px, FIELD_HEIGHT / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }

  private drawDivots(ctx: CanvasRenderingContext2D, divots: TurfDivot[]) {
    divots.forEach((d) => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);

      if (d.repaired) {
        // Flattened stomped turf
        ctx.fillStyle = 'rgba(21, 128, 61, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size, d.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Raw divot hole + chunk of grass flipped up
        ctx.fillStyle = '#291404'; // dark soil hole
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size * 0.7, d.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#14532d'; // grass clump
        ctx.beginPath();
        ctx.arc(d.size * 0.5, -d.size * 0.3, d.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawLineOfTheBall(ctx: CanvasRenderingContext2D, lob: LineOfTheBall) {
    const corridorLength = 340;
    const endX = lob.startX + lob.dirX * corridorLength;
    const endY = lob.startY + lob.dirY * corridorLength;

    ctx.save();
    // Subtle golden right-of-way corridor
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(lob.startX, lob.startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Right of way banner indicator
    ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('LINE OF THE BALL (RIGHT OF WAY)', (lob.startX + endX) / 2 - 80, (lob.startY + endY) / 2 - 10);

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private drawPoloRiderAndPony(
    ctx: CanvasRenderingContext2D,
    player: PoloPlayer,
    homeTeam: TeamConfig,
    awayTeam: TeamConfig
  ) {
    const team = player.team === 'home' ? homeTeam : awayTeam;

    ctx.save();
    ctx.translate(player.x, player.y);

    // Horse Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(3, 8, 30, 14, player.angle, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(player.angle);

    // 1. HORSE LEGS (Gallop animation cycles)
    const legPhase = player.animFrame * Math.PI * 2;
    const legExtension = Math.sin(legPhase) * 12;
    const hindExtension = Math.cos(legPhase) * 12;

    ctx.strokeStyle = player.horse.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Forelegs
    ctx.beginPath();
    ctx.moveTo(14, -8);
    ctx.lineTo(26 + legExtension, -10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(26 - legExtension, 10);
    ctx.stroke();

    // Hind legs
    ctx.beginPath();
    ctx.moveTo(-18, -8);
    ctx.lineTo(-30 - hindExtension, -10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.lineTo(-30 + hindExtension, 10);
    ctx.stroke();

    // White Polo Bandages / Leg Wraps (Iconic safety wraps on all 4 cannon bones)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    [
      { x: 20 + legExtension * 0.5, y: -9 },
      { x: 20 - legExtension * 0.5, y: 9 },
      { x: -24 - hindExtension * 0.5, y: -9 },
      { x: -24 + hindExtension * 0.5, y: 9 }
    ].forEach((wrap) => {
      ctx.beginPath();
      ctx.arc(wrap.x, wrap.y, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 2. HORSE BODY (Torso, muscular flanks)
    ctx.fillStyle = player.horse.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. HORSE NECK & HEAD
    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.lineTo(28, -4);
    ctx.lineTo(34, 0);
    ctx.lineTo(28, 4);
    ctx.lineTo(10, 6);
    ctx.closePath();
    ctx.fill();

    // Mane
    ctx.fillStyle = player.horse.maneColor;
    ctx.beginPath();
    ctx.ellipse(18, 0, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(27, -5);
    ctx.lineTo(31, -7);
    ctx.lineTo(29, -3);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(27, 5);
    ctx.lineTo(31, 7);
    ctx.lineTo(29, 3);
    ctx.fill();

    // Polo Braided Tail Wrap (tucked up tightly for polo safety)
    ctx.fillStyle = player.horse.tailColor;
    ctx.beginPath();
    ctx.ellipse(-24, 0, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = team.accentColor;
    ctx.fillRect(-26, -2, 4, 4); // Tail wrap tape

    // 4. SADDLE & TEAM SADDLE BLANKET
    ctx.fillStyle = team.primaryColor;
    ctx.fillRect(-10, -9, 20, 18);
    ctx.strokeStyle = team.secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -9, 20, 18);

    // Leather Saddle
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(-1, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. RIDER (Polo jersey, white breeches, brown tall boots, helmet)
    // White Breeches
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(-2, -5, 6, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(-2, 5, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brown Leather Polo Boots
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-4, -8, 6, 3);
    ctx.fillRect(-4, 5, 6, 3);

    // Polo Jersey (Upper body)
    ctx.fillStyle = team.primaryColor;
    ctx.beginPath();
    ctx.arc(-1, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = team.secondaryColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Jersey Position Number on Back (#1, #2, #3, #4)
    ctx.fillStyle = team.secondaryColor;
    ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.jerseyNumber.toString(), -2, 0);

    // Rider Helmet with face guard (Facing forward)
    ctx.fillStyle = team.helmetColor;
    ctx.beginPath();
    ctx.arc(6, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Helmet Peak/Brim
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(9, 0, 3, -Math.PI / 3, Math.PI / 3);
    ctx.fill();

    // 6. MALLET & SWING ANIMATION
    // Mallet held in right hand (offside: positive Y in local coordinate space)
    ctx.save();
    const rightHandX = 4;
    const rightHandY = 8;
    ctx.translate(rightHandX, rightHandY);

    let malletAngle = 0.2; // resting carry angle
    if (player.isSwinging) {
      // Dynamic swing arc: -PI/2 -> +PI/2
      malletAngle = -Math.PI * 0.8 + player.swingProgress * Math.PI * 1.6;
    } else if (player.swingCharge > 0) {
      // Wind-up backswing
      malletAngle = -0.4 - player.swingCharge * 1.2;
    } else if (player.hookCooldown > 0) {
      // Defensive hook posture extended forward
      malletAngle = 1.4;
    }

    ctx.rotate(malletAngle);

    // Mallet cane shaft
    ctx.strokeStyle = '#ca8a04'; // Cane bamboo
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    // Mallet Cigar-shaped wooden head (Ash / Tipa wood)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(22, -4, 5, 8);

    ctx.restore();

    ctx.restore(); // Back to world space

    // 7. OVERHEAD HUD OVER PLAYER
    // Player Identification Ring
    if (player.isUser || player.isPlayer2) {
      ctx.save();
      ctx.strokeStyle = player.isUser ? '#facc15' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Label (YOU / P2)
      ctx.fillStyle = player.isUser ? '#facc15' : '#38bdf8';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.isUser ? 'YOU' : 'P2', player.x, player.y - 32);

      // Stamina Bar
      const barWidth = 32;
      const barHeight = 4;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(player.x - barWidth / 2, player.y + 30, barWidth, barHeight);
      ctx.fillStyle = player.stamina > 30 ? '#22c55e' : '#ef4444';
      ctx.fillRect(player.x - barWidth / 2, player.y + 30, barWidth * (player.stamina / 100), barHeight);

      ctx.restore();
    }
  }

  private drawPoloBall(ctx: CanvasRenderingContext2D, ball: PoloBall, fieldType: FieldType) {
    // Ball Shadow (Z-axis height offset)
    const shadowOffset = ball.z * 0.4;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(ball.x + shadowOffset * 0.5, ball.y + shadowOffset, ball.radius, ball.radius * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ball Motion Trail
    if (ball.trail.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
      for (let i = 1; i < ball.trail.length; i++) {
        ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
      }
      ctx.stroke();
    }

    // Ball Body (drawn at y - z)
    const ballY = ball.y - ball.z;
    const isSnow = fieldType === 'snow';
    const ballColor = isSnow ? '#f97316' : '#ffffff'; // Neon Orange in Snow Polo!

    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(ball.x, ballY, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // 3D Ball highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(ball.x - 2, ballY - 2, ball.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isSnow ? '#c2410c' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  private drawGoalPosts(ctx: CanvasRenderingContext2D) {
    const time = performance.now() * 0.003;
    const flagWave = Math.sin(time) * 4;

    // Left and Right goal posts
    [GOAL_LEFT_X, GOAL_RIGHT_X].forEach((gx) => {
      [GOAL_CENTER_Y - GOAL_POST_HALF_SPAN, GOAL_CENTER_Y + GOAL_POST_HALF_SPAN].forEach((gy) => {
        ctx.save();
        // Wicker Padded upright base (Authentic polo goal posts are wicker or padded so horses don't get injured)
        ctx.fillStyle = '#fef3c7'; // Cream padded leather
        ctx.beginPath();
        ctx.arc(gx, gy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Goal Post Flag Fluttering
        ctx.fillStyle = gx === GOAL_LEFT_X ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + 16, gy - 8 + flagWave);
        ctx.lineTo(gx + 16, gy + 8 + flagWave);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    });
  }

  private drawAimGuide(ctx: CanvasRenderingContext2D, user: PoloPlayer, ball: PoloBall) {
    const { shotType, distance } = determineShotType(user, ball);

    // In striking distance indicator
    if (distance < 75) {
      ctx.save();
      ctx.translate(ball.x, ball.y - 18);

      // Shot type text
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      const cleanName = shotType.replace(/_/g, ' ').toUpperCase();
      ctx.fillText(cleanName, 0, 0);

      // Swing Power Meter when charging
      if (user.swingCharge > 0) {
        const pw = 40;
        const ph = 5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-pw / 2, 4, pw, ph);

        const powerColor = user.swingCharge > 0.8 ? '#ef4444' : user.swingCharge > 0.5 ? '#f59e0b' : '#22c55e';
        ctx.fillStyle = powerColor;
        ctx.fillRect(-pw / 2, 4, pw * user.swingCharge, ph);
      }

      ctx.restore();
    }
  }

  private drawRadar(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    players: PoloPlayer[],
    ball: PoloBall,
    homeTeam: TeamConfig,
    awayTeam: TeamConfig
  ) {
    const radarW = 160;
    const radarH = (radarW * FIELD_HEIGHT) / FIELD_WIDTH;
    const radarX = canvasWidth - radarW - 20;
    const radarY = canvasHeight - radarH - 20;

    ctx.save();
    // Glass container with Artistic Flair luxury green and gold border
    ctx.fillStyle = 'rgba(10, 26, 18, 0.9)';
    ctx.fillRect(radarX, radarY, radarW, radarH);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(radarX, radarY, radarW, radarH);

    // Center line on radar
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.beginPath();
    ctx.moveTo(radarX + radarW / 2, radarY);
    ctx.lineTo(radarX + radarW / 2, radarY + radarH);
    ctx.stroke();

    // Scale function
    const toRadarX = (wx: number) => radarX + (wx / FIELD_WIDTH) * radarW;
    const toRadarY = (wy: number) => radarY + (wy / FIELD_HEIGHT) * radarH;

    // Draw ball on radar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(toRadarX(ball.x), toRadarY(ball.y), 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw players
    players.forEach((p) => {
      ctx.fillStyle = p.team === 'home' ? homeTeam.primaryColor : awayTeam.primaryColor;
      ctx.beginPath();
      ctx.arc(toRadarX(p.x), toRadarY(p.y), p.isUser ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (p.isUser) {
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    ctx.restore();
  }
}
