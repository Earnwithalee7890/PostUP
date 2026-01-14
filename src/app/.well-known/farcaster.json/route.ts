import { NextResponse } from "next/server";

export async function GET() {
    const manifest = {
        frame: {
            name: "Post Up",
            version: "1",
            iconUrl: "https://post-up-zeta.vercel.app/logos/postup_p.png",
            homeUrl: "https://post-up-zeta.vercel.app",
            imageUrl: "https://post-up-zeta.vercel.app/og-image.png",
            buttonTitle: "Launch Post Up",
            splashImageUrl: "https://post-up-zeta.vercel.app/og-image.png",
            splashBackgroundColor: "#1a1a2e",
            webhookUrl: "https://post-up-zeta.vercel.app/api/webhook",
            subtitle: "Grow your onchain audience",
            description: "The task-based onchain growth engine. Create campaigns, complete tasks, and earn crypto rewards.",
            primaryCategory: "social",
            tags: ["postup", "post", "engage", "earn", "rewards"],
            screenshotUrls: ["https://post-up-zeta.vercel.app/og-image.png"],
            heroImageUrl: "https://post-up-zeta.vercel.app/og-image.png",
            tagline: "grow",
            ogTitle: "Grow your onchain audience",
            ogDescription: "Task-based onchain growth engine. Promote content, earn rewards",
            ogImageUrl: "https://post-up-zeta.vercel.app/og-image.png",
            castShareUrl: "https://post-up-zeta.vercel.app"
        },
        accountAssociation: {
            header: "eyJmaWQiOjMzODA2MCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEJDNzRlQTExNWY0ZjMwQ2U3MzdGMzk0YTkzNzAxQWJkMTY0MmQ3RDEifQ",
            payload: "eyJkb21haW4iOiJwb3N0LXVwLXpldGEudmVyY2VsLmFwcCJ9",
            signature: "x4YKn7yBGVd1bSe+4tJusj8jGs3w5UfMUdgzlx+wRUF/B7PbtjF8nSak2zYv3AcxjAIlwHx+TO97rTPQYx8Tzhs="
        }
    };

    return NextResponse.json(manifest, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
        },
    });
}
