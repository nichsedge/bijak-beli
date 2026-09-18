import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface BrandCheckResult {
  id: string;
  name: string;
  searchFound: boolean;
  searchCardCount: number;
  url: string;
  brandNameHeader: string;
  parentCompany: string;
  ultimateOwner: string;
  halalBadge: string;
  bpomBadge: string;
  beiBadge: string;
  power200Badge: string;
  conglomerateGroup: string;
  conglomerateTycoon: string;
  sisterBrands: string[];
  transparencySourcesCount: number;
  sourcesList: Array<{ title: string; publisher?: string; docType?: string; confidence?: string }>;
  controversiesCount: number;
  alternativesCount: number;
  alternativesList: Array<{
    name: string;
    parent?: string;
    conglomerate?: string;
    relationType?: string;
    isSameOwner?: boolean;
  }>;
  sameGroupCount: number;
  differentGroupCount: number;
  unknownGroupCount: number;
  hasEmptyStateForAlternatives: boolean;
  desktopAssertions: Record<string, boolean | string | number>;
  mobileAssertions: Record<string, boolean | string | number>;
  notes: string[];
}

const BRANDS_TO_TEST = [
  { id: "indomie", query: "Indomie", expectedName: "Indomie" },
  { id: "aqua", query: "Aqua", expectedName: "Aqua" },
  { id: "pepsodent", query: "Pepsodent", expectedName: "Pepsodent" },
  { id: "bimoli", query: "Bimoli", expectedName: "Bimoli" },
  { id: "sari-roti", query: "Sari Roti", expectedName: "Sari Roti" },
];

