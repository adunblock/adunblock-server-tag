import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    js: [
      "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
      "https://unpkg.com/lodash@4.17.21/lodash.min.js",
      "https://d16sc05it918j8.cloudfront.net",
    ],
  });
}
