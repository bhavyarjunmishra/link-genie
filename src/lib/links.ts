import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, getRequest } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { generateShortCode, isReservedAlias } from "./short-url";

async function storage() {
  const { db } = await import("../../db/index.js");
  const schema = await import("../../db/schema.js");
  return { db, ...schema };
}

function owner() {
  let value = getCookie("link-genie-browser");
  if (!value || !/^[a-f0-9]{64}$/.test(value)) {
    value = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    setCookie("link-genie-browser", value, {
      httpOnly: true,
      secure: new URL(getRequest().url).protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return value;
}

export const listLinks = createServerFn({ method: "GET" }).handler(async () => {
  const key = owner();
  const { db, links, clicks } = await storage();
  const ownedLinks = await db
    .select({
      id: links.id,
      slug: links.slug,
      target_url: links.target_url,
      title: links.title,
      is_active: links.is_active,
      created_at: links.created_at,
    })
    .from(links)
    .where(eq(links.owner, key))
    .orderBy(desc(links.created_at));
  const events = await db
    .select({
      link_id: clicks.link_id,
      created_at: clicks.created_at,
      device: clicks.device,
      referrer: clicks.referrer,
      country: clicks.country,
    })
    .from(clicks)
    .innerJoin(links, eq(clicks.link_id, links.id))
    .where(eq(links.owner, key))
    .orderBy(desc(clicks.created_at));
  return { links: ownedLinks, clicks: events };
});

export const addLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      target_url: z
        .string()
        .url()
        .max(4096)
        .refine(
          (url) =>
            ["http:", "https:"].includes(new URL(url).protocol) &&
            !new URL(url).username &&
            !new URL(url).password,
          "Use an HTTP or HTTPS URL without credentials.",
        ),
      alias: z
        .string()
        .max(64)
        .regex(/^[a-zA-Z0-9_-]*$/),
      title: z.string().max(200),
    }),
  )
  .handler(async ({ data }) => {
    if (isReservedAlias(data.alias)) throw new Error("That alias is reserved. Choose another.");
    const key = owner();
    const { db, links } = await storage();
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = data.alias || generateShortCode();
      if (isReservedAlias(slug)) continue;
      const [created] = await db
        .insert(links)
        .values({ owner: key, slug, target_url: data.target_url, title: data.title || null })
        .onConflictDoNothing({ target: links.slug })
        .returning({ slug: links.slug });
      if (created) return created;
      if (data.alias) throw new Error("That alias is already taken.");
    }
    throw new Error("Unable to create a unique link. Please try again.");
  });

export const changeLink = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid(), active: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const key = owner();
    const { db, links } = await storage();
    const condition = and(eq(links.id, data.id), eq(links.owner, key));
    const changed =
      data.active === undefined
        ? await db.delete(links).where(condition).returning({ id: links.id })
        : await db
            .update(links)
            .set({ is_active: data.active })
            .where(condition)
            .returning({ id: links.id });
    if (!changed.length) throw new Error("This link is no longer available.");
    return { success: true };
  });

export const resolveLink = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z
        .string()
        .max(64)
        .regex(/^[a-zA-Z0-9_-]+$/),
      referrer: z.string().max(4096),
    }),
  )
  .handler(async ({ data }) => {
    const { db, links, clicks } = await storage();
    const [link] = await db
      .select()
      .from(links)
      .where(and(eq(links.slug, data.code), eq(links.is_active, true)))
      .limit(1);
    if (!link) return null;
    const agent = getRequest().headers.get("user-agent") || "";
    const device = /iPad|Tablet/i.test(agent)
      ? "Tablet"
      : /Mobi|Android|iPhone/i.test(agent)
        ? "Mobile"
        : "Desktop";
    try {
      await db.insert(clicks).values({ link_id: link.id, device, referrer: data.referrer || null });
    } catch {
      // A click-recording failure must not prevent reaching the destination.
    }
    return { target_url: link.target_url };
  });