async function main() {
  const stage = process.argv[2] || "after";
  const outDir = path.join(process.cwd(), ".hermes", "screenshots", stage);
  fs.mkdirSync(outDir, { recursive: true });

  const reportPath = path.join(process.cwd(), ".hermes", `brand-flows-${stage}.json`);

  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results: BrandCheckResult[] = [];

  try {
    for (const b of BRANDS_TO_TEST) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      });
      const page = await context.newPage();

      console.log(`\n=== Testing [${b.query}] (${stage}) ===`);

      // 1. Search flow
      await page.goto("http://localhost:3888/search");
      await page.waitForSelector("#search-main", { timeout: 10000 });
      await page.fill("#search-main", b.query);
      await page.waitForTimeout(600);

      const cards = page.locator("a[href^='/brand/']");
      const count = await cards.count();
      let found = false;
      let targetCard = null;

      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const href = await card.getAttribute("href");
        if (href === `/brand/${b.id}`) {
          found = true;
          targetCard = card;
          break;
        }
      }

      await page.screenshot({ path: path.join(outDir, `${b.id}-01-search.png`) });

      // Enforce search success: missing card must fail
      if (!found || !targetCard) {
        throw new Error(`Search failure: Card for brand '${b.id}' was not found in search results.`);
      }

      // 2. Navigate to brand detail (fixing navigation race)
      await Promise.all([
        page.waitForURL(`**/brand/${b.id}`, { timeout: 15000 }),
        targetCard.click(),
      ]);

      // Wait for exact brand heading after click
      await page.waitForFunction(
        (expected) => {
          const h1 = document.querySelector("h1");
          return h1 && h1.innerText.trim().toLowerCase() === expected.toLowerCase();
        },
        b.expectedName,
        { timeout: 15000 }
      );

      const currentUrl = page.url();
      if (!currentUrl.includes(`/brand/${b.id}`)) {
        throw new Error(`URL navigation race failure: Expected /brand/${b.id} but got ${currentUrl}`);
      }

      await page.screenshot({ path: path.join(outDir, `${b.id}-02-overview.png`), fullPage: true });

      // Extract header info
      const brandNameHeader = await page.locator("h1").innerText().catch(() => "");
      if (brandNameHeader.trim().toLowerCase() !== b.expectedName.toLowerCase()) {
        throw new Error(`Heading mismatch: Expected '${b.expectedName}' but got '${brandNameHeader}'`);
      }

      const parentCompany = await page.locator("[class*='parentLine'] span").first().innerText().catch(() => "");
      const ultimateOwner = await page.locator("[class*='ultimateOwner']").innerText().catch(() => "");
      const halalBadge = await page.locator("a[href*='bpjph'], span[class*='badge-halal']").innerText().catch(() => "");
      const bpomBadge = await page.locator("a[href*='pom.go.id'], a[href*='kemkes.go.id']").innerText().catch(() => "");
      const beiBadge = await page.locator("a[href*='idx.co.id']").innerText().catch(() => "");
      const power200Badge = await page.locator("a[href='/power']").innerText().catch(() => "");
      const conglomerateGroup = await page.locator("[class*='conglomerateName']").innerText().catch(() => "");
      const conglomerateTycoon = await page.locator("[class*='conglomerateTycoon'] strong").innerText().catch(() => "");

      const sisterBrandElements = page.locator("[class*='sisterBrandPill']");
      const sisterCount = await sisterBrandElements.count();
      const sisterBrands: string[] = [];
      for (let i = 0; i < sisterCount; i++) {
        sisterBrands.push(await sisterBrandElements.nth(i).innerText());
      }

      // 3. Transparency tab (enforce missing tab failure)
      const transTab = page.locator("button.tab", { hasText: /Transparansi|Transparency/i });
      if ((await transTab.count()) === 0) {
        throw new Error(`Missing tab failure: Transparency tab missing on /brand/${b.id}`);
      }
      await transTab.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, `${b.id}-03-transparency.png`), fullPage: true });

      const sourceCards = page.locator("[class*='sourceCard']");
      const sourcesCount = await sourceCards.count();
      const sourcesList: Array<{ title: string; publisher?: string; docType?: string; confidence?: string }> = [];
      for (let i = 0; i < sourcesCount; i++) {
        const sc = sourceCards.nth(i);
        const sTitle = await sc.locator("[class*='sourceTitle']").innerText().catch(() => "");
        const sPub = await sc.locator("[class*='sourceFooter'] span").innerText().catch(() => "");
        const sType = await sc.locator("[class*='docBadge']").innerText().catch(() => "");
        const sConf = await sc.locator("[class*='confBadge']").innerText().catch(() => "");
        sourcesList.push({ title: sTitle, publisher: sPub, docType: sType, confidence: sConf });
      }

      const controversyItems = page.locator("[class*='timelineItem']");
      const controversiesCount = await controversyItems.count();

      // 4. Alternatives tab (enforce missing tab failure)
      const altTab = page.locator("button.tab", { hasText: /Alternatif|Alternatives/i });
      if ((await altTab.count()) === 0) {
        throw new Error(`Missing tab failure: Alternatives tab missing on /brand/${b.id}`);
      }
      await altTab.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, `${b.id}-04-alternatives.png`), fullPage: true });

      const altCards = page.locator("[class*='alternativesContent'] a[href^='/brand/']");
      const altsCount = await altCards.count();
      const altList: Array<{
        name: string;
        parent?: string;
        conglomerate?: string;
        relationType?: string;
        isSameOwner?: boolean;
      }> = [];

      for (let i = 0; i < altsCount; i++) {
        const ac = altCards.nth(i);
        const aName = await ac.locator("[class*='name']").first().innerText().catch(() => "");
        const aParent = await ac.locator("[class*='parent']").innerText().catch(() => "");
        const aConglom = await ac.locator("[class*='conglomerateBadge']").innerText().catch(() => "");

        // Check relation band text
        const sameBand = await ac.locator("[class*='sameGroupBand']").innerText().catch(() => "");
        const diffBand = await ac.locator("[class*='differentGroupBand']").innerText().catch(() => "");
        const unkBand = await ac.locator("[class*='unknownGroupBand']").innerText().catch(() => "");

        let rel = "none";
        let isSame = false;
        if (sameBand) {
          rel = "same-group";
          isSame = true;
        } else if (diffBand) {
          rel = "different-group";
        } else if (unkBand) {
          rel = "unknown";
        }

        altList.push({
          name: aName,
          parent: aParent,
          conglomerate: aConglom,
          relationType: rel,
          isSameOwner: isSame,
        });
      }

      const sameGroupCount = page.locator("[class*='sameGroupWarningCard'] a[href^='/brand/']");
      const sameCount = await sameGroupCount.count();
      const differentGroupCount = page.locator("[class*='differentGroupBand']");
      const diffCount = await differentGroupCount.count();
      const unknownGroupCount = page.locator("[class*='unknownGroupBand']");
      const unkCount = await unknownGroupCount.count();

      const emptyState = (await page.locator("[class*='alternativesContent'] [class*='altEmptyCard']").count()) > 0;

      // Desktop UI assertions
      const desktopAssertions: Record<string, boolean | string | number> = {
        correctUrl: currentUrl === `http://localhost:3888/brand/${b.id}`,
        exactH1: brandNameHeader.trim() === b.expectedName,
        tabsCount: (await page.locator("button.tab").count()) >= 3,
        alternativesTabActive: (await page.locator("button.tab.active").innerText()).includes("Alternatif") || (await page.locator("button.tab.active").innerText()).includes("Alternatives"),
        totalAlternativesCards: altsCount,
        hasEmptyState: emptyState,
        sameGroupCards: sameCount,
        differentGroupCards: diffCount,
      };

      // 5. Mobile viewport tests & assertions
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(outDir, `${b.id}-05-mobile.png`) });

      const mobileH1Visible = await page.locator("h1").isVisible();
      const mobileTabsVisible = (await page.locator("button.tab").count()) >= 3;
      const mobileEmptyStateVisible = emptyState ? await page.locator("[class*='altEmptyCard']").isVisible() : true;

      const mobileAssertions: Record<string, boolean | string | number> = {
        viewportWidth: 390,
        viewportHeight: 844,
        h1Visible: mobileH1Visible,
        tabsVisible: mobileTabsVisible,
        emptyStateVisibleIfEmpty: mobileEmptyStateVisible,
      };

      const notes: string[] = [];
      if (altsCount === 0) {
        notes.push("Zero alternatives cataloged (honest empty state)");
      }
      if (sameCount > 0) {
        notes.push(`Contains ${sameCount} same-group warning alternatives`);
      }
      if (diffCount > 0) {
        notes.push(`Contains ${diffCount} different-group alternatives`);
      }

      const brandResult: BrandCheckResult = {
        id: b.id,
        name: b.expectedName,
        searchFound: found,
        searchCardCount: count,
        url: currentUrl,
        brandNameHeader,
        parentCompany,
        ultimateOwner,
        halalBadge,
        bpomBadge,
        beiBadge,
        power200Badge,
        conglomerateGroup,
        conglomerateTycoon,
        sisterBrands,
        transparencySourcesCount: sourcesCount,
        sourcesList,
        controversiesCount,
        alternativesCount: altsCount,
        alternativesList: altList,
        sameGroupCount: sameCount,
        differentGroupCount: diffCount,
        unknownGroupCount: unkCount,
        hasEmptyStateForAlternatives: emptyState,
        desktopAssertions,
        mobileAssertions,
        notes,
      };

      results.push(brandResult);

      // Persist per-brand progress so timeouts cannot lose it
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      console.log(`✓ Completed and persisted progress for ${b.expectedName} to ${reportPath}`);

      await context.close();
    }

    await browser.close();
    console.log(`\nAll 5 brand flows successfully verified and recorded in ${reportPath}`);
  } catch (err) {
    console.error("\nFATAL RECORDER ERROR:", err);
    await browser.close();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Uncaught exception in recorder:", err);
  process.exit(1);
});
