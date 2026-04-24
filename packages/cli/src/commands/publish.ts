import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import { Command } from "commander";
import { ShareHtmlClient } from "../lib/api-client.js";
import * as spinner from "../lib/spinner.js";

export const publishCommand = new Command("publish")
  .description("Publish a markdown file and get a shareable URL")
  .argument("<file>", "Path to markdown file")
  .option("-t, --title <title>", "Document title (auto-extracted from first H1)")
  .option("-p, --private", "Make document private", false)
  .option("-s, --slug <slug>", "Custom filename slug (e.g. 'changelog')")
  .option("-P, --password <password>", "Set password protection for the share")
  .action(async (file: string, opts: { title?: string; private?: boolean; slug?: string; password?: string }) => {
    try {
      const content = readFileSync(file, "utf-8");
      const filename = basename(file);
      const size = statSync(file).size;

      if (!content.trim()) {
        console.error("Error: File is empty.");
        process.exit(2);
      }
      if (size > 1024 * 1024) {
        console.error("Error: File exceeds 1MB limit.");
        process.exit(2);
      }

      spinner.start("Publishing...");
      const client = new ShareHtmlClient();
      const result = await client.publish(content, filename, {
        title: opts.title,
        isPrivate: opts.private,
        customSlug: opts.slug,
        password: opts.password,
      });
      spinner.succeed("Published!");

      console.log(`  URL:  ${result.url}`);
      console.log(`  Slug: ${result.slug}`);
      if (result.title) console.log(`  Title: ${result.title}`);
      if (opts.password) console.log(`  Password protected`);
      process.exit(0);
    } catch (err) {
      spinner.fail("Publishing failed");
      console.error(err instanceof Error ? err.message : err);
      process.exit(3);
    }
  });
