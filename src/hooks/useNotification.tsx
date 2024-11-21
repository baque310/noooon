import { useEffect, useState } from 'react';
import { MessagePayload, getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/services/firebase';
import { VAPID_KEY } from '@/services/types/config';
import { toast } from 'react-toastify';

const useNotification = () => {
    const [notification, setNotification] = useState<MessagePayload | undefined>()
    useEffect(() => {
        const requestPermissionAndSetupMessaging = async () => {
            try {
                await requestPermission();
                setupMessageListener();
            } catch (error) {
                console.error("Error during permission request and message setup", error);
            }
        };

        requestPermissionAndSetupMessaging();
    }, []);

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                // console.log("Notification permission granted.");
                const clientToken = await getToken(messaging, {
                    vapidKey: VAPID_KEY
                });
                // Your code to handle the clientToken here
            } else {
                console.log("Unable to get permission to notify.");
            }
        } catch (error) {
            console.error("Error getting permission for notifications", error);
        }
    };

    const setupMessageListener = () => {
        onMessage(messaging, (payload) => {
            setNotification(payload);
            toast.info(payload?.notification?.title)
            if (Notification.permission === "granted") {
                new Notification(payload?.notification?.title ?? "", {
                    body: payload?.notification?.body ?? "",
                    icon: payload?.notification?.icon ?? "",
                });
            }
        });
    };
    return notification;
};

export default useNotification
