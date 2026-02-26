'use client';

import store from '@/store';
import { Provider } from 'react-redux';
import React, { ReactNode, Suspense } from 'react';
import Loading from '@/components/layouts/loading';
import { SessionProvider } from 'next-auth/react';
import App from '../../../App';
import moment from "moment";

interface IProps {
    children?: ReactNode;
}

const ProviderComponent = ({ children }: IProps) => {
    moment.locale('en');
    if (typeof window !== "undefined") {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", function () {
                navigator.serviceWorker.register("/firebase-messaging-sw.js").then(
                    function (registration) {
                        // Registration was successful
                        console.log(
                            "ServiceWorker registration successful with scope: ",
                            registration.scope
                        );
                    },
                    function (err) {
                        // Registration failed :(
                        console.log("ServiceWorker registration failed: ", err);
                    }
                ).catch(function (err) {
                    console.log("ServiceWorker registration failed: ", err);
                });
            });
        }
    }


    if (typeof window !== "undefined") {
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", function () {
                navigator.serviceWorker.register("/firebase-messaging-sw.js").then(
                    function (registration) {
                        // Registration was successful 
                        console.log("ServiceWorker registration successful with scope: ", registration.scope);

                        // messaging = getMessaging(app);
                    },
                    function (err) {
                        // Registration failed :(
                        console.log("ServiceWorker registration failed: ", err);
                    }
                );
            });
        }
    }


    return (
        <SessionProvider >
            <Provider store={store}>
                <Suspense fallback={<Loading />}>
                    <App>{children} </App>
                </Suspense>
            </Provider>
        </SessionProvider>
    );
};

export default ProviderComponent;

