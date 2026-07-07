import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: To truly verify JWT edge-side, we would need to install 'jose'
// For now, this serves as a basic check. Real RBAC happens on the FastAPI backend.

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const path = request.nextUrl.pathname;

    if (!token && (path.startsWith('/admin') || path.startsWith('/staff') || path.startsWith('/dashboard'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/staff/:path*', '/dashboard/:path*'],
};
