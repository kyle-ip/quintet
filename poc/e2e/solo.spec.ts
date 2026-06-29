import { expect, test } from "@playwright/test";

test("solo game completes and shows summary", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("quintet-tutorial-seen", "1"));
  await page.reload();
  await expect(page.getByTestId("game-board")).toBeVisible();
  await expect(page.getByTestId("card-pool")).toBeVisible();

  const moves = await page.evaluate(() => window.__quintet!.playUntilFinished());
  expect(moves).toBe(25);

  await expect(page.getByText("Game complete")).toBeVisible();
  await expect(page.getByText("Final score")).toBeVisible();

  const score = await page.evaluate(() => window.__quintet!.getScore());
  expect(score).toBeGreaterThan(0);
});
