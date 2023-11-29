import { test, expect } from "@playwright/test";

import { PlaywrightFixture } from "./helpers/playwright-fixture.js";
import type { Fixture, AppFixture } from "./helpers/create-fixture.js";
import {
  createAppFixture,
  createFixture,
  js,
} from "./helpers/create-fixture.js";

let fixture: Fixture;
let appFixture: AppFixture;

////////////////////////////////////////////////////////////////////////////////
// 💿 👋 Hola! It's me, Dora the Remix Disc, I'm here to help you write a great
// bug report pull request.
//
// You don't need to fix the bug, this is just to report one.
//
// The pull request you are submitting is supposed to fail when created, to let
// the team see the erroneous behavior, and understand what's going wrong.
//
// If you happen to have a fix as well, it will have to be applied in a subsequent
// commit to this pull request, and your now-succeeding test will have to be moved
// to the appropriate file.
//
// First, make sure to install dependencies and build Remix. From the root of
// the project, run this:
//
//    ```
//    yarn && yarn build
//    ```
//
// Now try running this test:
//
//    ```
//    yarn bug-report-test
//    ```
//
// You can add `--watch` to the end to have it re-run on file changes:
//
//    ```
//    yarn bug-report-test --watch
//    ```
////////////////////////////////////////////////////////////////////////////////

test.beforeEach(async ({ context }) => {
  await context.route(/_data/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    route.continue();
  });
});

const nonceValue = "secretnonce";
test.beforeAll(async () => {
  fixture = await createFixture({
    ////////////////////////////////////////////////////////////////////////////
    // 💿 Next, add files to this object, just like files in a real app,
    // `createFixture` will make an app and run your tests against it.
    ////////////////////////////////////////////////////////////////////////////
    files: {
      "app/routes/_index.tsx": js`
        import { useLoaderData } from "@remix-run/react";

        export function loader() {
          const data = "sup";
          return {data};
        }

        export default function Index() {
          let {data} = useLoaderData<typeof loader>();
          return (
            <div>
              {data}
            </div>
          )
        }
      `,
      "app/routes/defer.tsx": js`
        import { defer } from "@remix-run/node";
        import { useLoaderData, Await } from "@remix-run/react";
        import { Suspense } from "react";

        export function loader() {
          const promiseData = new Promise((resolve) => setTimeout(resolve, 100, "sup"));
          return defer({promiseData});
        }

        export default function DeferredPage() {
          let {promiseData} = useLoaderData<typeof loader>();
          return (
            <div>
              <Suspense>
                <Await resolve={promiseData}>{(data) => <div>{data}</div>}</Await>
              </Suspense>
            </div>
          )
        }
      `,
      "app/root.tsx": js`
      import { cssBundleHref } from '@remix-run/css-bundle';
      import type { LinksFunction } from '@remix-run/node';
      import {
        Links,
        LiveReload,
        Meta,
        Outlet,
        Scripts,
        ScrollRestoration,
      } from '@remix-run/react';

      export const links: LinksFunction = () => [
        ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
      ];

      export default function App() {
        return (
          <html lang="en">
            <head>
              <meta charSet="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <Meta />
              <Links />
            </head>
            <body>
              <Outlet />
              <ScrollRestoration nonce="${nonceValue}" />
              <Scripts nonce="${nonceValue}" />
              <LiveReload nonce="${nonceValue}" />
            </body>
          </html>
        );
      }
`,
    },
  });

  // This creates an interactive app using playwright.
  appFixture = await createAppFixture(fixture);
});

test.afterAll(() => {
  appFixture.close();
});

////////////////////////////////////////////////////////////////////////////////
// 💿 Almost done, now write your failing test case(s) down here Make sure to
// add a good description for what you expect Remix to do 👇🏽
////////////////////////////////////////////////////////////////////////////////

test("all script tags on a non-defer page should include the nonce from the <Scripts/> component", async ({
  page,
}) => {
  let app = new PlaywrightFixture(appFixture, page);

  await app.goto("/");
  await page.waitForSelector("text=sup");

  await page.$$("script").then(async (scripts) => {
    expect(scripts.length).toBeGreaterThan(0);
    return Promise.all(
      scripts.map(async (script) => {
        // Every script tag should have a nonce attribute
        // for content security policy to work
        expect(await script.getAttribute("nonce")).toEqual(nonceValue);
      })
    );
  });
});
test("all script tags on a defer page should include the nonce from the <Scripts/> component", async ({
  page,
}) => {
  let app = new PlaywrightFixture(appFixture, page);

  // If you need to test interactivity use the `app`
  await app.goto("/defer");
  await page.waitForSelector("text=sup");
  await page.$$("script").then(async (scripts) => {
    expect(scripts.length).toBeGreaterThan(0);
    return Promise.all(
      scripts.map(async (script) => {
        // Every script tag should have a nonce attribute
        // for content security policy to work
        expect(await script.getAttribute("nonce")).toEqual(nonceValue);
      })
    );
  });

  // If you're not sure what's going on, you can "poke" the app, it'll
  // automatically open up in your browser for 20 seconds, so be quick!
  // await app.poke(20);

  // Go check out the other tests to see what else you can do.
});

////////////////////////////////////////////////////////////////////////////////
// 💿 Finally, push your changes to your fork of Remix and open a pull request!
////////////////////////////////////////////////////////////////////////////////
