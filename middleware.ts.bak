import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  // if not /, throw 404
  if (new URL(request.url).pathname !== "/") {
    // show 404 page
    // get html from 404 page
    // const html = `
    //   <div class="flex flex-col items-center justify-center">
    //     <h2>Not Found</h2>
    //     <p>Could not find requested resource</p>
    //     <a href="/">Return Home</a>
    //   </div>
    // `;
    // const html = await fetch("/").then((res) => res.text());
    // return new Response(html, {
    //   status: 404,
    //   headers: {
    //     "content-type": "text/html",
    //   },
    // });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
