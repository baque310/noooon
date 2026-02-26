
import NextAuth, { DefaultSession, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers'
import axios from 'axios';
import { Roles } from '@/services/Manager/Admin';


declare module 'next-auth' {
    interface Session {
        user: User;
    }

    export interface User {
        id: string
        username: string,
        photo: null | string
        client_token: string
        isActive: "true" | "false" | "",
        roles: Roles[],
        createdAt: string
        updatedAt: string
        "RoleType": "SuperAdmin" | "Manager" | "Admin"
        "schoolId": string


    }
    interface JWT {
        user: User & DefaultSession['user'];
    }
}
const maxAge = Number(process.env.maxAge) || 60 * 60 * 24;
const handler = NextAuth({
    session: {
        strategy: 'jwt',
        maxAge,
    },
    secret: process.env.SECRET || "secret",
    pages: {
        signIn: '/signIn',
        error: '/not-found',
    },
    debug: true,
    logger: {
        error(code, metadata) {
            console.error(code, metadata);
        },
        debug(code, metadata) {
            console.debug(code, metadata);
        },
        warn(code) {
            console.warn(code);
        },
    },
    callbacks: {
        jwt: async ({ token, user, trigger, session }) => {
            if (user) {
                token.user = user;
            }
            if (trigger === 'update') {
                token.user = session.info;
            }
            return token;
        },

        session: async ({ session, token }) => {
            session.user = token.user as User;
            return { ...session };
        },
    },
    providers: [
        CredentialsProvider({
            credentials: {},
            async authorize(credentials: any): Promise<User | null> {
                try {
                    const { password, username } = credentials;

                    if (!password || !username) {
                        throw new Error('No credentials provided');
                    }
                    const response = await axios.post(
                        `${process.env.BASE_URL}auth/local/signin`,
                        {
                            username: credentials.username,
                            password: credentials.password,
                            client_token: credentials.client_token
                        },
                        {
                            withCredentials: true,
                            headers: {
                                'x-api-key': process.env.X_API_KEY
                            }
                        }
                    );

                    // set cookies
                    if (response.headers['set-cookie']) {
                        const dataCookies = response.headers['set-cookie'];

                        dataCookies.forEach((cookie) => {
                            const [nameValue, ...rest] = cookie.split(';');
                            const [name, value] = nameValue.split('=');
                            cookies().set(name.trim(), value.trim(), {
                                path: '/',
                                // httpOnly: rest.includes(' HttpOnly')
                                // secure: true,
                                // httpOnly: true,
                                // expires: new Date(jwtDecode(value.trim()).exp! * 1000),
                            });
                        });
                    }

                    if (response.status !== 200) {
                        throw new Error('Login Failed');
                    }
                    const data = (await response.data) as User;
                    // const data = (await response.json()) as User;
                    if (!data) {
                        throw new Error('Login Failed');
                    }
                    data.roles = []
                    //  data.roles.map((role) => {
                    //     const rolesString = role.permissions?.map(i => `${i.action}-${i.possession}`)
                    //     return {
                    //         resource: role.resource,
                    //         resource_ar: role.resource_ar,
                    //         icon: role.icon,
                    //         rolesString: rolesString
                    //     }
                    // }
                    // )
                    return data;
                } catch (error: any) {
                    console.log(error?.message);
                    // return null
                    if (error && error.message) {
                        throw new Error(`  ${error.message}`);
                    }
                    else {
                        throw new Error(` ${error}`);
                    }
                }
            },
        }),
    ],
});

export { handler as GET, handler as POST };
