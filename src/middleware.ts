
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';
import { hasRoleAndPermissions } from './utils/hasRoleAndPermissions';


export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.SECRET });

    if (!token) {
        return NextResponse.redirect(new URL('/signIn', request.url))
    }
    if ((token?.user as any).RoleType == "SuperAdmin") {
        return NextResponse.redirect(new URL('/dashboard', request.url))
        
    }

    // let hasPage = dataSideBar.navMain.find((item) => item.url === request.nextUrl.pathname) || dataSideBar.dataAdmin.find((item) => item.url === request.nextUrl.pathname) || otherPage.find((item) => item.url === request.nextUrl.pathname);

    // const hasRoleAndPermission = hasRoleAndPermissions({
    //     resource: hasPage?.pageCode as any,
    //     permission: hasPage?.permissions as any,
    //     data: 
    // });

    // if (hasRoleAndPermission) {
    //     return NextResponse.next();
    // } else {
    //     return NextResponse.redirect(new URL('/', request.url))
    // }
}

export const config = {
    matcher: [
        '/',
    ]
}