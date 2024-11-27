import * as Yup from 'yup';
import { useState } from 'react'
import { toast } from 'react-toastify';
import { getToken } from 'firebase/messaging';
import { messaging } from '@/services/firebase';
import { VAPID_KEY } from '@/services/types/config';
import { getTranslation } from '../../../../ni18n/i18n';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const useLogic = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const signInSchema = Yup.object().shape({
        username: Yup.string()
            .required(t('common.this-field-is-required')),
        password: Yup.string()
            .required(t('common.this-field-is-required')),
    });
    type SignInSchema = Yup.InferType<typeof signInSchema>;

    const handleSubmit = async (values: SignInSchema) => {
        try {
            setIsLoading(true);
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY
            }).catch((err) => { 
                return "";
            });

            const res = await signIn('credentials', {
                username: values.username,
                password: values.password,
                client_token: currentToken ?? "",
                redirect: false,
                callbackUrl: `${window.location.origin}/`,
            });

            if (res?.ok) { 
                router.replace("/");
            }

            if (res && res.error) {
                toast.error(t("signInPage.please-check-the-information"), { autoClose: 30000 });
            }

            setIsLoading(false);
        } catch (error: any) {
            setIsLoading(false);
            console.error('Failed to operation :', error);
            if (error) {
                return toast.error(JSON.stringify(error), { autoClose: 30000 });
            }
            toast.error(error, { autoClose: 30000 });
        }
    };
    return { handleSubmit, signInSchema, t, isLoading };

}

export default useLogic