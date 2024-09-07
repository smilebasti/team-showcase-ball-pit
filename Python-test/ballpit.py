import pygame
import random
import os
import math
import time

# Window dimensions
WIDTH, HEIGHT = 800, 600

# Pit properties
PIT_RADIUS = 50

# Ball properties
INITIAL_BALL_RADIUS = 40
BALL_RADIUS = 20

# Colors
WHITE = (255, 255, 255)
RED = (255, 0, 0)

class Ball:
    def __init__(self, x, y, image):
        self.x = x
        self.y = y
        self.image = image
        self.velocity_x = random.uniform(-2, 2)
        self.velocity_y = random.uniform(-2, 2)
        self.radius = INITIAL_BALL_RADIUS
        self.scale_factor = (BALL_RADIUS / INITIAL_BALL_RADIUS) ** (1 / 60)  # scale factor to reach BALL_RADIUS in 3 seconds

    def update(self):
        self.x += self.velocity_x
        self.y += self.velocity_y

        # Attract to center
        dx = WIDTH // 2 - self.x
        dy = HEIGHT // 2 - self.y
        distance = math.hypot(dx, dy)
        if distance > 0:
            self.velocity_x += dx / distance * 0.1
            self.velocity_y += dy / distance * 0.1

        # Check if ball is in pit
        if math.hypot(self.x - WIDTH // 2, self.y - HEIGHT // 2) < PIT_RADIUS + self.radius:
            self.velocity_x *= 0.9
            self.velocity_y *= 0.9

        # Scale ball radius
        self.radius *= self.scale_factor
        if self.radius < BALL_RADIUS:
            self.radius = BALL_RADIUS

    def draw(self, screen):
        # Draw a circle to represent the ball
        pygame.draw.circle(screen, (0, 0, 0), (int(self.x), int(self.y)), int(self.radius))

def main():
    global PIT_RADIUS
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()

    # Load ball images
    ball_images = []
    for filename in os.listdir('balls'):
        if filename.endswith('.jpg'):
            ball_images.append(pygame.image.load(os.path.join('balls', filename)))

    # Create balls
    balls = []
    last_ball_time = time.time()
    for _ in range(len(ball_images)):  # create a ball for each image
        x = random.randint(0, WIDTH)
        y = random.randint(0, HEIGHT)
        while math.hypot(x - WIDTH // 2, y - HEIGHT // 2) < PIT_RADIUS:
            x = random.randint(0, WIDTH)
            y = random.randint(0, HEIGHT)
        balls.append(Ball(x, y, ball_images[_]))

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        screen.fill(WHITE)

        # Draw pit
        pygame.draw.circle(screen, RED, (WIDTH // 2, HEIGHT // 2), PIT_RADIUS, 2)

        # Update and draw balls
        for i, ball in enumerate(balls):
            ball.update()
            ball.draw(screen)

            # Check for collision with other balls
            for j, other_ball in enumerate(balls):
                if i != j:
                    distance = math.hypot(ball.x - other_ball.x, ball.y - other_ball.y)
                    if distance < ball.radius + other_ball.radius:
                        ball.velocity_x, other_ball.velocity_x = other_ball.velocity_x, ball.velocity_x
                        ball.velocity_y, other_ball.velocity_y = other_ball.velocity_y, ball.velocity_y

        # Spawn a new ball every 3 seconds
        current_time = time.time()
        if current_time - last_ball_time > 3:
            last_ball_time = current_time
            x = random.randint(0, WIDTH)
            y = random.randint(0, HEIGHT)
            while math.hypot(x - WIDTH // 2, y - HEIGHT // 2) < PIT_RADIUS:
                x = random.randint(0, WIDTH)
                y = random.randint(0, HEIGHT)
            balls.append(Ball(x, y, random.choice(ball_images)))
            PIT_RADIUS += 2

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

if __name__ == '__main__':
    main()