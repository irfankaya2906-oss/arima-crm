import { NextResponse } from "next/server"

export default function middleware(req: any) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/companies/:path*",
    "/pipeline/:path*",
    "/meetings/:path*",
    "/tasks/:path*",
  ],
}



